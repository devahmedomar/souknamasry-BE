import { Document, Model, Types } from 'mongoose';

/**
 * Interface representing a Product document in MongoDB
 * Contains all product-related data fields including supplier information
 */
export interface IProduct {
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  category: Types.ObjectId;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  sku?: string;
  supplierInfo?: string;   // admin-only: where/who the product is sourced from
  supplierPrice?: number;  // admin-only: cost price paid to supplier
  isActive: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  mannequinSlot?: 'top' | 'bottom' | 'shoes' | null;
  attributes?: Map<string, any> | Record<string, any>;
}

/**
 * Interface for Product virtual fields
 */
export interface IProductVirtuals {
  profitMargin: number;
  discountPercentage: number;
}

/**
 * Product Document type
 * Combines IProduct interface with Mongoose Document and virtuals
 */
export type ProductDocument = IProduct & IProductVirtuals & Document;

/**
 * Product Model type
 * Defines the type for the Product model
 */
export type ProductModel = Model<IProduct, {}, IProductVirtuals>;
