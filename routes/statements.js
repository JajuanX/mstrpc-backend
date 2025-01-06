const express = require('express');
const router = express.Router();
const statementsController = require('../controllers/statements');
const authorize = require('../middleware/authorize');

// Routes
router.get('/', statementsController.getStatements);
router.post('/',authorize, statementsController.createStatement);
router.put('/', authorize, statementsController.updateStatement);
router.delete('/:id', authorize, statementsController.deleteStatement);
router.get('/:id', statementsController.getStatement);
router.get('/:id/users/:userid', statementsController.getStatementsByUser);

module.exports = router;