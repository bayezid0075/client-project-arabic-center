function validateStudent(req, res, next) {
  const errors = [];
  const { full_name, phone } = req.body;

  if (!full_name || full_name.trim().length < 2) {
    errors.push('Full name is required (min 2 characters)');
  }

  if (phone && !/^[+]?[\d\s-]{7,20}$/.test(phone)) {
    errors.push('Invalid phone number format');
  }

  if (req.body.email && req.body.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      errors.push('Invalid email format');
    }
  }

  if (errors.length > 0) {
    errors.forEach(err => req.flash('error', err));
    return res.redirect('back');
  }
  next();
}

function validateInvoice(req, res, next) {
  const errors = [];
  const { amount, student_id } = req.body;

  if (!student_id) {
    errors.push('Student is required');
  }

  if (!amount || parseFloat(amount) <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (errors.length > 0) {
    errors.forEach(err => req.flash('error', err));
    return res.redirect('back');
  }
  next();
}

function validateCertificate(req, res, next) {
  const errors = [];
  const { student_id } = req.body;

  if (!student_id) {
    errors.push('Student is required');
  }

  if (errors.length > 0) {
    errors.forEach(err => req.flash('error', err));
    return res.redirect('back');
  }
  next();
}

function validateCourse(req, res, next) {
  const errors = [];
  const { name, code, batches } = req.body;

  if (!name || name.trim().length < 2) {
    errors.push('Course name is required (min 2 characters)');
  }

  if (!code || code.trim().length < 2) {
    errors.push('Course code is required (min 2 characters)');
  }

  if (batches && typeof batches === 'object') {
    const batchKeys = Object.keys(batches);
    for (const key of batchKeys) {
      const b = batches[key];
      if (b.name && b.name.trim().length < 2) {
        errors.push('Batch name is required (min 2 characters)');
      }
    }
  }

  if (req.body.fee && parseFloat(req.body.fee) < 0) {
    errors.push('Fee cannot be negative');
  }

  if (req.body.max_students && (parseInt(req.body.max_students) < 1 || parseInt(req.body.max_students) > 1000)) {
    errors.push('Max students must be between 1 and 1000');
  }

  if (errors.length > 0) {
    errors.forEach(err => req.flash('error', err));
    return res.redirect('back');
  }
  next();
}

function validateEvent(req, res, next) {
  const errors = [];
  const { title, event_date } = req.body;

  if (!title || title.trim().length < 2) {
    errors.push('Event title is required (min 2 characters)');
  }

  if (!event_date) {
    errors.push('Event date is required');
  }

  if (req.body.end_date && event_date && new Date(req.body.end_date) < new Date(event_date)) {
    errors.push('End date cannot be before the start date');
  }

  if (errors.length > 0) {
    errors.forEach(err => req.flash('error', err));
    return res.redirect('back');
  }
  next();
}

module.exports = { validateStudent, validateInvoice, validateCertificate, validateCourse, validateEvent };
