import { Document, Model, Types } from 'mongoose';

/**
 * Attribute option (for select / multi-select types)
 */
export interface IAttributeOption {
  value: string;
  label?: string;
  labelAr?: string;
}

/**
 * A single attribute definition within a category
 */
export interface IAttributeDefinition {
  key: string;
  label: string;
  labelAr?: string;
  type: 'select' | 'multi-select' | 'number-range';
  options: IAttributeOption[];
  unit?: string;
  min?: number;
  max?: number;
  filterable: boolean;
  required: boolean;
  order: number;
}

/**
 * CategoryAttribute document — one per category
 */
export interface ICategoryAttribute {
  category: Types.ObjectId;
  attributes: IAttributeDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryAttributeDocument = ICategoryAttribute & Document;
export type CategoryAttributeModel = Model<ICategoryAttribute>;
