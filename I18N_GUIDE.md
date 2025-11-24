# Internationalization (i18n) Guide

This guide explains how to use the translation system in the Souknamasry Backend API.

## Overview

The backend supports **Arabic (ar)** and **English (en)** languages. All API responses automatically translate messages based on the client's language preference.

## How It Works

### 1. Language Detection

The system detects the user's preferred language in the following order:

1. **Query Parameter**: `?lang=ar` or `?lang=en`
2. **Custom Header**: `X-Language: ar` or `X-Language: en`
3. **Accept-Language Header**: Standard HTTP header
4. **Default**: English (`en`)

### 2. Request Examples

#### Using Query Parameter
```bash
# Get response in Arabic
curl -X POST "http://localhost:3000/api/auth/login?lang=ar" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'

# Response:
{
  "status": "fail",
  "data": {
    "credentials": ["البريد الإلكتروني أو كلمة المرور غير صحيحة"]
  }
}
```

#### Using Custom Header
```bash
# Get response in English
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Language: en" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'

# Response:
{
  "status": "fail",
  "data": {
    "credentials": ["Invalid email or password"]
  }
}
```

#### Using Accept-Language Header
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ar,en;q=0.9" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'
```

## For Frontend Developers

### React/Next.js Example

```javascript
// Set language in API calls
const login = async (email, password, language = 'en') => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Language': language, // 'en' or 'ar'
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
};

// Usage
const result = await login('user@example.com', 'password', 'ar');
```

### Axios Example

```javascript
import axios from 'axios';

// Create axios instance with language header
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'X-Language': localStorage.getItem('language') || 'en',
  },
});

// Update language dynamically
export const setLanguage = (lang) => {
  api.defaults.headers['X-Language'] = lang;
  localStorage.setItem('language', lang);
};

// Make API calls
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};
```

## For Backend Developers

### Adding New Translations

#### 1. Add Translation Keys to Types

Edit `src/types/i18n.types.ts`:

```typescript
export interface TranslationKeys {
  // ... existing keys

  // Add new feature translations
  myFeature: {
    featureCreated: string;
    featureNotFound: string;
    featureUpdated: string;
  };
}
```

#### 2. Add English Translations

Edit `src/locales/en.ts`:

```typescript
export const en: TranslationKeys = {
  // ... existing translations

  myFeature: {
    featureCreated: 'Feature created successfully',
    featureNotFound: 'Feature not found',
    featureUpdated: 'Feature updated successfully',
  },
};
```

#### 3. Add Arabic Translations

Edit `src/locales/ar.ts`:

```typescript
export const ar: TranslationKeys = {
  // ... existing translations

  myFeature: {
    featureCreated: 'تم إنشاء الميزة بنجاح',
    featureNotFound: 'الميزة غير موجودة',
    featureUpdated: 'تم تحديث الميزة بنجاح',
  },
};
```

### Using Translations in Services

Throw errors with translation keys instead of hardcoded messages:

```typescript
// ❌ Bad - Hardcoded message
throw new Error('Feature not found');

// ✅ Good - Translation key
throw new Error('myFeature.featureNotFound');
```

### Using Translations in Controllers

Use `TranslatedResponseUtil` instead of `ResponseUtil`:

```typescript
import { TranslatedResponseUtil } from '../utils/translatedResponse.util.js';

export class MyController {
  static async createFeature(req: Request, res: Response) {
    try {
      const feature = await MyService.create(req.body);

      // Success response (no translation needed for data)
      return ResponseUtil.success(res, feature);

    } catch (error) {
      // Error response with translation
      return TranslatedResponseUtil.fail(
        req,
        res,
        { error: [error.message] }, // error.message is a translation key
        HttpStatusCode.BAD_REQUEST
      );
    }
  }
}
```

### Translation with Parameters

For messages with dynamic values:

```typescript
// Add to translation files with placeholders
// en.ts
{
  order: {
    itemsInCart: 'You have {count} items in your cart',
  }
}

// ar.ts
{
  order: {
    itemsInCart: 'لديك {count} عنصر في السلة',
  }
}

// Use in controller
const message = req.t('order.itemsInCart', { count: 5 });
// English: "You have 5 items in your cart"
// Arabic: "لديك 5 عنصر في السلة"
```

## Available Translation Categories

- `common` - Common messages (success, error, not found, etc.)
- `auth` - Authentication messages
- `validation` - Form validation messages
- `product` - Product-related messages
- `cart` - Shopping cart messages
- `order` - Order management messages
- `category` - Category messages
- `review` - Review messages
- `payment` - Payment messages
- `upload` - File upload messages

## Testing Translations

### Test with cURL

```bash
# Test in English
curl -X POST "http://localhost:3000/api/auth/register?lang=en" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@example.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test in Arabic
curl -X POST "http://localhost:3000/api/auth/register?lang=ar" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "duplicate@example.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Postman Testing

1. Add a header: `X-Language` with value `ar` or `en`
2. Or add query parameter: `?lang=ar`
3. Send request and verify response language

## Best Practices

1. **Always use translation keys** in services and errors
2. **Never hardcode messages** in English or Arabic
3. **Add translations for both languages** when adding new features
4. **Use meaningful key names** (e.g., `auth.emailAlreadyRegistered`)
5. **Group related translations** by feature/module
6. **Keep messages concise** and user-friendly
7. **Test both languages** before deploying

## Response Format

All API responses include a `Content-Language` header indicating the language used:

```
Content-Language: ar
```

This helps frontend applications verify the response language.

## Troubleshooting

### Translation Key Not Found

If a translation key is missing, the system will:
1. Log a warning: `Translation key 'xxx' not found for language 'ar'`
2. Return the key itself as fallback

### Language Not Detected

If language detection fails:
1. System falls back to default language (English)
2. Check if `i18nMiddleware` is registered in `app.ts`
3. Verify headers/query parameters are sent correctly

### Missing Translations

If you see English text when expecting Arabic:
1. Check if the translation key exists in `src/locales/ar.ts`
2. Verify the key path matches (e.g., `auth.emailAlreadyRegistered`)
3. Ensure the translation file is properly imported

## Future Enhancements

Potential improvements to the i18n system:

- [ ] Add more languages (French, Spanish, etc.)
- [ ] Pluralization support (1 item vs 2 items)
- [ ] Date/time formatting per locale
- [ ] Currency formatting
- [ ] RTL support hints in responses
- [ ] Language preference in user profile
