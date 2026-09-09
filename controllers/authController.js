const bcrypt = require('bcryptjs');
const User = require('../models/User');

const authController = {
  async getLogin(req, res) {
    res.render('admin/login', { title: 'Admin Login', layout: false });
  },

  async postLogin(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        req.flash('error', 'Please enter username and password');
        return res.redirect('/admin/login');
      }

      const user = await User.findByUsername(username);
      if (!user) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/admin/login');
      }

      if (!user.is_active) {
        req.flash('error', 'Account is disabled');
        return res.redirect('/admin/login');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/admin/login');
      }

      await User.updateLastLogin(user.id);

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.fullName = user.full_name;
      req.session.role = user.role;

      req.flash('success', `Welcome back, ${user.full_name}!`);
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'An error occurred during login');
      res.redirect('/admin/login');
    }
  },

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
      res.redirect('/admin/login');
    });
  }
};

module.exports = authController;
