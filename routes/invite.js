import express from 'express';
import { deleteInviteIfUnused, generateInviteToken, getInvites } from '../controllers/invitation.js';
import authenticate from '../middleware/authorize.js';

const router = express.Router();

// Routes
router.post('/', authenticate, generateInviteToken);
router.get('/', authenticate, getInvites);
router.delete('/:inviteToken', authenticate, deleteInviteIfUnused);

export default router;
