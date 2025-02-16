import express from 'express';
import { generateInviteToken, getInvites } from '../controllers/invitation.js';
import authenticate from '../middleware/authorize.js';

const router = express.Router();

// Routes
router.post('/', authenticate, generateInviteToken);
router.get('/:userId', getInvites);

export default router;
