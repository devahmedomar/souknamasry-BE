import { Document, Model, Types } from 'mongoose';
import type { IProduct } from './product.types.js';

export interface ICartItem {
    product: Types.ObjectId | IProduct;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface ICart {
    user: Types.ObjectId;
    items: ICartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    coupon?: string;
    itemCount: number;
}

export interface ICartDocument extends ICart, Document { }

export type CartModel = Model<ICartDocument>;
