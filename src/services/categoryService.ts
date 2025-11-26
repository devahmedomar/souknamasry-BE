import { Category } from '../models/Category.js';
import type { ICategory } from '../types/category.types.js';
import type { Types } from 'mongoose';

/**
 * Category Service
 * Handles business logic for category operations including hierarchical queries
 */
export class CategoryService {
  /**
   * Get all root categories (categories without parent)
   * @returns Array of root categories
   */
  static async getRootCategories(): Promise<any[]> {
    return await Category.find({ parent: null, isActive: true })
      .select('name slug description image')
      .sort({ name: 1 })
      .lean();
  }

  /**
   * Get all categories with optional parent filter
   * @param parentId - Optional parent category ID to filter subcategories
   * @param includeInactive - Whether to include inactive categories
   * @returns Array of categories
   */
  static async getAllCategories(
    parentId?: string,
    includeInactive: boolean = false
  ): Promise<any[]> {
    const filter: any = {};

    if (parentId) {
      filter.parent = parentId;
    }

    if (!includeInactive) {
      filter.isActive = true;
    }

    return await Category.find(filter)
      .populate('parent', 'name slug')
      .select('name slug description image parent isActive')
      .sort({ name: 1 })
      .lean();
  }

  /**
   * Get category tree (hierarchical structure)
   * Builds a nested tree of all categories
   * @returns Hierarchical category tree
   */
  static async getCategoryTree(): Promise<any[]> {
    // Get all active categories
    const allCategories = await Category.find({ isActive: true })
      .select('name slug description image parent')
      .sort({ name: 1 })
      .lean();

    // Build tree structure
    const categoryMap = new Map();
    const tree: any[] = [];

    // First pass: create map of all categories
    allCategories.forEach((category) => {
      categoryMap.set(category._id.toString(), {
        ...category,
        children: [],
      });
    });

    // Second pass: build tree structure
    allCategories.forEach((category) => {
      const node = categoryMap.get(category._id.toString());
      if (category.parent) {
        const parent = categoryMap.get(category.parent.toString());
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not found or inactive, add to root
          tree.push(node);
        }
      } else {
        // Root category
        tree.push(node);
      }
    });

