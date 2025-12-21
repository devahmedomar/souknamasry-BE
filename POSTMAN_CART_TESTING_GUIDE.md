# 🛒 Cart API Testing Guide - Postman

## 📋 Complete Testing Scenario

This guide provides a step-by-step testing scenario for the Cart API endpoints using Postman.

**Base URL:** `http://localhost:5000`

---

## 🔐 Prerequisites: Authentication

All cart endpoints require authentication. You need a JWT token first.

### Step 0: Register & Login

#### **Option A: Register a New User**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Ahmed",
  "lastName": "Mohamed",
  "phone": "+201234567890"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "email": "testuser@example.com",
      "firstName": "Ahmed",
      "lastName": "Mohamed"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **Option B: Login with Existing User**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**🔑 IMPORTANT:** Copy the `token` value. You'll need to add it to all subsequent requests.

---

## 🎯 Setting Up Authorization in Postman

For all requests below, add this header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**In Postman:**
1. Go to the **Headers** tab
2. Add a new header:
   - **Key:** `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (paste your actual token)

---

## 📦 Step 1: Get Available Products

Before adding items to cart, let's see what products are available.

### 1.1 Get All Products
```http
GET http://localhost:5000/api/products?page=1&limit=10
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "_id": "676387e3c4a6e7001234abcd",
        "name": "Wireless Mouse",
        "slug": "wireless-mouse",
        "price": 29.99,
        "stockQuantity": 50,
        "inStock": true,
        "description": "...",
        "images": [...]
      },
      {
        "_id": "676387e3c4a6e7001234abce",
        "name": "Mechanical Keyboard",
        "slug": "mechanical-keyboard",
        "price": 89.99,
        "stockQuantity": 30,
        "inStock": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

**📝 Note:** Copy 2-3 product `_id` values for testing. You'll need them to add items to cart.

---

## 🛒 Step 2: Get Your Cart (Initially Empty)

### 2.1 Get Cart
```http
GET http://localhost:5000/api/cart
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (Empty Cart):**
```json
{
  "status": "success",
  "data": {
    "_id": "676387e3c4a6e7001234xyz1",
    "user": "676387e3c4a6e7001234user",
    "items": [],
    "subtotal": 0,
    "discount": 0,
    "total": 0,
    "createdAt": "2025-12-19T08:58:24.000Z",
    "updatedAt": "2025-12-19T08:58:24.000Z"
  }
}
```

---

## ➕ Step 3: Add Items to Cart

### 3.1 Add First Product to Cart
```http
POST http://localhost:5000/api/cart/items
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "productId": "676387e3c4a6e7001234abcd",
  "quantity": 2
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "676387e3c4a6e7001234xyz1",
    "user": "676387e3c4a6e7001234user",
    "items": [
      {
        "_id": "676387e3c4a6e7001234item1",
        "product": {
          "_id": "676387e3c4a6e7001234abcd",
          "name": "Wireless Mouse",
          "price": 29.99,
          "images": [...]
        },
        "quantity": 2,
        "price": 29.99,
        "totalPrice": 59.98
      }
    ],
    "subtotal": 59.98,
    "discount": 0,
    "total": 59.98
  }
}
```

**📝 Note:** Save the `items[0]._id` value - you'll need it for update/delete operations.

### 3.2 Add Second Product to Cart
```http
POST http://localhost:5000/api/cart/items
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "productId": "676387e3c4a6e7001234abce",
  "quantity": 1
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "_id": "676387e3c4a6e7001234item1",
        "product": { "name": "Wireless Mouse", "price": 29.99 },
        "quantity": 2,
        "totalPrice": 59.98
      },
      {
        "_id": "676387e3c4a6e7001234item2",
        "product": { "name": "Mechanical Keyboard", "price": 89.99 },
        "quantity": 1,
        "totalPrice": 89.99
      }
    ],
    "subtotal": 149.97,
    "total": 149.97
  }
}
```

### 3.3 Add Same Product Again (Should Increase Quantity)
```http
POST http://localhost:5000/api/cart/items
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "productId": "676387e3c4a6e7001234abcd",
  "quantity": 1
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "_id": "676387e3c4a6e7001234item1",
        "product": { "name": "Wireless Mouse" },
        "quantity": 3,
        "totalPrice": 89.97
      },
      {
        "_id": "676387e3c4a6e7001234item2",
        "product": { "name": "Mechanical Keyboard" },
        "quantity": 1,
        "totalPrice": 89.99
      }
    ],
    "subtotal": 179.96,
    "total": 179.96
  }
}
```

---

## ✏️ Step 4: Update Item Quantity

### 4.1 Update Quantity of First Item
```http
PUT http://localhost:5000/api/cart/items/676387e3c4a6e7001234item1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "quantity": 5
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "_id": "676387e3c4a6e7001234item1",
        "product": { "name": "Wireless Mouse", "price": 29.99 },
        "quantity": 5,
        "totalPrice": 149.95
      },
      {
        "_id": "676387e3c4a6e7001234item2",
        "product": { "name": "Mechanical Keyboard", "price": 89.99 },
        "quantity": 1,
        "totalPrice": 89.99
      }
    ],
    "subtotal": 239.94,
    "total": 239.94
  }
}
```

---

## 🎟️ Step 5: Apply Coupon Code

### 5.1 Apply Valid Coupon (10% Discount)
```http
POST http://localhost:5000/api/cart/coupon
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "couponCode": "SAVE10"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "subtotal": 239.94,
    "coupon": "SAVE10",
    "discount": 23.99,
    "total": 215.95
  }
}
```

### 5.2 Apply Fixed Discount Coupon
```http
POST http://localhost:5000/api/cart/coupon
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "couponCode": "FIXED50"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "subtotal": 239.94,
    "coupon": "FIXED50",
    "discount": 50.00,
    "total": 189.94
  }
}
```

### 5.3 Apply Invalid Coupon (Error Case)
```http
POST http://localhost:5000/api/cart/coupon
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "couponCode": "INVALID123"
}
```

**Expected Response:**
```json
{
  "status": "fail",
  "data": {
    "coupon": ["coupon.invalid"]
  }
}
```

---

## 🗑️ Step 6: Remove Items from Cart

### 6.1 Remove One Item
```http
DELETE http://localhost:5000/api/cart/items/676387e3c4a6e7001234item2
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "_id": "676387e3c4a6e7001234item1",
        "product": { "name": "Wireless Mouse" },
        "quantity": 5,
        "totalPrice": 149.95
      }
    ],
    "subtotal": 149.95,
    "total": 149.95
  }
}
```

---

## 🧹 Step 7: Clear Entire Cart

### 7.1 Clear All Items
```http
DELETE http://localhost:5000/api/cart
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Cart cleared successfully"
  }
}
```

### 7.2 Verify Cart is Empty
```http
GET http://localhost:5000/api/cart
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "items": [],
    "subtotal": 0,
    "discount": 0,
    "total": 0
  }
}
```

---

## 🚨 Error Scenarios to Test

### Error 1: Add Product That Doesn't Exist
```http
POST http://localhost:5000/api/cart/items
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "productId": "000000000000000000000000",
  "quantity": 1
}
```

**Expected Response:**
```json
{
  "status": "fail",
  "data": {
    "product": ["product.productNotFound"]
  }
}
```

### Error 2: Add Quantity Exceeding Stock
```http
POST http://localhost:5000/api/cart/items
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "productId": "676387e3c4a6e7001234abcd",
  "quantity": 99999
}
```

**Expected Response:**
```json
{
  "status": "fail",
  "data": {
    "stock": ["product.outOfStock"]
  }
}
```

### Error 3: Update Non-Existent Item
```http
PUT http://localhost:5000/api/cart/items/000000000000000000000000
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "quantity": 2
}
```

**Expected Response:**
```json
{
  "status": "fail",
  "data": {
    "item": ["cart.itemNotFound"]
  }
}
```

### Error 4: Missing Authorization Token
```http
GET http://localhost:5000/api/cart
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "No token provided",
  "code": "UNAUTHORIZED"
}
```

### Error 5: Invalid Product ID Format
```http
POST http://localhost:5000/api/cart/items
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "productId": "invalid-id",
  "quantity": 1
}
```

**Expected Response:**
```json
{
  "status": "fail",
  "data": {
    "productId": ["Invalid product ID format"]
  }
}
```

---

## 📊 Complete Test Flow Summary

Here's the recommended order for a complete test cycle:

1. ✅ **Register/Login** → Get JWT token
2. ✅ **Get Products** → Get product IDs
3. ✅ **Get Empty Cart** → Verify initial state
4. ✅ **Add Item #1** → Add first product (qty: 2)
5. ✅ **Add Item #2** → Add second product (qty: 1)
6. ✅ **Add Item #1 Again** → Verify quantity increases
7. ✅ **Get Cart** → Verify all items are there
8. ✅ **Update Item** → Change quantity of item #1 to 5
9. ✅ **Apply Coupon** → Apply "SAVE10" for 10% discount
10. ✅ **Get Cart** → Verify discount is applied
11. ✅ **Remove Item** → Remove item #2
12. ✅ **Get Cart** → Verify item is removed
13. ✅ **Clear Cart** → Remove all items
14. ✅ **Get Cart** → Verify cart is empty

---

## 🎨 Postman Collection Variables

To make testing easier, create these variables in Postman:

| Variable | Example Value |
|----------|---------------|
| `baseUrl` | `http://localhost:5000` |
| `token` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `productId1` | `676387e3c4a6e7001234abcd` |
| `productId2` | `676387e3c4a6e7001234abce` |
| `itemId1` | `676387e3c4a6e7001234item1` |
| `itemId2` | `676387e3c4a6e7001234item2` |

