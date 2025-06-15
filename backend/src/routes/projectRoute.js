const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const projectController = require('../controllers/projectController');

router.use(authenticateToken);

// GET semua project milik/diikuti user
router.get('/', projectController.getAllProjects);

// POST buat project baru
router.post('/', projectController.createProject);

// GET detail project + tasks + members
router.get('/:id', projectController.getProjectById);

// POST invite member berdasarkan email
router.post('/:projectId/invite', projectController.inviteMember);

router.post('/:projectId/remove-member', projectController.removeMember);

// DELETE project (hanya owner)
router.delete('/:id', projectController.deleteProject);

module.exports = router;
