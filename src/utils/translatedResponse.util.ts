import type { Request, Response } from 'express';
import { ResponseUtil } from './response.util.js';
import { HttpStatusCode } from './errors/error.types.js';

/**
 * Translated Response Utility
 * Provides response methods that automatically translate messages
 * Uses the translation function from the request object (set by i18n middleware)
 */
export class TranslatedResponseUtil {
  /**
   * Send a success response with translated message (if needed)
   * @param req - Express request (contains translation function)
   * @param res - Express response object
   * @param data - Response data payload
   * @param statusCode - HTTP status code (default: 200)
   */
  static success<T>(
    req: Request,
    res: Response,
    data: T,
    statusCode: HttpStatusCode = HttpStatusCode.OK
  ): Response {
    return ResponseUtil.success(res, data, statusCode);
  }

  /**
   * Send a fail response with translated error messages
   * @param req - Express request (contains translation function)
   * @param res - Express response object
   * @param translationKey - Translation key or object with translation keys
   * @param statusCode - HTTP status code (default: 400)
   * @param params - Optional parameters for translation
   */
  static fail(
    req: Request,
    res: Response,
    translationKey: string | Record<string, string[]>,
    statusCode: HttpStatusCode = HttpStatusCode.BAD_REQUEST,
    params?: Record<string, string | number>
  ): Response {
    // If translationKey is a string, translate it
    if (typeof translationKey === 'string') {
      const translatedMessage = req.t(translationKey, params);
      return ResponseUtil.fail(res, { error: [translatedMessage] }, statusCode);
    }

    // If it's an object with translation keys, translate each value
    const translatedData: Record<string, string[]> = {};
    for (const [field, keys] of Object.entries(translationKey)) {
      translatedData[field] = keys.map((key) => req.t(key, params));
    }

    return ResponseUtil.fail(res, translatedData, statusCode);
  }

  /**
   * Send an error response with translated message
   * @param req - Express request (contains translation function)
   * @param res - Express response object
   * @param translationKey - Translation key for the error message
   * @param code - Optional error code
   * @param data - Optional additional error data
   * @param statusCode - HTTP status code (default: 500)
   * @param params - Optional parameters for translation
   */
  static error(
    req: Request,
    res: Response,
    translationKey: string,
    code?: string | number,
    data?: any,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    params?: Record<string, string | number>
  ): Response {
    const translatedMessage = req.t(translationKey, params);
    return ResponseUtil.error(res, translatedMessage, code, data, statusCode);
  }

  /**
   * Send a created response (201)
   * @param req - Express request
   * @param res - Express response object
   * @param data - Created resource data
   */
  static created<T>(req: Request, res: Response, data: T): Response {
    return ResponseUtil.created(res, data);
  }
}
