const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorship.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/mentors', mentorshipController.getFacultyMentors);

router.use(verifyToken);
router.post('/appointments', mentorshipController.createAppointment);
router.get('/appointments/my', mentorshipController.getMyAppointments);
router.put('/appointments/:id/status', mentorshipController.updateAppointmentStatus);

module.exports = router;

