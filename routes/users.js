import express from 'express';
import authorize from '../middleware/authorize.js';
import visitor from '../middleware/visitor.js';
import createProfile from '../middleware/createProfile.js';
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
	getUserStatementsPagination,
	getUserArticlesPagination,
	getUsers,
	forgotPassword,
	resetPassword,
} from '../controllers/users.js';

const router = express.Router();

router.post('/register', createProfile, createUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/current', authorize, currentUser);
router.get('/', getUsers);
router.post('/relation', authorize, updateUserRelation);

router.put('/admin/:id', authorize, updateUserAdminRights);
router.delete('/admin/:id', authorize, removeAdminRights);

router.put('/profile/:id', authorize, editUserProfile);
router.get('/profile/:username', visitor, getUserProfile);

router.get('/:username/articles', getUserArticlesPagination);
router.get('/:username/statements', getUserStatementsPagination);

router.get('/:id', authorize, getUser);
router.put('/:id/field', authorize, editUser);

export default router;
