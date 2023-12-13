import type { LocalizationResource } from '@clerk/types';

const commonTexts = {
  signIn: {
    phoneCode: {
      title: 'تحقق من هاتفك',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      formTitle: 'رمز التحقق',
      formSubtitle: 'أدخل رمز التحقق المرسل إلى رقم هاتفك',
      resendButton: 'لم يصلك الرمز؟ حاول مرة أخرى',
    },
  },
} as const;

export const arSA: LocalizationResource = {
  locale: 'ar-SA',
  socialButtonsBlockButton: 'للمتابعة مع {{provider|titleize}}',
  dividerText: 'أو',
  formFieldLabel__emailAddress: 'العنوان الإلكتروني',
  formFieldLabel__emailAddresses: 'العناوين الإلكترونية',
  formFieldLabel__phoneNumber: 'رقم الجوال',
  formFieldLabel__username: 'اسم المستخدم',
  formFieldLabel__emailAddress_username: 'العنوان الإلكتروني أو اسم المستخدم',
  formFieldLabel__password: 'كلمة المرور',
  formFieldLabel__currentPassword: 'كلمة المرور الحالية',
  formFieldLabel__newPassword: 'كلمة المرور الجديدة',
  formFieldLabel__confirmPassword: 'تأكيد كلمة المرور',
  formFieldLabel__signOutOfOtherSessions: 'تسجيل الخروج من جميع الأجهزة',
  formFieldLabel__automaticInvitations: 'تمكين الدعوة الأوتماتكية لهذا النطاق',
  formFieldLabel__firstName: 'الاسم الأول',
  formFieldLabel__lastName: 'الاسم الأخير',
  formFieldLabel__backupCode: 'الرمز الأحتياطي',
  formFieldLabel__organizationName: 'اسم المنظمة',
  formFieldLabel__organizationSlug: 'رابط المنظمة',
  formFieldLabel__organizationDomain: 'النطاق',
  formFieldLabel__organizationDomainEmailAddress: 'عنوان البريد الإلكتروني للتحقق',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'أدخل البريد الإلكتروني الخاص بالنطاق للحصول على  الرمز والتحقق من النطاق',
  formFieldLabel__organizationDomainDeletePending: 'حذف الدعوات والأقتراحات المعلقة',
  formFieldLabel__confirmDeletion: 'تأكيد',
  formFieldLabel__role: 'دور',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddresses: 'أدخل أو لصق عنوان بريد إلكتروني واحد أو أكثر ، مفصولة بمسافات أو فواصل',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldInputPlaceholder__organizationSlug: '',
  formFieldInputPlaceholder__organizationDomain: '',
  formFieldInputPlaceholder__organizationDomainEmailAddress: '',
  formFieldError__notMatchingPasswords: `كلمة المرور لا تتطابق`,
  formFieldError__matchingPasswords: 'كلمة المرور مطابقة',
  formFieldError__verificationLinkExpired: 'صلاحية رمز التأكيد أنتهت. يرجى طلب رابط جديد',
  formFieldAction__forgotPassword: 'نسيت كلمة المرور؟',
  formFieldHintText__optional: 'إختياري',
  formButtonPrimary: 'متابعة',
  signInEnterPasswordTitle: 'إدخل كلمة المرور',
  backButton: 'الرجوع',
  footerActionLink__useAnotherMethod: 'أختر طريقة أخرى',
  badge__primary: 'الرئيسي',
  badge__thisDevice: 'هذا الجهاز',
  badge__userDevice: 'جهاز المستخدم',
  badge__otherImpersonatorDevice: 'جهاز منتحل آخر',
  badge__default: 'الأفتراضي',
  badge__unverified: 'لم يتم التحقق منه',
  badge__requiresAction: 'الإجراء المطلوب',
  badge__you: 'أنت',
  footerPageLink__help: 'المساعدة',
  footerPageLink__privacy: 'الخصوصية',
  footerPageLink__terms: 'الشروط',
  paginationButton__previous: 'السابق',
  paginationButton__next: 'التالي',
  paginationRowText__displaying: 'عرض',
  paginationRowText__of: 'من',
  membershipRole__admin: 'المسؤول',
  membershipRole__basicMember: 'عضو',
  membershipRole__guestMember: 'ضيف',
  signUp: {
    start: {
      title: 'أنشاء حساب جديد',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      actionText: 'لديك حساب بالفعل؟',
      actionLink: 'تسجيل الدخول',
    },
    emailLink: {
      title: 'التحقق من البريد الإلكتروني',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      formTitle: 'رابط التحقق',
      formSubtitle: 'أستعمل رابط التحقق المرسل إلى بريدك الإلكتروني',
      resendButton: 'لم يصلك الرابط؟ حاول مرة أخرى',
      verified: {
        title: 'تم تسجيل الحساب بنجاح',
      },
      loading: {
        title: 'إنشاء حساب...',
      },
      verifiedSwitchTab: {
        title: 'تم التحقق بنجاح من البريد الإلكتروني',
        subtitle: 'ارجع إلى علامة التبويب المفتوحة حديثًا للمتابعة',
        subtitleNewTab: 'ارجع إلى علامة التبويب السابقة للمتابعة',
      },
    },
    emailCode: {
      title: 'تحقق من بريدك الإلكتروني',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      formTitle: 'رمز التحقق',
      formSubtitle: 'أدخل رمز التحقق المرسل إلى بريدك الإلكتروني',
      resendButton: 'لم يصلك الرمز؟ حاول مرة أخرى',
    },
    phoneCode: {
      title: 'تحقق من هاتفك',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      formTitle: 'رمز التحقق',
      formSubtitle: 'أدخل رمز التحقق المرسل إلى هاتفك',
      resendButton: 'لم يصلك الرمز؟ حاول مرة أخرى',
    },
    continue: {
      title: 'املأ الحقول المفقودة',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      actionText: 'ليس لديك حساب؟',
      actionLink: 'تسجيل الدخول',
    },
  },
  signIn: {
    start: {
      title: 'تسجيل الدخول',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      actionText: 'ليس لديك حساب؟',
      actionLink: 'إنشاء حساب جديد',
      actionLink__use_email: 'استخدم البريد الإلكتروني',
      actionLink__use_phone: 'استخدم رقم الجوال',
      actionLink__use_username: 'استخدم اسم المستخدم',
      actionLink__use_email_username: 'استخدم البريد الإلكتروني أو اسم المستخدم',
    },
    password: {
      title: 'ادخل كلمة المرور',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      actionLink: 'أستعمل طريقة أخرى',
    },
    forgotPasswordAlternativeMethods: {
      title: 'نسيت كلمة المرور؟',
      label__alternativeMethods: 'أو سجل الدخول بطريقة أخرى',
      blockButton__resetPassword: 'أعادة تعيين كلمة المرور',
    },
    forgotPassword: {
      title_email: 'تحقق من البريد الإلكتروني',
      title_phone: 'تحقق من رقم الهاتف',
      subtitle: 'لأعادة تعيين كلمة المرور',
      formTitle: 'رمز تحقق لأعادة تعيين كلمة المرور',
      formSubtitle_email: 'أرسل الرمز المرسل إلى بريدك الإلكتروني',
      formSubtitle_phone: 'أدخل الرمز المرسل إلى هاتفك',
      resendButton: 'لم يصلك اي رمز؟ حاول مرة أخرى.',
    },
    resetPassword: {
      title: 'أعادة تعيين كلمة المرور',
      formButtonPrimary: 'أعادة تعيين كلمة المرور',
      successMessage: 'تم تغيير كلمة المرور بنجاح. يتم تسجيل الدخول الرجاء الأنتظار قليلا.',
      requiredMessage:
        'يوجد حساب بالفعل بهذا البريد الإلكتروني لم يتم التحقق منه. الرجاء أعادة تعيين كلمة المرور لتأمين حسابك',
    },
    resetPasswordMfa: {
      detailsLabel: 'نريد التحقق من هويتك قبل أعادة تعيين كلمة المرور',
    },
    emailCode: {
      title: 'التحقق من البريد الإلكتروني',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      formTitle: 'رمز التحقق',
      formSubtitle: 'ادخل رمز التحقق المرسل إلى بريدك الإلكتروني',
      resendButton: 'لم يصلك اي رمز؟ حاول مرة أخرى.',
    },
    emailLink: {
      title: 'التحقق من البريد الإلكتروني',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      formTitle: 'رابط التحقق',
      formSubtitle: 'أستعمل رابط التحقق المرسل إلى بريدك الإلكتروني',
      resendButton: 'لم يصلك الرابط؟ حاول مرة أخرى',
      unusedTab: {
        title: 'يمكنك أغلاق هذه النافذة',
      },
      verified: {
        title: 'تم تسجيل الحساب بنجاح',
        subtitle: 'سيتم أعادة توجيهك في لحظات',
      },
      verifiedSwitchTab: {
        subtitle: 'ارجع إلى علامة التبويب الرئيسية للمتابعة',
        titleNewTab: 'تم تسجيل الدخول في علامة تبويب أخرى',
        subtitleNewTab: 'ارجع إلى علامة التبويب المفتوحة حديثًا للمتابعة',
      },
      loading: {
        title: 'تسجيل الدخول...',
        subtitle: 'ستتم إعادة توجيهك قريبًا',
      },
      failed: {
        title: 'رابط التحقق هذا غير صالح',
        subtitle: 'ارجع إلى علامة التبويب الرئيسية للمتابعة.',
      },
      expired: {
        title: 'انتهت صلاحية رابط التحقق هذا.',
        subtitle: 'ارجع إلى علامة التبويب الرئيسية للمتابعة.',
      },
    },
    phoneCode: { ...commonTexts.signIn.phoneCode },
    phoneCodeMfa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totpMfa: {
      title: 'نظام التحقق بخطوتين',
      subtitle: '',
      formTitle: 'رمز التحقق',
      formSubtitle: 'أدخل رمز التحقق الذي تم إنشاؤه بواسطة تطبيق المصادقة الخاص بك',
    },
    backupCodeMfa: {
      title: 'أدخل الرمز الأحتياطي',
      subtitle: 'للمتابعة إلى {{applicationName}}',
      formTitle: '',
      formSubtitle: '',
    },
    alternativeMethods: {
      title: 'أستخدام طريقة أخرى',
      actionLink: 'الحصول على المساعدة',
      blockButton__emailLink: 'رابط البريد الإلكتروني ل {{identifier}}',
      blockButton__emailCode: 'رمز البريد الإلكتروني ل  {{identifier}}',
      blockButton__phoneCode: 'أرسال رسالة نصية ل{{identifier}}',
      blockButton__password: 'تسجيل الدخول بكلمة السر الخاصة بك',
      blockButton__totp: 'استخدم تطبيق المصادقة الخاص بك',
      blockButton__backupCode: 'استخدم رمز النسخ الاحتياطي',
      getHelp: {
        title: 'الحصول على المساعدة',
        content: `إذا كنت تواجه صعوبة في تسجيل الدخول إلى حسابك ، راسلنا عبر البريد الإلكتروني وسنعمل معك لاستعادة الوصول في أقرب وقت ممكن.`,
        blockButton__emailSupport: 'بريد الدعم الفني',
      },
    },
    noAvailableMethods: {
      title: 'لا يمكن تسجيل الدخول',
      subtitle: 'حدث خطأ',
      message: 'لا يمكن متابعة تسجيل الدخول. لا يوجد وسيلة مصادقة متاحة.',
    },
  },
  userProfile: {
    mobileButton__menu: 'القائمة',
    formButtonPrimary__continue: 'متابعة',
    formButtonPrimary__finish: 'انهاء',
    formButtonReset: 'الغاء',
    start: {
      headerTitle__account: 'الحساب',
      headerTitle__security: 'الأمان',
      profileSection: {
        title: 'الملف الشخصي',
      },
      usernameSection: {
        title: 'اسم المستخدم',
        primaryButton__changeUsername: 'تغيير اسم المستخدم',
        primaryButton__setUsername: 'تعيين اسم المستخدم',
      },
      emailAddressesSection: {
        title: 'العنوان الإلكتروني',
        primaryButton: 'أضافة عنوان إلكتروني',
        detailsTitle__primary: 'العنوان الإلكتروني الرئيسي',
        detailsSubtitle__primary: 'هذا البريد الإلكتروني هوا البريد الإلكتروني الرئيسي',
        detailsAction__primary: 'التحقق الكامل',
        detailsTitle__nonPrimary: 'تعيين كعنوان الكتروني رئيسي',
        detailsSubtitle__nonPrimary:
          'قم بتعيين عنوان البريد الإلكتروني هذا باعتباره الرئيسي لتلقي الاتصالات المتعلقة بحسابك.',
        detailsAction__nonPrimary: 'تعيين كبريد رئيسي',
        detailsTitle__unverified: 'التحقق من البريد الإلكتروني',
        detailsSubtitle__unverified: 'تحقق كامل للوصول إلى جميع المميزات لهذا البريد الإلكتروني',
        detailsAction__unverified: 'تحقق من البريد الإلكتروني',
        destructiveActionTitle: 'حذف',
        destructiveActionSubtitle: 'أحذف هذا البريد الإلكتروني من حسابك',
        destructiveAction: 'أحذف البريد الإلكتروني',
      },
      phoneNumbersSection: {
        title: 'رقم الجوال',
        primaryButton: 'إضافة رقم جوال',
        detailsTitle__primary: 'رقم الجوال الرئيسي',
        detailsSubtitle__primary: 'هذا الرقم هوا الرقم الرئيسي',
        detailsAction__primary: 'التحقق الكامل',
        detailsTitle__nonPrimary: 'تعيين كرقم جوال رئيسي',
        detailsSubtitle__nonPrimary: 'تعيين هذا الرقم كرقم رئيسي لأستقبال المعلومات الخاصة بحسابك',
        detailsAction__nonPrimary: 'تعيين كرئيسي',
        detailsTitle__unverified: 'تحقق من رقم الجوال',
        detailsSubtitle__unverified: 'تحقق كامل للوصول إلى جميع المميزات بأستخدام هذا الرقم',
        detailsAction__unverified: 'تحقق من رقم الجوال',
        destructiveActionTitle: 'حذف',
        destructiveActionSubtitle: 'حذف هذا الرقم وإزالته من حسابك',
        destructiveAction: 'حذف رقم الجوال',
      },
      connectedAccountsSection: {
        title: 'الحسابات المتصلة',
        primaryButton: 'ربط حساب',
        title__connectionFailed: 'إعادة محاولة ربط الحساب',
        title__reauthorize: 'مطلوب إعادة تفويض',
        subtitle__reauthorize:
          'تم تحديث النطاقات المطلوبة ، وقد تواجه وظائف محدودة. يرجى إعادة تفويض هذا التطبيق لتجنب أي مشاكل',
        actionLabel__connectionFailed: 'حاول مرة أخرى',
        actionLabel__reauthorize: 'أعطى الصلاحية الآن',
        destructiveActionTitle: 'حذف',
        destructiveActionSubtitle: 'حذف هذا الحساب المتصل من حسابك',
        destructiveActionAccordionSubtitle: 'حذف الحساب المتصل',
      },
      enterpriseAccountsSection: {
        title: 'حساب المؤسسات',
      },
      passwordSection: {
        title: 'كلمة المرور',
        primaryButton__changePassword: 'تغيير كلمة المرور',
        primaryButton__setPassword: 'تعيين كلمة المرور',
      },
      mfaSection: {
        title: 'التحقق بخطوتين',
        primaryButton: 'إضافةالتحقق بخطوتين',
        phoneCode: {
          destructiveActionTitle: 'حذف',
          destructiveActionSubtitle: 'حذف رقم الجوال هذا من طريقة التحقق بخطوتين',
          destructiveActionLabel: 'حذف رقم الجوال',
          title__default: 'العامل الأفتراضي',
          title__setDefault: 'تعيين كعامل افتراضي',
          subtitle__default: 'سيتم أستعمال هذا الطريقة كعامل افتراضي لعملية التحقق بخطوتين عند عملية تسجيل الدخول',
          subtitle__setDefault: 'تعيين هذه الطريقة كعامل افتراضي لعملية التحقق بخطوتين عند عملية تسجيل الدخول.',
          actionLabel__setDefault: 'تعيين كأفتراضي',
        },
        backupCodes: {
          headerTitle: 'رموز النسخ الاحتياطي',
          title__regenerate: 'تجديد رموز النسخ الاحتياطي',
          subtitle__regenerate:
            'احصل على مجموعة جديدة من رموز النسخ الاحتياطي الآمنة. سيتم حذف رموز النسخ الاحتياطي السابقة ولا يمكن استخدامها.',
          actionLabel__regenerate: 'تجديد رموز النسخ الاحتياطي',
        },
        totp: {
          headerTitle: 'تطبيق المصادقة',
          title: 'العامل الأفتراضي',
          subtitle: 'تعيين هذه الطريقة كعامل افتراضي لعملية التحقق بخطوتين عند عملية تسجيل الدخول.',
          destructiveActionTitle: 'حذف',
          destructiveActionSubtitle: 'حذف تطبيق المصادقة هذا من طريقة التحقق بخطوتين',
          destructiveActionLabel: 'حذف تطبيق المصادقة',
        },
      },
      activeDevicesSection: {
        title: 'الأجهزة النشطة',
        primaryButton: 'الأجهزة النشطة',
        detailsTitle: 'الجهاز الحالي',
        detailsSubtitle: 'هذا الجهاز الذي تستخدمه حاليا',
        destructiveActionTitle: 'تسجيل الخروج',
        destructiveActionSubtitle: 'قم بتسجيل الخروج من حسابك على هذا الجهاز',
        destructiveAction: 'قم بتسجيل الخروج من الجهاز',
      },
      web3WalletsSection: {
        title: 'محافظ Web3',
        primaryButton: 'محافظ Web3',
        destructiveActionTitle: 'حذف',
        destructiveActionSubtitle: 'حذف محفظة الWeb3 هذه من حسابك',
        destructiveAction: 'حذف المحفظة',
      },
      dangerSection: {
        title: 'خطر',
        deleteAccountButton: 'حذف الحساب',
        deleteAccountTitle: 'حذف الحساب',
        deleteAccountDescription: 'حذف الحساب وجميع البيانات المتعلقة به',
      },
    },
    profilePage: {
      title: 'تحديث الملف الشخصي',
      imageFormTitle: 'صورة الملف الشخصي',
      imageFormSubtitle: 'رفع صورة للملف الشخصي',
      imageFormDestructiveActionSubtitle: 'حذف صورة الملف الشخصي',
      fileDropAreaTitle: 'اسحب الملف هنا, أو...',
      fileDropAreaAction: 'أختر ملف',
      fileDropAreaHint: 'أرفع صورة بصيغة JPG, PNG, GIF أو WEBP أقل من 10 ميغابايت',
      readonly: 'تم توفير معلومات حسابك عن طريق حساب المؤسسة ولا يمكن تعديلها',
      successMessage: 'معلومات حسابك الشخصي تم تحديثها',
    },
    usernamePage: {
      title: 'تحديث اسم المستخدم',
      successMessage: 'تم تحديث اسم المستخدم',
    },
    emailAddressPage: {
      title: 'أضافة البريد الإلكتروني',
      emailCode: {
        formHint: 'سيتم إرسال بريد إلكتروني يحتوي على رمز التحقق لهذا البريد الإلكتروني',
        formTitle: 'رمز التحقق',
        formSubtitle: 'أرسل رمز التحقق المرسل إلى {{identifier}}',
        resendButton: 'لم يصلك الرمز؟ حاول مرة أخرى',
        successMessage: 'البريد الإلكتروني {{identifier}} تمت إضافته إلى حسابك',
      },
      emailLink: {
        formHint: 'سيتم إرسال بريد إلكتروني يحتوي على رمز التحقق لهذا البريد الإلكتروني',
        formTitle: 'رابط التحقق',
        formSubtitle: 'أنقر على رابط التحقق المرسل إلى البريد الألكتروني {{identifier}}',
        resendButton: 'لم يصلك الرابط؟ حاول مرة أخرى',
        successMessage: 'البريد الإلكتروني {{identifier}} تمت إضافته إلى حسابك',
      },
      removeResource: {
        title: 'حذف عنوان البريد الإلكتروني هذا',
        messageLine1: 'سيتم حذف هذا الإيميل من حسابك {{identifier}}',
        messageLine2: 'لن تتمكن من تسجيل الدخول باستخدام عنوان البريد الإلكتروني هذا.',
        successMessage: 'تم حذف هذا العنوان من حسابك {{emailAddress}}',
      },
    },
    phoneNumberPage: {
      title: 'إضافة رقم جوال',
      successMessage: 'تم إضافة رقم الجوال هذا {{identifier}}',
      infoText: 'سيتم إرسال رسالة نصية تحتوي على رابط التحقق إلى رقم الهاتف هذا.',
      infoText__secondary: 'قد تنطبق عليك رسوم للرسائل أو البيانات',
      removeResource: {
        title: 'حذف رقم الجوال',
        messageLine1: 'سيتم حذف هذا الإيميل من حسابك {{identifier}}',
        messageLine2: 'لن تتمكن من تسجيل الدخول بإستخدام رقم الجوال هذا',
        successMessage: 'تم حذف هذا العنوان من حسابك {{phoneNumber}}',
      },
    },
    connectedAccountPage: {
      title: 'أضف حساب متصل',
      formHint: 'أختر موفر خدمة لتوصيل حسابك',
      formHint__noAccounts: 'لا يوجد موفرين خدمة لتوصيل حسابك',
      socialButtonsBlockButton: 'إضافة الموفر {{provider|titleize}} لحسابك',
      successMessage: 'تمت إضافة موفر الخدمة الى حسابك',
      removeResource: {
        title: 'حذف الحساب المتصل',
        messageLine1: 'سيتم حذف هذا الموفر من حسابك {{identifier}}',
        messageLine2: 'لن تتمكن بعد الآن من استخدام هذا الحساب المتصل ولن تعمل أي ميزات تابعة.',
        successMessage: 'تم حذف هذا العنوان من حسابك {{connectedAccount}}',
      },
    },
    web3WalletPage: {
      title: 'إضافة محفظة web3',
      subtitle__availableWallets: 'أختر محفظة web3 لتوصيلها بحسابك',
      subtitle__unavailableWallets: 'لا توجد اي محفظة web3 متاحة',
      successMessage: 'تمت إضافة المحفظة الى حسابك.',
      removeResource: {
        title: 'حذف محفظة web3',
        messageLine1: 'سيتم حذف هذه المحفظة من حسابك{{identifier}}',
        messageLine2: 'لن تتمكن من تسجيل الدخول إلى الحساب بإستخدام محفظة web3 هذه',
        successMessage: 'تم حذف هذه المحفظة من حسابك{{web3Wallet}}',
      },
    },
    passwordPage: {
      title: 'تعيين كلمة المرور',
      changePasswordTitle: 'تغيير كلمة المرور',
      readonly: 'لا يمكن تعديل كلمة المرور لأنه لا يمكنك تسجيل الدخول إلى عن طريق حساب المؤسسة',
      successMessage: 'تم تعيين كلمة السر.',
      changePasswordSuccessMessage: 'تم تحديث كلمة السر',
      sessionsSignedOutSuccessMessage: 'تم تسجيل الخروج من جميع الأجهزة.',
    },
    mfaPage: {
      title: 'أضافة التحقق بخطوتين',
      formHint: 'أختر طريقة للأضافة',
    },
    mfaTOTPPage: {
      title: 'إضافة تطبيق مصادقة',
      verifyTitle: 'رمز التحقق',
      verifySubtitle: 'أدخل رمز التحقق المنشئ في تطبيق المصادقة',
      successMessage:
        'تم تمكين التحقق بخطوتين اللآن. عند تسجيل الدخول سوف يطلب منك أدخال رمز التحقق من تطبيق المصادقة الخاص بك',
      authenticatorApp: {
        infoText__ableToScan: 'قم بإعداد طريقة تسجيل دخول جديدة في تطبيق المصادقة و قم بمسح كود الQR لربطه بحسابك',
        infoText__unableToScan: 'قم بإعداد تسجيل دخول جديدة في تطبيق المصادقة وأدخل الرمز المقدم أدناه',
        inputLabel__unableToScan1:
          'تأكد من تفعيل كلمات المرور المستندة إلى الوقت أو الأستعمال الواحد, ثم أكمل ربط حسابك',
        inputLabel__unableToScan2:
          'بدلا من ذلك, إذا كان المصدق الخاص بك يدعم روابط المدعومة من طرق المستندة إلى الوقت أو الأستعمال الواحد, يمكنك نسخ الرابط كله',
        buttonAbleToScan__nonPrimary: 'مسح رمز الQR بدلا من ذلك',
        buttonUnableToScan__nonPrimary: 'لا يمكنك مسح رمز الQR?',
      },
      removeResource: {
        title: 'إزالة التحقق بخطوتين',
        messageLine1: 'رموز التحقق من برنامج المصادقة هذا ستكون غير ضروية عند تسجيل الدخول',
        messageLine2: 'قد لا يكون حسابك آمنا. هل أنك متأكد أنك تريد المتابعة؟',
        successMessage: 'تم أزالة طريقة التحقق بخطوتين من تطبيق المصادقة',
      },
    },
    mfaPhoneCodePage: {
      title: 'أضافة التحقق عن طريق رمز الرسائل النصية',
      primaryButton__addPhoneNumber: 'إضافة رقم جوال',
      subtitle__availablePhoneNumbers: 'أختر رقم جوال لأضافة التحقق بخطوتين عن طريق الرسائل النصية',
      subtitle__unavailablePhoneNumbers: 'لا يوجد رقم جوال لأضافة التحقق بخطوتين عن طريق الرسائل النصية',
      successMessage:
        'التحقق بخطوتين عن طريق الرسائل النصية مفعل الآن لرقم الجوال هذا. عند تسجيل الدخول, سوف يطلب منك إدخال رمز التحقق المرسل إلى رقم الجوال كخطوة إضافية',
      removeResource: {
        title: 'إزالة التحقق بخطوتين',
        messageLine1: 'لن يتم إستلام اي رموز تحقق على {{identifier}} عند تسجيل الدخول',
        messageLine2: 'قد لا يكون حسابك آمنا. هل أنك متأكد أنك تريد المتابعة؟',
        successMessage: 'تم إلغاء التحقق بخطوتين عن طريق الرسائل النصية لرقم الجوال هذا {{mfaPhoneCode}}',
      },
    },
    backupCodePage: {
      title: 'إضافة التحقق عن طريق الرموز الأحتياطية',
      title__codelist: 'رموز النسخ الأحتياطي',
      subtitle__codelist: 'قم بتخزين الرموز في مكان آمن وابقيها سرا.',
      infoText1: 'سيتم تفعيل رموز النسخ الأحتياطي لهذا الحساب',
      infoText2:
        'قم بتخزين الرموز في مكان آمن وحافظ على سريتها. يمكنك تجديد الرموز الأحتياطية اذا كنت تشك أن حسابك معرض للخطر',
      successSubtitle:
        'يمكنك أستعمال واحدة من هذه الرموز لتسجيل الدخول إلى حسابك, اذا فقدت الوصول إلى جهاز المصادقة الخاص بك',
      successMessage:
        'رموز النسخ الأحتياطي مفعلة الآن. يمكنك أستعمال واحدة من هذه الرموز لتسجيل الدخول إلى حسابك, اذا فقدت الوصول إلى جهاز المصادقة الخاص بك. كل رمز يمكن أستعماله لمرة واحدة فقط.',
      actionLabel__copy: 'نسخ الكل',
      actionLabel__copied: 'تم النسخ',
      actionLabel__download: 'تحميل ملف .txt',
      actionLabel__print: 'طباعة',
    },
    deletePage: {
      title: 'حذف الحساب',
      messageLine1: 'هل أنت من انك تريد حذف هذا الحساب؟',
      messageLine2: 'هذا القرار نهائي ولا يمكن التراجع عنه.',
      actionDescription: 'أكتب حذف حساب بالأسفل للمتابعة',
      confirm: 'حذف حساب',
    },
  },
  userButton: {
    action__manageAccount: 'إدارة الحساب',
    action__signOut: 'تسجيل الخروج',
    action__signOutAll: 'تسجيل الخروج من جميع الحسابات',
    action__addAccount: 'إضافة حساب',
  },
  organizationSwitcher: {
    personalWorkspace: 'الحساب الشخصي',
    notSelected: 'لم يتم أختيار منظمة',
    action__createOrganization: 'أنشاء منظمة',
    action__manageOrganization: 'أدارة المنظمة',
    action__invitationAccept: 'أنضمام',
    action__suggestionsAccept: 'طلب أنضمام',
    suggestionsAcceptedLabel: 'موافقة معلقة',
  },
  impersonationFab: {
    title: 'تسجيل الدخول بأسم {{identifier}}',
    action__signOut: 'تسجيل الخروج',
  },
  organizationProfile: {
    badge__unverified: 'لم يتم التحقق منها',
    badge__automaticInvitation: 'دعوات تلقائية',
    badge__automaticSuggestion: 'أقتراحات تلقائية',
    badge__manualInvitation: 'ليس هناك تسجيل تلقائي',
    start: {
      headerTitle__members: 'الأعضاء',
      headerTitle__settings: 'الأعدادات',
    },
    profilePage: {
      title: 'الملف الشخصي للمنظمة',
      subtitle: 'إدارة الملف الشخصي للمنظمة',
      successMessage: 'تم تحديث معلومات المنظمة',
      dangerSection: {
        title: 'خطر',
        leaveOrganization: {
          title: 'الخروج من المنظمة',
          messageLine1: 'هل أنت متاكد أنك تريد الخروج من المنظمة؟ سوف تفقد الصلاحيات لهذه المنظمة وجميع تطبيقاتها',
          messageLine2: 'هذا القرار نهائي ولا يمكن التراجع عنه.',
          successMessage: 'لقد غادرت المنظمة',
          actionDescription: 'أكتب {{organizationName}} للمتابعة',
        },
        deleteOrganization: {
          title: 'حذف المنظمة',
          messageLine1: 'هل أنت متأكد من انك تريد حذف هذه المنظمة',
          messageLine2: 'هذا القرار نهائي ولا يمكن التراجع عنه.',
          actionDescription: 'أكتب {{organizationName}} بالأسفل للمتابعة.',
          successMessage: 'لقد حذفت هذه المنظمة',
        },
      },
      domainSection: {
        title: 'النطاقات التي تم التحقق منها',
        subtitle:
          'السماح للمستخدمين للأنضمام للمنظمة بشكل تلقائي أو عن طريق دعوة للأنضمام على نطاق بريد إلكتروني تم التحقق منه',
        primaryButton: 'أضافة نطاق',
        unverifiedDomain_menuAction__verify: 'التحقق من النطاق',
        unverifiedDomain_menuAction__remove: 'حذف النطاق',
      },
    },
    createDomainPage: {
      title: 'إضافة نطاق',
      subtitle:
        'أضف النطاق للتحقق. المستخدمين الذين لديهم عناوين بريد إلكتروني على هذا النطاق يمكنهم تسجيل الدخول إلى المنظمة بشكل تلقائي أو طلب الأنضمام.',
    },
    verifyDomainPage: {
      title: 'التحقق من النطاق',
      subtitle: 'يجب التحقق من هذا النطاق {{domainName}} عن طريق بريد إلكتروني موثوق',
      subtitleVerificationCodeScreen: 'تم إرسال رمز تحقق إلى {{emailAddress}}. أدخل الرمز للمتابعة.',
      formTitle: 'رمز التحقق',
      formSubtitle: 'أدخل رمز التحقق المرسل إلى بريدك الإلكتروني',
      resendButton: 'لم يصلك الرمز؟ حاول مرة أخرى',
    },
    verifiedDomainPage: {
      subtitle: 'هذا النطاق {{domain}} موثوق الآن. يمكنك المتابعة وأختيار وضع التسجيل.',
      start: {
        headerTitle__enrollment: 'خيارات التسجيل',
        headerTitle__danger: 'خطر',
      },
      enrollmentTab: {
        subtitle: 'أختر كيف يمكن للمستخدمين في هذا النطاق تسجيل الدخول إلى المنظمة',
        manualInvitationOption__label: 'لا يوجد تسجيل تلقائي',
        manualInvitationOption__description: 'يمكن دعوة المستخدمين يدويًا فقط للمؤسسة.',
        automaticInvitationOption__label: 'الدعوات التلقائية',
        automaticInvitationOption__description:
          'تتم دعوة المستخدمين تلقائيًا للانضمام إلى المؤسسة عند تسجيل حساب جديد ويمكنهم الانضمام في أي وقت.',
        automaticSuggestionOption__label: 'اقتراحات تلقائية',
        automaticSuggestionOption__description:
          'يتلقى المستخدمون اقتراحًا لطلب الانضمام ، ولكن يجب أن يوافق عليه المشرف قبل أن يتمكنوا من الانضمام إلى المنظمة.',
        formButton__save: 'حفظ',
        calloutInfoLabel: 'إن تغيير وضع التسجيل سيؤثر فقط على المستخدمين الجدد.',
        calloutInvitationCountLabel: 'هناك {{count}} دعوة معلقة مرسلة إلى المستخدمين',
        calloutSuggestionCountLabel: 'هناك {{count}} أقتراح معلق مرسلة إلى المستخدمين',
      },
      dangerTab: {
        removeDomainTitle: 'حذف النطاق',
        removeDomainSubtitle: 'حذف هذا النطاق من من النطاقات المعتمدة',
        removeDomainActionLabel__remove: 'حذف النطاق',
        calloutInfoLabel: 'حذف هذا النطاق سيؤثر على المستخدمين المدعوين',
      },
    },
    invitePage: {
      title: 'دعوة أعضاء',
      subtitle: 'دعوة أعضاء جدد لهذه المنظمة',
      successMessage: 'تم إرسال الدعوات بنجاح',
      detailsTitle__inviteFailed: 'لا يمكن إرسال الدعوات. انظر لتفاصيل المشكلة وحاول مرة أخرى:',
      formButtonPrimary__continue: 'إرسال الدعوات',
    },
    removeDomainPage: {
      title: 'حذف النطاق',
      messageLine1: 'سيتم حذف نطاق البريد الإلكتروني هذا{{domain}}.',
      messageLine2: 'لن يتمكن المستخدمون من الانضمام إلى المؤسسة تلقائيًا بعد ذلك.',
      successMessage: 'تم حذف هذا النطاق {{domain}}.',
    },
    membersPage: {
      detailsTitle__emptyRow: 'لا يوجد أعضاء للعرض',
      action__invite: 'دعوة',
      start: {
        headerTitle__members: 'الأعضاء',
        headerTitle__invitations: 'الدعوات',
        headerTitle__requests: 'الطلبات',
      },
      activeMembersTab: {
        tableHeader__user: 'مستخدم',
        tableHeader__joined: 'انضم',
        tableHeader__role: 'دور',
        tableHeader__actions: '',
        menuAction__remove: 'إزالة عضو',
      },
      invitedMembersTab: {
        tableHeader__invited: 'مدعو',
        menuAction__revoke: 'سحب الدعوة',
      },
      invitationsTab: {
        table__emptyRow: 'لا دعوات للعرض',
        manualInvitations: {
          headerTitle: 'الدعوات الفردية',
          headerSubtitle: 'دعوة الأعضاء يدويًا وإدارة الدعوات الموجودة.',
        },
        autoInvitations: {
          headerTitle: 'الدعوات التلقائية',
          headerSubtitle:
            'قم بدعوة المستخدمين عن طريق توصيل نطاق بريد إلكتروني بمنظمتك. سيتمكن أي شخص يقوم بالتسجيل في مجال بريد إلكتروني مطابق من الانضمام إلى المنظمة في أي وقت.',
          primaryButton: 'أدارة النطاقات الموثوقة',
        },
      },
      requestsTab: {
        tableHeader__requested: 'طلب الأنضمام',
        menuAction__approve: 'قبول',
        menuAction__reject: 'رفض',
        table__emptyRow: 'لا توجد طلبات للعرض',
        requests: {
          headerTitle: 'الطلبات',
          headerSubtitle: 'تصفٌح وإدارة المستخدمين الذين طلبوا الانضمام إلى المنظمة.',
        },
        autoSuggestions: {
          headerTitle: 'اقتراحات تلقائية',
          headerSubtitle:
            'سيتمكن المستخدمون الذين يشتركون في مجال بريد إلكتروني مطابق من رؤية اقتراح لطلب الانضمام إلى المنظمة.',
          primaryButton: 'إدارة النطاقات التي تم التحقق منها',
        },
      },
    },
  },
  createOrganization: {
    title: 'أنشاء منظمة',
    formButtonSubmit: 'أنشاء منظمة',
    invitePage: {
      formButtonReset: 'تخطي',
    },
  },
  organizationList: {
    createOrganization: 'أنشاء منظمة',
    title: 'أختر حساب',
    titleWithoutPersonal: 'أختر منظمة',
    subtitle: 'للمتابعة إلى {{applicationName}}',
    action__invitationAccept: 'أنضمام',
    invitationAcceptedLabel: 'أنضميت',
    action__suggestionsAccept: 'طلب أنضمام',
    suggestionsAcceptedLabel: 'موافقة معلقة',
    action__createOrganization: 'أنشاء منظمة',
  },
  unstable__errors: {
    identification_deletion_failed: 'لا يمكن حذف هويتك الآخيرة ',
    phone_number_exists: 'هذا الرقم مأخوذ الرجاء أختيار رقم آخر',
    form_identifier_not_found: '',
    captcha_invalid:
      'لا يمكن تسجيل الحساب بسبب مشاكل تحقق أمنية. الرجاء تحديث الصفحة للمحاولة مرة أخرى أو تواصل معنا للمزيد من المساعدة',
    form_password_pwned: 'لا يمكن أستعمال كلمة السر هذه لانها غير أمنة, الرجاء اختيار كلمة مرور أخرى',
    form_username_invalid_length: '',
    form_username_invalid_character: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'يجب أستعمال بريد إلكتروني صالح',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
    form_password_incorrect: '',
    not_allowed_access: '',
    form_identifier_exists: '',
    form_password_validation_failed: 'كلمة مرور خاطئة',
    form_password_not_strong_enough: 'كلمة المرور ليست قوية',
    form_password_size_in_bytes_exceeded:
      'تجاوزت كلمة المرور الحد الأقصى للحروف المدخلة, الرجاء أدخال كلمة مرور أقصر أو حذف بعض الأحرف الخاصة',
    passwordComplexity: {
      sentencePrefix: 'كلمة السر يجب أن تحتوي على',
      minimumLength: '{{length}} حروف أو أكثر',
      maximumLength: 'أقل من {{length}} حروف',
      requireNumbers: 'رقم',
      requireLowercase: 'حرف صغير',
      requireUppercase: 'حرف كبير',
      requireSpecialCharacter: 'حرف خاص',
    },
    zxcvbn: {
      notEnough: 'كلمة المرور ليست قوية',
      couldBeStronger: 'كلمة مرورك سليمة من الأفضل ان تكون اقوى. الرجاء أضافة حروف أكثر',
      goodPassword: 'كلمة مرورك طابقت جميع المتطلبات الازمة',
      warnings: {
        straightRow: 'من السهل تخمين الحروف الموجودة على نفس السطر في لوحة المفاتيح',
        keyPattern: 'من السهل تخمين أنماط لوحة المفاتيح الصغيرة',
        simpleRepeat: 'من السهل تخمين الحروف المكررة مثل "aaa"',
        extendedRepeat: 'من السهل تخمين أنماط الحروف المتكررة مثل "abcabcabc"',
        sequences: 'من السهل تخمين أنماط الحروف العامة أو الهجائية مثل "abc" ',
        recentYears: 'من السهل تخمين السنوات الحديثة',
        dates: 'من السهل تخمين التواريخ',
        topTen: 'كلمة السر هذه مستخدمة بكثرة',
        topHundred: 'كلمة السر هذه مستخدمة بشكل متكررة',
        common: 'كلمة السر هذه شائعة في الأستخدام',
        similarToCommon: 'كلمة السر هذه مشابهة لكلمات السر الشائعة في الأستخدام',
        wordByItself: 'من السهل تخميل الكلمات المنفردة',
        namesByThemselves: 'من السهل تخمين الأسم الأول أو اللقب',
        commonNames: 'من السهل تخمين الأسماء والألقاب الشائعة',
        userInputs: 'يجب ألا يكون هناك أي بيانات شخصية أو بيانات ذات صلة بالصفحة.',
        pwned: 'كلمة المرور الخاص بك تم أختراقها والكشف عنها في الأنترنت',
      },
      suggestions: {
        l33t: 'تجنب بدائل الحروف التي يمكن التنبؤ بها مثل "a" ل "@" ',
        reverseWords: 'تجنب التهجئات العكسية للكلمات الشائعة.',
        allUppercase: 'أستعمل حروف كبيرة لبعض الحروف وليس كلها.',
        capitalization: 'أستعمل حروف كبيرة لأكثر من حرف غير الحرف الأول',
        dates: 'تجنب التواريخ والسنوات المرتبطة بك.',
        recentYears: 'تجنب السنوات الأخيرة.',
        associatedYears: 'تجنب السنوات المرتبطة بك.',
        sequences: 'تجنب تسلسل الأحرف الشائعة.',
        repeated: 'تجنب الكلمات والحروف المتكررة.',
        longerKeyboardPattern: 'أستخدم أنماط أكثر وقم بتغيير أتجاه الكتابة في لوحة المفاتيح عدة مرات',
        anotherWord: 'أضف المزيد من الكلمات الأقل شيوعًا.',
        useWords: 'استخدم كلمات متعددة ، ولكن تجنب العبارات الشائعة.',
        noNeed: 'يمكنك إنشاء كلمات مرور قوية دون استخدام الرموز أو الأرقام أو الأحرف الكبيرة.',
        pwned: 'إذا كنت تستخدم كلمة المرور هذه في مكان آخر ، فيجب عليك تغييرها.',
      },
    },
    form_param_max_length_exceeded__name: 'الأسم يجب الا يتجاوز 256 حرف',
    form_param_max_length_exceeded__first_name: 'الأسم الأول يجب الا يتجاوز 256 حرف',
    form_param_max_length_exceeded__last_name: 'الأسم الأخير يجب الا يتجاوز 256 حرف',
  },
  dates: {
    previous6Days: "أخر {{ date | weekday('en-US','long') }} في {{ date | timeString('en-US') }}",
    lastDay: "الأمس في {{ date | timeString('en-US') }}",
    sameDay: "اليوم في {{ date | timeString('en-US') }}",
    nextDay: "غدا في {{ date | timeString('en-US') }}",
    next6Days: "{{ date | weekday('en-US','long') }} في {{ date | timeString('en-US') }}",
    numeric: "{{ date | numeric('en-US') }}",
  },
} as const;
