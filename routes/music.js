const express = require('express');
const router = express.Router();
const musicController = require('../controllers/music');
const authorize = require('../middleware/authorize')

// Routes
router.post('/', authorize, musicController.getSong);

module.exports = router;