import express from 'express';
import {
	getArticlesPagination,
	createArticle,
	editArticle,
	deleteArticle,
	getArticle,
} from '../controllers/articles.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Routes
router.get('/', getArticlesPagination);
router.post('/', authorize, createArticle);
router.put('/:id', authorize, editArticle);
router.delete('/:id/:profileId', authorize, deleteArticle);
router.get('/:id', getArticle);

export default router;
