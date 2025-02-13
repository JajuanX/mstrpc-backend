import express from 'express';
import {
	recordVisit,
	getVisits,
	topVisitedPages,
	getVisitByPeriod,
	generateDummyData,
	getTotalViews,
} from '../controllers/visits.js';

const router = express.Router();

// Routes
router.get('/total', getTotalViews);
router.get('/record/:userName', recordVisit);
router.get('/:userName', getVisits);
router.get('/analytics/top-performers', topVisitedPages);
router.get('/analytics/:userName', getVisitByPeriod);
router.get('/dummy/:records', generateDummyData);

export default router;
