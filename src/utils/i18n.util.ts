import type { Language, TranslateFunction } from '../types/i18n.types.js';
import {
  translations,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '../locales/index.js';

/**
 * i18n Utility Class
 * Handles internationalization and translation
 */
export class I18nUtil {
  /**
   * Get the value of a nested key from an object
   * @param obj - Object to search
   * @param path - Dot notation path (e.g., "auth.emailAlreadyRegistered")
   * @returns Value at the path or undefined
   */
  private static getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Translate a message key to the target language
   * @param key - Translation key in dot notation (e.g., "auth.emailAlreadyRegistered")
   * @param language - Target language ('en' or 'ar')
   * @param params - Optional parameters for string interpolation
   * @returns Translated message
   */
  static translate(
    key: string,
    language: Language = DEFAULT_LANGUAGE,
    params?: Record<string, string | number>
  ): string {
    // Get the translation object for the language
    const langTranslations = translations[language];

    if (!langTranslations) {
      console.warn(`Language '${language}' not found, using default`);
      return this.translate(key, DEFAULT_LANGUAGE, params);
    }

    // Get the translation using dot notation
    const translation = this.getNestedValue(langTranslations, key);

    if (!translation) {
      console.warn(
        `Translation key '${key}' not found for language '${language}'`
      );
      // Return the key itself as fallback
      return key;
    }

    // If no params, return the translation as is
    if (!params) {
      return translation;
    }

    // Replace parameters in the translation
    // Example: "Hello {name}" with params { name: "Ahmed" } => "Hello Ahmed"
    return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
      return result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }, translation);
  }

  /**
   * Create a translation function bound to a specific language
   * @param language - Target language
   * @returns Translation function
   */
  static createTranslator(language: Language = DEFAULT_LANGUAGE): TranslateFunction {
    return (key: string, params?: Record<string, string | number>): string => {
      return this.translate(key, language, params);
    };
  }

  /**
   * Parse Accept-Language header and get the preferred language
   * @param acceptLanguageHeader - Accept-Language header value
   * @returns Preferred language from supported languages
   */
  static parseAcceptLanguage(acceptLanguageHeader?: string): Language {
    if (!acceptLanguageHeader) {
      return DEFAULT_LANGUAGE;
    }

    // Parse Accept-Language header
    // Format: "en-US,en;q=0.9,ar;q=0.8"
    const languages = acceptLanguageHeader
      .split(',')
      .map((lang) => {
        const parts = lang.trim().split(';');
        const code = parts[0]?.split('-')[0] || ''; // Get language code (e.g., "en" from "en-US")
        const quality = parts[1] ? parseFloat(parts[1].split('=')[1] || '1.0') : 1.0;
        return { code, quality };
      })
      .sort((a, b) => b.quality - a.quality); // Sort by quality descending

    // Find first supported language
    for (const { code } of languages) {
      if (SUPPORTED_LANGUAGES.includes(code as Language)) {
        return code as Language;
      }
    }

    return DEFAULT_LANGUAGE;
  }

  /**
   * Check if a language is supported
   * @param language - Language code to check
   * @returns True if supported
   */
  static isSupported(language: string): language is Language {
    return SUPPORTED_LANGUAGES.includes(language as Language);
  }
}
