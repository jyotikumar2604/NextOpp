const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getStats,
  getOpportunities,
  getUsers,
  updateUser,
  getModerationLogs,
  getIngestionSources,
  ingestOpportunitiesBatch,
} = require('../controllers/adminController');

router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/opportunities', getOpportunities);
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.get('/logs', getModerationLogs);
router.get('/ingest/sources', getIngestionSources);
router.post('/ingest/batch', ingestOpportunitiesBatch);

module.exports = router;
