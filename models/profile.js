const mongoose = require("mongoose");
const incrementProfileCount = require('../utils/counter')
const profilesSchema = new mongoose.Schema({
	image_url: String,
	image: {
		url: {
			type: String,
		},
		height: {
			type: String,
		},
		width: {
			type: String,
		},
	},
	topFriends : [
		{
			url: String,
			source: String,
			pictureUrl: String,
			position: String,
			name: String
		}
	],
	links : [
		{
			url: String,
			type: {type: String},
		}
	],
	colors: {
		primary: {
			type: String,
		},
		secondary: {
			type: String,
		},
		font: {
			type: String,
		},
	},
	backgroundImage: {
		type: String,
	},
	headline: {
		type: String,
	},
	description: {
		type: String,
	},
	statement: {
		type: String,
	},
	displayName: {
		type: String,
	},
	pageViews: {
		monthly: {
			type: String
		},
		yearly: {
			type: String
		},
		daily: {
			type: String
		}
	},
	music: {
		type: String,
	},
	articles: [
		{
			type: mongoose.SchemaTypes.ObjectId,
			ref: "article"
		}
	],
	blogs: [
		{
			type: mongoose.SchemaTypes.ObjectId,
			ref: "blog"
		}
	],
	statements: [
		{
			type: mongoose.SchemaTypes.ObjectId,
			ref: "statement"
		}
	],
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
},{ timestamps: true}
);


const Profile = mongoose.model("profile", profilesSchema);

Profile.schema.post('save', async () => {
	// Increment count
	incrementProfileCount(); // Implement this function
});

module.exports = Profile;
