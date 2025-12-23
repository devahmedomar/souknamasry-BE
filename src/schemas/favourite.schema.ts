import { Schema, Types } from 'mongoose';
import type { IFavouriteDocument, FavouriteModel } from '../types/favourite.types.js';

/**
 * Favourite Schema Definition
 * Stores user's favourite/wishlist products
 */
export const favouriteSchema = new Schema<IFavouriteDocument, FavouriteModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Ensure no duplicate products in the array
favouriteSchema.pre('save', function (next) {
    if (this.isModified('products')) {
        // Remove duplicates
        const uniqueProducts = [...new Set(this.products.map((p) => p.toString()))];
        this.products = uniqueProducts.map((id) => new Types.ObjectId(id));
    }
    next();
});
