const blogSchema = require('../models/blog')
const profileSchema = require('../models/profile');

const getBlogs = async (_req, res) => {
	try {
		let response = await blogSchema.find({}).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve all Blogs')
	}
};

const getBlogsByUser = async (req, res) => {

}

const createBlog = async (req, res) => {
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
		res.status(500).send("Failed to create article");
	}
};

const getBlog = async (req, res) => {
	try {
		const response = await blogSchema.findOne({_id: req.params.id}).populate({
			path: 'user_id',
			select: '-password'
		}).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send("Failed to retrieve all Blogs");
	}
};

const updateBlog = async (req, res) => {
	const articleId = req.params.id
	try {
		const response = await blogSchema.findOneAndUpdate({ _id: articleId }, req.body, {new: true});
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send("Failed to update article");
	}
};

const deleteBlog = async (req, res) => {
	const articleId = req.params.id
	try {
		const response = await blogSchema.deleteOne({ _id: articleId });
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send("Failed to delete article");
	}
};

module.exports = {
    createBlog,
    getBlogs,
    getBlog,
	updateBlog,
	deleteBlog,
	getBlogsByUser
};