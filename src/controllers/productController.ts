import type { Request, Response, NextFunction } from 'express';
import { ProductService, type ProductQueryParams } from '../services/productService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { TranslatedResponseUtil } from '../utils/translatedResponse.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';

/**
 * Product Controller
 * Handles HTTP requests for product operations
 */
export class ProductController {
  /**
   * Get all products with filtering, search, and pagination
   * GET /api/products
   * @param req - Express request with query parameters
   * @param res - Express response
   * @param next - Express next function
   */
  static async getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Extract query parameters
      const queryParams: ProductQueryParams = {};

      if (req.query.category) queryParams.category = req.query.category as string;
      if (req.query.minPrice) queryParams.minPrice = Number(req.query.minPrice);
      if (req.query.maxPrice) queryParams.maxPrice = Number(req.query.maxPrice);
      if (req.query.search) queryParams.search = req.query.search as string;
      if (req.query.page) queryParams.page = Number(req.query.page);
      if (req.query.limit) queryParams.limit = Number(req.query.limit);
      if (req.query.sort) queryParams.sort = req.query.sort as any;
      if (req.query.inStock !== undefined) {
        queryParams.inStock = req.query.inStock === 'true';
      }

      // Get products from service
      const result = await ProductService.getAllProducts(queryParams);

      // Return success response
      return ResponseUtil.success(res, result);
    } catch (error) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : 'product.fetchFailed';

      return TranslatedResponseUtil.error(
        req,
        res,
        errorMessage,
        'PRODUCT_FETCH_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   * @param req - Express request with product ID
   * @param res - Express response
   * @param next - Express next function
   */
  static async getProductById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const { id } = req.params;

      // Validate ID exists
      if (!id) {
        return TranslatedResponseUtil.fail(
          req,
          res,
          { product: ['product.productNotFound'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      // Get product from service
      const product = await ProductService.getProductById(id);

      // Return success response
      return ResponseUtil.success(res, product);
    } catch (error) {
      // Handle product not found error
      const errorMessage =
        error instanceof Error ? error.message : 'product.fetchFailed';

      if (errorMessage.includes('productNotFound')) {
        return TranslatedResponseUtil.fail(
          req,
          res,
          { product: [errorMessage] },
          HttpStatusCode.NOT_FOUND
        );
      }

      // Handle other errors
      return TranslatedResponseUtil.error(
        req,
        res,
        errorMessage,
        'PRODUCT_FETCH_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get product by slug
   * GET /api/products/slug/:slug
   * @param req - Express request with product slug
   * @param res - Express response
   * @param next - Express next function
   */
  static async getProductBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const { slug } = req.params;

      // Validate slug exists
      if (!slug) {
        return TranslatedResponseUtil.fail(
          req,
          res,
          { product: ['product.productNotFound'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      // Get product from service
      const product = await ProductService.getProductBySlug(slug);

      // Return success response
      return ResponseUtil.success(res, product);
    } catch (error) {
      // Handle product not found error
      const errorMessage =
        error instanceof Error ? error.message : 'product.fetchFailed';

      if (errorMessage.includes('productNotFound')) {
        return TranslatedResponseUtil.fail(
          req,
          res,
          { product: [errorMessage] },
          HttpStatusCode.NOT_FOUND
        );
      }

      // Handle other errors
      return TranslatedResponseUtil.error(
        req,
        res,
        errorMessage,
        'PRODUCT_FETCH_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
