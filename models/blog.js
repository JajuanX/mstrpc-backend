import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
		},
		content: {
			type: Object,
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user', // Ensure this matches the name of your user model
			required: true,
		},
	},
	{ timestamps: true }
);

const Blog = mongoose.model('blog', blogSchema);

export default Blog;
