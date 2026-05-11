const express = require('express');
const { signup, login, getProfile, getSessions } = require('../controllers/authController');
const { optionalAuth, requireAuth } = require('../middlewares/authenticate');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', optionalAuth, requireAuth, getProfile);
router.get('/sessions', optionalAuth, requireAuth, getSessions);

module.exports = router;
