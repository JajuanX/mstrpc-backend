import blogSchema from '../models/blog.js';
import profileSchema from '../models/profile.js';

export const getBlogs = async (_req, res) => {
	try {
		const response = await blogSchema.find({}).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve all blogs');
	}
};

export const getBlogsByUser = async (req, res) => {
	const userId = req.params.userId;
	try {
		const response = await blogSchema.find({ user_id: userId }).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve blogs by user');
	}
};

export const createBlog = async (req, res) => {
	console.log(req.body);
	try {
		const response = await blogSchema.create(req.body);
		await profileSchema.findByIdAndUpdate(
			req.userInfo.profile,
			{ $push: { blogs: response._id } },
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		console.log(err);
		res.status(500).send('Failed to create blog');
	}
};

export const getBlog = async (req, res) => {
	try {
		const response = await blogSchema.findOne({ _id: req.params.id })
			.populate({
				path: 'user_id',
				select: '-password',
			})
			.exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve the blog');
	}
};

export const updateBlog = async (req, res) => {
	const blogId = req.params.id;
	try {
		const response = await blogSchema.findOneAndUpdate(
			{ _id: blogId },
			req.body,
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send('Failed to update blog');
	}
};

export const deleteBlog = async (req, res) => {
	const blogId = req.params.id;
	try {
		const response = await blogSchema.deleteOne({ _id: blogId });
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send('Failed to delete blog');
	}
};
