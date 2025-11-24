import mongoose from 'mongoose';
import { categorySchema } from '../schemas/category.schema.js';
import { type ICategory, type CategoryModel } from '../types/category.types.js';

/**
 * Category Model
 * Mongoose model for Category collection
 *
 * @example
 * // Create a new category
 * const category = new Category({
 *   name: 'Electronics',
 *   description: 'Electronic devices and gadgets',
 *   image: 'https://example.com/electronics.jpg'
 * });
 * await category.save();
 * // slug will be auto-generated as 'electronics'
 *
 * @example
 * // Find category by slug
 * const category = await Category.findOne({ slug: 'electronics' });
 *
 * @example
 * // Find active categories
 * const activeCategories = await Category.find({ isActive: true });
 */
export const Category = mongoose.model<ICategory, CategoryModel>(
  'Category',
  categorySchema
);
