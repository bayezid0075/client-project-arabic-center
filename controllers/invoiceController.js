const Invoice = require('../models/Invoice');
const Student = require('../models/Student');
const Course = require('../models/Course');

function formatMoney(value) {
  return '৳ ' + (Math.round(value * 100) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

async function checkCourseBalance(body, excludeInvoiceId = null) {
  const student = await Student.findById(body.student_id);
  if (!student) return 'Student not found';

  const fee = parseFloat(student.course_fee) || 0;
  if (fee <= 0) return null;

  const invoiced = await Invoice.getInvoicedTotal(body.student_id, excludeInvoiceId);
  const available = Math.max(0, fee - invoiced);
  const { totalAmount } = Invoice.computeTotals(body);

  if (totalAmount - available > 0.009) {
    return `Invoice total ${formatMoney(totalAmount)} exceeds the remaining course price ` +
      `${formatMoney(available)} (course fee ${formatMoney(fee)} − invoiced ${formatMoney(invoiced)})`;
  }

  return null;
}

const invoiceController = {
  async getAll(req, res) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const [invoices, total] = await Promise.all([
        Invoice.findAll(search, limit, offset),
        Invoice.countAll(search)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('admin/invoices/index', {
        title: 'Invoice Management',
        invoices,
        search,
        page,
        totalPages,
        total,
        pageName: 'invoices'
      });
    } catch (error) {
      console.error('Invoices list error:', error);
      req.flash('error', 'Error loading invoices');
      res.redirect('/admin/dashboard');
    }
  },

  async getCreate(req, res) {
    try {
      const [students, courses, invoiceNumber] = await Promise.all([
        Student.findAll('', 500, 0),
        Course.findActive(),
        Invoice.generateInvoiceNumber()
      ]);

      await Invoice.attachBilling(students);

      res.render('admin/invoices/create', {
        title: 'Create New Invoice',
        students,
        courses,
        invoiceNumber,
        pageName: 'invoices'
      });
    } catch (error) {
      console.error('Invoice create form error:', error);
      req.flash('error', 'Error loading form');
      res.redirect('/admin/invoices');
    }
  },

  async postCreate(req, res) {
    try {
      const billingError = await checkCourseBalance(req.body);
      if (billingError) {
        req.flash('error', billingError);
        return res.redirect('/admin/invoices/create');
      }

      await Invoice.create(req.body);
      req.flash('success', 'Invoice created successfully');
      res.redirect('/admin/invoices');
    } catch (error) {
      console.error('Invoice create error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        req.flash('error', 'Invoice number already exists');
      } else {
        req.flash('error', 'Error creating invoice');
      }
      res.redirect('/admin/invoices/create');
    }
  },

  async getDetail(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) {
        req.flash('error', 'Invoice not found');
        return res.redirect('/admin/invoices');
      }

      res.render('admin/invoices/detail', {
        title: `Invoice: ${invoice.invoice_number}`,
        invoice,
        pageName: 'invoices'
      });
    } catch (error) {
      console.error('Invoice detail error:', error);
      req.flash('error', 'Error loading invoice');
      res.redirect('/admin/invoices');
    }
  },

  async getEdit(req, res) {
    try {
      const [invoice, students, courses] = await Promise.all([
        Invoice.findById(req.params.id),
        Student.findAll('', 500, 0),
        Course.findActive()
      ]);

      if (!invoice) {
        req.flash('error', 'Invoice not found');
        return res.redirect('/admin/invoices');
      }

      await Invoice.attachBilling(students, invoice.id);

      res.render('admin/invoices/edit', {
        title: `Edit Invoice: ${invoice.invoice_number}`,
        invoice,
        students,
        courses,
        pageName: 'invoices'
      });
    } catch (error) {
      console.error('Invoice edit form error:', error);
      req.flash('error', 'Error loading invoice');
      res.redirect('/admin/invoices');
    }
  },

  async postUpdate(req, res) {
    try {
      const billingError = await checkCourseBalance(req.body, req.params.id);
      if (billingError) {
        req.flash('error', billingError);
        return res.redirect(`/admin/invoices/${req.params.id}/edit`);
      }

      await Invoice.update(req.params.id, req.body);
      req.flash('success', 'Invoice updated successfully');
      res.redirect(`/admin/invoices/${req.params.id}`);
    } catch (error) {
      console.error('Invoice update error:', error);
      req.flash('error', 'Error updating invoice');
      res.redirect(`/admin/invoices/${req.params.id}/edit`);
    }
  },

  async postDelete(req, res) {
    try {
      await Invoice.delete(req.params.id);
      req.flash('success', 'Invoice deleted successfully');
      res.redirect('/admin/invoices');
    } catch (error) {
      console.error('Invoice delete error:', error);
      req.flash('error', 'Error deleting invoice');
      res.redirect('/admin/invoices');
    }
  },

  async getPrint(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) {
        req.flash('error', 'Invoice not found');
        return res.redirect('/admin/invoices');
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      res.render('admin/invoices/print', {
        invoice,
        baseUrl,
        layout: false
      });
    } catch (error) {
      console.error('Invoice print error:', error);
      req.flash('error', 'Error loading invoice');
      res.redirect('/admin/invoices');
    }
  }
};

module.exports = invoiceController;
