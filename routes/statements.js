import express from 'express';
import {
	getStatements,
	createStatement,
	updateStatement,
	deleteStatement,
	getStatement,
	getStatementsByUser,
} from '../controllers/statements.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Routes
router.get('/', getStatements);
router.post('/', authorize, createStatement);
router.put('/', authorize, updateStatement);
router.delete('/:id', authorize, deleteStatement);
router.get('/:id', getStatement);
router.get('/:id/users/:userid', getStatementsByUser);

export default router;
