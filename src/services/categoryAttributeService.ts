import { Category } from '../models/Category.js';
import { CategoryAttribute } from '../models/CategoryAttribute.js';
import type { IAttributeDefinition } from '../types/categoryAttribute.types.js';

/**
 * CategoryAttributeService
 * Manages attribute definitions per category, with parent inheritance support.
 */
export class CategoryAttributeService {
  /**
   * Create or fully replace attribute definitions for a category.
   * Safe for production: does not affect any existing products.
   */
  static async upsertCategoryAttributes(
    categoryId: string,
    attributes: IAttributeDefinition[]
  ): Promise<any> {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error('category.categoryNotFound');
    }

    const doc = await CategoryAttribute.findOneAndUpdate(
      { category: categoryId },
      { category: categoryId, attributes },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return doc;
  }

  /**
   * Get raw attribute definitions for a single category (no inheritance).
   * Used by admin to inspect/edit a specific category's definitions.
   */
  static async getCategoryAttributes(categoryId: string): Promise<any> {
    const doc = await CategoryAttribute.findOne({ category: categoryId }).lean();
    return doc ?? { category: categoryId, attributes: [] };
  }

  /**
   * Get effective filter definitions for a category.
   * Merges ancestor attributes (root → … → parent → category).
   * Child attributes override parent attributes on the same key.
   * Only returns attributes where filterable === true.
   */
  static async getEffectiveFilters(categoryId: string): Promise<IAttributeDefinition[]> {
    // Walk up ancestor chain (category → parent → … → root)
    const ancestorIds: string[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      ancestorIds.unshift(currentId); // prepend so root is first
      const cat: any = await Category.findById(currentId).select('parent').lean();
      if (!cat) break;
      currentId = cat.parent ? cat.parent.toString() : null;
    }

    // Fetch all CategoryAttribute docs for these categories in one query
    const docs = await CategoryAttribute.find({
      category: { $in: ancestorIds },
    }).lean();

    // Build a lookup map: categoryId string → attributes array
    const docMap = new Map<string, IAttributeDefinition[]>();
    for (const doc of docs) {
      docMap.set(doc.category.toString(), doc.attributes as IAttributeDefinition[]);
    }

    // Merge from root → current (child overrides parent on same key)
    const merged = new Map<string, IAttributeDefinition>();
    for (const id of ancestorIds) {
      const attrs = docMap.get(id) ?? [];
      for (const attr of attrs) {
        merged.set(attr.key, attr);
      }
    }

    // Return filterable attributes sorted by order
    return Array.from(merged.values())
      .filter((attr) => attr.filterable)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Delete all attribute definitions for a category.
   * Does NOT affect existing products' attribute values.
   */
  static async deleteCategoryAttributes(categoryId: string): Promise<void> {
    await CategoryAttribute.deleteOne({ category: categoryId });
  }
}
