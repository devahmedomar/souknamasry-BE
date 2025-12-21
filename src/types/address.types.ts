import { Document, Model, Types } from 'mongoose';

export interface IAddress {
    user: Types.ObjectId;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    addressLine: string;
    nearestLandmark?: string | undefined;
    apartmentNumber?: string | undefined;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAddressDocument extends IAddress, Document { }

export type AddressModel = Model<IAddressDocument>;
