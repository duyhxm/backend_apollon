const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getHomePage, createUsers, mailer, getPdfFile } = require('../controllers/homeController');
const upload = multer({ dest: 'uploads/' });

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

module.exports = router;