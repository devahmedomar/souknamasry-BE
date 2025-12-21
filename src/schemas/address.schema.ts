import { Schema } from 'mongoose';
import type { IAddressDocument, AddressModel } from '../types/address.types.js';

export const addressSchema = new Schema<IAddressDocument, AddressModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
            maxlength: [100, 'City cannot exceed 100 characters'],
        },
        addressLine: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
            maxlength: [255, 'Address cannot exceed 255 characters'],
        },
        nearestLandmark: {
            type: String,
            trim: true,
            maxlength: [255, 'Nearest landmark cannot exceed 255 characters'],
            default: null,
        },
        apartmentNumber: {
            type: String,
            trim: true,
            maxlength: [20, 'Apartment number cannot exceed 20 characters'],
            default: null,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure only one default address per user
addressSchema.pre('save', async function (next) {
    if (this.isDefault && this.isModified('isDefault')) {
        const Address = this.constructor as AddressModel;
        await Address.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});
