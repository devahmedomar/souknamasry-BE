import { Product } from '../models/Product.js';
import { CategoryService } from './categoryService.js';
import type { FilterQuery, Types } from 'mongoose';
import type { IProduct } from '../types/product.types.js';
import mongoose from 'mongoose';

/**
 * Product Query Parameters Interface
 */
export interface ProductQueryParams {
  category?: string | string[];  // MODIFIED: Support both single and array
  categories?: string[];         // NEW: Alternative parameter for multi-category
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price-low' | 'price-high' | 'featured' | 'relevance'; // ADDED: relevance
  inStock?: boolean;
}

/**
 * Autocomplete Query Parameters Interface
 */
export interface AutocompleteQueryParams {
  query: string;
  limit?: number;
  category?: string;
}

/**
 * Autocomplete Response Interface
 */
export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

/**
 * Autocomplete Suggestion Interface
 */
export interface AutocompleteSuggestion {
  _id: string;
  name: string;
  nameAr?: string;
  slug: string;
  price: number;
  image?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

/**
 * Pagination Metadata Interface
 */
export interface PaginationMetadata {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * Product List Response Interface
 */
export interface ProductListResponse {
  products: any[];
  pagination: PaginationMetadata;
}

/**
 * Product Service
 * Handles business logic for product operations
 */
export class ProductService {
  /**
   * Get all products with filtering, search, and pagination
   * @param queryParams - Query parameters for filtering and pagination
   * @returns Product list with pagination metadata
   */
  static async getAllProducts(
    queryParams: ProductQueryParams
  ): Promise<ProductListResponse> {
    // Extract and validate query parameters
    const {
      category,
      categories,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sort = 'newest',
      inStock,
    } = queryParams;

    // Validate and sanitize pagination parameters
    const validatedPage = Math.max(1, Number(page));
    const validatedLimit = Math.min(100, Math.max(1, Number(limit))); // Max 100 items per page
    const skip = (validatedPage - 1) * validatedLimit;

    // Build filter query
    const filter: FilterQuery<IProduct> = {
      isActive: true, // Only return active products
    };

    // Filter by category - support both single category and array of categories
    if (category) {
      if (Array.isArray(category)) {
        // Multiple categories provided as array
        const validCategoryIds = category.filter(id =>
          mongoose.Types.ObjectId.isValid(id)
        );
        if (validCategoryIds.length > 0) {
          filter.category = { $in: validCategoryIds };
        }
      } else {
        // Single category (backward compatible)
        filter.category = category;
      }
    }

    // Alternative parameter: categories
    if (categories && Array.isArray(categories)) {
      const validCategoryIds = categories.filter(id =>
        mongoose.Types.ObjectId.isValid(id)
      );
      if (validCategoryIds.length > 0) {
        filter.category = { $in: validCategoryIds };
      }
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Filter by stock status
    if (inStock !== undefined) {
      filter.inStock = inStock;
    }

    // MongoDB Full-Text Search
    let textSearchApplied = false;
    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[{}()[\]$]/g, '');
      if (sanitizedSearch.length > 0) {
        filter.$text = { $search: sanitizedSearch };
        textSearchApplied = true;
      }
    }

    // Build sort query with relevance support
    let sortQuery: any = {};
    if (textSearchApplied && (sort === 'relevance' || !sort)) {
      // Sort by text relevance score when search is active
      sortQuery = { score: { $meta: 'textScore' } };
    } else {
      switch (sort) {
        case 'newest':
          sortQuery = { createdAt: -1 };
          break;
        case 'price-low':
          sortQuery = { price: 1 };
          break;
        case 'price-high':
          sortQuery = { price: -1 };
          break;
        case 'featured':
          sortQuery = { isFeatured: -1, createdAt: -1 };
          break;
        case 'relevance':
          // If no search term, fall back to newest
          sortQuery = { createdAt: -1 };
          break;
        default:
          sortQuery = { createdAt: -1 };
      }
    }

    // Build base query
    const baseQuery = Product.find(filter)
      .select('-supplierInfo -supplierPrice'); // Exclude supplier information

    // Add text score projection if text search is applied
    if (textSearchApplied) {
      baseQuery.select({ score: { $meta: 'textScore' } });
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      baseQuery
        .populate('category', 'name slug image') // Populate category details
        .sort(sortQuery)
        .skip(skip)
        .limit(validatedLimit)
        .maxTimeMS(5000) // 5-second timeout for performance
        .lean(), // Use lean for better performance
      Product.countDocuments(filter).maxTimeMS(5000),
    ]);

    // Calculate pagination metadata
    const pages = Math.ceil(total / validatedLimit);

    return {
      products,
      pagination: {
        total,
        page: validatedPage,
        pages,
        limit: validatedLimit,
      },
    };
  }

