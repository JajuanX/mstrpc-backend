const counterSchema = require('../models/count')

function incrementProfileCount() {
	counterSchema.findOneAndUpdate(
		{ _id: "profileCount" },
		{ $inc: { count: 1 } },
		{ upsert: true, new: true },
	);
}

module.exports = incrementProfileCount;