const express = require('express');
const router = express.Router();
const practicalRecordController = require('../controllers/practicalRecord.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(verifyToken);

router.post('/', practicalRecordController.submit);
router.get('/my', practicalRecordController.getMyRecords);
router.get('/', authorize('faculty', 'admin'), practicalRecordController.getRecords);
router.put('/:id/grade', authorize('faculty', 'admin'), practicalRecordController.grade);

module.exports = router;

