import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { ConflictError } from '../utils/errors/ConflictError.js';
import { ValidationError } from '../utils/errors/ValidationError.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';
import type { RegisterRequestDto, LoginRequestDto } from '../dtos/auth.dto.js';

/**
 * Authentication Controller
 * Thin orchestration layer - delegates business logic to AuthService
 * Handles HTTP concerns: request/response, error handling, status codes
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   * @param req - Express request with RegisterRequestDto in body
   * @param res - Express response
   * @param next - Express next function
   */
  static async register(
    req: Request<{}, {}, RegisterRequestDto>,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Extract registration data from request body
      const registerData: RegisterRequestDto = req.body;

      // Delegate business logic to service layer
      const authResponse = await AuthService.registerUser(registerData);

      // Return success response with 201 Created
      return ResponseUtil.created(res, authResponse);
    } catch (error) {
      // Handle specific error types
      if (error instanceof ConflictError) {
        // Email already exists - 409 Conflict
        return ResponseUtil.fail(
          res,
          { email: [error.message] },
          HttpStatusCode.CONFLICT
        );
      }

      if (error instanceof ValidationError) {
        // Validation error - 400 Bad Request
        return ResponseUtil.fail(
          res,
          { error: [error.message] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      // Database or unexpected errors - 500 Internal Server Error
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';

      return ResponseUtil.error(
        res,
        errorMessage,
        'REGISTRATION_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   * @param req - Express request with LoginRequestDto in body
   * @param res - Express response
   * @param next - Express next function
   */
  static async login(
    req: Request<{}, {}, LoginRequestDto>,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Extract login credentials from request body
      const { email, password } = req.body;

      // Delegate authentication to service layer
      const authResponse = await AuthService.loginUser(email, password);

      // Return success response with 200 OK
      return ResponseUtil.success(res, authResponse);
    } catch (error) {
      // Handle authentication errors
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication failed';

      // Invalid credentials - return 401 Unauthorized
      if (
        errorMessage.includes('Invalid') ||
        errorMessage.includes('deactivated')
      ) {
        return ResponseUtil.fail(
          res,
          { credentials: [errorMessage] },
          HttpStatusCode.UNAUTHORIZED
        );
      }

      // Unexpected errors - 500 Internal Server Error
      return ResponseUtil.error(
        res,
        errorMessage,
        'LOGIN_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
