import { Document, Model, Types } from 'mongoose';

/**
 * Supplier Information Interface
 * Contains supplier details (hidden from customers)
 */
export interface ISupplierInfo {
  name?: string;
  contact?: string;
  notes?: string;
}

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
  supplierInfo?: ISupplierInfo;
  supplierPrice?: number;
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
