import { en } from './en.js';
import { ar } from './ar.js';
import type { Language, TranslationKeys } from '../types/i18n.types.js';

/**
 * Translations map
 * Maps language codes to their respective translation objects
 */
export const translations: Record<Language, TranslationKeys> = {
  en,
  ar,
};

/**
 * Default language
 */
export const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Supported languages list
 */
export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ar'];
