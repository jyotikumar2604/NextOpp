const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getSaved } = require('../controllers/savedController');

router.get('/', authenticate, getSaved);

module.exports = router;
