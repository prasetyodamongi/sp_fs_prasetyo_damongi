const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Task
exports.createTaskByProjectId = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assigneeId } = req.body;
  const userId = req.user.id;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: 'TODO',
        projectId,
        assigneeId: assigneeId || userId,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Failed to create task:', error);
    res.status(500).json({ error: 'Gagal membuat tugas' });
  }
};


// Get All Tasks for a Project
exports.getTasksByProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get One Task
exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, assigneeId } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        assigneeId,
      },
    });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};