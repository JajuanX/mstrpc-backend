const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
		count: Number,
	},{ timestamps: true }
);

const Counter = mongoose.model("counter", counterSchema);
module.exports = Counter
