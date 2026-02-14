import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { CategoryController } from '../controllers/categoryController.js';
import { CategoryAttributeController } from '../controllers/categoryAttributeController.js';
import { SiteSettingsController } from '../controllers/siteSettingsController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateUpdateUserRole,
  validateGetAllUsersQuery,
} from '../validators/userValidator.js';
import {
  validateCategoryAttributeId,
  validateUpsertCategoryAttributes,
} from '../validators/categoryAttributeValidator.js';
import {
  validateSetActiveTheme,
  validateAddTheme,
  validateUpdateTheme,
  validateThemeKey,
} from '../validators/siteSettingsValidator.js';

/**
 * Admin Routes
 * Defines routes for admin-only operations
 * Route prefix: /api/admin
 */
const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken, requireAdmin);

// ============== CATEGORY MANAGEMENT ==============

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     tags:
 *       - Admin - Categories
 *     summary: Get all categories including inactive (Admin only)
 *     description: Retrieve all categories with inactive ones included for admin management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parent
 *         schema:
 *           type: string
 *         description: Filter by parent category ID
 *       - in: query
 *         name: tree
 *         schema:
 *           type: boolean
 *         description: If true, returns hierarchical tree structure
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/categories', CategoryController.getAllCategories);

// ============== USER MANAGEMENT ==============

/**
 * @swagger
 * /api/admin/users/statistics:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get user statistics (Admin only)
 *     description: Get dashboard statistics including total users, active/inactive counts, and role distribution
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: number
 *                     activeUsers:
 *                       type: number
 *                     inactiveUsers:
 *                       type: number
 *                     totalAdmins:
 *                       type: number
 *                     totalCustomers:
 *                       type: number
 *                     recentUsers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/users/statistics', AdminController.getUserStatistics);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get all users with pagination (Admin only)
 *     description: Retrieve all users with optional filtering by role, active status, and search query
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, customer]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in email, firstName, lastName, phone
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/users',
  validateGetAllUsersQuery,
  handleValidationErrors,
  AdminController.getAllUsers
);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     tags:
 *       - Admin - Users
 *     summary: Create a new user (Admin only)
 *     description: Create a new user with specified role and details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: SecurePass123
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: John
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: +1234567890
 *               role:
 *                 type: string
 *                 enum: [admin, customer]
 *                 default: customer
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               city:
 *                 type: string
 *                 nullable: true
 *                 example: New York
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: Email already exists
 */
router.post(
  '/users',
  validateCreateUser,
  handleValidationErrors,
  AdminController.createUser
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get user by ID (Admin only)
 *     description: Retrieve detailed information about a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/users/:id',
  validateUserId,
  handleValidationErrors,
  AdminController.getUserById
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     tags:
 *       - Admin - Users
 *     summary: Update user (Admin only)
 *     description: Update user details including email, password, role, and profile information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               phone:
 *                 type: string
 *                 nullable: true
 *               role:
 *                 type: string
 *                 enum: [admin, customer]
 *               isActive:
 *                 type: boolean
 *               city:
 *                 type: string
 *                 nullable: true
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Email already exists
 */
router.put(
  '/users/:id',
  validateUpdateUser,
  handleValidationErrors,
  AdminController.updateUser
);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags:
 *       - Admin - Users
 *     summary: Update user role (Admin only)
 *     description: Change user role between admin and customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, customer]
 *     responses:
 *       200:
 *         description: User role updated successfully
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
  '/users/:id/role',
  validateUpdateUserRole,
  handleValidationErrors,
  AdminController.updateUserRole
);

