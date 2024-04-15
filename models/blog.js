const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
	title: String,
	content: {
		type: Object,
		required: true
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
		required: true
	},
},{ timestamps: true }
);

const Blog = mongoose.model("blog", blogSchema);
module.exports = Blog
