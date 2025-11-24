import mongoose from 'mongoose';
import { userSchema } from '../schemas/user.schema.js';
import { type IUser, type UserModel } from '../types/user.types.js';

/**
 * User Model
 * Mongoose model for User collection with authentication capabilities
 *
 * @example
 * // Create a new user
 * const user = new User({
 *   email: 'john@example.com',
 *   password: 'SecurePass123',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * await user.save();
 *
 * @example
 * // Verify password
 * const user = await User.findOne({ email: 'john@example.com' }).select('+password');
 * const isMatch = await user?.comparePassword('SecurePass123');
 */
export const User = mongoose.model<IUser, UserModel>('User', userSchema);
