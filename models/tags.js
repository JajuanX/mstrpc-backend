import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
	{
		tag: { 
			type: String, 
			required: true, 
			unique: true 
		},
		count: {
			type: Number,
			default: 0,
			required: true 
		}
	},
	{ timestamps: true }
);

const Tag = mongoose.model('tag', tagSchema);

export default Tag;
