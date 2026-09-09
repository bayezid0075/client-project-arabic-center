const Student = require('../models/Student');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const Certificate = require('../models/Certificate');
const Invoice = require('../models/Invoice');
const StudentIssue = require('../models/StudentIssue');

const studentController = {
  async getAll(req, res) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const [students, total] = await Promise.all([
        Student.findAll(search, limit, offset),
        Student.countAll(search)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('admin/students/index', {
        title: 'Student Management',
        students,
        search,
        page,
        totalPages,
        total,
        pageName: 'students'
      });
    } catch (error) {
      console.error('Students list error:', error);
      req.flash('error', 'Error loading students');
      res.redirect('/admin/dashboard');
    }
  },

  async getCreate(req, res) {
    try {
      const [courses, batches, nextId] = await Promise.all([
        Course.findActive(),
        Batch.findActive(),
        Student.getNextStudentId()
      ]);

      res.render('admin/students/create', {
        title: 'Add New Student',
        courses,
        batches,
        nextId,
        pageName: 'students'
      });
    } catch (error) {
      console.error('Student create form error:', error);
      req.flash('error', 'Error loading form');
      res.redirect('/admin/students');
    }
  },

  async postCreate(req, res) {
    try {
      await Student.create(req.body);
      req.flash('success', 'Student created successfully');
      res.redirect('/admin/students');
    } catch (error) {
      console.error('Student create error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        req.flash('error', 'A student with this ID already exists');
      } else {
        req.flash('error', 'Error creating student');
      }
      res.redirect('/admin/students/create');
    }
  },

  async getDetail(req, res) {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        req.flash('error', 'Student not found');
        return res.redirect('/admin/students');
      }

      const [certificates, invoices, issues] = await Promise.all([
        Certificate.findAll(``, 50, 0),
        Invoice.findAll(``, 50, 0),
        StudentIssue.findAll(``, 50, 0)
      ]);

      const studentCerts = certificates.filter(c => c.student_id == req.params.id);
      const studentInvoices = invoices.filter(i => i.student_id == req.params.id);
      const studentIssues = issues.filter(i => i.student_id == req.params.id);

      res.render('admin/students/detail', {
        title: `Student: ${student.full_name}`,
        student,
        certificates: studentCerts,
        invoices: studentInvoices,
        issues: studentIssues,
        pageName: 'students'
      });
    } catch (error) {
      console.error('Student detail error:', error);
      req.flash('error', 'Error loading student details');
      res.redirect('/admin/students');
    }
  },

  async getEdit(req, res) {
    try {
      const [student, courses, batches] = await Promise.all([
        Student.findById(req.params.id),
        Course.findActive(),
        Batch.findActive()
      ]);

      if (!student) {
        req.flash('error', 'Student not found');
        return res.redirect('/admin/students');
      }

      res.render('admin/students/edit', {
        title: `Edit Student: ${student.full_name}`,
        student,
        courses,
        batches,
        pageName: 'students'
      });
    } catch (error) {
      console.error('Student edit form error:', error);
      req.flash('error', 'Error loading student');
      res.redirect('/admin/students');
    }
  },

  async postUpdate(req, res) {
    try {
      await Student.update(req.params.id, req.body);
      req.flash('success', 'Student updated successfully');
      res.redirect(`/admin/students/${req.params.id}`);
    } catch (error) {
      console.error('Student update error:', error);
      req.flash('error', 'Error updating student');
      res.redirect(`/admin/students/${req.params.id}/edit`);
    }
  },

  async postDelete(req, res) {
    try {
      await Student.delete(req.params.id);
      req.flash('success', 'Student deleted successfully');
      res.redirect('/admin/students');
    } catch (error) {
      console.error('Student delete error:', error);
      req.flash('error', 'Error deleting student');
      res.redirect('/admin/students');
    }
  }
};

module.exports = studentController;
