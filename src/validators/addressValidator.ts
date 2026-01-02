import { body } from 'express-validator';

export const validateCreateAddress = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .trim()
        .isLength({ max: 100 })
        .withMessage('Name cannot exceed 100 characters'),
    body('phone')
        .notEmpty()
        .withMessage('Phone number is required')
        .trim(),
    body('city')
        .notEmpty()
        .withMessage('City is required')
        .trim()
        .isLength({ max: 100 })
        .withMessage('City cannot exceed 100 characters'),
    body('area')
        .notEmpty()
        .withMessage('Area is required')
        .trim()
        .isLength({ max: 100 })
        .withMessage('Area cannot exceed 100 characters'),
    body('street')
        .notEmpty()
        .withMessage('Street is required')
        .trim()
        .isLength({ max: 255 })
        .withMessage('Street cannot exceed 255 characters'),
    body('landmark')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Landmark cannot exceed 255 characters'),
    body('apartmentNumber')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Apartment number cannot exceed 20 characters'),
    body('isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault must be a boolean'),
];

export const validateUpdateAddress = [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Name cannot exceed 100 characters'),
    body('phone')
        .optional()
        .trim(),
    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City cannot exceed 100 characters'),
    body('area')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Area cannot exceed 100 characters'),
    body('street')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Street cannot exceed 255 characters'),
    body('landmark')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Landmark cannot exceed 255 characters'),
    body('apartmentNumber')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Apartment number cannot exceed 20 characters'),
    body('isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault must be a boolean'),
];
