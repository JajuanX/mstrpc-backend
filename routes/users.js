const authorize = require("../middleware/authorize");
const visitor = require("../middleware/visitor");
const createProfile = require("../middleware/createProfile");
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const createCustomer = require("../middleware/createCustomer");

// This route is '/users'
router.get('/current', authorize, usersController.currentUser);
router.post('/register', createProfile, usersController.createUser);
router.post('/login', usersController.loginUser);

router.delete('/admin/:id', authorize, usersController.removeAdminRights);
router.put('/admin/:id', authorize, usersController.updateUserAdminRights);

router.get('/:id', authorize, usersController.getUser);
router.put('/:id/field', authorize, usersController.editUser);

router.put('/profile/:id', authorize, usersController.editUserProfile);
router.get('/profile/:username', visitor, usersController.getUserProfile);

router.post('/relation', authorize, usersController.updateUserRelation);



module.exports = router;