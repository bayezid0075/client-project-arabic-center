const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const ContactMessage = require('../models/ContactMessage');

const publicController = {
  async getHome(req, res) {
    try {
      const courses = await Course.findActive();
      res.render('public/home', {
        title: 'Professional Training Center - Build Skills, Build Your Future',
        courses,
        page: 'home'
      });
    } catch (error) {
      console.error('Home page error:', error);
      res.render('public/home', {
        title: 'Professional Training Center',
        courses: [],
        page: 'home'
      });
    }
  },

  getAbout(req, res) {
    res.render('public/about', {
      title: 'About Us - Professional Training Center',
      page: 'about'
    });
  },

  getContact(req, res) {
    res.render('public/contact', {
      title: 'Contact Us - Professional Training Center',
      page: 'contact'
    });
  },

  async postContact(req, res) {
    try {
      const { full_name, email, phone, subject, message } = req.body;

      if (!full_name || !email || !subject || !message) {
        req.flash('error', 'Please fill in all required fields');
        return res.redirect('/contact');
      }

      await ContactMessage.create({ full_name, email, phone, subject, message });
      req.flash('success', 'Your message has been sent successfully. We will get back to you soon!');
      res.redirect('/contact');
    } catch (error) {
      console.error('Contact form error:', error);
      req.flash('error', 'An error occurred. Please try again later.');
      res.redirect('/contact');
    }
  },

  getVerify(req, res) {
    res.render('public/verify', {
      title: 'Verify Certificate - Professional Training Center',
      page: 'verify',
      certificate: null,
      searched: false
    });
  },

  async postVerify(req, res) {
    try {
      const { cert_number } = req.body;

      if (!cert_number || cert_number.trim().length < 3) {
        req.flash('error', 'Please enter a valid certificate number or verification code');
        return res.redirect('/verify');
      }

      const certificate = await Certificate.verify(cert_number.trim());

      res.render('public/verify', {
        title: 'Verify Certificate - Professional Training Center',
        page: 'verify',
        certificate,
        searched: true
      });
    } catch (error) {
      console.error('Certificate verification error:', error);
      req.flash('error', 'An error occurred during verification');
      res.redirect('/verify');
    }
  },

  getCourses(req, res) {
    res.render('public/courses', {
      title: 'Our Courses - Professional Training Center',
      page: 'courses'
    });
  }
};

module.exports = publicController;
