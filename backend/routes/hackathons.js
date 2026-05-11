const express = require('express');
const { getAllHackathons, getHackathonById, searchHackathons, createHackathon, updateHackathon, deleteHackathon, getFilterOptions } = require('../controllers/hackathonController');
const { optionalAuth } = require('../middlewares/authenticate');

const router = express.Router();

// Public routes
router.get('/filter-options', getFilterOptions);
router.get('/search', searchHackathons);
router.get('/', getAllHackathons);
router.get('/:id', getHackathonById);

// Protected routes (optional auth)
router.post('/', optionalAuth, createHackathon);
router.put('/:id', optionalAuth, updateHackathon);
router.delete('/:id', optionalAuth, deleteHackathon);

module.exports = router;
