/**
 * HTTP status codes enumeration
 * Standard HTTP status codes used throughout the application
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Base error response interface
 * Defines the structure for error responses across the application
 */
export interface IErrorResponse {
  statusCode: HttpStatusCode;
  message: string;
  isOperational: boolean;
  stack?: string;
}
