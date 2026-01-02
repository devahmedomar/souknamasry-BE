import { User } from '../models/User.js';
import type { IUserDocument } from '../types/user.types.js';

export interface UpdateUserProfileInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    imageUrl?: string;
    email?: string; // Optional update email
}

export class UserService {
    /**
     * Get user profile by ID
     */
    static async getUserProfile(userId: string): Promise<IUserDocument | null> {
        return await User.findById(userId).select('-password');
    }

    /**
     * Update user profile
     */
    static async updateUserProfile(
        userId: string,
        data: UpdateUserProfileInput
    ): Promise<IUserDocument | null> {
        const user = await User.findById(userId);

        if (!user) {
            return null;
        }

        if (data.firstName) user.firstName = data.firstName;
        if (data.lastName) user.lastName = data.lastName;
        if (data.phone) user.phone = data.phone;
        if (data.city) user.city = data.city;
        if (data.imageUrl) user.imageUrl = data.imageUrl;
        // Email update might require verification, simplified here
        if (data.email) user.email = data.email;

        await user.save();
        return user; // Returns document which helps returning updated info
    }
}
