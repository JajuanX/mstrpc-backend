const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profile');
const authorize = require("../middleware/authorize");

// Routes
router.post('/', authorize, profilesController.createProfile);
router.put('/', authorize, profilesController.editProfile);
router.get('/random', profilesController.getRandomProfiles);
router.put('/relation', profilesController.updateProfileRelation);
router.get('/:username', profilesController.getProfile);

module.exports = router;