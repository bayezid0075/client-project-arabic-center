const StudentIssue = require('../models/StudentIssue');
const Student = require('../models/Student');

const issueController = {
  async getAll(req, res) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const [issues, total] = await Promise.all([
        StudentIssue.findAll(search, limit, offset),
        StudentIssue.countAll(search)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('admin/issues/index', {
        title: 'Student Issues',
        issues,
        search,
        page,
        totalPages,
        total,
        pageName: 'issues'
      });
    } catch (error) {
      console.error('Issues list error:', error);
      req.flash('error', 'Error loading issues');
      res.redirect('/admin/dashboard');
    }
  },

  async getCreate(req, res) {
    try {
      const students = await Student.findAll('', 500, 0);
      const nextId = await StudentIssue.generateIssueId();

      res.render('admin/issues/create', {
        title: 'Create New Issue',
        students,
        nextId,
        pageName: 'issues'
      });
    } catch (error) {
      console.error('Issue create form error:', error);
      req.flash('error', 'Error loading form');
      res.redirect('/admin/issues');
    }
  },

  async postCreate(req, res) {
    try {
      await StudentIssue.create(req.body);
      req.flash('success', 'Issue created successfully');
      res.redirect('/admin/issues');
    } catch (error) {
      console.error('Issue create error:', error);
      req.flash('error', 'Error creating issue');
      res.redirect('/admin/issues/create');
    }
  },

  async getDetail(req, res) {
    try {
      const issue = await StudentIssue.findById(req.params.id);
      if (!issue) {
        req.flash('error', 'Issue not found');
        return res.redirect('/admin/issues');
      }

      res.render('admin/issues/detail', {
        title: `Issue: ${issue.issue_id}`,
        issue,
        pageName: 'issues'
      });
    } catch (error) {
      console.error('Issue detail error:', error);
      req.flash('error', 'Error loading issue');
      res.redirect('/admin/issues');
    }
  },

  async getEdit(req, res) {
    try {
      const [issue, students] = await Promise.all([
        StudentIssue.findById(req.params.id),
        Student.findAll('', 500, 0)
      ]);

      if (!issue) {
        req.flash('error', 'Issue not found');
        return res.redirect('/admin/issues');
      }

      res.render('admin/issues/edit', {
        title: `Edit Issue: ${issue.issue_id}`,
        issue,
        students,
        pageName: 'issues'
      });
    } catch (error) {
      console.error('Issue edit form error:', error);
      req.flash('error', 'Error loading issue');
      res.redirect('/admin/issues');
    }
  },

  async postUpdate(req, res) {
    try {
      await StudentIssue.update(req.params.id, req.body);
      req.flash('success', 'Issue updated successfully');
      res.redirect(`/admin/issues/${req.params.id}`);
    } catch (error) {
      console.error('Issue update error:', error);
      req.flash('error', 'Error updating issue');
      res.redirect(`/admin/issues/${req.params.id}/edit`);
    }
  },

  async postDelete(req, res) {
    try {
      await StudentIssue.delete(req.params.id);
      req.flash('success', 'Issue deleted successfully');
      res.redirect('/admin/issues');
    } catch (error) {
      console.error('Issue delete error:', error);
      req.flash('error', 'Error deleting issue');
      res.redirect('/admin/issues');
    }
  }
};

module.exports = issueController;
