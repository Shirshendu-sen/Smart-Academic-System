import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request to include user info
export interface AuthRequest extends Request {
  user?: { 
    userId: number; 
    role: string;
    email?: string;
  };
}

// Verify JWT token on every protected route
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided. Format: Bearer <token>' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expired' 
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Restrict routes to specific roles (e.g., only instructors can create courses)
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }
    
    next();
  };
};

// Convenience middleware for specific roles
export const requireStudent = authorize('student');
export const requireInstructor = authorize('instructor');
export const requireAdmin = authorize('admin');
export const requireInstructorOrAdmin = authorize('instructor', 'admin');

// Optional authentication (sets user if token exists, but doesn't fail if not)
export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token, continue without user
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return next(); // No token, continue without user
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (error) {
    // Token is invalid, but we don't fail the request
    // Just continue without user attached
    next();
  }
};