import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
  validateCategorySlug,
} from '../validators/categoryValidator.js';

/**
 * Category Routes
 * Defines routes for category-related endpoints
 * Route prefix: /api/categories
 */
const router = Router();

/**
 * Public Routes
 * These routes are accessible without authentication
 */

/**
 * @route   GET /api/categories
 * @desc    Get all categories with optional filtering
 * @access  Public
 * @query   parent (ObjectId) - Filter by parent category
 * @query   tree (Boolean) - If 'true', returns hierarchical tree structure
 * @query   includeInactive (Boolean) - If 'true', includes inactive categories
 * @returns {
 *   status: 'success',
 *   data: {
 *     categories: [...]
 *   }
 * }
 *
 * @example
 * GET /api/categories - Get all root categories
 * GET /api/categories?parent=123 - Get subcategories of category 123
 * GET /api/categories?tree=true - Get category tree structure
 */
router.get('/', CategoryController.getAllCategories);

/**
 * @route   GET /api/categories/root
 * @desc    Get root categories only (categories without parent)
 * @access  Public
 * @returns { status: 'success', data: { categories: [...] } }
 */
router.get('/root', CategoryController.getRootCategories);

/**
 * @route   GET /api/categories/tree
 * @desc    Get category tree (hierarchical structure)
 * @access  Public
 * @returns { status: 'success', data: { categories: [...] } }
 *
 * @example Response:
 * {
 *   status: 'success',
 *   data: {
 *     categories: [
 *       {
 *         _id: '1',
 *         name: 'Electronics',
 *         children: [
 *           {
 *             _id: '2',
 *             name: 'Computers',
 *             children: [...]
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 */
router.get('/tree', CategoryController.getCategoryTree);

/**
 * @route   GET /api/categories/path/*
 * @desc    Get category by nested path (supports unlimited nesting)
 * @access  Public
 * @param   path - Nested category path (e.g., electronics/computers/laptops)
 * @returns {
 *   status: 'success',
 *   data: {
 *     category: {...},
 *     children: [...],
 *     breadcrumb: [...],
 *     isLeaf: boolean,
 *     hasProducts: boolean
 *   }
 * }
 *
 * @example URLs:
 * GET /api/categories/path/electronics
 * GET /api/categories/path/electronics/computers
 * GET /api/categories/path/electronics/computers/laptops
 *
 * @example Response (with subcategories):
 * {
 *   status: 'success',
 *   data: {
 *     category: { _id: '2', name: 'Computers', slug: 'computers', ... },
 *     children: [
 *       { _id: '3', name: 'Laptops', slug: 'laptops', ... },
 *       { _id: '4', name: 'Desktops', slug: 'desktops', ... }
 *     ],
 *     breadcrumb: [
 *       { _id: '1', name: 'Electronics', slug: 'electronics' },
 *       { _id: '2', name: 'Computers', slug: 'computers' }
 *     ],
 *     isLeaf: false,
 *     hasProducts: false
 *   }
 * }
 *
 * @example Response (leaf category - shows products):
 * {
 *   status: 'success',
 *   data: {
 *     category: { _id: '3', name: 'Laptops', slug: 'laptops', ... },
 *     children: [],
 *     breadcrumb: [...],
 *     isLeaf: true,
 *     hasProducts: true
 *   }
 * }
 */
router.get('/path/*', CategoryController.getCategoryByPath);

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Get category by slug (single level)
 * @access  Public
 * @param   slug - Category slug
 * @returns { status: 'success', data: { category: {...} } }
 */
router.get(
  '/slug/:slug',
  validateCategorySlug,
  handleValidationErrors,
  CategoryController.getCategoryBySlug
);

/**
 * @route   GET /api/categories/:id/breadcrumb
 * @desc    Get category breadcrumb (path from root to category)
 * @access  Public
 * @param   id - Category ID
 * @returns { status: 'success', data: { breadcrumb: [...] } }
 *
 * @example Response:
 * {
 *   status: 'success',
 *   data: {
 *     breadcrumb: [
 *       { _id: '1', name: 'Electronics', slug: 'electronics' },
 *       { _id: '2', name: 'Computers', slug: 'computers' },
 *       { _id: '3', name: 'Laptops', slug: 'laptops' }
 *     ]
 *   }
 * }
 */
