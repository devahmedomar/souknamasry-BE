# Translation System - Code Examples

This file contains practical examples for implementing translations in your controllers and services.

## Example 1: Product Controller

### Service Layer (productService.ts)

```typescript
export class ProductService {
  static async getProductById(productId: string): Promise<Product> {
    const product = await Product.findById(productId);

    if (!product) {
      // ❌ Bad: Hardcoded message
      // throw new Error('Product not found');

      // ✅ Good: Translation key
      throw new Error('product.productNotFound');
    }

    if (!product.isActive) {
      throw new Error('product.productNotFound');
    }

    return product;
  }

  static async createProduct(productData: CreateProductDto): Promise<Product> {
    // Validation
    if (productData.stockQuantity < 0) {
      throw new ValidationError('product.invalidQuantity');
    }

    const product = await Product.create(productData);
    return product;
  }
}
```

### Controller Layer (productController.ts)

```typescript
import type { Request, Response } from 'express';
import { ProductService } from '../services/productService.js';
import { ResponseUtil } from '../utils/response.util.js';
import { TranslatedResponseUtil } from '../utils/translatedResponse.util.js';
import { HttpStatusCode } from '../utils/errors/error.types.js';

export class ProductController {
  /**
   * Get product by ID
   * GET /api/products/:id
   */
  static async getProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);

      // Success response - data doesn't need translation
      return ResponseUtil.success(res, { product });

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'common.serverError';

      // Error message is translated automatically
      return TranslatedResponseUtil.fail(
        req,
        res,
        { error: [errorMessage] },
        HttpStatusCode.NOT_FOUND
      );
    }
  }

  /**
   * Create product (Admin only)
   * POST /api/admin/products
   */
  static async createProduct(req: Request, res: Response) {
    try {
      const productData = req.body;
      const product = await ProductService.createProduct(productData);

      // You can also use translation directly in controller
      const successMessage = req.t('product.productCreated');

      return ResponseUtil.created(res, {
        message: successMessage,
        product,
      });

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'common.serverError';

      return TranslatedResponseUtil.fail(
        req,
        res,
        { error: [errorMessage] },
        HttpStatusCode.BAD_REQUEST
      );
    }
  }
}
```

## Example 2: Cart Controller with Multiple Error Types

```typescript
export class CartController {
  static async addToCart(req: Request, res: Response) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.userId; // From auth middleware

      const cart = await CartService.addItem(userId, productId, quantity);

      return ResponseUtil.success(res, { cart });

    } catch (error) {
      if (error instanceof NotFoundError) {
        // Product not found
        return TranslatedResponseUtil.fail(
          req,
          res,
          { product: [error.message] }, // Translation key
          HttpStatusCode.NOT_FOUND
        );
      }

      if (error instanceof ValidationError) {
        // Quantity validation error
        return TranslatedResponseUtil.fail(
          req,
          res,
          { quantity: [error.message] },
          HttpStatusCode.BAD_REQUEST
        );
      }

      // Generic error
      return TranslatedResponseUtil.error(
        req,
        res,
        'common.serverError',
        'CART_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
```

## Example 3: Using Translation with Parameters

```typescript
// Add to en.ts
{
  order: {
    totalAmount: 'Total amount: {amount} EGP',
    itemCount: 'You have {count} items in your order',
  }
}

// Add to ar.ts
{
  order: {
    totalAmount: 'المبلغ الإجمالي: {amount} جنيه',
    itemCount: 'لديك {count} عناصر في طلبك',
  }
}

// Use in controller
export class OrderController {
  static async getOrderSummary(req: Request, res: Response) {
    try {
      const order = await OrderService.getById(req.params.id);

      // Translate messages with parameters
      const totalMessage = req.t('order.totalAmount', {
        amount: order.totalAmount
      });

      const itemMessage = req.t('order.itemCount', {
        count: order.items.length
      });

      return ResponseUtil.success(res, {
        order,
        summary: {
          totalMessage,  // "Total amount: 500 EGP" or "المبلغ الإجمالي: 500 جنيه"
          itemMessage,   // "You have 3 items" or "لديك 3 عناصر"
        },
      });

    } catch (error) {
      // Handle errors...
    }
  }
}
```

## Example 4: Validation Errors with Multiple Fields

