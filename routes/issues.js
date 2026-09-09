const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { validateIssue } = require('../middleware/validation');

router.get('/', issueController.getAll);
router.get('/create', issueController.getCreate);
router.post('/', validateIssue, issueController.postCreate);
router.get('/:id', issueController.getDetail);
router.get('/:id/edit', issueController.getEdit);
router.post('/:id/update', validateIssue, issueController.postUpdate);
router.post('/:id/delete', issueController.postDelete);

module.exports = router;
