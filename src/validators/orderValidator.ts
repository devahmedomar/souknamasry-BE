import { body } from 'express-validator';
import { PaymentMethod } from '../types/order.types.js';

export const validatePlaceOrder = [
    body('shippingAddressId')
        .notEmpty()
        .withMessage('Shipping address ID is required')
        .isMongoId()
        .withMessage('Invalid shipping address ID format'),
    body('paymentMethod')
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(Object.values(PaymentMethod))
        .withMessage(`Payment method must be one of: ${Object.values(PaymentMethod).join(', ')}`),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters'),
];
