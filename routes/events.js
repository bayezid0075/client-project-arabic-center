const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateEvent } = require('../middleware/validation');
const upload = require('../middleware/upload');

router.get('/', eventController.getAll);
router.get('/create', eventController.getCreate);
router.post('/', upload.single('image'), validateEvent, eventController.postCreate);

router.get('/:id', eventController.getDetail);
router.get('/:id/edit', eventController.getEdit);
router.post('/:id/update', upload.single('image'), validateEvent, eventController.postUpdate);
router.post('/:id/delete', eventController.postDelete);

module.exports = router;
