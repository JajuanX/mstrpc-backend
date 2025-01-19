import express from 'express';
import { createUpload } from '../controllers/uploads.js';

const router = express.Router();

// Routes
router.post('/', createUpload);
// Uncomment and implement the delete route if needed
// router.delete('/:id', deleteArticle);

export default router;