```typescript
export class UserController {
  static async updateProfile(req: Request, res: Response) {
    try {
      const { email, phone, firstName, lastName } = req.body;
      const errors: Record<string, string[]> = {};

      // Collect validation errors
      if (!email) {
        errors.email = ['validation.emailRequired'];
      } else if (!isValidEmail(email)) {
        errors.email = ['validation.emailInvalid'];
      }

      if (!firstName) {
        errors.firstName = ['validation.firstNameRequired'];
      }

      if (!lastName) {
        errors.lastName = ['validation.lastNameRequired'];
      }

      // If there are errors, return them (will be translated)
      if (Object.keys(errors).length > 0) {
        return TranslatedResponseUtil.fail(
          req,
          res,
          errors, // All values will be translated
          HttpStatusCode.BAD_REQUEST
        );
      }

      // Update user...
      const user = await UserService.update(req.user.userId, req.body);

      return ResponseUtil.success(res, { user });

    } catch (error) {
      return TranslatedResponseUtil.error(
        req,
        res,
        'common.serverError',
        'UPDATE_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
```

## Example 5: Custom Error Messages

```typescript
// Sometimes you need to return a custom error that's not pre-defined

export class PaymentController {
  static async processPayment(req: Request, res: Response) {
    try {
      const payment = await PaymentService.process(req.body);

      if (payment.status === 'failed') {
        // Use existing translation key
        return TranslatedResponseUtil.fail(
          req,
          res,
          { payment: ['payment.paymentFailed'] },
          HttpStatusCode.PAYMENT_REQUIRED
        );
      }

      return ResponseUtil.success(res, { payment });

    } catch (error) {
      // Check for specific payment errors
      if (error.message.includes('insufficient')) {
        return TranslatedResponseUtil.fail(
          req,
          res,
          { payment: ['payment.insufficientFunds'] },
          HttpStatusCode.PAYMENT_REQUIRED
        );
      }

      return TranslatedResponseUtil.error(
        req,
        res,
        'payment.paymentFailed',
        'PAYMENT_ERROR',
        undefined,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
```

## Example 6: Direct Translation in Business Logic

```typescript
import { I18nUtil } from '../utils/i18n.util.js';

export class EmailService {
  static async sendWelcomeEmail(user: User, language: Language) {
    // Create translator for specific language
    const t = I18nUtil.createTranslator(language);

    // Use translations in email
    const subject = t('email.welcomeSubject', { name: user.firstName });
    const body = t('email.welcomeBody');

    await sendEmail({
      to: user.email,
      subject,
      body,
    });
  }
}
```

## Common Patterns

### Pattern 1: Simple Error Response
```typescript
return TranslatedResponseUtil.fail(
  req,
  res,
  { error: ['translation.key'] },
  HttpStatusCode.BAD_REQUEST
);
```

### Pattern 2: Multiple Field Errors
```typescript
return TranslatedResponseUtil.fail(
  req,
  res,
  {
    email: ['validation.emailInvalid'],
    password: ['validation.passwordTooShort'],
  },
  HttpStatusCode.BAD_REQUEST
);
```

### Pattern 3: Server Error
```typescript
return TranslatedResponseUtil.error(
  req,
  res,
  'common.serverError',
  'ERROR_CODE',
  undefined,
  HttpStatusCode.INTERNAL_SERVER_ERROR
);
```

### Pattern 4: Success with Custom Message
```typescript
const message = req.t('resource.created');
return ResponseUtil.success(res, { message, data: resource });
```

## Migration Checklist

When updating existing controllers to use translations:

- [ ] Replace hardcoded error messages with translation keys
- [ ] Import `TranslatedResponseUtil`
- [ ] Update error handling to use `TranslatedResponseUtil.fail()` or `.error()`
- [ ] Add translation keys to `src/locales/en.ts`
- [ ] Add Arabic translations to `src/locales/ar.ts`
- [ ] Update TypeScript types in `src/types/i18n.types.ts`
- [ ] Test with both `?lang=en` and `?lang=ar`
- [ ] Update API documentation

## Quick Reference

| Method | Use Case | Example |
|--------|----------|---------|
| `req.t(key)` | Direct translation | `req.t('auth.loginSuccessful')` |
| `req.t(key, params)` | Translation with params | `req.t('order.total', { amount: 100 })` |
| `TranslatedResponseUtil.fail()` | Client errors (4xx) | Validation, not found, unauthorized |
| `TranslatedResponseUtil.error()` | Server errors (5xx) | Database errors, unexpected errors |
| `ResponseUtil.success()` | Success responses | Return data without translation |
| `ResponseUtil.created()` | Created responses (201) | Resource creation success |
