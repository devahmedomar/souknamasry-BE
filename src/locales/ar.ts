import type { TranslationKeys } from '../types/i18n.types.js';

/**
 * Arabic translations
 */
export const ar: TranslationKeys = {
  common: {
    success: 'تمت العملية بنجاح',
    error: 'حدث خطأ',
    notFound: 'المورد غير موجود',
    unauthorized: 'غير مصرح بالدخول',
    forbidden: 'الوصول ممنوع',
    validationError: 'خطأ في التحقق من الصحة',
    serverError: 'خطأ في الخادم الداخلي',
  },

  auth: {
    emailAlreadyRegistered: 'البريد الإلكتروني مسجل بالفعل',
    userRegisteredSuccessfully: 'تم تسجيل المستخدم بنجاح',
    invalidEmailOrPassword: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    accountDeactivated: 'الحساب معطل. يرجى التواصل مع الدعم الفني.',
    loginSuccessful: 'تم تسجيل الدخول بنجاح',
    registrationFailed: 'فشل التسجيل',
    loginFailed: 'فشل تسجيل الدخول',
    noTokenProvided: 'لم يتم توفير رمز الوصول',
    tokenExpired: 'انتهت صلاحية رمز الوصول',
    invalidToken: 'رمز وصول غير صالح',
    userNotFound: 'المستخدم غير موجود',
    profileFetchFailed: 'فشل في جلب ملف المستخدم',
    unauthorized: 'غير مصرح. يرجى تسجيل الدخول أولاً.',
    adminAccessRequired: 'يتطلب صلاحيات المسؤول',
  },

  validation: {
    emailRequired: 'البريد الإلكتروني مطلوب',
    emailInvalid: 'صيغة البريد الإلكتروني غير صحيحة',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordTooShort: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    passwordTooWeak:
      'يجب أن تحتوي كلمة المرور على أحرف كبيرة وصغيرة وأرقام ورموز خاصة',
    firstNameRequired: 'الاسم الأول مطلوب',
    lastNameRequired: 'اسم العائلة مطلوب',
    phoneInvalid: 'رقم الهاتف غير صحيح',
    requiredField: 'هذا الحقل مطلوب',
  },

  product: {
    productNotFound: 'المنتج غير موجود',
    productCreated: 'تم إنشاء المنتج بنجاح',
    productUpdated: 'تم تحديث المنتج بنجاح',
    productDeleted: 'تم حذف المنتج بنجاح',
    outOfStock: 'المنتج غير متوفر في المخزون',
    invalidQuantity: 'كمية غير صحيحة',
    fetchFailed: 'فشل في جلب المنتجات',
  },

  cart: {
    cartEmpty: 'السلة فارغة',
    itemAdded: 'تمت إضافة المنتج إلى السلة',
    itemRemoved: 'تمت إزالة المنتج من السلة',
    itemUpdated: 'تم تحديث عنصر السلة',
    quantityExceeded: 'الكمية تتجاوز المخزون المتاح',
  },

  order: {
    orderCreated: 'تم إنشاء الطلب بنجاح',
    orderNotFound: 'الطلب غير موجود',
    orderCancelled: 'تم إلغاء الطلب بنجاح',
    orderStatusUpdated: 'تم تحديث حالة الطلب',
    invalidOrderStatus: 'حالة الطلب غير صحيحة',
    cannotCancelOrder: 'لا يمكن إلغاء الطلب في هذه المرحلة',
  },

  category: {
    categoryNotFound: 'الفئة غير موجودة',
    categoryCreated: 'تم إنشاء الفئة بنجاح',
    categoryUpdated: 'تم تحديث الفئة بنجاح',
    categoryDeleted: 'تم حذف الفئة بنجاح',
  },

  review: {
    reviewCreated: 'تم إرسال المراجعة بنجاح',
    reviewUpdated: 'تم تحديث المراجعة بنجاح',
    reviewDeleted: 'تم حذف المراجعة بنجاح',
    reviewNotFound: 'المراجعة غير موجودة',
    alreadyReviewed: 'لقد قمت بمراجعة هذا المنتج بالفعل',
    cannotReviewUnpurchased: 'يمكنك مراجعة المنتجات التي قمت بشرائها فقط',
  },

  payment: {
    paymentSuccessful: 'تمت عملية الدفع بنجاح',
    paymentFailed: 'فشلت عملية الدفع',
    paymentPending: 'عملية الدفع قيد الانتظار',
    invalidPaymentMethod: 'طريقة دفع غير صحيحة',
    insufficientFunds: 'رصيد غير كافٍ',
  },

  upload: {
    noFilesUploaded: 'لم يتم تحميل أي ملفات',
    uploadSuccessful: 'تم تحميل الملفات بنجاح',
    uploadFailed: 'فشل التحميل',
    invalidFileType: 'نوع الملف غير صحيح',
    fileTooLarge: 'حجم الملف يتجاوز الحد الأقصى',
  },
};
