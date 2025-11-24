import { User } from '../models/User.js';
import type { UserDocument } from '../types/user.types.js';
import { ConflictError } from '../utils/errors/ConflictError.js';
import { JwtUtil, type IJwtPayload } from '../utils/jwt.util.js';
import {
  type RegisterRequestDto,
  type AuthResponseDto,
  UserMapper,
} from '../dtos/auth.dto.js';

/**
 * Authentication Service
 * Handles business logic for user authentication operations
 * Follows Service Layer pattern - contains reusable, testable business logic
 */
export class AuthService {
  /**
   * Register a new user
   * @param registerData - User registration data
   * @returns Auth response with user data and JWT token
   * @throws ConflictError if email already exists
   * @throws Error for database or validation errors
   */
  static async registerUser(
    registerData: RegisterRequestDto
  ): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, phone } = registerData;

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ConflictError('auth.emailAlreadyRegistered');
    }

    // Create new user instance
    // Password will be automatically hashed by pre-save hook in schema
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      // role defaults to 'customer' per schema
      // isActive defaults to true per schema
    });

    // Save user to database
    const savedUser: UserDocument = await user.save();

    // Generate JWT token payload
    const tokenPayload: IJwtPayload = {
      userId: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
    };

    // Generate JWT access token
    const token = JwtUtil.generateToken(tokenPayload);

    // Map user document to response DTO and return with token
    return UserMapper.toAuthResponseDto(savedUser, token);
  }

  /**
   * Authenticate user login
   * @param email - User email
   * @param password - User password (plain text)
   * @returns Auth response with user data and JWT token
   * @throws ValidationError if credentials are invalid
   */
  static async loginUser(
    email: string,
    password: string
  ): Promise<AuthResponseDto> {
    // Find user by email and include password field (normally excluded)
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('auth.invalidEmailOrPassword');
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new Error('auth.accountDeactivated');
    }

    // Generate JWT token payload
    const tokenPayload: IJwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Generate JWT access token
    const token = JwtUtil.generateToken(tokenPayload);

    // Map user document to response DTO and return with token
    return UserMapper.toAuthResponseDto(user, token);
  }
}
