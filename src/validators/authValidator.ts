import { body } from 'express-validator';

/**
 * Password Validation Rules
 * Implements strong password policy
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  UPPERCASE: /[A-Z]/,
  NUMBER: /[0-9]/,
  SPECIAL_CHAR: /[!@#$%^&*(),.?":{}|<>]/,
};

/**
 * Register Validation Rules
 * Validates user registration request data
 */
export const validateRegister = [
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  // Password validation with strength requirements
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
    .matches(PASSWORD_REGEX.UPPERCASE)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(PASSWORD_REGEX.NUMBER)
    .withMessage('Password must contain at least one number')
    .matches(PASSWORD_REGEX.SPECIAL_CHAR)
    .withMessage('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'),

  // First name validation
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  // Last name validation
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  // Phone validation (optional)
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s()+-]+$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
];

/**
 * Login Validation Rules
 * Validates user login request data
 */
export const validateLogin = [
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),

  // Password validation (basic, no strength check for login)
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
