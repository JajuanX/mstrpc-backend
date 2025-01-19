import express from 'express';
import authorize from '../middleware/authorize.js';
import visitor from '../middleware/visitor.js';
import createProfile from '../middleware/createProfile.js';
import createCustomer from '../middleware/createCustomer.js';
import {
	currentUser,
	createUser,
	loginUser,
	removeAdminRights,
	updateUserAdminRights,
	getUser,
	editUser,
	editUserProfile,
	getUserProfile,
	updateUserRelation,
} from '../controllers/users.js';

const router = express.Router();

// Routes
router.get('/current', authorize, currentUser);
router.post('/register', createProfile, createUser);
router.post('/login', loginUser);

router.delete('/admin/:id', authorize, removeAdminRights);
router.put('/admin/:id', authorize, updateUserAdminRights);

router.get('/:id', authorize, getUser);
router.put('/:id/field', authorize, editUser);

router.put('/profile/:id', authorize, editUserProfile);
router.get('/profile/:username', visitor, getUserProfile);

router.post('/relation', authorize, updateUserRelation);

export default router;
