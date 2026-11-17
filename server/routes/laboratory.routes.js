const express = require('express');
const router = express.Router();
const laboratoryController = require('../controllers/laboratory.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', laboratoryController.getLabs);
router.get('/:id', laboratoryController.getLab);
router.get('/:id/availability', laboratoryController.getLabAvailability);

router.use(verifyToken);
router.post('/', authorize('admin'), laboratoryController.createLab);
router.put('/:id', authorize('admin', 'faculty'), laboratoryController.updateLab);
router.delete('/:id', authorize('admin'), laboratoryController.deleteLab);

module.exports = router;

