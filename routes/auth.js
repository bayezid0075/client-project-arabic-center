const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');

router.get('/login', requireGuest, authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.logout);

module.exports = router;
