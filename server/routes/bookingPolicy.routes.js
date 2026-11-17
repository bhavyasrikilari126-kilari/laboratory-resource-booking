const express = require('express');
const router = express.Router();
const bookingPolicyController = require('../controllers/bookingPolicy.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', bookingPolicyController.getPolicies);
router.get('/:id', bookingPolicyController.getPolicy);

router.use(verifyToken);
router.use(authorize('admin'));
router.post('/', bookingPolicyController.createPolicy);
router.put('/:id', bookingPolicyController.updatePolicy);
router.delete('/:id', bookingPolicyController.deletePolicy);

module.exports = router;

