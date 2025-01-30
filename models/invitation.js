import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
	{
		inviteToken: {
			type: String,
			required: true,
			unique: true, // Ensure tokens are unique
		},
		invitedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user', // Reference to the user who created the invite
			required: true,
		},
		isUsed: {
			type: Boolean,
			default: false, // Track if the token has been used
		},
		email: {
			type: String,
			required: true, // Optional: Track the intended email for validation
		},
	},
	{ timestamps: true }
);

const Invitation = mongoose.model('invitation', invitationSchema);
export default Invitation;
