const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateEvent } = require('../middleware/validation');
const { uploadEvent } = require('../middleware/upload');

router.get('/', eventController.getAll);
router.get('/create', eventController.getCreate);
router.post('/', uploadEvent.single('image'), validateEvent, eventController.postCreate);

router.get('/:id', eventController.getDetail);
router.get('/:id/edit', eventController.getEdit);
router.post('/:id/update', uploadEvent.single('image'), validateEvent, eventController.postUpdate);
router.post('/:id/delete', eventController.postDelete);

module.exports = router;
