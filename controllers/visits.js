const visitSchema = require("../models/visit");
const faker = require('faker'); // npm install faker

const recordVisit = async (req, res) => {
	const ip = req.ip === '::1' ? '127.0.0.1': req.ip;
	const user = req.params.userName
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	try {
		const visitExists = await visitSchema.findOne({ 
			ipAddress: ip,
			visitDate: { $gte: today } ,
			page: user,
		});
		if (!visitExists) {
			const newVisit = new visitSchema({ 
				ipAddress: ip,
				page: user, 
				visitDate: new Date() });
			await newVisit.save();
			res.status(200).send('successfully logged visit')
			return
		}
		res.status(200).send('user previously visited')
	} catch(err) {
		console.log(err);
	}
}

const getVisits = async (req, res) => {
	const user = req.params.userName
	const visits = await visitSchema.find({page: user}).distinct('page');
	res.json({ uniqueVisits: visits.length });
};

// Helper function to get start of time period
const getStartOfPeriod = (period) => {
	const now = new Date();
	if (period === 'daily') {
		now.setHours(0, 0, 0, 0);
	} else if (period === 'weekly') {
		const day = now.getDay();
	  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when week starts
		now.setDate(diff);
		now.setHours(0, 0, 0, 0);
	} else if (period === 'monthly') {
		now.setDate(1);
		now.setHours(0, 0, 0, 0);
	} else if (period === 'yearly') {
		now.setMonth(0, 1); // Set to January 1st
		now.setHours(0, 0, 0, 0);
	}
	return now;
};

  // Routes to retrieve visit data
const getVisitByPeriod = async (req, res) => {
	// const period = req.params.period;
	const page = req.params.userName;
	const startOfDaily = getStartOfPeriod('daily');
    const startOfWeekly = getStartOfPeriod('weekly');
    const startOfMonthly = getStartOfPeriod('monthly');
    const startOfYearly = getStartOfPeriod('yearly');

    const visits = await visitSchema.aggregate([
		{
			$match: { page: page }
		},
		{
			$facet: {
				daily: [
					{ $match: { visitDate: { $gte: startOfDaily } } },
					{ $group: { _id: null, count: { $sum: 1 } } }
				],
				weekly: [
					{ $match: { visitDate: { $gte: startOfWeekly } } },
					{ $group: { _id: null, count: { $sum: 1 } } }
				],
				monthly: [
					{ $match: { visitDate: { $gte: startOfMonthly } } },
					{ $group: { _id: null, count: { $sum: 1 } } }
				],
				yearly: [
					{ $match: { visitDate: { $gte: startOfYearly } } },
					{ $group: { _id: null, count: { $sum: 1 } } }
				]
			}
		}
	]);

    // Extract counts
    const counts = {
		daily: visits[0].daily[0]?.count || 0,
		weekly: visits[0].weekly[0]?.count || 0,
		monthly: visits[0].monthly[0]?.count || 0,
		yearly: visits[0].yearly[0]?.count || 0
    };

    res.json(counts);
};

const generateDummyData = async (req, res) => {
	const recordsToFake = req.params.records
	for (let i = 0; i < recordsToFake; i++) {
		const randomIp = faker.internet.ip();
		const randomPage = 'juan_x'
		const randomDate = faker.date.between('2024-01-03', '2024-01-04');

		const visit = new visitSchema({
			ipAddress: randomIp,
			page: randomPage,
			visitDate: randomDate
		});

		await visit.save();
	}
	res.send(`Generated ${recordsToFake} dummy records.`)
	console.log(`Generated ${recordsToFake} dummy records.`);
}

const topVisitedPages = async (_req, res) => {
	try {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0);

		const today = new Date();
		today.setDate(today.getDate() + 1);
		today.setHours(0, 0, 0, 0);
		console.log(today, yesterday);

		const visits = await visitSchema.aggregate([
			{ $match: { visitDate: { $gte: yesterday, $lt: today } } },
			{ $group: { _id: '$page', count: { $sum: 1 } } },
			{ $sort: { count: -1 } }, 
            { $limit: 5 } 
		]);
		console.log('visits', visits);
		res.status(200).json(visits)
		} 
	catch (error) {
		console.error('Error aggregating daily visits:', error);
	}
}

module.exports = {
    recordVisit,
	getVisits,
	getVisitByPeriod,
	generateDummyData,
	topVisitedPages
};