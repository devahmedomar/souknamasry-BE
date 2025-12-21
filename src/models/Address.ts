import mongoose from 'mongoose';
import { addressSchema } from '../schemas/address.schema.js';
import type { IAddressDocument, AddressModel } from '../types/address.types.js';

export const Address = mongoose.model<IAddressDocument, AddressModel>('Address', addressSchema);
