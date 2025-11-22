import { HttpStatusCode, type IErrorResponse } from './error.types.js';

/**
 * Base Application Error Class
 * Extends native Error with HTTP status codes and operational flag
 * Used as the foundation for all custom error types
 */
export class AppError extends Error implements IErrorResponse {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;

  /**
   * Creates an application error
   * @param message - Error message to display
   * @param statusCode - HTTP status code
   * @param isOperational - Whether error is operational (true) or programming error (false)
   */
  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
