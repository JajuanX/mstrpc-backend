import express from 'express';
import { getOpengraph } from '../controllers/opengraph.js';

const router = express.Router();

// Routes
router.post('/', getOpengraph);

export default router;
