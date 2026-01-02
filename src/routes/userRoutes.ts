import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Protect all routes
router.use(verifyToken);

// User Profile
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

export default router;
