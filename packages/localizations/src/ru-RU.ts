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

export const ruRU: LocalizationResource = {
  locale: 'ru-RU',
  backButton: 'Назад',
  badge__default: 'По-умолчанию',
  badge__otherImpersonatorDevice: 'Другое устройство',
  badge__primary: 'Основной',
  badge__requiresAction: 'Требуется действие',
  badge__thisDevice: 'Это устройство',
  badge__unverified: 'Неверифицированный',
  badge__userDevice: 'Пользовательское устройство',
  badge__you: 'Вы',
  createOrganization: {
    formButtonSubmit: 'Создать организацию',
    invitePage: {
      formButtonReset: 'Пропустить',
    },
    title: 'Создать организацию',
  },
  dates: {
    lastDay: "Вчера в {{ date | timeString('ru-RU') }}",
    next6Days: "{{ date | weekday('ru-RU','long') }} в {{ date | timeString('ru-RU') }}",
    nextDay: "Завтра в {{ date | timeString('ru-RU') }}",
    numeric: "{{ date | numeric('ru-RU') }}",
    previous6Days: "Последний {{ date | weekday('ru-RU','long') }} в {{ date | timeString('ru-RU') }}",
    sameDay: "Сегодня в {{ date | timeString('ru-RU') }}",
  },
  dividerText: 'или',
  footerActionLink__useAnotherMethod: 'Использовать другой метод',
  footerPageLink__help: 'Помощь',
  footerPageLink__privacy: 'Приватность',
  footerPageLink__terms: 'Условия',
  formButtonPrimary: 'Продолжить',
  formButtonPrimary__verify: 'Верификация',
  formFieldAction__forgotPassword: 'Забыли пароль?',
  formFieldError__matchingPasswords: 'Пароли совпадают.',
  formFieldError__notMatchingPasswords: 'Пароли не совпадают.',
  formFieldError__verificationLinkExpired:
    'Срок действия ссылки верификации истек. Пожалуйста, запросити новую ссылку.',
  formFieldHintText__optional: 'Опционально',
  formFieldHintText__slug:
    'Slug - это человекочитаемый идентификатор, который должен быть уникальным. Он часто используется в URL-адресах.',
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Удалить учетную запись',
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses:
    'Введите или вставьте один или более адресов почты, разделенных пробелами или запятыми',
  formFieldInputPlaceholder__firstName: undefined,
  formFieldInputPlaceholder__lastName: undefined,
  formFieldInputPlaceholder__organizationDomain: undefined,
  formFieldInputPlaceholder__organizationDomainEmailAddress: undefined,
  formFieldInputPlaceholder__organizationName: undefined,
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  formFieldInputPlaceholder__password: undefined,
  formFieldInputPlaceholder__phoneNumber: undefined,
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations: 'Enable automatic invitations for this domain',
  formFieldLabel__backupCode: 'Код восстановления',
  formFieldLabel__confirmDeletion: 'Подтверждение',
  formFieldLabel__confirmPassword: 'Подтверждение пароля',
  formFieldLabel__currentPassword: 'Текущий пароль',
  formFieldLabel__emailAddress: 'Почта',
  formFieldLabel__emailAddress_username: 'Почта или имя пользователя',
  formFieldLabel__emailAddresses: 'Почтовые адреса',
  formFieldLabel__firstName: 'Имя',
  formFieldLabel__lastName: 'Фамилия',
  formFieldLabel__newPassword: 'Новый пароль',
  formFieldLabel__organizationDomain: 'Домен',
  formFieldLabel__organizationDomainDeletePending: 'Удалить ожидающие приглашения и предложения',
  formFieldLabel__organizationDomainEmailAddress: 'Верифицировать адрес электронной почты',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Введите адрес электронной почты с этим доменом, чтобы получить код и подтвердить домен.',
  formFieldLabel__organizationName: 'Название организации',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Название ключа доступа',
  formFieldLabel__password: 'Пароль',
  formFieldLabel__phoneNumber: 'Номер телефона',
  formFieldLabel__role: 'Роль',
  formFieldLabel__signOutOfOtherSessions: 'Выйти со всех других устройств',
  formFieldLabel__username: 'Имя пользователя',
  impersonationFab: {
    action__signOut: 'Выйти',
    title: 'Вы вошли как {{identifier}}',
  },
  maintenanceMode:
    'В данный момент мы проводим техническое обслуживание, но не беспокойтесь, это не займет больше нескольких минут.',
  membershipRole__admin: 'Администратор',
  membershipRole__basicMember: 'Участник',
  membershipRole__guestMember: 'Гость',
  organizationList: {
    action__createOrganization: 'Создать организацию',
    action__invitationAccept: 'Присоединиться',
    action__suggestionsAccept: 'Запрос на присоединение',
    createOrganization: 'Создать Организацию',
    invitationAcceptedLabel: 'Присоединился',
    subtitle: 'для продолжения в {{applicationName}}',
    suggestionsAcceptedLabel: 'Ожидает одобрения',
    title: 'Выбрать учетную запись',
    titleWithoutPersonal: 'Выбрать организацию',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Автоматические приглашения',
    badge__automaticSuggestion: 'Автоматические предложения',
    badge__manualInvitation: 'Нет автоматической регистрации',
    badge__unverified: 'Неверифицированный',
    createDomainPage: {
      subtitle:
        'Добавьте верифицированный домен. Пользователи, чья электронная почта зарегистрирована на верифицированном домене, могут присоединяться к организации автоматически или по запросу.',
      title: 'Добавить домен',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Приглашения не могли быть отправлены. Уже есть ожидающие приглашения для следующих адресов электронной почты: {{email_addresses}}.',
      formButtonPrimary__continue: 'Отправить приглашения',
      selectDropdown__role: 'Выбрать роль',
      subtitle: 'Пригласите новых участников в эту организацию',
      successMessage: 'Приглашения успешно отправлены',
      title: 'Пригласить участников',
    },
    membersPage: {
      action__invite: 'Пригласить',
      activeMembersTab: {
        menuAction__remove: 'Удалить участника',
        tableHeader__actions: 'Действия',
        tableHeader__joined: 'Присоединился',
        tableHeader__role: 'Роль',
        tableHeader__user: 'Пользователь',
      },
      detailsTitle__emptyRow: 'Нет участников для отображения',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Пригласите пользователей, подключив домен электронной почты к вашей организации. Любой, кто зарегистрируется с соответствующим доменом электронной почты, сможет присоединиться к организации в любое время.',
          headerTitle: 'Автоматические приглашения',
          primaryButton: 'Управлять верифицированными доменами',
        },
        table__emptyRow: 'Нет приглашений для отображения',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Отозвать приглашение',
        tableHeader__invited: 'Приглашенные',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Пользователи, которые регистрируются с соответствующим доменом электронной почты, смогут увидеть предложение запроса на присоединение к вашей организации',
          headerTitle: 'Автоматические предложения',
          primaryButton: 'Управлять верифицированными доменами',
        },
        menuAction__approve: 'Одобрить',
        menuAction__reject: 'Отклонить',
        tableHeader__requested: 'Запрашиваемый доступ',
        table__emptyRow: 'Нет запросов для отображения',
      },
      start: {
        headerTitle__invitations: 'Приглашения',
        headerTitle__members: 'Участники',
        headerTitle__requests: 'Заявки',
      },
    },
    navbar: {
      description: 'Управлять вашей организацией.',
      general: 'Общее',
      members: 'Участники',
      title: 'Организация',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Напишите {{organizationName}} в поле ниже, чтобы продолжить.',
          messageLine1: 'Вы уверены, что хотите удалить эту организацию?',
          messageLine2: 'Это действие нельзя отменить.',
          successMessage: 'Вы удалили организацию.',
          title: 'Удалить организацию',
        },
        leaveOrganization: {
          actionDescription: 'Введите "{{organizationName}}" в поле ниже, чтобы продолжить.',
          messageLine1:
            'Вы уверены, что хотите покинуть эту организацию? Вы потеряете доступ к этой организации и ее приложениям.',
          messageLine2: 'Это действие нельзя отменить.',
          successMessage: 'Вы покинули организацию.',
          title: 'Покинуть организацию',
        },
        title: 'Опасность',
      },
      domainSection: {
        menuAction__manage: 'Управлять',
        menuAction__remove: 'Удалить',
        menuAction__verify: 'Верифицировать',
        primaryButton: 'Добавить домен',
        subtitle:
          'Разрешите пользователям присоединяться к организации автоматически или по запросу, если домен их электронной почты верифицирован.',
        title: 'Верифицированные домены',
      },
      successMessage: 'Организация была обновлена.',
      title: 'Профиль организации',
    },
    removeDomainPage: {
      messageLine1: 'Домен электронной почты {{domain}} был удален.',
      messageLine2: 'Пользователи не смогут автоматически присоединяться к организации после этого',
      successMessage: '{{domain}} был удален.',
      title: 'Удалить домен',
    },
    start: {
      headerTitle__general: 'Общее',
      headerTitle__members: 'Участники',
      profileSection: {
        primaryButton: 'Обновить профиль',
        title: 'Профиль Организации',
        uploadAction__title: 'Логотип',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Удаление домена повлияет на приглашенных пользователей.',
        removeDomainActionLabel__remove: 'Удалить домен',
        removeDomainSubtitle: 'Удалить этот домен из числа верифицированных',
        removeDomainTitle: 'Удалить домен',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Пользователи автоматически получают приглашение присоединиться к организации после регистрации и могут принять его в любое время без одобрения администратора',
        automaticInvitationOption__label: 'Автоматические приглашения',
        automaticSuggestionOption__description:
          'Пользователи автоматически получают приглашение подать заявку на присоединение к организации. Чтобы пользователь смог присоединиться к организации, администратор должен одобрить заявку.',
        automaticSuggestionOption__label: 'Автоматические рекомендации',
        calloutInfoLabel: 'Изменение способа присоединения повлияет только на новых пользователей.',
        calloutInvitationCountLabel: 'Приглашений отправлено: {{count}}',
        calloutSuggestionCountLabel: 'Рекомендаций отправлено: {{count}}',
        manualInvitationOption__description:
          'Пользователи не смогут присоединяться самостоятельно, их можно добавлять только вручную.',
        manualInvitationOption__label: 'Только ручное добавление',
        subtitle:
          'Выберите, каким способом пользователи с этим доменом электронной почты будут присоединяться к организации.',
      },
      start: {
        headerTitle__danger: 'Опасность',
        headerTitle__enrollment: 'Способы присоединения',
      },
      subtitle:
        'Домен {{domain}} верифицирован. Теперь выберите, как пользователи с этим доменом будут присоединяться к организации.',
      title: 'Обновить {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Введите код подтверждения, отправленный на указанную почту',
      formTitle: 'Код подтверждения',
      resendButton: 'Не получили код? Отправить снова',
      subtitle: 'Домен {{domainName}} должен быть верифицирован через электронную почту.',
      subtitleVerificationCodeScreen:
        'Верификационный код отправлен на почту {{emailAddress}}. Введите его, чтобы продолжить.',
      title: 'Верификация домена',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Создать организацию',
    action__invitationAccept: 'Присоединиться',
    action__manageOrganization: 'Настройки',
    action__suggestionsAccept: 'Запрос на присоединение',
    notSelected: 'Организация не выбрана',
    personalWorkspace: 'Личный профиль',
    suggestionsAcceptedLabel: 'Ожидает одобрения',
  },
  paginationButton__next: 'Вперед',
  paginationButton__previous: 'Назад',
  paginationRowText__displaying: 'Отображение',
  paginationRowText__of: 'из',
  reverification: {
    alternativeMethods: {
      actionLink: 'Получить помощь',
      actionText: 'У вас нет ничего из этого?',
      blockButton__backupCode: 'Использовать резервный код',
      blockButton__emailCode: 'Отправить код на {{identifier}}',
      blockButton__password: 'Продолжить с вашим паролем',
      blockButton__phoneCode: 'Отправить SMS код на {{identifier}}',
      blockButton__totp: 'Использовать приложение аутентификации',
      getHelp: {
        blockButton__emailSupport: 'Написать в поддержку',
        content:
          'Если у вас возникли проблемы с проверкой учетной записи, напишите нам, и мы вместе с вами восстановим доступ как можно скорее.',
        title: 'Получить помощь',
      },
      subtitle: 'Столкнулись с проблемами? Вы можете использовать любой из этих методов для верификации',
      title: 'Использовать другой метод',
    },
    backupCodeMfa: {
      subtitle: 'Ваш резервный код - это код, который вы получили при настройке двухфакторной аутентификации.',
      title: 'Введите резервный код',
    },
    emailCode: {
      formTitle: 'Верификационный код',
      resendButton: 'Не получили код? Отправить повторно',
      subtitle: 'для продолжения {{applicationName}}',
      title: 'Проверьте вашу почту',
    },
    noAvailableMethods: {
      message: 'Невозможно продолжить верификацию. Нет доступного фактора аутентификации.',
      subtitle: 'Произошла ошибка',
      title: 'Невозможно подтвердить учетную запись',
    },
    password: {
      actionLink: 'Используйте другой метод',
      subtitle: 'Введите пароль, связанный с вашей учетной записью',
      title: 'Введите ваш пароль',
    },
    phoneCode: {
      formTitle: 'Верификационный код',
      resendButton: 'Не получили код? Отправить повторно',
      subtitle: 'для продолжения {{applicationName}}',
      title: 'Проверьте ваш телефон',
    },
    phoneCodeMfa: {
      formTitle: 'Верификационный код',
      resendButton: 'Не получили код? Отправить повторно',
      subtitle: 'Для продолжения, введите верификационный код, отправленный на ваш телефон',
      title: 'Проверьте ваш телефон',
    },
    totpMfa: {
      formTitle: 'Верификационный код',
      subtitle: 'Чтобы продолжить, введите верификационный код, сгенерированный вашим приложением-аутентификатором',
      title: 'Двухфакторная верификация',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Добавить учетную запись',
      action__signOutAll: 'Выйти из всех учетных записей',
      subtitle: 'Выберите учетную запись, с которой вы хотите продолжить.',
      title: 'Выбрать учетную запись',
    },
    alternativeMethods: {
      actionLink: 'Помощь',
      actionText: 'Ничего из представленного?',
      blockButton__backupCode: 'Использовать резервный код.',
      blockButton__emailCode: 'Отправить код на {{identifier}}',
      blockButton__emailLink: 'Отправить ссылку на {{identifier}}',
      blockButton__passkey: 'Войти с помощью вашего ключа доступа.',
      blockButton__password: 'Войти с паролем',
      blockButton__phoneCode: 'Отправить код на {{identifier}}',
      blockButton__totp: 'Используйте аутентификатор',
      getHelp: {
        blockButton__emailSupport: 'Написать в поддержку',
        content:
          'Если вы испытваете сложности со входом в вашу учетную запись, напишите нам и мы постараемся восстаносить Ваш доступ в кратчайшие сроки.',
        title: 'Помощь',
      },
      subtitle: 'Возникают проблемы? Вы можете использовать любой из этих методов для входа.',
      title: 'Использовать другой метод',
    },
    backupCodeMfa: {
      subtitle: 'для продолжения работы в "{{applicationName}}"',
      title: 'Введите резервный код',
    },
    emailCode: {
      formTitle: 'Верификационный код',
      resendButton: 'Не получили код? Отправить снова.',
      subtitle: 'для продолжения работы в "{{applicationName}}"',
      title: 'Проверьте Вашу почту',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Чтобы продолжить, откройте ссылку для проверки на устройстве и в браузере, с которых вы начали вход.',
        title: 'Ссылка для проверки недействительна для этого устройства.',
      },
      expired: {
        subtitle: 'Вернитесь на начальную вкладку, чтобы продолжить.',
        title: 'Эта верификационная ссылка истекла',
      },
      failed: {
        subtitle: 'Вернитесь на начальную вкладку, чтобы продолжить.',
        title: 'Эта верификационная ссылка невалидная.',
      },
      formSubtitle: 'Используйте верификационную ссылку, отправленную на Вашу почту',
      formTitle: 'Верификационная ссылка',
      loading: {
        subtitle: 'Вы скоро будете перенаправлены',
        title: 'Входим...',
      },
      resendButton: 'Не получили ссылку? Отправить снова.',
      subtitle: 'чтобы продолжить работу в "{{applicationName}}"',
      title: 'Проверьте Вашу почту',
      unusedTab: {
        title: 'Вкладку можно закрыть',
      },
      verified: {
        subtitle: 'Вы скоро будете перенаправлены',
        title: 'Успешный вход',
      },
      verifiedSwitchTab: {
        subtitle: 'Вернитесь на начальную вкладку, чтобы продолжить',
        subtitleNewTab: 'Вернитесь на только что открытую вкладку, чтобы продолжить',
        titleNewTab: 'Залогиньтесь на другой вкладке',
      },
    },
    forgotPassword: {
      formTitle: 'Код восстановления пароля',
      resendButton: 'Отправить код еще раз',
      subtitle: 'для сброса вашего пароля',
      subtitle_email: 'Сначала введите код, отправленный на ваш адрес электронной почты.',
      subtitle_phone: 'Сначала введите код, отправленный на ваш телефон.',
      title: 'Сбросить пароль',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Восстановить пароль',
      label__alternativeMethods: 'Или, войти другим способом',
      title: 'Забыли пароль?',
    },
    noAvailableMethods: {
      message: 'Невозможно войти. Нет доступных факторов аутентификации.',
      subtitle: 'Произошла ошибка',
      title: 'Невозможно войти',
    },
    passkey: {
      subtitle:
        'Использование вашего ключа доступа подтверждает вашу личность. Ваше устройство может запросить ваш отпечаток пальца, лицо или блокировку экрана.',
      title: 'Используйте ваш ключ доступа',
    },
    password: {
      actionLink: 'Использовать другой метод',
      subtitle: 'чтобы продолжить работу в "{{applicationName}}"',
      title: 'Введите пароль',
    },
    passwordPwned: {
      title: 'Пароль скомпрометирован',
    },
    phoneCode: {
      formTitle: 'Верификационный код',
      resendButton: 'Не получили код? Отправить снова.',
      subtitle: 'чтобы продолжить работу в "{{applicationName}}"',
      title: 'Проверьте ваш телефон',
    },
    phoneCodeMfa: {
      formTitle: 'Верификационный код',
      resendButton: 'Не получили код? Отправить снова.',
      subtitle: 'Чтобы продолжить, пожалуйста, введите код проверки, отправленный на ваш телефон.',
      title: 'Проверьте ваш телефон',
    },
    resetPassword: {
      formButtonPrimary: 'Сбросить пароль',
      requiredMessage: 'По соображениям безопасности необходимо сбросить ваш пароль.',
      successMessage: 'Ваш пароль успешно изменен. Выполняется вход, подождите.',
      title: 'Сбросить пароль',
    },
    resetPasswordMfa: {
      detailsLabel: 'Необходимо верифицировать вашу личность перед восстановлением пароля',
    },
    start: {
      actionLink: 'Зарегистрироваться',
      actionLink__join_waitlist: undefined,
      actionLink__use_email: 'Использовать почту',
      actionLink__use_email_username: 'Использовать почту или имя пользователя',
      actionLink__use_passkey: 'Использовать ключ доступа вместо этого',
      actionLink__use_phone: 'Использовать номер телефона',
      actionLink__use_username: 'Использовать имя пользователя',
      actionText: 'Нет учетной записи?',
      actionText__join_waitlist: undefined,
      subtitle: 'чтобы продолжить работу в "{{applicationName}}"',
      title: 'Войти',
      __experimental_titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Верификационный код',
      subtitle: 'Чтобы продолжить, пожалуйста, введите код проверки, сгенерированный вашим приложением аутентификации.',
      title: 'Двухфакторая верификация',
    },
  },
  signInEnterPasswordTitle: 'Введите Ваш пароль',
  signUp: {
    continue: {
      actionLink: 'Войти',
      actionText: 'Уже есть учетная запись?',
      subtitle: 'чтобы продолжить работу в "{{applicationName}}"',
      title: 'Заполните все поля',
    },
    emailCode: {
      formSubtitle: 'Введите верификационный код, отправленный Вам на почту',
      formTitle: 'Верификационный код',
      resendButton: 'Не получили код? Отправить снова.',
      subtitle: 'чтобы продолжить работу в "{{applicationName}}"',
      title: 'Верифицируйте Вашу почту',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Чтобы продолжить, откройте верификационную ссылку на устройстве и в браузере, с которых вы начали регистрацию.',
        title: 'Верификационная ссылка недействительна для этого устройства.',
      },
      formSubtitle: 'Используйте верификационную ссылку, оправленную Вам на почту',
      formTitle: 'Верификационная ссылка',
      loading: {
        title: 'Входим...',
      },
      resendButton: 'Переотправить ссылку',
      subtitle: 'чтобы продолжить работу в "{{applicationName}}"',
      title: 'Верифицируйте Вашу почту',
      verified: {
        title: 'Успешный вход',
      },
      verifiedSwitchTab: {
        subtitle: 'Вернитесь на новую открытую вкладку, чтобы продолжить',
        subtitleNewTab: 'Вернитесь на предыдущую вкладку, чтобы продолжить',
        title: 'Почта верифицирована',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Я согласен с {{ privacyPolicyLink || link("Политика конфиденциальности") }}',
        label__onlyTermsOfService: 'Я согласен с {{ termsOfServiceLink || link("Условия обслуживания") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Я согласен с {{ termsOfServiceLink || link("Условия обслуживания") }} и {{ privacyPolicyLink || link("Политика конфиденциальности") }}',
      },
      continue: {
        subtitle: 'Пожалуйста, прочитайте и примите условия, чтобы продолжить.',
        title: 'Юридическое согласие',
      },
    },
    phoneCode: {
      formSubtitle: 'Введите верификационный код, отправленный на Ваш телефон',
      formTitle: 'Верификационный код',
      resendButton: 'Не получили код? Отправить снова.',
      subtitle: 'чтобы продолжить работу в "{{applicationName}}"',
      title: 'Верифицируйте Ваш номер телефона',
    },
    restrictedAccess: {
      actionLink: 'Войти',
      actionText: 'Уже есть учетная запись?',
      blockButton__emailSupport: 'Написать в поддержку',
      blockButton__joinWaitlist: undefined,
      subtitle:
        'Регистрация в данный момент отключена. Если вы считаете, что у вас должен быть доступ, пожалуйста, свяжитесь с поддержкой.',
      subtitleWaitlist: undefined,
      title: 'Доступ ограничен',
    },
    start: {
      actionLink: 'Войти',
      actionLink__use_email: 'Использовать электронную почту вместо этого',
      actionLink__use_phone: 'Использовать телефон вместо этого',
      actionText: 'Уже есть учетная запись?',
      subtitle: 'чтобы продолжить работу в "{{applicationName}}"',
      title: 'Создайте Вашу учетную запись',
    },
  },
  socialButtonsBlockButton: 'Продолжить с помощью {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  unstable__errors: {
    already_a_member_in_organization: '{{email}} уже является членом организации.',
    captcha_invalid:
      'Регистрация не удалась из-за неудачных проверок безопасности. Пожалуйста, обновите страницу, чтобы попробовать снова, или обратитесь в службу поддержки для получения дополнительной помощи.',
    captcha_unavailable:
      'Регистрация не удалась из-за неудачной проверки бота. Пожалуйста, обновите страницу, чтобы попробовать снова, или обратитесь в службу поддержки для получения дополнительной помощи.',
    form_code_incorrect: undefined,
    form_identifier_exists: undefined,
    form_identifier_exists__email_address: 'Этот адрес электронной почты уже занят. Пожалуйста, попробуйте другой.',
    form_identifier_exists__phone_number: 'Этот номер телефона уже занят. Пожалуйста, попробуйте другой.',
    form_identifier_exists__username: 'Это имя пользователя уже занято. Пожалуйста, попробуйте другое.',
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'Адрес электронной почты должен быть действительным.',
    form_param_format_invalid__phone_number: 'Номер телефона должен быть в действующем международном формате.',
    form_param_max_length_exceeded__first_name: 'Имя не должно превышать 256 символов.',
    form_param_max_length_exceeded__last_name: 'Фамилия не должна превышать 256 символов.',
    form_param_max_length_exceeded__name: 'Имя не должно превышать 256 символов.',
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: 'Ваш пароль недостаточно надежный.',
    form_password_pwned: 'Этот пароль был взломан и не может быть использован, попробуйте другой пароль.',
    form_password_pwned__sign_in:
      'Этот пароль был найден в утечке данных и не может быть использован. Пожалуйста, сбросьте пароль.',
    form_password_size_in_bytes_exceeded:
      'Ваш пароль превышает максимально допустимое количество байтов, сократите его или удалите некоторые специальные символы.',
    form_password_validation_failed: 'Неверный пароль',
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed: 'Вы не можете удалить последнюю идентификацию.',
    not_allowed_access: undefined,
    organization_domain_blocked: 'Это заблокированный домен почтового провайдера. Пожалуйста, используйте другой.',
    organization_domain_common: 'Это распространенный домен почтового провайдера. Пожалуйста, используйте другой.',
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded:
      'Вы достигли предела количества участий в организациях, включая ожидающие приглашения.',
    organization_minimum_permissions_needed:
      'Должен быть как минимум один участник организации с минимально необходимыми разрешениями.',
    passkey_already_exists: 'Ключ доступа уже зарегистрирован на этом устройстве.',
    passkey_not_supported: 'Ключи доступа не поддерживаются на этом устройстве.',
    passkey_pa_not_supported: 'Для регистрации требуется платформа аутентификатор, но устройство его не поддерживает.',
    passkey_registration_cancelled: 'Регистрация ключа доступа была отменена или истекло время ожидания.',
    passkey_retrieval_cancelled: 'Проверка ключа доступа была отменена или истекло время ожидания.',
    passwordComplexity: {
      maximumLength: 'менее {{length}} символов',
      minimumLength: '{{length}} или более символов',
      requireLowercase: 'букву в нижнем регистре',
      requireNumbers: 'цифру',
      requireSpecialCharacter: 'специальный символ',
      requireUppercase: 'букву в верхнем регистре',
      sentencePrefix: 'Ваш пароль должен содержать',
    },
    phone_number_exists: 'Этот номер телефона уже занят. Пожалуйста, попробуйте другой.',
    zxcvbn: {
      couldBeStronger: 'Ваш пароль подходит, но мог бы быть надежнее. Попробуйте добавить больше символов.',
      goodPassword: 'Хорошая работа. Это отличный пароль.',
      notEnough: 'Ваш пароль недостаточно надежный.',
      suggestions: {
        allUppercase: 'Делайте заглавными некоторые, но не все буквы.',
        anotherWord: 'Добавьте больше слов, которые менее распространены.',
        associatedYears: 'Избегайте лет, которые связаны с вами.',
        capitalization: 'Делайте заглавными не только первую букву',
        dates: 'Избегайте дат и лет, которые связаны с вами.',
        l33t: 'Избегайте предсказуемых замен букв, таких как «@» вместо «a».',
        longerKeyboardPattern: 'Используйте более длинные сочетания клавиш и несколько раз меняйте направление ввода.',
        noNeed: 'Вы можете создавать надежные пароли без использования символов, цифр или заглавных букв.',
        pwned: 'Если вы используете этот пароль в другом месте, вам следует изменить его.',
        recentYears: 'Избегайте последних лет.',
        repeated: 'Избегайте повторяющихся слов и символов.',
        reverseWords: 'Избегайте обратного написания часто используемых слов.',
        sequences: 'Избегайте частых последовательностей символов.',
        useWords: 'Используйте несколько слов, но избегайте распространенных фраз.',
      },
      warnings: {
        common: 'Это распространенный пароль.',
        commonNames: 'Распространенные имена и фамилии легко угадать.',
        dates: 'Даты легко угадать.',
        extendedRepeat: 'Повторяющиеся шаблоны символов, такие как "abcabcabc", легко угадать.',
        keyPattern: 'Короткие сочетания клавиш легко угадать.',
        namesByThemselves: 'Одни имена или фамилии легко угадать.',
        pwned: 'Ваш пароль был раскрыт в результате утечки данных в Интернете.',
        recentYears: 'Последние годы легко угадать.',
        sequences: 'Частые последовательности символов, такие как "abc", легко угадать.',
        similarToCommon: 'Этот пароль похож на часто используемый пароль.',
        simpleRepeat: 'Повторяющиеся символы, такие как "aaa", легко угадать.',
        straightRow: 'Прямые ряды клавиш на клавиатуре легко угадать.',
        topHundred: 'Это часто используемый пароль.',
        topTen: 'Это очень часто используемый пароль.',
        userInputs: 'Не должно быть никаких личных данных или данных, связанных со страницей.',
        wordByItself: 'Отдельные слова легко угадать.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Добавить учетную запись',
    action__manageAccount: 'Управление учетной записью',
    action__signOut: 'Выйти',
    action__signOutAll: 'Выйти из всех учетных записей',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Скопировано!',
      actionLabel__copy: 'Копировать все',
      actionLabel__download: 'Скачать .txt',
      actionLabel__print: 'Печать',
      infoText1: 'Резервные коды будут включены для этой учетной записи.',
      infoText2:
        'Держите резервные коды в секрете и храните их в надежном месте. Вы можете создать новые резервные коды, если подозреваете, что они были скомпрометированы.',
      subtitle__codelist: 'Храните их в безопасности и не сообщайте никому.',
      successMessage:
        'Резервные коды включены. Вы можете использовать один из этих кодов для входа в свою учетную запись, если вы потеряете доступ к своему устройству аутентификации. Каждый код может быть использован только один раз.',
      successSubtitle:
        'Вы можете использовать один из этих кодов для входа в свою учетную запись, если вы потеряете доступ к своему устройству аутентификации.',
      title: 'Добавить резервный код подтверждения',
      title__codelist: 'Резервные коды',
    },
    connectedAccountPage: {
      formHint: 'Выберите провайдера для подключения вашей учетной записи.',
      formHint__noAccounts: 'Нет доступных провайдеров внешних учетных записей.',
      removeResource: {
        messageLine1: '{{identifier}} будет удален из вашей учетной записи.',
        messageLine2:
          'Вы больше не сможете использовать эту подключенную учетную запись, и любые зависимые функции больше не будут работать.',
        successMessage: '{{connectedAccount}} был удален из вашей учетной записи.',
        title: 'Удалить подключенную учетную запись',
      },
      socialButtonsBlockButton: 'Подключить учетную запись {{provider|titleize}}',
      successMessage: 'Провайдер был добавлен в вашу учетную запись',
      title: 'Добавить подключенную учетную запись',
    },
    deletePage: {
      actionDescription: 'Введите "Удалить учетную запись" ниже, чтобы продолжить.',
      confirm: 'Удалить учетную запись',
      messageLine1: 'Вы уверены, что хотите удалить свою учетную запись?',
      messageLine2: 'Это действие является окончательным и необратимым.',
      title: 'Удалить учетную запись',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'На этот адрес электронной почты будет отправлено письмо с верификационным кодом.',
        formSubtitle: 'Введите верификационный код, отправленный на {{identifier}}',
        formTitle: 'Верификационный код',
        resendButton: 'Не получили код? Отправить повторно',
        successMessage: 'Адрес электронной почты {{identifier}} был добавлен в вашу учетную запись.',
      },
      emailLink: {
        formHint: 'На этот адрес электронной почты будет отправлена верификационная ссылка.',
        formSubtitle: 'Нажмите на верификационную ссылку в письме, отправленном на {{identifier}}',
        formTitle: 'Верификационная ссылка',
        resendButton: 'Отправить ссылку повторно',
        successMessage: 'Адрес электронной почты {{identifier}} был добавлен в вашу учетную запись.',
      },
      enterpriseSsoLink: {
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      removeResource: {
        messageLine1: '{{identifier}} будет удален из этой учетной записи.',
        messageLine2: 'Вы больше не сможете войти с использованием этого адреса электронной почты.',
        successMessage: '{{emailAddress}} был удален из вашей учетной записи.',
        title: 'Удалить адрес электронной почты',
      },
      title: 'Добавить адрес электронной почты',
      verifyTitle: 'Верифицировать адрес электроной почты',
    },
    formButtonPrimary__add: 'Добавить',
    formButtonPrimary__continue: 'Продолжить',
    formButtonPrimary__finish: 'Готово',
    formButtonPrimary__remove: 'Удалить',
    formButtonPrimary__save: 'Сохранить',
    formButtonReset: 'Отмена',
    mfaPage: {
      formHint: 'Выберите метод для добавления.',
      title: 'Добавить двухфакторную аутентификацию',
    },
    mfaPhoneCodePage: {
      backButton: 'Использовать существующий номер телефона',
      primaryButton__addPhoneNumber: 'Добавить номер телефона',
      removeResource: {
        messageLine1: '{{identifier}} больше не будет получать коды подтверждения при входе в систему.',
        messageLine2: 'Ваша учетная запись будет менее защищенной. Вы уверены, что хотите продолжить?',
        successMessage: 'Двухфакторная аутентификация SMS-кодом была удалена для {{mfaPhoneCode}}',
        title: 'Удалить двухфакторную аутентификацию',
      },
      subtitle__availablePhoneNumbers:
        'Выберите номер телефона для регистрации двухфакторной аутентификиции SMS-кодом.',
      subtitle__unavailablePhoneNumbers:
        'Нет доступных номеров телефона для регистрации двухфакторной аутентификация SMS-кодом. Добавьте новый номер.',
      successMessage1:
        'При входе вам потребуется ввести верификационный код отправленный на этот номер телефона как дополнительный шаг',
      successMessage2:
        'Сохраните эти резервные коды и храните их в надежном месте. Если вы потеряете доступ к устройству аутентификации, вы сможете использовать резервные коды для входа.',
      successTitle: 'Проверка с помощью SMS-кода включена',
      title: 'Добавить проверку кодом из SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Вместо этого отсканируйте QR-код',
        buttonUnableToScan__nonPrimary: 'Не удается отсканировать QR-код?',
        infoText__ableToScan:
          'Настройте новый метод входа в вашем приложении аутентификации и отсканируйте следующий QR-код, чтобы связать его с вашей учетной записью.',
        infoText__unableToScan:
          'Настройте новый метод входа в вашем приложении аутентификации и введите ниже предоставленный ключ.',
        inputLabel__unableToScan1:
          'Убедитесь что включены одноразовые или привязанные ко времени пароли затем завершите привязку вашей учетной записи.',
        inputLabel__unableToScan2:
          'Кроме того, если ваше приложение аутентификации поддерживает URI TOTP, вы также можете скопировать полный URI.',
      },
      removeResource: {
        messageLine1:
          'Верификационный код из этого приложения аутентификации больше не потребуется при входе в систему.',
        messageLine2: 'Ваша учетная запись будет менее защищенной. Вы уверены, что хотите продолжить?',
        successMessage: 'Двухфакторная аутентификация через приложение аутентификации была удалена.',
        title: 'Удаление двухфакторной аутентификации',
      },
      successMessage:
        'Двухфакторная аутентификация в настоящее время включена. При входе в систему вам нужно будет ввести верификационный код из этого приложения в качестве дополнительного шага.',
      title: 'Добавить приложение аутентификации',
      verifySubtitle: 'Введите верификационный код, созданный вашим приложением аутентификации',
      verifyTitle: 'Верификационный код',
    },
    mobileButton__menu: 'Меню',
    navbar: {
      account: 'Профиль',
      description: 'Управление информацией вашей учетной записи.',
      security: 'Безопасность',
      title: 'Учетная запись',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} будет удален из этой учетной записи.',
        title: 'Удалить ключ доступа',
      },
      subtitle__rename: 'Вы можете изменить название ключа доступа чтобы его было легче найти.',
      title__rename: 'Переименовать ключ доступа',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Рекомендуется выйти из всех других устройств, на которых использовался ваш старый пароль.',
      readonly: 'Ваш пароль сейчас нельзя изменить, так как вы можете войти только через корпоративное подключение.',
      successMessage__set: 'Ваш пароль установлен.',
      successMessage__signOutOfOtherSessions: 'Все другие устройства были выведены из системы.',
      successMessage__update: 'Ваш пароль был обновлен.',
      title__set: 'Установить пароль',
      title__update: 'Изменить пароль',
    },
    phoneNumberPage: {
      infoText:
        'На этот номер телефона будет отправлено текстовое сообщение со ссылкой верификации. Могут применяться тарифы на сообщения и передачу данных.',
      removeResource: {
        messageLine1: '{{identifier}} будет удален из этой учетной записи.',
        messageLine2: 'Вы больше не сможете войти, используя этот номер телефона.',
        successMessage: '{{phoneNumber}} был удален из вашей учетной записи.',
        title: 'Удалить номер телефона',
      },
      successMessage: '{{identifier}} был добавлен к вашей учетной записи.',
      title: 'Добавить номер телефона',
      verifySubtitle: 'Введите верификационный код отправленный на {{identifier}}',
      verifyTitle: 'Верифицировать номер телефона',
    },
    profilePage: {
      fileDropAreaHint: 'Загрузите изображение в форматах JPG, PNG, GIF или WEBP размером меньше 10 МБ',
      imageFormDestructiveActionSubtitle: 'Удалить изображение',
      imageFormSubtitle: 'Загрузить изображение',
      imageFormTitle: 'Изображение профиля',
      readonly:
        'Информация вашего профиля была предоставлена корпоративным подключением и не может быть отредактирована.',
      successMessage: 'Ваш профиль был обновлен.',
      title: 'Обновить профиль',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Выйти из устройства',
        title: 'Активные устройства',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Попробовать снова',
        actionLabel__reauthorize: 'Авторизовать сейчас',
        destructiveActionTitle: 'Удалить',
        primaryButton: 'Подключить учетную запись',
        subtitle__disconnected: 'Эта учетная запись была отключена.',
        subtitle__reauthorize:
          'Необходимые области доступа были обновлены, и вы можете столкнуться с ограниченной функциональностью. Пожалуйста, повторно авторизуйте приложение, чтобы избежать возможных проблем',
        title: 'Подключенные учетные записи',
      },
      dangerSection: {
        deleteAccountButton: 'Удалить учетную запись',
        title: 'Удаление учетной записи',
      },
      emailAddressesSection: {
        destructiveAction: 'Удалить адрес электронной почты',
        detailsAction__nonPrimary: 'Установить в качестве основного',
        detailsAction__primary: 'Завершить верификацию',
        detailsAction__unverified: 'Верифицировать',
        primaryButton: 'Добавить адрес электронной почты',
        title: 'Адреса электронной почты',
      },
      enterpriseAccountsSection: {
        title: 'Корпоративные учетные записи',
      },
      headerTitle__account: 'Учетная запись',
      headerTitle__security: 'Безопасность',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Сгенерировать коды',
          headerTitle: 'Резервные коды',
          subtitle__regenerate:
            'Получите новый набор безопасных резервных кодов. Предыдущие резервные коды будут удалены и не могут быть использованы.',
          title__regenerate: 'Сгенерировать новые резервные коды',
        },
        phoneCode: {
          actionLabel__setDefault: 'Установить по умолчанию',
          destructiveActionLabel: 'Удалить номер телефона',
        },
        primaryButton: 'Добавить двухфакторную аутентификацию',
        title: 'Двухфакторная аутентификация',
        totp: {
          destructiveActionTitle: 'Удалить',
          headerTitle: 'Приложение аутентификации',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Удалить',
        menuAction__rename: 'Переименовать',
        title: 'Ключи доступа',
      },
      passwordSection: {
        primaryButton__setPassword: 'Установить пароль',
        primaryButton__updatePassword: 'Изменить пароль',
        title: 'Пароль',
      },
      phoneNumbersSection: {
        destructiveAction: 'Удалить номер телефона',
        detailsAction__nonPrimary: 'Установить как основной',
        detailsAction__primary: 'Завершить верификацию',
        detailsAction__unverified: 'Завершить верификацию',
        primaryButton: 'Добавить номер телефона',
        title: 'Номера телефонов',
      },
      profileSection: {
        primaryButton: 'Обновить профиль',
        title: 'Профиль',
      },
      usernameSection: {
        primaryButton__setUsername: 'Установить имя пользователя',
        primaryButton__updateUsername: 'Изменить имя пользователя',
        title: 'Имя пользователя',
      },
      web3WalletsSection: {
        destructiveAction: 'Удалить кошелек',
        primaryButton: 'Web3 кошельки',
        title: 'Web3 кошельки',
      },
    },
    usernamePage: {
      successMessage: 'Имя пользователя было обновлено.',
      title__set: 'Обновить имя пользователя',
      title__update: 'Обновить имя пользователя',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} будет удален из этой учетной записи.',
        messageLine2: 'Вы больше не сможете Войти с использованием этого web3 кошелька.',
        successMessage: '{{web3Wallet}} был удален из вашей учетной записи.',
        title: 'Удалить web3 кошелек',
      },
      subtitle__availableWallets: 'Выберите web3 кошелек для подключения к вашей учетной записи.',
      subtitle__unavailableWallets: 'Нет доступных web3 кошельков.',
      successMessage: 'Кошелек был добавлен к вашей учетной записи.',
      title: 'Добавить web3 кошелек',
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
