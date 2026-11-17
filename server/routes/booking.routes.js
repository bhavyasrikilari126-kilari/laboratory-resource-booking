const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(verifyToken);

router.post('/', authorize('student', 'admin'), bookingController.createBooking);
router.get('/', authorize('faculty', 'admin', 'technician'), bookingController.getBookings);
router.get('/my/all', bookingController.getMyBookings);
router.get('/my/upcoming', bookingController.getMyUpcoming);
router.get('/:id', bookingController.getBooking);
router.put('/:id/approve', authorize('faculty', 'admin'), bookingController.approveBooking);
router.put('/:id/reject', authorize('faculty', 'admin'), bookingController.rejectBooking);
router.put('/:id/cancel', bookingController.cancelBooking);
router.put('/:id/check-in', authorize('technician', 'faculty', 'admin', 'student'), bookingController.checkIn);
router.put('/:id/check-out', authorize('technician', 'faculty', 'admin'), bookingController.checkOut);

module.exports = router;

