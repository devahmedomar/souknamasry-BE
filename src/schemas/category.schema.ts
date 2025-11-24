import { Schema } from 'mongoose';
import { generateSlug } from '../utils/slugify.js';
import { type ICategory, type CategoryModel } from '../types/category.types.js';

/**
 * Category Schema Definition
 * Defines the structure and validation rules for Category documents
 */
export const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Create index for faster queries
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string): boolean {
          // Optional field - only validate if provided
          if (!value) return true;

          // Basic URL validation
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Please provide a valid URL for the image',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false, // Disable __v field
  }
);

/**
 * Pre-save hook to auto-generate slug from name
 * Generates slug only if name is new or modified
 * Converts to lowercase and replaces spaces with hyphens
 */
categorySchema.pre('save', function (next) {
  // Only generate slug if name is new or modified
  if (this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }
  next();
});

/**
 * Index on slug field for faster queries
 * Already defined in the schema field definition above
 */
