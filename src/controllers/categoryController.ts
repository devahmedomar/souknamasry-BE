import type { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';

/**
 * Category Controller
 * Handles HTTP requests for category operations
 */
export class CategoryController {
  /**
   * Get all categories with optional filtering
   * @route GET /api/categories
   * @query parent - Optional parent category ID to filter subcategories
   * @query tree - If 'true', returns hierarchical tree structure
   * @query includeInactive - If 'true', includes inactive categories (admin only)
   */
  static async getAllCategories(req: Request, res: Response): Promise<Response> {
    try {
      const { parent, tree, includeInactive } = req.query;

      // Check if user is admin when includeInactive is requested
      const isAdmin = (req as any).user?.role === 'admin';
      const shouldIncludeInactive = includeInactive === 'true' && isAdmin;

      // If tree structure is requested
      if (tree === 'true') {
        const categoryTree = await CategoryService.getCategoryTree();
        return ResponseUtil.success(res, { categories: categoryTree });
      }

      // If root categories are requested
      if (!parent && tree !== 'true') {
        const categories = await CategoryService.getAllCategories(
          undefined,
          shouldIncludeInactive
        );
        return ResponseUtil.success(res, { categories });
      }

      // Get categories by parent
      const categories = await CategoryService.getAllCategories(
        parent as string,
        shouldIncludeInactive
      );

      return ResponseUtil.success(res, { categories });
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve categories',
        'CATEGORY_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get root categories only
   * @route GET /api/categories/root
   */
  static async getRootCategories(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await CategoryService.getRootCategories();
      return ResponseUtil.success(res, { categories });
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve root categories',
        'CATEGORY_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get category tree (hierarchical structure)
   * @route GET /api/categories/tree
   */
  static async getCategoryTree(req: Request, res: Response): Promise<Response> {
    try {
      const categoryTree = await CategoryService.getCategoryTree();
      return ResponseUtil.success(res, { categories: categoryTree });
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve category tree',
        'CATEGORY_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get category by ID
   * @route GET /api/categories/:id
   * @param id - Category ID
   */
  static async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Category ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const category = await CategoryService.getCategoryById(id);
      return ResponseUtil.success(res, { category });
    } catch (error) {
      if (error instanceof Error && error.message === 'category.categoryNotFound') {
        return ResponseUtil.fail(
          res,
          { category: ['Category not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to retrieve category',
        'CATEGORY_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get category by slug
   * @route GET /api/categories/slug/:slug
   * @param slug - Category slug
   */
  static async getCategoryBySlug(req: Request, res: Response): Promise<Response> {
    try {
      const { slug } = req.params;

      if (!slug) {
        return ResponseUtil.fail(
          res,
          { slug: ['Category slug is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const category = await CategoryService.getCategoryBySlug(slug);
      return ResponseUtil.success(res, { category });
    } catch (error) {
      if (error instanceof Error && error.message === 'category.categoryNotFound') {
        return ResponseUtil.fail(
          res,
          { category: ['Category not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to retrieve category',
        'CATEGORY_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get category by path (nested slugs)
   * Supports nested URLs like: /categories/electronics/computers/laptops
   * @route GET /api/categories/path/:level1/:level2?/:level3?/:level4?/:level5?
   * @param level1-5 - Category path segments
   */
  static async getCategoryByPath(req: Request, res: Response): Promise<Response> {
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

      const result = await CategoryService.getCategoryByPath(slugPath);
      return ResponseUtil.success(res, result);
    } catch (error) {
      if (error instanceof Error && error.message === 'category.categoryNotFound') {
        return ResponseUtil.fail(
          res,
          { category: ['Category not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      if (error instanceof Error && error.message === 'category.invalidPath') {
        return ResponseUtil.fail(
          res,
          { path: ['Invalid category path'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to retrieve category',
        'CATEGORY_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get category breadcrumb
   * @route GET /api/categories/:id/breadcrumb
   * @param id - Category ID
   */
  static async getCategoryBreadcrumb(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Category ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const breadcrumb = await CategoryService.getCategoryBreadcrumb(id);
      return ResponseUtil.success(res, { breadcrumb });
    } catch (error) {
      return ResponseUtil.error(
        res,
        'Failed to retrieve category breadcrumb',
        'CATEGORY_FETCH_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create new category
   * @route POST /api/categories
   * @access Admin only
   */
  static async createCategory(req: Request, res: Response): Promise<Response> {
    try {
      const categoryData = req.body;
      const category = await CategoryService.createCategory(categoryData);

      return ResponseUtil.success(res, { category }, HttpStatusCode.CREATED);
    } catch (error) {
      if (error instanceof Error && error.message === 'category.parentNotFound') {
        return ResponseUtil.fail(
          res,
          { parent: ['Parent category not found'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      if (error instanceof Error && error.message.includes('Circular reference')) {
        return ResponseUtil.fail(
          res,
          { parent: ['Circular reference detected: A category cannot be a parent of itself'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      // Handle duplicate name error
      if (error instanceof Error && (error as any).code === 11000) {
        return ResponseUtil.fail(
          res,
          { name: ['Category name already exists'] },
          HttpStatusCode.CONFLICT
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to create category',
        'CATEGORY_CREATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update category
   * @route PUT /api/categories/:id
   * @access Admin only
   * @param id - Category ID
   */
  static async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Category ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const category = await CategoryService.updateCategory(id, updateData);
      return ResponseUtil.success(res, { category });
    } catch (error) {
      if (error instanceof Error && error.message === 'category.categoryNotFound') {
        return ResponseUtil.fail(
          res,
          { category: ['Category not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      if (error instanceof Error && error.message === 'category.parentNotFound') {
        return ResponseUtil.fail(
          res,
          { parent: ['Parent category not found'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      if (error instanceof Error && error.message.includes('Circular reference')) {
        return ResponseUtil.fail(
          res,
          { parent: ['Circular reference detected: A category cannot be a parent of itself'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      // Handle duplicate name error
      if (error instanceof Error && (error as any).code === 11000) {
        return ResponseUtil.fail(
          res,
          { name: ['Category name already exists'] },
          HttpStatusCode.CONFLICT
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to update category',
        'CATEGORY_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Delete category
   * @route DELETE /api/categories/:id
   * @access Admin only
   * @param id - Category ID
   */
  static async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Category ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      await CategoryService.deleteCategory(id);
      return ResponseUtil.success(res, { message: 'Category deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'category.categoryNotFound') {
        return ResponseUtil.fail(
          res,
          { category: ['Category not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      if (error instanceof Error && error.message === 'category.hasChildren') {
        return ResponseUtil.fail(
          res,
          { category: ['Cannot delete category with subcategories'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      if (error instanceof Error && error.message === 'category.hasProducts') {
        return ResponseUtil.fail(
          res,
          { category: ['Cannot delete category with associated products'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to delete category',
        'CATEGORY_DELETE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Deactivate category (soft delete)
   * @route PATCH /api/categories/:id/deactivate
   * @access Admin only
   * @param id - Category ID
   */
  static async deactivateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Category ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const category = await CategoryService.deactivateCategory(id);
      return ResponseUtil.success(res, { category });
    } catch (error) {
      if (error instanceof Error && error.message === 'category.categoryNotFound') {
        return ResponseUtil.fail(
          res,
          { category: ['Category not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to deactivate category',
        'CATEGORY_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Activate category
   * @route PATCH /api/categories/:id/activate
   * @access Admin only
   * @param id - Category ID
   */
  static async activateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseUtil.fail(
          res,
          { id: ['Category ID is required'] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      const category = await CategoryService.activateCategory(id);
      return ResponseUtil.success(res, { category });
    } catch (error) {
      if (error instanceof Error && error.message === 'category.categoryNotFound') {
        return ResponseUtil.fail(
          res,
          { category: ['Category not found'] },
          HttpStatusCode.NOT_FOUND
        );
      }

      return ResponseUtil.error(
        res,
        'Failed to activate category',
        'CATEGORY_UPDATE_ERROR',
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
