import { Document, Model, Types } from 'mongoose';

/**
 * Interface representing a Category document in MongoDB
 * Contains all category-related data fields
 * Supports recursive subcategories via parent field
 */
export interface ICategory {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  slug: string;
  image?: string;
  isActive: boolean;
  parent?: Types.ObjectId | ICategory | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Document type
 * Combines ICategory interface with Mongoose Document
 */
export type CategoryDocument = ICategory & Document;

/**
 * Category Model type
 * Defines the type for the Category model
 */
export type CategoryModel = Model<ICategory>;
