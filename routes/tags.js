import express from 'express';
import { getAll, generateTags } from '../controllers/tags.js';

const router = express.Router();

router.get('/', getAll);
router.post('/', generateTags);


export default router;
