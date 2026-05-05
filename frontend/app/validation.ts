import { z } from 'zod';

// Register form schema
export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(100, { message: 'Name must be less than 100 characters' }),
  email: z.string().email({ message: 'Invalid email address' }).max(100, { message: 'Email must be less than 100 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(100, { message: 'Password must be less than 100 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

// Quiz generation schema
export const quizSchema = z.object({
  courseId: z.string().nonempty({ message: 'Course is required' }),
  lessonId: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  numQuestions: z.number().int().min(1).max(20),
});

// Chat message schema
export const chatSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty' }).max(50000, { message: 'Message exceeds maximum length' }),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
});

// Summarizer schema
export const summarizeSchema = z.object({
  content: z.string().min(1, { message: 'Content cannot be empty' }).max(50000, { message: 'Content exceeds maximum length' }),
  length: z.enum(['short', 'medium', 'detailed'], { required_error: 'Select summary length' }),
});
