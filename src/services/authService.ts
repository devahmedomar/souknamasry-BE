import { User } from '../models/User.js';
import type { UserDocument } from '../types/user.types.js';
import { ConflictError } from '../utils/errors/ConflictError.js';
import { AppError } from '../utils/errors/AppError.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';
import { JwtUtil, type IJwtPayload } from '../utils/jwt.util.js';
import {
  type RegisterRequestDto,
  type AuthResponseDto,
  UserMapper,
} from '../dtos/auth.dto.js';

/**
 * Authentication Service
 * Handles business logic for user authentication operations
 * Uses phone number as primary identifier
 */
export class AuthService {
  /**
   * Normalize phone number to consistent format
   */
  private static normalizePhone(phone: string): string {
    let normalized = phone.replace(/[^\d+]/g, '');

    if (normalized.startsWith('01')) {
      normalized = '+20' + normalized.substring(1);
    } else if (normalized.startsWith('201')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+20')) {
      normalized = '+20' + normalized.replace(/^0+/, '');
    }

    return normalized;
  }

  /**
   * Register a new user
   * @param registerData - User registration data
   * @returns Auth response with user data and JWT token
   * @throws ConflictError if phone already exists
   */
  static async registerUser(
    registerData: RegisterRequestDto
  ): Promise<AuthResponseDto> {
    const { phone, password, firstName, lastName, email } = registerData;

    // Normalize phone number
    const normalizedPhone = this.normalizePhone(phone);

    // Check if user with phone already exists
    const existingUser = await User.findOne({ phone: normalizedPhone });

    if (existingUser) {
      throw new ConflictError('auth.phoneAlreadyRegistered');
    }

    // Check if email is provided and already exists
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        throw new ConflictError('auth.emailAlreadyRegistered');
      }
    }

    // Create new user instance
    // Password will be automatically hashed by pre-save hook in schema
    const user = new User({
      phone: normalizedPhone,
      password,
      firstName,
      lastName,
      email: email?.toLowerCase(),
      isPhoneVerified: false, // Can be verified later via Firebase
      // role defaults to 'customer' per schema
      // isActive defaults to true per schema
    });

    // Save user to database
    const savedUser: UserDocument = await user.save();

    // Generate JWT token payload
    const tokenPayload: IJwtPayload = {
      userId: savedUser._id.toString(),
      phone: savedUser.phone,
      role: savedUser.role,
    };

    // Generate JWT access token
    const token = JwtUtil.generateToken(tokenPayload);

    // Map user document to response DTO and return with token
    return UserMapper.toAuthResponseDto(savedUser, token);
  }

  /**
   * Authenticate user login with phone and password
   * @param phone - User phone number
   * @param password - User password (plain text)
   * @returns Auth response with user data and JWT token
   * @throws AppError if credentials are invalid
   */
  static async loginUser(
    phone: string,
    password: string
  ): Promise<AuthResponseDto> {
    const normalizedPhone = this.normalizePhone(phone);

    // Find user by phone and include password field (normally excluded)
    const user = await User.findOne({ phone: normalizedPhone }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('auth.invalidPhoneOrPassword', HttpStatusCode.UNAUTHORIZED);
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new AppError('auth.accountDeactivated', HttpStatusCode.FORBIDDEN);
    }

    // Generate JWT token payload
    const tokenPayload: IJwtPayload = {
      userId: user._id.toString(),
      phone: user.phone,
      role: user.role,
    };

    // Generate JWT access token
    const token = JwtUtil.generateToken(tokenPayload);

    // Map user document to response DTO and return with token
    return UserMapper.toAuthResponseDto(user, token);
  }

  /**
   * Get user profile by ID
   * @param userId - User ID from JWT token
   * @returns User profile data (password excluded)
   * @throws AppError if user not found
   */
  static async getUserProfile(userId: string): Promise<UserDocument> {
    // Find user by ID and exclude password field
    const user = await User.findById(userId).select('-password');

    // Check if user exists
    if (!user) {
      throw new AppError('auth.userNotFound', HttpStatusCode.NOT_FOUND);
    }

    return user;
  }

  /**
   * Check if phone number is already registered
   * @param phone - Phone number to check
   * @returns true if phone is registered
   */
  static async isPhoneRegistered(phone: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhone(phone);
    const user = await User.findOne({ phone: normalizedPhone });
    return !!user;
  }

  /**
   * Update user's email address
   * @param userId - User ID
   * @param email - New email address
   * @returns Updated user document
   */
  static async updateEmail(userId: string, email: string): Promise<UserDocument> {
    const normalizedEmail = email.toLowerCase();

    // Check if email already exists
    const emailExists = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (emailExists) {
      throw new ConflictError('auth.emailAlreadyRegistered');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { email: normalizedEmail },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('auth.userNotFound', HttpStatusCode.NOT_FOUND);
    }

    return user;
  }
}
