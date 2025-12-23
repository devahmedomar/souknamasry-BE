import type { Request, Response, NextFunction } from 'express';
import { FavouriteService } from '../services/favouriteService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { TranslatedResponseUtil } from '../utils/translatedResponse.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';

export class FavouriteController {
    /**
     * Get user's favourites
     * GET /api/favourites
     */
    static async getFavourites(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const favourites = await FavouriteService.getFavourites(userId);

            return ResponseUtil.success(res, {
                products: favourites.products,
                count: favourites.products.length,
            });
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'favourite.fetchFailed',
                'FAVOURITE_FETCH_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add product to favourites
     * POST /api/favourites/:productId
     */
    static async addProduct(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { productId } = req.params;

            const favourites = await FavouriteService.addProduct(userId, productId!);

            return ResponseUtil.success(res, {
                message: 'Product added to favourites',
                products: favourites.products,
                count: favourites.products.length,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'favourite.addFailed';

            if (errorMessage.includes('productNotFound')) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { product: [errorMessage] },
                    HttpStatusCode.NOT_FOUND
                );
            }

            return TranslatedResponseUtil.error(
                req,
                res,
                errorMessage,
                'FAVOURITE_ADD_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove product from favourites
     * DELETE /api/favourites/:productId
     */
    static async removeProduct(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { productId } = req.params;

            const favourites = await FavouriteService.removeProduct(userId, productId!);

            return ResponseUtil.success(res, {
                message: 'Product removed from favourites',
                products: favourites.products,
                count: favourites.products.length,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'favourite.removeFailed';

            if (errorMessage.includes('notFound')) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { favourite: [errorMessage] },
                    HttpStatusCode.NOT_FOUND
                );
            }

            return TranslatedResponseUtil.error(
                req,
                res,
                errorMessage,
                'FAVOURITE_REMOVE_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Clear all favourites
     * DELETE /api/favourites
     */
    static async clearFavourites(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            await FavouriteService.clearFavourites(userId);

            return ResponseUtil.success(res, {
                message: 'All favourites cleared',
                products: [],
                count: 0,
            });
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'favourite.clearFailed',
                'FAVOURITE_CLEAR_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Check if product is in favourites
     * GET /api/favourites/:productId/check
     */
    static async checkFavourite(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { productId } = req.params;

            const isFavourite = await FavouriteService.isFavourite(userId, productId!);

            return ResponseUtil.success(res, { isFavourite });
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'favourite.checkFailed',
                'FAVOURITE_CHECK_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
