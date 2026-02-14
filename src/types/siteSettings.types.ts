import { Document, Model, Types } from 'mongoose';

export interface ITheme {
  key: string;
  nameAr: string;
  nameEn: string;
  isEnabled: boolean;
}

export interface ISiteSettings {
  activeTheme: string;
  themes: ITheme[];
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type SiteSettingsDocument = ISiteSettings & Document;
export type SiteSettingsModel = Model<ISiteSettings>;
