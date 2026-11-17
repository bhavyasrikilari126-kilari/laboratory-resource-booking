const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/recommend', aiController.recommend);
router.get('/search', aiController.search);
router.post('/estimate-resources', aiController.estimateResources);

module.exports = router;