    return tree;
  }

  /**
   * Get category by ID with parent and children
   * @param categoryId - Category ID
   * @returns Category with parent and children
   */
  static async getCategoryById(categoryId: string): Promise<any> {
    const category = await Category.findById(categoryId)
      .populate('parent', 'name slug description image')
      .lean();

    if (!category) {
      throw new Error('category.categoryNotFound');
    }

    // Get direct children
    const children = await Category.find({
      parent: categoryId,
      isActive: true,
    })
      .select('name slug description image')
      .sort({ name: 1 })
      .lean();

    return {
      ...category,
      children,
    };
  }

  /**
   * Get category by slug with parent and children
   * @param slug - Category slug
   * @returns Category with parent and children
   */
  static async getCategoryBySlug(slug: string): Promise<any> {
    const category = await Category.findOne({ slug, isActive: true })
      .populate('parent', 'name slug description image')
      .lean();

    if (!category) {
      throw new Error('category.categoryNotFound');
    }

    // Get direct children
    const children = await Category.find({
      parent: category._id,
      isActive: true,
    })
      .select('name slug description image')
      .sort({ name: 1 })
      .lean();

    return {
      ...category,
      children,
    };
  }

  /**
   * Get category by path (nested slugs)
   * Supports URLs like: /electronics/computers/laptops
   * @param slugPath - Array of slugs representing the path
   * @returns Category with children and metadata
   */
  static async getCategoryByPath(slugPath: string[]): Promise<any> {
    if (!slugPath || slugPath.length === 0) {
      throw new Error('category.invalidPath');
    }

    let currentCategory: any = null;
    let parentId: any = null;

    // Traverse the path to find the target category
    for (const slug of slugPath) {
      const category = await Category.findOne({
        slug,
        parent: parentId,
        isActive: true,
      }).lean();

      if (!category) {
        throw new Error('category.categoryNotFound');
      }

      currentCategory = category;
      parentId = category._id;
    }

    if (!currentCategory) {
      throw new Error('category.categoryNotFound');
    }

    // Get direct children (subcategories)
    const children = await Category.find({
      parent: currentCategory._id,
      isActive: true,
    })
      .select('name slug description image')
      .sort({ name: 1 })
      .lean();

    // Get breadcrumb
    const breadcrumb = await this.getCategoryBreadcrumb(currentCategory._id.toString());

    // Check if this is a leaf category (no children)
    const isLeaf = children.length === 0;

    return {
      category: currentCategory,
      children,
      breadcrumb,
      isLeaf,
      hasProducts: isLeaf, // If it's a leaf, it should show products
    };
  }

  /**
   * Get all subcategories (recursive) for a given category
   * @param categoryId - Parent category ID
   * @returns Array of all descendant category IDs
   */
  static async getAllSubcategoryIds(
    categoryId: string | Types.ObjectId
  ): Promise<Types.ObjectId[]> {
    const subcategoryIds: Types.ObjectId[] = [];

    const collectSubcategories = async (parentId: string | Types.ObjectId) => {
      const children = await Category.find({ parent: parentId }).select('_id').lean();

      for (const child of children) {
        subcategoryIds.push(child._id);
        await collectSubcategories(child._id);
      }
    };

    await collectSubcategories(categoryId);
    return subcategoryIds;
  }

  /**
   * Get category breadcrumb (path from root to category)
   * @param categoryId - Category ID
   * @returns Array of categories from root to current
   */
  static async getCategoryBreadcrumb(categoryId: string): Promise<any[]> {
    const breadcrumb: any[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category: any = await Category.findById(currentId)
        .select('name slug parent')
        .lean();

      if (!category) break;

      breadcrumb.unshift({
        _id: category._id,
        name: category.name,
        slug: category.slug,
      });

      currentId = category.parent ? category.parent.toString() : null;
    }

    return breadcrumb;
  }

  /**
   * Create a new category
   * @param categoryData - Category data
   * @returns Created category
   */
  static async createCategory(categoryData: Partial<ICategory>): Promise<any> {
    // Validate parent exists if provided
    if (categoryData.parent) {
      const parentExists = await Category.findById(categoryData.parent);
      if (!parentExists) {
        throw new Error('category.parentNotFound');
      }
    }

    const newCategory = new Category(categoryData);
    await newCategory.save();

    return newCategory;
  }

  /**
   * Update category by ID
   * @param categoryId - Category ID
   * @param updateData - Data to update
   * @returns Updated category
   */
  static async updateCategory(
    categoryId: string,
    updateData: Partial<ICategory>
  ): Promise<any> {
    // Validate parent exists if being updated
    if (updateData.parent) {
      const parentExists = await Category.findById(updateData.parent);
      if (!parentExists) {
        throw new Error('category.parentNotFound');
      }
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new Error('category.categoryNotFound');
    }

    return category;
  }

  /**
   * Delete category by ID
   * Only allows deletion if category has no children
   * @param categoryId - Category ID
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    // Check if category has children
    const childrenCount = await Category.countDocuments({ parent: categoryId });

    if (childrenCount > 0) {
      throw new Error('category.hasChildren');
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      throw new Error('category.categoryNotFound');
    }
  }

  /**
   * Soft delete category (mark as inactive)
   * @param categoryId - Category ID
   */
  static async deactivateCategory(categoryId: string): Promise<any> {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      throw new Error('category.categoryNotFound');
    }

    return category;
  }

  /**
   * Reactivate category
   * @param categoryId - Category ID
   */
  static async activateCategory(categoryId: string): Promise<any> {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { isActive: true },
      { new: true }
    );

    if (!category) {
      throw new Error('category.categoryNotFound');
    }

    return category;
  }
}
