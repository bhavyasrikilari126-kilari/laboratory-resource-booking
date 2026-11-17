const express = require('express');
const router = express.Router();
const showcaseController = require('../controllers/showcase.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', showcaseController.getShowcases);
router.get('/featured', showcaseController.getFeatured);
router.get('/:id', showcaseController.getShowcase);

router.use(verifyToken);
router.post('/', showcaseController.createShowcase);
router.put('/:id', showcaseController.updateShowcase);
router.delete('/:id', showcaseController.deleteShowcase);
router.post('/:id/like', showcaseController.likeShowcase);
router.post('/:id/feedback', showcaseController.addFeedback);

module.exports = router;

