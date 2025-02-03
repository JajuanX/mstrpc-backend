import visitSchema from '../models/visit.js';
import faker from 'faker';
import crypto from 'crypto';

const SECRET_KEY = 'champion'; // Change this, keep it private!

const hashIP = (ip) => {
    return crypto.createHmac('sha256', SECRET_KEY).update(ip).digest('hex');
};

export const recordVisit = async (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.ip;
    if (ip.includes(',')) ip = ip.split(',')[0]; // Handle multiple forwarded IPs
    if (ip === '::1') ip = '127.0.0.1'; // Normalize localhost

    const hashedIP = hashIP(ip); // Hash the IP before storing
    const user = req.params.userName;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const visitExists = await visitSchema.findOne({
            ipAddress: hashedIP, // Compare with hashed IP
            visitDate: { $gte: today, $lt: new Date(today.getTime() + 86400000) }, 
            page: user,
        });

        if (!visitExists) {
            const newVisit = new visitSchema({
                ipAddress: hashedIP, // Store hashed IP
                page: user,
                visitDate: new Date(),
            });
            await newVisit.save();
            res.status(200).send('Successfully logged visit');
            return;
        }

        res.status(200).send('User previously visited');
    } catch (err) {
        console.error('Error recording visit:', err);
        res.status(500).send('Failed to record visit');
    }
};

export const getVisits = async (req, res) => {
	const user = req.params.userName;
	try {
		const visits = await visitSchema.find({ page: user }).distinct('ipAddress');
		res.json({ uniqueVisits: visits.length });
	} catch (err) {
		console.error('Error fetching visits:', err);
		res.status(500).send('Failed to fetch visits');
	}
};

const getStartOfPeriod = (period) => {
	const now = new Date();
	if (period === 'daily') {
		now.setHours(0, 0, 0, 0);
	} else if (period === 'weekly') {
		const day = now.getDay();
		const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Week starts on Monday
		now.setDate(diff);
		now.setHours(0, 0, 0, 0);
	} else if (period === 'monthly') {
		now.setDate(1);
		now.setHours(0, 0, 0, 0);
	} else if (period === 'yearly') {
		now.setMonth(0, 1); // January 1st
		now.setHours(0, 0, 0, 0);
	}
	return now;
};

export const getVisitByPeriod = async (req, res) => {
	const page = req.params.userName;

	try {
		const visits = await visitSchema.aggregate([
			{ $match: { page } },
			{
				$facet: {
					daily: [
						{ $match: { visitDate: { $gte: getStartOfPeriod('daily') } } },
						{ $group: { _id: null, count: { $sum: 1 } } },
					],
					weekly: [
						{ $match: { visitDate: { $gte: getStartOfPeriod('weekly') } } },
						{ $group: { _id: null, count: { $sum: 1 } } },
					],
					monthly: [
						{ $match: { visitDate: { $gte: getStartOfPeriod('monthly') } } },
						{ $group: { _id: null, count: { $sum: 1 } } },
					],
					yearly: [
						{ $match: { visitDate: { $gte: getStartOfPeriod('yearly') } } },
						{ $group: { _id: null, count: { $sum: 1 } } },
					],
				},
			},
		]);

		const counts = {
			daily: visits[0].daily[0]?.count || 0,
			weekly: visits[0].weekly[0]?.count || 0,
			monthly: visits[0].monthly[0]?.count || 0,
			yearly: visits[0].yearly[0]?.count || 0,
		};

		res.json(counts);
	} catch (err) {
		console.error('Error fetching visit data by period:', err);
		res.status(500).send('Failed to fetch visit data');
	}
};

export const generateDummyData = async (req, res) => {
	const recordsToFake = parseInt(req.params.records, 10);

	try {
		for (let i = 0; i < recordsToFake; i++) {
			const visit = new visitSchema({
				ipAddress: faker.internet.ip(),
				page: 'juan_x',
				visitDate: faker.date.between('2024-01-03', '2024-01-04'),
			});

			await visit.save();
		}

		res.send(`Generated ${recordsToFake} dummy records.`);
		console.log(`Generated ${recordsToFake} dummy records.`);
	} catch (err) {
		console.error('Error generating dummy data:', err);
		res.status(500).send('Failed to generate dummy data');
	}
};

export const topVisitedPages = async (_req, res) => {
	try {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const visits = await visitSchema.aggregate([
			{ $match: { visitDate: { $gte: yesterday, $lt: today } } },
			{ $group: { _id: '$page', count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 5 },
		]);

		res.status(200).json(visits);
	} catch (err) {
		console.error('Error fetching top visited pages:', err);
		res.status(500).send('Failed to fetch top visited pages');
	}
};
