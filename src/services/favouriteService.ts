import { Favourite } from '../models/Favourite.js';
import { Product } from '../models/Product.js';
import type { IFavouriteDocument } from '../types/favourite.types.js';

export class FavouriteService {
    /**
     * Get user's favourites list
     * Creates a new favourites document if one doesn't exist
     */
    static async getFavourites(userId: string): Promise<IFavouriteDocument> {
        let favourites = await Favourite.findOne({ user: userId }).populate({
            path: 'products',
            select: 'name nameAr slug price compareAtPrice images inStock stockQuantity isFeatured',
        });

        if (!favourites) {
            favourites = await Favourite.create({
                user: userId,
                products: [],
            });
        }

        return favourites;
    }

    /**
     * Add a product to favourites
     */
    static async addProduct(userId: string, productId: string): Promise<IFavouriteDocument> {
        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('product.productNotFound');
        }

        // Use $addToSet to avoid duplicates
        const favourites = await Favourite.findOneAndUpdate(
            { user: userId },
            { $addToSet: { products: productId } },
            { upsert: true, new: true }
        ).populate({
            path: 'products',
            select: 'name nameAr slug price compareAtPrice images inStock stockQuantity isFeatured',
        });

        return favourites!;
    }

    /**
     * Remove a product from favourites
     */
    static async removeProduct(userId: string, productId: string): Promise<IFavouriteDocument> {
        const favourites = await Favourite.findOneAndUpdate(
            { user: userId },
            { $pull: { products: productId } },
            { new: true }
        ).populate({
            path: 'products',
            select: 'name nameAr slug price compareAtPrice images inStock stockQuantity isFeatured',
        });

        if (!favourites) {
            throw new Error('favourite.notFound');
        }

        return favourites;
    }

    /**
     * Clear all favourites
     */
    static async clearFavourites(userId: string): Promise<void> {
        await Favourite.findOneAndUpdate(
            { user: userId },
            { $set: { products: [] } }
        );
    }

    /**
     * Check if a product is in user's favourites
     */
    static async isFavourite(userId: string, productId: string): Promise<boolean> {
        const favourites = await Favourite.findOne({
            user: userId,
            products: productId,
        });

        return !!favourites;
    }

    /**
     * Get favourites count for a user
     */
    static async getCount(userId: string): Promise<number> {
        const favourites = await Favourite.findOne({ user: userId });
        return favourites?.products.length ?? 0;
    }
}
