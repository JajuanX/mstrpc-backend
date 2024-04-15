const visitSchema = require("../models/visit");

module.exports = async (req, res, next) => {
	console.log('here');
	const ip = req.ip;
	const user = req.params.username
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	try {
		const visitExists = await visitSchema.findOne({ ipAddress: ip, visitDate: { $gte: today } });
		if (!visitExists) {
			const newVisit = new visitSchema({ ipAddress: ip, page: user, visitDate: new Date() });
			await newVisit.save();
		}
		next()
	} catch(err) {
		console.log(err);
		next()
	}
}