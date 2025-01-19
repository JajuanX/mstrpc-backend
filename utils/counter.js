import counterSchema from '../models/count.js';

async function incrementProfileCount() {
	try {
		await counterSchema.findOneAndUpdate(
			{ _id: 'profileCount' },
			{ $inc: { count: 1 } },
			{ upsert: true, new: true }
		);
		console.log('Profile count incremented successfully.');
	} catch (error) {
		console.error('Error incrementing profile count:', error);
	}
}

export default incrementProfileCount;
