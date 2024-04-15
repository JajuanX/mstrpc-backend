const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
	image_url: String,
	link_url: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "article",
		required: true
	},
},{ timestamps: true }
);

const Article = mongoose.model("article", articleSchema);

module.exports = Article
