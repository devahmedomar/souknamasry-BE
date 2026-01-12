import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import { UserRole } from '../types/user.types.js';

/**
 * User Validation Rules (Admin)
 */

/**
 * Create User Validation (Admin)
 * Validates user creation request data
 */
export const validateCreateUser = [
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  // First name validation
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  // Last name validation
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  // Phone validation (optional)
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),

  // Role validation
  body('role')
    .optional()
    .isIn([UserRole.ADMIN, UserRole.CUSTOMER])
    .withMessage('Role must be either admin or customer'),

  // IsActive validation (optional)
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  // City validation (optional)
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  // Image URL validation (optional)
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

/**
 * Update User Validation (Admin)
 * Validates user update request data
 */
export const validateUpdateUser = [
  // ID param validation
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid user ID');
      }
      return true;
    }),

  // Email validation (optional for update)
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  // Password validation (optional for update)
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  // First name validation (optional)
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  // Last name validation (optional)
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  // Phone validation (optional)
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),

  // Role validation (optional)
  body('role')
    .optional()
    .isIn([UserRole.ADMIN, UserRole.CUSTOMER])
    .withMessage('Role must be either admin or customer'),

  // IsActive validation (optional)
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  // City validation (optional)
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  // Image URL validation (optional)
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

/**
 * User ID Param Validation
 * Validates user ID in URL params
 */
export const validateUserId = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid user ID');
      }
      return true;
    }),
];

/**
 * Update User Role Validation
 * Validates role update request
 */
export const validateUpdateUserRole = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid user ID');
      }
      return true;
    }),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn([UserRole.ADMIN, UserRole.CUSTOMER])
    .withMessage('Role must be either admin or customer'),
];

/**
 * Get All Users Query Validation
 * Validates query parameters for listing users
 */
export const validateGetAllUsersQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('role')
    .optional()
    .isIn([UserRole.ADMIN, UserRole.CUSTOMER])
    .withMessage('Role must be either admin or customer'),

  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];
