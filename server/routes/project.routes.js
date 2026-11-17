const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);

router.use(verifyToken);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:memberId', projectController.removeMember);
router.post('/:id/milestones', projectController.addMilestone);
router.put('/:id/milestones/:milestoneId', projectController.updateMilestone);
router.delete('/:id/milestones/:milestoneId', projectController.deleteMilestone);
router.post('/:id/tasks', projectController.addTask);
router.put('/:id/tasks/:taskId', projectController.updateTask);
router.post('/:id/documents', projectController.addDocument);

module.exports = router;

