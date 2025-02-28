import express from 'express';
import sendNewsletter from '../controllers/newsletter.js';

const router = express.Router();


router.get('/', sendNewsletter);

export default router;