/**
 * @swagger
 * /api/admin/users/{id}/deactivate:
 *   patch:
 *     tags:
 *       - Admin - Users
 *     summary: Deactivate user (Admin only)
 *     description: Soft delete a user by setting isActive to false
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/users/:id/deactivate',
  validateUserId,
  handleValidationErrors,
  AdminController.deactivateUser
);

/**
 * @swagger
 * /api/admin/users/{id}/activate:
 *   patch:
 *     tags:
 *       - Admin - Users
 *     summary: Activate user (Admin only)
 *     description: Activate a previously deactivated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId
 *     responses:
 *       200:
 *         description: User activated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/users/:id/activate',
  validateUserId,
  handleValidationErrors,
  AdminController.activateUser
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin - Users
 *     summary: Delete user permanently (Admin only)
 *     description: Permanently delete a user from the database
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/users/:id',
  validateUserId,
  handleValidationErrors,
  AdminController.deleteUser
);

// ============== STATISTICS ==============

/**
 * @swagger
 * /api/admin/statistics/dashboard:
 *   get:
 *     tags:
 *       - Admin - Statistics
 *     summary: Get comprehensive dashboard statistics
 *     description: Get all statistics including revenue, orders, products, users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/statistics/dashboard', AdminController.getDashboardStatistics);

/**
 * @swagger
 * /api/admin/statistics/revenue-trend:
 *   get:
 *     tags:
 *       - Admin - Statistics
 *     summary: Get revenue trends over time
 *     description: Get daily revenue data for specified number of days
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Revenue trends retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/statistics/revenue-trend', AdminController.getRevenueTrend);

/**
 * @swagger
 * /api/admin/statistics/sales-by-category:
 *   get:
 *     tags:
 *       - Admin - Statistics
 *     summary: Get sales breakdown by category
 *     description: Get category-wise sales data including revenue and order counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales data retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/statistics/sales-by-category', AdminController.getSalesByCategory);

// ============== PRODUCT MANAGEMENT ==============

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     tags:
 *       - Admin - Products
 *     summary: Get all products including inactive (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/products', AdminController.getAllProducts);

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     tags:
 *       - Admin - Products
 *     summary: Create new product (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/products', AdminController.createProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     tags:
 *       - Admin - Products
 *     summary: Update product (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/products/:id', AdminController.updateProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     tags:
 *       - Admin - Products
 *     summary: Delete product (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/products/:id', AdminController.deleteProduct);

/**
 * @swagger
 * /api/admin/products/{id}/stock:
 *   patch:
 *     tags:
 *       - Admin - Products
 *     summary: Update product stock (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stockQuantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/products/:id/stock', AdminController.updateProductStock);

/**
 * @swagger
 * /api/admin/products/{id}/toggle-active:
 *   patch:
 *     tags:
 *       - Admin - Products
 *     summary: Toggle product active status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/products/:id/toggle-active', AdminController.toggleProductActive);

/**
 * @swagger
 * /api/admin/products/{id}/featured:
 *   patch:
 *     tags:
 *       - Admin - Products
 *     summary: Toggle product featured status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isFeatured
 *             properties:
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product featured status updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/products/:id/featured', AdminController.toggleProductFeatured);

/**
 * @swagger
 * /api/admin/products/{id}/sponsored:
 *   patch:
 *     tags:
 *       - Admin - Products
 *     summary: Toggle product sponsored status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isSponsored
 *             properties:
 *               isSponsored:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product sponsored status updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/products/:id/sponsored', AdminController.toggleProductSponsored);

// ============== ORDER MANAGEMENT ==============

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     tags:
 *       - Admin - Orders
 *     summary: Get all orders (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, completed, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/orders', AdminController.getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     tags:
 *       - Admin - Orders
 *     summary: Get order by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/orders/:id', AdminController.getOrderById);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     tags:
 *       - Admin - Orders
 *     summary: Update order status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/orders/:id/status', AdminController.updateOrderStatus);

/**
 * @swagger
 * /api/admin/orders/{id}/payment-status:
 *   patch:
 *     tags:
 *       - Admin - Orders
 *     summary: Update payment status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded]
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/orders/:id/payment-status', AdminController.updatePaymentStatus);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   delete:
 *     tags:
 *       - Admin - Orders
 *     summary: Delete order (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/orders/:id', AdminController.deleteOrder);

// ============== CATEGORY ATTRIBUTE MANAGEMENT ==============

/**
 * GET /api/admin/category-attributes/:categoryId
 * Get raw attribute definitions for a category (no inheritance).
 */
router.get(
  '/category-attributes/:categoryId',
  validateCategoryAttributeId,
  handleValidationErrors,
  CategoryAttributeController.getCategoryAttributesDefs
);

/**
 * PUT /api/admin/category-attributes/:categoryId
 * Create or fully replace attribute definitions for a category.
 */
router.put(
  '/category-attributes/:categoryId',
  validateUpsertCategoryAttributes,
  handleValidationErrors,
  CategoryAttributeController.upsertCategoryAttributes
);

/**
 * DELETE /api/admin/category-attributes/:categoryId
 * Remove all attribute definitions for a category.
 */
router.delete(
  '/category-attributes/:categoryId',
  validateCategoryAttributeId,
  handleValidationErrors,
  CategoryAttributeController.deleteCategoryAttributes
);

// ============== SITE SETTINGS / THEME MANAGEMENT ==============

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     tags:
 *       - Admin - Settings
 *     summary: Get all site settings (Admin only)
 *     description: Returns the full settings document including the active theme and all available themes.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/settings', SiteSettingsController.getSettings);

/**
 * @swagger
 * /api/admin/settings/theme:
 *   patch:
 *     tags:
 *       - Admin - Settings
 *     summary: Set the active theme (Admin only)
 *     description: Changes the currently active theme. The theme must exist and be enabled.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activeTheme
 *             properties:
 *               activeTheme:
 *                 type: string
 *                 example: ramadan
 *     responses:
 *       200:
 *         description: Active theme updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch(
  '/settings/theme',
  validateSetActiveTheme,
  handleValidationErrors,
  SiteSettingsController.setActiveTheme
);

/**
 * @swagger
 * /api/admin/settings/themes:
 *   post:
 *     tags:
 *       - Admin - Settings
 *     summary: Add a new theme (Admin only)
 *     description: Creates a new custom theme. The key must be unique.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - nameAr
 *               - nameEn
 *             properties:
 *               key:
 *                 type: string
 *                 example: national_day
 *               nameAr:
 *                 type: string
 *                 example: اليوم الوطني
 *               nameEn:
 *                 type: string
 *                 example: National Day
 *               isEnabled:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Theme added successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/settings/themes',
  validateAddTheme,
  handleValidationErrors,
  SiteSettingsController.addTheme
);

/**
 * @swagger
 * /api/admin/settings/themes/{key}:
 *   put:
 *     tags:
 *       - Admin - Settings
 *     summary: Update a theme (Admin only)
 *     description: Updates the display names or enabled status of an existing theme.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme key slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameAr:
 *                 type: string
 *               nameEn:
 *                 type: string
 *               isEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Theme updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put(
  '/settings/themes/:key',
  validateUpdateTheme,
  handleValidationErrors,
  SiteSettingsController.updateTheme
);

/**
 * @swagger
 * /api/admin/settings/themes/{key}:
 *   delete:
 *     tags:
 *       - Admin - Settings
 *     summary: Delete a custom theme (Admin only)
 *     description: Removes a custom theme. Built-in themes and the active theme cannot be deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Theme key slug
 *     responses:
 *       200:
 *         description: Theme deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete(
  '/settings/themes/:key',
  validateThemeKey,
  handleValidationErrors,
  SiteSettingsController.deleteTheme
);

export default router;
