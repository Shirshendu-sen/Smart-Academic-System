import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
  avatarUrl?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export class UserService {
  // Create a new user
  static async createUser(data: CreateUserData) {
    const { password, ...userData } = data;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user in database
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      }
    });
    
    return user;
  }

  // Find user by ID
  static async findUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      }
    });
    
    return user;
  }

  // Find user by email
  static async findUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    return user;
  }

  // Update user
  static async updateUser(id: number, data: UpdateUserData) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      }
    });
    
    return user;
  }

  // Change password
  static async changePassword(id: number, currentPassword: string, newPassword: string) {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    
    return true;
  }

  // Delete user
  static async deleteUser(id: number) {
    await prisma.user.delete({
      where: { id },
    });
    
    return true;
  }

  // Verify credentials (for login)
  static async verifyCredentials(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Get all users (admin only)
  static async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  // Get users by role
  static async getUsersByRole(role: 'student' | 'instructor' | 'admin') {
    const users = await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return users;
  }

  // Check if email is available
  static async isEmailAvailable(email: string, excludeUserId?: number) {
    const where: any = { email };
    
    if (excludeUserId) {
      where.id = { not: excludeUserId };
    }
    
    const existingUser = await prisma.user.findFirst({
      where,
    });
    
    return !existingUser;
  }
}