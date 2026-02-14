import { Router } from 'express';
import { SiteSettingsController } from '../controllers/siteSettingsController.js';

/**
 * Public Site Settings Routes
 * Route prefix: /api/settings
 */
const router = Router();

/**
 * @swagger
 * /api/settings/theme:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get the active theme
 *     description: Returns the currently active theme key and its display names. Use this to apply the correct theme on the frontend.
 *     responses:
 *       200:
 *         description: Active theme retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeTheme:
 *                       type: string
 *                       example: ramadan
 *                     theme:
 *                       type: object
 *                       properties:
 *                         key:
 *                           type: string
 *                           example: ramadan
 *                         nameAr:
 *                           type: string
 *                           example: رمضان
 *                         nameEn:
 *                           type: string
 *                           example: Ramadan
 *                         isEnabled:
 *                           type: boolean
 *                           example: true
 */
router.get('/theme', SiteSettingsController.getActiveTheme);

export default router;
