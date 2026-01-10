# Frontend Search API Integration Guide

This guide provides complete documentation for integrating the enhanced search functionality into your Angular frontend application.

---

## Table of Contents
1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [TypeScript Interfaces](#typescript-interfaces)
4. [Angular Service Implementation](#angular-service-implementation)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

---

## Overview

The backend now supports:
- **Full-Text Search** with relevance scoring (MongoDB text search)
- **Autocomplete/Typeahead** suggestions
- **Multi-Category Filtering** (search across multiple categories)
- **Sort by Relevance** for search results
- **Arabic & English** language support

**Base URL**: `http://localhost:5000/api` (development) or your production URL

---

## API Endpoints

### 1. Product Search Endpoint

**GET** `/api/products`

Enhanced product search with full-text search and multi-category support.

#### Query Parameters

| Parameter | Type | Required | Default | Description | Example |
|-----------|------|----------|---------|-------------|---------|
| `search` | string | No | - | Search query (max 200 chars) | `wireless mouse` |
| `category` | string/array | No | - | Single or multiple category IDs | `507f...` or `[507f..., 507f...]` |
| `categories` | string/array | No | - | Alternative multi-category param | `id1,id2,id3` |
| `minPrice` | number | No | - | Minimum price filter | `10` |
| `maxPrice` | number | No | - | Maximum price filter | `100` |
| `page` | number | No | 1 | Page number | `1` |
| `limit` | number | No | 20 | Items per page (max 100) | `20` |
| `sort` | string | No | `newest` | Sort order | `relevance`, `newest`, `price-low`, `price-high`, `featured` |
| `inStock` | boolean | No | - | Filter by stock availability | `true` |

#### Sort Options
- `relevance` - Sort by text search relevance (only works with search query)
- `newest` - Most recently added products
- `price-low` - Lowest price first
- `price-high` - Highest price first
- `featured` - Featured products first

#### Request Examples

```typescript
// Basic search
GET /api/products?search=laptop

// Search with relevance sorting
GET /api/products?search=wireless mouse&sort=relevance

// Search with filters
GET /api/products?search=laptop&minPrice=500&maxPrice=2000&inStock=true

// Multi-category filter (array format)
GET /api/products?categories=694518...08c,694518...091

// Multi-category filter (comma-separated)
GET /api/products?categories=694518...08c,694518...091

// Search in Arabic
GET /api/products?search=ماوس لاسلكي
Headers: { 'X-Language': 'ar' }

// Combined filters
GET /api/products?search=laptop&categories=id1,id2&minPrice=500&sort=relevance&page=1&limit=20
```

#### Response Format

```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "_id": "694518c2a66c6f826197713c",
        "name": "MacBook Pro 16\" M3 Max",
        "nameAr": "ماك بوك برو",
        "description": "The most powerful MacBook Pro ever...",
        "price": 2499.99,
        "compareAtPrice": 2799.99,
        "slug": "macbook-pro-16-m3-max",
        "images": ["https://..."],
        "category": {
          "_id": "69451895a66c6f826197708c",
          "name": "Laptops",
          "slug": "laptops",
          "image": "https://..."
        },
        "inStock": true,
        "stockQuantity": 25,
        "sku": "MBP-M3-16-001",
        "isActive": true,
        "isFeatured": true,
        "views": 0,
        "createdAt": "2025-12-19T09:20:02.067Z",
        "updatedAt": "2025-12-19T09:20:02.067Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 3,
      "limit": 20
    }
  }
}
```

---

### 2. Autocomplete Suggestions Endpoint

**GET** `/api/products/autocomplete`

Get autocomplete suggestions for typeahead functionality. Returns only in-stock products sorted by relevance.

#### Query Parameters

| Parameter | Type | Required | Default | Description | Example |
|-----------|------|----------|---------|-------------|---------|
| `q` | string | **Yes** | - | Search query (1-100 chars) | `wire` |
| `limit` | number | No | 10 | Max suggestions (1-10) | `5` |
| `category` | string | No | - | Filter by category ID | `507f...` |

#### Request Examples

```typescript
// Basic autocomplete
GET /api/products/autocomplete?q=wire

// Limit suggestions
GET /api/products/autocomplete?q=laptop&limit=5

// Category-filtered autocomplete
GET /api/products/autocomplete?q=mouse&category=694518...096
```

#### Response Format

```json
{
  "status": "success",
  "data": {
    "suggestions": [
      {
        "_id": "694518c2a66c6f826197713c",
        "name": "Wireless Mouse Pro",
        "nameAr": "ماوس لاسلكي",
        "slug": "wireless-mouse-pro",
        "price": 29.99,
        "image": "https://...",
        "category": {
          "_id": "69451898a66c6f8261977096",
          "name": "Computer Accessories",
          "slug": "computer-accessories"
        }
      },
      {
        "_id": "694518c3a66c6f8261977141",
        "name": "Wireless Keyboard",
        "nameAr": "لوحة مفاتيح لاسلكية",
        "slug": "wireless-keyboard",
        "price": 49.99,
        "image": "https://...",
        "category": {
          "_id": "69451898a66c6f8261977096",
          "name": "Computer Accessories",
          "slug": "computer-accessories"
        }
      }
    ]
  }
}
```

#### Cache Headers

The autocomplete endpoint returns cache headers:
```
Cache-Control: public, max-age=300
```
Cache suggestions on the frontend for 5 minutes to improve performance.

---

## TypeScript Interfaces

Create these interfaces in your Angular project (e.g., `models/product.model.ts`):

```typescript
// Product Interface
export interface Product {
  _id: string;
  name: string;
  nameAr?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  slug: string;
  images: string[];
  category: Category;
  inStock: boolean;
  stockQuantity: number;
  sku?: string;
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Category Interface
export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

// Pagination Interface
export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// Product List Response
export interface ProductListResponse {
  status: 'success';
  data: {
    products: Product[];
    pagination: Pagination;
  };
}

// Autocomplete Suggestion Interface
export interface AutocompleteSuggestion {
  _id: string;
  name: string;
  nameAr?: string;
  slug: string;
  price: number;
  image?: string;
  category?: Category;
}

// Autocomplete Response
export interface AutocompleteResponse {
  status: 'success';
  data: {
    suggestions: AutocompleteSuggestion[];
  };
}

// Search Query Parameters
export interface ProductSearchParams {
  search?: string;
  category?: string | string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price-low' | 'price-high' | 'featured' | 'relevance';
  inStock?: boolean;
}
```

---

## Angular Service Implementation

Create a service to handle product search (e.g., `services/product.service.ts`):

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  ProductListResponse,
  AutocompleteResponse,
  ProductSearchParams
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Search products with filters
   */
  searchProducts(params: ProductSearchParams): Observable<ProductListResponse> {
    let httpParams = new HttpParams();

    // Add all parameters
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.category) {
      if (Array.isArray(params.category)) {
        // For array, add as comma-separated string
        httpParams = httpParams.set('category', params.category.join(','));
      } else {
        httpParams = httpParams.set('category', params.category);
      }
    }
    if (params.categories && Array.isArray(params.categories)) {
      httpParams = httpParams.set('categories', params.categories.join(','));
    }
    if (params.minPrice !== undefined) {
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined) {
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params.inStock !== undefined) {
      httpParams = httpParams.set('inStock', params.inStock.toString());
    }

    return this.http.get<ProductListResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get autocomplete suggestions
   */
  getAutocompleteSuggestions(
    query: string,
    limit: number = 10,
    categoryId?: string
  ): Observable<AutocompleteResponse> {
    let httpParams = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    if (categoryId) {
      httpParams = httpParams.set('category', categoryId);
    }

    return this.http.get<AutocompleteResponse>(`${this.apiUrl}/autocomplete`, {
      params: httpParams
    });
  }
}
```

### Environment Configuration

Add to `environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

And `environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-url.com/api'
};
```

---

## Usage Examples

### Example 1: Search Component with Autocomplete

```typescript
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ProductService } from '../services/product.service';
import { AutocompleteSuggestion, Product } from '../models/product.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  suggestions: AutocompleteSuggestion[] = [];
  products: Product[] = [];
  loading = false;
  showSuggestions = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Setup autocomplete
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only if value changed
        switchMap(query => {
          if (query && query.length >= 2) {
            return this.productService.getAutocompleteSuggestions(query, 10);
          }
          return [];
        })
      )
      .subscribe(response => {
        if (response && response.data) {
          this.suggestions = response.data.suggestions;
          this.showSuggestions = this.suggestions.length > 0;
        }
      });
  }

  /**
   * Perform search when user submits
   */
  onSearch(): void {
    const query = this.searchControl.value;
    if (!query) return;

    this.loading = true;
    this.showSuggestions = false;

    this.productService.searchProducts({
      search: query,
      sort: 'relevance',
      page: 1,
      limit: 20
    }).subscribe(response => {
      this.products = response.data.products;
      this.loading = false;
    });
  }

  /**
   * When user clicks a suggestion
   */
  onSuggestionClick(suggestion: AutocompleteSuggestion): void {
    this.searchControl.setValue(suggestion.name);
    this.showSuggestions = false;
    this.onSearch();
  }

  /**
   * Hide suggestions when input loses focus
   */
  onBlur(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200); // Delay to allow click event
  }
}
```

**Template (search.component.html):**

```html
<div class="search-container">
  <input
    type="text"
    [formControl]="searchControl"
    (keyup.enter)="onSearch()"
    (blur)="onBlur()"
    placeholder="Search products..."
    class="search-input"
  />

  <!-- Autocomplete Suggestions -->
  <div class="suggestions" *ngIf="showSuggestions">
    <div
      *ngFor="let suggestion of suggestions"
      class="suggestion-item"
      (click)="onSuggestionClick(suggestion)"
    >
      <img [src]="suggestion.image" [alt]="suggestion.name" class="suggestion-image" />
      <div class="suggestion-details">
        <h4>{{ suggestion.name }}</h4>
        <p class="category">{{ suggestion.category?.name }}</p>
        <p class="price">${{ suggestion.price }}</p>
      </div>
    </div>
  </div>

  <!-- Search Results -->
  <div class="results" *ngIf="!loading && products.length > 0">
    <div *ngFor="let product of products" class="product-card">
      <img [src]="product.images[0]" [alt]="product.name" />
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <span class="price">${{ product.price }}</span>
    </div>
  </div>

  <!-- Loading State -->
  <div *ngIf="loading" class="loading">Searching...</div>
</div>
```

---

### Example 2: Advanced Search with Filters

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product, Category } from '../models/product.model';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html'
})
export class AdvancedSearchComponent implements OnInit {
  searchForm: FormGroup;
  products: Product[] = [];
  categories: Category[] = []; // Load from API
  selectedCategories: string[] = [];
  totalResults = 0;
  currentPage = 1;

  sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'featured', label: 'Featured' }
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.searchForm = this.fb.group({
      search: [''],
      minPrice: [null],
      maxPrice: [null],
      sort: ['relevance'],
      inStock: [false]
    });
  }

  ngOnInit(): void {
    // Load categories from API
    // this.loadCategories();
  }

  /**
   * Toggle category selection
   */
  toggleCategory(categoryId: string): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.performSearch();
  }

  /**
   * Perform search with all filters
   */
  performSearch(page: number = 1): void {
    const formValue = this.searchForm.value;

    this.productService.searchProducts({
      search: formValue.search,
      categories: this.selectedCategories,
      minPrice: formValue.minPrice,
      maxPrice: formValue.maxPrice,
      sort: formValue.sort,
      inStock: formValue.inStock,
      page: page,
      limit: 20
    }).subscribe(response => {
      this.products = response.data.products;
      this.totalResults = response.data.pagination.total;
      this.currentPage = response.data.pagination.page;
    });
  }

  /**
   * Change page
   */
  goToPage(page: number): void {
    this.performSearch(page);
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.searchForm.reset({ sort: 'relevance' });
    this.selectedCategories = [];
    this.performSearch();
  }
}
```

---

### Example 3: Category-Specific Search

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-category-products',
  templateUrl: './category-products.component.html'
})
export class CategoryProductsComponent implements OnInit {
  @Input() categoryId!: string;

  products: Product[] = [];
  searchQuery = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load products for this category
   */
  loadProducts(): void {
    this.productService.searchProducts({
      category: this.categoryId,
      search: this.searchQuery,
      sort: this.searchQuery ? 'relevance' : 'newest',
      page: 1,
      limit: 20
    }).subscribe(response => {
      this.products = response.data.products;
    });
  }

  /**
   * Search within category
   */
  onSearch(query: string): void {
    this.searchQuery = query;
    this.loadProducts();
  }
}
```

