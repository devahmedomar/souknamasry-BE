import type { Request, Response, NextFunction } from 'express';
import { ProductService, type ProductQueryParams, type AutocompleteQueryParams } from '../services/productService.js';
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

      // Category handling - support both single and array
      if (req.query.category) {
        const categoryParam = req.query.category;
        if (Array.isArray(categoryParam)) {
          queryParams.category = categoryParam as string[];
        } else {
          queryParams.category = categoryParam as string;
        }
      }

      // Alternative multi-category parameter (comma-separated or array)
      if (req.query.categories) {
        const categoriesParam = req.query.categories;
        if (Array.isArray(categoriesParam)) {
          queryParams.categories = categoriesParam as string[];
        } else if (typeof categoriesParam === 'string') {
          // Support comma-separated string: ?categories=id1,id2,id3
          queryParams.categories = categoriesParam.split(',').map(id => id.trim());
        }
      }

      if (req.query.minPrice) queryParams.minPrice = Number(req.query.minPrice);
      if (req.query.maxPrice) queryParams.maxPrice = Number(req.query.maxPrice);
      if (req.query.search) queryParams.search = req.query.search as string;
      if (req.query.page) queryParams.page = Number(req.query.page);
      if (req.query.limit) queryParams.limit = Number(req.query.limit);
      if (req.query.sort) queryParams.sort = req.query.sort as any;
      if (req.query.inStock !== undefined) {
        queryParams.inStock = req.query.inStock === 'true';
      }
      if (req.query.mannequinSlot) {
        queryParams.mannequinSlot = req.query.mannequinSlot as any;
      }

      // Parse dynamic attribute filters.
      // Handles two formats depending on query string parser:
      //   qs-parsed (extended):  req.query.attrs = { brand: 'samsung' }
      //   literal bracket (simple): req.query['attrs[brand]'] = 'samsung'
      const attrs: Record<string, any> = {};
      // Format 1: qs already parsed nested object
      if (req.query.attrs && typeof req.query.attrs === 'object' && !Array.isArray(req.query.attrs)) {
        Object.assign(attrs, req.query.attrs);
      }
      // Format 2: literal bracket keys not parsed by simple query parser
      for (const [qKey, qVal] of Object.entries(req.query)) {
        const simple = qKey.match(/^attrs\[([a-zA-Z0-9_]+)\]$/);
        const nested = qKey.match(/^attrs\[([a-zA-Z0-9_]+)\]\[([a-zA-Z0-9_]+)\]$/);
        if (simple && simple[1]) {
          attrs[simple[1]] = qVal;
        } else if (nested && nested[1] && nested[2]) {
          const attrKey = nested[1];
          const subKey = nested[2];
          if (typeof attrs[attrKey] !== 'object' || Array.isArray(attrs[attrKey])) {
            attrs[attrKey] = {};
          }
          (attrs[attrKey] as Record<string, any>)[subKey] = qVal;
        }
      }
      if (Object.keys(attrs).length > 0) {
        queryParams.attrs = attrs;
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
   * Get autocomplete suggestions for product search
   * GET /api/products/autocomplete
   * @param req - Express request with query parameter
   * @param res - Express response
   * @param next - Express next function
   */
  static async getAutocompleteSuggestions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const query = req.query.q as string;

      // Return empty suggestions if query is empty
      if (!query || query.trim().length === 0) {
        return ResponseUtil.success(res, { suggestions: [] });
      }

      // Build query params
      const queryParams: AutocompleteQueryParams = {
        query: query.trim(),
        limit: req.query.limit ? Number(req.query.limit) : 10,
        ...(req.query.category && { category: req.query.category as string }),
      };

      // Get suggestions from service
      const result = await ProductService.getAutocompleteSuggestions(queryParams);

      // Set cache headers for performance (5 minutes)
      res.setHeader('Cache-Control', 'public, max-age=300');

      // Return success response
      return ResponseUtil.success(res, result);
    } catch (error) {
      // Handle errors gracefully - return empty suggestions
      console.error('Autocomplete error:', error);
      return ResponseUtil.success(res, { suggestions: [] });
    }
  }

  /**
   * Get featured products for home page slider
   * GET /api/products/featured
   * @param req - Express request with optional limit query param
   * @param res - Express response
   * @param next - Express next function
   */
  static async getFeaturedProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const products = await ProductService.getFeaturedProducts(limit);

      return ResponseUtil.success(res, { products });
    } catch (error) {
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
   * Get sponsored products for home page slider
   * GET /api/products/sponsored
   * @param req - Express request with optional limit query param
   * @param res - Express response
   * @param next - Express next function
   */
  static async getSponsoredProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const products = await ProductService.getSponsoredProducts(limit);

      return ResponseUtil.success(res, { products });
    } catch (error) {
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

  /**
   * Get products by category path
   * GET /api/products/category/:level1/:level2?/:level3?/:level4?/:level5?
   * @param req - Express request with category path levels
   * @param res - Express response
   * @param next - Express next function
   */
  static async getProductsByCategoryPath(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Build the category path from level parameters
      const slugPath: string[] = [];

      // Collect all level parameters that exist
      for (let i = 1; i <= 5; i++) {
        const levelParam = req.params[`level${i}`];
        if (levelParam && levelParam.trim() !== '') {
          slugPath.push(levelParam.trim());
        }
      }

      // Validate that at least one level is provided
      if (slugPath.length === 0) {
        return ResponseUtil.fail(
          res,
          { path: ['Category path is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      // Extract query parameters
      const queryParams: ProductQueryParams = {};
      if (req.query.minPrice) queryParams.minPrice = Number(req.query.minPrice);
      if (req.query.maxPrice) queryParams.maxPrice = Number(req.query.maxPrice);
      if (req.query.search) queryParams.search = req.query.search as string;
      if (req.query.page) queryParams.page = Number(req.query.page);
      if (req.query.limit) queryParams.limit = Number(req.query.limit);
      if (req.query.sort) queryParams.sort = req.query.sort as any;
      if (req.query.inStock !== undefined) {
        queryParams.inStock = req.query.inStock === 'true';
      }

      // Parse dynamic attribute filters (same dual-format logic as getAllProducts)
      const attrsPath: Record<string, any> = {};
      if (req.query.attrs && typeof req.query.attrs === 'object' && !Array.isArray(req.query.attrs)) {
        Object.assign(attrsPath, req.query.attrs);
      }
      for (const [qKey, qVal] of Object.entries(req.query)) {
        const simple = qKey.match(/^attrs\[([a-zA-Z0-9_]+)\]$/);
        const nested = qKey.match(/^attrs\[([a-zA-Z0-9_]+)\]\[([a-zA-Z0-9_]+)\]$/);
        if (simple && simple[1]) {
          attrsPath[simple[1]] = qVal;
        } else if (nested && nested[1] && nested[2]) {
          const attrKey = nested[1];
          const subKey = nested[2];
          if (typeof attrsPath[attrKey] !== 'object' || Array.isArray(attrsPath[attrKey])) {
            attrsPath[attrKey] = {};
          }
          (attrsPath[attrKey] as Record<string, any>)[subKey] = qVal;
        }
      }
      if (Object.keys(attrsPath).length > 0) {
        queryParams.attrs = attrsPath;
      }

      // Check if should include subcategories (default: true for leaf categories)
      const includeSubcategories = req.query.includeSubcategories !== 'false';

      // Get products from service
      const result = await ProductService.getProductsByCategoryPath(
        slugPath,
        queryParams,
        includeSubcategories
      );

      // Return success response
      return ResponseUtil.success(res, result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'product.fetchFailed';

      if (errorMessage.includes('categoryNotFound')) {
        return ResponseUtil.fail(
          res,
          { category: ['Category not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

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
