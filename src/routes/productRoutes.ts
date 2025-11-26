import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

/**
 * Product Routes
 * Defines routes for product-related endpoints
 * Route prefix: /api/products
 */
const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, search, and pagination
 * @access  Public
 * @query   category (ObjectId)
 * @query   minPrice (Number)
 * @query   maxPrice (Number)
 * @query   search (String) - Search in name/description
 * @query   page (Number) - Default: 1
 * @query   limit (Number) - Default: 20, Max: 100
 * @query   sort (String) - newest, price-low, price-high, featured
 * @query   inStock (Boolean)
 * @returns {
 *   status: 'success',
 *   data: {
 *     products: [...],
 *     pagination: { total, page, pages, limit }
 *   }
 * }
 *
 * @example
 * GET /api/products?category=123&minPrice=10&maxPrice=100&page=1&limit=20&sort=price-low
 */
router.get('/', ProductController.getAllProducts);

/**
 * @route   GET /api/products/category/*
 * @desc    Get products by category path (nested slugs)
 * @access  Public
 * @param   path - Nested category path
 * @query   minPrice, maxPrice, search, page, limit, sort, inStock
 * @query   includeSubcategories (Boolean) - Include products from subcategories (default: true)
 * @returns { status: 'success', data: { products: [...], pagination: {...} } }
 *
 * @example URLs:
 * GET /api/products/category/electronics
 * GET /api/products/category/electronics/computers
 * GET /api/products/category/electronics/computers/laptops
 * GET /api/products/category/electronics/computers/laptops?page=1&limit=20&sort=price-low
 */
router.get('/category/*', ProductController.getProductsByCategoryPath);

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 * @param   slug - Product slug
 * @returns { status: 'success', data: product }
 */
router.get('/slug/:slug', ProductController.getProductBySlug);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 * @param   id - Product ID
 * @returns { status: 'success', data: product }
 */
router.get('/:id', ProductController.getProductById);

export default router;
