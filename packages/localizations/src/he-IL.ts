/*
 * =====================================================================================
 * DISCLAIMER:
 * =====================================================================================
 * This localization file is a community contribution and is not officially maintained
 * by Clerk. It has been provided by the community and may not be fully aligned
 * with the current or future states of the main application. Clerk does not guarantee
 * the accuracy, completeness, or timeliness of the translations in this file.
 * Use of this file is at your own risk and discretion.
 * =====================================================================================
 */

import type { LocalizationResource } from '@clerk/types';

export const heIL: LocalizationResource = {
  locale: 'he-IL',
  __experimental_commerce: {
    billedAnnually: undefined,
    cancelSubscription: undefined,
    checkout: {
      description__paymentSuccessful: undefined,
      description__subscriptionSuccessful: undefined,
      lineItems: {
        title__invoiceId: undefined,
        title__paymentMethod: undefined,
        title__subscriptionBegins: undefined,
        title__totalPaid: undefined,
      },
      title__paymentSuccessful: undefined,
      title__subscriptionSuccessful: undefined,
    },
    free: undefined,
    getStarted: undefined,
    keepSubscription: undefined,
    manage: undefined,
    manageSubscription: undefined,
    month: undefined,
    reSubscribe: undefined,
    switchPlan: undefined,
  },
  backButton: 'חזור',
  badge__currentPlan: undefined,
  badge__default: 'ברירת מחדל',
  badge__endsAt: undefined,
  badge__expired: undefined,
  badge__otherImpersonatorDevice: 'מכשיר מחקה אחר',
  badge__primary: 'ראשי',
  badge__requiresAction: 'דורש פעולה',
  badge__startsAt: undefined,
  badge__thisDevice: 'מכשיר זה',
  badge__unverified: 'לא מאומת',
  badge__upcomingPlan: undefined,
  badge__userDevice: 'מכשיר משתמש',
  badge__you: 'אתה',
  createOrganization: {
    formButtonSubmit: 'צור ארגון',
    invitePage: {
      formButtonReset: 'דלג',
    },
    title: 'צור ארגון',
  },
  dates: {
    lastDay: "אתמול ב-{{ date | timeString('iw') }}",
    next6Days: "{{ date | weekday('iw','long') }} ב-{{ date | timeString('iw') }}",
    nextDay: "מחר ב-{{ date | timeString('iw') }}",
    numeric: "{{ date | numeric('iw') }}",
    previous6Days: "{{ date | weekday('iw','long') }} האחרון ב-{{ date | timeString('iw') }}",
    sameDay: "היום ב-{{ date | timeString('iw') }}",
  },
  dividerText: 'או',
  footerActionLink__useAnotherMethod: 'השתמש בשיטה אחרת',
  footerPageLink__help: 'עזרה',
  footerPageLink__privacy: 'פרטיות',
  footerPageLink__terms: 'תנאים',
  formButtonPrimary: 'המשך',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'שכחת סיסמה?',
  formFieldError__matchingPasswords: 'הסיסמאות תואמות.',
  formFieldError__notMatchingPasswords: 'הסיסמאות אינן תואמות.',
  formFieldError__verificationLinkExpired: 'הקישור לאימות פג תוקף. אנא בקש/י קישור חדש.',
  formFieldHintText__optional: 'אופציונלי',
  formFieldHintText__slug: '(slug) הוא מזהה קריא שמיועד להיות ייחודי. הוא משמש לעיתים קרובות בכתובות URL.',
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'מחיקת חשבון',
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
  formFieldInputPlaceholder__firstName: undefined,
  formFieldInputPlaceholder__lastName: undefined,
  formFieldInputPlaceholder__organizationDomain: undefined,
  formFieldInputPlaceholder__organizationDomainEmailAddress: undefined,
  formFieldInputPlaceholder__organizationName: undefined,
  formFieldInputPlaceholder__organizationSlug: 'הארגון-שלי',
  formFieldInputPlaceholder__password: undefined,
  formFieldInputPlaceholder__phoneNumber: undefined,
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations: 'הפעל הזמנות אוטומטיות לדומיין הזה',
  formFieldLabel__backupCode: 'קוד גיבוי',
  formFieldLabel__confirmDeletion: 'אישור',
  formFieldLabel__confirmPassword: 'אמת סיסמה',
  formFieldLabel__currentPassword: 'סיסמה נוכחית',
  formFieldLabel__emailAddress: 'כתובת דוא"ל',
  formFieldLabel__emailAddress_username: 'כתובת דוא"ל או שם משתמש',
  formFieldLabel__emailAddresses: 'כתובות דוא"ל',
  formFieldLabel__firstName: 'שם פרטי',
  formFieldLabel__lastName: 'שם משפחה',
  formFieldLabel__newPassword: 'סיסמה חדשה',
  formFieldLabel__organizationDomain: 'דומיין',
  formFieldLabel__organizationDomainDeletePending: 'מחק הזמנות והצעות ממתינות',
  formFieldLabel__organizationDomainEmailAddress: 'כתובת אימייל לאימות',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'הזן כתובת אימייל תחת דומיין זה כדי לקבל קוד ולאמת את הדומיין.',
  formFieldLabel__organizationName: 'שם הארגון',
  formFieldLabel__organizationSlug: 'כתובת URL של הארגון',
  formFieldLabel__passkeyName: 'שם או מפתח סיסמה',
  formFieldLabel__password: 'סיסמה',
  formFieldLabel__phoneNumber: 'מספר טלפון',
  formFieldLabel__role: 'תפקיד',
  formFieldLabel__signOutOfOtherSessions: 'התנתק מכל המכשירים האחרים',
  formFieldLabel__username: 'שם משתמש',
  impersonationFab: {
    action__signOut: 'התנתק',
    title: 'מחובר כ{{identifier}}',
  },
  maintenanceMode: undefined,
  membershipRole__admin: 'מנהל',
  membershipRole__basicMember: 'חבר',
  membershipRole__guestMember: 'אורח',
  organizationList: {
    action__createOrganization: 'צור ארגון',
    action__invitationAccept: 'הצטרף',
    action__suggestionsAccept: 'בקשה להצטרפות',
    createOrganization: 'צור ארגון',
    invitationAcceptedLabel: 'הצטרף',
    subtitle: 'כדי להמשיך ל{{applicationName}}',
    suggestionsAcceptedLabel: 'ממתין לאישור',
    title: 'בחר חשבון',
    titleWithoutPersonal: 'בחר ארגון',
  },
  organizationProfile: {
    badge__automaticInvitation: 'הזמנות אוטומטיות',
    badge__automaticSuggestion: 'הצעות אוטומטיות',
    badge__manualInvitation: 'ללא הרשמה אוטומטית',
    badge__unverified: 'לא מאומת',
    createDomainPage: {
      subtitle:
        'הוסף את הדומיין לאימות. משתמשים עם כתובות אימייל תחת דומיין זה יכולים להצטרף לארגון באופן אוטומטי או לבקש להצטרף.',
      title: 'הוסף דומיין',
    },
    invitePage: {
      detailsTitle__inviteFailed: 'לא היה ניתן לשלוח את ההזמנות. תקן את הבעיות הבאות ונסה שוב:',
      formButtonPrimary__continue: 'שלח הזמנות',
      selectDropdown__role: 'בחר תפקיד',
      subtitle: 'הזמן חברים חדשים לארגון זה',
      successMessage: 'ההזמנות נשלחו בהצלחה',
      title: 'הזמן חברים',
    },
    membersPage: {
      action__invite: 'הזמן',
      action__search: undefined,
      activeMembersTab: {
        menuAction__remove: 'הסר חבר',
        tableHeader__actions: undefined,
        tableHeader__joined: 'הצטרף',
        tableHeader__role: 'תפקיד',
        tableHeader__user: 'משתמש',
      },
      detailsTitle__emptyRow: 'אין חברים להצגה',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'הזמן משתמשים על ידי חיבור דומיין אימייל לארגון שלך. כל מי שנרשם עם דומיין אימייל תואם יוכל להצטרף לארגון בכל עת.',
          headerTitle: 'הזמנות אוטומטיות',
          primaryButton: 'נהל דומיינים מאומתים',
        },
        table__emptyRow: 'אין הזמנות להצגה',
      },
      invitedMembersTab: {
        menuAction__revoke: 'בטל הזמנה',
        tableHeader__invited: 'הוזמן',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle: 'משתמשים שנרשמים עם דומיין אימייל תואם יוכלו לראות הצעה לבקש להצטרף לארגון שלך.',
          headerTitle: 'הצעות אוטומטיות',
          primaryButton: 'נהל דומיינים מאומתים',
        },
        menuAction__approve: 'אשר',
        menuAction__reject: 'דחה',
        tableHeader__requested: 'בקשת גישה',
        table__emptyRow: 'אין בקשות להצגה',
      },
      start: {
        headerTitle__invitations: 'הזמנות',
        headerTitle__members: 'חברים',
        headerTitle__requests: 'בקשות',
      },
    },
    navbar: {
      billing: undefined,
      description: 'נהל את הארגון שלך.',
      general: 'כללי',
      members: 'חברים',
      title: 'ארגון',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'הקלד "{{organizationName}}" למטה כדי להמשיך.',
          messageLine1: 'האם אתה בטוח שאתה רוצה למחוק את הארגון הזה?',
          messageLine2: 'פעולה זו היא סופית ובלתי הפיכה.',
          successMessage: 'מחקת את הארגון.',
          title: 'מחק ארגון',
        },
        leaveOrganization: {
          actionDescription: 'הקלד "{{organizationName}}" למטה כדי להמשיך.',
          messageLine1: 'האם אתה בטוח שאתה רוצה לעזוב את הארגון הזה? תאבד גישה לארגון זה וליישומים שלו.',
          messageLine2: 'פעולה זו היא סופית ובלתי הפיכה.',
          successMessage: 'עזבת את הארגון.',
          title: 'עזוב את הארגון',
        },
        title: 'סיכון',
      },
      domainSection: {
        menuAction__manage: 'נהל',
        menuAction__remove: 'מחק',
        menuAction__verify: 'אמת',
        primaryButton: 'הוסף דומיין',
        subtitle: 'אפשר למשתמשים להצטרף לארגון באופן אוטומטי או לבקש להצטרף על בסיס דומיין אימייל מאומת.',
        title: 'דומיינים מאומתים',
      },
      successMessage: 'הארגון עודכן.',
      title: 'פרופיל ארגון',
    },
    removeDomainPage: {
      messageLine1: 'דומיין האימייל {{domain}} יוסר.',
      messageLine2: 'משתמשים לא יוכלו להצטרף לארגון באופן אוטומטי לאחר פעולה זו.',
      successMessage: '{{domain}} הוסר.',
      title: 'הסר דומיין',
    },
    start: {
      headerTitle__general: 'כללי',
      headerTitle__members: 'חברים',
      profileSection: {
        primaryButton: 'עדכן פרופיל',
        title: 'פרופיל ארגון',
        uploadAction__title: 'לוגו',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'הסרת דומיין זה תשפיע על המשתמשים המוזמנים.',
        removeDomainActionLabel__remove: 'הסר דומיין',
        removeDomainSubtitle: 'הסר דומיין זה מרשימת הדומיינים המאומתים שלך',
        removeDomainTitle: 'הסר דומיין',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'משתמשים מוזמנים אוטומטית להצטרף לארגון כשהם נרשמים ויכולים להצטרף בכל עת.',
        automaticInvitationOption__label: 'הזמנות אוטומטיות',
        automaticSuggestionOption__description:
          'משתמשים מקבלים הצעה לבקש להצטרף, אך חייבים להיות מאושרים על ידי מנהל לפני שיוכלו להצטרף לארגון.',
        automaticSuggestionOption__label: 'הצעות אוטומטיות',
        calloutInfoLabel: 'שינוי מצב ההרשמה ישפיע רק על משתמשים חדשים.',
        calloutInvitationCountLabel: 'הזמנות ממתינות שנשלחו למשתמשים: {{count}}',
        calloutSuggestionCountLabel: 'הצעות ממתינות שנשלחו למשתמשים: {{count}}',
        manualInvitationOption__description: 'משתמשים יכולים להצטרף לארגון רק באמצעות הזמנה ידנית.',
        manualInvitationOption__label: 'ללא הרשמה אוטומטית',
        subtitle: 'בחר כיצד משתמשים מדומיין זה יכולים להצטרף לארגון.',
      },
      start: {
        headerTitle__danger: 'סיכון',
        headerTitle__enrollment: 'אפשרויות הרשמה',
      },
      subtitle: 'הדומיין {{domain}} אומת בהצלחה. המשך בבחירת מצב הרשמה.',
      title: 'עדכן {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'הזן את קוד האימות שנשלח לכתובת האימייל שלך',
      formTitle: 'קוד אימות',
      resendButton: 'לא קיבלת קוד? שלח שוב',
      subtitle: 'הדומיין {{domainName}} צריך להיות מאומת באמצעות אימייל.',
      subtitleVerificationCodeScreen: 'קוד אימות נשלח ל{{emailAddress}}. הזן את הקוד כדי להמשיך.',
      title: 'אמת דומיין',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'צור ארגון',
    action__invitationAccept: 'הצטרף',
    action__manageOrganization: 'נהל ארגון',
    action__suggestionsAccept: 'בקשה להצטרפות',
    notSelected: 'לא נבחר ארגון',
    personalWorkspace: 'אזור אישי',
    suggestionsAcceptedLabel: 'ממתין לאישור',
  },
  paginationButton__next: 'הבא',
  paginationButton__previous: 'הקודם',
  paginationRowText__displaying: 'מציג',
  paginationRowText__of: 'מתוך',
  reverification: {
    alternativeMethods: {
      actionLink: 'השג עזרה',
      actionText: 'אין לך אף אחד מאלה?',
      blockButton__backupCode: 'השתמש בקוד גיבוי',
      blockButton__emailCode: 'קוד אימייל ל {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'המשך עם הסיסמה שלך',
      blockButton__phoneCode: 'שלח קוד SMS ל {{identifier}}',
      blockButton__totp: 'השתמש באפליקציית האימות שלך',
      getHelp: {
        blockButton__emailSupport: 'תמיכה באימייל',
        content: 'אם יש לך בעיה באימות חשבונך, שלח לנו אימייל ואנחנו ניצור איתך קשר על מנת לשחזר את הגישה בהקדם האפשרי',
        title: 'השג עזרה',
      },
      subtitle: 'נתקלת בבעיות? אתה יכול להשתמש בכל אחת מהשיטות הללו עבור אימות',
      title: 'השתמש בשיטה אחרת',
    },
    backupCodeMfa: {
      subtitle: 'קוד הגיבוי שלך הוא הקוד שקיבלת כאשר הגדרת את האימות הדו-שלבי',
      title: 'הכנס את קוד הגיבוי',
    },
    emailCode: {
      formTitle: 'קוד אימות',
      resendButton: 'לא קיבלת קוד? שלח שוב',
      subtitle: 'המשך ל {{applicationName}}',
      title: 'בדוק את האימייל שלך',
    },
    noAvailableMethods: {
      message: 'לא ניתן להמשיך עם האימות. אין גורם אימות זמין',
      subtitle: 'קרתה תקלה',
      title: 'לא ניתן לאמת את חשבונך',
    },
    passkey: {
      blockButton__passkey: undefined,
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'השתמש בשיטה אחרת',
      subtitle: 'הכנס את הסיסמה המקושרת עם חשבונך',
      title: 'הכנס סיסמה',
    },
    phoneCode: {
      formTitle: 'קוד אימות',
      resendButton: 'לא קיבלת קוד? שלח שוב',
      subtitle: 'להמשך ל {{applicationName}}',
      title: 'בדוק את הטלפון שלך',
    },
    phoneCodeMfa: {
      formTitle: 'קוד אימות',
      resendButton: 'לא קיבלת קוד? שלח שוב',
      subtitle: 'להמשך, אנא הכנס את קוד האימות שנשלח לטלפון שלך',
      title: 'בדוק את הטלפון שלך',
    },
    totpMfa: {
      formTitle: 'קוד אימות',
      subtitle: 'להמשך, אנא הכנס את קוד האימות שנוצר על ידי אפליקציית האימות שלך',
      title: 'אימות דו-שלבי',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'הוסף חשבון',
      action__signOutAll: 'התנתק מכל החשבונות',
      subtitle: 'בחר את החשבון איתו תרצה להמשיך.',
      title: 'בחר חשבון',
    },
    alternativeMethods: {
      actionLink: 'קבל עזרה',
      actionText: 'אין לך אף אחת מהשיטות האלה?',
      blockButton__backupCode: 'השתמש בקוד גיבוי',
      blockButton__emailCode: 'שלח קוד באימייל ל-{{identifier}}',
      blockButton__emailLink: 'שלח קישור באימייל ל-{{identifier}}',
      blockButton__passkey: 'היכנס עם המפתח שלך',
      blockButton__password: 'התחבר עם הסיסמה שלך',
      blockButton__phoneCode: 'שלח קוד SMS ל-{{identifier}}',
      blockButton__totp: 'השתמש באפליקציית האימות שלך',
      getHelp: {
        blockButton__emailSupport: 'מייל לתמיכה',
        content: 'אם אתה נתקל בקשיים בהתחברות לחשבונך, שלח לנו מייל ונעבוד איתך כדי לשחזר את הגישה בהקדם האפשרי.',
        title: 'קבל עזרה',
      },
      subtitle: 'נתקלת בבעיה? תוכל להשתמש באחת מהשיטות האלה כדי להתחבר.',
      title: 'השתמש בשיטה אחרת',
    },
    backupCodeMfa: {
      subtitle: 'להמשיך אל {{applicationName}}',
      title: 'הכנס קוד גיבוי',
    },
    emailCode: {
      formTitle: 'קוד אימות',
      resendButton: 'שלח קוד שוב',
      subtitle: 'להמשיך אל {{applicationName}}',
      title: 'בדוק את הדוא"ל שלך',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'להמשך, פתח את קוד האימות מהמכשיר והדפדפן ממנו אתה מתכוון לבצע כניסה',
        title: 'קישור האימות הזה לא חוקי עבור מכשיר זה',
      },
      expired: {
        subtitle: 'חזור לכרטיסייה המקורית להמשך.',
        title: 'קישור האימות הזה פג תוקף',
      },
      failed: {
        subtitle: 'חזור לכרטיסייה המקורית להמשך.',
        title: 'קישור האימות הזה לא חוקי',
      },
      formSubtitle: 'השתמש בקישור האימות שנשלח לדוא"ל שלך',
      formTitle: 'קישור אימות',
      loading: {
        subtitle: 'תועבר בקרוב',
        title: 'מתחבר...',
      },
      resendButton: 'שלח קישור שוב',
      subtitle: 'להמשיך אל {{applicationName}}',
      title: 'בדוק את הדוא"ל שלך',
      unusedTab: {
        title: 'אתה יכול לסגור את הכרטיסייה הזו',
      },
      verified: {
        subtitle: 'תועבר בקרוב',
        title: 'נכנסת בהצלחה',
      },
      verifiedSwitchTab: {
        subtitle: 'חזור לכרטיסייה המקורית להמשך',
        subtitleNewTab: 'חזור לכרטיסייה שנפתחה חדשה להמשך',
        titleNewTab: 'נכנס בכרטיסייה אחרת',
      },
    },
    forgotPassword: {
      formTitle: 'אפס קוד הסיסמה',
      resendButton: 'שלח קוד שוב',
      subtitle: 'כדי לאפס את הסיסמה שלך',
      subtitle_email: 'ראשית, הכנס את הקוד שנשלח לאימייל שלך',
      subtitle_phone: 'ראשית, הכנס את הקוד שנשלח לטלפון שלך',
      title: 'איפוס סיסמה',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'אפס את הסיסמה שלך',
      label__alternativeMethods: 'או, התחבר באמצעות שיטה אחרת.',
      title: 'שכחת סיסמה?',
    },
    noAvailableMethods: {
      message: 'לא ניתן להמשיך בהתחברות. אין גורם אימות זמין.',
      subtitle: 'אירעה שגיאה',
      title: 'לא ניתן להתחבר',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'השתמש בשיטה אחרת',
      subtitle: 'להמשיך אל {{applicationName}}',
      title: 'הכנס את סיסמתך',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'קוד אימות',
      resendButton: 'שלח את הקוד שוב',
      subtitle: 'להמשיך אל {{applicationName}}',
      title: 'בדוק את הטלפון שלך',
    },
    phoneCodeMfa: {
      formTitle: 'קוד אימות',
      resendButton: 'שלח את הקוד שוב',
      subtitle: undefined,
      title: 'בדוק את הטלפון שלך',
    },
    resetPassword: {
      formButtonPrimary: 'אפס סיסמה',
      requiredMessage: 'מטעמי אבטחה, יש לאפס את הסיסמה שלך.',
      successMessage: 'הסיסמה שלך שונתה בהצלחה. מחבר אותך, אנא המתן רגע.',
      title: 'אפס סיסמה',
    },
    resetPasswordMfa: {
      detailsLabel: 'אנחנו צריכים לאמת את זהותך לפני שנאפס את הסיסמה שלך.',
    },
    start: {
      actionLink: 'הרשמה',
      actionLink__join_waitlist: undefined,
      actionLink__use_email: 'השתמש בדוא"ל',
      actionLink__use_email_username: 'השתמש בדוא"ל או שם משתמש',
      actionLink__use_passkey: 'השתמש במפתח סיסמה במקום',
      actionLink__use_phone: 'השתמש בטלפון',
      actionLink__use_username: 'השתמש בשם משתמש',
      actionText: 'אין לך חשבון?',
      actionText__join_waitlist: undefined,
      subtitle: 'להמשיך אל {{applicationName}}',
      subtitleCombined: undefined,
      title: 'התחבר',
      titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'קוד אימות',
      subtitle: 'להמשך, אנא הכנס את קוד האימות שנוצר על ידי אפליקציית האימות שלך',
      title: 'אימות שני שלבים',
    },
  },
  signInEnterPasswordTitle: 'הזן את הסיסמה שלך',
  signUp: {
    continue: {
      actionLink: 'התחבר',
      actionText: 'יש לך חשבון?',
      subtitle: 'להמשיך אל {{applicationName}}',
      title: 'מלא שדות חסרים',
    },
    emailCode: {
      formSubtitle: 'הכנס את קוד האימות שנשלח לכתובת הדוא"ל שלך',
      formTitle: 'קוד אימות',
      resendButton: 'שלח קוד שוב',
      subtitle: 'להמשיך אל {{applicationName}}',
      title: 'אמת את כתובת הדוא"ל שלך',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'להמשך, פתח את קוד האימות מהמכשיר והדפדפן ממנו אתה מתכוון לבצע את הרישום',
        title: 'קישור האימות אינו חוקי עבור מכשיר זה',
      },
      formSubtitle: 'השתמש בקישור האימות שנשלח לכתובת הדוא"ל שלך',
      formTitle: 'קישור לאימות',
      loading: {
        title: 'מתחיל להירשם...',
      },
      resendButton: 'שלח קישור שוב',
      subtitle: 'להמשיך אל {{applicationName}}',
      title: 'אמת את כתובת הדוא"ל שלך',
      verified: {
        title: 'נרשמת בהצלחה',
      },
      verifiedSwitchTab: {
        subtitle: 'חזור לכרטיסייה שנפתחה לאחרונה להמשיך',
        subtitleNewTab: 'חזור לכרטיסייה הקודמת להמשיך',
        title: 'אימות דוא"ל הצליח',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: undefined,
        label__onlyTermsOfService: undefined,
        label__termsOfServiceAndPrivacyPolicy: undefined,
      },
      continue: {
        subtitle: undefined,
        title: undefined,
      },
    },
    phoneCode: {
      formSubtitle: 'הכנס את קוד האימות שנשלח למספר הטלפון שלך',
      formTitle: 'קוד אימות',
      resendButton: 'שלח קוד שוב',
      subtitle: 'להמשיך אל {{applicationName}}',
      title: 'אמת את מספר הטלפון שלך',
    },
    restrictedAccess: {
      actionLink: undefined,
      actionText: undefined,
      blockButton__emailSupport: undefined,
      blockButton__joinWaitlist: undefined,
      subtitle: undefined,
      subtitleWaitlist: undefined,
      title: undefined,
    },
    start: {
      actionLink: 'התחבר',
      actionLink__use_email: undefined,
      actionLink__use_phone: undefined,
      actionText: 'יש לך חשבון?',
      subtitle: 'להמשיך אל {{applicationName}}',
      subtitleCombined: 'להמשיך אל {{applicationName}}',
      title: 'צור את החשבון שלך',
      titleCombined: 'צור את החשבון שלך',
    },
  },
  socialButtonsBlockButton: 'המשך עם {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  unstable__errors: {
    already_a_member_in_organization: '{{email}} כבר חבר בארגון',
    captcha_invalid: 'ההרשמה נכשלה עקב כשל באימות האבטחה. אנא רענן את הדף ונסה שוב, או פנה לתמיכה לעזרה נוספת.',
    captcha_unavailable: 'ההרשמה נכשלה עקב כשל באימות נגד בוטים. אנא רענן את הדף ונסה שוב, או פנה לתמיכה לעזרה נוספת.',
    form_code_incorrect: undefined,
    form_identifier_exists__email_address: 'כתובת המייל הזאת כבר תפוסה. אנא נסה אחרת.',
    form_identifier_exists__phone_number: 'מספר הטלפון הזה כבר תפוס. אנא נסה מספר אחר.',
    form_identifier_exists__username: 'שם המשתמש הזה כבר תפוס. אנא נסה שם משתמש אחר',
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'כתובת האימייל חייבת להיות כתובת אימייל תקינה.',
    form_param_format_invalid__phone_number: 'מספר הטלפון חייב להיות בפורמט בינלאומי תקין.',
    form_param_max_length_exceeded__first_name: 'שם פרטי לא צריך לעלות על 256 תווים.',
    form_param_max_length_exceeded__last_name: 'שם משפחה לא צריך לעלות על 256 תווים.',
    form_param_max_length_exceeded__name: 'שם לא צריך לעלות על 256 תווים.',
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: 'הסיסמה שלך אינה מספיק חזקה.',
    form_password_pwned: 'הסיסמה הזו נמצאה כחלק מהפרטים שנחשפו בהפרת נתונים ולא ניתן להשתמש בה, נסה סיסמה אחרת במקום.',
    form_password_pwned__sign_in:
      'הסיסמה הזו נמצאה כחלק מהפרטים שנחשפו בהפרת נתונים ולא ניתן להשתמש בה, אנא בצע איתחול לסיסמה שלך.',
    form_password_size_in_bytes_exceeded:
      'הסיסמה שלך חורגת ממספר הבייטים המרבי המותר, נסה לקצר אותה או להסיר כמה תווים מיוחדים.',
    form_password_validation_failed: 'סיסמה שגויה',
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed: 'לא ניתן למחוק את הזיהוי האחרון שלך.',
    not_allowed_access: undefined,
    organization_domain_blocked: 'הדומיין של ספק האימייל הזה חסום. אנא נסה אחד שונה.',
    organization_domain_common: 'הדומיין של ספק האימייל הזה נפוץ. אנא נסה אחד שונה.',
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded: 'הגעת למגבלת החברות בארגון, כולל הזמנות יוצאות דופן.',
    organization_minimum_permissions_needed: 'חייב להיות חבר ארגון אחד לפחות עם ההרשאות המינימליות הנדרשות.',
    passkey_already_exists: 'מפתח הסיסמה כבר רשום במכשיר זה.',
    passkey_not_supported: 'מפתחות סיסמה אינם נתמכים במכשיר זה.',
    passkey_pa_not_supported: 'ההרשמה דורשת מאמת פלטפורמה אך המכשיר אינו תומך בכך.',
    passkey_registration_cancelled: 'רישום מפתח הסיסמה בוטל או פג הזמן הקצוב.',
    passkey_retrieval_cancelled: 'אימות מפתח הסיסמה בוטל או פג הזמן הקצוב.',
    passwordComplexity: {
      maximumLength: 'פחות מ-{{length}} תווים',
      minimumLength: '{{length}} תווים או יותר',
      requireLowercase: 'אות קטנה',
      requireNumbers: 'מספר',
      requireSpecialCharacter: 'תו מיוחד',
      requireUppercase: 'אות גדולה',
      sentencePrefix: 'הסיסמה שלך חייבת להכיל',
    },
    phone_number_exists: 'מספר הטלפון הזה כבר בשימוש. אנא נסה מספר אחר.',
    web3_missing_identifier: undefined,
    zxcvbn: {
      couldBeStronger: 'הסיסמה שלך תקפה, אך יכולה להיות חזקה יותר. נסה להוסיף יותר תווים.',
      goodPassword: 'עבודה טובה. זו סיסמה מצוינת.',
      notEnough: 'הסיסמה שלך אינה מספיק חזקה.',
      suggestions: {
        allUppercase: 'הגדל כמה, אך לא את כל האותיות.',
        anotherWord: 'הוסף עוד מילים שהן פחות נפוצות.',
        associatedYears: 'הימנע משנים שקשורות אליך.',
        capitalization: 'הגדל יותר מאות אחת.',
        dates: 'המנע מתאריכים ושנים שקשורים אליך.',
        l33t: "המנע מהחלפות תווים צפויות כמו '@' במקום 'a'.",
        longerKeyboardPattern: 'השתמש בדפוסי מקלדת ארוכים יותר ושנה את כיוון ההקלדה מספר פעמים.',
        noNeed: 'אתה יכול ליצור סיסמאות חזקות ללא שימוש בסמלים, מספרים, או אותיות גדולות.',
        pwned: 'אם אתה משתמש בסיסמה זו במקומות אחרים, עליך לשנותה.',
        recentYears: 'הימנע משנים אחרונות.',
        repeated: 'הימנע ממילים ותווים מוחזרים.',
        reverseWords: 'הימנע מכתיבה הפוכה של מילים נפוצות.',
        sequences: 'המנע מרצפות תווים נפוצות.',
        useWords: 'השתמש במילים מרובות, אך הימנע מביטויים נפוצים.',
      },
      warnings: {
        common: 'זו סיסמה שנמצאת בשימוש נפוץ.',
        commonNames: 'שמות נפוצים ושמות משפחה קלים לניחוש.',
        dates: 'תאריכים קלים לניחוש.',
        extendedRepeat: 'דפוסים מוחזרים של תווים כמו "abcabcabc" קלים לניחוש.',
        keyPattern: 'דפוסים קצרים של מקלדת קלים לניחוש.',
        namesByThemselves: 'שמות בודדים או שמות משפחה קלים לניחוש.',
        pwned: 'הסיסמה שלך הוחשפה במהלך הפרת נתונים באינטרנט.',
        recentYears: 'שנים אחרונות קלות לניחוש.',
        sequences: 'רצפות תווים נפוצות כמו "abc" קלות לניחוש.',
        similarToCommon: 'זו סיסמה דומה לסיסמה שנמצאת בשימוש נפוץ.',
        simpleRepeat: 'תווים מוחזרים כמו "aaa" קלים לניחוש.',
        straightRow: 'שורות ישרות של מקשים במקלדת שלך קלות לניחוש.',
        topHundred: 'זו סיסמה שנמצאת בשימוש תכוף.',
        topTen: 'זו סיסמה שנמצאת בשימוש כבד.',
        userInputs: 'אין להזין נתונים אישיים או קשורים לדף.',
        wordByItself: 'מילים בודדות קלות לניחוש.',
      },
    },
  },
  userButton: {
    action__addAccount: 'הוסף חשבון',
    action__manageAccount: 'נהל חשבון',
    action__signOut: 'התנתק',
    action__signOutAll: 'התנתק מכל החשבונות',
  },
  userProfile: {
    __experimental_billingPage: {
      paymentSourcesSection: {
        actionLabel__default: undefined,
        actionLabel__remove: undefined,
        add: undefined,
        addSubtitle: undefined,
        cancelButton: undefined,
        formButtonPrimary__add: undefined,
        formButtonPrimary__pay: undefined,
        removeResource: {
          messageLine1: undefined,
          messageLine2: undefined,
          successMessage: undefined,
          title: undefined,
        },
        title: undefined,
      },
      start: {
        headerTitle__invoices: undefined,
        headerTitle__paymentSources: undefined,
        headerTitle__plans: undefined,
        headerTitle__subscriptions: undefined,
      },
      subscriptionsSection: {
        actionLabel__cancel: undefined,
        actionLabel__default: undefined,
      },
      title: undefined,
    },
    backupCodePage: {
      actionLabel__copied: 'הועתק!',
      actionLabel__copy: 'העתק הכל',
      actionLabel__download: 'הורד .txt',
      actionLabel__print: 'הדפס',
      infoText1: 'קודי גיבוי יהיו מופעלים לחשבון זה.',
      infoText2: 'שמור את קודי הגיבוי בסוד ואחסן אותם בבטחה. תוכל לחולל מחדש קודי גיבוי אם אתה חושד שהם נפגעו.',
      subtitle__codelist: 'אחסן אותם בבטחה ושמור עליהם בסוד.',
      successMessage:
        'קודי הגיבוי מופעלים כעת. תוכל להשתמש באחד מאלה כדי להתחבר לחשבון שלך, אם אתה מאבד גישה למכשיר האימות שלך. כל קוד יכול להשתמש בו רק פעם אחת.',
      successSubtitle: 'תוכל להשתמש באחד מאלה כדי להתחבר לחשבון שלך, אם אתה מאבד גישה למכשיר האימות שלך.',
      title: 'הוסף אימות קוד גיבוי',
      title__codelist: 'קודי גיבוי',
    },
    connectedAccountPage: {
      formHint: 'בחר ספק כדי לחבר את החשבון שלך.',
      formHint__noAccounts: 'אין ספקים זמינים לחשבונות חיצוניים.',
      removeResource: {
        messageLine1: '{{identifier}} יוסר מהחשבון הזה.',
        messageLine2: 'לא תוכל יותר להשתמש בחשבון מחובר זה וכל התכונות התלויות לא יעבדו.',
        successMessage: '{{connectedAccount}} הוסר מהחשבון שלך.',
        title: 'הסר חשבון מחובר',
      },
      socialButtonsBlockButton: 'חבר חשבון {{provider|titleize}}',
      successMessage: 'הספק התווסף לחשבון שלך',
      title: 'הוסף חשבון מחובר',
    },
    deletePage: {
      actionDescription: 'הקלד "מחק חשבון" למטה כדי להמשיך.',
      confirm: 'מחק חשבון',
      messageLine1: 'האם אתה בטוח שאתה רוצה למחוק את החשבון שלך?',
      messageLine2: 'פעולה זו היא סופית ובלתי הפיכה.',
      title: 'מחק חשבון',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'אימייל שמכיל קוד אימות ישלח לכתובת זו.',
        formSubtitle: 'הכנס את קוד האימות שנשלח ל-{{identifier}}',
        formTitle: 'קוד אימות',
        resendButton: 'שלח קוד מחדש',
        successMessage: 'האימייל {{identifier}} התווסף לחשבון שלך.',
      },
      emailLink: {
        formHint: 'אימייל שמכיל קישור לאימות ישלח לכתובת זו.',
        formSubtitle: 'לחץ על קישור האימות באימייל שנשלח ל-{{identifier}}',
        formTitle: 'קישור לאימות',
        resendButton: 'שלח קישור מחדש',
        successMessage: 'האימייל {{identifier}} התווסף לחשבון שלך.',
      },
      enterpriseSSOLink: {
        formButton: undefined,
        formSubtitle: undefined,
      },
      formHint: undefined,
      removeResource: {
        messageLine1: '{{identifier}} יוסר מהחשבון הזה.',
        messageLine2: 'לא תוכל יותר להתחבר באמצעות כתובת אימייל זו.',
        successMessage: 'האימייל {{emailAddress}} הוסר מהחשבון שלך.',
        title: 'הסר כתובת אימייל',
      },
      title: 'הוסף כתובת אימייל',
      verifyTitle: 'אמת כתובת אימייל',
    },
    formButtonPrimary__add: 'הוסף',
    formButtonPrimary__continue: 'המשך',
    formButtonPrimary__finish: 'סיים',
    formButtonPrimary__remove: 'מחק',
    formButtonPrimary__save: 'שמור',
    formButtonReset: 'בטל',
    mfaPage: {
      formHint: 'בחר שיטה להוספה.',
      title: 'הוסף אימות דו-שלבי',
    },
    mfaPhoneCodePage: {
      backButton: 'השתמש במספר קיים',
      primaryButton__addPhoneNumber: 'הוסף מספר טלפון',
      removeResource: {
        messageLine1: '{{identifier}} לא יקבל יותר קודים לאימות בעת ההתחברות.',
        messageLine2: 'החשבון שלך עשוי לא להיות בטוח כמו שהוא. האם אתה בטוח שאתה רוצה להמשיך?',
        successMessage: 'אימות קוד SMS דו-שלבי הוסר ל{{mfaPhoneCode}}',
        title: 'הסר אימות דו-שלבי',
      },
      subtitle__availablePhoneNumbers: 'בחר מספר טלפון להרשמה לאימות קוד SMS דו-שלבי.',
      subtitle__unavailablePhoneNumbers: 'אין מספרי טלפון זמינים להרשמה לאימות קוד SMS דו-שלבי.',
      successMessage1: 'בעת ההתחברות, תצטרך להזין קוד אימות שנשלח למספר טלפון זה כשלב נוסף.',
      successMessage2:
        'שמור קודי גיבוי אלו במקום בטוח. אם תאבד גישה למכשיר האימות שלך, תוכל להשתמש בקודי גיבוי כדי להתחבר.',
      successTitle: 'אימות קוד SMS הופעל',
      title: 'הוסף אימות קוד SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'סרוק קוד QR במקום',
        buttonUnableToScan__nonPrimary: 'לא יכול לסרוק קוד QR?',
        infoText__ableToScan:
          'הגדר שיטת התחברות חדשה באפליקציית האותנטיקטור שלך וסרוק את קוד ה-QR הבא כדי לחברו לחשבון שלך.',
        infoText__unableToScan: 'הגדר שיטת התחברות חדשה באותנטיקטור שלך והכנס את המפתח שסופק למטה.',
        inputLabel__unableToScan1: 'וודא שסיסמאות מבוססות-זמן או חד-פעמיות מופעלות, ואז סיים לחבר את החשבון שלך.',
        inputLabel__unableToScan2:
          'לחלופין, אם האותנטיקטור שלך תומך בכתובת URI של TOTP, תוכל גם להעתיק את הכתובת המלאה.',
      },
      removeResource: {
        messageLine1: 'קודי האימות מהאותנטיקטור הזה לא יהיו נדרשים יותר בעת ההתחברות.',
        messageLine2: 'החשבון שלך עשוי לא להיות בטוח כמו שהוא. האם אתה בטוח שאתה רוצה להמשיך?',
        successMessage: 'אימות דו-שלבי באמצעות אפליקצית האותנטיקטור הוסר.',
        title: 'הסר אימות דו-שלבי',
      },
      successMessage: 'האימות הדו-שלבי מופעל כעת. בעת ההתחברות, תידרש להכניס קוד אימות מהאותנטיקטור זה כשלב נוסף.',
      title: 'הוסף אפליקציית אימות',
      verifySubtitle: 'הכנס את קוד האימות שנוצר על ידי האותנטיקטור שלך',
      verifyTitle: 'קוד אימות',
    },
    mobileButton__menu: 'תפריט',
    navbar: {
      account: 'פרופיל',
      billing: undefined,
      description: 'נהל את פרטי החשבון שלך.',
      security: 'אבטחה',
      title: 'חשבון',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} יוסר מחשבון זה',
        title: 'הסר מפתח סיסמה',
      },
      subtitle__rename: 'אתה יכול לשנות את שם מפתח הסיסמה על מנת למצוא אותו בקלות יותר',
      title__rename: 'שנה שם למפתח סיסמה',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions: 'מומלץ להתנתק מכל המכשירים האחרים שעלולים היו להשתמש בסיסמה הישנה שלך.',
      readonly: 'כרגע לא ניתן לערוך את הסיסמה שלך מכיוון שניתן להתחבר רק דרך חיבור ארגוני.',
      successMessage__set: 'הסיסמה שלך הוגדרה.',
      successMessage__signOutOfOtherSessions: 'כל המכשירים האחרים התנתקו.',
      successMessage__update: 'הסיסמה שלך עודכנה.',
      title__set: 'הגדר סיסמה',
      title__update: 'שנה סיסמה',
    },
    phoneNumberPage: {
      infoText: 'הודעת טקסט שמכילה קישור לאימות תישלח למספר טלפון זה.',
      removeResource: {
        messageLine1: '{{identifier}} יוסר מהחשבון הזה.',
        messageLine2: 'לא תוכל יותר להתחבר באמצעות מספר טלפון זה.',
        successMessage: '{{phoneNumber}} הוסר מהחשבון שלך.',
        title: 'הסר מספר טלפון',
      },
      successMessage: '{{identifier}} התווסף לחשבון שלך.',
      title: 'הוסף מספר טלפון',
      verifySubtitle: 'הזן את קוד האימות שנשלח ל{{identifier}}',
      verifyTitle: 'אמת מספר טלפון',
    },
    profilePage: {
      fileDropAreaHint: 'העלה תמונה בפורמט JPG, PNG, GIF, או WEBP הקטנה מ-10 מ"ב',
      imageFormDestructiveActionSubtitle: 'הסר תמונה',
      imageFormSubtitle: 'העלה תמונה',
      imageFormTitle: 'תמונת פרופיל',
      readonly: 'פרטי הפרופיל שלך ניתנים על ידי החיבור הארגוני ואינם ניתנים לעריכה.',
      successMessage: 'הפרופיל שלך עודכן.',
      title: 'עדכן פרופיל',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'התנתק מהמכשיר',
        title: 'מכשירים פעילים',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'נסה שוב',
        actionLabel__reauthorize: 'אשר עכשיו',
        destructiveActionTitle: 'הסר',
        primaryButton: 'חבר חשבון',
        subtitle__disconnected: 'החשבון הזה נותק',
        subtitle__reauthorize:
          'ההרשאות הנדרשות עודכנו, ייתכן שאתה חווה פונקציונליות מוגבלת. אנא אשר מחדש את האפליקציה כדי להימנע מבעיות.',
        title: 'חשבונות מחוברים',
      },
      dangerSection: {
        deleteAccountButton: 'מחק חשבון',
        title: 'מסוכן',
      },
      emailAddressesSection: {
        destructiveAction: 'הסר כתובת אימייל',
        detailsAction__nonPrimary: 'הגדר כעיקרית',
        detailsAction__primary: 'השלם אימות',
        detailsAction__unverified: 'השלם אימות',
        primaryButton: 'הוסף כתובת אימייל',
        title: 'כתובת אימייל',
      },
      enterpriseAccountsSection: {
        title: 'חשבונות ארגוניים',
      },
      headerTitle__account: 'חשבון',
      headerTitle__security: 'אבטחה',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'צור קודים מחדש',
          headerTitle: 'קוד גיבוי',
          subtitle__regenerate: 'קבל קבוצה חדשה של קודי גיבוי מאובטחים. קודי גיבוי קודמים יימחקו ולא ניתן להשתמש בהם.',
          title__regenerate: 'צור מחדש קודי גיבוי',
        },
        phoneCode: {
          actionLabel__setDefault: 'הגדר כברירת מחדל',
          destructiveActionLabel: 'הסר מספר טלפון',
        },
        primaryButton: 'הוסף אימות דו-שלבי',
        title: 'אימות דו-שלבי',
        totp: {
          destructiveActionTitle: 'הסר',
          headerTitle: 'אפליקציית מאמת',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'הגדר סיסמה',
        menuAction__rename: 'עדכן סיסמה',
        primaryButton: undefined,
        title: 'סיסמה',
      },
      passwordSection: {
        primaryButton__setPassword: 'הגדר סיסמה',
        primaryButton__updatePassword: 'שנה סיסמה',
        title: 'סיסמה',
      },
      phoneNumbersSection: {
        destructiveAction: 'הסר מספר טלפון',
        detailsAction__nonPrimary: 'הגדר כראשי',
        detailsAction__primary: 'השלם אימות',
        detailsAction__unverified: 'השלם אימות',
        primaryButton: 'הוסף מספר טלפון',
        title: 'מספרי טלפון',
      },
      profileSection: {
        primaryButton: 'עדכן פרופיל',
        title: 'פרופיל',
      },
      usernameSection: {
        primaryButton__setUsername: 'הגדר שם משתמש',
        primaryButton__updateUsername: 'שנה שם משתמש',
        title: 'שם משתמש',
      },
      web3WalletsSection: {
        destructiveAction: 'הסר ארנק',
        detailsAction__nonPrimary: undefined,
        primaryButton: 'ארנקי Web3',
        title: 'ארנקי Web3',
      },
    },
    usernamePage: {
      successMessage: 'שם המשתמש שלך עודכן.',
      title__set: 'עדכן שם משתמש',
      title__update: 'עדכן שם משתמש',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} יוסר מהחשבון הזה.',
        messageLine2: 'לא תוכל יותר להתחבר באמצעות ארנק web3 זה.',
        successMessage: '{{web3Wallet}} הוסר מהחשבון שלך.',
        title: 'הסר ארנק web3',
      },
      subtitle__availableWallets: 'בחר ארנק web3 לחיבור לחשבון שלך.',
      subtitle__unavailableWallets: 'אין ארנקי web3 זמינים.',
      successMessage: 'הארנק התווסף לחשבון שלך.',
      title: 'הוסף ארנק web3',
      web3WalletButtonsBlockButton: '{{provider|titleize}}',
    },
  },
  waitlist: {
    start: {
      actionLink: undefined,
      actionText: undefined,
      formButton: undefined,
      subtitle: undefined,
      title: undefined,
    },
    success: {
      message: undefined,
      subtitle: undefined,
      title: undefined,
    },
  },
} as const;
