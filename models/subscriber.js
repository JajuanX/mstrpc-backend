import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	email: { type: String, required: true, index: true },
	createdAt: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model('Subscriber', SubscriberSchema);
export default Subscriber;
