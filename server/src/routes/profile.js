const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateBody, updateProfileSchema } = require('../validators/schemas');
const {
  getProfile,
  updateProfile,
  saveOnboarding,
  uploadResume,
  updateProfileImage,
  getProfileTips,
} = require('../controllers/profileController');

// Multer storage setup
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .docx, and .txt files are supported.'));
    }
  },
});

router.get('/', authenticate, getProfile);
router.patch('/', authenticate, validateBody(updateProfileSchema), updateProfile);
router.post('/onboarding', authenticate, saveOnboarding);
router.post('/resume', authenticate, upload.single('resume'), uploadResume);
router.patch('/image', authenticate, updateProfileImage);
router.get('/tips', authenticate, getProfileTips);

module.exports = router;
