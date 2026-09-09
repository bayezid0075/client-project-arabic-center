const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { validateCertificate } = require('../middleware/validation');

router.get('/', certificateController.getAll);
router.get('/create', certificateController.getCreate);
router.post('/', validateCertificate, certificateController.postCreate);
router.get('/:id', certificateController.getDetail);
router.get('/:id/edit', certificateController.getEdit);
router.post('/:id/update', validateCertificate, certificateController.postUpdate);
router.post('/:id/delete', certificateController.postDelete);
router.get('/:id/print', certificateController.getPrint);

module.exports = router;
