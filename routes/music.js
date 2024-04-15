const express = require('express');
const router = express.Router();
const musicController = require('../controllers/music');

// Routes
router.post('/', musicController.getSong);

module.exports = router;