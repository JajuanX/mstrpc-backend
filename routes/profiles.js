import express from 'express';
import {
	createProfile,
	editProfile,
	getRandomProfiles,
	updateProfileRelation,
	getProfile,
} from '../controllers/profile.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Routes
router.post('/', authorize, createProfile);
router.put('/', authorize, editProfile);
router.get('/random', getRandomProfiles);
router.put('/relation', authorize, updateProfileRelation);
router.get('/:username', getProfile);

export default router;
