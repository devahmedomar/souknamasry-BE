import { body } from 'express-validator';

/**
 * Password Validation Rules
 * Simple password policy for ease of use
 */
const PASSWORD_MIN_LENGTH = 6;

/**
 * Egyptian Phone Number Regex
 * Matches: +201XXXXXXXXX, 01XXXXXXXXX, 201XXXXXXXXX
 * Valid prefixes: 010, 011, 012, 015 (Egyptian mobile carriers)
 */
const EGYPTIAN_PHONE_REGEX = /^(\+20|0|20)?1[0125][0-9]{8}$/;

/**
 * Register Validation Rules
 * Validates user registration request data
 */
export const validateRegister = [
  // Phone validation
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(EGYPTIAN_PHONE_REGEX)
    .withMessage('Please provide a valid Egyptian phone number (e.g., 01012345678)'),

  // Password validation (simple - just minimum length)
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`),

  // First name validation (allows Arabic and English)
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  // Last name validation (allows Arabic and English)
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  // Email validation (optional - can be added later)
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
];

/**
 * Login Validation Rules
 * Validates user login request data
 * Uses phone number instead of email
 */
export const validateLogin = [
  // Phone validation
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(EGYPTIAN_PHONE_REGEX)
    .withMessage('Please provide a valid Egyptian phone number'),

  // Password validation (basic, no strength check for login)
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
