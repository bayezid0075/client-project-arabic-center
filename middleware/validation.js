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

function validateIssue(req, res, next) {
  const errors = [];
  const { subject, student_id } = req.body;

  if (!student_id) {
    errors.push('Student is required');
  }

  if (!subject || subject.trim().length < 3) {
    errors.push('Subject is required (min 3 characters)');
  }

  if (errors.length > 0) {
    errors.forEach(err => req.flash('error', err));
    return res.redirect('back');
  }
  next();
}

module.exports = { validateStudent, validateInvoice, validateCertificate, validateIssue };
