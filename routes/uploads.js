const express = require('express');
const router = express.Router();
const uploadsController = require('../controllers/uploads');

// Routes
router.post('/', uploadsController.createUpload);
// router.delete('/:id', uploadsController.deleteArticle);

module.exports = router;