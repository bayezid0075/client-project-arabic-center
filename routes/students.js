const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { validateStudent } = require('../middleware/validation');
const { uploadStudentPhoto } = require('../middleware/upload');

router.get('/', studentController.getAll);
router.get('/create', studentController.getCreate);
router.post('/', uploadStudentPhoto.single('profile_photo'), validateStudent, studentController.postCreate);
router.get('/:id', studentController.getDetail);
router.get('/:id/edit', studentController.getEdit);
router.post('/:id/update', uploadStudentPhoto.single('profile_photo'), validateStudent, studentController.postUpdate);
router.post('/:id/delete', studentController.postDelete);

module.exports = router;
