import express from 'express';
import {
  getSubscribers,
  addSubscriber,
  removeSubscriber,
  exportSubscribersToCSV
} from '../controllers/subscriberController.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Define routes and attach controller functions
router.get('/', authorize, getSubscribers);
router.post('/add', authorize, addSubscriber);
router.delete('/remove', authorize, removeSubscriber);
router.get('/export', authorize, exportSubscribersToCSV);

export default router;
