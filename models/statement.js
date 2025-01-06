const mongoose = require('mongoose')

const statementSchema = new mongoose.Schema({
	statement: String,
	description: String,
	image_url: String,
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
		required: true
	},
},{ timestamps: true }
);

const Statement = mongoose.model("statement", statementSchema);
module.exports = Statement;
