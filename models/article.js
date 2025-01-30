import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
	{
		image_url: {
			type: String,
		},
		link_url: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		tag: {
			type: String,
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user', // Corrected the reference to "user" (assuming this refers to a user model)
			required: true,
		},
	},
	{ timestamps: true }
);

const Article = mongoose.model('article', articleSchema);

export default Article;
