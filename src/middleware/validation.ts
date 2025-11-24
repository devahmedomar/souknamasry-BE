import type { Request, Response, NextFunction } from 'express';
import { validationResult,  } from 'express-validator';
import { ResponseUtil } from '../utils/response.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';
import { ValidationError as ExpressValidationError } from '../utils/errors/ValidationError.js';

/**
 * Validation Error Middleware
 * Processes express-validator validation results
 * Returns JSend fail response if validation errors exist
 */ 
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  // Extract validation errors from request
  const errors = validationResult(req);

  // If no errors, proceed to next middleware
  if (errors.isEmpty()) {
    return next();
  }

  // Transform express-validator errors into field-level error object
  const formattedErrors = errors.array().reduce(
    (acc: Record<string, string[]>, error: any) => {
      const field = error.path || error.param || 'unknown';
      const message = error.msg;

      // Group errors by field
      if (!acc[field]) {
        acc[field] = [];
      }

      // Avoid duplicate messages for same field
      if (!acc[field].includes(message)) {
        acc[field].push(message);
      }

      return acc;
    },
    {}
  );

  // Return JSend fail response with field-level errors
  return ResponseUtil.fail(res, formattedErrors, HttpStatusCode.BAD_REQUEST);
};

/**
 * Type guard to check if error is from express-validator
 */
export const isValidationError = (
  error: any
): error is ExpressValidationError => {
  return error && typeof error === 'object' && 'msg' in error;
};
