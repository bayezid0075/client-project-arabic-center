const multer = require('multer');
const path = require('path');
const fs = require('fs');

const EVENTS_DIR = path.join(__dirname, '..', 'uploads', 'events');
const STUDENTS_DIR = path.join(__dirname, '..', 'uploads', 'students');

if (!fs.existsSync(EVENTS_DIR)) {
  fs.mkdirSync(EVENTS_DIR, { recursive: true });
}
if (!fs.existsSync(STUDENTS_DIR)) {
  fs.mkdirSync(STUDENTS_DIR, { recursive: true });
}

const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, EVENTS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'event-' + uniqueSuffix + ext);
  }
});

const studentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, STUDENTS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'student-' + uniqueSuffix + ext);
  }
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

const uploadEvent = multer({
  storage: eventStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

const uploadStudentPhoto = multer({
  storage: studentStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter
});

module.exports = { uploadEvent, uploadStudentPhoto };
