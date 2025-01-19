import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
	{
		count: {
			type: Number,
		},
	},
	{ timestamps: true }
);

const Counter = mongoose.model('counter', counterSchema);

export default Counter;
