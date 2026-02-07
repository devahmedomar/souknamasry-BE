/**
 * Internationalization (i18n) Types
 * Defines types for multi-language support
 */

/**
 * Supported languages
 */
export type Language = 'en' | 'ar';

/**
 * Translation keys structure
 * Organized by feature/module
 */
export interface TranslationKeys {
  // Common messages
  common: {
    success: string;
    error: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    validationError: string;
    serverError: string;
  };

  // Authentication messages
  auth: {
    phoneAlreadyRegistered: string;
    emailAlreadyRegistered: string;
    userRegisteredSuccessfully: string;
    invalidPhoneOrPassword: string;
    invalidEmailOrPassword: string;
    accountDeactivated: string;
    loginSuccessful: string;
    registrationFailed: string;
    loginFailed: string;
    noTokenProvided: string;
    tokenExpired: string;
    invalidToken: string;
    userNotFound: string;
    profileFetchFailed: string;
    unauthorized: string;
    adminAccessRequired: string;
  };

  // OTP messages
  otp: {
    sent: string;
    verified: string;
    invalid: string;
    expired: string;
    maxAttempts: string;
    sendFailed: string;
    verifyFailed: string;
    resendFailed: string;
    cooldown: string;
    tokenInvalid: string;
    tokenExpired: string;
  };

  // SMS messages
  sms: {
    allProvidersFailed: string;
    quotaExceeded: string;
    sendFailed: string;
  };

  // Validation messages
  validation: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordTooShort: string;
    passwordTooWeak: string;
    firstNameRequired: string;
    lastNameRequired: string;
    phoneRequired: string;
    phoneInvalid: string;
    phoneInvalidEgyptian: string;
    firstNameLength: string;
    lastNameLength: string;
    requiredField: string;
  };

  // Product messages
  product: {
    productNotFound: string;
    productCreated: string;
    productUpdated: string;
    productDeleted: string;
    outOfStock: string;
    invalidQuantity: string;
    fetchFailed: string;
  };

  // Cart messages
  cart: {
    cartEmpty: string;
    itemAdded: string;
    itemRemoved: string;
    itemUpdated: string;
    quantityExceeded: string;
  };

  // Order messages
  order: {
    orderCreated: string;
    orderNotFound: string;
    orderCancelled: string;
    orderStatusUpdated: string;
    invalidOrderStatus: string;
    cannotCancelOrder: string;
  };

  // Category messages
  category: {
    categoryNotFound: string;
    categoryCreated: string;
    categoryUpdated: string;
    categoryDeleted: string;
  };

  // Review messages
  review: {
    reviewCreated: string;
    reviewUpdated: string;
    reviewDeleted: string;
    reviewNotFound: string;
    alreadyReviewed: string;
    cannotReviewUnpurchased: string;
  };

  // Payment messages
  payment: {
    paymentSuccessful: string;
    paymentFailed: string;
    paymentPending: string;
    invalidPaymentMethod: string;
    insufficientFunds: string;
  };

  // Upload messages
  upload: {
    noFilesUploaded: string;
    uploadSuccessful: string;
    uploadFailed: string;
    invalidFileType: string;
    fileTooLarge: string;
  };
}

/**
 * Translation function type
 */
export type TranslateFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;
