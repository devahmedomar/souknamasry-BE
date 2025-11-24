import jwt from 'jsonwebtoken';
import { UserRole } from '../types/user.types.js';

/**
 * JWT Token Payload Interface
 * Defines the structure of data encoded in JWT tokens
 */
export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * JWT Utility Class
 * Handles JWT token generation and verification
 * Uses environment variables for secret and expiration
 */
export class JwtUtil {
  private static readonly SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRE || '30d';

  /**
   * Generate JWT access token
   * @param payload - User data to encode in token
   * @returns Signed JWT token string
   * @throws Error if JWT_SECRET is not set in production
   */
  static generateToken(payload: IJwtPayload): string {
    // Validate secret in production
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be defined in production environment');
    }

    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.EXPIRES_IN,
      issuer: 'souknamasry-api',
      audience: 'souknamasry-client',
    });
  }

  /**
   * Verify and decode JWT token
   * @param token - JWT token string to verify
   * @returns Decoded token payload
   * @throws JsonWebTokenError if token is invalid
   */
  static verifyToken(token: string): IJwtPayload {
    const decoded = jwt.verify(token, this.SECRET, {
      issuer: 'souknamasry-api',
      audience: 'souknamasry-client',
    });

    return decoded as IJwtPayload;
  }

  /**
   * Decode JWT token without verification
   * Useful for inspecting expired tokens
   * @param token - JWT token string to decode
   * @returns Decoded token payload or null if invalid
   */
  static decodeToken(token: string): IJwtPayload | null {
    const decoded = jwt.decode(token);
    return decoded as IJwtPayload | null;
  }
}
