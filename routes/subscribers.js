import express from 'express';
import {
	getSubscribers,
	addSubscriber,
	removeSubscriber,
	exportSubscribersToCSV
} from '../controllers/subscribers.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Define routes and attach controller functions
router.get('/', authorize, getSubscribers);
router.post('/', addSubscriber);
router.delete('/', authorize, removeSubscriber);
router.get('/export', authorize, exportSubscribersToCSV);

export default router;
