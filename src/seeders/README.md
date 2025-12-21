# 🌱 Database Seeder

This seeder populates your database with realistic e-commerce data including categories, subcategories, and products.

## 📊 What Gets Seeded

### Categories (Hierarchical Structure)
- **Electronics**
  - Computers & Laptops
    - Laptops
    - Desktop Computers
    - Computer Accessories
  - Mobile Phones & Tablets
    - Smartphones
    - Tablets
    - Mobile Accessories
  - Audio & Headphones
    - Wireless Headphones
    - Speakers
    - Earbuds
  - Cameras & Photography

- **Fashion & Apparel**
  - Men's Fashion
    - Men's Shirts
    - Men's Pants
    - Men's Shoes
  - Women's Fashion
    - Women's Dresses
    - Women's Tops
    - Women's Shoes
  - Accessories

- **Home & Living**
  - Furniture
    - Living Room Furniture
    - Bedroom Furniture
    - Office Furniture
  - Home Decor
  - Kitchen & Dining

- **Sports & Outdoors**
  - Fitness Equipment
  - Outdoor Recreation
  - Sports Apparel

- **Beauty & Personal Care**
  - Skincare
  - Makeup
  - Hair Care

- **Books & Media**
  - Books
  - Movies & TV

### Products
- **45+ Products** across all categories
- Realistic product data including:
  - Names and descriptions
  - Prices and compare-at prices (for discounts)
  - High-quality images from Unsplash
  - Stock quantities
  - SKUs
  - Supplier information (hidden from customers)
  - Supplier prices (for profit margin calculation)
  - Featured products

## 🚀 Usage

### Seed the Database

This will clear existing data and populate with fresh seed data:

```bash
npm run seed
```

### Destroy All Data

This will clear all categories and products from the database:

```bash
npm run seed:destroy
```

## 📝 Output Example

```
========================================
   Database Seeder
========================================

Connecting to database...
✓ Connected to database

Clearing existing data...
✓ Deleted 45 products and 28 categories

Seeding categories...

✓ Created category: Electronics
✓ Created category: Computers & Laptops
✓ Created category: Laptops
✓ Created category: Desktop Computers
✓ Created category: Computer Accessories
...

✓ Created 28 categories total

Seeding products...

✓ Created product: MacBook Pro 16" M3 Max
✓ Created product: Dell XPS 15 9530
✓ Created product: Logitech MX Master 3S Wireless Mouse
...

Products Summary: 45 created, 0 failed

========================================
   Seeding Complete!
========================================
Categories: 28
Products: 45
Featured Products: 12
========================================
```

## 🎯 Featured Products

The seeder marks certain high-quality products as "featured" which you can use for:
- Homepage featured section
- Special promotions
- Highlighted products in listings

## 📦 Product Details

Each product includes:
- **Name**: Descriptive product name
- **Description**: Detailed product description
- **Price**: Current selling price
- **Compare At Price**: Original price (for showing discounts)
- **Images**: 1-2 high-quality product images
- **Stock Quantity**: Available inventory
- **SKU**: Unique product identifier
- **Supplier Info**: Supplier name, contact, and notes
- **Supplier Price**: Cost price (hidden from customers)
- **Category**: Linked to appropriate category
- **Featured Flag**: Whether product is featured

## 🔧 Customization

### Adding More Categories

Edit `src/seeders/data/categories.data.ts`:

```typescript
{
    name: 'Your Category',
    description: 'Category description',
    image: 'https://example.com/image.jpg',
    children: [
        {
            name: 'Subcategory',
            description: 'Subcategory description',
        }
    ]
}
```

### Adding More Products

Edit `src/seeders/data/products.data.ts`:

```typescript
{
    name: 'Your Product',
    description: 'Product description',
    price: 99.99,
    compareAtPrice: 129.99, // Optional
    categoryPath: ['Parent Category', 'Child Category', 'Leaf Category'],
    images: ['https://example.com/image.jpg'],
    stockQuantity: 50,
    sku: 'YOUR-SKU-001',
    supplierInfo: {
        name: 'Supplier Name',
        contact: 'supplier@example.com',
        notes: 'Optional notes'
    },
    supplierPrice: 75.00,
    isFeatured: true, // Optional
}
```

## ⚠️ Important Notes

1. **Clears Existing Data**: The seeder will delete all existing categories and products before seeding
2. **Run Once**: Only run the seeder when you want to reset your database
3. **Development Only**: This is for development/testing purposes
4. **Images**: Uses Unsplash images which are free to use
5. **Supplier Prices**: Hidden from customer-facing queries by default

## 🔗 Related Files

- `src/seeders/seed.ts` - Main seeder script
- `src/seeders/data/categories.data.ts` - Category data
- `src/seeders/data/products.data.ts` - Product data
- `src/models/Category.ts` - Category model
- `src/models/Product.ts` - Product model

## 💡 Tips

- Run the seeder after setting up your database connection
- Use `npm run seed:destroy` to clean up test data
- Modify the data files to match your business needs
- The seeder respects your schema validations
- Check console output for any errors during seeding

## 🐛 Troubleshooting

**Error: "Category not found in path"**
- Make sure the category path in products.data.ts matches the category structure in categories.data.ts

**Error: "Duplicate key error"**
- The seeder clears data first, but if you have unique constraints, make sure SKUs and names are unique

**Error: "Connection failed"**
- Check your MongoDB connection string in .env file
- Ensure MongoDB is running

---

Happy Seeding! 🌱
