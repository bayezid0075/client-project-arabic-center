const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Batch = require('../models/Batch');

const certificateController = {
  async getAll(req, res) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const [certificates, total] = await Promise.all([
        Certificate.findAll(search, limit, offset),
        Certificate.countAll(search)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('admin/certificates/index', {
        title: 'Certificate Management',
        certificates,
        search,
        page,
        totalPages,
        total,
        pageName: 'certificates'
      });
    } catch (error) {
      console.error('Certificates list error:', error);
      req.flash('error', 'Error loading certificates');
      res.redirect('/admin/dashboard');
    }
  },

  async getCreate(req, res) {
    try {
      const [students, courses, batches] = await Promise.all([
        Student.findAll('', 500, 0),
        Course.findActive(),
        Batch.findActive()
      ]);

      res.render('admin/certificates/create', {
        title: 'Issue New Certificate',
        students,
        courses,
        batches,
        pageName: 'certificates'
      });
    } catch (error) {
      console.error('Certificate create form error:', error);
      req.flash('error', 'Error loading form');
      res.redirect('/admin/certificates');
    }
  },

  async postCreate(req, res) {
    try {
      await Certificate.create(req.body);
      req.flash('success', 'Certificate issued successfully');
      res.redirect('/admin/certificates');
    } catch (error) {
      console.error('Certificate create error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        req.flash('error', 'Certificate number already exists');
      } else {
        req.flash('error', 'Error issuing certificate');
      }
      res.redirect('/admin/certificates/create');
    }
  },

  async getDetail(req, res) {
    try {
      const certificate = await Certificate.findById(req.params.id);
      if (!certificate) {
        req.flash('error', 'Certificate not found');
        return res.redirect('/admin/certificates');
      }

      res.render('admin/certificates/detail', {
        title: `Certificate: ${certificate.certificate_number}`,
        certificate,
        pageName: 'certificates'
      });
    } catch (error) {
      console.error('Certificate detail error:', error);
      req.flash('error', 'Error loading certificate');
      res.redirect('/admin/certificates');
    }
  },

  async getEdit(req, res) {
    try {
      const [certificate, students, courses, batches] = await Promise.all([
        Certificate.findById(req.params.id),
        Student.findAll('', 500, 0),
        Course.findActive(),
        Batch.findActive()
      ]);

      if (!certificate) {
        req.flash('error', 'Certificate not found');
        return res.redirect('/admin/certificates');
      }

      res.render('admin/certificates/edit', {
        title: `Edit Certificate: ${certificate.certificate_number}`,
        certificate,
        students,
        courses,
        batches,
        pageName: 'certificates'
      });
    } catch (error) {
      console.error('Certificate edit form error:', error);
      req.flash('error', 'Error loading certificate');
      res.redirect('/admin/certificates');
    }
  },

  async postUpdate(req, res) {
    try {
      await Certificate.update(req.params.id, req.body);
      req.flash('success', 'Certificate updated successfully');
      res.redirect(`/admin/certificates/${req.params.id}`);
    } catch (error) {
      console.error('Certificate update error:', error);
      req.flash('error', 'Error updating certificate');
      res.redirect(`/admin/certificates/${req.params.id}/edit`);
    }
  },

  async postDelete(req, res) {
    try {
      await Certificate.delete(req.params.id);
      req.flash('success', 'Certificate deleted successfully');
      res.redirect('/admin/certificates');
    } catch (error) {
      console.error('Certificate delete error:', error);
      req.flash('error', 'Error deleting certificate');
      res.redirect('/admin/certificates');
    }
  },

  async getPrint(req, res) {
    try {
      const certificate = await Certificate.findById(req.params.id);
      if (!certificate) {
        req.flash('error', 'Certificate not found');
        return res.redirect('/admin/certificates');
      }

      res.render('admin/certificates/print', {
        certificate,
        layout: false
      });
    } catch (error) {
      console.error('Certificate print error:', error);
      req.flash('error', 'Error loading certificate');
      res.redirect('/admin/certificates');
    }
  }
};

module.exports = certificateController;
