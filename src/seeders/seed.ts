import 'dotenv/config';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { categoriesData, type CategorySeedData } from './data/categories.data.js';
import { productsData } from './data/products.data.js';
import connectDB from '../config/database.js';

/**
 * Database Seeder
 * Seeds the database with categories and products
 */

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
};

/**
 * Recursively create categories and their children
 */
async function createCategories(
    categoriesData: CategorySeedData[],
    parentId: mongoose.Types.ObjectId | null = null
): Promise<Map<string, mongoose.Types.ObjectId>> {
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    for (const categoryData of categoriesData) {
        try {
            // Create the category
            const category = await Category.create({
                name: categoryData.name,
                description: categoryData.description,
                image: categoryData.image,
                parent: parentId,
                isActive: true,
            });

            console.log(
                `${colors.green}✓${colors.reset} Created category: ${colors.bright}${categoryData.name}${colors.reset}`
            );

            // Store category ID with full path for product mapping
            const categoryPath = parentId
                ? `${categoryData.name}`
                : categoryData.name;
            categoryMap.set(categoryData.name, category._id);

            // Recursively create children
            if (categoryData.children && categoryData.children.length > 0) {
                const childMap = await createCategories(
                    categoryData.children,
                    category._id
                );
                // Merge child map into parent map
                childMap.forEach((id, name) => categoryMap.set(name, id));
            }
        } catch (error) {
            console.error(
                `${colors.red}✗${colors.reset} Error creating category ${categoryData.name}:`,
                error instanceof Error ? error.message : error
            );
        }
    }

    return categoryMap;
}

/**
 * Find category ID by path
 */
async function findCategoryByPath(
    path: string[]
): Promise<mongoose.Types.ObjectId | null> {
    let currentCategory = null;

    for (const categoryName of path) {
        const query: any = { name: categoryName };
        if (currentCategory) {
            query.parent = currentCategory._id;
        } else {
            query.parent = null;
        }

        currentCategory = await Category.findOne(query);

        if (!currentCategory) {
            console.error(
                `${colors.red}✗${colors.reset} Category not found in path: ${categoryName}`
            );
            return null;
        }
    }

    return currentCategory ? currentCategory._id : null;
}

/**
 * Create products
 */
async function createProducts(): Promise<void> {
    let successCount = 0;
    let errorCount = 0;

    for (const productData of productsData) {
        try {
            // Find the category by path
            const categoryId = await findCategoryByPath(productData.categoryPath);

            if (!categoryId) {
                console.error(
                    `${colors.red}✗${colors.reset} Skipping product ${productData.name}: Category not found`
                );
                errorCount++;
                continue;
            }

            // Create the product
            await Product.create({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                compareAtPrice: productData.compareAtPrice,
                category: categoryId,
                images: productData.images,
                stockQuantity: productData.stockQuantity,
                sku: productData.sku,
                supplierInfo: productData.supplierInfo,
                supplierPrice: productData.supplierPrice,
                isFeatured: productData.isFeatured || false,
                isActive: true,
                inStock: productData.stockQuantity > 0,
            });

            console.log(
                `${colors.green}✓${colors.reset} Created product: ${colors.bright}${productData.name}${colors.reset}`
            );
            successCount++;
        } catch (error) {
            console.error(
                `${colors.red}✗${colors.reset} Error creating product ${productData.name}:`,
                error instanceof Error ? error.message : error
            );
            errorCount++;
        }
    }

    console.log(
        `\n${colors.blue}Products Summary:${colors.reset} ${colors.green}${successCount} created${colors.reset}, ${colors.red}${errorCount} failed${colors.reset}`
    );
}

/**
 * Clear existing data
 */
async function clearDatabase(): Promise<void> {
    console.log(`\n${colors.yellow}Clearing existing data...${colors.reset}`);

    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();

    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log(
        `${colors.green}✓${colors.reset} Deleted ${productCount} products and ${categoryCount} categories`
    );
}

/**
 * Main seeder function
 */
async function seed(): Promise<void> {
    try {
        console.log(
            `\n${colors.bright}${colors.blue}========================================${colors.reset}`
        );
        console.log(
            `${colors.bright}${colors.blue}   Database Seeder${colors.reset}`
        );
        console.log(
            `${colors.bright}${colors.blue}========================================${colors.reset}\n`
        );

        // Connect to database
        console.log(`${colors.yellow}Connecting to database...${colors.reset}`);
        await connectDB();
        console.log(`${colors.green}✓${colors.reset} Connected to database\n`);

        // Clear existing data
        await clearDatabase();

        // Seed categories
        console.log(
            `\n${colors.yellow}Seeding categories...${colors.reset}\n`
        );
        const categoryMap = await createCategories(categoriesData);
        console.log(
            `\n${colors.green}✓${colors.reset} Created ${categoryMap.size} categories total`
        );

        // Seed products
        console.log(`\n${colors.yellow}Seeding products...${colors.reset}\n`);
        await createProducts();

        // Summary
        const finalProductCount = await Product.countDocuments();
        const finalCategoryCount = await Category.countDocuments();
        const featuredCount = await Product.countDocuments({ isFeatured: true });

        console.log(
            `\n${colors.bright}${colors.blue}========================================${colors.reset}`
        );
        console.log(
            `${colors.bright}${colors.green}   Seeding Complete!${colors.reset}`
        );
        console.log(
            `${colors.bright}${colors.blue}========================================${colors.reset}`
        );
        console.log(`${colors.bright}Categories:${colors.reset} ${finalCategoryCount}`);
        console.log(`${colors.bright}Products:${colors.reset} ${finalProductCount}`);
        console.log(`${colors.bright}Featured Products:${colors.reset} ${featuredCount}`);
        console.log(
            `${colors.bright}${colors.blue}========================================${colors.reset}\n`
        );

        process.exit(0);
    } catch (error) {
        console.error(
            `\n${colors.red}${colors.bright}Seeding failed:${colors.reset}`,
            error
        );
        process.exit(1);
    }
}

/**
 * Destroy all data (for testing)
 */
async function destroy(): Promise<void> {
    try {
        console.log(
            `\n${colors.bright}${colors.red}========================================${colors.reset}`
        );
        console.log(
            `${colors.bright}${colors.red}   Destroying Database${colors.reset}`
        );
        console.log(
            `${colors.bright}${colors.red}========================================${colors.reset}\n`
        );

        await connectDB();
        await clearDatabase();

        console.log(
            `\n${colors.green}✓${colors.reset} Database cleared successfully\n`
        );
        process.exit(0);
    } catch (error) {
        console.error(
            `\n${colors.red}${colors.bright}Destroy failed:${colors.reset}`,
            error
        );
        process.exit(1);
    }
}

// Run based on command line argument
const args = process.argv.slice(2);

if (args.includes('--destroy') || args.includes('-d')) {
    destroy();
} else {
    seed();
}
