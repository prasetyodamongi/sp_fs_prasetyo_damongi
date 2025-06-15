const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoute');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoute');
app.use('/api/users', userRoutes);

const projectRoutes = require('./routes/projectRoute');
app.use('/api/projects', projectRoutes);

const taskRoutes = require('./routes/taskRoute');
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => res.send('API is running'));

module.exports = app;