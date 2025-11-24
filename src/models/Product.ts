import mongoose from 'mongoose';
import { productSchema } from '../schemas/product.schema.js';
import { type IProduct, type ProductModel } from '../types/product.types.js';

/**
 * Product Model
 * Mongoose model for Product collection with supplier information
 *
 * @example
 * // Create a new product
 * const product = new Product({
 *   name: 'Wireless Headphones',
 *   description: 'High-quality wireless headphones with noise cancellation',
 *   price: 99.99,
 *   compareAtPrice: 149.99,
 *   category: categoryId,
 *   images: ['https://example.com/headphones.jpg'],
 *   stockQuantity: 50,
 *   sku: 'WH-001',
 *   supplierInfo: {
 *     name: 'Audio Suppliers Inc',
 *     contact: 'supplier@example.com',
 *     notes: 'Minimum order: 10 units'
 *   },
 *   supplierPrice: 60.00,
 *   isFeatured: true
 * });
 * await product.save();
 * // slug will be auto-generated as 'wireless-headphones'
 * // inStock will be auto-set to true (stockQuantity > 0)
 *
 * @example
 * // Query products with virtuals
 * const product = await Product.findOne({ slug: 'wireless-headphones' });
 * console.log(product.profitMargin); // 39.99 (99.99 - 60.00)
 * console.log(product.discountPercentage); // 33% discount
 *
 * @example
 * // Find featured products
 * const featured = await Product.find({ isFeatured: true, isActive: true });
 *
 * @example
 * // Find products by category (with supplier price)
 * const products = await Product.find({ category: categoryId })
 *   .select('+supplierPrice') // Include hidden supplier price
 *   .populate('category');
 *
 * @example
 * // Increment product views
 * await Product.findByIdAndUpdate(productId, { $inc: { views: 1 } });
 */
export const Product = mongoose.model<IProduct, ProductModel>(
  'Product',
  productSchema
);
