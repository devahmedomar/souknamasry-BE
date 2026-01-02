import { Document, Model, Types } from 'mongoose';

export interface IAddress {
    user: Types.ObjectId;
    name: string;
    phone: string;
    city: string;
    area: string;
    street: string;
    landmark?: string | undefined;
    apartmentNumber?: string | undefined;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAddressDocument extends IAddress, Document { }

export type AddressModel = Model<IAddressDocument>;
