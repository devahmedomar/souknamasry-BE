import { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserRole,
  EMAIL_REGEX,
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
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string): boolean {
          return EMAIL_REGEX.test(email);
        },
        message: 'Please provide a valid email address',
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
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
    phone: {
      type: String,
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
    this.password = await bcrypt.hash(this.password, salt);

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
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};
