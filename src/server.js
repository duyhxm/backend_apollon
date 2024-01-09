require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8000;
const hostName = process.env.HOST_NAME;
const configViewEngine = require('./config/viewEngine');
const webRoutes = require('./routes/web');
const connection = require('./config/database');
const cron = require('node-cron');
const corsOptions = {
  origin: 'https://www.duyhxm.me', // Hoặc ['http://example.com', 'http://another-domain.com']
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Cho phép sử dụng cookie và các tiêu đề khác với yêu cầu CORS
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
configViewEngine(app);
app.use('/', webRoutes);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.duyhxm.me');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

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
    console.log(currentDate);

    const [results, fields] = await connection.query('SELECT * FROM data'); 
    console.log(results);
    console.log(results[0].scheduled_date);
    results.forEach((result) => {
      const emailDate = new Date(result.scheduled_date);

      if (currentDate.toDateString() === emailDate.toDateString() && result.email != '') {
        scheduleEmail(result.name, result.email, result.subject, result.text, emailDate);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
cron.schedule('* * * * *', checkAndSendEmails);

app.listen(port, hostName, () => {
  console.log(`Example app listening on port ${port}`)
});