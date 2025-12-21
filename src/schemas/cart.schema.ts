import { Schema } from 'mongoose';
import type { ICart, CartModel, ICartDocument } from '../types/cart.types.js';

const cartItemSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity can not be less than 1.'],
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
    { _id: true }
);

export const cartSchema = new Schema<ICartDocument, CartModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [cartItemSchema],
        subtotal: {
            type: Number,
            default: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        shipping: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            default: 0,
        },
        coupon: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

cartSchema.virtual('itemCount').get(function (this: ICartDocument) {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.pre('save', function (next) {
    // Recalculate item totals and cart subtotal
    this.subtotal = this.items.reduce((total, item) => {
        item.totalPrice = item.price * item.quantity;
        return total + item.totalPrice;
    }, 0);

    // Recalculate total
    // Note: Tax and shipping logic should be handled by service, this is a safeguard
    this.total = this.subtotal + this.tax + this.shipping - this.discount;

    // Ensure total is not negative
    if (this.total < 0) this.total = 0;

    next();
});
