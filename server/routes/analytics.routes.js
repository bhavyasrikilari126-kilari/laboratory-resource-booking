const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(verifyToken);
router.use(authorize('admin', 'faculty'));

router.get('/overview', analyticsController.getOverview);
router.get('/lab-utilization', analyticsController.getLabUtilization);
router.get('/equipment-usage', analyticsController.getEquipmentUsage);
router.get('/booking-trends', analyticsController.getBookingTrends);
router.get('/department-stats', analyticsController.getDepartmentStats);

module.exports = router;

