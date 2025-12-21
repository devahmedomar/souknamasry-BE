import { Router } from 'express';
import { AddressController } from '../controllers/addressController.js';
import { verifyToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
    validateCreateAddress,
    validateUpdateAddress,
} from '../validators/addressValidator.js';

const router = Router();

// All address routes require authentication
router.use(verifyToken);

router.get('/', AddressController.getAddresses);

router.get('/:id', AddressController.getAddress);

router.post(
    '/',
    validateCreateAddress,
    handleValidationErrors,
    AddressController.createAddress
);

router.put(
    '/:id',
    validateUpdateAddress,
    handleValidationErrors,
    AddressController.updateAddress
);

router.delete('/:id', AddressController.deleteAddress);

export const addressRoutes = router;
