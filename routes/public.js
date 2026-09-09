const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getHome);
router.get('/about', publicController.getAbout);
router.get('/courses', publicController.getCourses);
router.get('/contact', publicController.getContact);
router.post('/contact', publicController.postContact);
router.get('/verify', publicController.getVerify);
router.post('/verify', publicController.postVerify);

module.exports = router;
