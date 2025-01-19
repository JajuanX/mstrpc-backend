import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
	{
		ipAddress: {
			type: String,
			required: true,
		},
		page: {
			type: String,
			required: true,
		},
		visitDate: {
			type: Date,
			required: true,
			default: Date.now, // Default to current date and time
		},
	},
	{ timestamps: true } // Adds createdAt and updatedAt fields
);

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;
