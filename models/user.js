const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
		firstName: { 
			type: String,
			required: true,
		},
		lastName: { 
			type: String,
			required: true,
		},
    },
    email: {
		type: String,
		unique: true,
		required: true,
    },
	customer: String,
    username: {
		type: String,
		unique: true,
		required: true,
    },
    image_url: String,
    password: {
		type: String,
		required: true,
    },
	roles: {
		type: Array,
	},
	stripeId: String,
	subscriptionStatus: String,
	session_id: String,
	profile: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "profile",
	},

},{ timestamps: true}
);

const User = mongoose.model("user", userSchema);

module.exports = User;
