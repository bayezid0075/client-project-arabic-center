const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { validateCourse } = require('../middleware/validation');
const Batch = require('../models/Batch');

router.get('/', courseController.getAll);
router.get('/create', courseController.getCreate);
router.post('/', validateCourse, courseController.postCreate);

router.get('/api/batches/:courseId', async (req, res) => {
  try {
    const batches = await Batch.findByCourseId(req.params.courseId);
    res.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.json([]);
  }
});

router.get('/:id', courseController.getDetail);
router.get('/:id/edit', courseController.getEdit);
router.post('/:id/update', validateCourse, courseController.postUpdate);
router.post('/:id/delete', courseController.postDelete);

module.exports = router;
