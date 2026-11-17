const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', announcementController.getAnnouncements);
router.get('/:id', announcementController.getAnnouncement);

router.use(verifyToken);
router.post('/', authorize('faculty', 'admin'), announcementController.createAnnouncement);
router.put('/:id', authorize('faculty', 'admin'), announcementController.updateAnnouncement);
router.delete('/:id', authorize('faculty', 'admin'), announcementController.deleteAnnouncement);

module.exports = router;

