import { Types } from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import type { ICartDocument } from '../types/cart.types.js';

export class CartService {
    /**
     * Get cart by user ID
     * Creates a new cart if one doesn't exist
     */
    static async getCart(userId: string): Promise<ICartDocument> {
        let cart: ICartDocument | null = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            cart = (await Cart.create({
                user: userId,
                items: [],
            })) as ICartDocument;
        }

        return cart;
    }

    /**
     * Add item to cart
     */
    static async addItem(
        userId: string,
        productId: string,
        quantity: number
    ): Promise<ICartDocument> {
        const product = await Product.findById(productId);

        if (!product) {
            throw new Error('product.productNotFound');
        }

        if (!product.inStock || product.stockQuantity < quantity) {
            throw new Error('product.outOfStock');
        }

        let cart = await this.getCart(userId);

        const existingItemIndex = cart.items.findIndex(
            (item) => (item.product as any)._id.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Item exists, update quantity
            const newQuantity = cart.items[existingItemIndex]!.quantity + quantity;

            if (product.stockQuantity < newQuantity) {
                throw new Error('product.insufficientStock');
            }

            cart.items[existingItemIndex]!.quantity = newQuantity;
        } else {
            // New item
            cart.items.push({
                product: product._id,
                quantity,
                price: product.price,
                totalPrice: product.price * quantity,
            } as any);
        }

        await cart.save();
        return await cart.populate('items.product');
    }

    /**
     * Update item quantity
     */
    static async updateItemQuantity(
        userId: string,
        itemId: string,
        quantity: number
    ): Promise<ICartDocument> {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new Error('cart.cartNotFound');
        }

        const itemIndex = cart.items.findIndex((item) => item._id?.toString() === itemId);

        if (itemIndex === -1) {
            throw new Error('cart.itemNotFound');
        }

        const productId = (cart.items[itemIndex]!.product as any)._id || cart.items[itemIndex]!.product;
        const product = await Product.findById(productId);

        if (!product) {
            throw new Error('product.productNotFound');
        }

        if (product.stockQuantity < quantity) {
            throw new Error('product.insufficientStock');
        }

        cart.items[itemIndex]!.quantity = quantity;

        await cart.save();
        return await cart.populate('items.product');
    }

    /**
     * Remove item from cart
     */
    static async removeItem(userId: string, itemId: string): Promise<ICartDocument> {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            throw new Error('cart.cartNotFound');
        }

        cart.items = cart.items.filter((item) => item._id?.toString() !== itemId);

        await cart.save();
        return await cart.populate('items.product');
    }

    /**
     * Clear cart
     */
    static async clearCart(userId: string): Promise<void> {
        const cart = await Cart.findOne({ user: userId });

        if (cart) {
            cart.items = [];
            cart.subtotal = 0;
            cart.total = 0;
            cart.coupon = undefined;
            cart.discount = 0;
            await cart.save();
        }
    }

    /**
     * Apply coupon
     * Note: This is a basic implementation. Real world would verify against a Coupon model.
     */
    static async applyCoupon(userId: string, couponCode: string): Promise<ICartDocument> {
        const cart = await this.getCart(userId);

        // Mock coupon logic - in real (app) implement Coupon lookup
        // For now, let's assume 'SAVE10' gives 10% off and 'FIXED50' gives 50 off

        let discount = 0;

        if (couponCode === 'SAVE10') {
            discount = cart.subtotal * 0.10;
        } else if (couponCode === 'FIXED50') {
            discount = 50;
        } else {
            throw new Error('coupon.invalid');
        }

        // Ensure discount doesn't exceed subtotal
        if (discount > cart.subtotal) {
            discount = cart.subtotal;
        }

        cart.coupon = couponCode;
        cart.discount = parseFloat(discount.toFixed(2));

        // Recalc total done in pre-save, but we set discount
        await cart.save();
        return await cart.populate('items.product');
    }
}
