import { AppError } from './AppError.js';
import { HttpStatusCode } from './error.types.js';

/**
 * Validation Error Class
 * Thrown when request validation fails (400 Bad Request)
 * Used for invalid input, malformed data, or failed validation rules
 */
export class ValidationError extends AppError {
  /**
   * Creates a validation error
   * @param message - Validation error message (default: 'Validation failed')
   */
  constructor(message: string = 'Validation failed') {
    super(message, HttpStatusCode.BAD_REQUEST, true);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
