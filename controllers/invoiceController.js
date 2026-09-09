const Invoice = require('../models/Invoice');
const Student = require('../models/Student');
const Course = require('../models/Course');

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

      res.render('admin/invoices/print', {
        invoice,
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
