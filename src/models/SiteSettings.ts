import mongoose from 'mongoose';
import { siteSettingsSchema } from '../schemas/siteSettings.schema.js';
import type { ISiteSettings, SiteSettingsModel } from '../types/siteSettings.types.js';

export const SiteSettings = mongoose.model<ISiteSettings, SiteSettingsModel>(
  'SiteSettings',
  siteSettingsSchema
);
