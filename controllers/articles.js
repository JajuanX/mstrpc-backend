const articleSchema = require('../models/article')
const profileSchema = require('../models/profile')

const getArticles = async (_req, res) => {
	try {
		let response = await articleSchema.find({}).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send('Failed to retrieve all articles')
	}
};

const createArticle = async (req, res) => {
	try {
		const response = await articleSchema.create(req.body);
		console.log();
		await profileSchema.findByIdAndUpdate(
			req.userInfo.profile,
			{ $push: { articles: response._id } },  // Assuming 'articles' is an array of article IDs in the user schema
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		console.log(err);
		res.status(500).send("Failed to create article");
	}
};

const getArticle = async (req, res) => {
	try {
		const response = await articleSchema.findOne({_id: req.params.id}).exec();
		res.status(200).json(response);
	} catch (error) {
		res.status(500).send("Failed to retrieve all articles");
	}
};

const updateArticle = async (req, res) => {
	const articleId = req.params.id
	try {
		const response = await articleSchema.findOneAndUpdate({ _id: articleId }, req.body, {new: true});
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send("Failed to update article");
	}
};

const deleteArticle = async (req, res) => {
	const articleId = req.params.id
	const profileId = req.params.profileId
	try {
		const response = await articleSchema.deleteOne({ _id: articleId });
		await profileSchema.findByIdAndUpdate(
			profileId,
			{ $pull: { articles: articleId } },  // Assuming 'articles' is an array of article IDs in the user schema
			{ new: true }
		);
		res.status(200).json(response);
	} catch (err) {
		res.status(500).send("Failed to delete article");
	}
};


module.exports = {
    createArticle,
    getArticles,
    getArticle,
	updateArticle,
	deleteArticle,
};