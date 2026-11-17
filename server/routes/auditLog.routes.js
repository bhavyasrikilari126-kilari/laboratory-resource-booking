const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(verifyToken);
router.use(authorize('admin'));

router.get('/', auditLogController.getLogs);

module.exports = router;

