import { Schema } from 'mongoose';
import type { ICategoryAttribute, CategoryAttributeModel } from '../types/categoryAttribute.types.js';

const attributeOptionSchema = new Schema(
  {
    value: { type: String, required: true, trim: true },
    label: { type: String, trim: true },
    labelAr: { type: String, trim: true },
  },
  { _id: false }
);

const attributeDefinitionSchema = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Attribute key is required'],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9_]+$/, 'Attribute key must be alphanumeric and underscores only'],
    },
    label: {
      type: String,
      required: [true, 'Attribute label is required'],
      trim: true,
    },
    labelAr: { type: String, trim: true },
    type: {
      type: String,
      required: [true, 'Attribute type is required'],
      enum: ['select', 'multi-select', 'number-range'],
    },
    options: {
      type: [attributeOptionSchema],
      default: [],
    },
    unit: { type: String, trim: true },
    min: { type: Number },
    max: { type: Number },
    filterable: { type: Boolean, default: true },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

export const categoryAttributeSchema = new Schema<ICategoryAttribute, CategoryAttributeModel>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      unique: true,
      index: true,
    },
    attributes: {
      type: [attributeDefinitionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
