import express from 'express';
import { getSong,  } from '../controllers/music.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Routes
router.post('/', authorize, getSong);

export default router;
