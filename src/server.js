require('dotenv').config();
const express = require('express');
const cors = require('cors');
const moment = require('moment-timezone');
const port = process.env.PORT || 8000;
const hostName = process.env.HOST_NAME;
const configViewEngine = require('./config/viewEngine');
const webRoutes = require('./routes/web');
const connection = require('./config/database');
const cron = require('node-cron');
const app = express();
const corsOptions = require('./config/cors');
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded());
configViewEngine(app);
app.use('/', webRoutes);





const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const myOAuth2Client = new OAuth2Client(
  process.env.GOOGLE_MAILER_CLIENT_ID,
  process.env.GOOGLE_MAILER_CLIENT_SECRET
);

// Set Refresh Token vào OAuth2Client Credentials
myOAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.ADMIN_EMAIL_ADDRESS,
    clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
    clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
    accessToken: myOAuth2Client.getAccessToken(),
  },
});

function scheduleEmail(name, email, subject, text, date) {
  const job = schedule.scheduleJob(date, async function () {
    const mailOptions = {
      to: email,
      subject: subject,
      html: `${text}<br><br>${name}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + mailOptions.subject);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });
}
async function checkAndSendEmails() {
  try {
      const currentDate = new Date();
      console.log('current date is: ', currentDate);
    //   const options = {
    //     timeZone: 'Asia/Ho_Chi_Minh',
    //     hour12: false,
    //   };
      
    //   const localDateTimeString = currentDate.toLocaleString('en-US', options);
    //   const last = moment(localDateTimeString, 'MM/DD/YYYY, HH:mm').format('YYYY-MM-DD HH:mm');
    //   console.log(typeof last);
    //   console.log(last);
    //   const [results, fields] = await connection.query('SELECT * FROM userData'); 
    //   results.forEach((result) => {
    //     const inputTime = result.scheduled_date;
    //     const outputTimeZone = 'Asia/Ho_Chi_Minh';
    //     const convertedTime = moment.tz(inputTime, outputTimeZone).subtract(7, 'hours').format('YYYY-MM-DD HH:mm');
    //     const z = inputTime.toLocaleString('en-US', options);
    //     const t = moment(z, 'MM/DD/YYYY, HH:mm').format('YYYY-MM-DD HH:mm');
    //     console.log(t);
    //     console.log(typeof t);
    //     if (last === t && result.email != '') {
    //       console.log('check is right');
    //       const k = new Date(last);
    //       scheduleEmail(result.name, result.email, result.subject, result.text, k);
    //     }
    // });

    const [results, fields] = await connection.query('SELECT * FROM userData');
    results.forEach((result) => {
      const emailDate = new Date(result.scheduled_date);
      console.log(result.id, emailDate);
      if(currentDate.toDateString() === emailDate.toDateString() && result.email != ''){
        scheduleEmail(result.name, result.email, result.subject, result.text, emailDate);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
// cron.schedule('* * * * *', checkAndSendEmails);

cron.schedule('* * * * *', checkTime);
function checkTime(){
  let a = new Date();
  console.log(a);
}

app.listen(port, hostName, () => {
  console.log(`Example app listening on port ${port}`)
});