const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { validateInvoice } = require('../middleware/validation');

router.get('/', invoiceController.getAll);
router.get('/create', invoiceController.getCreate);
router.post('/', validateInvoice, invoiceController.postCreate);
router.get('/:id', invoiceController.getDetail);
router.get('/:id/edit', invoiceController.getEdit);
router.post('/:id/update', validateInvoice, invoiceController.postUpdate);
router.post('/:id/delete', invoiceController.postDelete);
router.get('/:id/print', invoiceController.getPrint);

module.exports = router;
