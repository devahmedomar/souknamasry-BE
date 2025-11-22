import { AppError } from './AppError.js';
import { HttpStatusCode } from './error.types.js';

/**
 * Conflict Error Class
 * Thrown when a resource conflict occurs (409 Conflict)
 * Commonly used for duplicate entries, unique constraint violations
 */
export class ConflictError extends AppError {
  /**
   * Creates a conflict error
   * @param message - Conflict error message (default: 'Resource conflict')
   */
  constructor(message: string = 'Resource conflict') {
    super(message, HttpStatusCode.CONFLICT, true);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
