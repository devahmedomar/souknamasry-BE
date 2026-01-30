import type { Request, Response, NextFunction } from 'express';

/**
 * reCAPTCHA Verification Middleware
 * Verifies Google reCAPTCHA token with Google's API
 */

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Verify reCAPTCHA token with Google
 */
async function verifyRecaptchaToken(token: string): Promise<RecaptchaResponse> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not configured');
    return { success: true }; // Skip in development if not configured
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secretKey}&response=${token}`,
  });

  return response.json() as Promise<RecaptchaResponse>;
}

/**
 * reCAPTCHA verification middleware
 * Expects recaptchaToken in request body
 */
export const verifyRecaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const { recaptchaToken } = req.body;

    // Skip verification in development if no secret key
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      console.warn('[DEV] reCAPTCHA verification skipped - no secret key');
      return next();
    }

    // Check if token is provided
    if (!recaptchaToken) {
      return res.status(400).json({
        status: 'fail',
        errors: { recaptcha: ['reCAPTCHA verification required'] },
      });
    }

    // Verify token with Google
    const result = await verifyRecaptchaToken(recaptchaToken);

    if (!result.success) {
      console.error('reCAPTCHA verification failed:', result['error-codes']);
      return res.status(400).json({
        status: 'fail',
        errors: { recaptcha: ['reCAPTCHA verification failed'] },
      });
    }

    // Token is valid, continue
    next();
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'reCAPTCHA verification error',
    });
  }
};
