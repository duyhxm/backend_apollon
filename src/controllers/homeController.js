const connection = require('../config/database');
const moment = require('moment');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const myOAuth2Client = new OAuth2Client(
    process.env.GOOGLE_MAILER_CLIENT_ID,
    process.env.GOOGLE_MAILER_CLIENT_SECRET
);
const multer = require('multer');
const fs = require('fs');
const PDFParser = require('pdf-parse');

const getHomePage = async (req, res) =>{
    res.send('hello');
}
const createUsers = async (req, res) =>{
    const {name, email, date, text} = req.body;
    const convertedDate = moment(date, 'MM/DD/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
    console.log('check date: ',convertedDate);
    console.log('check name: ', name);
    console.log('check body: ', req.body);
    let [results, fields] = await connection.query(
    ` INSERT INTO userData (name, email, subject, text, scheduled_date) VALUES (?, ?, ?, ?, ?) `, [name, email, 'A LETTER FROM APOLLON', text, convertedDate]);
    res.json({message: 'Data received successfully.'});
}
myOAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN
  });
const mailer = async (req, res) => {
    const { name, email, date, text } = req.body;
    const convertedDate = moment(date, 'MM/DD/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
    console.log(convertedDate);
    const myAccessTokenObject = await myOAuth2Client.getAccessToken();
    const myAccessToken = myAccessTokenObject?.token;
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.ADMIN_EMAIL_ADDRESS,
            clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
            clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
            refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
            accessToken: myAccessToken
        }
    });
    const mailOptions = {
        to: email, 
        subject: 'A LETTER FROM APOLLON', 
        html: `${text}<br><br>${name}`
    };
    await transport.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully.' });
}
const getPdfFile = async (req, res) => {
    try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded.' });
        }
        const filePath = req.file.path;

        const dataBuffer = fs.readFileSync(filePath);
        const data = await PDFParser(dataBuffer);

        const pdfContent = data.text;
        console.log(pdfContent);
    
        const result = { message: `${pdfContent}` };
    
        res.status(200).json(result);
      } catch (error) {
        console.error('Error in getPdfFile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }

}
module.exports = {
    getHomePage,
    createUsers,
    mailer,
    getPdfFile,
}