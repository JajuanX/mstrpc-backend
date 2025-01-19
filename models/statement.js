import mongoose from 'mongoose';

const statementSchema = new mongoose.Schema(
	{
		statement: {
			type: String,
		},
		description: {
			type: String,
		},
		image_url: {
			type: String,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
			required: true,
		},
	},
	{ timestamps: true }
);

const Statement = mongoose.model('statement', statementSchema);

export default Statement;
