const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experiment.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', experimentController.getExperiments);
router.get('/:id', experimentController.getExperiment);

router.use(verifyToken);
router.post('/', authorize('faculty', 'admin'), experimentController.createExperiment);
router.put('/:id', authorize('faculty', 'admin'), experimentController.updateExperiment);
router.delete('/:id', authorize('faculty', 'admin'), experimentController.deleteExperiment);

module.exports = router;

