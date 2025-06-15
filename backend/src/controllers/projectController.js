const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dapatkan semua project milik user (owner atau member)
exports.getAllProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId }
            }
          }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (err) {
    console.error('Error getAllProjects:', err);
    res.status(500).json({ error: 'Gagal mengambil daftar project' });
  }
};

// Buat project baru
exports.createProject = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        ownerId: userId,
      },
    });
    res.status(201).json(project);
  } catch (err) {
    console.error('Error createProject:', err);
    res.status(500).json({ error: 'Gagal membuat project' });
  }
};

// Detail project (termasuk task dan member)
exports.getProjectById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
          include: {
            assignee: { select: { id: true, email: true, name: true } }
          }
        },
        members: {
          include: {
            user: { select: { id: true, email: true } }
          }
        }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });

    const isOwner = project.ownerId === userId;
    const isMember = project.members.some(m => m.userId === userId);
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    res.json(project);
  } catch (err) {
    console.error('Error getProjectById:', err);
    res.status(500).json({ error: 'Gagal mengambil detail project' });
  }
};

// Invite member ke project (berdasarkan email)
exports.inviteMember = async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const alreadyMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: user.id
      }
    });

    if (alreadyMember) {
      return res.status(400).json({ error: 'User already a member' });
    }

    await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id
      }
    });

    res.json({ message: 'User added successfully' });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
};

exports.removeMember = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  try {
    // Get project with owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ownerId: true,
      },
    });

    if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });

    // Update all tasks where assigneeId === userId to ownerId
    await prisma.task.updateMany({
      where: {
        projectId,
        assigneeId: userId,
      },
      data: {
        assigneeId: project.ownerId,
      },
    });

    // Delete membership
    await prisma.projectMember.deleteMany({
      where: {
        projectId,
        userId,
      },
    });

    res.json({ message: 'Anggota berhasil dihapus dan tugas dipindahkan ke owner' });
  } catch (error) {
    console.error('Gagal menghapus anggota:', error);
    res.status(500).json({ error: 'Gagal menghapus anggota' });
  }
};


// Hapus project (hanya owner)
exports.deleteProject = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) return res.status(404).json({ error: 'Project tidak ditemukan' });
    if (project.ownerId !== userId) return res.status(403).json({ error: 'Hanya owner yang bisa menghapus project' });

    await prisma.project.delete({ where: { id } });

    res.json({ message: 'Project berhasil dihapus' });
  } catch (err) {
    console.error('Error deleteProject:', err);
    res.status(500).json({ error: 'Gagal menghapus project' });
  }
};