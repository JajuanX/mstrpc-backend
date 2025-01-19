import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
	{
		amount: {
			type: Number,
			required: true,
		},
		sessionId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
		},
		paymentIntentId: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true } // Adds createdAt and updatedAt timestamps
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
