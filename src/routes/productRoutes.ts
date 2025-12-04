import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

/**
 * Product Routes
 * Defines routes for product-related endpoints
 * Route prefix: /api/products
 */
const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products - Public
 *     summary: Get all products with filtering and pagination
 *     description: Retrieve a paginated list of products with optional filters for category, price range, search terms, stock status, and sorting options
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *         example: 10
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *         example: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for product name and description
 *         example: wireless mouse
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page (max 100)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, price-low, price-high, featured]
 *           default: newest
 *         description: Sort order for products
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock availability
 *         example: true
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/', ProductController.getAllProducts);

/**
 * @swagger
 * /api/products/category/{level1}/{level2}/{level3}/{level4}/{level5}:
 *   get:
 *     tags:
 *       - Products - Public
 *     summary: Get products by nested category path
 *     description: Retrieve products filtered by hierarchical category path using slugs. Supports up to 5 levels of nesting. Can include products from subcategories.
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
 *       - in: query
 *         name: includeSubcategories
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include products from child categories
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *           maximum: 100
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, price-low, price-high, featured]
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// Support up to 5 levels of category nesting
router.get('/category/:level1/:level2/:level3/:level4/:level5', ProductController.getProductsByCategoryPath);
router.get('/category/:level1/:level2/:level3/:level4', ProductController.getProductsByCategoryPath);
router.get('/category/:level1/:level2/:level3', ProductController.getProductsByCategoryPath);
router.get('/category/:level1/:level2', ProductController.getProductsByCategoryPath);
router.get('/category/:level1', ProductController.getProductsByCategoryPath);

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     tags:
 *       - Products - Public
 *     summary: Get product by slug
 *     description: Retrieve a single product using its URL-friendly slug identifier
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product slug (URL-friendly identifier)
 *         example: wireless-mouse
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/slug/:slug', ProductController.getProductBySlug);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products - Public
 *     summary: Get product by ID
 *     description: Retrieve a single product using its MongoDB ObjectId
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product MongoDB ObjectId
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', ProductController.getProductById);

export default router;
