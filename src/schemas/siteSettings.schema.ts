import { Schema } from 'mongoose';
import type { ISiteSettings, SiteSettingsModel } from '../types/siteSettings.types.js';

export const DEFAULT_THEMES = [
  { key: 'normal',      nameAr: 'عادي',       nameEn: 'Normal',         isEnabled: true },
  { key: 'ramadan',     nameAr: 'رمضان',      nameEn: 'Ramadan',        isEnabled: true },
  { key: 'eid_elhob',   nameAr: 'عيد الحب',   nameEn: 'Valentine',      isEnabled: true },
  { key: 'eid_elfetr',  nameAr: 'عيد الفطر',  nameEn: 'Eid Al-Fitr',    isEnabled: true },
  { key: 'eid_aladha',  nameAr: 'عيد الأضحى', nameEn: 'Eid Al-Adha',    isEnabled: true },
  { key: 'ras_elsanaa', nameAr: 'رأس السنة',  nameEn: 'New Year',       isEnabled: true },
];

const themeSchema = new Schema(
  {
    key:       { type: String, required: true, trim: true },
    nameAr:    { type: String, required: true, trim: true },
    nameEn:    { type: String, required: true, trim: true },
    isEnabled: { type: Boolean, default: true },
  },
  { _id: false }
);

export const siteSettingsSchema = new Schema<ISiteSettings, SiteSettingsModel>(
  {
    activeTheme: { type: String, required: true, default: 'normal', trim: true },
    themes:      { type: [themeSchema], default: DEFAULT_THEMES },
    updatedBy:   { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, versionKey: false }
);
