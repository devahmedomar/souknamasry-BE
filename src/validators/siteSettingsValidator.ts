import { body, param } from 'express-validator';

export const validateSetActiveTheme = [
  body('activeTheme')
    .trim()
    .notEmpty()
    .withMessage('activeTheme is required')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('activeTheme must be a lowercase slug (letters, numbers, underscores)'),
];

export const validateAddTheme = [
  body('key')
    .trim()
    .notEmpty()
    .withMessage('key is required')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('key must be a lowercase slug (letters, numbers, underscores)')
    .isLength({ max: 50 })
    .withMessage('key must be at most 50 characters'),
  body('nameAr')
    .trim()
    .notEmpty()
    .withMessage('nameAr is required')
    .isLength({ max: 100 })
    .withMessage('nameAr must be at most 100 characters'),
  body('nameEn')
    .trim()
    .notEmpty()
    .withMessage('nameEn is required')
    .isLength({ max: 100 })
    .withMessage('nameEn must be at most 100 characters'),
  body('isEnabled')
    .optional()
    .isBoolean()
    .withMessage('isEnabled must be a boolean'),
];

export const validateUpdateTheme = [
  param('key')
    .trim()
    .notEmpty()
    .withMessage('Theme key is required'),
  body('nameAr')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('nameAr cannot be empty')
    .isLength({ max: 100 })
    .withMessage('nameAr must be at most 100 characters'),
  body('nameEn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('nameEn cannot be empty')
    .isLength({ max: 100 })
    .withMessage('nameEn must be at most 100 characters'),
  body('isEnabled')
    .optional()
    .isBoolean()
    .withMessage('isEnabled must be a boolean'),
];

export const validateThemeKey = [
  param('key')
    .trim()
    .notEmpty()
    .withMessage('Theme key is required'),
];
