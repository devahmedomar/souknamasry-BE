import { Address } from '../models/Address.js';
import type { IAddressDocument } from '../types/address.types.js';

export interface CreateAddressInput {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    addressLine: string;
    nearestLandmark?: string;
    apartmentNumber?: string;
    isDefault?: boolean;
}

export class AddressService {
    /**
     * Get all addresses for a user
     */
    static async getAddresses(userId: string): Promise<IAddressDocument[]> {
        return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
    }

    /**
     * Get a single address by ID
     */
    static async getAddressById(userId: string, addressId: string): Promise<IAddressDocument | null> {
        return await Address.findOne({ _id: addressId, user: userId });
    }

    /**
     * Create a new address
     */
    static async createAddress(userId: string, data: CreateAddressInput): Promise<IAddressDocument> {
        // If this is the user's first address, make it default
        const existingCount = await Address.countDocuments({ user: userId });
        const isDefault = existingCount === 0 ? true : (data.isDefault ?? false);

        const address = await Address.create({
            user: userId,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            city: data.city,
            addressLine: data.addressLine,
            nearestLandmark: data.nearestLandmark,
            apartmentNumber: data.apartmentNumber,
            isDefault,
        });

        return address;
    }

    /**
     * Update an address
     */
    static async updateAddress(
        userId: string,
        addressId: string,
        data: Partial<CreateAddressInput>
    ): Promise<IAddressDocument | null> {
        const address = await Address.findOne({ _id: addressId, user: userId });

        if (!address) {
            return null;
        }

        Object.assign(address, data);
        await address.save();

        return address;
    }

    /**
     * Delete an address
     */
    static async deleteAddress(userId: string, addressId: string): Promise<boolean> {
        const result = await Address.deleteOne({ _id: addressId, user: userId });
        return result.deletedCount > 0;
    }

    /**
     * Get user's default address
     */
    static async getDefaultAddress(userId: string): Promise<IAddressDocument | null> {
        return await Address.findOne({ user: userId, isDefault: true });
    }
}
