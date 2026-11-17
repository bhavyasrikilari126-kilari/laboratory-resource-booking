const express = require('express');
const router = express.Router();
const learningMaterialController = require('../controllers/learningMaterial.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', learningMaterialController.getMaterials);
router.get('/:id', learningMaterialController.getMaterial);

router.use(verifyToken);
router.post('/', authorize('faculty', 'admin'), learningMaterialController.createMaterial);
router.put('/:id', authorize('faculty', 'admin'), learningMaterialController.updateMaterial);
router.delete('/:id', authorize('faculty', 'admin'), learningMaterialController.deleteMaterial);

module.exports = router;

