import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
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
      .select('name nameAr slug description descriptionAr image')
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
      .populate('parent', 'name nameAr slug')
      .select('name nameAr slug description descriptionAr image parent isActive')
      .sort({ name: 1 })
      .lean();
  }

  /**
   * Get category tree (hierarchical structure)
   * Builds a nested tree of all categories
   * @param includeInactive - Whether to include inactive categories
   * @returns Hierarchical category tree
   */
  static async getCategoryTree(includeInactive: boolean = false): Promise<any[]> {
    // Build filter based on includeInactive flag
    const filter: any = includeInactive ? {} : { isActive: true };

    const allCategories = await Category.find(filter)
      .select('name nameAr slug description descriptionAr image parent isActive')
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
      .populate('parent', 'name nameAr slug description descriptionAr image')
      .lean();

    if (!category) {
      throw new Error('category.categoryNotFound');
    }

    // Get direct children
    const children = await Category.find({
      parent: categoryId,
      isActive: true,
    })
      .select('name nameAr slug description descriptionAr image')
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
      .populate('parent', 'name nameAr slug description descriptionAr image')
      .lean();

    if (!category) {
      throw new Error('category.categoryNotFound');
    }

    // Get direct children
    const children = await Category.find({
      parent: category._id,
      isActive: true,
    })
      .select('name nameAr slug description descriptionAr image')
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
      .select('name nameAr slug description descriptionAr image')
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
        .select('name nameAr slug parent')
        .lean();

      if (!category) break;

      breadcrumb.unshift({
        _id: category._id,
        name: category.name,
        nameAr: category.nameAr,
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
    // Validate parent exists and check for circular references if being updated
    if (updateData.parent !== undefined) {
      // Check if category is trying to be its own parent
      if (updateData.parent && updateData.parent.toString() === categoryId) {
        throw new Error('Circular reference detected: A category cannot be a parent of itself');
      }

      // Validate parent exists if provided (not null)
      if (updateData.parent) {
        const parentExists = await Category.findById(updateData.parent);
        if (!parentExists) {
          throw new Error('category.parentNotFound');
        }

        // Check if new parent is a descendant of current category
        const isDescendant = await this.isDescendantOf(
          updateData.parent.toString(),
          categoryId
        );
        if (isDescendant) {
          throw new Error('Circular reference detected: Cannot move a category under its own descendant');
        }
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
   * Check if a category is a descendant of another category
   * @param potentialDescendantId - ID of potential descendant
   * @param ancestorId - ID of potential ancestor
   * @returns True if potentialDescendant is a descendant of ancestor
   */
  private static async isDescendantOf(
    potentialDescendantId: string,
    ancestorId: string
  ): Promise<boolean> {
    let currentId: string | null = potentialDescendantId;

    // Traverse up the tree from potentialDescendant
    while (currentId) {
      if (currentId === ancestorId) {
        return true;
      }

      const category: any = await Category.findById(currentId).select('parent').lean();
      if (!category) break;

      currentId = category.parent ? category.parent.toString() : null;
    }

    return false;
  }

  /**
   * Delete category by ID
   * Only allows deletion if category has no children and no associated products
   * @param categoryId - Category ID
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    // Check if category has children
    const childrenCount = await Category.countDocuments({ parent: categoryId });

    if (childrenCount > 0) {
      throw new Error('category.hasChildren');
    }

    // Check if category has associated products
    const productsCount = await Product.countDocuments({ category: categoryId });

    if (productsCount > 0) {
      throw new Error('category.hasProducts');
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      throw new Error('category.categoryNotFound');
    }
  }

  /**
   * Soft delete category (mark as inactive)
   * Recursively deactivates all descendant categories
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

    // Recursively deactivate all descendants to prevent orphaned active subcategories
    const descendantIds = await this.getAllSubcategoryIds(categoryId);
    if (descendantIds.length > 0) {
      await Category.updateMany(
        { _id: { $in: descendantIds } },
        { isActive: false }
      );
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

  /**
   * Get homepage data with leaf categories and their products
   * Returns all leaf categories (categories with no children) that contain products
   * Each category includes up to 10 products sorted by createdAt or popularity
   * @param sortBy - Sort products by 'newest' (createdAt DESC) or 'popular' (views DESC)
   * @param limit - Maximum number of products per category (default: 10, max: 20)
   * @returns Array of sections with category metadata and products
   */
  static async getHomepageData(
    sortBy: 'newest' | 'popular' | 'random' = 'newest',
    limit: number = 10
  ): Promise<any[]> {
    // Validate and sanitize limit
    const validatedLimit = Math.min(20, Math.max(1, limit));

    // Get all active categories
    const allCategories = await Category.find({ isActive: true })
      .select('_id name nameAr slug description descriptionAr image parent')
      .lean();

    // Build a set of category IDs that have children (are parents)
    const parentCategoryIds = new Set<string>();
    allCategories.forEach((category) => {
      if (category.parent) {
        parentCategoryIds.add(category.parent.toString());
      }
    });

    // Identify leaf categories (categories that are not parents)
    const leafCategories = allCategories.filter(
      (category) => !parentCategoryIds.has(category._id.toString())
    );

    // Prepare sort query for non-random modes
    const sortQuery = sortBy === 'popular' ? { views: -1 as const } : { createdAt: -1 as const };

    // For each leaf category, fetch products
    const sections = await Promise.all(
      leafCategories.map(async (category) => {
        let products: any[];

        if (sortBy === 'random') {
          // Use MongoDB $sample for true per-request randomization
          products = await Product.aggregate([
            {
              $match: {
                category: category._id,
                isActive: true,
                inStock: true,
              },
            },
            { $sample: { size: validatedLimit } },
            { $project: { supplierInfo: 0, supplierPrice: 0 } },
          ]);
        } else {
          // Fetch products for this category (newest or popular)
          products = await Product.find({
            category: category._id,
            isActive: true,
            inStock: true,
          })
            .select('-supplierInfo -supplierPrice')
            .sort(sortQuery)
            .limit(validatedLimit)
            .lean();
        }

        // Only include this category if it has products
        if (products.length > 0) {
          return {
            category: {
              _id: category._id,
              name: category.name,
              nameAr: (category as any).nameAr,
              slug: category.slug,
              description: category.description,
              descriptionAr: (category as any).descriptionAr,
              image: category.image,
            },
            products,
          };
        }

        return null;
      })
    );

    // Filter out null entries (categories without products)
    const validSections = sections.filter((section) => section !== null);

    return validSections;
  }
}
