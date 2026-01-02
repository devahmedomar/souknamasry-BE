import { Document, Model, Types } from 'mongoose';

export enum PaymentMethod {
    COD = 'cod',
    CARD = 'card',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export interface IOrderItem {
    product: Types.ObjectId;
    productSnapshot: {
        name: string;
        nameAr?: string | undefined;
        price: number;
        image?: string | undefined;
    };
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface IShippingAddress {
    name: string;
    phone: string;
    city: string;
    area: string;
    street: string;
    landmark?: string | undefined;
    apartmentNumber?: string | undefined;
}

export interface IOrder {
    user: Types.ObjectId;
    orderNumber: string;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    status: OrderStatus;
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    notes?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrderDocument extends IOrder, Document { }

export type OrderModel = Model<IOrderDocument>;
