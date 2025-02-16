import visitSchema from '../models/visit.js';

const recordVisitMiddleware = async (req, res, next) => {
	const ip = req.ip === '::1' ? '127.0.0.1' : req.ip; // Handle localhost IP
	const user = req.params.username;
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Start of the day

	try {
		const visitExists = await visitSchema.findOne({
			ipAddress: ip,
			visitDate: { $gte: today },
		});

		if (!visitExists) {
			const newVisit = new visitSchema({
				ipAddress: ip,
				page: user,
				visitDate: new Date(),
			});
			await newVisit.save();
		}

		next();
	} catch (err) {
		console.error('Error recording visit:', err);
		next(); // Proceed even if there's an error to avoid blocking the request
	}
};

export default recordVisitMiddleware;
