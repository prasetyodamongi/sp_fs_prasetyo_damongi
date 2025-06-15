const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middlewares/authMiddleware');

// Semua route task butuh autentikasi
router.use(authenticateToken);

// Create a new task
router.post('/project/:projectId', taskController.createTaskByProjectId);

// Get all tasks by project ID
router.get('/project/:projectId', taskController.getTasksByProject);

// Get a task by ID
router.get('/:id', taskController.getTaskById);

// Update a task
router.put('/:id', taskController.updateTask);

// Delete a task
router.delete('/:id', taskController.deleteTask);

module.exports = router;