import { body, param } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Category Validation Rules
 */

/**
 * Create Category Validation
 * Validates category creation request data
 */
export const validateCreateCategory = [
  // Name validation
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),

  // Arabic name validation (optional)
  body('nameAr')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category Arabic name cannot exceed 100 characters'),

  // Description validation (optional)
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  // Arabic description validation (optional)
  body('descriptionAr')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Arabic description cannot exceed 500 characters'),

  // Image validation (optional)
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),

  // Parent validation (optional)
  body('parent')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Parent must be a valid category ID');
      }
      return true;
    }),

  // IsActive validation (optional)
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Update Category Validation
 * Validates category update request data
 */
export const validateUpdateCategory = [
  // ID param validation
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid category ID');
      }
      return true;
    }),

  // Name validation (optional for update)
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),

  // Arabic name validation (optional)
  body('nameAr')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category Arabic name cannot exceed 100 characters'),

  // Description validation (optional)
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  // Arabic description validation (optional)
  body('descriptionAr')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Arabic description cannot exceed 500 characters'),

  // Image validation (optional)
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),

  // Parent validation (optional)
  body('parent')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Parent must be a valid category ID');
      }
      return true;
    }),

  // IsActive validation (optional)
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Category ID Param Validation
 * Validates category ID in URL params
 */
export const validateCategoryId = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid category ID');
      }
      return true;
    }),
];

/**
 * Category Slug Param Validation
 * Validates category slug in URL params
 */
export const validateCategorySlug = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Category slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format'),
];
