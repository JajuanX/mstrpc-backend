import express from 'express';
import { generateInviteToken } from '../controllers/invitation.js';

const router = express.Router();

// Routes
router.post('/', generateInviteToken);

export default router;
