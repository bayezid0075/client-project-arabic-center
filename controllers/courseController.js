const Course = require('../models/Course');
const Batch = require('../models/Batch');

const courseController = {
  async getAll(req, res) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const [courses, total] = await Promise.all([
        Course.findAll(search, limit, offset),
        Course.countAll(search)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.render('admin/courses/index', {
        title: 'Course Management',
        courses,
        search,
        page,
        totalPages,
        total,
        pageName: 'courses'
      });
    } catch (error) {
      console.error('Courses list error:', error);
      req.flash('error', 'Error loading courses');
      res.redirect('/admin/dashboard');
    }
  },

  async getCreate(req, res) {
    try {
      res.render('admin/courses/create', {
        title: 'Add New Course',
        pageName: 'courses'
      });
    } catch (error) {
      console.error('Course create form error:', error);
      req.flash('error', 'Error loading form');
      res.redirect('/admin/courses');
    }
  },

  async postCreate(req, res) {
    try {
      const courseId = await Course.create(req.body);

      if (req.body.batch_name && req.body.batch_name.trim()) {
        await Batch.create({
          name: req.body.batch_name.trim(),
          course_id: courseId,
          start_date: req.body.start_date || null,
          end_date: req.body.end_date || null,
          max_students: req.body.max_students || 30
        });
      }

      req.flash('success', 'Course and batch created successfully');
      res.redirect(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error('Course create error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        req.flash('error', 'A course with this code already exists');
      } else {
        req.flash('error', 'Error creating course');
      }
      res.redirect('/admin/courses/create');
    }
  },

  async getDetail(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        req.flash('error', 'Course not found');
        return res.redirect('/admin/courses');
      }

      const batches = await Batch.findByCourseId(req.params.id);

      res.render('admin/courses/detail', {
        title: `Course: ${course.name}`,
        course,
        batches,
        pageName: 'courses'
      });
    } catch (error) {
      console.error('Course detail error:', error);
      req.flash('error', 'Error loading course details');
      res.redirect('/admin/courses');
    }
  },

  async getEdit(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        req.flash('error', 'Course not found');
        return res.redirect('/admin/courses');
      }

      const batches = await Batch.findByCourseId(req.params.id);
      const batch = batches.length > 0 ? batches[0] : null;

      res.render('admin/courses/edit', {
        title: `Edit Course: ${course.name}`,
        course,
        batch,
        pageName: 'courses'
      });
    } catch (error) {
      console.error('Course edit form error:', error);
      req.flash('error', 'Error loading course');
      res.redirect('/admin/courses');
    }
  },

  async postUpdate(req, res) {
    try {
      await Course.update(req.params.id, req.body);

      const batches = await Batch.findByCourseId(req.params.id);
      const existingBatch = batches.length > 0 ? batches[0] : null;

      if (req.body.batch_name && req.body.batch_name.trim()) {
        const batchData = {
          name: req.body.batch_name.trim(),
          course_id: req.params.id,
          start_date: req.body.start_date || null,
          end_date: req.body.end_date || null,
          max_students: req.body.max_students || 30,
          is_active: 1
        };

        if (existingBatch) {
          await Batch.update(existingBatch.id, batchData);
        } else {
          await Batch.create(batchData);
        }
      }

      req.flash('success', 'Course updated successfully');
      res.redirect(`/admin/courses/${req.params.id}`);
    } catch (error) {
      console.error('Course update error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        req.flash('error', 'A course with this code already exists');
      } else {
        req.flash('error', 'Error updating course');
      }
      res.redirect(`/admin/courses/${req.params.id}/edit`);
    }
  },

  async postDelete(req, res) {
    try {
      await Course.delete(req.params.id);
      req.flash('success', 'Course deleted successfully');
      res.redirect('/admin/courses');
    } catch (error) {
      console.error('Course delete error:', error);
      req.flash('error', 'Error deleting course');
      res.redirect('/admin/courses');
    }
  }
};

module.exports = courseController;
