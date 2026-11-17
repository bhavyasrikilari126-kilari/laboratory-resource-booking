const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', equipmentController.getEquipment);
router.get('/:id', equipmentController.getEquipmentItem);

router.use(verifyToken);
router.post('/:id/reserve', authorize('student', 'faculty', 'admin'), equipmentController.reserveEquipment);
router.put('/:id/issue', authorize('technician', 'admin'), equipmentController.issueEquipment);
router.put('/:id/return', authorize('technician', 'admin'), equipmentController.returnEquipment);
router.post('/', authorize('admin'), equipmentController.createEquipment);
router.put('/:id', authorize('admin', 'technician'), equipmentController.updateEquipment);

module.exports = router;

