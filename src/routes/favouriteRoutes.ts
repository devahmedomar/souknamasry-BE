import { Router } from 'express';
import { FavouriteController } from '../controllers/favouriteController.js';
import { verifyToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { validateProductId } from '../validators/favouriteValidator.js';

const router = Router();

// All favourite routes require authentication
router.use(verifyToken);

// Get user's favourites
router.get('/', FavouriteController.getFavourites);

// Add product to favourites
router.post(
    '/:productId',
    validateProductId,
    handleValidationErrors,
    FavouriteController.addProduct
);

// Check if product is in favourites
router.get(
    '/:productId/check',
    validateProductId,
    handleValidationErrors,
    FavouriteController.checkFavourite
);

// Remove product from favourites
router.delete(
    '/:productId',
    validateProductId,
    handleValidationErrors,
    FavouriteController.removeProduct
);

// Clear all favourites
router.delete('/', FavouriteController.clearFavourites);

export const favouriteRoutes = router;
