import { query } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Product Search Validation Rules
 */

/**
 * Validate search query parameters
 */
export const validateSearchQuery = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query cannot exceed 200 characters')
    .matches(/^[^<>{}$]*$/)
    .withMessage('Search query contains invalid characters'),

  query('category')
    .optional()
    .custom((value) => {
      const ids = Array.isArray(value) ? value : [value];
      return ids.every((id: string) => mongoose.Types.ObjectId.isValid(id));
    })
    .withMessage('Invalid category ID format'),

  query('categories')
    .optional()
    .custom((value) => {
      let ids: string[];
      if (Array.isArray(value)) {
        ids = value;
      } else if (typeof value === 'string') {
        ids = value.split(',').map(id => id.trim());
      } else {
        return false;
      }
      return ids.every((id: string) => mongoose.Types.ObjectId.isValid(id));
    })
    .withMessage('Invalid categories format'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['newest', 'price-low', 'price-high', 'featured', 'relevance'])
    .withMessage('Invalid sort option'),

  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be a boolean value'),

  query('mannequinSlot')
    .optional()
    .isIn(['top', 'bottom', 'shoes'])
    .withMessage('Invalid mannequin slot'),
];

/**
 * Validate autocomplete query parameters
 */
export const validateAutocompleteQuery = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .matches(/^[^<>{}$]*$/)
    .withMessage('Search query contains invalid characters'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Limit must be between 1 and 10'),

  query('category')
    .optional()
    .custom((value) => {
      if (!value) return true;
      return mongoose.Types.ObjectId.isValid(value);
    })
    .withMessage('Invalid category ID format'),
];
