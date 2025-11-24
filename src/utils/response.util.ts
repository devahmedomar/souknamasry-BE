import type { Response } from 'express';
import { HttpStatusCode } from './errors/error.types.js';

/**
 * JSend Response Standard
 * Specification: https://github.com/omniti-labs/jsend
 */

/**
 * JSend success response type
 */
interface JSendSuccess<T = any> {
  status: 'success';
  data: T;
}

/**
 * JSend fail response type (client error - validation, etc.)
 */
interface JSendFail {
  status: 'fail';
  data: Record<string, any>;
}

/**
 * JSend error response type (server error)
 */
interface JSendError {
  status: 'error';
  message: string;
  code?: string | number;
  data?: any;
}

/**
 * Response Utility Class
 * Provides standardized JSend response methods for Express.js
 */
export class ResponseUtil {
  /**
   * Send a success response (200/201)
   * @param res - Express response object
   * @param data - Response data payload
   * @param statusCode - HTTP status code (default: 200)
   */
  static success<T>(
    res: Response,
    data: T,
    statusCode: HttpStatusCode = HttpStatusCode.OK
  ): Response<JSendSuccess<T>> {
    return res.status(statusCode).json({
      status: 'success',
      data,
    });
  }

  /**
   * Send a fail response (4xx client errors)
   * Used for validation errors, bad requests, etc.
   * @param res - Express response object
   * @param data - Error details (field-level errors)
   * @param statusCode - HTTP status code (default: 400)
   */
  static fail(
    res: Response,
    data: Record<string, any>,
    statusCode: HttpStatusCode = HttpStatusCode.BAD_REQUEST
  ): Response<JSendFail> {
    return res.status(statusCode).json({
      status: 'fail',
      data,
    });
  }

  /**
   * Send an error response (5xx server errors)
   * Used for unexpected errors, database failures, etc.
   * @param res - Express response object
   * @param message - Error message
   * @param code - Optional error code
   * @param data - Optional additional error data
   * @param statusCode - HTTP status code (default: 500)
   */
  static error(
    res: Response,
    message: string,
    code?: string | number,
    data?: any,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR
  ): Response<JSendError> {
    const response: JSendError = {
      status: 'error',
      message,
    };

    if (code !== undefined) {
      response.code = code;
    }

    if (data !== undefined) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201)
   * Convenience method for resource creation
   * @param res - Express response object
   * @param data - Created resource data
   */
  static created<T>(res: Response, data: T): Response<JSendSuccess<T>> {
    return ResponseUtil.success(res, data, HttpStatusCode.CREATED);
  }
}
