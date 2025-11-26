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
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true, // Create index for faster hierarchical queries
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false, // Disable __v field
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to Object
  }
);

/**
 * Virtual field to get children categories
 * Allows easy access to subcategories
 */
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

/**
 * Pre-save hook to auto-generate slug from name
 * Generates slug only if name is new or modified
 * Converts to lowercase and replaces spaces with hyphens
 * Also validates parent to prevent circular references
 */
categorySchema.pre('save', async function (next) {
  // Only generate slug if name is new or modified
  if (this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }

  // Validate parent to prevent circular references
  if (this.isModified('parent') && this.parent) {
    const checkCircular = async (parentId: any, categoryId: any): Promise<boolean> => {
      if (!parentId) return false;
      if (parentId.toString() === categoryId.toString()) return true;

      const parentCategory = await this.model('Category').findById(parentId) as any;
      if (!parentCategory) return false;
      if (parentCategory.parent) {
        return checkCircular(parentCategory.parent, categoryId);
      }
      return false;
    };

    const isCircular = await checkCircular(this.parent, this._id);
    if (isCircular) {
      throw new Error('Circular reference detected: A category cannot be a parent of itself');
    }
  }

  next();
});

/**
 * Index on slug field for faster queries
 * Already defined in the schema field definition above
 */
