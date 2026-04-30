import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { createCourseSchema, updateCourseSchema } from '../utils/validation';
import { z } from 'zod';

const router = express.Router();

// GET all published courses (public)
router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = { isPublished: true };
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limitNum,
        include: { 
          instructor: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              avatarUrl: true 
            } 
          },
          _count: {
            select: {
              lessons: true,
              enrollments: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);
    
    res.json({
      success: true,
      data: courses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// GET single course by ID (public)
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { 
        instructor: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            avatarUrl: true 
          } 
        },
        lessons: {
          where: { courseId },
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            orderIndex: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          }
        }
      },
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false,
        error: 'Course not found' 
      });
    }
    
    // Only return published courses to non-owners
    if (!course.isPublished && (!req.user || req.user.userId !== course.instructorId)) {
      return res.status(403).json({ 
        success: false,
        error: 'Course is not published' 
      });
    }
    
    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// CREATE a course (instructors only)
router.post('/', authenticate, authorize('instructor', 'admin'), async (req: AuthRequest, res) => {
  try {
    // Validate request body
    const validatedData = createCourseSchema.parse(req.body);
    const { title, description, thumbnailUrl } = validatedData;
    
    const course = await prisma.course.create({
      data: { 
        title, 
        description, 
        thumbnailUrl,
        instructorId: req.user!.userId 
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Create course error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// UPDATE a course (instructor who owns it or admin)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    // Check if course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false,
        error: 'Course not found' 
      });
    }
    
    // Check permission: instructor must own the course, admin can update any
    if (course.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to update this course' 
      });
    }
    
    // Validate request body
    const validatedData = updateCourseSchema.parse(req.body);
    
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: validatedData,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: updatedCourse,
      message: 'Course updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Update course error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// DELETE a course (instructor who owns it or admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    // Check if course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return res.status(404).json({ 
        success: false,
        error: 'Course not found' 
      });
    }
    
    // Check permission: instructor must own the course, admin can delete any
    if (course.instructorId !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to delete this course' 
      });
    }
    
    await prisma.course.delete({
      where: { id: courseId },
    });
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// GET courses created by current instructor
router.get('/instructor/my-courses', authenticate, authorize('instructor', 'admin'), async (req: AuthRequest, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user!.userId },
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

export default router;