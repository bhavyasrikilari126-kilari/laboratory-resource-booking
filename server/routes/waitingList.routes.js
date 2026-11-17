const express = require('express');
const router = express.Router();
const waitingListController = require('../controllers/waitingList.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', waitingListController.join);
router.get('/my', waitingListController.getMyWaitingList);
router.delete('/:id', waitingListController.leave);
router.put('/:id/accept', waitingListController.accept);

module.exports = router;