router.get(
  '/:id/breadcrumb',
  validateCategoryId,
  handleValidationErrors,
  CategoryController.getCategoryBreadcrumb
);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID with parent and children
 * @access  Public
 * @param   id - Category ID
 * @returns { status: 'success', data: { category: {...}, children: [...] } }
 */
router.get(
  '/:id',
  validateCategoryId,
  handleValidationErrors,
  CategoryController.getCategoryById
);

/**
 * Protected Routes (Admin Only)
 * Requires both authentication (verifyToken) and admin role (requireAdmin)
 */

/**
 * @route   POST /api/categories
 * @desc    Create new category (root or nested)
 * @access  Admin only
 * @body    name (String, required) - Category name
 * @body    description (String, optional) - Category description
 * @body    image (String, optional) - Category image URL
 * @body    parent (ObjectId, optional) - Parent category ID (null/omit for root category)
 * @body    isActive (Boolean, optional) - Active status (default: true)
 * @returns { status: 'success', data: { category: {...} } }
 *
 * @example Create Root Category:
 * POST /api/categories
 * {
 *   "name": "Electronics",
 *   "description": "Electronic devices and gadgets",
 *   "image": "https://example.com/electronics.jpg"
 * }
 *
 * @example Create Subcategory:
 * POST /api/categories
 * {
 *   "name": "Computers",
 *   "description": "Desktop and laptop computers",
 *   "parent": "64a1b2c3d4e5f6a7b8c9d0e1",
 *   "image": "https://example.com/computers.jpg"
 * }
 *
 * @example Create Sub-subcategory:
 * POST /api/categories
 * {
 *   "name": "Gaming Laptops",
 *   "description": "High-performance gaming laptops",
 *   "parent": "64a1b2c3d4e5f6a7b8c9d0e2",
 *   "image": "https://example.com/gaming-laptops.jpg"
 * }
 */
router.post(
  '/',
  verifyToken,
  requireAdmin,
  validateCreateCategory,
  handleValidationErrors,
  CategoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (including moving to different parent)
 * @access  Admin only
 * @param   id - Category ID
 * @body    name (String, optional) - Category name
 * @body    description (String, optional) - Category description
 * @body    image (String, optional) - Category image URL
 * @body    parent (ObjectId, optional) - Parent category ID (change parent/move category)
 * @body    isActive (Boolean, optional) - Active status
 * @returns { status: 'success', data: { category: {...} } }
 *
 * @example Move category to different parent:
 * PUT /api/categories/64a1b2c3d4e5f6a7b8c9d0e3
 * {
 *   "parent": "64a1b2c3d4e5f6a7b8c9d0e1"
 * }
 */
router.put(
  '/:id',
  verifyToken,
  requireAdmin,
  validateUpdateCategory,
  handleValidationErrors,
  CategoryController.updateCategory
);

/**
 * @route   PATCH /api/categories/:id/deactivate
 * @desc    Deactivate category (soft delete)
 * @access  Admin only
 * @param   id - Category ID
 * @returns { status: 'success', data: { category: {...} } }
 */
router.patch(
  '/:id/deactivate',
  verifyToken,
  requireAdmin,
  validateCategoryId,
  handleValidationErrors,
  CategoryController.deactivateCategory
);

/**
 * @route   PATCH /api/categories/:id/activate
 * @desc    Activate category
 * @access  Admin only
 * @param   id - Category ID
 * @returns { status: 'success', data: { category: {...} } }
 */
router.patch(
  '/:id/activate',
  verifyToken,
  requireAdmin,
  validateCategoryId,
  handleValidationErrors,
  CategoryController.activateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (permanent)
 * @access  Admin only
 * @param   id - Category ID
 * @returns { status: 'success', message: 'Category deleted successfully' }
 * @note    Only allows deletion if category has no children
 */
router.delete(
  '/:id',
  verifyToken,
  requireAdmin,
  validateCategoryId,
  handleValidationErrors,
  CategoryController.deleteCategory
);

export default router;
