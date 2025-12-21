/**
 * Product Seed Data
 * Products organized by category path
 */

export interface ProductSeedData {
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    categoryPath: string[]; // Path to category (e.g., ['Electronics', 'Computers & Laptops', 'Laptops'])
    images: string[];
    stockQuantity: number;
    sku: string;
    supplierInfo?: {
        name: string;
        contact: string;
        notes?: string;
    };
    supplierPrice?: number;
    isFeatured?: boolean;
}

export const productsData: ProductSeedData[] = [
    // Electronics > Computers & Laptops > Laptops
    {
        name: 'MacBook Pro 16" M3 Max',
        description: 'The most powerful MacBook Pro ever is here. With the blazing-fast M3 Max chip, stunning 16-inch Liquid Retina XDR display, and up to 22 hours of battery life.',
        price: 2499.99,
        compareAtPrice: 2799.99,
        categoryPath: ['Electronics', 'Computers & Laptops', 'Laptops'],
        images: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
            'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
        ],
        stockQuantity: 25,
        sku: 'MBP-M3-16-001',
        supplierInfo: {
            name: 'Apple Authorized Distributor',
            contact: 'supplier@apple-dist.com',
            notes: 'Premium tier pricing',
        },
        supplierPrice: 2100.00,
        isFeatured: true,
    },
    {
        name: 'Dell XPS 15 9530',
        description: 'Premium laptop with 13th Gen Intel Core i7, 32GB RAM, 1TB SSD, and stunning 15.6" OLED display. Perfect for professionals and creators.',
        price: 1899.99,
        compareAtPrice: 2199.99,
        categoryPath: ['Electronics', 'Computers & Laptops', 'Laptops'],
        images: [
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
        ],
        stockQuantity: 30,
        sku: 'DELL-XPS15-001',
        supplierInfo: {
            name: 'Dell Direct',
            contact: 'b2b@dell.com',
        },
        supplierPrice: 1600.00,
        isFeatured: true,
    },
    {
        name: 'HP Pavilion 14 Laptop',
        description: 'Affordable and reliable laptop with AMD Ryzen 5, 16GB RAM, 512GB SSD. Great for everyday computing and students.',
        price: 649.99,
        categoryPath: ['Electronics', 'Computers & Laptops', 'Laptops'],
        images: [
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        ],
        stockQuantity: 50,
        sku: 'HP-PAV14-001',
        supplierInfo: {
            name: 'HP Distribution',
            contact: 'orders@hp-dist.com',
        },
        supplierPrice: 520.00,
    },
    {
        name: 'ASUS ROG Zephyrus G14',
        description: 'Powerful gaming laptop with AMD Ryzen 9, NVIDIA RTX 4060, 16GB RAM, and 1TB SSD. Compact 14" design with exceptional performance.',
        price: 1599.99,
        compareAtPrice: 1899.99,
        categoryPath: ['Electronics', 'Computers & Laptops', 'Laptops'],
        images: [
            'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
        ],
        stockQuantity: 20,
        sku: 'ASUS-ROG-G14-001',
        supplierInfo: {
            name: 'ASUS Gaming Division',
            contact: 'gaming@asus.com',
        },
        supplierPrice: 1350.00,
        isFeatured: true,
    },

    // Electronics > Computers & Laptops > Computer Accessories
    {
        name: 'Logitech MX Master 3S Wireless Mouse',
        description: 'Premium wireless mouse with ultra-fast scrolling, ergonomic design, and customizable buttons. Works on any surface including glass.',
        price: 99.99,
        compareAtPrice: 129.99,
        categoryPath: ['Electronics', 'Computers & Laptops', 'Computer Accessories'],
        images: [
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
        ],
        stockQuantity: 100,
        sku: 'LOG-MX3S-001',
        supplierInfo: {
            name: 'Logitech Wholesale',
            contact: 'b2b@logitech.com',
        },
        supplierPrice: 75.00,
        isFeatured: true,
    },
    {
        name: 'Keychron K8 Mechanical Keyboard',
        description: 'Wireless mechanical keyboard with hot-swappable switches, RGB backlighting, and Mac/Windows compatibility. Tactile typing experience.',
        price: 89.99,
        categoryPath: ['Electronics', 'Computers & Laptops', 'Computer Accessories'],
        images: [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
        ],
        stockQuantity: 75,
        sku: 'KEY-K8-001',
        supplierInfo: {
            name: 'Keychron Direct',
            contact: 'sales@keychron.com',
        },
        supplierPrice: 65.00,
    },
    {
        name: 'LG UltraWide 34" Monitor',
        description: '34-inch curved ultrawide monitor with QHD resolution, 144Hz refresh rate, and HDR10 support. Perfect for productivity and gaming.',
        price: 499.99,
        compareAtPrice: 649.99,
        categoryPath: ['Electronics', 'Computers & Laptops', 'Computer Accessories'],
        images: [
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
        ],
        stockQuantity: 40,
        sku: 'LG-UW34-001',
        supplierInfo: {
            name: 'LG Electronics',
            contact: 'commercial@lg.com',
        },
        supplierPrice: 400.00,
        isFeatured: true,
    },
    {
        name: 'USB-C Hub 7-in-1 Adapter',
        description: 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and 100W power delivery. Essential for modern laptops.',
        price: 39.99,
        categoryPath: ['Electronics', 'Computers & Laptops', 'Computer Accessories'],
        images: [
            'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800',
        ],
        stockQuantity: 150,
        sku: 'USBC-HUB-001',
        supplierInfo: {
            name: 'Tech Accessories Co',
            contact: 'orders@techacc.com',
        },
        supplierPrice: 25.00,
    },

    // Electronics > Mobile Phones & Tablets > Smartphones
    {
        name: 'iPhone 15 Pro Max 256GB',
        description: 'The ultimate iPhone with titanium design, A17 Pro chip, advanced camera system with 5x optical zoom, and Action button.',
        price: 1199.99,
        compareAtPrice: 1299.99,
        categoryPath: ['Electronics', 'Mobile Phones & Tablets', 'Smartphones'],
        images: [
            'https://images.unsplash.com/photo-1592286927505-c0d0eb5a1ec2?w=800',
            'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800',
        ],
        stockQuantity: 45,
        sku: 'IPH15PM-256-001',
        supplierInfo: {
            name: 'Apple Authorized Distributor',
            contact: 'supplier@apple-dist.com',
        },
        supplierPrice: 1000.00,
        isFeatured: true,
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android flagship with S Pen, 200MP camera, Snapdragon 8 Gen 3, and stunning 6.8" Dynamic AMOLED display.',
        price: 1099.99,
        categoryPath: ['Electronics', 'Mobile Phones & Tablets', 'Smartphones'],
        images: [
            'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
        ],
        stockQuantity: 35,
        sku: 'SAM-S24U-001',
        supplierInfo: {
            name: 'Samsung Electronics',
            contact: 'b2b@samsung.com',
        },
        supplierPrice: 920.00,
        isFeatured: true,
    },
    {
        name: 'Google Pixel 8 Pro',
        description: 'Best Android camera phone with Google Tensor G3, AI-powered features, and pure Android experience. 6.7" LTPO OLED display.',
        price: 899.99,
        categoryPath: ['Electronics', 'Mobile Phones & Tablets', 'Smartphones'],
        images: [
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
        ],
        stockQuantity: 30,
        sku: 'GOO-PIX8P-001',
        supplierInfo: {
            name: 'Google Store',
            contact: 'partners@google.com',
        },
        supplierPrice: 750.00,
    },

    // Electronics > Mobile Phones & Tablets > Mobile Accessories
    {
        name: 'Anker PowerCore 20000mAh Power Bank',
        description: 'High-capacity portable charger with fast charging, dual USB ports, and PowerIQ technology. Charges phones multiple times.',
        price: 49.99,
        categoryPath: ['Electronics', 'Mobile Phones & Tablets', 'Mobile Accessories'],
        images: [
            'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
        ],
        stockQuantity: 200,
        sku: 'ANK-PC20K-001',
        supplierInfo: {
            name: 'Anker Innovations',
            contact: 'wholesale@anker.com',
        },
        supplierPrice: 35.00,
    },
    {
        name: 'Spigen Ultra Hybrid Phone Case',
        description: 'Clear protective case with air cushion technology and raised bezels. Compatible with iPhone 15 Pro Max.',
        price: 24.99,
        categoryPath: ['Electronics', 'Mobile Phones & Tablets', 'Mobile Accessories'],
        images: [
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
        ],
        stockQuantity: 250,
        sku: 'SPI-UH-IPH15-001',
        supplierInfo: {
            name: 'Spigen Inc',
            contact: 'orders@spigen.com',
        },
        supplierPrice: 15.00,
    },

    // Electronics > Audio & Headphones > Wireless Headphones
    {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise cancellation, exceptional sound quality, 30-hour battery life, and premium comfort. Perfect for travel and work.',
        price: 399.99,
        compareAtPrice: 449.99,
        categoryPath: ['Electronics', 'Audio & Headphones', 'Wireless Headphones'],
        images: [
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
            'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800',
        ],
        stockQuantity: 60,
        sku: 'SONY-WH1000XM5-001',
        supplierInfo: {
            name: 'Sony Electronics',
            contact: 'b2b@sony.com',
        },
        supplierPrice: 320.00,
        isFeatured: true,
    },
    {
        name: 'Bose QuietComfort 45',
        description: 'Premium wireless headphones with world-class noise cancellation, balanced sound, and all-day comfort. 24-hour battery life.',
        price: 329.99,
        categoryPath: ['Electronics', 'Audio & Headphones', 'Wireless Headphones'],
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        ],
        stockQuantity: 50,
        sku: 'BOSE-QC45-001',
        supplierInfo: {
            name: 'Bose Corporation',
            contact: 'commercial@bose.com',
        },
        supplierPrice: 270.00,
        isFeatured: true,
    },

    // Electronics > Audio & Headphones > Earbuds
    {
        name: 'Apple AirPods Pro (2nd Gen)',
        description: 'Advanced active noise cancellation, Adaptive Audio, and personalized spatial audio. MagSafe charging case with speaker.',
        price: 249.99,
        categoryPath: ['Electronics', 'Audio & Headphones', 'Earbuds'],
        images: [
            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
        ],
        stockQuantity: 100,
        sku: 'APP-PRO2-001',
        supplierInfo: {
            name: 'Apple Authorized Distributor',
            contact: 'supplier@apple-dist.com',
        },
        supplierPrice: 210.00,
        isFeatured: true,
    },
    {
        name: 'Samsung Galaxy Buds2 Pro',
        description: 'Premium wireless earbuds with intelligent ANC, 360 Audio, and Hi-Fi sound. IPX7 water resistance.',
        price: 179.99,
        compareAtPrice: 229.99,
        categoryPath: ['Electronics', 'Audio & Headphones', 'Earbuds'],
        images: [
            'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
        ],
        stockQuantity: 80,
        sku: 'SAM-BUDS2P-001',
        supplierInfo: {
            name: 'Samsung Electronics',
            contact: 'b2b@samsung.com',
        },
        supplierPrice: 145.00,
    },

    // Fashion > Men's Fashion > Men's Shirts
    {
        name: 'Classic Oxford Button-Down Shirt',
        description: 'Timeless oxford shirt in premium cotton. Perfect for business casual or smart casual occasions. Available in multiple colors.',
        price: 49.99,
        categoryPath: ["Fashion & Apparel", "Men's Fashion", "Men's Shirts"],
        images: [
            'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        ],
        stockQuantity: 120,
        sku: 'MEN-OXF-SH-001',
        supplierInfo: {
            name: 'Premium Textiles Co',
            contact: 'orders@premtex.com',
        },
        supplierPrice: 30.00,
    },
    {
        name: 'Casual Linen Shirt',
        description: 'Lightweight and breathable linen shirt. Perfect for summer and casual occasions. Relaxed fit.',
        price: 39.99,
        categoryPath: ["Fashion & Apparel", "Men's Fashion", "Men's Shirts"],
        images: [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
        ],
        stockQuantity: 90,
        sku: 'MEN-LIN-SH-001',
        supplierInfo: {
            name: 'Linen Imports',
            contact: 'sales@linenimports.com',
        },
        supplierPrice: 25.00,
    },

    // Fashion > Men's Fashion > Men's Shoes
    {
        name: 'Nike Air Max 270 Sneakers',
        description: "Iconic sneakers with Max Air cushioning, breathable mesh upper, and modern design. All-day comfort for men.",
        price: 149.99,
        compareAtPrice: 179.99,
        categoryPath: ["Fashion & Apparel", "Men's Fashion", "Men's Shoes"],
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        ],
        stockQuantity: 70,
        sku: 'NIKE-AM270-001',
        supplierInfo: {
            name: 'Nike Wholesale',
            contact: 'b2b@nike.com',
        },
        supplierPrice: 110.00,
        isFeatured: true,
    },
    {
        name: 'Classic Leather Oxford Shoes',
        description: 'Elegant leather oxford shoes for formal occasions. Handcrafted with premium leather and cushioned insole.',
        price: 129.99,
        categoryPath: ["Fashion & Apparel", "Men's Fashion", "Men's Shoes"],
        images: [
            'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
        ],
        stockQuantity: 55,
        sku: 'MEN-OXF-SH-001',
        supplierInfo: {
            name: 'Leather Goods Ltd',
            contact: 'orders@leathergoods.com',
        },
        supplierPrice: 90.00,
    },

    // Fashion > Women's Fashion > Women's Dresses
    {
        name: 'Floral Summer Dress',
        description: 'Beautiful floral print dress in lightweight fabric. Perfect for summer occasions and garden parties. Midi length.',
        price: 79.99,
        categoryPath: ["Fashion & Apparel", "Women's Fashion", "Women's Dresses"],
        images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        ],
        stockQuantity: 85,
        sku: 'WOM-FLO-DR-001',
        supplierInfo: {
            name: 'Fashion Imports',
            contact: 'wholesale@fashionimp.com',
        },
        supplierPrice: 50.00,
    },
    {
        name: 'Elegant Evening Gown',
        description: 'Sophisticated evening gown with elegant silhouette. Perfect for formal events and special occasions. Floor length.',
        price: 199.99,
        compareAtPrice: 249.99,
        categoryPath: ["Fashion & Apparel", "Women's Fashion", "Women's Dresses"],
        images: [
            'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
        ],
        stockQuantity: 40,
        sku: 'WOM-EVE-GW-001',
        supplierInfo: {
            name: 'Luxury Fashion House',
            contact: 'orders@luxfashion.com',
        },
        supplierPrice: 140.00,
        isFeatured: true,
    },

    // Home & Living > Furniture > Living Room Furniture
    {
        name: 'Modern L-Shaped Sectional Sofa',
        description: 'Spacious and comfortable L-shaped sofa with premium upholstery. Seats 5-6 people. Available in multiple colors.',
        price: 1299.99,
        compareAtPrice: 1599.99,
        categoryPath: ['Home & Living', 'Furniture', 'Living Room Furniture'],
        images: [
            'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
        ],
        stockQuantity: 15,
        sku: 'SOFA-LSHP-001',
        supplierInfo: {
            name: 'Furniture Manufacturers Inc',
            contact: 'b2b@furnman.com',
        },
        supplierPrice: 950.00,
        isFeatured: true,
    },
    {
        name: 'Scandinavian Coffee Table',
        description: 'Minimalist coffee table with solid wood construction and clean lines. Perfect for modern living rooms.',
        price: 249.99,
        categoryPath: ['Home & Living', 'Furniture', 'Living Room Furniture'],
        images: [
            'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800',
        ],
        stockQuantity: 45,
        sku: 'COFF-SCAN-001',
        supplierInfo: {
            name: 'Nordic Furniture Co',
            contact: 'sales@nordicfurn.com',
        },
        supplierPrice: 180.00,
    },

    // Home & Living > Furniture > Office Furniture
    {
        name: 'Ergonomic Office Chair',
        description: 'Premium ergonomic chair with lumbar support, adjustable armrests, and breathable mesh back. Perfect for long work hours.',
        price: 349.99,
        compareAtPrice: 449.99,
        categoryPath: ['Home & Living', 'Furniture', 'Office Furniture'],
        images: [
            'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
        ],
        stockQuantity: 60,
        sku: 'CHAIR-ERG-001',
        supplierInfo: {
            name: 'Office Solutions Ltd',
            contact: 'orders@officesol.com',
        },
        supplierPrice: 250.00,
        isFeatured: true,
    },
    {
        name: 'Standing Desk Adjustable',
        description: 'Electric height-adjustable standing desk with memory presets. Promotes healthy work habits. 60" wide surface.',
        price: 599.99,
        categoryPath: ['Home & Living', 'Furniture', 'Office Furniture'],
        images: [
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
        ],
        stockQuantity: 30,
        sku: 'DESK-STAND-001',
        supplierInfo: {
            name: 'Workspace Innovations',
            contact: 'b2b@workspace.com',
        },
        supplierPrice: 450.00,
        isFeatured: true,
    },

    // Sports & Outdoors > Fitness Equipment
    {
        name: 'Adjustable Dumbbell Set',
        description: 'Space-saving adjustable dumbbells from 5-52.5 lbs. Perfect for home gym. Includes storage tray.',
        price: 299.99,
        categoryPath: ['Sports & Outdoors', 'Fitness Equipment'],
        images: [
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        ],
        stockQuantity: 50,
        sku: 'DUMB-ADJ-001',
        supplierInfo: {
            name: 'Fitness Gear Pro',
            contact: 'wholesale@fitnesspro.com',
        },
        supplierPrice: 220.00,
        isFeatured: true,
    },
    {
        name: 'Yoga Mat Premium',
        description: 'Extra-thick yoga mat with non-slip surface and carrying strap. Eco-friendly materials. 6mm thickness.',
        price: 39.99,
        categoryPath: ['Sports & Outdoors', 'Fitness Equipment'],
        images: [
            'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
        ],
        stockQuantity: 150,
        sku: 'YOGA-MAT-001',
        supplierInfo: {
            name: 'Wellness Products Co',
            contact: 'orders@wellness.com',
        },
        supplierPrice: 25.00,
    },

    // Beauty & Personal Care > Skincare
    {
        name: 'Vitamin C Serum',
        description: 'Brightening vitamin C serum with hyaluronic acid. Reduces dark spots and improves skin texture. 30ml bottle.',
        price: 34.99,
        categoryPath: ['Beauty & Personal Care', 'Skincare'],
        images: [
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
        ],
        stockQuantity: 200,
        sku: 'SKIN-VITC-001',
        supplierInfo: {
            name: 'Beauty Labs',
            contact: 'wholesale@beautylabs.com',
        },
        supplierPrice: 20.00,
    },
    {
        name: 'Hydrating Face Moisturizer',
        description: 'Lightweight daily moisturizer with SPF 30. Suitable for all skin types. Non-greasy formula.',
        price: 29.99,
        categoryPath: ['Beauty & Personal Care', 'Skincare'],
        images: [
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
        ],
        stockQuantity: 180,
        sku: 'SKIN-MOIST-001',
        supplierInfo: {
            name: 'Skincare Essentials',
            contact: 'orders@skincare.com',
        },
        supplierPrice: 18.00,
    },

    // Books & Media > Books
    {
        name: 'The Psychology of Money',
        description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel. Bestselling personal finance book.',
        price: 19.99,
        categoryPath: ['Books & Media', 'Books'],
        images: [
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
        ],
        stockQuantity: 100,
        sku: 'BOOK-PSY-MON-001',
        supplierInfo: {
            name: 'Book Distributors Inc',
            contact: 'orders@bookdist.com',
        },
        supplierPrice: 12.00,
    },
    {
        name: 'Atomic Habits',
        description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear. International bestseller.',
        price: 17.99,
        categoryPath: ['Books & Media', 'Books'],
        images: [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
        ],
        stockQuantity: 120,
        sku: 'BOOK-ATO-HAB-001',
        supplierInfo: {
            name: 'Book Distributors Inc',
            contact: 'orders@bookdist.com',
        },
        supplierPrice: 11.00,
        isFeatured: true,
    },
];
