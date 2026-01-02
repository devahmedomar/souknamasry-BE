import { Schema } from 'mongoose';
import type { IOrderDocument, OrderModel } from '../types/order.types.js';
import { PaymentMethod, PaymentStatus, OrderStatus } from '../types/order.types.js';

const orderItemSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productSnapshot: {
            name: { type: String, required: true },
            nameAr: { type: String },
            price: { type: Number, required: true },
            image: { type: String },
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity cannot be less than 1'],
        },
        price: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const shippingAddressSchema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        city: { type: String, required: true },
        area: { type: String, required: true },
        street: { type: String, required: true },
        landmark: { type: String },
        apartmentNumber: { type: String },
    },
    { _id: false }
);

export const orderSchema = new Schema<IOrderDocument, OrderModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items: unknown[]) => items.length > 0,
                message: 'Order must have at least one item',
            },
        },
        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        notes: {
            type: String,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Generate unique order number before saving
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.orderNumber = `ORD-${timestamp}-${random}`;
    }
    next();
});
