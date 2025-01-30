import mongoose from 'mongoose';
import incrementProfileCount from '../utils/counter.js';

const profilesSchema = new mongoose.Schema(
	{
		image_url: {
			type: String,
		},
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
		topFriends: [
			{
				url: String,
				source: String,
				pictureUrl: String,
				position: String,
				name: String,
			},
		],
		links: [
			{
				url: String,
				type: { type: String },
			},
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
				type: String,
			},
			yearly: {
				type: String,
			},
			daily: {
				type: String,
			},
		},
		music: {
			type: String,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
	},
	{ timestamps: true }
);

const Profile = mongoose.model('profile', profilesSchema);

// Post-save hook to increment profile count
Profile.schema.post('save', async () => {
	try {
		await incrementProfileCount(); // Ensure this function is implemented in '../utils/counter.js'
	} catch (err) {
		console.error('Error incrementing profile count:', err);
	}
});

export default Profile;
