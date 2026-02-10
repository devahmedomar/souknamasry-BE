import { body, param } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Validate the categoryId path param
 */
export const validateCategoryAttributeId = [
  param('categoryId')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid category ID format'),
];

/**
 * Validate the body for PUT /admin/category-attributes/:categoryId
 */
export const validateUpsertCategoryAttributes = [
  param('categoryId')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid category ID format'),

  body('attributes')
    .isArray()
    .withMessage('attributes must be an array'),

  body('attributes.*.key')
    .trim()
    .notEmpty()
    .withMessage('Attribute key is required')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Attribute key must contain only lowercase letters, numbers, and underscores'),

  body('attributes.*.label')
    .trim()
    .notEmpty()
    .withMessage('Attribute label is required')
    .isLength({ max: 100 })
    .withMessage('Attribute label cannot exceed 100 characters'),

  body('attributes.*.labelAr')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Attribute Arabic label cannot exceed 100 characters'),

  body('attributes.*.type')
    .isIn(['select', 'multi-select', 'number-range'])
    .withMessage('Attribute type must be select, multi-select, or number-range'),

  body('attributes.*.options')
    .optional()
    .isArray()
    .withMessage('Attribute options must be an array'),

  body('attributes.*.options.*.value')
    .trim()
    .notEmpty()
    .withMessage('Option value is required'),

  body('attributes.*.unit')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Unit cannot exceed 20 characters'),

  body('attributes.*.min')
    .optional()
    .isNumeric()
    .withMessage('min must be a number'),

  body('attributes.*.max')
    .optional()
    .isNumeric()
    .withMessage('max must be a number'),

  body('attributes.*.filterable')
    .optional()
    .isBoolean()
    .withMessage('filterable must be a boolean'),

  body('attributes.*.required')
    .optional()
    .isBoolean()
    .withMessage('required must be a boolean'),

  body('attributes.*.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('order must be a non-negative integer'),
];
