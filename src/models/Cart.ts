import mongoose from 'mongoose';
import { cartSchema } from '../schemas/cart.schema.js';
import type { ICartDocument, CartModel } from '../types/cart.types.js';

export const Cart = mongoose.model<ICartDocument, CartModel>('Cart', cartSchema);
