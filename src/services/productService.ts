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

    // Search implementation
    // For short queries (1-2 chars), use regex for partial matching
    // For longer queries, use text search for better performance
    let textSearchApplied = false;
    if (search && search.trim()) {
      const sanitizedSearch = search.trim();

      if (sanitizedSearch.length <= 2) {
        // Use regex for short queries (supports single character search)
        const escapedSearch = sanitizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
          { name: { $regex: escapedSearch, $options: 'i' } },
          { nameAr: { $regex: escapedSearch, $options: 'i' } },
          { description: { $regex: escapedSearch, $options: 'i' } },
        ];
      } else {
        // Use text search for longer queries (better performance)
        const sanitizedTextSearch = sanitizedSearch.replace(/[{}()[\]$]/g, '');
        if (sanitizedTextSearch.length > 0) {
          filter.$text = { $search: sanitizedTextSearch };
          textSearchApplied = true;
        }
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
   * Uses regex for partial matching to support single characters and prefixes
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

    // Escape special regex characters to prevent regex injection
    const escapedQuery = sanitizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Build filter
    const filter: FilterQuery<IProduct> = {
      isActive: true,
      inStock: true, // Only suggest in-stock products
    };

    // Category filter (optional)
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    // Use regex for partial matching (supports single characters and prefixes)
    // Search in both name and nameAr fields
    filter.$or = [
      { name: { $regex: escapedQuery, $options: 'i' } },
      { nameAr: { $regex: escapedQuery, $options: 'i' } },
    ];

    try {
      // Query with minimal fields for performance
      const suggestions = await Product.find(filter)
        .select('name nameAr slug price images category')
        .populate('category', 'name slug')
        .sort({ name: 1 }) // Sort alphabetically
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
      // If search fails, return empty suggestions
      console.error('Autocomplete error:', error);
      return { suggestions: [] };
    }
  }

  /**
   * Get featured products for home page slider
   * @param limit - Number of featured products to return (default: 10)
   * @returns List of featured products
   */
  static async getFeaturedProducts(limit: number = 10): Promise<any[]> {
    const validatedLimit = Math.min(20, Math.max(1, limit)); // 1-20 range

    const products = await Product.find({
      isFeatured: true,
      isActive: true,
      inStock: true, // Only show in-stock featured products
    })
      .select('-supplierInfo -supplierPrice')
      .populate('category', 'name slug image')
      .sort({ createdAt: -1 }) // Newest first
      .limit(validatedLimit)
      .lean();

    return products;
  }

  /**
   * Get sponsored products for home page slider
   * @param limit - Number of sponsored products to return (default: 10)
   * @returns List of sponsored products
   */
  static async getSponsoredProducts(limit: number = 10): Promise<any[]> {
    const validatedLimit = Math.min(20, Math.max(1, limit)); // 1-20 range

    const products = await Product.find({
      isSponsored: true,
      isActive: true,
      inStock: true, // Only show in-stock sponsored products
    })
      .select('-supplierInfo -supplierPrice')
      .populate('category', 'name slug image')
      .sort({ createdAt: -1 }) // Newest first
      .limit(validatedLimit)
      .lean();

    return products;
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

  // ============== ADMIN OPERATIONS ==============

  /**
   * Get all products for admin (including inactive)
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Optional filters
   * @returns Products with pagination
   */
  static async getAllProductsAdmin(
    page: number = 1,
    limit: number = 20,
    filters?: {
      isActive?: boolean;
      inStock?: boolean;
      category?: string;
      search?: string;
    }
  ): Promise<ProductListResponse> {
    const validatedPage = Math.max(1, Number(page));
    const validatedLimit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (validatedPage - 1) * validatedLimit;

    const filter: FilterQuery<IProduct> = {};

    if (filters?.isActive !== undefined) {
      filter.isActive = filters.isActive;
    }

    if (filters?.inStock !== undefined) {
      filter.inStock = filters.inStock;
    }

    if (filters?.category) {
      filter.category = filters.category;
    }

    if (filters?.search && filters.search.trim()) {
      filter.$or = [
        { name: { $regex: filters.search.trim(), $options: 'i' } },
        { nameAr: { $regex: filters.search.trim(), $options: 'i' } },
        { description: { $regex: filters.search.trim(), $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validatedLimit)
        .lean(),
      Product.countDocuments(filter),
    ]);

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
   * Create new product (Admin)
   * @param productData - Product data
   * @returns Created product
   */
  static async createProduct(productData: Partial<IProduct>): Promise<any> {
    const product = new Product(productData);
    await product.save();
    return await Product.findById(product._id)
      .populate('category', 'name slug')
      .lean();
  }

  /**
   * Update product (Admin)
   * @param productId - Product ID
   * @param updateData - Data to update
   * @returns Updated product
   */
  static async updateProduct(
    productId: string,
    updateData: Partial<IProduct>
  ): Promise<any> {
    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      throw new Error('product.productNotFound');
    }

    return product;
  }

  /**
   * Delete product (Admin)
   * @param productId - Product ID
   */
  static async deleteProduct(productId: string): Promise<void> {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      throw new Error('product.productNotFound');
    }
  }

  /**
   * Update product stock (Admin)
   * @param productId - Product ID
   * @param stockQuantity - New stock quantity
   * @returns Updated product
   */
  static async updateStock(
    productId: string,
    stockQuantity: number
  ): Promise<any> {
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        stockQuantity,
        inStock: stockQuantity > 0,
      },
      { new: true }
    )
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      throw new Error('product.productNotFound');
    }

    return product;
  }

  /**
   * Toggle product active status (Admin)
   * @param productId - Product ID
   * @param isActive - Active status
   * @returns Updated product
   */
  static async toggleActiveStatus(
    productId: string,
    isActive: boolean
  ): Promise<any> {
    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      { new: true }
    )
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      throw new Error('product.productNotFound');
    }

    return product;
  }

  /**
   * Toggle product featured status (Admin)
   * @param productId - Product ID
   * @param isFeatured - Featured status
   * @returns Updated product
   */
  static async toggleFeaturedStatus(
    productId: string,
    isFeatured: boolean
  ): Promise<any> {
    const product = await Product.findByIdAndUpdate(
      productId,
      { isFeatured },
      { new: true }
    )
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      throw new Error('product.productNotFound');
    }

    return product;
  }

  /**
   * Toggle product sponsored status (Admin)
   * @param productId - Product ID
   * @param isSponsored - Sponsored status
   * @returns Updated product
   */
  static async toggleSponsoredStatus(
    productId: string,
    isSponsored: boolean
  ): Promise<any> {
    const product = await Product.findByIdAndUpdate(
      productId,
      { isSponsored },
      { new: true }
    )
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      throw new Error('product.productNotFound');
    }

    return product;
  }
}
