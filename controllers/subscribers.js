import Subscriber from '../models/subscriber';
import { createObjectCsvStringifier } from 'csv-writer';

// ✅ Get paginated subscribers
export const getSubscribers = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const subscribers = await Subscriber.find({ userId: req.user.id })
			.skip((page - 1) * limit)
			.limit(Number(limit));

		const totalSubscribers = await Subscriber.countDocuments({ userId: req.user.id });

		res.json({
			subscribers,
			totalSubscribers,
			totalPages: Math.ceil(totalSubscribers / limit),
			currentPage: Number(page),
		});
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
};

// ✅ Add a subscriber
export const addSubscriber = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ error: 'Email is required' });

		const existing = await Subscriber.findOne({ userId: req.user.id, email });
		if (existing) return res.status(400).json({ error: 'Subscriber already exists' });

		const newSubscriber = new Subscriber({ userId: req.user.id, email });
		await newSubscriber.save();

		res.json({ message: 'Subscriber added', subscriber: newSubscriber });
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
};

// ✅ Remove a subscriber
export const removeSubscriber = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ error: 'Email is required' });

		await Subscriber.findOneAndDelete({ userId: req.user.id, email });

		res.json({ message: 'Subscriber removed' });
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
};

// ✅ Export subscribers as CSV
export const exportSubscribersToCSV = async (req, res) => {
	try {
		const subscribers = await Subscriber.find({ userId: req.user.id }).select('email createdAt');

		if (subscribers.length === 0) {
			return res.status(400).json({ error: 'No subscribers to export' });
		}

		const csvStringifier = createObjectCsvStringifier({
			header: [
				{ id: 'email', title: 'Email' },
				{ id: 'createdAt', title: 'Subscribed At' }
			]
		});

		const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(subscribers);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
		res.status(200).send(csvData);
	} catch (err) {
		res.status(500).json({ error: 'Server error while exporting CSV' });
	}
};
