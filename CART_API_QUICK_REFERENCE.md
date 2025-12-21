# 🚀 Quick Reference - Cart API Endpoints

**Base URL:** `http://localhost:5000`
**Auth Required:** All endpoints require `Authorization: Bearer TOKEN` header

---

## 📋 All Cart Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cart` | Get user's cart |
| `POST` | `/api/cart/items` | Add item to cart |
| `PUT` | `/api/cart/items/:itemId` | Update item quantity |
| `DELETE` | `/api/cart/items/:itemId` | Remove item from cart |
| `DELETE` | `/api/cart` | Clear entire cart |
| `POST` | `/api/cart/coupon` | Apply coupon code |

---

## 🔑 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & get token |
| `GET` | `/api/auth/profile` | Get user profile |

---

## 📦 Product Endpoints (for testing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products/:id` | Get product by ID |
| `GET` | `/api/products/slug/:slug` | Get product by slug |

---

## 🎯 Quick Test Sequence

### 1. Get Token
```bash
POST /api/auth/login
{
  "email": "testuser@example.com",
  "password": "SecurePass123!"
}
```

### 2. Get Products
```bash
GET /api/products?limit=5
```

### 3. Add to Cart
```bash
POST /api/cart/items
Authorization: Bearer YOUR_TOKEN
{
  "productId": "PRODUCT_ID_FROM_STEP_2",
  "quantity": 2
}
```

### 4. View Cart
```bash
GET /api/cart
Authorization: Bearer YOUR_TOKEN
```

### 5. Update Quantity
```bash
PUT /api/cart/items/ITEM_ID_FROM_CART
Authorization: Bearer YOUR_TOKEN
{
  "quantity": 5
}
```

### 6. Apply Coupon
```bash
POST /api/cart/coupon
Authorization: Bearer YOUR_TOKEN
{
  "couponCode": "SAVE10"
}
```

### 7. Remove Item
```bash
DELETE /api/cart/items/ITEM_ID
Authorization: Bearer YOUR_TOKEN
```

### 8. Clear Cart
```bash
DELETE /api/cart
Authorization: Bearer YOUR_TOKEN
```

---

## 🎟️ Available Test Coupons

| Code | Type | Discount |
|------|------|----------|
| `SAVE10` | Percentage | 10% off |
| `FIXED50` | Fixed Amount | 50 EGP off |

---

## ✅ Expected Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Validation Error
```json
{
  "status": "fail",
  "data": {
    "fieldName": ["error message"]
  }
}
```

### Server Error
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

---

## 📊 HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (no/invalid token) |
| `404` | Not Found |
| `409` | Conflict (e.g., out of stock) |
| `500` | Server Error |

---

## 💡 Common Issues

**❌ "No token provided"**
→ Add `Authorization: Bearer YOUR_TOKEN` header

**❌ "Product not found"**
→ Use valid product ID from `/api/products`

**❌ "Item not found"**
→ Use item `_id` from cart, not product ID

**❌ "Out of stock"**
→ Reduce quantity or choose different product

---

## 🔗 Full Documentation

See `POSTMAN_CART_TESTING_GUIDE.md` for detailed examples and scenarios.
