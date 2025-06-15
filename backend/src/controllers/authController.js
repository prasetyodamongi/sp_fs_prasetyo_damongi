const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Helper untuk generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(newUser.id);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Gagal mendaftar' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Email tidak ditemukan' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Password salah' });

    const token = generateToken(user.id);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Gagal login' });
  }
};

// Get Profile (user by token)
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true },
    });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Gagal mengambil profil' });
  }
};

exports.searchUsers = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Query email diperlukan' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Gagal mencari user:', error);
    res.status(500).json({ error: 'Gagal mencari user' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(user);
  } catch (error) {
    console.error('Gagal mengambil user:', error);
    res.status(500).json({ error: 'Gagal mengambil user' });
  }
};