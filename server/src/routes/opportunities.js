const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateQuery, validateBody, opportunityQuerySchema, createOpportunitySchema } = require('../validators/schemas');
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMatch,
  explainOpportunityMatch,
  getRecommended,
} = require('../controllers/opportunityController');
const { saveOpportunity, unsaveOpportunity } = require('../controllers/savedController');

// Public / optional-auth routes
router.get('/', optionalAuth, validateQuery(opportunityQuerySchema), getOpportunities);
router.get('/recommended', authenticate, getRecommended);
router.get('/:id', optionalAuth, getOpportunity);

// Authenticated student routes
router.get('/:id/match', authenticate, getMatch);
router.get('/:id/explain', authenticate, explainOpportunityMatch);
router.post('/:id/save', authenticate, saveOpportunity);
router.delete('/:id/save', authenticate, unsaveOpportunity);

// Admin routes
router.post('/', authenticate, requireAdmin, validateBody(createOpportunitySchema), createOpportunity);
router.patch('/:id', authenticate, requireAdmin, updateOpportunity);
router.delete('/:id', authenticate, requireAdmin, deleteOpportunity);

module.exports = router;
