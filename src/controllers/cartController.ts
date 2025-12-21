import type { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cartService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { TranslatedResponseUtil } from '../utils/translatedResponse.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';

export class CartController {
    /**
     * Get user cart
     * GET /api/cart
     */
    static async getCart(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const cart = await CartService.getCart(userId);
            return ResponseUtil.success(res, cart);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'cart.fetchFailed',
                'CART_FETCH_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Add item to cart
     * POST /api/cart/items
     */
    static async addItem(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { productId, quantity } = req.body;

            const cart = await CartService.addItem(userId, productId, quantity);

            return ResponseUtil.success(res, cart);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'cart.addFailed';

            if (errorMessage.includes('productNotFound')) {
                return TranslatedResponseUtil.fail(req, res, { product: [errorMessage] }, HttpStatusCode.NOT_FOUND);
            }
            if (errorMessage.includes('outOfStock') || errorMessage.includes('insufficientStock')) {
                return TranslatedResponseUtil.fail(req, res, { stock: [errorMessage] }, HttpStatusCode.CONFLICT);
            }

            return TranslatedResponseUtil.error(
                req,
                res,
                errorMessage,
                'CART_ADD_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update item quantity
     * PUT /api/cart/items/:itemId
     */
    static async updateItem(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { itemId } = req.params;
            const { quantity } = req.body;

            if (!itemId) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { itemId: ['Item ID is required'] },
                    HttpStatusCode.BAD_REQUEST
                );
            }

            const cart = await CartService.updateItemQuantity(userId, itemId, quantity);

            return ResponseUtil.success(res, cart);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'cart.updateFailed';

            if (errorMessage.includes('cartNotFound')) {
                return TranslatedResponseUtil.fail(req, res, { cart: [errorMessage] }, HttpStatusCode.NOT_FOUND);
            }
            if (errorMessage.includes('itemNotFound')) {
                return TranslatedResponseUtil.fail(req, res, { item: [errorMessage] }, HttpStatusCode.NOT_FOUND);
            }
            if (errorMessage.includes('productNotFound')) {
                return TranslatedResponseUtil.fail(req, res, { product: [errorMessage] }, HttpStatusCode.NOT_FOUND);
            }
            if (errorMessage.includes('insufficientStock')) {
                return TranslatedResponseUtil.fail(req, res, { stock: [errorMessage] }, HttpStatusCode.CONFLICT);
            }

            return TranslatedResponseUtil.error(
                req,
                res,
                errorMessage,
                'CART_UPDATE_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove item from cart
     * DELETE /api/cart/items/:itemId
     */
    static async removeItem(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { itemId } = req.params;

            if (!itemId) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { itemId: ['Item ID is required'] },
                    HttpStatusCode.BAD_REQUEST
                );
            }

            const cart = await CartService.removeItem(userId, itemId);

            return ResponseUtil.success(res, cart);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'cart.removeFailed';

            if (errorMessage.includes('cartNotFound')) {
                return TranslatedResponseUtil.fail(req, res, { cart: [errorMessage] }, HttpStatusCode.NOT_FOUND);
            }

            return TranslatedResponseUtil.error(
                req,
                res,
                errorMessage,
                'CART_REMOVE_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Clear cart
     * DELETE /api/cart
     */
    static async clearCart(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            await CartService.clearCart(userId);
            return ResponseUtil.success(res, { message: 'Cart cleared successfully' });
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'cart.clearFailed',
                'CART_CLEAR_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Apply coupon
     * POST /api/cart/coupon
     */
    static async applyCoupon(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { couponCode } = req.body;

            const cart = await CartService.applyCoupon(userId, couponCode);

            return ResponseUtil.success(res, cart);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'coupon.applyFailed';

            if (errorMessage.includes('invalid') || errorMessage.includes('expired')) {
                return TranslatedResponseUtil.fail(req, res, { coupon: [errorMessage] }, HttpStatusCode.BAD_REQUEST);
            }

            return TranslatedResponseUtil.error(
                req,
                res,
                errorMessage,
                'COUPON_APPLY_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
