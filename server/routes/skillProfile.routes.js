const express = require('express');
const router = express.Router();
const skillProfileController = require('../controllers/skillProfile.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/search', skillProfileController.searchStudents);

router.use(verifyToken);
router.get('/my', skillProfileController.getMyProfile);
router.put('/my', skillProfileController.updateProfile);

module.exports = router;

