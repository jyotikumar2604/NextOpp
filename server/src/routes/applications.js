const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateBody, createApplicationSchema, updateApplicationSchema } = require('../validators/schemas');
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  getStats,
} = require('../controllers/applicationController');

router.get('/', authenticate, getApplications);
router.get('/stats', authenticate, getStats);
router.post('/', authenticate, validateBody(createApplicationSchema), createApplication);
router.get('/:id', authenticate, getApplication);
router.patch('/:id', authenticate, validateBody(updateApplicationSchema), updateApplication);
router.delete('/:id', authenticate, deleteApplication);

module.exports = router;
