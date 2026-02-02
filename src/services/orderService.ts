import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Address } from '../models/Address.js';
import { Product } from '../models/Product.js';
import { CartService } from './cartService.js';
import type { IOrderDocument, IOrderItem, IShippingAddress } from '../types/order.types.js';
import { PaymentMethod, PaymentStatus, OrderStatus } from '../types/order.types.js';

export interface PlaceOrderInput {
    shippingAddressId: string;
    paymentMethod: PaymentMethod;
    notes?: string;
}

export interface CheckoutSummary {
    items: Array<{
        productId: string;
        name: string;
        nameAr?: string;
        image?: string;
        quantity: number;
        price: number;
        totalPrice: number;
    }>;
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    itemCount: number;
}

export class OrderService {
    private static readonly SHIPPING_COST = 50; // Fixed shipping cost for now

    /**
     * Get checkout summary
     */
    static async getCheckoutSummary(userId: string): Promise<CheckoutSummary> {
        const cart = await CartService.getCart(userId);

        const items = cart.items.map((item) => {
            const product = item.product as any;
            return {
                productId: product._id?.toString() || item.product.toString(),
                name: product.name || 'Unknown Product',
                nameAr: product.nameAr,
                image: product.images?.[0],
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.totalPrice,
            };
        });

        const shippingCost = cart.items.length > 0 ? this.SHIPPING_COST : 0;
        const total = cart.subtotal + shippingCost - cart.discount;

        return {
            items,
            subtotal: cart.subtotal,
            shippingCost,
            discount: cart.discount,
            total: Math.max(0, total),
            itemCount: cart.itemCount,
        };
    }

    /**
     * Place an order
     */
    static async placeOrder(userId: string, input: PlaceOrderInput): Promise<IOrderDocument> {
        // 1. Get cart and validate it's not empty
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            throw new Error('order.emptyCart');
        }

        // 2. Get and validate address
        const address = await Address.findOne({ _id: input.shippingAddressId, user: userId });

        if (!address) {
            throw new Error('order.addressNotFound');
        }

        // 3. Validate stock for all items
        for (const item of cart.items) {
            const product = await Product.findById(
                (item.product as any)._id || item.product
            );

            if (!product) {
                throw new Error(`order.productNotFound`);
            }

            if (!product.inStock || product.stockQuantity < item.quantity) {
                throw new Error(`order.productOutOfStock:${product.name}`);
            }
        }

        // 4. Build order items with product snapshots
        const orderItems: IOrderItem[] = await Promise.all(
            cart.items.map(async (item) => {
                const product = await Product.findById(
                    (item.product as any)._id || item.product
                );

                return {
                    product: product!._id,
                    productSnapshot: {
                        name: product!.name,
                        nameAr: undefined,
                        price: product!.price,
                        image: product!.images?.[0],
                    },
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice,
                };
            })
        );

        // 5. Build shipping address snapshot
        // 5. Build shipping address snapshot
        const shippingAddress: IShippingAddress = {
            name: address.name,
            phone: address.phone,
            city: address.city,
            area: address.area,
            street: address.street,
            landmark: address.landmark,
            apartmentNumber: address.apartmentNumber,
        };

        // 6. Calculate totals
        const shippingCost = this.SHIPPING_COST;
        const total = cart.subtotal + shippingCost - cart.discount;

        // 7. Create order
        const order = await Order.create({
            user: userId,
            items: orderItems,
            shippingAddress,
            paymentMethod: input.paymentMethod,
            paymentStatus: input.paymentMethod === PaymentMethod.COD
                ? PaymentStatus.PENDING
                : PaymentStatus.PENDING,
            status: OrderStatus.PENDING,
            subtotal: cart.subtotal,
            shippingCost,
            discount: cart.discount,
            total: Math.max(0, total),
            notes: input.notes,
        });

        // 8. Reduce stock for all products
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(
                (item.product as any)._id || item.product,
                { $inc: { stockQuantity: -item.quantity } }
            );
        }

        // 9. Clear cart
        await CartService.clearCart(userId);

        return order;
    }

    /**
     * Get user's order history
     */
    static async getOrders(userId: string): Promise<IOrderDocument[]> {
        return await Order.find({ user: userId }).sort({ createdAt: -1 });
    }

    /**
     * Get a single order by ID
     */
    static async getOrderById(userId: string, orderId: string): Promise<IOrderDocument | null> {
        return await Order.findOne({ _id: orderId, user: userId });
    }

    /**
     * Cancel an order (only if it's still pending)
     */
    static async cancelOrder(userId: string, orderId: string): Promise<IOrderDocument | null> {
        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            return null;
        }

        if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
            throw new Error('order.cannotCancel');
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stockQuantity: item.quantity },
            });
        }

        order.status = OrderStatus.CANCELLED;
        await order.save();

        return order;
    }

    // ============== ADMIN OPERATIONS ==============

    /**
     * Get all orders for admin
     * @param page - Page number
     * @param limit - Items per page
     * @param filters - Optional filters
     * @returns Orders with pagination
     */
    static async getAllOrdersAdmin(
        page: number = 1,
        limit: number = 20,
        filters?: {
            orderStatus?: OrderStatus;
            paymentStatus?: PaymentStatus;
            search?: string;
            startDate?: Date;
            endDate?: Date;
        }
    ): Promise<{
        orders: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> {
        const skip = (page - 1) * limit;
        const filter: any = {};

        if (filters?.orderStatus) {
            filter.orderStatus = filters.orderStatus;
        }

        if (filters?.paymentStatus) {
            filter.paymentStatus = filters.paymentStatus;
        }

        if (filters?.startDate || filters?.endDate) {
            filter.createdAt = {};
            if (filters.startDate) {
                filter.createdAt.$gte = filters.startDate;
            }
            if (filters.endDate) {
                filter.createdAt.$lte = filters.endDate;
            }
        }

        if (filters?.search) {
            filter.orderNumber = { $regex: filters.search, $options: 'i' };
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'firstName lastName email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(filter),
        ]);

        return {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get order by ID (Admin)
     * @param orderId - Order ID
     * @returns Order details
     */
    static async getOrderByIdAdmin(orderId: string): Promise<any> {
        const order = await Order.findById(orderId)
            .populate('user', 'firstName lastName email phone')
            .lean();

        if (!order) {
            throw new Error('order.orderNotFound');
        }

        return order;
    }

    /**
     * Update order status (Admin)
     * @param orderId - Order ID
     * @param orderStatus - New order status
     * @returns Updated order
     */
    static async updateOrderStatus(
        orderId: string,
        orderStatus: OrderStatus
    ): Promise<any> {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status: orderStatus },
            { new: true }
        )
            .populate('user', 'firstName lastName email phone')
            .lean();

        if (!order) {
            throw new Error('order.orderNotFound');
        }

        return order;
    }

    /**
     * Update payment status (Admin)
     * @param orderId - Order ID
     * @param paymentStatus - New payment status
     * @returns Updated order
     */
    static async updatePaymentStatus(
        orderId: string,
        paymentStatus: PaymentStatus
    ): Promise<any> {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { paymentStatus },
            { new: true }
        )
            .populate('user', 'firstName lastName email phone')
            .lean();

        if (!order) {
            throw new Error('order.orderNotFound');
        }

        return order;
    }

    /**
     * Delete order (Admin)
     * @param orderId - Order ID
     */
    static async deleteOrder(orderId: string): Promise<void> {
        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            throw new Error('order.orderNotFound');
        }
    }
}
