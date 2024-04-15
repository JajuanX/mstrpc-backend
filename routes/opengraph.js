const express = require('express');
const router = express.Router();
const openGraphController = require('../controllers/opengraph');

// Routes
router.post('/', openGraphController.getOpengraph);

module.exports = router;