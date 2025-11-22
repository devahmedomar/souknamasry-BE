import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';

/**
 * Authentication Routes
 * Defines routes for user authentication endpoints
 * Route prefix: /api/auth
 */
const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { email, password, firstName, lastName, phone? }
 * @returns { status: 'success', data: { user, token } }
 */
router.post(
  '/register',
  validateRegister,           // Validate request body
  handleValidationErrors,     // Handle validation errors
  AuthController.register     // Controller handler
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 * @body    { email, password }
 * @returns { status: 'success', data: { user, token } }
 */
router.post(
  '/login',
  validateLogin,              // Validate request body
  handleValidationErrors,     // Handle validation errors
  AuthController.login        // Controller handler
);

export default router;
