import type { Request, Response, NextFunction } from 'express';
import { AddressService } from '../services/addressService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { TranslatedResponseUtil } from '../utils/translatedResponse.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';

export class AddressController {
    /**
     * Get all addresses for the logged-in user
     * GET /api/addresses
     */
    static async getAddresses(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const addresses = await AddressService.getAddresses(userId);
            return ResponseUtil.success(res, addresses);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'address.fetchFailed',
                'ADDRESS_FETCH_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get a single address by ID
     * GET /api/addresses/:id
     */
    static async getAddress(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const address = await AddressService.getAddressById(userId, id!);

            if (!address) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { address: ['address.notFound'] },
                    HttpStatusCode.NOT_FOUND
                );
            }

            return ResponseUtil.success(res, address);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'address.fetchFailed',
                'ADDRESS_FETCH_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Create a new address
     * POST /api/addresses
     */
    static async createAddress(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const address = await AddressService.createAddress(userId, req.body);
            return ResponseUtil.success(res, address, HttpStatusCode.CREATED);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'address.createFailed',
                'ADDRESS_CREATE_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update an address
     * PUT /api/addresses/:id
     */
    static async updateAddress(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const address = await AddressService.updateAddress(userId, id!, req.body);

            if (!address) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { address: ['address.notFound'] },
                    HttpStatusCode.NOT_FOUND
                );
            }

            return ResponseUtil.success(res, address);
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'address.updateFailed',
                'ADDRESS_UPDATE_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Delete an address
     * DELETE /api/addresses/:id
     */
    static async deleteAddress(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const deleted = await AddressService.deleteAddress(userId, id!);

            if (!deleted) {
                return TranslatedResponseUtil.fail(
                    req,
                    res,
                    { address: ['address.notFound'] },
                    HttpStatusCode.NOT_FOUND
                );
            }

            return ResponseUtil.success(res, { message: 'Address deleted successfully' });
        } catch (error) {
            return TranslatedResponseUtil.error(
                req,
                res,
                error instanceof Error ? error.message : 'address.deleteFailed',
                'ADDRESS_DELETE_ERROR',
                undefined,
                HttpStatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}
