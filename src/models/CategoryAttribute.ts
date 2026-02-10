import mongoose from 'mongoose';
import { categoryAttributeSchema } from '../schemas/categoryAttribute.schema.js';
import type { ICategoryAttribute, CategoryAttributeModel } from '../types/categoryAttribute.types.js';

export const CategoryAttribute = mongoose.model<ICategoryAttribute, CategoryAttributeModel>(
  'CategoryAttribute',
  categoryAttributeSchema
);
