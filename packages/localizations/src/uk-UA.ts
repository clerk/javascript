import type { LocalizationResource } from '@clerk/types';

const commonTexts = {
  signIn: {
    phoneCode: {
      title: 'Перевірте свій телефон',
      subtitle: 'продовжити в {{applicationName}}',
      formTitle: 'Код підтвердження',
      formSubtitle: 'Введіть код підтвердження, надісланий на Ваш номер телефону',
      resendButton: 'Не отримали код? повторно відправити',
    },
  },
} as const;

export const ukUA: LocalizationResource = {
  locale: 'uk-UA',
  socialButtonsBlockButton: 'Продовжити за допомогою {{provider|titleize}}',
  dividerText: 'або',
  formFieldLabel__emailAddress: 'Пошта',
  formFieldLabel__emailAddresses: 'Поштові адреси',
  formFieldLabel__phoneNumber: 'Номер телефону',
  formFieldLabel__username: `Ім'я користувача`,
  formFieldLabel__emailAddress_phoneNumber: 'Пошта або номер телефону',
  formFieldLabel__emailAddress_username: `Пошта або ім'я користувача`,
  formFieldLabel__phoneNumber_username: `номер телефону або ім'я користувача`,
  formFieldLabel__emailAddress_phoneNumber_username: `Пошта, номер телефону або ім'я користувача`,
  formFieldLabel__password: 'Пароль',
  formFieldLabel__currentPassword: 'Поточний пароль',
  formFieldLabel__newPassword: 'Новий пароль',
  formFieldLabel__confirmPassword: 'Підтвердження пароля',
  formFieldLabel__signOutOfOtherSessions: 'Вийти з усіх інших пристроїв',
  formFieldLabel__firstName: `Ім'я`,
  formFieldLabel__lastName: 'Прізвище',
  formFieldLabel__backupCode: 'Код відновлення',
  formFieldLabel__organizationName: 'Назва організації',
  formFieldLabel__organizationSlug: 'URL адреса',
  formFieldLabel__confirmDeletion: 'Підтвердження',
  formFieldLabel__role: 'Роль',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddresses:
    'Введіть або вставте одну або більше адрес електронної пошти, розділених пробілами або комами',
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
  formFieldError__notMatchingPasswords: 'Паролі не збігаються.',
  formFieldError__matchingPasswords: 'Паролі збігаються.',
  formFieldAction__forgotPassword: 'Забули пароль?',
  formFieldHintText__optional: `Необов'язково`,
  formButtonPrimary: 'Продовжити',
  signInEnterPasswordTitle: 'Введіть Ваш пароль',
  backButton: 'Назад',
  footerActionLink__useAnotherMethod: 'Використовувати інший метод',
  badge__primary: 'Основний',
  badge__thisDevice: 'Цей пристрій',
  badge__userDevice: 'Пристрій користувача',
  badge__otherImpersonatorDevice: 'Інший пристрій-двійник',
  badge__default: 'За замовчуванням',
  badge__unverified: 'Неперевірений',
  badge__requiresAction: 'Потребує дії',
  badge__you: 'Ви',
  footerPageLink__help: 'Допомога',
  footerPageLink__privacy: 'Приватність',
  footerPageLink__terms: 'Умови',
  paginationButton__previous: 'Назад',
  paginationButton__next: 'Вперед',
  paginationRowText__displaying: 'Відображення',
  paginationRowText__of: 'з',
  membershipRole__admin: 'Адміністратор',
  membershipRole__basicMember: 'Член',
  membershipRole__guestMember: 'Гість',
  signUp: {
    start: {
      title: 'Створіть Ваш акаунт',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      actionText: 'Уже є акаунт?',
      actionLink: 'Увійти',
    },
    emailLink: {
      title: 'Підтвердіть свою електронну пошту',
      subtitle: 'продовжити до {{applicationName}}',
      formTitle: 'Посилання для підтвердження',
      formSubtitle: 'Використовуйте посилання для підтвердження, надіслане на вашу електронну адресу',
      resendButton: 'Не отримали посилання? Повторно відправити',
      verified: {
        title: 'Успішно зареєстровано',
      },
      loading: {
        title: 'Реєстрація...',
      },
      verifiedSwitchTab: {
        title: 'Успішно перевірено email',
        subtitle: 'Поверніться на нову вкладку, щоб продовжити',
        subtitleNewTab: 'Повернутися до попередньої вкладки для продовження',
      },
    },
    emailCode: {
      title: 'Підтвердіть свою електронну пошту',
      subtitle: 'продовжити до {{applicationName}}',
      formTitle: 'Код підтвердження',
      formSubtitle: 'Введіть код підтвердження, надісланий на вашу електронну адресу',
      resendButton: 'Не отримали код? Повторно відправити',
    },
    phoneCode: {
      title: 'Підтвердіть свій телефон',
      subtitle: 'продовжити з {{applicationName}}',
      formTitle: 'Код підтвердження',
      formSubtitle: 'Введіть код підтвердження, надісланий на ваш номер телефону',
      resendButton: 'Не отримали код? Повторно відправити',
    },
    continue: {
      title: 'Заповніть усі поля',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      actionText: 'Уже є акаунт?',
      actionLink: 'Увійти',
    },
  },
  signIn: {
    start: {
      title: 'Увійти',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      actionText: 'Немає акаунта?',
      actionLink: 'Зареєструватися',
      actionLink__use_email: 'Використовувати пошту',
      actionLink__use_phone: 'Використовувати номер телефону',
      actionLink__use_username: `Використовувати ім'я користувача`,
      actionLink__use_email_username: `Використовувати пошту або ім'я користувача`,
    },
    password: {
      title: 'Введіть пароль',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      actionLink: 'Використати інший метод',
    },
    forgotPasswordAlternativeMethods: {
      title: 'Забули пароль?',
      label__alternativeMethods: 'Або, увійти іншим способом',
      blockButton__resetPassword: 'Відновити пароль',
    },
    forgotPassword: {
      title_email: 'Перевірте пошту',
      title_phone: 'Перевірте телефон',
      subtitle: 'щоб відновити пароль',
      formTitle: 'Код відновлення пароля',
      formSubtitle_email: 'Введіть код, відправлений Вам на пошту',
      formSubtitle_phone: 'Введіть код, відправлений Вам на телефон',
      resendButton: 'Надіслати код ще раз',
    },
    resetPassword: {
      title: 'Скинути пароль',
      formButtonPrimary: 'Скинути пароль',
      successMessage: 'Ваш пароль успішно змінено. Виконується вхід, зачекайте.',
    },
    resetPasswordMfa: {
      detailsLabel: 'Необхідно верифікувати вашу особу перед відновленням пароля',
    },
    emailCode: {
      title: 'Перевірте свою електронну пошту',
      subtitle: 'продовжити до {{applicationName}}',
      formTitle: 'Код підтвердження',
      formSubtitle: 'Введіть код підтвердження, надісланий на Вашу електронну адресу',
      resendButton: 'Не отримали код? Повторно відправити',
    },
    emailLink: {
      title: 'Перевірте Вашу пошту',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      formTitle: 'Посилання для підтвердження',
      formSubtitle: 'Використовуйте посилання для підтвердження, надіслане на Вашу електронну пошту',
      resendButton: 'Перевідправити посилання',
      unusedTab: {
        title: 'Вкладку можна закрити',
      },
      verified: {
        title: 'Успішний вхід',
        subtitle: 'Ви скоро будете перенаправлені',
      },
      verifiedSwitchTab: {
        subtitle: 'Поверніться на попередню вкладку, щоб продовжити',
        titleNewTab: 'Ви ввійшли на іншій вкладці',
        subtitleNewTab: 'Поверніться до щойно відкритої вкладки, щоб продовжити',
      },
      loading: {
        title: 'Вхід в систему...',
        subtitle: 'Вас буде перенаправлено найближчим часом',
      },
      failed: {
        title: 'Це посилання для підтвердження є недійсним',
        subtitle: 'Поверніться на початкову вкладку, щоб продовжити',
      },
      expired: {
        title: 'Термін дії цього посилання для підтвердження закінчився',
        subtitle: 'Поверніться на початкову вкладку, щоб продовжити.',
      },
    },
    phoneCode: { ...commonTexts.signIn.phoneCode },
    phoneCodeMfa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totpMfa: {
      title: 'Двоетапна перевірка',
      subtitle: '',
      formTitle: 'Верифікаційний код',
      formSubtitle: 'Введіть верифікаційний код з Вашого аутентифікатора',
    },
    backupCodeMfa: {
      title: 'Введіть код відновлення',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      formTitle: '',
      formSubtitle: '',
    },
    alternativeMethods: {
      title: 'Використовувати інший метод',
      actionLink: 'Допомога',
      blockButton__emailLink: 'Надіслати посилання на {{identifier}}',
      blockButton__emailCode: 'Надіслати код на {{identifier}}',
      blockButton__phoneCode: 'Надіслати код на {{identifier}}',
      blockButton__password: 'Увійти з паролем',
      blockButton__totp: 'Використовуйте аутентифікатор',
      blockButton__backupCode: 'Використовуйте код відновлення',
      getHelp: {
        title: 'Допомога',
        content:
          'Якщо у вас виникли труднощі з входом у Ваш акаунт, напишіть нам, і ми попрацюємо з Вами, щоб відновити доступ якнайшвидше.',
        blockButton__emailSupport: 'Написати в підтримку',
      },
    },
    noAvailableMethods: {
      title: 'Не вдалося увійти',
      subtitle: 'Виникла помилка',
      message: 'Не вдається виконати вхід. Немає доступного фактору автентифікації.',
    },
  },
  userProfile: {
    mobileButton__menu: 'Меню',
    formButtonPrimary__continue: 'Продовжити',
    formButtonPrimary__finish: 'Завершити',
    formButtonReset: 'Скасувати',
    start: {
      headerTitle__account: 'Обліковий запис',
      headerTitle__security: 'Безпека',
      headerSubtitle__account: 'Керування інформацією про обліковий запис',
      headerSubtitle__security: 'Керування налаштуваннями безпеки',
      profileSection: {
        title: 'Профіль',
      },
      usernameSection: {
        title: `Ім'я користувача`,
        primaryButton__changeUsername: `Змінити ім'я користувача`,
        primaryButton__setUsername: `Встановити ім'я користувача`,
      },
      emailAddressesSection: {
        title: 'Адреси електронної пошти',
        primaryButton: 'Додати адресу електронної пошти',
        detailsTitle__primary: 'Основна адреса електронної пошти',
        detailsSubtitle__primary: 'Ця адреса електронної пошти є основною',
        detailsAction__primary: 'Завершити перевірку',
        detailsTitle__nonPrimary: 'Встановити як основну адресу електронної пошти',
        detailsSubtitle__nonPrimary:
          'Встановіть цю адресу електронної пошти як основну, щоб отримувати повідомлення щодо вашого облікового запису.',
        detailsAction__nonPrimary: 'Встановити як основну',
        detailsTitle__unverified: 'Неперевірена адреса електронної пошти',
        detailsSubtitle__unverified: 'Ця адреса електронної пошти не була перевірена і може мати обмежений функціонал',
        detailsAction__unverified: 'Завершити перевірку',
        destructiveActionTitle: 'Видалити',
        destructiveActionSubtitle: 'Видалити цю адресу електронної пошти та видалити її з вашого облікового запису',
        destructiveAction: 'Видалити адресу електронної пошти',
      },
      phoneNumbersSection: {
        title: 'Номери телефонів',
        primaryButton: 'Додати номер телефону',
        detailsTitle__primary: 'Основний номер телефону',
        detailsSubtitle__primary: 'Цей номер телефону є основним номером телефону',
        detailsAction__primary: 'Завершити верифікацію',
        detailsTitle__nonPrimary: 'Встановити як основний номер телефону',
        detailsSubtitle__nonPrimary:
          'Встановіть цей номер телефону як основний для отримання повідомлень щодо вашого облікового запису.',
        detailsAction__nonPrimary: 'Встановити як основний',
        detailsTitle__unverified: 'Непідтверджений номер телефону',
        detailsSubtitle__unverified: 'Цей номер телефону не був підтверджений і може бути обмежений у функціональності',
        detailsAction__unverified: 'Завершити верифікацію',
        destructiveActionTitle: 'Видалити',
        destructiveActionSubtitle: 'Видаліть цей номер телефону і видаліть його зі свого облікового запису',
        destructiveAction: 'Видалити номер телефону',
      },
      connectedAccountsSection: {
        title: 'Підключені акаунти',
        primaryButton: 'Підключити акаунт',
        title__conectionFailed: 'Повторна спроба підключення',
        title__connectionFailed: 'Повторна спроба підключення',
        title__reauthorize: 'Потрібна повторна авторизація',
        subtitle__reauthorize:
          'Потрібна повторна авторизація цієї програми через оновлення необхідних областей видимості, і ви можете зіткнутися з обмеженою функціональністю. Будь ласка, повторно авторизуйте цю програму, щоб уникнути проблем',
        actionLabel__conectionFailed: 'Спробувати знову',
        actionLabel__connectionFailed: 'Спробувати знову',
        actionLabel__reauthorize: 'Авторизувати зараз',
        destructiveActionTitle: 'Видалити',
        destructiveActionSubtitle: 'Видаліть цей підключений акаунт зі свого облікового запису',
        destructiveActionAccordionSubtitle: 'Видалити підключений акаунт',
      },
      passwordSection: {
        title: 'Пароль',
        primaryButton__changePassword: 'Змінити пароль',
        primaryButton__setPassword: 'Встановити пароль',
      },
      mfaSection: {
        title: 'Двофакторна аутентифікація',
        primaryButton: 'Додати двофакторну аутентифікацію',
        phoneCode: {
          destructiveActionTitle: 'Видалити',
          destructiveActionSubtitle: 'Видалити цей номер телефону з методів двофакторної аутентифікації',
          destructiveActionLabel: 'Видалити номер телефону',
          title__default: 'Фактор за замовчуванням',
          title__setDefault: 'Встановити як фактор за замовчуванням',
          subtitle__default:
            'Цей фактор буде використовуватися як метод двофакторної аутентифікації за замовчуванням при вході в систему.',
          subtitle__setDefault:
            'Встановіть цей фактор як фактор за замовчуванням, щоб використовувати його як метод двофакторної аутентифікації за замовчуванням під час входу в систему.',
          actionLabel__setDefault: 'Встановити за замовчуванням',
        },
        backupCodes: {
          headerTitle: 'Резервні коди',
          title__regenerate: 'Згенерувати нові резервні коди',
          subtitle__regenerate:
            'Отримайте новий набір безпечних резервних кодів. Попередні резервні коди будуть видалені і не можуть бути використані.',
          actionLabel__regenerate: 'Згенерувати коди',
        },
        totp: {
          headerTitle: 'Додаток аутентифікації',
          title: 'Фактор за замовчуванням',
          subtitle:
            'Цей фактор буде використовуватися як метод двофакторної аутентифікації за замовчуванням при вході в систему.',
          destructiveActionTitle: 'Видалити',
          destructiveActionSubtitle: 'Видалити додаток автентифікації з методів двофакторної автентифікації',
          destructiveActionLabel: 'Видалити додаток аутентифікації',
        },
      },
      activeDevicesSection: {
        title: 'Активні пристрої',
        primaryButton: 'Активні пристрої',
        detailsTitle: 'Поточний пристрій',
        detailsSubtitle: 'Це пристрій, який ви використовуєте зараз',
        destructiveActionTitle: 'Вийти',
        destructiveActionSubtitle: 'Вийти з облікового запису на цьому пристрої',
        destructiveAction: 'Вийти з пристрою',
      },
      web3WalletsSection: {
        title: 'Web3 гаманці',
        primaryButton: 'Web3 гаманці',
        destructiveActionTitle: 'Видалити',
        destructiveActionSubtitle: 'Видалити цей Web3 гаманець з вашого облікового запису',
        destructiveAction: 'Видалити гаманець',
      },
      dangerSection: {
        title: 'Небезпека',
        deleteAccountButton: 'Видалити акаунт',
        deleteAccountTitle: 'Видалити акаунт',
        deleteAccountDescription: `Видалити ваш акаунт та всі пов'язані з ним дані`,
      },
    },
    profilePage: {
      title: 'Оновити профіль',
      imageFormTitle: 'Зображення профілю',
      imageFormSubtitle: 'Завантажити зображення',
      imageFormDestructiveActionSubtitle: 'Видалити зображення',
      fileDropAreaTitle: 'Перетягніть файл сюди або...',
      fileDropAreaAction: 'Виберіть файл',
      fileDropAreaHint: 'Завантажте зображення у форматах JPG, PNG, GIF або WEBP розміром менше 10 МБ',
      successMessage: 'Ваш профіль було оновлено.',
    },
    usernamePage: {
      title: `Оновити ім'я користувача`,
      successMessage: `Ім'я користувача було оновлено.`,
    },
    emailAddressPage: {
      title: 'Додати адресу електронної пошти',
      emailCode: {
        formHint: 'На цю адресу електронної пошти буде надіслано лист із верифікаційним кодом.',
        formTitle: 'Верифікаційний код',
        formSubtitle: 'Введіть верифікаційний код, відправлений на {{identifier}}',
        resendButton: 'Надіслати код повторно',
        successMessage: 'Адресу електронної пошти {{identifier}} було додано до вашого облікового запису.',
      },
      emailLink: {
        formHint: 'На цю адресу електронної пошти буде надіслано верифікаційне посилання.',
        formTitle: 'Верифікаційне посилання',
        formSubtitle: 'Натисніть на верифікаційне посилання в листі, відправленому на {{identifier}}',
        resendButton: 'Надіслати посилання повторно',
        successMessage: 'Адресу електронної пошти {{identifier}} було додано до вашого облікового запису.',
      },
      removeResource: {
        title: 'Видалити адресу електронної пошти',
        messageLine1: '{{identifier}} буде видалено з цього акаунта.',
        messageLine2: 'Ви більше не зможете увійти з використанням цієї адреси електронної пошти.',
        successMessage: '{{emailAddress}} було видалено з вашого облікового запису.',
      },
    },
    phoneNumberPage: {
      title: 'Додати номер телефону',
      successMessage: '{{identifier}} було додано до вашого облікового запису.',
      infoText: 'На цей номер телефону буде надіслано текстове повідомлення з верифікаційним посиланням.',
      infoText__secondary: 'Можуть бути застосовані тарифи на повідомлення і дані.',
      removeResource: {
        title: 'Видалити номер телефону',
        messageLine1: '{{identifier}} буде видалено з цього облікового запису.',
        messageLine2: 'Ви більше не зможете увійти, використовуючи цей номер телефону.',
        successMessage: '{{phoneNumber}} було видалено з вашого облікового запису.',
      },
    },
    connectedAccountPage: {
      title: 'Додати підключений акаунт',
      formHint: 'Виберіть провайдера для підключення вашого акаунта.',
      formHint__noAccounts: 'Немає доступних провайдерів зовнішніх акаунтів.',
      socialButtonsBlockButton: 'Підключити акаунт {{provider|titleize}}',
      successMessage: 'Провайдера було додано до вашого акаунта',
      removeResource: {
        title: 'Видалити підключений акаунт',
        messageLine1: '{{identifier}} буде видалено з вашого облікового запису.',
        messageLine2:
          'Ви більше не зможете використовувати цей підключений акаунт, і будь-які залежні функції більше не працюватимуть.',
        successMessage: '{{connectedAccount}} було видалено з вашого облікового запису.',
      },
    },
    web3WalletPage: {
      title: 'Додати web3 гаманець',
      subtitle__availableWallets: 'Виберіть web3 гаманець для підключення до вашого облікового запису.',
      subtitle__unavailableWallets: 'Немає доступних web3 гаманців.',
      successMessage: 'Гаманець було додано до вашого облікового запису.',
      removeResource: {
        title: 'Видалити web3 гаманець',
        messageLine1: '{{identifier}} буде видалено з цього облікового запису.',
        messageLine2: 'Ви більше не зможете Увійти з використанням цього web3 гаманця.',
        successMessage: '{{web3Wallet}} було видалено з вашого облікового запису.',
      },
    },
    passwordPage: {
      title: 'Встановити пароль',
      changePasswordTitle: 'Змінити пароль',
      successMessage: 'Ваш пароль встановлено.',
      changePasswordSuccessMessage: 'Ваш пароль було оновлено.',
      sessionsSignedOutSuccessMessage: 'Усі інші пристрої були виведені із системи.',
    },
    mfaPage: {
      title: 'Додати двофакторну аутентифікацію',
      formHint: 'Виберіть метод для додавання.',
    },
    mfaTOTPPage: {
      title: 'Додати додаток аутентифікації',
      verifyTitle: 'Верифікаційний код',
      verifySubtitle: 'Введіть верифікаційний код, створений вашим додатком аутентифікації',
      successMessage:
        'Двоетапна перевірка ввімкнена. Під час входу в систему вам потрібно буде ввести верифікаційний код із цього додатка як додатковий крок.',
      authenticatorApp: {
        infoText__ableToScan: `Налаштуйте новий метод входу у вашому застосунку аутентифікації та відскануйте наступний QR-код, щоб пов'язати його з вашим обліковим записом.`,
        infoText__unableToScan:
          'Налаштуйте новий метод входу у вашому застосунку автентифікації та введіть нижче наданий ключ.',
        inputLabel__unableToScan1: `Переконайтеся, що ввімкнено одноразові паролі на основі часу, потім завершіть зв'язування свого облікового запису.`,
        inputLabel__unableToScan2:
          'Крім того, якщо ваш додаток аутентифікації підтримує URI TOTP, ви також можете скопіювати повний URI.',
        buttonAbleToScan__nonPrimary: 'Замість цього відскануйте QR-код',
        buttonUnableToScan__nonPrimary: 'Не вдається відсканувати QR-код?',
      },
      removeResource: {
        title: 'Видалення двоетапної аутентифікації',
        messageLine1:
          'Верифікаційний код із цього додатка автентифікації більше не буде потрібен під час входу в систему.',
        messageLine2: 'Ваш акаунт буде менш захищеним. Ви впевнені, що хочете продовжити?',
        successMessage: 'Двоетапну автентифікацію через застосунок автентифікації було видалено.',
      },
    },
    mfaPhoneCodePage: {
      title: 'Додати перевірку кодом з SMS',
      primaryButton__addPhoneNumber: 'Додати номер телефону',
      subtitle__availablePhoneNumbers: 'Виберіть номер телефону для реєстрації у двоетапній перевірці з кодом з SMS.',
      subtitle__unavailablePhoneNumbers:
        'Немає доступних номерів телефону для реєстрації в двоетапній перевірці з кодом з SMS.',
      successMessage:
        'Двоетапна перевірка з кодом з SMS увімкнена для цього номера телефону. Під час входу в систему вам потрібно буде ввести код підтвердження, надісланий на цей номер телефону як додатковий крок.',
      removeResource: {
        title: 'Видалити двоетапну перевірку',
        messageLine1: '{{identifier}} більше не буде отримувати коди підтвердження при вході в систему.',
        messageLine2: 'Ваш обліковий запис буде менш захищеним. Ви впевнені, що хочете продовжити?',
        successMessage: 'Двоетапна перевірка з кодом з SMS була видалена для {{mfaPhoneCode}}',
      },
    },
    backupCodePage: {
      title: 'Додати резервний код підтвердження',
      title__codelist: 'Резервні коди',
      subtitle__codelist: 'Зберігайте їх у безпеці та не повідомляйте нікому.',
      infoText1: 'Резервні коди будуть включені для цього облікового запису.',
      infoText2:
        'Зберігайте резервні коди в таємниці та зберігайте їх у безпеці. Ви можете створити нові резервні коди, якщо підозрюєте, що вони були скомпрометовані.',
      successSubtitle:
        'Ви можете використовувати один із цих кодів для входу у свій обліковий запис, якщо ви втратите доступ до свого аутентифікаційного пристрою.',
      successMessage:
        'Резервні коди ввімкнено. Ви можете використовувати один із цих кодів для входу до свого облікового запису, якщо ви втратите доступ до свого аутентифікаційного пристрою. Кожен код може бути використаний тільки один раз.',
      actionLabel__copy: 'Копіювати все',
      actionLabel__copied: 'Скопійовано!',
      actionLabel__download: 'Завантажити .txt',
      actionLabel__print: 'Друк',
    },
    deletePage: {
      title: 'Видалити акаунт',
      messageLine1: 'Ви впевнені, що хочете видалити свій акаунт?',
      messageLine2: 'Ця дія є остаточною та незворотною.',
      actionDescription: 'Введіть "Видалити акаунт" нижче, щоб продовжити.',
      confirm: 'Видалити акаунт',
    },
  },
  userButton: {
    action__manageAccount: 'Управління акаунтом',
    action__signOut: 'Вийти',
    action__signOutAll: 'Вийти з усіх акаунтів',
    action__addAccount: 'Додати акаунт',
  },
  organizationSwitcher: {
    personalWorkspace: 'Особистий робочий простір',
    notSelected: 'Організація не обрана',
    action__createOrganization: 'Створити організацію',
    action__manageOrganization: 'Управління організацією',
  },
  impersonationFab: {
    title: 'Ви увійшли як {{identifier}}',
    action__signOut: 'Вийти',
  },
  organizationProfile: {
    start: {
      headerTitle__members: 'Учасники',
      headerTitle__settings: 'Налаштування',
      headerSubtitle__members: 'Перегляд і управління учасниками організації',
      headerSubtitle__settings: 'Управління налаштуваннями організації',
    },
    profilePage: {
      title: 'Профіль організації',
      subtitle: 'Управління профілем організації',
      successMessage: 'Організацію було оновлено.',
      dangerSection: {
        title: 'Небезпека',
        leaveOrganization: {
          title: 'Покинути організацію',
          messageLine1:
            'Ви впевнені, що хочете покинути цю організацію? Ви втратите доступ до цієї організації та її додатків.',
          messageLine2: 'Ця дія є постійною і незворотною.',
          successMessage: 'Ви покинули організацію.',
        },
      },
    },
    invitePage: {
      title: 'Запросити учасників',
      subtitle: 'Запросіть нових учасників до цієї організації',
      successMessage: 'Запрошення успішно надіслано',
      detailsTitle__inviteFailed: 'Запрошення не вдалося надіслати. Виправте наступне і повторіть спробу:',
      formButtonPrimary__continue: 'Надіслати запрошення',
    },
    membersPage: {
      detailsTitle__emptyRow: 'Немає учасників для відображення',
      action__invite: 'Запросити',
      start: {
        headerTitle__active: 'Активні',
        headerTitle__invited: 'Запрошені',
      },
      activeMembersTab: {
        tableHeader__user: 'Користувач',
        tableHeader__joined: 'Приєднався',
        tableHeader__role: 'Роль',
        tableHeader__actions: '',
        menuAction__remove: 'Видалити учасника',
      },
      invitedMembersTab: {
        tableHeader__invited: 'Запрошені',
        menuAction__revoke: 'Відкликати запрошення',
      },
    },
  },
  createOrganization: {
    title: 'Створити організацію',
    formButtonSubmit: 'Створити організацію',
    invitePage: {
      formButtonReset: 'Пропустити',
    },
  },
  unstable__errors: {
    form_identifier_not_found: '',
    form_password_pwned: 'Цей пароль було зламано і його не можна використовувати, спробуйте інший пароль.',
    form_password_validation_failed: 'Невірний пароль',
    form_password_not_strong_enough: 'Ваш пароль недостатньо надійний.',
    form_password_size_in_bytes_exceeded:
      'Ваш пароль перевищує максимально допустиму кількість байтів, скоротіть його або видаліть деякі спеціальні символи.',
    form_username_invalid_length: '',
    form_username_invalid_character: '',
    form_param_format_invalid: '',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
    form_password_incorrect: '',
    not_allowed_access: '',
    form_identifier_exists: '',
    passwordComplexity: {
      sentencePrefix: 'Ваш пароль повинен містити',
      minimumLength: '{{length}} або більше символів',
      maximumLength: 'менше {{length}} символів',
      requireNumbers: 'цифру',
      requireLowercase: 'букву в нижньому регістрі',
      requireUppercase: 'букву у верхньому регістрі',
      requireSpecialCharacter: 'спеціальний символ',
    },
    zxcvbn: {
      notEnough: 'Ваш пароль недостатньо надійний.',
      couldBeStronger: 'Ваш пароль підходить, але міг би бути надійнішим. Спробуйте додати більше символів.',
      goodPassword: 'Хороша робота. Це відмінний пароль.',
      warnings: {
        straightRow: 'Прямі ряди клавіш на клавіатурі легко вгадати.',
        keyPattern: 'Короткі поєднання клавіш легко вгадати.',
        simpleRepeat: 'Символи, що повторюються, такі як "aaa", легко вгадати.',
        extendedRepeat: 'Шаблони символів, що повторюються, такі як "abcabcabcabc", легко вгадати.',
        sequences: 'Часті послідовності символів, такі як "abc", легко вгадати.',
        recentYears: 'Останні роки легко вгадати.',
        dates: 'Дати легко вгадати.',
        topTen: 'Це дуже часто використовуваний пароль.',
        topHundred: 'Це часто використовуваний пароль.',
        common: 'Це поширений пароль.',
        similarToCommon: 'Цей пароль схожий на часто використовуваний пароль.',
        wordByItself: 'Окремі слова легко вгадати.',
        namesByThemselves: 'Одні імена або прізвища легко вгадати.',
        commonNames: 'Поширені імена та прізвища легко вгадати.',
        userInputs: `Не повинно бути ніяких особистих даних або даних, пов'язаних зі сторінкою.`,
        pwned: 'Ваш пароль було розкрито внаслідок витоку даних в Інтернеті.',
      },
      suggestions: {
        l33t: 'Уникайте передбачуваних замін букв, таких як "@" замість "a".',
        reverseWords: 'Уникайте зворотного написання часто використовуваних слів.',
        allUppercase: 'Робіть великими деякі, але не всі букви.',
        capitalization: 'Робіть великими не тільки першу букву',
        dates: `Уникайте дат і років, які пов'язані з вами.`,
        recentYears: 'Уникайте останніх років.',
        associatedYears: `Уникайте років, які пов'язані з вами.`,
        sequences: 'Уникайте частих послідовностей символів.',
        repeated: 'Уникайте повторюваних слів і символів.',
        longerKeyboardPattern: 'Використовуйте довші поєднання клавіш і кілька разів змінюйте напрямок введення.',
        anotherWord: 'Додайте більше слів, які менш поширені.',
        useWords: 'Використовуйте кілька слів, але уникайте поширених фраз.',
        noNeed: 'Ви можете створювати надійні паролі без використання символів, цифр або великих літер.',
        pwned: 'Якщо ви використовуєте цей пароль в іншому місці, вам слід змінити його.',
      },
    },
  },
  dates: {
    previous6Days: "Останній {{ date | weekday('uk-UA','long') }} в {{ date | timeString('uk-UA') }}",
    lastDay: "Вчора в {{ date | timeString('uk-UA') }}",
    sameDay: "Сьогодні в {{ date | timeString('uk-UA') }}",
    nextDay: "Завтра в {{ date | timeString('uk-UA') }}",
    next6Days: "{{ date | weekday('uk-UA','long') }} в {{ date | timeString('uk-UA') }}",
    numeric: "{{ date | numeric('uk-UA') }}",
  },
} as const;