Then use them in requests like:
```
{{baseUrl}}/api/cart/items/{{itemId1}}
```

---

## 💡 Tips for Testing

1. **Use Postman Collections**: Organize all requests in a collection
2. **Use Environment Variables**: Store token and IDs as variables
3. **Test Scripts**: Add automatic tests in Postman's "Tests" tab
4. **Save Responses**: Use Postman's "Save Response" feature
5. **Check Status Codes**: 
   - `200` = Success
   - `201` = Created
   - `400` = Bad Request (validation error)
   - `401` = Unauthorized (missing/invalid token)
   - `404` = Not Found
   - `409` = Conflict (stock issues)

---

## 🔄 Postman Test Scripts (Optional)

Add these to the "Tests" tab in Postman to automate validation:

### For Login Request:
```javascript
// Save token automatically
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
    console.log("Token saved:", response.data.token);
}

// Test status
pm.test("Status is success", function () {
    pm.expect(pm.response.json().status).to.eql("success");
});
```

### For Add to Cart:
```javascript
// Save item ID
if (pm.response.code === 200) {
    const response = pm.response.json();
    const itemId = response.data.items[0]._id;
    pm.environment.set("itemId1", itemId);
}

// Test cart has items
pm.test("Cart has items", function () {
    const response = pm.response.json();
    pm.expect(response.data.items.length).to.be.above(0);
});
```

---

## ✅ Success Criteria

Your cart API is working correctly if:

- ✅ You can add products to cart
- ✅ Quantities update correctly when adding same product
- ✅ You can update item quantities
- ✅ Subtotal and total calculate correctly
- ✅ Coupons apply discounts properly
- ✅ You can remove individual items
- ✅ You can clear the entire cart
- ✅ Proper error messages for invalid operations
- ✅ Stock validation works (can't add more than available)
- ✅ Authentication is required for all operations

---

## 🐛 Troubleshooting

**Problem:** "No token provided" error
- **Solution:** Make sure you added `Authorization: Bearer YOUR_TOKEN` header

**Problem:** "Product not found" error
- **Solution:** Use valid product IDs from the GET /api/products endpoint

**Problem:** "Item not found" error
- **Solution:** Use the `_id` from the cart items, not the product ID

**Problem:** Token expired
- **Solution:** Login again to get a fresh token

---

Happy Testing! 🚀
