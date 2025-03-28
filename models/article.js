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
			ref: 'user',
			required: true,
		},
		profile_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'profile',
			required: true,
		},
		upvotes: {
			type: Number,
			default: 0,
		},
		rankingScore: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

const Article = mongoose.model('article', articleSchema);

export default Article;
