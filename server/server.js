const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const departmentRoutes = require('./routes/department.routes');
const laboratoryRoutes = require('./routes/laboratory.routes');
const bookingRoutes = require('./routes/booking.routes');
const equipmentRoutes = require('./routes/equipment.routes');
const projectRoutes = require('./routes/project.routes');
const teamRoutes = require('./routes/team.routes');
const mentorshipRoutes = require('./routes/mentorship.routes');
const experimentRoutes = require('./routes/experiment.routes');
const learningMaterialRoutes = require('./routes/learningMaterial.routes');
const practicalRecordRoutes = require('./routes/practicalRecord.routes');
const issueRoutes = require('./routes/issue.routes');
const notificationRoutes = require('./routes/notification.routes');
const announcementRoutes = require('./routes/announcement.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const labPassRoutes = require('./routes/labPass.routes');
const aiRoutes = require('./routes/ai.routes');
const showcaseRoutes = require('./routes/showcase.routes');
const skillProfileRoutes = require('./routes/skillProfile.routes');
const waitingListRoutes = require('./routes/waitingList.routes');
const bookingPolicyRoutes = require('./routes/bookingPolicy.routes');
const auditLogRoutes = require('./routes/auditLog.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);
app.set('io', io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date(), uptime: process.uptime() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/labs', laboratoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/learning-materials', learningMaterialRoutes);
app.use('/api/practical-records', practicalRecordRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/lab-passes', labPassRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/showcase', showcaseRoutes);
app.use('/api/skill-profiles', skillProfileRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/booking-policies', bookingPolicyRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`SMARTLAB Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

module.exports = { app, server };

