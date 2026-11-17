const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(verifyToken);

router.post('/', issueController.report);
router.get('/', issueController.getIssues);
router.get('/:id', issueController.getIssue);
router.put('/:id/assign', authorize('technician', 'admin'), issueController.assign);
router.put('/:id/status', authorize('technician', 'admin', 'faculty'), issueController.updateStatus);
router.put('/:id/resolve', authorize('technician', 'admin'), issueController.resolve);

module.exports = router;

