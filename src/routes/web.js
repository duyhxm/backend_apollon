const express = require('express');
const router = express.Router();
const multer = require('multer');
const moment = require('moment');
const { getHomePage, createUsers, mailer, getPdfFile } = require('../controllers/homeController');
// const upload = multer({ dest: 'uploads/' });
const storage = multer.diskStorage({
    destination: '/tmp', // Thay đổi đường dẫn đến thư mục tạm thời
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.get('/duyhxm', (req, res) => {
    res.render('sample.ejs');
});
router.get('', getHomePage );
router.get('/api/data', (req, res) => {
    const data = { message: 'Hello from the server!' };
    res.json(data);
});
router.post('/user', createUsers);

router.post('/send/email', mailer);
router.post('/send/empty-email', mailer);

router.get('/api/send-mail', (req, res) => {
    const data = {message: 'abff934b1401422483bbe486f07aca2f'};
    res.json(data);
});

router.post('/pdf-file', upload.single('fileInput'), getPdfFile);

router.get('/servertime', (req, res) => {
    const serverTime = new Date();
    const convertedTime = moment(serverTime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
  
    res.json({ serverTime, convertedTime });
  });
  

module.exports = router;