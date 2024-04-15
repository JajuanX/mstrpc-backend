const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogs');
const authorize = require('../middleware/authorize');

// Routes
router.get('/', blogsController.getBlogs);
router.post('/',authorize, blogsController.createBlog);
router.put('/', authorize, blogsController.updateBlog);
router.delete('/:id', authorize, blogsController.deleteBlog);
router.get('/:id', blogsController.getBlog);
router.get('/:id/users/:userid', blogsController.getBlogsByUser);

module.exports = router;