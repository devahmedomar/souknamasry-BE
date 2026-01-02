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
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
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
        area: {
            type: String,
            required: [true, 'Area is required'],
            trim: true,
            maxlength: [100, 'Area cannot exceed 100 characters'],
        },
        street: {
            type: String,
            required: [true, 'Street is required'],
            trim: true,
            maxlength: [255, 'Street cannot exceed 255 characters'],
        },
        landmark: {
            type: String,
            trim: true,
            maxlength: [255, 'Landmark cannot exceed 255 characters'],
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
