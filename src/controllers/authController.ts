import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { TranslatedResponseUtil } from '../utils/translatedResponse.util.js';
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
        // The error message is a translation key (e.g., 'auth.emailAlreadyRegistered')
        return TranslatedResponseUtil.fail(
          req,
          res,
          { email: [error.message] },
          HttpStatusCode.CONFLICT
        );
      }

      if (error instanceof ValidationError) {
        // Validation error - 400 Bad Request
        return TranslatedResponseUtil.fail(
          req,
          res,
          { error: [error.message] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      // Database or unexpected errors - 500 Internal Server Error
      const errorMessage =
        error instanceof Error ? error.message : 'auth.registrationFailed';

      return TranslatedResponseUtil.error(
        req,
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
        error instanceof Error ? error.message : 'auth.loginFailed';

      // Invalid credentials - return 401 Unauthorized
      // Error messages from service are now translation keys
      if (
        errorMessage.includes('invalidEmailOrPassword') ||
        errorMessage.includes('accountDeactivated')
      ) {
        return TranslatedResponseUtil.fail(
          req,
          res,
          { credentials: [errorMessage] },
          HttpStatusCode.UNAUTHORIZED
        );
      }

      // Unexpected errors - 500 Internal Server Error
      return TranslatedResponseUtil.error(
        req,
        res,
        errorMessage,
        'LOGIN_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/profile
   * @param req - Express request with user data from JWT middleware
   * @param res - Express response
   * @param next - Express next function
   * @returns User profile data (password excluded)
   */
  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Get userId from JWT token (set by verifyToken middleware)
      const userId = req.user?.userId;

      // Validate userId exists (should always exist if middleware works correctly)
      if (!userId) {
        return TranslatedResponseUtil.fail(
          req,
          res,
          { auth: ['auth.unauthorized'] },
          HttpStatusCode.UNAUTHORIZED
        );
      }

      // Fetch user profile from service
      const user = await AuthService.getUserProfile(userId);

      // Return success response with user profile
      return ResponseUtil.success(res, user);
    } catch (error) {
      // Handle user not found error
      const errorMessage =
        error instanceof Error ? error.message : 'auth.profileFetchFailed';

      if (errorMessage.includes('userNotFound')) {
        return TranslatedResponseUtil.fail(
          req,
          res,
          { user: [errorMessage] },
          HttpStatusCode.NOT_FOUND
        );
      }

      // Unexpected errors - 500 Internal Server Error
      return TranslatedResponseUtil.error(
        req,
        res,
        errorMessage,
        'PROFILE_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   * @param req - Express request with user data from JWT middleware
   * @param res - Express response
   * @param next - Express next function
   * @returns Success message (client should discard token)
   */
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Token is validated by verifyToken middleware
      // Client should discard the token after this response
      return ResponseUtil.success(res, { message: 'Logged out successfully' });
    } catch (error) {
      return TranslatedResponseUtil.error(
        req,
        res,
        'auth.logoutFailed',
        'LOGOUT_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
