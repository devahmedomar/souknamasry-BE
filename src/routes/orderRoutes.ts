import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { verifyToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { validatePlaceOrder } from '../validators/orderValidator.js';

const router = Router();

// All order routes require authentication
router.use(verifyToken);

// Checkout summary
router.get('/checkout/summary', OrderController.getCheckoutSummary);

// Orders
router.get('/', OrderController.getOrders);

router.get('/:id', OrderController.getOrder);

router.post(
    '/',
    validatePlaceOrder,
    handleValidationErrors,
    OrderController.placeOrder
);

router.post('/:id/cancel', OrderController.cancelOrder);

export const orderRoutes = router;
