require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const methodOverride = require('method-override');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { testConnection } = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/verify', limiter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/public');

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.userId = req.session.userId;
  res.locals.username = req.session.username;
  res.locals.fullName = req.session.fullName;
  res.locals.userRole = req.session.role;

  if (req.path.startsWith('/admin')) {
    res.locals.layout = 'layouts/admin';
  } else {
    res.locals.layout = 'layouts/public';
  }

  next();
});

const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const certificateRoutes = require('./routes/certificates');
const invoiceRoutes = require('./routes/invoices');
const issueRoutes = require('./routes/issues');
const dashboardController = require('./controllers/dashboardController');
const { requireAuth } = require('./middleware/auth');

app.use('/', publicRoutes);
app.use('/admin', authRoutes);

app.get('/admin', requireAuth, (req, res) => res.redirect('/admin/dashboard'));
app.get('/admin/dashboard', requireAuth, dashboardController.getDashboard);

app.use('/admin/students', requireAuth, studentRoutes);
app.use('/admin/certificates', requireAuth, certificateRoutes);
app.use('/admin/invoices', requireAuth, invoiceRoutes);
app.use('/admin/issues', requireAuth, issueRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('[APP] Failed to connect to database. Please check your database configuration.');
    console.error('[APP] Make sure MySQL is running and .env is configured correctly.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[APP] Training Center Management System`);
    console.log(`[APP] Server running on http://localhost:${PORT}`);
    console.log(`[APP] Admin panel: http://localhost:${PORT}/admin/login`);
    console.log(`[APP] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();

module.exports = app;
