const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');

router.get('/', noticeController.getAll);
router.get('/create', noticeController.getCreate);
router.post('/', noticeController.postCreate);
router.get('/:id', noticeController.getDetail);
router.get('/:id/edit', noticeController.getEdit);
router.post('/:id/update', noticeController.postUpdate);
router.post('/:id/delete', noticeController.postDelete);

module.exports = router;
