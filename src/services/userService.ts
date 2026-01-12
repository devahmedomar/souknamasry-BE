import { User } from '../models/User.js';
import type { UserDocument, IUser } from '../types/user.types.js';
import { UserRole } from '../types/user.types.js';
import bcrypt from 'bcryptjs';

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
    static async getUserProfile(userId: string): Promise<UserDocument | null> {
        return await User.findById(userId).select('-password');
    }

    /**
     * Update user profile
     */
    static async updateUserProfile(
        userId: string,
        data: UpdateUserProfileInput
    ): Promise<UserDocument | null> {
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

    // ============== ADMIN OPERATIONS ==============

    /**
     * Get all users with pagination and filtering (Admin)
     * @param page - Page number (default: 1)
     * @param limit - Items per page (default: 20)
     * @param role - Optional role filter
     * @param isActive - Optional active status filter
     * @param searchQuery - Optional search query for email, firstName, lastName
     * @returns Paginated users list with metadata
     */
    static async getAllUsers(
        page: number = 1,
        limit: number = 20,
        role?: UserRole,
        isActive?: boolean,
        searchQuery?: string
    ): Promise<{
        users: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> {
        const filter: any = {};

        if (role) {
            filter.role = role;
        }

        if (isActive !== undefined) {
            filter.isActive = isActive;
        }

        if (searchQuery) {
            filter.$or = [
                { email: { $regex: searchQuery, $options: 'i' } },
                { firstName: { $regex: searchQuery, $options: 'i' } },
                { lastName: { $regex: searchQuery, $options: 'i' } },
                { phone: { $regex: searchQuery, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(filter),
        ]);

        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get user by ID (Admin)
     * @param userId - User ID
     * @returns User details without password
     */
    static async getUserById(userId: string): Promise<any> {
        const user = await User.findById(userId).select('-password').lean();

        if (!user) {
            throw new Error('user.userNotFound');
        }

        return user;
    }

    /**
     * Create a new user (Admin)
     * @param userData - User data
     * @returns Created user without password
     */
    static async createUser(userData: Partial<IUser>): Promise<any> {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('user.emailAlreadyExists');
        }

        // Hash password if provided
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        const user = new User(userData);
        await user.save();

        // Return user without password
        const userObject = user.toObject();
        delete (userObject as any).password;
        return userObject;
    }

    /**
     * Update user by ID (Admin)
     * @param userId - User ID
     * @param updateData - Data to update
     * @returns Updated user without password
     */
    static async updateUser(userId: string, updateData: Partial<IUser>): Promise<any> {
        // Check if email is being updated and if it already exists
        if (updateData.email) {
            const existingUser = await User.findOne({
                email: updateData.email,
                _id: { $ne: userId },
            });
            if (existingUser) {
                throw new Error('user.emailAlreadyExists');
            }
        }

        // Hash password if being updated
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) {
            throw new Error('user.userNotFound');
        }

        return user;
    }

    /**
     * Delete user by ID (Admin)
     * @param userId - User ID
     */
    static async deleteUser(userId: string): Promise<void> {
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            throw new Error('user.userNotFound');
        }
    }

    /**
     * Deactivate user (soft delete)
     * @param userId - User ID
     * @returns Updated user
     */
    static async deactivateUser(userId: string): Promise<any> {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!user) {
            throw new Error('user.userNotFound');
        }

        return user;
    }

    /**
     * Activate user
     * @param userId - User ID
     * @returns Updated user
     */
    static async activateUser(userId: string): Promise<any> {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: true },
            { new: true }
        ).select('-password');

        if (!user) {
            throw new Error('user.userNotFound');
        }

        return user;
    }

    /**
     * Update user role (Admin)
     * @param userId - User ID
     * @param role - New role
     * @returns Updated user
     */
    static async updateUserRole(userId: string, role: UserRole): Promise<any> {
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new Error('user.userNotFound');
        }

        return user;
    }

    /**
     * Get user statistics (Admin dashboard)
     * @returns User statistics
     */
    static async getUserStatistics(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        totalAdmins: number;
        totalCustomers: number;
        recentUsers: any[];
    }> {
        const [
            totalUsers,
            activeUsers,
            inactiveUsers,
            totalAdmins,
            totalCustomers,
            recentUsers,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isActive: false }),
            User.countDocuments({ role: UserRole.ADMIN }),
            User.countDocuments({ role: UserRole.CUSTOMER }),
            User.find()
                .select('-password')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);

        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            totalAdmins,
            totalCustomers,
            recentUsers,
        };
    }
}
