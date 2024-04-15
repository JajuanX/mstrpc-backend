const express = require('express');
const router = express.Router();
const articlesController = require('../controllers/articles');
const authorize = require("../middleware/authorize");

// Routes
router.get('/', articlesController.getArticles);
router.post('/', authorize, articlesController.createArticle);
router.put('/', authorize, articlesController.updateArticle);
router.delete('/:id/:profileId', authorize, articlesController.deleteArticle);
router.get('/:id', articlesController.getArticle);

module.exports = router;