import profileSchema from '../models/profile.js';

const createProfile = async (req, res, next) => {
	try {
		const profile = await profileSchema.create({});
		req.profile = profile;
		next();
	} catch (err) {
		console.error('Error creating profile:', err);
		res.status(500).send('Failed to create profile');
	}
};

export default createProfile;