---

## Best Practices

### 1. Debouncing for Autocomplete

Always debounce autocomplete requests to avoid overwhelming the server:

```typescript
searchControl.valueChanges.pipe(
  debounceTime(300), // Wait 300-500ms after user stops typing
  distinctUntilChanged()
)
```

### 2. Cache Autocomplete Results

Implement client-side caching for autocomplete:

```typescript
import { shareReplay } from 'rxjs/operators';

private autocompleteCache = new Map<string, Observable<AutocompleteResponse>>();

getAutocompleteSuggestions(query: string): Observable<AutocompleteResponse> {
  if (this.autocompleteCache.has(query)) {
    return this.autocompleteCache.get(query)!;
  }

  const request = this.http.get<AutocompleteResponse>(...).pipe(
    shareReplay(1)
  );

  this.autocompleteCache.set(query, request);

  // Clear cache after 5 minutes
  setTimeout(() => this.autocompleteCache.delete(query), 300000);

  return request;
}
```

### 3. Error Handling

Always handle errors gracefully:

```typescript
this.productService.searchProducts(params).subscribe({
  next: (response) => {
    this.products = response.data.products;
  },
  error: (error) => {
    console.error('Search error:', error);
    this.showError('Failed to load products. Please try again.');
  }
});
```

### 4. Loading States

