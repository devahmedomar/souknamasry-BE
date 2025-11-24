import type { Request, Response, NextFunction } from 'express';
import { JwtUtil, type IJwtPayload } from '../utils/jwt.util.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

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
    if (error instanceof TokenExpiredError) {
      return ResponseUtil.fail(
        res,
        {
          token: ['Token has expired. Please login again.'],
          expiredAt: [error.expiredAt.toISOString()]
        },
        HttpStatusCode.FORBIDDEN
      );
    }

    // Handle invalid token (malformed, invalid signature, etc.)
    if (error instanceof JsonWebTokenError) {
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
