const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	amount: Number,
	sessionId: String,
	status: String,
	paymentIntentId: String
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;