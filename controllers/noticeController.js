const Notice = require('../models/Notice');

const noticeController = {
  async getAll(req, res) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const [notices, total] = await Promise.all([
        Notice.findAll(search, limit, offset),
        Notice.countAll(search)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('admin/notices/index', {
        title: 'Notice Management',
        notices,
        search,
        page,
        totalPages,
        total,
        pageName: 'notices'
      });
    } catch (error) {
      console.error('Notices list error:', error);
      req.flash('error', 'Error loading notices');
      res.redirect('/admin/dashboard');
    }
  },

  async getCreate(req, res) {
    res.render('admin/notices/create', {
      title: 'Create New Notice',
      pageName: 'notices'
    });
  },

  async postCreate(req, res) {
    try {
      await Notice.create(req.body);
      req.flash('success', 'Notice created successfully');
      res.redirect('/admin/notices');
    } catch (error) {
      console.error('Notice create error:', error);
      req.flash('error', 'Error creating notice');
      res.redirect('/admin/notices/create');
    }
  },

  async getDetail(req, res) {
    try {
      const notice = await Notice.findById(req.params.id);
      if (!notice) {
        req.flash('error', 'Notice not found');
        return res.redirect('/admin/notices');
      }

      res.render('admin/notices/detail', {
        title: `Notice: ${notice.title}`,
        notice,
        pageName: 'notices'
      });
    } catch (error) {
      console.error('Notice detail error:', error);
      req.flash('error', 'Error loading notice');
      res.redirect('/admin/notices');
    }
  },

  async getEdit(req, res) {
    try {
      const notice = await Notice.findById(req.params.id);
      if (!notice) {
        req.flash('error', 'Notice not found');
        return res.redirect('/admin/notices');
      }

      res.render('admin/notices/edit', {
        title: `Edit Notice: ${notice.title}`,
        notice,
        pageName: 'notices'
      });
    } catch (error) {
      console.error('Notice edit form error:', error);
      req.flash('error', 'Error loading notice');
      res.redirect('/admin/notices');
    }
  },

  async postUpdate(req, res) {
    try {
      await Notice.update(req.params.id, req.body);
      req.flash('success', 'Notice updated successfully');
      res.redirect(`/admin/notices/${req.params.id}`);
    } catch (error) {
      console.error('Notice update error:', error);
      req.flash('error', 'Error updating notice');
      res.redirect(`/admin/notices/${req.params.id}/edit`);
    }
  },

  async postDelete(req, res) {
    try {
      await Notice.delete(req.params.id);
      req.flash('success', 'Notice deleted successfully');
      res.redirect('/admin/notices');
    } catch (error) {
      console.error('Notice delete error:', error);
      req.flash('error', 'Error deleting notice');
      res.redirect('/admin/notices');
    }
  }
};

module.exports = noticeController;
