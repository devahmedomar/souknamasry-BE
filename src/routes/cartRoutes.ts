import { Router } from 'express';
import { CartController } from '../controllers/cartController.js';
import { verifyToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
    validateAddItem,
    validateUpdateItem,
    validateApplyCoupon,
} from '../validators/cartValidator.js';

const router = Router();

// All cart routes require authentication
router.use(verifyToken);

router.get('/', CartController.getCart);

router.post(
    '/items',
    validateAddItem,
    handleValidationErrors,
    CartController.addItem
);

router.put(
    '/items/:itemId',
    validateUpdateItem,
    handleValidationErrors,
    CartController.updateItem
);

router.delete('/items/:itemId', CartController.removeItem);

router.delete('/', CartController.clearCart);

router.post(
    '/coupon',
    validateApplyCoupon,
    handleValidationErrors,
    CartController.applyCoupon
);

export const cartRoutes = router;
