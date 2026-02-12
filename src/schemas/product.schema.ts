import { Schema } from 'mongoose';
import { generateSlug } from '../utils/slugify.js';
import {
  type IProduct,
  type ProductModel,
  type IProductVirtuals,
} from '../types/product.types.js';

/**
 * Product Schema Definition
 * Defines the structure and validation rules for Product documents
 * Includes supplier information (hidden from customers)
 */
export const productSchema = new Schema<IProduct, ProductModel, IProductVirtuals>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    nameAr: {
      type: String,
      trim: true,
      maxlength: [200, 'Product Arabic name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    descriptionAr: {
      type: String,
      trim: true,
      maxlength: [2000, 'Arabic description cannot exceed 2000 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Index for faster queries
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare at price cannot be negative'],
      validate: {
        validator: function (this: IProduct, value: number): boolean {
          return !value || value >= this.price;
        },
        message: 'Compare at price must be greater than or equal to the selling price',
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true, // Index for faster category-based queries
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]): boolean {
          // Validate each image URL
          return images.every((url) => {
            try {
              new URL(url);
              return true;
            } catch {
              return false;
            }
          });
        },
        message: 'All image URLs must be valid',
      },
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true, // Index for filtering in-stock products
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      trim: true,
      uppercase: true,
    },
    supplierInfo: {
      name: {
        type: String,
        trim: true,
      },
      contact: {
        type: String,
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
      },
    },
    supplierPrice: {
      type: Number,
      min: [0, 'Supplier price cannot be negative'],
      select: false, // Hide from default queries (sensitive data)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true, // Index for filtering featured products
    },
    isSponsored: {
      type: Boolean,
      default: false,
      index: true, // Index for filtering sponsored products
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },
    mannequinSlot: {
      type: String,
      enum: ['top', 'bottom', 'shoes'],
      default: null,
    },
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false, // Disable __v field
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to object
  }
);

/**
 * Virtual field: profitMargin
 * Calculates profit margin (price - supplierPrice)
 * Returns 0 if supplierPrice is not set
 */
productSchema.virtual('profitMargin').get(function (this: IProduct): number {
  if (!this.supplierPrice) {
    return 0;
  }
  return this.price - this.supplierPrice;
});

/**
 * Virtual field: discountPercentage
 * Calculates discount percentage based on compareAtPrice
 * Returns 0 if compareAtPrice is not set or equals price
 */
productSchema.virtual('discountPercentage').get(function (this: IProduct): number {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) {
    return 0;
  }
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

/**
 * Pre-save hook to auto-generate slug from name
 * Generates slug only if name is new or modified
 * Converts to lowercase and replaces spaces with hyphens
 */
productSchema.pre('save', function (next) {
  // Only generate slug if name is new or modified
  if (this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }

  // Auto-update inStock based on stockQuantity
  if (this.isModified('stockQuantity')) {
    this.inStock = this.stockQuantity > 0;
  }

  next();
});

/**
 * Compound indexes for common query patterns
 */
// Index for filtering active, in-stock products by category
productSchema.index({ category: 1, isActive: 1, inStock: 1 });

// Index for filtering featured products
productSchema.index({ isFeatured: 1, isActive: 1 });

// Index for filtering sponsored products
productSchema.index({ isSponsored: 1, isActive: 1 });

// Index for sorting by views (popular products)
productSchema.index({ views: -1 });

/**
 * Text index for full-text search with weighted fields
 * Enables MongoDB Full-Text Search with relevance scoring
 */
productSchema.index(
  {
    name: 'text',
    nameAr: 'text',
    description: 'text',
    descriptionAr: 'text'
  },
  {
    weights: {
      name: 10,        // Highest priority for English name
      nameAr: 10,      // Equal priority for Arabic name
      description: 3,  // Lower priority for descriptions
      descriptionAr: 3 // Equal priority for Arabic description
    },
    name: 'product_text_search',
    default_language: 'english'
  }
);

// Wildcard index to allow efficient filtering on any dynamic attribute key
productSchema.index({ 'attributes.$**': 1 });
