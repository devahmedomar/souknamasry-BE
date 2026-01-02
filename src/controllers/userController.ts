import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { TranslatedResponseUtil } from '../utils/translatedResponse.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';

export class UserController {
    /**
     * Get current user profile
     * GET /api/users/profile
     */
    static async getProfile(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const user = await UserService.getUserProfile(userId);

            if (!user) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { user: ['user.notFound'] },
                    HttpStatusCode.NOT_FOUND
                );
            }

            return ResponseUtil.success(res, user);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'user.fetchFailed',
                'USER_FETCH_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update current user profile
     * PUT /api/users/profile
     */
    static async updateProfile(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const updatedUser = await UserService.updateUserProfile(userId, req.body);

            if (!updatedUser) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { user: ['user.notFound'] },
                    HttpStatusCode.NOT_FOUND
                );
            }

            return ResponseUtil.success(res, updatedUser);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'user.updateFailed',
                'USER_UPDATE_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
