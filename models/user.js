import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
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
		customer: {
			type: String,
		},
		username: {
			type: String,
			unique: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		roles: {
			type: [String], // Array of strings for clarity
			default: [], // Default to an empty array
		},
		stripeId: {
			type: String,
		},
		subscriptionStatus: {
			type: String,
		},
		session_id: {
			type: String,
		},
		profile: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'profile',
		},
		invitedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user', // Reference to the user who sent the invite
			default: null,
		},
		inviteTokenUsed: {
			type: String, // Token used during registration
			default: null,
		},
		resetPasswordToken: { 
			type: String, 
			default: null 
		},
		resetPasswordExpires: { 
			type: Date, 
			default: null 
		},
	},
	{ timestamps: true }
);

const User = mongoose.model('user', userSchema);

export default User;
