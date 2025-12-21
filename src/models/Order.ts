import mongoose from 'mongoose';
import { orderSchema } from '../schemas/order.schema.js';
import type { IOrderDocument, OrderModel } from '../types/order.types.js';

export const Order = mongoose.model<IOrderDocument, OrderModel>('Order', orderSchema);
