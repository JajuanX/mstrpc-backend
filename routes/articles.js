import express from 'express';
import {
	getArticlesPagination,
	createArticle,
	editArticle,
	deleteArticle,
	getArticle,
	upvoteArticle,
	removeVoteArticle
} from '../controllers/articles.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Routes
router.get('/', getArticlesPagination);
router.post('/', authorize, createArticle);
router.put('/:id', authorize, editArticle);
router.delete('/:id/:profileId', authorize, deleteArticle);
router.get('/:id', getArticle);
router.put('/:id/upvote', authorize, upvoteArticle);
router.put('/:id/remove-vote', authorize, removeVoteArticle);

export default router;