Show loading indicators for better UX:

```html
<div *ngIf="loading" class="loading-spinner">
  <mat-spinner></mat-spinner>
</div>

<div *ngIf="!loading && products.length === 0" class="no-results">
  No products found
</div>
```

### 5. Rate Limiting Awareness

The API has rate limits:
- Search: 50 requests/minute
- Autocomplete: 100 requests/minute

Implement proper error handling for 429 (Too Many Requests) responses:

```typescript
if (error.status === 429) {
  this.showError('Too many requests. Please wait a moment and try again.');
}
```

### 6. Multi-Language Support

Support Arabic and English:

```typescript
import { HttpHeaders } from '@angular/common/http';

searchProducts(params: ProductSearchParams, language: 'ar' | 'en' = 'en') {
  const headers = new HttpHeaders({
    'X-Language': language
  });

  return this.http.get<ProductListResponse>(this.apiUrl, {
    params: httpParams,
    headers: headers
  });
}
```

### 7. URL Query Parameters

Sync search state with URL for shareable links:

```typescript
import { ActivatedRoute, Router } from '@angular/router';

constructor(
  private route: ActivatedRoute,
  private router: Router,
  private productService: ProductService
) {}

ngOnInit(): void {
  // Read from URL
  this.route.queryParams.subscribe(params => {
    this.searchControl.setValue(params['q'] || '');
    this.performSearch();
  });
}

onSearch(): void {
  // Update URL
  this.router.navigate([], {
    queryParams: { q: this.searchControl.value },
    queryParamsHandling: 'merge'
  });
}
```

### 8. Performance Optimization

- Use `ChangeDetectionStrategy.OnPush` for components
- Implement virtual scrolling for large result sets
- Lazy load images
- Use trackBy for ngFor loops

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  trackByProductId(index: number, product: Product): string {
    return product._id;
  }
}
```

```html
<div *ngFor="let product of products; trackBy: trackByProductId">
  <!-- product card -->
</div>
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/products` | 50 requests | 1 minute |
| `/api/products/autocomplete` | 100 requests | 1 minute |

Rate limit headers in response:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

---

## Testing Checklist

- [ ] Test search with English queries
- [ ] Test search with Arabic queries
- [ ] Test autocomplete with debouncing
- [ ] Test multi-category filtering
- [ ] Test price range filtering
- [ ] Test sorting (all options)
- [ ] Test pagination
- [ ] Test empty search results
- [ ] Test error handling
- [ ] Test rate limiting behavior
- [ ] Test loading states
- [ ] Test cache behavior

---

## Support

For issues or questions:
- Backend API: Check server logs
- Frontend Integration: Review this guide
- Common Issues: See troubleshooting section below

### Troubleshooting

**Issue: Empty autocomplete results**
- Solution: Ensure query is at least 1 character and products exist with matching text

**Issue: Search returns no results with query**
- Solution: Text indexes must be created (backend should run `npm run create-text-indexes`)

**Issue: 429 Too Many Requests**
- Solution: Implement debouncing and respect rate limits

**Issue: Categories filter not working**
- Solution: Ensure category IDs are valid MongoDB ObjectIds

---

## Summary

The search API provides:
1. **Full-text search** with MongoDB text indexes
2. **Autocomplete** for better UX
3. **Multi-category filtering** for advanced searches
4. **Relevance sorting** for search results
5. **i18n support** for Arabic and English

All endpoints return consistent JSON responses and support proper error handling.
