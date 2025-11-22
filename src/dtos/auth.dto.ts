import { UserRole } from '../types/user.types.js';

/**
 * Register Request DTO
 * Data Transfer Object for user registration requests
 */
export interface RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Login Request DTO
 * Data Transfer Object for user login requests
 */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/**
 * User Response DTO
 * Sanitized user data returned in API responses (password excluded)
 */
export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
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
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
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
