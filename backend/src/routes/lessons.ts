import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireInstructorOrAdmin, requireStudent, AuthRequest } from '../middleware/auth';
import { createLessonSchema, updateLessonSchema } from '../utils/validation';

const router = express.Router();

// GET all lessons for a course (public if course is published, otherwise instructor/admin only)
router.get('/courses/:courseId/lessons', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { isPublished: true, instructorId: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check access permissions
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role;

    // If course is not published, only instructor or admin can view
    if (!course.isPublished) {
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const isInstructor = userId === course.instructorId;
      const isAdmin = userRole === 'admin';
      
      if (!isInstructor && !isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to view unpublished course lessons' });
      }
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: [
        { orderIndex: 'asc' },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        title: true,
        content: true,
        videoUrl: true,
        orderIndex: true,
        createdAt: true,
        _count: {
          select: {
            progress: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: lessons,
      count: lessons.length
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single lesson by ID
router.get('/:id', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    if (isNaN(lessonId)) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            instructorId: true
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check access permissions
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role;

    // If course is not published, only instructor or admin can view
    if (!lesson.course.isPublished) {
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const isInstructor = userId === lesson.course.instructorId;
      const isAdmin = userRole === 'admin';
      
      if (!isInstructor && !isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to view this lesson' });
      }
    }

    // For students, check if they're enrolled in the course
    if (userId && userRole === 'student' && lesson.course.isPublished) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: lesson.course.id
          }
        }
      });

      if (!enrollment) {
        return res.status(403).json({ error: 'You must enroll in this course to view lessons' });
      }
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create a new lesson (instructors only)
router.post('/courses/:courseId/lessons', authenticate, requireInstructorOrAdmin, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    // Validate request body
    const validation = createLessonSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
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

    // Only course instructor or admin can add lessons
    if (course.instructorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to add lessons to this course' });
    }

    // Create the lesson
    const lessonData = validation.data;
    const lesson = await prisma.lesson.create({
      data: {
        ...lessonData,
        courseId
      } as any,
      include: {
        course: {
          select: {
            title: true,
            instructor: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update a lesson (instructors only)
router.put('/:id', authenticate, requireInstructorOrAdmin, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    if (isNaN(lessonId)) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    // Validate request body
    const validation = updateLessonSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;
    const userRole = authReq.user!.role;

    // Check if lesson exists and get course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { instructorId: true }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Only course instructor or admin can update lessons
    if (lesson.course.instructorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this lesson' });
    }

    // Update the lesson
    const updateData = validation.data;
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
      include: {
        course: {
          select: {
            title: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: updatedLesson
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a lesson (instructors only)
router.delete('/:id', authenticate, requireInstructorOrAdmin, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    if (isNaN(lessonId)) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;
    const userRole = authReq.user!.role;

    // Check if lesson exists and get course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { instructorId: true }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Only course instructor or admin can delete lessons
    if (lesson.course.instructorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this lesson' });
    }

    // Delete the lesson (cascade will handle related progress records)
    await prisma.lesson.delete({
      where: { id: lessonId }
    });

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET lesson progress for authenticated student
router.get('/:id/progress', authenticate, requireStudent, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    if (isNaN(lessonId)) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: lesson.courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this course to track progress' });
    }

    // Get or create progress record
    let progress = await prisma.progress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: userId,
          lessonId
        }
      }
    });

    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          studentId: userId,
          lessonId,
          completed: false
        }
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST mark lesson as completed
router.post('/:id/complete', authenticate, requireStudent, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    if (isNaN(lessonId)) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }

    const authReq = req as AuthRequest;
    const userId = authReq.user!.userId;

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: lesson.courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this course to mark lessons as completed' });
    }

    // Update or create progress record
    const progress = await prisma.progress.upsert({
      where: {
        studentId_lessonId: {
          studentId: userId,
          lessonId
        }
      },
      update: {
        completed: true,
        completedAt: new Date()
      },
      create: {
        studentId: userId,
        lessonId,
        completed: true,
        completedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      data: progress
    });
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;