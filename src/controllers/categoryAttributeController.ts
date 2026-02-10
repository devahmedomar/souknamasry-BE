import type { Request, Response, NextFunction } from 'express';
import { CategoryAttributeService } from '../services/categoryAttributeService.js';
import { ResponseUtil } from '../utils/response.util.js';

/**
 * CategoryAttributeController
 * Handles HTTP requests for category attribute definitions.
 */
export class CategoryAttributeController {
  /**
   * GET /api/category-attributes/:categoryId/filters
   * Public: returns effective (inherited) filter definitions for a category.
   */
  static async getFilters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.params['categoryId'] as string;
      const filters = await CategoryAttributeService.getEffectiveFilters(categoryId);
      ResponseUtil.success(res, { filters });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/category-attributes/:categoryId
   * Admin: returns raw attribute definitions for one category (no inheritance).
   */
  static async getCategoryAttributesDefs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params['categoryId'] as string;
      const doc = await CategoryAttributeService.getCategoryAttributes(categoryId);
      ResponseUtil.success(res, { categoryAttributes: doc });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/category-attributes/:categoryId
   * Admin: create or fully replace attribute definitions for a category.
   */
  static async upsertCategoryAttributes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params['categoryId'] as string;
      const { attributes } = req.body;
      const doc = await CategoryAttributeService.upsertCategoryAttributes(categoryId, attributes);
      ResponseUtil.success(res, { categoryAttributes: doc });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/category-attributes/:categoryId
   * Admin: remove all attribute definitions for a category.
   */
  static async deleteCategoryAttributes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params['categoryId'] as string;
      await CategoryAttributeService.deleteCategoryAttributes(categoryId);
      ResponseUtil.success(res, { message: 'Category attributes deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
