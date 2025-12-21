import { body } from 'express-validator';

export const validateCreateAddress = [
    body('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .trim()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .notEmpty()
        .withMessage('Last name is required')
        .trim()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
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
    body('addressLine')
        .notEmpty()
        .withMessage('Address is required')
        .trim()
        .isLength({ max: 255 })
        .withMessage('Address cannot exceed 255 characters'),
    body('nearestLandmark')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Nearest landmark cannot exceed 255 characters'),
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
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    body('phone')
        .optional()
        .trim(),
    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City cannot exceed 100 characters'),
    body('addressLine')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Address cannot exceed 255 characters'),
    body('nearestLandmark')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Nearest landmark cannot exceed 255 characters'),
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
