const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', teamController.getTeams);
router.get('/find', teamController.findTeams);
router.get('/:id', teamController.getTeam);

router.use(verifyToken);
router.post('/', teamController.createTeam);
router.put('/:id', teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);
router.post('/:id/invite', teamController.inviteMember);
router.put('/:id/respond', teamController.respondToInvitation);

module.exports = router;

