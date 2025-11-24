import type { TranslationKeys } from '../types/i18n.types.js';

/**
 * English translations
 */
export const en: TranslationKeys = {
  common: {
    success: 'Operation successful',
    error: 'An error occurred',
    notFound: 'Resource not found',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    validationError: 'Validation error',
    serverError: 'Internal server error',
  },

  auth: {
    emailAlreadyRegistered: 'Email already registered',
    userRegisteredSuccessfully: 'User registered successfully',
    invalidEmailOrPassword: 'Invalid email or password',
    accountDeactivated: 'Account is deactivated. Please contact support.',
    loginSuccessful: 'Login successful',
    registrationFailed: 'Registration failed',
    loginFailed: 'Login failed',
    noTokenProvided: 'No token provided',
    tokenExpired: 'Token expired',
    invalidToken: 'Invalid token',
    userNotFound: 'User not found',
    profileFetchFailed: 'Failed to fetch user profile',
    unauthorized: 'Unauthorized. Please login first.',
    adminAccessRequired: 'Admin access required',
  },

  validation: {
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email format',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordTooWeak:
      'Password must contain uppercase, lowercase, number, and special character',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    phoneInvalid: 'Invalid phone number',
    requiredField: 'This field is required',
  },

  product: {
    productNotFound: 'Product not found',
    productCreated: 'Product created successfully',
    productUpdated: 'Product updated successfully',
    productDeleted: 'Product deleted successfully',
    outOfStock: 'Product is out of stock',
    invalidQuantity: 'Invalid quantity',
    fetchFailed: 'Failed to fetch products',
  },

  cart: {
    cartEmpty: 'Cart is empty',
    itemAdded: 'Item added to cart',
    itemRemoved: 'Item removed from cart',
    itemUpdated: 'Cart item updated',
    quantityExceeded: 'Quantity exceeds available stock',
  },

  order: {
    orderCreated: 'Order created successfully',
    orderNotFound: 'Order not found',
    orderCancelled: 'Order cancelled successfully',
    orderStatusUpdated: 'Order status updated',
    invalidOrderStatus: 'Invalid order status',
    cannotCancelOrder: 'Cannot cancel order at this stage',
  },

  category: {
    categoryNotFound: 'Category not found',
    categoryCreated: 'Category created successfully',
    categoryUpdated: 'Category updated successfully',
    categoryDeleted: 'Category deleted successfully',
  },

  review: {
    reviewCreated: 'Review submitted successfully',
    reviewUpdated: 'Review updated successfully',
    reviewDeleted: 'Review deleted successfully',
    reviewNotFound: 'Review not found',
    alreadyReviewed: 'You have already reviewed this product',
    cannotReviewUnpurchased: 'You can only review products you have purchased',
  },

  payment: {
    paymentSuccessful: 'Payment completed successfully',
    paymentFailed: 'Payment failed',
    paymentPending: 'Payment is pending',
    invalidPaymentMethod: 'Invalid payment method',
    insufficientFunds: 'Insufficient funds',
  },

  upload: {
    noFilesUploaded: 'No files uploaded',
    uploadSuccessful: 'Files uploaded successfully',
    uploadFailed: 'Upload failed',
    invalidFileType: 'Invalid file type',
    fileTooLarge: 'File size exceeds maximum limit',
  },
};
