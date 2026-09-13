const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const Notice = require('../models/Notice');

router.get('/', publicController.getHome);
router.get('/about', publicController.getAbout);
router.get('/courses', publicController.getCourses);
router.get('/contact', publicController.getContact);
router.post('/contact', publicController.postContact);
router.get('/verify', publicController.getVerify);
router.get('/verify/:code', publicController.getVerifyByCode);
router.post('/verify', publicController.postVerify);

router.get('/notice/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      req.flash('error', 'Notice not found');
      return res.redirect('/');
    }
    res.render('public/notice', {
      title: `${notice.title} - Arabic Technical Training Center`,
      notice,
      page: 'notice'
    });
  } catch (error) {
    console.error('Notice detail error:', error);
    req.flash('error', 'Error loading notice');
    res.redirect('/');
  }
});

module.exports = router;
