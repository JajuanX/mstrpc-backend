import express from 'express';
import { getUserVotes } from '../controllers/votes.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// GET /votes/user-votes: Retrieves the list of article IDs the current user has upvoted
router.get('/user-votes', authorize, getUserVotes);

export default router;
