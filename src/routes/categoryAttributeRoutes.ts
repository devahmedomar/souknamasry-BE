import { Router } from 'express';
import { CategoryAttributeController } from '../controllers/categoryAttributeController.js';
import { validateCategoryAttributeId } from '../validators/categoryAttributeValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';

/**
 * Category Attribute Routes (Public)
 * Route prefix: /api/category-attributes
 */
const router = Router();

/**
 * GET /api/category-attributes/:categoryId/filters
 * Returns effective filter definitions for a category (including inherited parent attributes).
 * Used by the frontend to render dynamic filter UI.
 */
router.get(
  '/:categoryId/filters',
  validateCategoryAttributeId,
  handleValidationErrors,
  CategoryAttributeController.getFilters
);

export default router;
