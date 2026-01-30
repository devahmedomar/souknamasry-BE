import { Document, Model } from 'mongoose';

/**
 * User role enumeration
 * Defines available user roles in the system
 */
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

/**
 * Egyptian phone number validation regex
 * Matches: +201XXXXXXXXX or 01XXXXXXXXX (Egyptian mobile numbers)
 * Valid prefixes: 010, 011, 012, 015 (Egyptian mobile carriers)
 */
export const EGYPTIAN_PHONE_REGEX = /^(\+20|0)?1[0125][0-9]{8}$/;

/**
 * Interface representing a User document in MongoDB
 * Contains all user-related data fields
 */
export interface IUser {
  phone: string; // Primary identifier - required
  email?: string; // Optional - can be added later
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isPhoneVerified: boolean;
  imageUrl?: string;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for User instance methods
 * Defines methods available on user document instances
 */
export interface IUserMethods {
  /**
   * Compare candidate password with hashed password
   * @param candidatePassword - Plain text password to compare
   * @returns Promise resolving to true if passwords match
   */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User Document type
 * Combines IUser interface with Mongoose Document and instance methods
 */
export type UserDocument = IUser & IUserMethods & Document;

/**
 * User Model type
 * Defines the type for the User model with all methods
 */
export type UserModel = Model<IUser, {}, IUserMethods>;

/**
 * Email validation regex pattern
 * Validates standard email format (user@domain.extension)
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
