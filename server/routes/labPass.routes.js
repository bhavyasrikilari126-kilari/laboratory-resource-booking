const express = require('express');
const router = express.Router();
const labPassController = require('../controllers/labPass.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(verifyToken);

router.get('/my', labPassController.getMyPasses);
router.get('/booking/:bookingId', labPassController.getPassForBooking);
router.post('/verify', authorize('technician', 'faculty', 'admin'), labPassController.verifyPass);

module.exports = router;

