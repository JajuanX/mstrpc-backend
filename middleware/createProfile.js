const profileSchema = require("../models/profile");

module.exports = async (req, res, next) => {
	try {
		const response = await profileSchema.create({});
		req.profile = response;
		next()
	} catch (err) {
		res.status(500).send("Failed to create profile", err);
	}
};