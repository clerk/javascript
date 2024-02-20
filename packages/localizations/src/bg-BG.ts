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

export const bgBG: LocalizationResource = {
  locale: 'bg-BG',
  backButton: 'Назад',
  badge__default: 'По подразбиране',
  badge__otherImpersonatorDevice: 'Друго устройство за имитация',
  badge__primary: 'Основен',
  badge__requiresAction: 'Изисква действие',
  badge__thisDevice: 'Това устройство',
  badge__unverified: 'Непотвърден',
  badge__userDevice: 'Потребителско устройство',
  badge__you: 'Вие',
  createOrganization: {
    formButtonSubmit: 'Създаване на организация',
    invitePage: {
      formButtonReset: 'Пропусни',
    },
    title: 'Създаване на организация',
  },
  dates: {
    lastDay: "Вчера в {{ date | timeString('bg-BG') }}",
    next6Days: "{{ date | weekday('bg-BG','long') }} в {{ date | timeString('bg-BG') }}",
    nextDay: "Утре в {{ date | timeString('bg-BG') }}",
    numeric: "{{ date | numeric('bg-BG') }}",
    previous6Days: "Последно в {{ date | weekday('bg-BG','long') }} в {{ date | timeString('bg-BG') }}",
    sameDay: "Днес в {{ date | timeString('bg-BG') }}",
  },
  dividerText: 'или',
  footerActionLink__useAnotherMethod: 'Използвайте друг метод',
  footerPageLink__help: 'Помощ',
  footerPageLink__privacy: 'Поверителност',
  footerPageLink__terms: 'Условия',
  formButtonPrimary: 'Продължи',
  formButtonPrimary__verify: 'Потвърди',
  formFieldAction__forgotPassword: 'Забравена парола?',
  formFieldError__matchingPasswords: 'Паролите съвпадат.',
  formFieldError__notMatchingPasswords: 'Паролите не съвпадат.',
  formFieldError__verificationLinkExpired: 'Линкът за потвърждение е изтекъл. Моля, заявете нов линк.',
  formFieldHintText__optional: 'По избор',
  formFieldHintText__slug: 'Slug е четим идентификатор, който трябва да бъде уникален. Често се използва в URL адреси.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Изтрий акаунта',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__organizationDomain: '',
  formFieldInputPlaceholder__organizationDomainEmailAddress: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldInputPlaceholder__organizationSlug: '',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldLabel__automaticInvitations: 'Включи автоматични покани за този домейн',
  formFieldLabel__backupCode: 'Резервен код',
  formFieldLabel__confirmDeletion: 'Потвърждение',
  formFieldLabel__confirmPassword: 'Потвърдете паролата',
  formFieldLabel__currentPassword: 'Текуща парола',
  formFieldLabel__emailAddress: 'Имейл адрес',
  formFieldLabel__emailAddress_username: 'Имейл адрес или потребителско име',
  formFieldLabel__emailAddresses: 'Имейл адреси',
  formFieldLabel__firstName: 'Име',
  formFieldLabel__lastName: 'Фамилия',
  formFieldLabel__newPassword: 'Нова парола',
  formFieldLabel__organizationDomain: 'Домейн',
  formFieldLabel__organizationDomainDeletePending: 'Изтриване на изчакващи покани и предложения',
  formFieldLabel__organizationDomainEmailAddress: 'Имейл адрес за потвърждение',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Въведете имейл адрес под този домейн, за да получите код и да потвърдите домейна.',
  formFieldLabel__organizationName: 'Име',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__password: 'Парола',
  formFieldLabel__phoneNumber: 'Телефонен номер',
  formFieldLabel__role: 'Роля',
  formFieldLabel__signOutOfOtherSessions: 'Изход от всички други устройства',
  formFieldLabel__username: 'Потребителско име',
  impersonationFab: {
    action__signOut: 'Изход',
    title: 'Влезли сте като {{identifier}}',
  },
  membershipRole__admin: 'Админ',
  membershipRole__basicMember: 'Член',
  membershipRole__guestMember: 'Гост',
  organizationList: {
    action__createOrganization: 'Създаване на организация',
    action__invitationAccept: 'Присъединяване',
    action__suggestionsAccept: 'Заявка за присъединяване',
    createOrganization: 'Създаване на организация',
    invitationAcceptedLabel: 'Присъединен',
    subtitle: 'за продължаване към {{applicationName}}',
    suggestionsAcceptedLabel: 'Чакащо одобрение',
    title: 'Изберете акаунт',
    titleWithoutPersonal: 'Изберете организация',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Автоматични покани',
    badge__automaticSuggestion: 'Автоматични предложения',
    badge__manualInvitation: 'Няма автоматично включване',
    badge__unverified: 'Неверифициран',
    createDomainPage: {
      subtitle:
        'Добавете домейн за верификация. Потребителите с имейл адреси на този домейн могат да се присъединят към организацията автоматично или да заявят да се присъединят.',
      title: 'Добавяне на домейн',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Поканите не могат да бъдат изпратени. Вече има чакащи покани за следните имейл адреси: {{email_addresses}}.',
      formButtonPrimary__continue: 'Изпращане на покани',
      selectDropdown__role: 'Select role',
      subtitle: 'Въведете или поставете един или повече имейл адреси, разделени с интервали или запетая.',
      successMessage: 'Поканите бяха успешно изпратени',
      title: 'Покана за нови членове',
    },
    membersPage: {
      action__invite: 'Покани',
      activeMembersTab: {
        menuAction__remove: 'Премахване на член',
        tableHeader__actions: '',
        tableHeader__joined: 'Присъединил се',
        tableHeader__role: 'Роля',
        tableHeader__user: 'Потребител',
      },
      detailsTitle__emptyRow: 'Няма членове за показване',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Поканете потребители, свързващи имейл домейн с вашата организация. Всеки, който се регистрира със съответния имейл домейн, ще може да се присъедини към организацията по всяко време.',
          headerTitle: 'Автоматични покани',
          primaryButton: 'Управление на верифицираните домейни',
        },
        table__emptyRow: 'Няма покани за показване',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Отмяна на поканата',
        tableHeader__invited: 'Поканени',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Потребители, които се регистрират със съответния имейл домейн, ще видят предложение за заявка за присъединяване към вашата организация.',
          headerTitle: 'Автоматични предложения',
          primaryButton: 'Управление на верифицираните домейни',
        },
        menuAction__approve: 'Одобрение',
        menuAction__reject: 'Отхвърляне',
        tableHeader__requested: 'Заявен достъп',
        table__emptyRow: 'Няма заявки за показване',
      },
      start: {
        headerTitle__invitations: 'Покани',
        headerTitle__members: 'Членове',
        headerTitle__requests: 'Заявки',
      },
    },
    navbar: {
      description: 'Управление на вашата организация.',
      general: 'Общи',
      members: 'Членове',
      title: 'Организация',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Въведете "{{organizationName}}" по-долу, за да продължите.',
          messageLine1: 'Сигурни ли сте, че искате да изтриете тази организация?',
          messageLine2: 'Това действие е перманентно и необратимо.',
          successMessage: 'Изтрихте организацията.',
          title: 'Изтриване на организацията',
        },
        leaveOrganization: {
          actionDescription: 'Въведете "{{organizationName}}" по-долу, за да продължите.',
          messageLine1:
            'Сигурни ли сте, че искате да напуснете тази организация? Ще загубите достъп до тази организация и нейните приложения.',
          messageLine2: 'Това действие е перманентно и необратимо.',
          successMessage: 'Излязохте от организацията.',
          title: 'Напускане на организацията',
        },
        title: 'Опасност',
      },
      domainSection: {
        menuAction__manage: 'Manage',
        menuAction__remove: 'Delete',
        menuAction__verify: 'Verify',
        primaryButton: 'Добавяне на домейн',
        subtitle:
          'Позволява на потребителите да се присъединяват към организацията автоматично или да заявят да се присъединят на база верифициран имейл домейн.',
        title: 'Верифицирани домейни',
      },
      successMessage: 'Организацията е актуализирана.',
      title: 'Актуализиране на профила',
    },
    removeDomainPage: {
      messageLine1: 'Имейл домейнът {{domain}} ще бъде премахнат.',
      messageLine2: 'Потребителите няма да могат да се присъединяват автоматично към организацията след това.',
      successMessage: '{{domain}} беше премахнат.',
      title: 'Премахване на домейн',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Членове',
      profileSection: {
        primaryButton: 'Edit profile',
        title: 'Organization Profile',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Премахването на този домейн ще засегне поканени потребители.',
        removeDomainActionLabel__remove: 'Премахване на домейн',
        removeDomainSubtitle: 'Премахнете този домейн от верифицираните си домейни',
        removeDomainTitle: 'Премахване на домейн',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Потребителите се поканват автоматично да се присъединят към организацията, когато се регистрират и могат да се присъединят по всяко време.',
        automaticInvitationOption__label: 'Автоматични покани',
        automaticSuggestionOption__description:
          'Потребителите получават предложение да заявят да се присъединят, но трябва да бъдат одобрени от администратор, преди да могат да се присъединят към организацията.',
        automaticSuggestionOption__label: 'Автоматични предложения',
        calloutInfoLabel: 'Промяната на режима на записване ще засегне само новите потребители.',
        calloutInvitationCountLabel: 'Чакащи покани, изпратени на потребители: {{count}}',
        calloutSuggestionCountLabel: 'Чакащи предложения, изпратени на потребители: {{count}}',
        formButton__save: 'Запазване',
        manualInvitationOption__description: 'Потребителите могат да бъдат поканени само ръчно в организацията.',
        manualInvitationOption__label: 'Без автоматично записване',
        subtitle: 'Изберете как потребителите от този домейн могат да се присъединят към организацията.',
      },
      start: {
        headerTitle__danger: 'Опасност',
        headerTitle__enrollment: 'Опции за записване',
      },
      subtitle: 'Домейнът {{domain}} вече е верифициран. Продължете, като изберете режим на записване.',
      title: 'Актуализиране на {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Въведете кода за верификация, изпратен на вашия имейл адрес',
      formTitle: 'Код за верификация',
      resendButton: 'Не сте получили код? Изпрати отново',
      subtitle: 'Домейнът {{domainName}} трябва да бъде верифициран чрез имейл.',
      subtitleVerificationCodeScreen:
        'Беше изпратен код за верификация на {{emailAddress}}. Въведете кода, за да продължите.',
      title: 'Верификация на домейн',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Създаване на организация',
    action__invitationAccept: 'Присъединяване',
    action__manageOrganization: 'Управление',
    action__suggestionsAccept: 'Заявка за присъединяване',
    notSelected: 'Няма избрана организация',
    personalWorkspace: 'Личен акаунт',
    suggestionsAcceptedLabel: 'Чакащо одобрение',
  },
  paginationButton__next: 'Следващ',
  paginationButton__previous: 'Предишен',
  paginationRowText__displaying: 'Показване на',
  paginationRowText__of: 'от',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Получете помощ',
      actionText: 'Нямате нито един от тях?',
      blockButton__backupCode: 'Използвай резервен код',
      blockButton__emailCode: 'Изпрати код по имейл до {{identifier}}',
      blockButton__emailLink: 'Изпрати линк по имейл до {{identifier}}',
      blockButton__password: 'Влез с парола',
      blockButton__phoneCode: 'Изпрати SMS код до {{identifier}}',
      blockButton__totp: 'Използвай приложение за удостоверяване',
      getHelp: {
        blockButton__emailSupport: 'Имейл поддръжка',
        content:
          'Ако имате затруднения при влизане в профила си, изпратете ни имейл и ще работим с вас, за да възстановим достъпа възможно най-скоро.',
        title: 'Получи помощ',
      },
      subtitle: 'Имате проблеми? Можете да използвате някой от тези методи за влизане.',
      title: 'Използвайте друг метод',
    },
    backupCodeMfa: {
      subtitle: 'Вашият резервен код е този, който сте получили при настройване на двустепенната аутентикация.',
      title: 'Въведете резервен код',
    },
    emailCode: {
      formTitle: 'Код за потвърждение',
      resendButton: 'Не сте получили код? Изпрати отново',
      subtitle: 'за да продължите към {{applicationName}}',
      title: 'Проверете вашия имейл',
    },
    emailLink: {
      expired: {
        subtitle: 'Върнете се в оригиналния таб, за да продължите.',
        title: 'Този линк за потвърждение е изтекъл',
      },
      failed: {
        subtitle: 'Върнете се в оригиналния таб, за да продължите.',
        title: 'Този линк за потвърждение е невалиден',
      },
      formSubtitle: 'Използвайте линкът за потвърждение, изпратен на вашия имейл адрес',
      formTitle: 'Линк за потвърждение',
      loading: {
        subtitle: 'Ще бъдете пренасочени скоро',
        title: 'Влизане...',
      },
      resendButton: 'Не сте получили линк? Изпрати отново',
      subtitle: 'за да продължите към {{applicationName}}',
      title: 'Проверете вашия имейл',
      unusedTab: {
        title: 'Можете да затворите този таб',
      },
      verified: {
        subtitle: 'Ще бъдете пренасочени скоро',
        title: 'Успешно влезли',
      },
      verifiedSwitchTab: {
        subtitle: 'Върнете се в оригиналния таб, за да продължите',
        subtitleNewTab: 'Върнете се в новоотворения таб, за да продължите',
        titleNewTab: 'Влезнали сте в друг таб',
      },
    },
    forgotPassword: {
      formTitle: 'Код за нулиране на парола',
      resendButton: 'Не сте получили код? Изпрати отново',
      subtitle: 'за да нулирате паролата си',
      subtitle_email: 'Първо, въведете кода, изпратен на вашия имейл',
      subtitle_phone: 'Първо, въведете кода, изпратен на вашия телефон',
      title: 'Нулиране на парола',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Нулирайте вашата парола',
      label__alternativeMethods: 'Или, влезте с друг метод',
      title: 'Забравена парола?',
    },
    noAvailableMethods: {
      message: 'Не може да се продължи с влизането. Няма наличен метод за удостоверяване.',
      subtitle: 'Възникна грешка',
      title: 'Неуспешно влизане',
    },
    password: {
      actionLink: 'Използвайте друг метод',
      subtitle: 'Въведете паролата, свързана с вашия акаунт',
      title: 'Въведете вашата парола',
    },
    phoneCode: {
      formTitle: 'Код за потвърждение',
      resendButton: 'Не сте получили код? Изпрати отново',
      subtitle: 'за да продължите към {{applicationName}}',
      title: 'Проверете вашия телефон',
    },
    phoneCodeMfa: {
      formTitle: 'Код за потвърждение',
      resendButton: 'Не сте получили код? Изпрати отново',
      subtitle: 'За да продължите, моля въведете кода за потвърждение, изпратен на вашия телефон',
      title: 'Проверете вашия телефон',
    },
    resetPassword: {
      formButtonPrimary: 'Нулирай паролата',
      requiredMessage: 'Вече съществува акаунт с непотвърден имейл адрес. Моля, нулирайте паролата си за сигурност.',
      successMessage: 'Паролата ви беше успешно променена. Влизане, моля изчакайте момент.',
      title: 'Задайте нова парола',
    },
    resetPasswordMfa: {
      detailsLabel: 'Трябва да потвърдим вашата самоличност, преди да нулираме паролата ви.',
    },
    start: {
      actionLink: 'Регистрирайте се',
      actionLink__use_email: 'Използвайте имейл',
      actionLink__use_email_username: 'Използвайте имейл или потребителско име',
      actionLink__use_phone: 'Използвайте телефон',
      actionLink__use_username: 'Използвайте потребителско име',
      actionText: 'Нямате акаунт?',
      subtitle: 'Добре дошли обратно! Моля, влезте, за да продължите',
      title: 'Влезте в {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Код за потвърждение',
      subtitle:
        'За да продължите, моля въведете кода за потвърждение, генериран от вашето приложение за удостоверяване',
      title: 'Двустепенна верификация',
    },
  },
  signInEnterPasswordTitle: 'Въведете вашата парола',
  signUp: {
    continue: {
      actionLink: 'Влезте',
      actionText: 'Вече имате акаунт?',
      subtitle: 'Моля, попълнете останалите данни, за да продължите.',
      title: 'Попълнете липсващите полета',
    },
    emailCode: {
      formSubtitle: 'Въведете кода за потвърждение, изпратен на вашия имейл адрес',
      formTitle: 'Код за потвърждение',
      resendButton: 'Не сте получили код? Изпрати отново',
      subtitle: 'Въведете кода за потвърждение, изпратен на вашия имейл',
      title: 'Потвърдете вашия имейл',
    },
    emailLink: {
      formSubtitle: 'Използвайте линка за потвърждение, изпратен на вашия имейл адрес',
      formTitle: 'Линк за потвърждение',
      loading: {
        title: 'Регистриране...',
      },
      resendButton: 'Не сте получили линк? Изпрати отново',
      subtitle: 'за да продължите към {{applicationName}}',
      title: 'Потвърдете вашия имейл',
      verified: {
        title: 'Успешно регистриран',
      },
      verifiedSwitchTab: {
        subtitle: 'Върнете се към новоотворения таб, за да продължите',
        subtitleNewTab: 'Върнете се към предходния таб, за да продължите',
        title: 'Успешно потвърден имейл',
      },
    },
    phoneCode: {
      formSubtitle: 'Въведете кода за потвърждение, изпратен на вашия телефонен номер',
      formTitle: 'Код за потвърждение',
      resendButton: 'Не сте получили код? Изпрати отново',
      subtitle: 'Въведете кода за потвърждение, изпратен на вашия телефон',
      title: 'Потвърдете вашия телефон',
    },
    start: {
      actionLink: 'Влезте',
      actionText: 'Вече имате акаунт?',
      subtitle: 'Добре дошли! Моля, попълнете данните, за да започнете.',
      title: 'Създайте своя акаунт',
    },
  },
  socialButtonsBlockButton: 'Продължи с {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Регистрацията неуспешна поради неуспешни проверки за сигурност. Моля, презаредете страницата, за да опитате отново, или се свържете с поддръжката за повече помощ.',
    captcha_unavailable:
      'Регистрацията неуспешна поради неуспешна валидация на бот. Моля, презаредете страницата, за да опитате отново, или се свържете с поддръжката за повече помощ.',
    form_code_incorrect: '',
    form_identifier_exists: '',
    form_identifier_not_found: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'Имейл адресът трябва да бъде във валиден имейл адрес.',
    form_param_format_invalid__phone_number: 'Телефонният номер трябва да бъде във валиден международен формат',
    form_param_max_length_exceeded__first_name: 'Първото име не трябва да надвишава 256 символа.',
    form_param_max_length_exceeded__last_name: 'Фамилията не трябва да надвишава 256 символа.',
    form_param_max_length_exceeded__name: 'Името не трябва да надвишава 256 символа.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'Вашата парола не е достатъчно сигурна.',
    form_password_pwned: 'Тази парола е част от изтекли данни и не може да се използва. Моля, опитайте с друга парола.',
    form_password_size_in_bytes_exceeded:
      'Паролата ви надвиши максималния брой байтове, позволен, моля, я скратете или премахнете някои специални знаци.',
    form_password_validation_failed: 'Неправилна парола',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: 'Не можете да изтриете последната си идентификация.',
    not_allowed_access: '',
    passwordComplexity: {
      maximumLength: 'по-малко от {{length}} символа',
      minimumLength: '{{length}} или повече символа',
      requireLowercase: 'малка буква',
      requireNumbers: 'число',
      requireSpecialCharacter: 'специален символ',
      requireUppercase: 'главна буква',
      sentencePrefix: 'Вашата парола трябва да съдържа',
    },
    phone_number_exists: 'Този телефонен номер е зает. Моля, опитайте с друг.',
    zxcvbn: {
      couldBeStronger: 'Вашата парола работи, но може да бъде по-сигурна. Опитайте да добавите повече символи.',
      goodPassword: 'Вашата парола отговаря на всички необходими изисквания.',
      notEnough: 'Вашата парола не е достатъчно сигурна.',
      suggestions: {
        allUppercase: 'Направете главни някои, но не всички букви.',
        anotherWord: 'Добавете още думи, които са по-малко обичайни.',
        associatedYears: 'Избягвайте години, свързани с вас.',
        capitalization: 'Напревете главни повече от първата буква.',
        dates: 'Избягвайте дати и години, свързани с вас.',
        l33t: 'Избягвайте предвидими замествания на букви като "@" за "a".',
        longerKeyboardPattern: 'Използвайте по-дълги клавишни шаблони и променяйте посоката на набиране няколко пъти.',
        noNeed: 'Можете да създадете сигурни пароли и без да използвате символи, числа или главни букви.',
        pwned: 'Ако използвате тази парола на друго място, трябва да я промените.',
        recentYears: 'Избягвайте скорошни години.',
        repeated: 'Избягвайте повтарящи се думи и символи.',
        reverseWords: 'Избягвайте обърнати написания на обичайни думи.',
        sequences: 'Избягвайте обичайни последователности от символи.',
        useWords: 'Използвайте няколко думи, но избягвайте обичайни фрази.',
      },
      warnings: {
        common: 'Това е често използвана парола.',
        commonNames: 'Обичайни имена и фамилии са лесни за отгадване.',
        dates: 'Датите са лесни за отгадване.',
        extendedRepeat: 'Повтарящи се символни шаблони като "abcabcabc" са лесни за отгадване.',
        keyPattern: 'Кратки клавишни шаблони са лесни за отгадване.',
        namesByThemselves: 'Единични имена или фамилии са лесни за отгадване.',
        pwned: 'Вашата парола е била компроментирана от изтекли данни в Интернет.',
        recentYears: 'Скорошни години са лесни за отгадване.',
        sequences: 'Обичайни символни последователности като "abc" са лесни за отгадване.',
        similarToCommon: 'Това е подобно на често използвана парола.',
        simpleRepeat: 'Повтарящи се символи като "aaa" са лесни за отгадване.',
        straightRow: 'Редове от клавиши на клавиатурата са лесни за отгадване.',
        topHundred: 'Това е често използвана парола.',
        topTen: 'Това е често използвана парола.',
        userInputs: 'Не трябва да има лични или свързани със страницата данни.',
        wordByItself: 'Единични думи са лесни за отгадване.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Добавяне на акаунт',
    action__manageAccount: 'Управление на акаунта',
    action__signOut: 'Изход',
    action__signOutAll: 'Изход от всички акаунти',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Копирано!',
      actionLabel__copy: 'Копиране на всички',
      actionLabel__download: 'Изтегляне на .txt',
      actionLabel__print: 'Отпечатване',
      infoText1: 'Резервните кодове ще бъдат активирани за този акаунт.',
      infoText2:
        'Дръжте резервните кодове в тайна и ги съхранявайте сигурно. Можете да генерирате нови резервни кодове, ако подозирате, че те са били компрометирани.',
      subtitle__codelist: 'Запазете ги сигурно и ги държете в тайна.',
      successMessage:
        'Резервните кодове са активирани. Можете да използвате един от тях, за да влезете в акаунта си, ако загубите достъпа до устройството си за удостоверяване. Всеки код може да се използва само веднъж.',
      successSubtitle:
        'Можете да използвате един от тях, за да влезете в акаунта си, ако загубите достъпа до устройството си за удостоверяване.',
      title: 'Добавяне на резервен код за потвърждение',
      title__codelist: 'Резервни кодове',
    },
    connectedAccountPage: {
      formHint: 'Изберете доставчик, за да свържете вашия профил.',
      formHint__noAccounts: 'Няма налични външни акаунт доставчици.',
      removeResource: {
        messageLine1: '{{identifier}} ще бъде премахнат от този профил.',
        messageLine2:
          'Няма да можете да използвате този свързан акаунт, и всякакви зависими функции няма да работят повече.',
        successMessage: '{{connectedAccount}} беше премахнат от вашия профил.',
        title: 'Премахни свързан акаунт',
      },
      socialButtonsBlockButton: 'Свържи акаунт {{provider|titleize}}',
      successMessage: 'Доставчикът беше добавен към вашия профил',
      title: 'Добави свързан акаунт',
    },
    deletePage: {
      actionDescription: 'Напишете "Изтриване на акаунта" по-долу, за да продължите.',
      confirm: 'Изтриване на акаунта',
      messageLine1: 'Сигурни ли сте, че искате да изтриете акаунта си?',
      messageLine2: 'Това действие е перманентно и необратимо.',
      title: 'Изтриване на акаунта',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'На този имейл адрес ще бъде изпратен имейл с код за потвърждение.',
        formSubtitle: 'Въведете кода за потвърждение, изпратен на {{identifier}}',
        formTitle: 'Код за потвърждение',
        resendButton: 'Не сте получили код? Изпрати отново',
        successMessage: 'Имейлът {{identifier}} беше добавен към вашия профил.',
      },
      emailLink: {
        formHint: 'На този имейл адрес ще бъде изпратен имейл с линк за потвърждение.',
        formSubtitle: 'Кликнете върху линка за потвърждение в имейла, изпратен на {{identifier}}',
        formTitle: 'Линк за потвърждение',
        resendButton: 'Не сте получили линк? Изпрати отново',
        successMessage: 'Имейлът {{identifier}} беше добавен към вашия профил.',
      },
      removeResource: {
        messageLine1: '{{identifier}} ще бъде премахнат от този профил.',
        messageLine2: 'Няма да можете да влезете в профила си, използвайки този имейл адрес.',
        successMessage: '{{emailAddress}} беше премахнат от вашия профил.',
        title: 'Премахни имейл адрес',
      },
      title: 'Добави имейл адрес',
    },
    formButtonPrimary__continue: 'Продължи',
    formButtonPrimary__finish: 'Завърши',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Откажи',
    mfaPage: {
      formHint: 'Изберете метод, който да добавите.',
      title: 'Добави двустепенна верификация',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Добави телефонен номер',
      removeResource: {
        messageLine1: '{{identifier}} няма да получава повече кодове за потвърждение при влизане.',
        messageLine2: 'Вашият акаунт може да не е толкова сигурен. Сигурни ли сте, че искате да продължите?',
        successMessage: 'Двустепенното удостоверяване с SMS код беше премахнато за {{mfaPhoneCode}}',
        title: 'Премахване на двустепенното удостоверяване',
      },
      subtitle__availablePhoneNumbers:
        'Изберете телефонен номер, за да се регистрирате за двустепенното удостоверяване с SMS код.',
      subtitle__unavailablePhoneNumbers:
        'Няма налични телефонни номера за регистрация за двустепенното удостоверяване с SMS код.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Добавяне на SMS код за потвърждение',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Сканирай QR кода вместо това',
        buttonUnableToScan__nonPrimary: 'Не може да се сканира QR кода?',
        infoText__ableToScan:
          'Настройте нов метод за влизане във вашия удостоверителен апликатор и сканирайте следващия QR код, за да го свържете с вашия акаунт.',
        infoText__unableToScan:
          'Настройте нов метод за влизане във вашия удостоверител и въведете предоставения по-долу ключ.',
        inputLabel__unableToScan1:
          'Уверете се, че времевите или еднократните пароли са активирани, след което завършете свързването на вашия акаунт.',
        inputLabel__unableToScan2:
          'Алтернативно, ако вашият удостоверител поддържа TOTP URI, можете също да копирате пълния URI.',
      },
      removeResource: {
        messageLine1: 'Кодовете за потвърждение от този удостоверител вече няма да са необходими при влизане.',
        messageLine2: 'Вашият акаунт може да не е толкова сигурен. Сигурни ли сте, че искате да продължите?',
        successMessage: 'Двустепенното удостоверяване чрез приложение за удостоверяване беше премахнато.',
        title: 'Премахване на двустепенното удостоверяване',
      },
      successMessage:
        'Двустепенното удостоверяване е активирано. При влизане, ще трябва да въведете код за потвърждение от това удостоверително приложение като допълнителна стъпка.',
      title: 'Добавяне на приложение за удостоверяване',
      verifySubtitle: 'Въведете код за потвърждение, генериран от вашето удостоверително приложение',
      verifyTitle: 'Код за потвърждение',
    },
    mobileButton__menu: 'Меню',
    navbar: {
      account: 'Profile',
      description: 'Управлявайте информацията в профила си.',
      security: 'Security',
      title: 'Профил',
    },
    passwordPage: {
      changePasswordSuccessMessage: 'Паролата ви беше обновена.',
      changePasswordTitle: 'Промени паролата',
      readonly:
        'Вашата парола в момента не може да бъде редактирана, тъй като можете да влизате само чрез корпоративна връзка.',
      sessionsSignedOutSuccessMessage: 'Всички други устройства бяха излезли.',
      successMessage: 'Паролата ви беше зададена.',
      title: 'Задай парола',
    },
    phoneNumberPage: {
      infoText: 'Съобщение, съдържащо линк за потвърждение, ще бъде изпратено на този телефонен номер.',
      removeResource: {
        messageLine1: '{{identifier}} ще бъде премахнат от този профил.',
        messageLine2: 'Няма да можете да влезете в профила си, използвайки този телефонен номер.',
        successMessage: '{{phoneNumber}} беше премахнат от вашия профил.',
        title: 'Премахни телефонен номер',
      },
      successMessage: '{{identifier}} беше добавен към вашия профил.',
      title: 'Добави телефонен номер',
    },
    profilePage: {
      fileDropAreaHint: 'Препоръчителен размер 1:1, до 10MB.',
      imageFormDestructiveActionSubtitle: 'Премахни',
      imageFormSubtitle: 'Качи',
      imageFormTitle: 'Профилна снимка',
      readonly: 'Информацията ви за профила е предоставена от корпоративната връзка и не може да бъде редактирана.',
      successMessage: 'Вашият профил е актуализиран.',
      title: 'Актуализиране на профила',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Излез от устройството',
        title: 'Активни устройства',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Опитайте отново',
        actionLabel__reauthorize: 'Авторизирайте сега',
        destructiveActionTitle: 'Премахни',
        primaryButton: 'Свържи акаунт',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Свързани акаунти',
      },
      dangerSection: {
        deleteAccountButton: 'Изтрий профила',
        title: 'Прекратяване на профила',
      },
      emailAddressesSection: {
        destructiveAction: 'Премахни имейл',
        detailsAction__nonPrimary: 'Задайте като основен',
        detailsAction__primary: 'Завърши потвърждение',
        detailsAction__unverified: 'Потвърдете',
        primaryButton: 'Добави имейл адрес',
        title: 'Имейл адреси',
      },
      enterpriseAccountsSection: {
        title: 'Корпоративни акаунти',
      },
      headerTitle__account: 'Профил',
      headerTitle__security: 'Сигурност',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Прегенерирай',
          headerTitle: 'Резервни кодове',
          subtitle__regenerate:
            'Вземете нов набор от сигурни резервни кодове. Предходните резервни кодове ще бъдат изтрити и не могат да бъдат използвани.',
          title__regenerate: 'Прегенерирай резервни кодове',
        },
        phoneCode: {
          actionLabel__setDefault: 'Задай като стандартен',
          destructiveActionLabel: 'Премахни',
        },
        primaryButton: 'Добави двустепенна верификация',
        title: 'Двустепенна верификация',
        totp: {
          destructiveActionTitle: 'Премахни',
          headerTitle: 'Приложение за удостоверяване',
        },
      },
      passwordSection: {
        primaryButton__changePassword: 'Промени паролата',
        primaryButton__setPassword: 'Задай парола',
        title: 'Парола',
      },
      phoneNumbersSection: {
        destructiveAction: 'Премахни телефонен номер',
        detailsAction__nonPrimary: 'Задайте като основен',
        detailsAction__primary: 'Завърши потвърждение',
        detailsAction__unverified: 'Потвърдете телефонния номер',
        primaryButton: 'Добави телефонен номер',
        title: 'Телефонни номера',
      },
      profileSection: {
        primaryButton: 'Редактирайте профила',
        title: 'Профил',
      },
      usernameSection: {
        primaryButton__changeUsername: 'Промени потребителското име',
        primaryButton__setUsername: 'Задай потребителско име',
        title: 'Потребителско име',
      },
      web3WalletsSection: {
        destructiveAction: 'Премахни портфейл',
        primaryButton: 'Web3 портфейли',
        title: 'Web3 портфейли',
      },
    },
    usernamePage: {
      successMessage: 'Вашето потребителско име е актуализирано.',
      title: 'Актуализиране на потребителското име',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} ще бъде премахнат от този профил.',
        messageLine2: 'Няма да можете да влезете в профила си, използвайки този web3 портфейл.',
        successMessage: '{{web3Wallet}} беше премахнат от вашия профил.',
        title: 'Премахни web3 портфейл',
      },
      subtitle__availableWallets: 'Изберете web3 портфейл, за да го свържете с вашия профил.',
      subtitle__unavailableWallets: 'Няма налични web3 портфейли.',
      successMessage: 'Портфейлът беше добавен към вашия профил.',
      title: 'Добави web3 портфейл',
    },
  },
} as const;