  /**
   * Get autocomplete suggestions for product search
   * Lightweight query focusing on name matching only
   * @param queryParams - Autocomplete query parameters
   * @returns Autocomplete suggestions
   */
  static async getAutocompleteSuggestions(
    queryParams: AutocompleteQueryParams
  ): Promise<AutocompleteResponse> {
    const { query, limit = 10, category } = queryParams;

    // Return empty suggestions if query is empty
    if (!query || query.trim().length === 0) {
      return { suggestions: [] };
    }

    const sanitizedQuery = query.trim().substring(0, 100); // Max 100 chars
    const validatedLimit = Math.min(10, Math.max(1, limit)); // 1-10 range

    // Build filter
    const filter: FilterQuery<IProduct> = {
      isActive: true,
      inStock: true, // Only suggest in-stock products
    };

    // Category filter (optional)
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    // Use text search
    filter.$text = { $search: sanitizedQuery };

    try {
      // Query with minimal fields for performance
      const suggestions = await Product.find(filter)
        .select('name nameAr slug price images category')
        .select({ score: { $meta: 'textScore' } })
        .populate('category', 'name slug')
        .sort({ score: { $meta: 'textScore' } })
        .limit(validatedLimit)
        .maxTimeMS(2000) // 2-second timeout for autocomplete
        .lean();

      // Format response
      const formattedSuggestions: AutocompleteSuggestion[] = suggestions.map(
        (product: any) => ({
          _id: product._id.toString(),
          name: product.name,
          nameAr: product.nameAr,
          slug: product.slug,
          price: product.price,
          image: product.images?.[0],
          ...(product.category && {
            category: {
              _id: product.category._id.toString(),
              name: product.category.name,
              slug: product.category.slug,
            }
          }),
        })
      );

      return { suggestions: formattedSuggestions };
    } catch (error) {
      // If text search fails, return empty suggestions
      console.error('Autocomplete error:', error);
      return { suggestions: [] };
    }
  }

  /**
   * Get product by ID with related products
   * @param productId - Product ID
   * @returns Product document with related products
   */
  static async getProductById(productId: string): Promise<any> {
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    })
      .select('-supplierInfo -supplierPrice') // Exclude supplier information
      .populate('category', 'name slug image description')
      .lean();

    if (!product) {
      throw new Error('product.productNotFound');
    }

    // Get related products (same category, limit 4, exclude current product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: productId },
      isActive: true,
    })
      .select('-supplierInfo -supplierPrice')
      .limit(4)
      .lean();

    // Increment views (async, don't wait)
    Product.findByIdAndUpdate(productId, { $inc: { views: 1 } }).exec();

    return {
      ...product,
      relatedProducts,
    };
  }

  /**
   * Get product by slug with related products
   * @param slug - Product slug
   * @returns Product document with related products
   */
  static async getProductBySlug(slug: string): Promise<any> {
    const product = await Product.findOne({
      slug,
      isActive: true,
    })
      .select('-supplierInfo -supplierPrice') // Exclude supplier information
      .populate('category', 'name slug image description')
      .lean();

    if (!product) {
      throw new Error('product.productNotFound');
    }

    // Get related products (same category, limit 4, exclude current product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .select('-supplierInfo -supplierPrice')
      .limit(4)
      .lean();

    // Increment views (async, don't wait)
    Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec();

    return {
      ...product,
      relatedProducts,
    };
  }

  /**
   * Get products by category path with optional subcategory inclusion
   * @param slugPath - Array of slugs representing the category path
   * @param queryParams - Query parameters for filtering and pagination
   * @param includeSubcategories - Whether to include products from subcategories
   * @returns Product list with pagination metadata
   */
  static async getProductsByCategoryPath(
    slugPath: string[],
    queryParams: ProductQueryParams,
    includeSubcategories: boolean = false
  ): Promise<ProductListResponse> {
    // Get the category from path
    const categoryData = await CategoryService.getCategoryByPath(slugPath);
    const categoryId = categoryData.category._id;

    // Get category IDs to filter by
    let categoryIds: Types.ObjectId[] = [categoryId];

    if (includeSubcategories) {
      // Get all subcategory IDs recursively
      const subcategoryIds = await CategoryService.getAllSubcategoryIds(categoryId);
      categoryIds = [...categoryIds, ...subcategoryIds];
    }

    // Extract and validate query parameters
    const {
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sort = 'newest',
      inStock,
    } = queryParams;

    // Validate and sanitize pagination parameters
    const validatedPage = Math.max(1, Number(page));
    const validatedLimit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (validatedPage - 1) * validatedLimit;

    // Build filter query
    const filter: FilterQuery<IProduct> = {
      isActive: true,
      category: { $in: categoryIds }, // Filter by category and subcategories
    };

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Filter by stock status
    if (inStock !== undefined) {
      filter.inStock = inStock;
    }

    // Search in name and description
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Build sort query
    let sortQuery: any = {};
    switch (sort) {
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'price-low':
        sortQuery = { price: 1 };
        break;
      case 'price-high':
        sortQuery = { price: -1 };
        break;
      case 'featured':
        sortQuery = { isFeatured: -1, createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('-supplierInfo -supplierPrice')
        .populate('category', 'name slug image')
        .sort(sortQuery)
        .skip(skip)
        .limit(validatedLimit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const pages = Math.ceil(total / validatedLimit);

    return {
      products,
      pagination: {
        total,
        page: validatedPage,
        pages,
        limit: validatedLimit,
      },
    };
  }
}
