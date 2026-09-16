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

      const batches = req.body.batches;
      if (batches && typeof batches === 'object') {
        const batchKeys = Object.keys(batches);
        for (const key of batchKeys) {
          const b = batches[key];
          if (b.name && b.name.trim()) {
            try {
              await Batch.create({
                name: b.name.trim(),
                course_id: courseId,
                start_date: b.start_date || null,
                end_date: b.end_date || null,
                max_students: b.max_students || 30
              });
            } catch (batchError) {
              console.error('Batch create error:', batchError);
              req.flash('error', `Error creating batch "${b.name}": ${batchError.message}`);
              return res.redirect('/admin/courses/create');
            }
          }
        }
      }

      req.flash('success', 'Course and batches created successfully');
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

      res.render('admin/courses/edit', {
        title: `Edit Course: ${course.name}`,
        course,
        batches,
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

      const batches = req.body.batches;
      const submittedIds = [];

      if (batches && typeof batches === 'object') {
        const batchKeys = Object.keys(batches);
        for (const key of batchKeys) {
          const b = batches[key];
          if (b.name && b.name.trim()) {
            try {
              if (b.id) {
                const batchId = parseInt(b.id, 10);
                submittedIds.push(batchId);
                await Batch.update(batchId, {
                  name: b.name.trim(),
                  course_id: req.params.id,
                  start_date: b.start_date || null,
                  end_date: b.end_date || null,
                  max_students: b.max_students || 30,
                  is_active: b.is_active !== undefined ? (b.is_active === '1' || b.is_active === 1 ? 1 : 0) : 1
                });
              } else {
                const newId = await Batch.create({
                  name: b.name.trim(),
                  course_id: req.params.id,
                  start_date: b.start_date || null,
                  end_date: b.end_date || null,
                  max_students: b.max_students || 30
                });
                submittedIds.push(newId);
              }
            } catch (batchError) {
              console.error('Batch update error:', batchError);
              req.flash('error', `Error updating batch "${b.name}": ${batchError.message}`);
              return res.redirect(`/admin/courses/${req.params.id}/edit`);
            }
          }
        }
      }

      const existingBatches = await Batch.findByCourseId(req.params.id);
      for (const existing of existingBatches) {
        if (!submittedIds.includes(existing.id)) {
          try {
            await Batch.delete(existing.id);
          } catch (deleteError) {
            console.error('Batch delete error:', deleteError);
          }
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
