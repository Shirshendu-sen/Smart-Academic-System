import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireStudent, requireInstructorOrAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET all enrollments for a student (their own enrollments)
router.get('/my-enrollments', authenticate, requireStudent, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
                email: true,
                avatarUrl: true
              }
            },
            _count: {
              select: {
                lessons: true,
                enrollments: true
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    res.json({
      success: true,
      data: enrollments,
      count: enrollments.length
    });
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all enrollments for a course (instructor/admin only)
router.get('/courses/:courseId/enrollments', authenticate, requireInstructorOrAdmin, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;
    const userRole = authReq.user!.role;

    // Check if course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Only course instructor or admin can view enrollments
    if (course.instructorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to view enrollments for this course' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    res.json({
      success: true,
      data: enrollments,
      count: enrollments.length
    });
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST enroll in a course (students only)
router.post('/courses/:courseId/enroll', authenticate, requireStudent, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { isPublished: true, instructorId: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.isPublished) {
      return res.status(403).json({ error: 'Cannot enroll in unpublished course' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: userId,
        courseId
      },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            instructor: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        student: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE unenroll from a course (students only)
router.delete('/courses/:courseId/unenroll', authenticate, requireStudent, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this course' });
    }

    // Delete enrollment (cascade will handle related progress records)
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET enrollment status for a course (for authenticated user)
router.get('/courses/:courseId/status', authenticate, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;
    const userRole = authReq.user!.role;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        isPublished: true,
        instructorId: true
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check enrollment status
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId
        }
      }
    });

    // For instructors/admins, check if they own the course
    let isInstructorOfCourse = false;
    if (userRole === 'instructor' || userRole === 'admin') {
      isInstructorOfCourse = course.instructorId === userId || userRole === 'admin';
    }

    res.json({
      success: true,
      data: {
        enrolled: !!enrollment,
        enrollmentDate: enrollment?.enrolledAt,
        isInstructorOfCourse,
        canEnroll: !enrollment && course.isPublished && userRole === 'student',
        coursePublished: course.isPublished
      }
    });
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET course progress for enrolled student
router.get('/courses/:courseId/progress', authenticate, requireStudent, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;

    // Check if enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this course to view progress' });
    }

    // Get all lessons for the course
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        orderIndex: true
      },
      orderBy: { orderIndex: 'asc' }
    });

    // Get progress for each lesson
    const lessonIds = lessons.map(lesson => lesson.id);
    const progressRecords = await prisma.progress.findMany({
      where: {
        studentId: userId,
        lessonId: { in: lessonIds }
      }
    });

    // Create a map of lessonId -> progress
    const progressMap = new Map();
    progressRecords.forEach(record => {
      progressMap.set(record.lessonId, record);
    });

    // Calculate overall progress
    const totalLessons = lessons.length;
    const completedLessons = progressRecords.filter(record => record.completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Format response with lesson details and progress
    const lessonsWithProgress = lessons.map(lesson => {
      const progress = progressMap.get(lesson.id);
      return {
        ...lesson,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt || null
      };
    });

    res.json({
      success: true,
      data: {
        courseId,
        totalLessons,
        completedLessons,
        progressPercentage,
        lessons: lessonsWithProgress,
        enrollmentDate: enrollment.enrolledAt
      }
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;