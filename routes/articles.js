import express from 'express';
import {
	getArticles,
	createArticle,
	updateArticle,
	deleteArticle,
	getArticle,
} from '../controllers/articles.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Routes
router.get('/', getArticles);
router.post('/', authorize, createArticle);
router.put('/', authorize, updateArticle);
router.delete('/:id/:profileId', authorize, deleteArticle);
router.get('/:id', getArticle);

export default router;
