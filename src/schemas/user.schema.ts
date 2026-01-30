import { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserRole,
  EMAIL_REGEX,
  EGYPTIAN_PHONE_REGEX,
  type IUser,
  type UserModel,
  type IUserMethods,
} from '../types/user.types.js';

/**
 * User Schema Definition
 * Defines the structure and validation rules for User documents
 */
export const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
      validate: {
        validator: function (phone: string): boolean {
          return EGYPTIAN_PHONE_REGEX.test(phone);
        },
        message: 'Please provide a valid Egyptian phone number',
      },
    },
    email: {
      type: String,
      // Email is now optional - can be added later to profile
      unique: true,
      sparse: true, // Allows multiple null/undefined values
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string): boolean {
          // Only validate if email is provided
          return !email || EMAIL_REGEX.test(email);
        },
        message: 'Please provide a valid email address',
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Exclude from default queries for security
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: '{VALUE} is not a valid role',
      },
      default: UserRole.CUSTOMER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false, // Disable __v field
  }
);

/**
 * Pre-save hook to hash password before saving
 * Only hashes if password is new or modified to avoid unnecessary hashing
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt with 10 rounds
    const salt = await bcrypt.genSalt(10);

    // Hash password with generated salt
    (this as any).password = await bcrypt.hash((this as any).password, salt);

    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Instance method to compare password for authentication
 * @param candidatePassword - Plain text password to verify
 * @returns Promise resolving to true if password matches
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, (this as any).password);
  } catch (error) {
    return false;
  }
};
