import express from 'express';
import {
	getBlogs,
	createBlog,
	updateBlog,
	deleteBlog,
	getBlog,
	getBlogsByUser,
} from '../controllers/blogs.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Routes
router.get('/', getBlogs);
router.post('/', authorize, createBlog);
router.put('/', authorize, updateBlog);
router.delete('/:id', authorize, deleteBlog);
router.get('/:id', getBlog);
router.get('/:id/users/:userid', getBlogsByUser);

export default router;
