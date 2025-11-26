import type { Request, Response, NextFunction } from 'express';
import { JwtUtil, type IJwtPayload } from '../utils/jwt.util.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';
import { UserRole } from '../types/user.types.js';

/**
 * Extend Express Request to include user property
 * Adds decoded JWT payload to request object
 */
declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user data to request
 *
 * @middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns 401 if no token provided, 403 if token invalid/expired
 *
 * @example
 * // Protect a route
 * router.get('/profile', verifyToken, UserController.getProfile);
 *
 * @example
 * // Access user data in controller
 * const userId = req.user?.userId;
 * const userRole = req.user?.role;
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      return ResponseUtil.fail(
        res,
        { token: ['Authorization header is required'] },
        HttpStatusCode.UNAUTHORIZED
      );
    }

    // Check if token follows Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return ResponseUtil.fail(
        res,
        { token: ['Authorization header must be in format: Bearer {token}'] },
        HttpStatusCode.UNAUTHORIZED
      );
    }

    // Extract token from "Bearer {token}" format
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Validate token is not empty
    if (!token || token.trim() === '') {
      return ResponseUtil.fail(
        res,
        { token: ['Token cannot be empty'] },
        HttpStatusCode.UNAUTHORIZED
      );
    }

    // Verify and decode token
    const decoded = JwtUtil.verifyToken(token);

    // Attach user data to request object
    req.user = decoded;

    // Proceed to next middleware/controller
    next();
  } catch (error) {
    // Handle token expiration
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return ResponseUtil.fail(
        res,
        {
          token: ['Token has expired. Please login again.'],
          expiredAt: [(error as any).expiredAt?.toISOString() || 'unknown']
        },
        HttpStatusCode.FORBIDDEN
      );
    }

    // Handle invalid token (malformed, invalid signature, etc.)
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return ResponseUtil.fail(
        res,
        { token: ['Invalid token. Authentication failed.'] },
        HttpStatusCode.FORBIDDEN
      );
    }

    // Handle unexpected errors
    return ResponseUtil.error(
      res,
      'Authentication failed due to an unexpected error',
      'AUTH_ERROR',
      undefined,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Admin Authorization Middleware
 * Verifies that the authenticated user has admin role
 * MUST be used after verifyToken middleware
 *
 * @middleware
 * @param req - Express request object (with user data from verifyToken)
 * @param res - Express response object
 * @param next - Express next function
 * @returns 403 if user is not an admin
 *
 * @example
 * // Protect an admin route
 * router.post('/admin/categories', verifyToken, requireAdmin, CategoryController.createCategory);
 *
 * @example
 * // Access user data in controller
 * const userId = req.user?.userId;
 * const userRole = req.user?.role; // Will be 'admin'
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  try {
    // Check if user data exists (should be set by verifyToken middleware)
    if (!req.user) {
      return ResponseUtil.fail(
        res,
        { auth: ['Authentication required. Please login first.'] },
        HttpStatusCode.UNAUTHORIZED
      );
    }

    // Check if user has admin role
    if (req.user.role !== UserRole.ADMIN) {
      return ResponseUtil.fail(
        res,
        { auth: ['Access denied. Admin privileges required.'] },
        HttpStatusCode.FORBIDDEN
      );
    }

    // User is admin, proceed to next middleware/controller
    next();
  } catch (error) {
    // Handle unexpected errors
    return ResponseUtil.error(
      res,
      'Authorization failed due to an unexpected error',
      'AUTH_ERROR',
      undefined,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Role-based Authorization Middleware Factory
 * Creates middleware that checks if user has one of the specified roles
 * MUST be used after verifyToken middleware
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 *
 * @example
 * // Allow both admin and customer
 * router.get('/profile', verifyToken, requireRole([UserRole.ADMIN, UserRole.CUSTOMER]), UserController.getProfile);
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      // Check if user data exists
      if (!req.user) {
        return ResponseUtil.fail(
          res,
          { auth: ['Authentication required. Please login first.'] },
          HttpStatusCode.UNAUTHORIZED
        );
      }

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return ResponseUtil.fail(
          res,
          { auth: ['Access denied. Insufficient privileges.'] },
          HttpStatusCode.FORBIDDEN
        );
      }

      // User has required role, proceed
      next();
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Authorization failed due to an unexpected error',
        'AUTH_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };
};
