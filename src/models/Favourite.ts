import mongoose from 'mongoose';
import { favouriteSchema } from '../schemas/favourite.schema.js';
import type { IFavouriteDocument, FavouriteModel } from '../types/favourite.types.js';

/**
 * Favourite Model
 * Mongoose model for Favourite/Wishlist collection
 *
 * @example
 * // Get user's favourites
 * const favourites = await Favourite.findOne({ user: userId }).populate('products');
 *
 * @example
 * // Add product to favourites
 * await Favourite.findOneAndUpdate(
 *   { user: userId },
 *   { $addToSet: { products: productId } },
 *   { upsert: true, new: true }
 * );
 */
export const Favourite = mongoose.model<IFavouriteDocument, FavouriteModel>(
    'Favourite',
    favouriteSchema
);
