import { body } from 'express-validator';

export const validateAddItem = [
    body('productId')
        .notEmpty()
        .withMessage('ProductId is required')
        .isMongoId()
        .withMessage('Invalid ProductId format'),
    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
];

export const validateUpdateItem = [
    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
];

export const validateApplyCoupon = [
    body('couponCode')
        .notEmpty()
        .withMessage('Coupon code is required')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Coupon code must be at least 3 characters'),
];
