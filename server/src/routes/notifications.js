const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');

router.get('/', authenticate, getNotifications);
router.patch('/mark-all-read', authenticate, markAllRead);
router.patch('/:id', authenticate, markRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
