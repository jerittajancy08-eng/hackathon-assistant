const express = require('express');
const { handleChat, loadSession } = require('../controllers/chatController');
const { validateChatRequest } = require('../middlewares/validateRequest');
const { optionalAuth, requireAuth } = require('../middlewares/authenticate');

const router = express.Router();

router.post('/', optionalAuth, validateChatRequest, handleChat);
router.get('/session/:sessionId', optionalAuth, requireAuth, loadSession);

module.exports = router;
