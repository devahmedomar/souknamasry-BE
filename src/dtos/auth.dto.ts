import { UserRole } from '../types/user.types.js';

/**
 * Register Request DTO
 * Data Transfer Object for user registration requests
 */
export interface RegisterRequestDto {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string;
}

/**
 * Login Request DTO
 * Data Transfer Object for user login requests
 * Uses phone number instead of email
 */
export interface LoginRequestDto {
  phone: string;
  password: string;
}

/**
 * User Response DTO
 * Sanitized user data returned in API responses (password excluded)
 */
export interface UserResponseDto {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auth Response DTO
 * Complete authentication response with user data and token
 */
export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
}

/**
 * Mapper class to convert User documents to DTOs
 * Ensures password and sensitive data are never exposed
 */
export class UserMapper {
  /**
   * Convert User document to UserResponseDto
   * Excludes password and other sensitive fields
   * @param user - User document from database
   * @returns Sanitized user response DTO
   */
  static toResponseDto(user: any): UserResponseDto {
    return {
      id: user._id.toString(),
      phone: user.phone,
      email: user.email || undefined,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isPhoneVerified: user.isPhoneVerified || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Convert User document to AuthResponseDto with token
   * @param user - User document from database
   * @param token - JWT access token
   * @returns Complete auth response with user and token
   */
  static toAuthResponseDto(user: any, token: string): AuthResponseDto {
    return {
      user: UserMapper.toResponseDto(user),
      token,
    };
  }
}
