import type { Request, Response, NextFunction } from 'express';
import type { Language } from '../types/i18n.types.js';
import { I18nUtil } from '../utils/i18n.util.js';
import { DEFAULT_LANGUAGE } from '../locales/index.js';

/**
 * Extend Express Request to include language
 */
declare global {
  namespace Express {
    interface Request {
      language: Language;
      t: (key: string, params?: Record<string, string | number>) => string;
    }
  }
}

/**
 * i18n Middleware
 * Detects user's preferred language and attaches translation function to request
 *
 * Language detection order:
 * 1. Query parameter: ?lang=ar
 * 2. Custom header: X-Language: ar
 * 3. Accept-Language header
 * 4. Default language (en)
 */
export const i18nMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let language: Language = DEFAULT_LANGUAGE;

  // 1. Check query parameter
  const queryLang = req.query.lang as string;
  if (queryLang && I18nUtil.isSupported(queryLang)) {
    language = queryLang as Language;
  }
  // 2. Check custom header
  else {
    const headerLang = req.headers['x-language'] as string;
    if (headerLang && I18nUtil.isSupported(headerLang)) {
      language = headerLang as Language;
    }
    // 3. Parse Accept-Language header
    else {
      const acceptLanguage = req.headers['accept-language'];
      language = I18nUtil.parseAcceptLanguage(acceptLanguage);
    }
  }

  // Attach language and translation function to request
  req.language = language;
  req.t = I18nUtil.createTranslator(language);

  // Set Content-Language response header
  res.setHeader('Content-Language', language);

  next();
};
