/**
 * Category Seed Data
 * Hierarchical category structure for e-commerce
 */

export interface CategorySeedData {
    name: string;
    description: string;
    image?: string;
    children?: CategorySeedData[];
}

export const categoriesData: CategorySeedData[] = [
    {
        name: 'Electronics',
        description: 'Electronic devices, gadgets, and accessories',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
        children: [
            {
                name: 'Computers & Laptops',
                description: 'Desktop computers, laptops, and accessories',
                image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
                children: [
                    {
                        name: 'Laptops',
                        description: 'Portable computers for work and gaming',
                        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
                    },
                    {
                        name: 'Desktop Computers',
                        description: 'High-performance desktop PCs',
                        image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',
                    },
                    {
                        name: 'Computer Accessories',
                        description: 'Keyboards, mice, monitors, and more',
                        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
                    },
                ],
            },
            {
                name: 'Mobile Phones & Tablets',
                description: 'Smartphones, tablets, and mobile accessories',
                image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
                children: [
                    {
                        name: 'Smartphones',
                        description: 'Latest smartphones from top brands',
                        image: 'https://images.unsplash.com/photo-1592286927505-c0d0eb5a1ec2?w=800',
                    },
                    {
                        name: 'Tablets',
                        description: 'Tablets for work and entertainment',
                        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800',
                    },
                    {
                        name: 'Mobile Accessories',
                        description: 'Cases, chargers, and screen protectors',
                        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
                    },
                ],
            },
            {
                name: 'Audio & Headphones',
                description: 'Headphones, speakers, and audio equipment',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                children: [
                    {
                        name: 'Wireless Headphones',
                        description: 'Bluetooth and wireless headphones',
                        image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
                    },
                    {
                        name: 'Speakers',
                        description: 'Portable and home speakers',
                        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
                    },
                    {
                        name: 'Earbuds',
                        description: 'In-ear wireless earbuds',
                        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
                    },
                ],
            },
            {
                name: 'Cameras & Photography',
                description: 'Digital cameras, lenses, and photography gear',
                image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
            },
        ],
    },
    {
        name: 'Fashion & Apparel',
        description: 'Clothing, shoes, and fashion accessories',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
        children: [
            {
                name: "Men's Fashion",
                description: "Men's clothing and accessories",
                image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800',
                children: [
                    {
                        name: "Men's Shirts",
                        description: 'Casual and formal shirts for men',
                        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
                    },
                    {
                        name: "Men's Pants",
                        description: 'Jeans, trousers, and casual pants',
                        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
                    },
                    {
                        name: "Men's Shoes",
                        description: 'Sneakers, formal shoes, and boots',
                        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
                    },
                ],
            },
            {
                name: "Women's Fashion",
                description: "Women's clothing and accessories",
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
                children: [
                    {
                        name: "Women's Dresses",
                        description: 'Casual and formal dresses',
                        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
                    },
                    {
                        name: "Women's Tops",
                        description: 'Blouses, t-shirts, and tops',
                        image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800',
                    },
                    {
                        name: "Women's Shoes",
                        description: 'Heels, flats, and sneakers',
                        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
                    },
                ],
            },
            {
                name: 'Accessories',
                description: 'Bags, watches, and fashion accessories',
                image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800',
            },
        ],
    },
    {
        name: 'Home & Living',
        description: 'Furniture, home decor, and living essentials',
        image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
        children: [
            {
                name: 'Furniture',
                description: 'Sofas, tables, chairs, and storage',
                image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
                children: [
                    {
                        name: 'Living Room Furniture',
                        description: 'Sofas, coffee tables, and TV stands',
                        image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
                    },
                    {
                        name: 'Bedroom Furniture',
                        description: 'Beds, wardrobes, and nightstands',
                        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
                    },
                    {
                        name: 'Office Furniture',
                        description: 'Desks, chairs, and storage solutions',
                        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
                    },
                ],
            },
            {
                name: 'Home Decor',
                description: 'Wall art, lighting, and decorative items',
                image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
            },
            {
                name: 'Kitchen & Dining',
                description: 'Cookware, dinnerware, and kitchen tools',
                image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
            },
        ],
    },
    {
        name: 'Sports & Outdoors',
        description: 'Sports equipment, outdoor gear, and fitness',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
        children: [
            {
                name: 'Fitness Equipment',
                description: 'Gym equipment and fitness accessories',
                image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
            },
            {
                name: 'Outdoor Recreation',
                description: 'Camping, hiking, and outdoor gear',
                image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
            },
            {
                name: 'Sports Apparel',
                description: 'Athletic wear and sports clothing',
                image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
            },
        ],
    },
    {
        name: 'Beauty & Personal Care',
        description: 'Cosmetics, skincare, and personal care products',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
        children: [
            {
                name: 'Skincare',
                description: 'Cleansers, moisturizers, and treatments',
                image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
            },
            {
                name: 'Makeup',
                description: 'Cosmetics and makeup products',
                image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
            },
            {
                name: 'Hair Care',
                description: 'Shampoos, conditioners, and styling products',
                image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
            },
        ],
    },
    {
        name: 'Books & Media',
        description: 'Books, movies, music, and entertainment',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
        children: [
            {
                name: 'Books',
                description: 'Fiction, non-fiction, and educational books',
                image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
            },
            {
                name: 'Movies & TV',
                description: 'DVDs, Blu-rays, and digital media',
                image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
            },
        ],
    },
];
