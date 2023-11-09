import type { LocalizationResource } from '@clerk/types';

const commonTexts = {
  signIn: {
    phoneCode: {
      title: 'בדוק את הטלפון שלך',
      subtitle: 'להמשיך אל {{applicationName}}',
      formTitle: 'קוד אימות',
      formSubtitle: 'הזן את קוד האימות שנשלח למספר הטלפון שלך',
      resendButton: 'שלח את הקוד שוב',
    },
  },
} as const;

export const heIL: LocalizationResource = {
  locale: 'he-IL',
  socialButtonsBlockButton: 'המשך עם {{provider|titleize}}',
  dividerText: 'או',
  formFieldLabel__emailAddress: 'כתובת דוא"ל',
  formFieldLabel__emailAddresses: 'כתובות דוא"ל',
  formFieldLabel__phoneNumber: 'מספר טלפון',
  formFieldLabel__username: 'שם משתמש',
  formFieldLabel__emailAddress_phoneNumber: 'כתובת דוא"ל או מספר טלפון',
  formFieldLabel__emailAddress_username: 'כתובת דוא"ל או שם משתמש',
  formFieldLabel__phoneNumber_username: 'מספר טלפון או שם משתמש',
  formFieldLabel__emailAddress_phoneNumber_username: 'כתובת דוא"ל, מספר טלפון או שם משתמש',
  formFieldLabel__password: 'סיסמה',
  formFieldLabel__currentPassword: 'סיסמה נוכחית',
  formFieldLabel__newPassword: 'סיסמה חדשה',
  formFieldLabel__confirmPassword: 'אמת סיסמה',
  formFieldLabel__signOutOfOtherSessions: 'התנתק מכל המכשירים האחרים',
  formFieldLabel__firstName: 'שם פרטי',
  formFieldLabel__lastName: 'שם משפחה',
  formFieldLabel__backupCode: 'קוד גיבוי',
  formFieldLabel__organizationName: 'שם הארגון',
  formFieldLabel__organizationSlug: 'כתובת URL של הארגון',
  formFieldLabel__role: 'תפקיד',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddresses: 'הכנס או הדבק כתובת או כתובות דוא"ל, מופרדות ברווחים או פסיקים',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldInputPlaceholder__emailAddress_phoneNumber: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__phoneNumber_username: '',
  formFieldInputPlaceholder__emailAddress_phoneNumber_username: '',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldInputPlaceholder__organizationSlug: '',
  formFieldError__notMatchingPasswords: 'הסיסמאות אינן תואמות.',
  formFieldError__matchingPasswords: 'הסיסמאות תואמות.',
  formFieldAction__forgotPassword: 'שכחת סיסמה?',
  formFieldHintText__optional: 'אופציונלי',
  formButtonPrimary: 'המשך',
  signInEnterPasswordTitle: 'הזן את הסיסמה שלך',
  backButton: 'חזור',
  footerActionLink__useAnotherMethod: 'השתמש בשיטה אחרת',
  badge__primary: 'ראשי',
  badge__thisDevice: 'מכשיר זה',
  badge__userDevice: 'מכשיר משתמש',
  badge__otherImpersonatorDevice: 'מכשיר מחקה אחר',
  badge__default: 'ברירת מחדל',
  badge__unverified: 'לא מאומת',
  badge__requiresAction: 'דורש פעולה',
  badge__you: 'אתה',
  footerPageLink__help: 'עזרה',
  footerPageLink__privacy: 'פרטיות',
  footerPageLink__terms: 'תנאים',
  paginationButton__previous: 'הקודם',
  paginationButton__next: 'הבא',
  paginationRowText__displaying: 'מציג',
  paginationRowText__of: 'מתוך',
  membershipRole__admin: 'מנהל',
  membershipRole__basicMember: 'חבר',
  membershipRole__guestMember: 'אורח',
  signUp: {
    start: {
      title: 'צור את החשבון שלך',
      subtitle: 'להמשיך אל {{applicationName}}',
      actionText: 'יש לך חשבון?',
      actionLink: 'התחבר',
    },
    emailLink: {
      title: 'אמת את כתובת הדוא"ל שלך',
      subtitle: 'להמשיך אל {{applicationName}}',
      formTitle: 'קישור לאימות',
      formSubtitle: 'השתמש בקישור האימות שנשלח לכתובת הדוא"ל שלך',
      resendButton: 'שלח קישור שוב',
      verified: {
        title: 'נרשמת בהצלחה',
      },
      loading: {
        title: 'מתחיל להירשם...',
      },
      verifiedSwitchTab: {
        title: 'אימות דוא"ל הצליח',
        subtitle: 'חזור לכרטיסייה שנפתחה לאחרונה להמשיך',
        subtitleNewTab: 'חזור לכרטיסייה הקודמת להמשיך',
      },
    },

    emailCode: {
      title: 'אמת את כתובת הדוא"ל שלך',
      subtitle: 'להמשיך אל {{applicationName}}',
      formTitle: 'קוד אימות',
      formSubtitle: 'הכנס את קוד האימות שנשלח לכתובת הדוא"ל שלך',
      resendButton: 'שלח קוד שוב',
    },
    phoneCode: {
      title: 'אמת את מספר הטלפון שלך',
      subtitle: 'להמשיך אל {{applicationName}}',
      formTitle: 'קוד אימות',
      formSubtitle: 'הכנס את קוד האימות שנשלח למספר הטלפון שלך',
      resendButton: 'שלח קוד שוב',
    },
    continue: {
      title: 'מלא שדות חסרים',
      subtitle: 'להמשיך אל {{applicationName}}',
      actionText: 'יש לך חשבון?',
      actionLink: 'התחבר',
    },
  },
  signIn: {
    start: {
      title: 'התחבר',
      subtitle: 'להמשיך אל {{applicationName}}',
      actionText: 'אין לך חשבון?',
      actionLink: 'הרשמה',
      actionLink__use_email: 'השתמש בדוא"ל',
      actionLink__use_phone: 'השתמש בטלפון',
      actionLink__use_username: 'השתמש בשם משתמש',
      actionLink__use_email_username: 'השתמש בדוא"ל או שם משתמש',
    },
    password: {
      title: 'הכנס את סיסמתך',
      subtitle: 'להמשיך אל {{applicationName}}',
      actionLink: 'השתמש בשיטה אחרת',
    },
    forgotPasswordAlternativeMethods: {
      title: 'שכחת סיסמה?',
      label__alternativeMethods: 'או, התחבר באמצעות שיטה אחרת.',
      blockButton__resetPassword: 'אפס את הסיסמה שלך',
    },
    forgotPassword: {
      title_email: 'בדוק את הדוא"ל שלך',
      title_phone: 'בדוק את הטלפון שלך',
      subtitle: 'לאיפוס הסיסמה שלך',
      formTitle: 'אפס קוד הסיסמה',
      formSubtitle_email: 'הכנס את הקוד שנשלח לכתובת הדוא"ל שלך',
      formSubtitle_phone: 'הכנס את הקוד שנשלח למספר הטלפון שלך',
      resendButton: 'שלח קוד שוב',
    },
    resetPassword: {
      title: 'אפס סיסמה',
      formButtonPrimary: 'אפס סיסמה',
      successMessage: 'הסיסמה שלך שונתה בהצלחה. מחבר אותך, אנא המתן רגע.',
    },
    resetPasswordMfa: {
      detailsLabel: 'אנחנו צריכים לאמת את זהותך לפני שנאפס את הסיסמה שלך.',
    },
    emailCode: {
      title: 'בדוק את הדוא"ל שלך',
      subtitle: 'להמשיך אל {{applicationName}}',
      formTitle: 'קוד אימות',
      formSubtitle: 'הכנס את קוד האימות שנשלח לכתובת הדוא"ל שלך',
      resendButton: 'שלח קוד שוב',
    },
    emailLink: {
      title: 'בדוק את הדוא"ל שלך',
      subtitle: 'להמשיך אל {{applicationName}}',
      formTitle: 'קישור אימות',
      formSubtitle: 'השתמש בקישור האימות שנשלח לדוא"ל שלך',
      resendButton: 'שלח קישור שוב',
      unusedTab: {
        title: 'אתה יכול לסגור את הכרטיסייה הזו',
      },
      verified: {
        title: 'נכנסת בהצלחה',
        subtitle: 'תועבר בקרוב',
      },
      verifiedSwitchTab: {
        subtitle: 'חזור לכרטיסייה המקורית להמשך',
        titleNewTab: 'נכנס בכרטיסייה אחרת',
        subtitleNewTab: 'חזור לכרטיסייה שנפתחה חדשה להמשך',
      },
      loading: {
        title: 'מתחבר...',
        subtitle: 'תועבר בקרוב',
      },
      failed: {
        title: 'קישור האימות הזה לא חוקי',
        subtitle: 'חזור לכרטיסייה המקורית להמשך.',
      },
      expired: {
        title: 'קישור האימות הזה פג תוקף',
        subtitle: 'חזור לכרטיסייה המקורית להמשך.',
      },
    },
    phoneCode: { ...commonTexts.signIn.phoneCode },
    phoneCodeMfa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totpMfa: {
      title: 'אימות שני שלבים',
      subtitle: '',
      formTitle: 'קוד אימות',
      formSubtitle: 'הכנס את קוד האימות שנוצר על ידי אפליקציית האימות שלך',
    },
    backupCodeMfa: {
      title: 'הכנס קוד גיבוי',
      subtitle: 'להמשיך אל {{applicationName}}',
      formTitle: '',
      formSubtitle: '',
    },
    alternativeMethods: {
      title: 'השתמש בשיטה אחרת',
      actionLink: 'קבל עזרה',
      blockButton__emailLink: 'שלח קישור באימייל ל-{{identifier}}',
      blockButton__emailCode: 'שלח קוד באימייל ל-{{identifier}}',
      blockButton__phoneCode: 'שלח קוד SMS ל-{{identifier}}',
      blockButton__password: 'התחבר עם הסיסמה שלך',
      blockButton__totp: 'השתמש באפליקציית האימות שלך',
      blockButton__backupCode: 'השתמש בקוד גיבוי',
      getHelp: {
        title: 'קבל עזרה',
        content: `אם אתה נתקל בקשיים בהתחברות לחשבונך, שלח לנו מייל ונעבוד איתך כדי לשחזר את הגישה בהקדם האפשרי.`,
        blockButton__emailSupport: 'מייל לתמיכה',
      },
    },
    noAvailableMethods: {
      title: 'Cannot sign in',
      subtitle: 'An error occurred',
      message: "Cannot proceed with sign in. There's no available authentication factor.",
    },
  },
  userProfile: {
    mobileButton__menu: 'תפריט',
    formButtonPrimary__continue: 'המשך',
    formButtonPrimary__finish: 'סיים',
    formButtonReset: 'בטל',
    start: {
      headerTitle__account: 'חשבון',
      headerTitle__security: 'אבטחה',
      headerSubtitle__account: 'נהל את מידע החשבון שלך',
      headerSubtitle__security: 'נהל את העדפות האבטחה שלך',
      profileSection: {
        title: 'פרופיל',
      },
      usernameSection: {
        title: 'שם משתמש',
        primaryButton__changeUsername: 'שנה שם משתמש',
        primaryButton__setUsername: 'הגדר שם משתמש',
      },
      emailAddressesSection: {
        title: 'כתובת אימייל',
        primaryButton: 'הוסף כתובת אימייל',
        detailsTitle__primary: 'כתובת אימייל עיקרית',
        detailsSubtitle__primary: 'כתובת האימייל הזו היא כתובת האימייל העיקרית',
        detailsAction__primary: 'השלם אימות',
        detailsTitle__nonPrimary: 'הגדר ככתובת אימייל עיקרית',
        detailsSubtitle__nonPrimary: 'הגדר את כתובת האימייל הזו כעיקרית כדי לקבל התראות בנושא החשבון שלך.',
        detailsAction__nonPrimary: 'הגדר כעיקרית',
        detailsTitle__unverified: 'כתובת אימייל לא מאומתת',
        detailsSubtitle__unverified: 'כתובת האימייל הזו לא מאומתת ועשויה להיות מוגבלת בפונקציונליות',
        detailsAction__unverified: 'השלם אימות',
        destructiveActionTitle: 'הסר',
        destructiveActionSubtitle: 'מחק את כתובת האימייל הזו והסר אותה מהחשבון שלך',
        destructiveAction: 'הסר כתובת אימייל',
      },
      phoneNumbersSection: {
        title: 'מספרי טלפון',
        primaryButton: 'הוסף מספר טלפון',
        detailsTitle__primary: 'מספר טלפון ראשי',
        detailsSubtitle__primary: 'מספר הטלפון הזה הוא המספר הראשי',
        detailsAction__primary: 'השלם אימות',
        detailsTitle__nonPrimary: 'הגדר כמספר טלפון ראשי',
        detailsSubtitle__nonPrimary: 'הגדר מספר טלפון זה כראשי כדי לקבל התראות בנושא החשבון שלך.',
        detailsAction__nonPrimary: 'הגדר כראשי',
        detailsTitle__unverified: 'מספר טלפון לא מאומת',
        detailsSubtitle__unverified: 'מספר טלפון זה לא מאומת ועשוי להיות מוגבל בפונקציונליות',
        detailsAction__unverified: 'השלם אימות',
        destructiveActionTitle: 'הסר',
        destructiveActionSubtitle: 'מחק מספר טלפון זה והסר אותו מהחשבון שלך',
        destructiveAction: 'הסר מספר טלפון',
      },
      connectedAccountsSection: {
        title: 'חשבונות מחוברים',
        primaryButton: 'חבר חשבון',
        title__connectionFailed: 'נסה שוב להתחבר',
        title__reauthorize: 'נדרשת הרשאה מחדש',
        subtitle__reauthorize:
          'ההרשאות הדרושות עודכנו, וייתכן שאתה מגלה פונקציונליות מוגבלת. אנא הרשה מחדש את היישום כדי למנוע בעיות',
        actionLabel__connectionFailed: 'נסה שוב',
        actionLabel__reauthorize: 'אשר עכשיו',
        destructiveActionTitle: 'הסר',
        destructiveActionSubtitle: 'הסר את החשבון המחובר מהחשבון שלך',
        destructiveActionAccordionSubtitle: 'הסר חשבון מחובר',
      },
      enterpriseAccountsSection: {
        title: 'חשבונות ארגוניים',
      },
      passwordSection: {
        title: 'סיסמה',
        primaryButton__changePassword: 'שנה סיסמה',
        primaryButton__setPassword: 'הגדר סיסמה',
      },
      mfaSection: {
        title: 'אימות דו-שלבי',
        primaryButton: 'הוסף אימות דו-שלבי',
        phoneCode: {
          destructiveActionTitle: 'הסר',
          destructiveActionSubtitle: 'הסר מספר טלפון זה משיטות האימות הדו-שלבי',
          destructiveActionLabel: 'הסר מספר טלפון',
          title__default: 'גורם ברירת מחדל',
          title__setDefault: 'הגדר כגורם ברירת מחדל',
          subtitle__default: 'גורם זה ישמש כגורם ברירת מחדל לאימות דו-שלבי בהתחברות.',
          subtitle__setDefault: 'הגדר גורם זה כגורם ברירת מחדל כדי שהוא ישמש כגורם ברירת מחדל לאימות דו-שלבי בהתחברות.',
          actionLabel__setDefault: 'הגדר כברירת מחדל',
        },
        backupCodes: {
          headerTitle: 'קוד גיבוי',
          title__regenerate: 'צור מחדש קודי גיבוי',
          subtitle__regenerate: 'קבל קבוצה חדשה של קודי גיבוי מאובטחים. קודי גיבוי קודמים יימחקו ולא ניתן להשתמש בהם.',
          actionLabel__regenerate: 'צור קודים מחדש',
        },
        totp: {
          headerTitle: 'אפליקציית מאמת',
          title: 'גורם ברירת מחדל',
          subtitle: 'גורם זה ישמש כשיטת ברירת המחדל של אימות דו-שלבי בעת הכניסה.',
          destructiveActionTitle: 'הסר',
          destructiveActionSubtitle: 'הסר אפליקציית האימות משיטות האימות הדו-שלבי',
          destructiveActionLabel: 'הסר אפליקציית אימות',
        },
      },
      activeDevicesSection: {
        title: 'מכשירים פעילים',
        primaryButton: 'מכשירים פעילים',
        detailsTitle: 'המכשיר הנוכחי',
        detailsSubtitle: 'זהו המכשיר שאתה משתמש בו כעת',
        destructiveActionTitle: 'התנתק',
        destructiveActionSubtitle: 'התנתק מהחשבון שלך במכשיר זה',
        destructiveAction: 'התנתק מהמכשיר',
      },
      web3WalletsSection: {
        title: 'ארנקי Web3',
        primaryButton: 'ארנקי Web3',
        destructiveActionTitle: 'הסר',
        destructiveActionSubtitle: 'הסר ארנק Web3 זה מהחשבון שלך',
        destructiveAction: 'הסר ארנק',
      },
      dangerSection: {
        title: 'מסוכן',
        deleteAccountButton: 'מחק חשבון',
        deleteAccountTitle: 'מחיקת חשבון',
        deleteAccountDescription: 'מחק את החשבון שלך ואת כל המידע הקשור אליו',
      },
    },
    profilePage: {
      title: 'עדכן פרופיל',
      imageFormTitle: 'תמונת פרופיל',
      imageFormSubtitle: 'העלה תמונה',
      imageFormDestructiveActionSubtitle: 'הסר תמונה',
      fileDropAreaTitle: 'גרור קובץ לכאן, או...',
      fileDropAreaAction: 'בחר קובץ',
      fileDropAreaHint: 'העלה תמונה בפורמט JPG, PNG, GIF, או WEBP הקטנה מ-10 מ"ב',
      successMessage: 'הפרופיל שלך עודכן.',
    },
    usernamePage: {
      title: 'עדכן שם משתמש',
      successMessage: 'שם המשתמש שלך עודכן.',
    },
    emailAddressPage: {
      title: 'הוסף כתובת אימייל',
      emailCode: {
        formHint: 'אימייל שמכיל קוד אימות ישלח לכתובת זו.',
        formTitle: 'קוד אימות',
        formSubtitle: 'הכנס את קוד האימות שנשלח ל-{{identifier}}',
        resendButton: 'שלח קוד מחדש',
        successMessage: 'האימייל {{identifier}} התווסף לחשבון שלך.',
      },
      emailLink: {
        formHint: 'אימייל שמכיל קישור לאימות ישלח לכתובת זו.',
        formTitle: 'קישור לאימות',
        formSubtitle: 'לחץ על קישור האימות באימייל שנשלח ל-{{identifier}}',
        resendButton: 'שלח קישור מחדש',
        successMessage: 'האימייל {{identifier}} התווסף לחשבון שלך.',
      },
      removeResource: {
        title: 'הסר כתובת אימייל',
        messageLine1: '{{identifier}} יוסר מהחשבון הזה.',
        messageLine2: 'לא תוכל יותר להתחבר באמצעות כתובת אימייל זו.',
        successMessage: 'האימייל {{emailAddress}} הוסר מהחשבון שלך.',
      },
    },
    phoneNumberPage: {
      title: 'הוסף מספר טלפון',
      successMessage: '{{identifier}} התווסף לחשבון שלך.',
      infoText: 'הודעת טקסט שמכילה קישור לאימות תישלח למספר טלפון זה.',
      infoText__secondary: 'עשויות לחול תעריפים להודעות ונתונים.',
      removeResource: {
        title: 'הסר מספר טלפון',
        messageLine1: '{{identifier}} יוסר מהחשבון הזה.',
        messageLine2: 'לא תוכל יותר להתחבר באמצעות מספר טלפון זה.',
        successMessage: '{{phoneNumber}} הוסר מהחשבון שלך.',
      },
    },
    connectedAccountPage: {
      title: 'הוסף חשבון מחובר',
      formHint: 'בחר ספק כדי לחבר את החשבון שלך.',
      formHint__noAccounts: 'אין ספקים זמינים לחשבונות חיצוניים.',
      socialButtonsBlockButton: 'חבר חשבון {{provider|titleize}}',
      successMessage: 'הספק התווסף לחשבון שלך',
      removeResource: {
        title: 'הסר חשבון מחובר',
        messageLine1: '{{identifier}} יוסר מהחשבון הזה.',
        messageLine2: 'לא תוכל יותר להשתמש בחשבון מחובר זה וכל התכונות התלויות לא יעבדו.',
        successMessage: '{{connectedAccount}} הוסר מהחשבון שלך.',
      },
    },
    web3WalletPage: {
      title: 'הוסף ארנק web3',
      subtitle__availableWallets: 'בחר ארנק web3 לחיבור לחשבון שלך.',
      subtitle__unavailableWallets: 'אין ארנקי web3 זמינים.',
      successMessage: 'הארנק התווסף לחשבון שלך.',
      removeResource: {
        title: 'הסר ארנק web3',
        messageLine1: '{{identifier}} יוסר מהחשבון הזה.',
        messageLine2: 'לא תוכל יותר להתחבר באמצעות ארנק web3 זה.',
        successMessage: '{{web3Wallet}} הוסר מהחשבון שלך.',
      },
    },
    passwordPage: {
      title: 'הגדר סיסמה',
      changePasswordTitle: 'שנה סיסמה',
      successMessage: 'הסיסמה שלך הוגדרה.',
      changePasswordSuccessMessage: 'הסיסמה שלך עודכנה.',
      sessionsSignedOutSuccessMessage: 'כל המכשירים האחרים התנתקו.',
    },
    mfaPage: {
      title: 'הוסף אימות דו-שלבי',
      formHint: 'בחר שיטה להוספה.',
    },
    mfaTOTPPage: {
      title: 'הוסף אפליקציית אימות',
      verifyTitle: 'קוד אימות',
      verifySubtitle: 'הכנס את קוד האימות שנוצר על ידי האותנטיקטור שלך',
      successMessage: 'האימות הדו-שלבי מופעל כעת. בעת ההתחברות, תידרש להכניס קוד אימות מהאותנטיקטור זה כשלב נוסף.',
      authenticatorApp: {
        infoText__ableToScan:
          'הגדר שיטת התחברות חדשה באפליקציית האותנטיקטור שלך וסרוק את קוד ה-QR הבא כדי לחברו לחשבון שלך.',
        infoText__unableToScan: 'הגדר שיטת התחברות חדשה באותנטיקטור שלך והכנס את המפתח שסופק למטה.',
        inputLabel__unableToScan1: 'וודא שסיסמאות מבוססות-זמן או חד-פעמיות מופעלות, ואז סיים לחבר את החשבון שלך.',
        inputLabel__unableToScan2:
          'לחלופין, אם האותנטיקטור שלך תומך בכתובת URI של TOTP, תוכל גם להעתיק את הכתובת המלאה.',
        buttonAbleToScan__nonPrimary: 'סרוק קוד QR במקום',
        buttonUnableToScan__nonPrimary: 'לא יכול לסרוק קוד QR?',
      },
      removeResource: {
        title: 'הסר אימות דו-שלבי',
        messageLine1: 'קודי האימות מהאותנטיקטור הזה לא יהיו נדרשים יותר בעת ההתחברות.',
        messageLine2: 'החשבון שלך עשוי לא להיות בטוח כמו שהוא. האם אתה בטוח שאתה רוצה להמשיך?',
        successMessage: 'אימות דו-שלבי באמצעות אפליקצית האותנטיקטור הוסר.',
      },
    },
    mfaPhoneCodePage: {
      title: 'הוסף אימות קוד SMS',
      primaryButton__addPhoneNumber: 'הוסף מספר טלפון',
      subtitle__availablePhoneNumbers: 'בחר מספר טלפון להרשמה לאימות קוד SMS דו-שלבי.',
      subtitle__unavailablePhoneNumbers: 'אין מספרי טלפון זמינים להרשמה לאימות קוד SMS דו-שלבי.',
      successMessage:
        'אימות קוד SMS דו-שלבי כעת מופעל למספר הטלפון הזה. בעת ההתחברות, תידרש להכניס קוד אימות שנשלח למספר הטלפון הזה כשלב נוסף.',
      removeResource: {
        title: 'הסר אימות דו-שלבי',
        messageLine1: '{{identifier}} לא יקבל יותר קודים לאימות בעת ההתחברות.',
        messageLine2: 'החשבון שלך עשוי לא להיות בטוח כמו שהוא. האם אתה בטוח שאתה רוצה להמשיך?',
        successMessage: 'אימות קוד SMS דו-שלבי הוסר ל{{mfaPhoneCode}}',
      },
    },
    backupCodePage: {
      title: 'הוסף אימות קוד גיבוי',
      title__codelist: 'קודי גיבוי',
      subtitle__codelist: 'אחסן אותם בבטחה ושמור עליהם בסוד.',
      infoText1: 'קודי גיבוי יהיו מופעלים לחשבון זה.',
      infoText2: 'שמור את קודי הגיבוי בסוד ואחסן אותם בבטחה. תוכל לחולל מחדש קודי גיבוי אם אתה חושד שהם נפגעו.',
      successSubtitle: 'תוכל להשתמש באחד מאלה כדי להתחבר לחשבון שלך, אם אתה מאבד גישה למכשיר האימות שלך.',
      successMessage:
        'קודי הגיבוי מופעלים כעת. תוכל להשתמש באחד מאלה כדי להתחבר לחשבון שלך, אם אתה מאבד גישה למכשיר האימות שלך. כל קוד יכול להשתמש בו רק פעם אחת.',
      actionLabel__copy: 'העתק הכל',
      actionLabel__copied: 'הועתק!',
      actionLabel__download: 'הורד .txt',
      actionLabel__print: 'הדפס',
    },
  },
  userButton: {
    action__manageAccount: 'נהל חשבון',
    action__signOut: 'התנתק',
    action__signOutAll: 'התנתק מכל החשבונות',
    action__addAccount: 'הוסף חשבון',
  },
  organizationSwitcher: {
    personalWorkspace: 'איזור אישי',
    notSelected: 'לא נבחרה ארגון',
    action__createOrganization: 'צור ארגון',
    action__manageOrganization: 'נהל ארגון',
  },
  impersonationFab: {
    title: 'מחובר כ{{identifier}}',
    action__signOut: 'התנתק',
  },
  organizationProfile: {
    start: {
      headerTitle__members: 'חברים',
      headerTitle__settings: 'הגדרות',
      headerSubtitle__members: 'הצג ונהל את חברי הארגון',
      headerSubtitle__settings: 'נהל הגדרות ארגון',
    },
    profilePage: {
      title: 'פרופיל ארגון',
      subtitle: 'נהל פרופיל ארגון',
      successMessage: 'הארגון עודכן.',
      dangerSection: {
        title: 'סיכון',
        leaveOrganization: {
          title: 'עזוב את הארגון',
          messageLine1: 'האם אתה בטוח שאתה רוצה לעזוב את הארגון הזה? תאבד גישה לארגון זה וליישומים שלו.',
          messageLine2: 'פעולה זו היא סופית ובלתי הפיכה.',
          successMessage: 'עזבת את הארגון.',
        },
      },
    },
    invitePage: {
      title: 'הזמן חברים',
      subtitle: 'הזמן חברים חדשים לארגון זה',
      successMessage: 'ההזמנות נשלחו בהצלחה',
      detailsTitle__inviteFailed: 'לא היה ניתן לשלוח את ההזמנות. תקן את הבעיות הבאות ונסה שוב:',
      formButtonPrimary__continue: 'שלח הזמנות',
    },
    membersPage: {
      detailsTitle__emptyRow: 'אין חברים להצגה',
      action__invite: 'הזמן',
      start: {},
      activeMembersTab: {
        tableHeader__user: 'משתמש',
        tableHeader__joined: 'הצטרף',
        tableHeader__role: 'תפקיד',
        tableHeader__actions: '',
        menuAction__remove: 'הסר חבר',
      },
      invitedMembersTab: {
        tableHeader__invited: 'הוזמן',
        menuAction__revoke: 'בטל הזמנה',
      },
    },
  },
  createOrganization: {
    title: 'צור ארגון',
    formButtonSubmit: 'צור ארגון',
    invitePage: {
      formButtonReset: 'דלג',
    },
  },
  unstable__errors: {
    form_identifier_not_found: '',
    form_password_pwned: 'הסיסמה הזו נמצאה כחלק מהפרטים שנחשפו בהפרת נתונים ולא ניתן להשתמש בה, נסה סיסמה אחרת במקום.',
    form_username_invalid_length: '',
    form_username_invalid_character: '',
    form_param_format_invalid: '',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
    form_password_incorrect: '',
    not_allowed_access: '',
    form_identifier_exists: '',
    form_password_validation_failed: 'סיסמה שגויה',
    form_password_not_strong_enough: 'הסיסמה שלך אינה מספיק חזקה.',
    form_password_size_in_bytes_exceeded:
      'הסיסמה שלך חורגת ממספר הבייטים המרבי המותר, נסה לקצר אותה או להסיר כמה תווים מיוחדים.',
    passwordComplexity: {
      sentencePrefix: 'הסיסמה שלך חייבת להכיל',
      minimumLength: '{{length}} תווים או יותר',
      maximumLength: 'פחות מ-{{length}} תווים',
      requireNumbers: 'מספר',
      requireLowercase: 'אות קטנה',
      requireUppercase: 'אות גדולה',
      requireSpecialCharacter: 'תו מיוחד',
    },
    zxcvbn: {
      notEnough: 'הסיסמה שלך אינה מספיק חזקה.',
      couldBeStronger: 'הסיסמה שלך תקפה, אך יכולה להיות חזקה יותר. נסה להוסיף יותר תווים.',
      goodPassword: 'עבודה טובה. זו סיסמה מצוינת.',
      warnings: {
        straightRow: 'שורות ישרות של מקשים במקלדת שלך קלות לניחוש.',
        keyPattern: 'דפוסים קצרים של מקלדת קלים לניחוש.',
        simpleRepeat: 'תווים מוחזרים כמו "aaa" קלים לניחוש.',
        extendedRepeat: 'דפוסים מוחזרים של תווים כמו "abcabcabc" קלים לניחוש.',
        sequences: 'רצפות תווים נפוצות כמו "abc" קלות לניחוש.',
        recentYears: 'שנים אחרונות קלות לניחוש.',
        dates: 'תאריכים קלים לניחוש.',
        topTen: 'זו סיסמה שנמצאת בשימוש כבד.',
        topHundred: 'זו סיסמה שנמצאת בשימוש תכוף.',
        common: 'זו סיסמה שנמצאת בשימוש נפוץ.',
        similarToCommon: 'זו סיסמה דומה לסיסמה שנמצאת בשימוש נפוץ.',
        wordByItself: 'מילים בודדות קלות לניחוש.',
        namesByThemselves: 'שמות בודדים או שמות משפחה קלים לניחוש.',
        commonNames: 'שמות נפוצים ושמות משפחה קלים לניחוש.',
        userInputs: 'אין להזין נתונים אישיים או קשורים לדף.',
        pwned: 'הסיסמה שלך הוחשפה במהלך הפרת נתונים באינטרנט.',
      },
      suggestions: {
        l33t: "המנע מהחלפות תווים צפויות כמו '@' במקום 'a'.",
        reverseWords: 'הימנע מכתיבה הפוכה של מילים נפוצות.',
        allUppercase: 'הגדל כמה, אך לא את כל האותיות.',
        capitalization: 'הגדל יותר מאות אחת.',
        dates: 'המנע מתאריכים ושנים שקשורים אליך.',
        recentYears: 'הימנע משנים אחרונות.',
        associatedYears: 'הימנע משנים שקשורות אליך.',
        sequences: 'המנע מרצפות תווים נפוצות.',
        repeated: 'הימנע ממילים ותווים מוחזרים.',
        longerKeyboardPattern: 'השתמש בדפוסי מקלדת ארוכים יותר ושנה את כיוון ההקלדה מספר פעמים.',
        anotherWord: 'הוסף עוד מילים שהן פחות נפוצות.',
        useWords: 'השתמש במילים מרובות, אך הימנע מביטויים נפוצים.',
        noNeed: 'אתה יכול ליצור סיסמאות חזקות ללא שימוש בסמלים, מספרים, או אותיות גדולות.',
        pwned: 'אם אתה משתמש בסיסמה זו במקומות אחרים, עליך לשנותה.',
      },
    },
  },
  dates: {
    previous6Days: "{{ date | weekday('iw','long') }} האחרון ב-{{ date | timeString('iw') }}",
    lastDay: "אתמול ב-{{ date | timeString('iw') }}",
    sameDay: "היום ב-{{ date | timeString('iw') }}",
    nextDay: "מחר ב-{{ date | timeString('iw') }}",
    next6Days: "{{ date | weekday('iw','long') }} ב-{{ date | timeString('iw') }}",
    numeric: "{{ date | numeric('iw') }}",
  },
} as const;
