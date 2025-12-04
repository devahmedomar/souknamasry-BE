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
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories - Public
 *     summary: Get all categories with optional filtering
 *     description: Retrieve all categories with optional filtering by parent, tree view, or including inactive categories
 *     parameters:
 *       - in: query
 *         name: parent
 *         schema:
 *           type: string
 *         description: Filter by parent category ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: tree
 *         schema:
 *           type: boolean
 *         description: If true, returns hierarchical tree structure
 *         example: true
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, includes inactive categories
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 */
router.get('/', CategoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/root:
 *   get:
 *     tags:
 *       - Categories - Public
 *     summary: Get root categories only
 *     description: Retrieve only top-level categories (categories without a parent)
 *     responses:
 *       200:
 *         description: Root categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 */
router.get('/root', CategoryController.getRootCategories);

/**
 * @swagger
 * /api/categories/tree:
 *   get:
 *     tags:
 *       - Categories - Public
 *     summary: Get category tree (hierarchical structure)
 *     description: Retrieve all categories in a hierarchical tree structure with nested children
 *     responses:
 *       200:
 *         description: Category tree retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           children:
 *                             type: array
 *                             items:
 *                               type: object
 *                               description: Nested category objects with same structure
 */
router.get('/tree', CategoryController.getCategoryTree);

/**
 * @swagger
 * /api/categories/path/{level1}/{level2}/{level3}/{level4}/{level5}:
 *   get:
 *     tags:
 *       - Categories - Public
 *     summary: Get category by nested path
 *     description: Retrieve a category using its hierarchical path of slugs. Supports up to 5 levels of nesting. Returns category details, children, breadcrumb, and metadata.
 *     parameters:
 *       - in: path
 *         name: level1
 *         required: true
 *         schema:
 *           type: string
 *         description: First level category slug
 *         example: electronics
 *       - in: path
 *         name: level2
 *         required: false
 *         schema:
 *           type: string
 *         description: Second level category slug
 *         example: computers
 *       - in: path
 *         name: level3
 *         required: false
 *         schema:
 *           type: string
 *         description: Third level category slug
 *         example: laptops
 *       - in: path
 *         name: level4
 *         required: false
 *         schema:
 *           type: string
 *         description: Fourth level category slug
 *       - in: path
 *         name: level5
 *         required: false
 *         schema:
 *           type: string
 *         description: Fifth level category slug
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *                     children:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *                     breadcrumb:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *                     isLeaf:
 *                       type: boolean
 *                       description: True if category has no children
 *                     hasProducts:
 *                       type: boolean
 *                       description: True if category contains products
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// Support up to 5 levels of category nesting
router.get('/path/:level1/:level2/:level3/:level4/:level5', CategoryController.getCategoryByPath);
router.get('/path/:level1/:level2/:level3/:level4', CategoryController.getCategoryByPath);
router.get('/path/:level1/:level2/:level3', CategoryController.getCategoryByPath);
router.get('/path/:level1/:level2', CategoryController.getCategoryByPath);
router.get('/path/:level1', CategoryController.getCategoryByPath);

/**
 * @swagger
 * /api/categories/slug/{slug}:
 *   get:
 *     tags:
 *       - Categories - Public
 *     summary: Get category by slug (single level)
 *     description: Retrieve a category using its URL-friendly slug identifier
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *         example: electronics
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  '/slug/:slug',
  validateCategorySlug,
  handleValidationErrors,
  CategoryController.getCategoryBySlug
);

/**
 * @swagger
 * /api/categories/{id}/breadcrumb:
 *   get:
 *     tags:
 *       - Categories - Public
 *     summary: Get category breadcrumb
 *     description: Retrieve the breadcrumb path from root to the specified category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Breadcrumb retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     breadcrumb:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get(
  '/:id/breadcrumb',
  validateCategoryId,
  handleValidationErrors,
  CategoryController.getCategoryBreadcrumb
);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Categories - Public
 *     summary: Get category by ID
 *     description: Retrieve a single category by MongoDB ObjectId with parent and children information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *                     children:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
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
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Categories - Admin
 *     summary: Create a new category (Admin only)
 *     description: Create a new category (root or nested). Can specify parent for subcategories. Name must be unique.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Electronics
 *                 description: Category name (must be unique)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: Electronic devices and accessories
 *               image:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: https://example.com/electronics.jpg
 *               parent:
 *                 type: string
 *                 nullable: true
 *                 description: Parent category ID (null or omit for root category)
 *                 example: 507f1f77bcf86cd799439011
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: Category name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Category name already exists
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
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags:
 *       - Categories - Admin
 *     summary: Update a category (Admin only)
 *     description: Update category details including name, description, image, parent, or active status. Can move category to different parent.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Electronics & Gadgets
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               image:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               parent:
 *                 type: string
 *                 nullable: true
 *                 description: Change parent category (move category)
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 * @swagger
 * /api/categories/{id}/deactivate:
 *   patch:
 *     tags:
 *       - Categories - Admin
 *     summary: Deactivate category (Admin only)
 *     description: Soft delete a category by setting isActive to false. Category remains in database but is hidden from public views.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Category deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 * @swagger
 * /api/categories/{id}/activate:
 *   patch:
 *     tags:
 *       - Categories - Admin
 *     summary: Activate category (Admin only)
 *     description: Activate a previously deactivated category by setting isActive to true
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Category activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags:
 *       - Categories - Admin
 *     summary: Delete category permanently (Admin only)
 *     description: Permanently delete a category from the database. Only allows deletion if category has no children.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       400:
 *         description: Category has children or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Cannot delete category with subcategories
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
