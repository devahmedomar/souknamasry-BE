# API Documentation Guide

## Overview

This project uses **Swagger/OpenAPI 3.0** for API documentation. The documentation is automatically generated from JSDoc comments in the route files and provides an interactive UI for testing endpoints.

## Accessing the Documentation

### Swagger UI (Interactive Documentation)
- **Production:** https://souknamasry-be.vercel.app/api-docs
- **Local Development:** http://localhost:5000/api-docs

The Swagger UI provides:
- Interactive API explorer
- "Try it out" functionality for testing endpoints
- Request/response examples
- Schema definitions
- Authentication support (JWT Bearer tokens)

### OpenAPI Specification (JSON)
- **Production:** https://souknamasry-be.vercel.app/api-docs.json
- **Local Development:** http://localhost:5000/api-docs.json

Use this endpoint to:
- Import into Postman, Insomnia, or other API clients
- Generate client SDKs
- Integrate with CI/CD pipelines

## API Structure

### Organization by Tags

The API is organized into the following tags:

1. **Authentication** (3 endpoints)
   - User registration
   - User login
   - Get user profile

2. **Products - Public** (4 endpoints)
   - List all products with filtering
   - Get product by ID
   - Get product by slug
   - Get products by category path

3. **Categories - Public** (7 endpoints)
   - List all categories
   - Get root categories
   - Get category tree
   - Get category by path
   - Get category by slug
   - Get category breadcrumb
   - Get category by ID

4. **Categories - Admin** (5 endpoints)
   - Create category
   - Update category
   - Deactivate category
   - Activate category
   - Delete category

### Access Levels

- **Public:** No authentication required
- **User:** Requires JWT token (obtained from login)
- **Admin:** Requires JWT token with admin role

## Using Authentication

### 1. Register or Login
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Ahmed",
  "lastName": "Mohamed"
}
```

Or login if you already have an account:
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### 2. Copy the JWT Token
The response will include a `token` field:
```json
{
  "status": "success",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Authorize in Swagger UI
1. Click the **"Authorize"** button (lock icon) at the top of Swagger UI
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click **"Authorize"**
4. Click **"Close"**

Now you can test protected endpoints!

## Response Format (JSend)

All API responses follow the JSend standard:

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data here
  }
}
```

### Fail Response (Client Error - 4xx)
```json
{
  "status": "fail",
  "data": {
    "field1": ["Error message 1"],
    "field2": ["Error message 2"]
  }
}
```

### Error Response (Server Error - 5xx)
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Common Status Codes

- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **400 Bad Request:** Validation error or malformed request
- **401 Unauthorized:** Authentication required (missing or invalid token)
- **403 Forbidden:** Insufficient permissions (e.g., admin role required)
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource already exists (e.g., duplicate email)
- **500 Internal Server Error:** Server error

## Example Requests

### Get All Products with Filters
```bash
GET /api/products?category=507f1f77bcf86cd799439011&minPrice=10&maxPrice=100&sort=price-low&page=1&limit=20
```

### Get Products by Category Path
```bash
GET /api/products/category/electronics/computers/laptops
```

### Create Category (Admin Only)
```bash
POST /api/categories
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "image": "https://example.com/electronics.jpg"
}
```

### Search Products
```bash
GET /api/products?search=wireless+mouse&inStock=true
```

## For Developers: Adding Documentation

When you add new API endpoints, follow this process:

### 1. Add JSDoc Swagger Comments

Above each route definition, add a Swagger JSDoc comment block:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     tags:
 *       - Your Tag Name
 *     summary: Brief description
 *     description: Detailed description
 *     parameters:
 *       - in: query
 *         name: paramName
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 */
router.get('/your-endpoint', YourController.handler);
```

### 2. For Protected Routes

Add the `security` field:

```typescript
/**
 * @swagger
 * /api/admin/endpoint:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin only endpoint
 *     security:
 *       - bearerAuth: []
 *     # ... rest of documentation
 */
```

### 3. Reusable Schemas

Use schema references for common objects:

```typescript
$ref: '#/components/schemas/User'
$ref: '#/components/schemas/Product'
$ref: '#/components/schemas/Category'
$ref: '#/components/schemas/Pagination'
```

These are defined in `src/config/swagger.config.ts`.

### 4. Reusable Responses

Use response references for common errors:

```typescript
400:
  $ref: '#/components/responses/ValidationError'
401:
  $ref: '#/components/responses/UnauthorizedError'
403:
  $ref: '#/components/responses/ForbiddenError'
404:
  $ref: '#/components/responses/NotFoundError'
```

### 5. Update swagger.config.ts

If you're adding a new feature category:

1. Add a new tag to the `tags` array
2. Add any new schemas to `components.schemas`
3. Ensure your route file is included in the `apis` array

## Project Configuration

### Swagger Configuration Files

- **`src/config/swagger.config.ts`**: Main Swagger configuration
  - OpenAPI version and metadata
  - Server URLs
  - Tags (categories)
  - Security schemes
  - Reusable schemas and responses

- **`src/app.ts`**: Swagger UI mounting
  - Mounts Swagger UI at `/api-docs`
  - Exposes JSON spec at `/api-docs.json`
  - Custom UI settings

### Route Files with Documentation

- **`src/routes/authRoutes.ts`**: Authentication endpoints (3)
- **`src/routes/productRoutes.ts`**: Product endpoints (4)
- **`src/routes/categoryRoutes.ts`**: Category endpoints (11)

## Tips for Testing

1. **Start with Authentication:** Test register/login endpoints first to get a token
2. **Use "Try it out":** Swagger UI's interactive feature makes testing easy
3. **Check Examples:** Each endpoint has example request bodies and responses
4. **Filter by Tag:** Use the filter bar to search for specific endpoints
5. **Persist Authorization:** The JWT token persists in Swagger UI during your session

## Troubleshooting

### Issue: 401 Unauthorized
- **Cause:** Missing or invalid JWT token
- **Solution:** Click "Authorize" and enter your token as `Bearer YOUR_TOKEN`

### Issue: 403 Forbidden
- **Cause:** Insufficient permissions (need admin role)
- **Solution:** Login with an admin account

### Issue: 400 Validation Error
- **Cause:** Request body doesn't match schema requirements
- **Solution:** Check the schema definition and example in Swagger UI

### Issue: Swagger UI not loading
- **Cause:** Server not running or incorrect URL
- **Solution:**
  - Verify server is running: `npm run dev`
  - Check console for errors
  - Visit http://localhost:5000/health to verify server is up

## Support

For issues or questions:
- Check this documentation first
- Review the interactive examples in Swagger UI
- Check the source code in `src/routes/*.ts`
- Refer to the JSDoc comments in controller files

## Additional Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JSend Response Format](https://github.com/omniti-labs/jsend)
- [JWT Authentication](https://jwt.io/)
