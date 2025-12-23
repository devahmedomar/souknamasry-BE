import { Document, Model, Types } from 'mongoose';

/**
 * Interface representing a Favourite document in MongoDB
 * Contains user's favourite products list
 */
export interface IFavourite {
    user: Types.ObjectId;
    products: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Favourite Document type
 * Combines IFavourite interface with Mongoose Document
 */
export interface IFavouriteDocument extends IFavourite, Document { }

/**
 * Favourite Model type
 * Defines the type for the Favourite model
 */
export type FavouriteModel = Model<IFavouriteDocument>;
