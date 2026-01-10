import rateLimit from 'express-rate-limit';

/**
 * Search Rate Limiter
 * 50 requests per minute per IP
 * Users may search frequently
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: 'Too many search requests, please try again in a minute.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Autocomplete Rate Limiter
 * 100 requests per minute per IP
 * Autocomplete fires on each keystroke
 */
export const autocompleteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many autocomplete requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});
