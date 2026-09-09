function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please log in to access the admin panel');
  res.redirect('/admin/login');
}

function requireGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/admin/dashboard');
  }
  next();
}

module.exports = { requireAuth, requireGuest };
