function notFound(req, res, next) {
  const error = new Error('Page Not Found');
  error.status = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  console.error(`[ERROR] ${status}: ${err.message}`);

  if (req.path.startsWith('/admin')) {
    return res.status(status).render('errors/admin-error', {
      title: status === 404 ? 'Page Not Found' : 'Server Error',
      status,
      message,
      layout: 'layouts/admin'
    });
  }

  res.status(status).render('errors/error', {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    status,
    message
  });
}

module.exports = { notFound, errorHandler };
