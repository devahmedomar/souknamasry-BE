import type { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { TranslatedResponseUtil } from '../utils/translatedResponse.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';

export class OrderController {
    /**
     * Get checkout summary
     * GET /api/checkout/summary
     */
    static async getCheckoutSummary(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const summary = await OrderService.getCheckoutSummary(userId);
            return ResponseUtil.success(res, summary);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'checkout.summaryFailed',
                'CHECKOUT_SUMMARY_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Place an order
     * POST /api/orders
     */
    static async placeOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { addressId, paymentMethod, notes } = req.body;

            const order = await OrderService.placeOrder(userId, {
                addressId,
                paymentMethod,
                notes,
            });

            return ResponseUtil.success(res, order, HttpStatusCode.CREATED);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'order.placeFailed';

            if (errorMessage.includes('emptyCart')) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { cart: [errorMessage] },
                    HttpStatusCode.BAD_REQUEST
                );
            }
            if (errorMessage.includes('addressNotFound')) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { address: [errorMessage] },
                    HttpStatusCode.NOT_FOUND
                );
            }
            if (errorMessage.includes('productNotFound') || errorMessage.includes('productOutOfStock')) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { product: [errorMessage] },
                    HttpStatusCode.CONFLICT
                );
            }

            return TranslatedResponseUtil.error(
                req,
                res,
                errorMessage,
                'ORDER_PLACE_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get user's order history
     * GET /api/orders
     */
    static async getOrders(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const orders = await OrderService.getOrders(userId);
            return ResponseUtil.success(res, orders);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'order.fetchFailed',
                'ORDER_FETCH_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get a single order by ID
     * GET /api/orders/:id
     */
    static async getOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const order = await OrderService.getOrderById(userId, id!);

            if (!order) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { order: ['order.notFound'] },
                    HttpStatusCode.NOT_FOUND
                );
            }

            return ResponseUtil.success(res, order);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'order.fetchFailed',
                'ORDER_FETCH_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Cancel an order
     * POST /api/orders/:id/cancel
     */
    static async cancelOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const order = await OrderService.cancelOrder(userId, id!);

            if (!order) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { order: ['order.notFound'] },
                    HttpStatusCode.NOT_FOUND
                );
            }

            return ResponseUtil.success(res, order);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'order.cancelFailed';

            if (errorMessage.includes('cannotCancel')) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { order: [errorMessage] },
                    HttpStatusCode.BAD_REQUEST
                );
            }

            return TranslatedResponseUtil.error(
                req,
                res,
                errorMessage,
                'ORDER_CANCEL_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
