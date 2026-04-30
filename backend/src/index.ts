import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import lessonRoutes from './routes/lessons';
import enrollmentRoutes from './routes/enrollments';
import { authenticate, requireAdmin } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'smart-lms-backend',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Protected admin route example
app.get('/api/admin/stats', authenticate, requireAdmin, (req, res) => {
  res.json({
    message: 'Admin statistics',
    data: {
      totalUsers: 0, // Would come from database
      totalCourses: 0,
      totalEnrollments: 0,
    }
  });
});

// Protected user route example
app.get('/api/user/dashboard', authenticate, (req, res) => {
  res.json({
    message: 'User dashboard',
    userId: req.user?.userId,
    role: req.user?.role,
    data: {
      enrolledCourses: [],
      progress: {},
      upcomingQuizzes: [],
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📖 Course endpoints: http://localhost:${PORT}/api/courses`);
  console.log(`📝 Lesson endpoints: http://localhost:${PORT}/api/lessons`);
  console.log(`🎓 Enrollment endpoints: http://localhost:${PORT}/api/enrollments`);
});

export default app;