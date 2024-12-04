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

export const beBY: LocalizationResource = {
  locale: 'be-BY',
  backButton: 'Назад',
  badge__default: 'Па-змаўчанні',
  badge__otherImpersonatorDevice: 'Іншая прылада',
  badge__primary: 'Асноўная',
  badge__requiresAction: 'Патрабуецца дзеянне',
  badge__thisDevice: 'Гэта прылада',
  badge__unverified: 'Не верыфікавана',
  badge__userDevice: 'Карыстальніцкая прылада',
  badge__you: 'Вы',
  createOrganization: {
    formButtonSubmit: 'Стварыць арганізацыю',
    invitePage: {
      formButtonReset: 'Прапусціць',
    },
    title: 'Стварыць арганізацыю',
  },
  dates: {
    lastDay: "Учора ў {{ date | timeString('be-BY') }}",
    next6Days: "{{ date | weekday('be-BY','long') }} ў {{ date | timeString('be-BY') }}",
    nextDay: "Заўтра ў {{ date | timeString('be-BY') }}",
    numeric: "{{ date | numeric('be-BY') }}",
    previous6Days: "Апошні {{ date | weekday('be-BY','long') }} ў {{ date | timeString('be-BY') }}",
    sameDay: "Сёння ў {{ date | timeString('be-BY') }}",
  },
  dividerText: 'ці',
  footerActionLink__useAnotherMethod: 'Выкарыстаць іншы метад',
  footerPageLink__help: 'Дапамога',
  footerPageLink__privacy: 'Приватнасць',
  footerPageLink__terms: 'Умовы',
  formButtonPrimary: 'Працягнуць',
  formButtonPrimary__verify: 'Праверыць',
  formFieldAction__forgotPassword: 'Забылі пароль?',
  formFieldError__matchingPasswords: 'Паролі супадаюць.',
  formFieldError__notMatchingPasswords: 'Паролі не супадаюць.',
  formFieldError__verificationLinkExpired: 'Спасылка на верыфікацыю спампавала. Калі ласка, запытайце новую спасылку.',
  formFieldHintText__optional: 'Неабавязкова',
  formFieldHintText__slug:
    'Slug — гэта чытальны ідэнтыфікатар, які павінен быць унікальным. Часто выкарыстоўваецца ў URL-ах.',
  formFieldInputPlaceholder__backupCode: 'Увядзіце рэзервовы код',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Пацвердзіць выдаленне ўліковага запісу',
  formFieldInputPlaceholder__emailAddress: 'Увядзіце ваш адрас электроннай пошты',
  formFieldInputPlaceholder__emailAddress_username: 'Увядзіце адрас электроннай пошты або імя карыстальніка',
  formFieldInputPlaceholder__emailAddresses:
    'Увядзіце або ўстаўце адзін ці некалькі адрасоў электроннай пошты, раздзяляючы іх прабеламі або коскамі',
  formFieldInputPlaceholder__firstName: 'Імя',
  formFieldInputPlaceholder__lastName: 'Прозвішча',
  formFieldInputPlaceholder__organizationDomain: 'Дамен арганізацыі (напрыклад, example.com)',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'Электронная пошта арганізацыі',
  formFieldInputPlaceholder__organizationName: 'Назва арганізацыі',
  formFieldInputPlaceholder__organizationSlug: 'slug арганізацыі (напрыклад, my-org)',
  formFieldInputPlaceholder__password: 'Увядзіце ваш пароль',
  formFieldInputPlaceholder__phoneNumber: 'Увядзіце ваш нумар тэлефона',
  formFieldInputPlaceholder__username: 'Увядзіце імя карыстальніка',
  formFieldLabel__automaticInvitations: 'Уключыць аўтаматычныя запрашэнні для гэтага дамена',
  formFieldLabel__backupCode: 'Код аднаўлення',
  formFieldLabel__confirmDeletion: 'Пацверджанне',
  formFieldLabel__confirmPassword: 'Пацверджанне пароля',
  formFieldLabel__currentPassword: 'Цяперашні пароль',
  formFieldLabel__emailAddress: 'Электронная пошта',
  formFieldLabel__emailAddress_username: 'Электронная пошта або імя карыстальніка',
  formFieldLabel__emailAddresses: 'Электронныя адрасы',
  formFieldLabel__firstName: 'Імя',
  formFieldLabel__lastName: 'Прозвішча',
  formFieldLabel__newPassword: 'Новы пароль',
  formFieldLabel__organizationDomain: 'Дамен',
  formFieldLabel__organizationDomainDeletePending: 'Выдаліць чаканыя запрашэнні і прапановы',
  formFieldLabel__organizationDomainEmailAddress: 'Электронны адрас для верыфікацыі',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Увядзіце адрас электроннай пошты пад гэтым даменам, каб атрымаць код і верыфікаваць гэты дамен.',
  formFieldLabel__organizationName: 'Назва арганізацыі',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Пароль',
  formFieldLabel__phoneNumber: 'Нумар тэлефона',
  formFieldLabel__role: 'Роля',
  formFieldLabel__signOutOfOtherSessions: 'Выйсці з усіх іншых сесій',
  formFieldLabel__username: 'Імя карыстальніка',
  impersonationFab: {
    action__signOut: 'Выйсці',
    title: 'Вы ўвайшлі як {{identifier}}',
  },
  maintenanceMode: 'Рэжым тэхнічнага абслугоўвання',
  membershipRole__admin: 'Адміністратар',
  membershipRole__basicMember: 'Удзельнік',
  membershipRole__guestMember: 'Госць',
  organizationList: {
    action__createOrganization: 'Create organization',
    action__invitationAccept: 'Join',
    action__suggestionsAccept: 'Request to join',
    createOrganization: 'Create Organization',
    invitationAcceptedLabel: 'Joined',
    subtitle: 'to continue to {{applicationName}}',
    suggestionsAcceptedLabel: 'Pending approval',
    title: 'Выберыце ўліковы запіс',
    titleWithoutPersonal: 'Выберыце арганізацыю',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Automatic invitations',
    badge__automaticSuggestion: 'Automatic suggestions',
    badge__manualInvitation: 'No automatic enrollment',
    badge__unverified: 'Unverified',
    createDomainPage: {
      subtitle:
        'Добавьте верифицированный домен. Пользователи, чья электронная почта зарегистрирована на верифицированном домене, могут присоединяться к организации автоматически или по запросу.',
      title: 'Добавить домен',
    },
    invitePage: {
      detailsTitle__inviteFailed: 'Приглашения не удалось отправить. Исправьте следующее и повторите попытку:',
      formButtonPrimary__continue: 'Отправить приглашения',
      selectDropdown__role: 'Select role',
      subtitle: 'Пригласите новых участников в эту организацию',
      successMessage: 'Приглашения успешно отправлены',
      title: 'Пригласить участников',
    },
    membersPage: {
      action__invite: 'Пригласить',
      activeMembersTab: {
        menuAction__remove: 'Удалить удзельніка',
        tableHeader__actions: 'Дзеянні',
        tableHeader__joined: 'Присоединился',
        tableHeader__role: 'Роля',
        tableHeader__user: 'Карыстальнік',
      },
      detailsTitle__emptyRow: 'Нет участников для отображения',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invite users by connecting an email domain with your organization. Anyone who signs up with a matching email domain will be able to join the organization anytime.',
          headerTitle: 'Automatic invitations',
          primaryButton: 'Manage verified domains',
        },
        table__emptyRow: 'No invitations to display',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Отозвать приглашение',
        tableHeader__invited: 'Приглашенные',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Users who sign up with a matching email domain, will be able to see a suggestion to request to join your organization.',
          headerTitle: 'Automatic suggestions',
          primaryButton: 'Manage verified domains',
        },
        menuAction__approve: 'Approve',
        menuAction__reject: 'Reject',
        tableHeader__requested: 'Requested access',
        table__emptyRow: 'No requests to display',
      },
      start: {
        headerTitle__invitations: 'Приглашения',
        headerTitle__members: 'Удзельнікі',
        headerTitle__requests: 'Заявкі',
      },
    },
    navbar: {
      description: 'Manage your organization.',
      general: 'General',
      members: 'Members',
      title: 'Organization',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Напішыце {{organizationName}} ў полі ніжэй, каб працягнуць.',
          messageLine1: 'Вы ўпэўнены, што хочаце выдаліць гэтую арганізацыю?',
          messageLine2: 'Гэта дзеянне нельга адмяніць.',
          successMessage: 'Вы выдалілі арганізацыю.',
          title: 'Выдаліць арганізацыю',
        },
        leaveOrganization: {
          actionDescription: 'Напішыце "{{organizationName}}" ніжэй, каб працягнуць.',
          messageLine1:
            'Вы ўпэўнены, што хочаце пакінуць гэтую арганізацыю? Вы страціце доступ да гэтай арганізацыі і яе прыкладанням.',
          messageLine2: 'Гэта дзеянне нельга адмяніць.',
          successMessage: 'Вы пакінулі арганізацыю.',
          title: 'Пакінуць арганізацыю',
        },
        title: 'Небяспека',
      },
      domainSection: {
        menuAction__manage: 'Кіраваць',
        menuAction__remove: 'Выдаліць',
        menuAction__verify: 'Праверыць',
        primaryButton: 'Дадаць домен',
        subtitle:
          'Дазвольце карыстальнікам аўтаматычна далучацца да арганізацыі або па запыце, калі дамен іх электроннай пошты правераны.',
        title: 'Правераныя дамены',
      },
      successMessage: 'Арганізацыя была абноўлена.',
      title: 'Профіль арганізацыі',
    },
    removeDomainPage: {
      messageLine1: 'Электронны дамен {{domain}} будзе выдалены.',
      messageLine2: 'Карыстальнікі не змогуць аўтаматычна далучацца да арганізацыі пасля гэтага.',
      successMessage: '{{domain}} быў выдалены.',
      title: 'Выдаліць дамен',
    },
    start: {
      headerTitle__general: 'Агульны',
      headerTitle__members: 'Удзельнікі',
      profileSection: {
        primaryButton: undefined,
        title: 'Профіль арганізацыі',
        uploadAction__title: 'Лагатып',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Выдаленне дамена паўплывае на запрошаных карыстальнікаў.',
        removeDomainActionLabel__remove: 'Выдаліць дамен',
        removeDomainSubtitle: 'Выдаліць гэты дамен з ліку правераных',
        removeDomainTitle: 'Выдаліць дамен',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Карыстальнікі аўтаматычна атрымліваюць запрашэнне далучыцца да арганізацыі пасля рэгістрацыі і могуць прыняць яго ў любы час без адабрэння адміністратара',
        automaticInvitationOption__label: 'Аўтаматычныя запрашэнні',
        automaticSuggestionOption__description:
          'Карыстальнікі аўтаматычна атрымліваюць запрашэнне падать заяўку на далучэнне да арганізацыі. Каб карыстальнік мог далучыцца да арганізацыі, адміністратар павінен адабраць заяўку.',
        automaticSuggestionOption__label: 'Аўтаматычныя рэкамендацыі',
        calloutInfoLabel: 'Змена спосабу далучэння паўплывае толькі на новых карыстальнікаў.',
        calloutInvitationCountLabel: 'Запрашэнняў адправлена: {{count}}',
        calloutSuggestionCountLabel: 'Рэкамендацый адправлена: {{count}}',
        manualInvitationOption__description:
          'Карыстальнікі не змогуць далучацца самастойна, можна дадаваць іх толькі ўручную.',
        manualInvitationOption__label: 'Толькі ручное дадаванне',
        subtitle:
          'Выберыце, якім чынам карыстальнікі з гэтым даменам электроннай пошты будуць далучацца да арганізацыі.',
      },
      start: {
        headerTitle__danger: 'Небяспека',
        headerTitle__enrollment: 'Спосабы далучэння',
      },
      subtitle:
        'Дамен {{domain}} правераны. Цяпер выберыце, як карыстальнікі з гэтым даменам будуць далучацца да арганізацыі.',
      title: 'Абнавіць {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Увядзіце код пацверджання, адпраўлены на ўказаную пошту',
      formTitle: 'Код пацверджання',
      resendButton: 'Не атрымалі код? Адпраўце яшчэ раз',
      subtitle: 'Домен {{domainName}} павінен быць верыфікаваны праз электронную пошту.',
      subtitleVerificationCodeScreen:
        'Код пацверджання верыфікацыі адпраўлены на пошту {{emailAddress}}. Увядзіце яго сюды, каб працягнуць.',
      title: 'Верыфікацыя дамена',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Стварыць арганізацыю',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Кіраванне арганізацыяй',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Арганізацыя не выбрана',
    personalWorkspace: 'Асабістае працоўнае прастора',
    suggestionsAcceptedLabel: 'У чаканні адабрэння',
  },
  paginationButton__next: 'Наперад',
  paginationButton__previous: 'Назад',
  paginationRowText__displaying: 'Адлюстраванне',
  paginationRowText__of: 'з',
  reverification: {
    alternativeMethods: {
      actionLink: 'Выкарыстаць альтэрнатыўны метад',
      actionText: 'Паспрабуйце іншы метад для верыфікацыі.',
      blockButton__backupCode: 'Увядзіце код з рэзервовага кода',
      blockButton__emailCode: 'Увядзіце код, адправлены на электронную пошту',
      blockButton__password: 'Увядзіце пароль',
      blockButton__phoneCode: 'Увядзіце код, адправлены на тэлефон',
      blockButton__totp: 'Выкарыстайце TOTP',
      getHelp: {
        blockButton__emailSupport: 'Звязацца з падтрымкай па электроннай пошце',
        content: 'Калі ў вас ёсць праблемы, звяжыцеся з нашай службай падтрымкі.',
        title: 'Калі ласка, звяжыцеся з намі для дапамогі.',
      },
      subtitle: 'Вы можаце паспрабаваць адзін з наступных метадаў для завяршэння верыфікацыі.',
      title: 'Альтэрнатыўныя метады верыфікацыі',
    },
    backupCodeMfa: {
      subtitle: 'Увядзіце рэзервовы код для завяршэння верыфікацыі.',
      title: 'Рэзервовы код MFA',
    },
    emailCode: {
      formTitle: 'Увядзіце код, які мы адправілі вам на email.',
      resendButton: 'Пераадправіць код на email',
      subtitle: 'Калі ласка, праверце вашу электронную пошту для кода.',
      title: 'Код з email',
    },
    noAvailableMethods: {
      message: 'Няма даступных метадаў для верыфікацыі.',
      subtitle: 'Калі ласка, выберыце іншы метад або звярніцеся ў службу падтрымкі.',
      title: 'Няма даступных метадаў верыфікацыі',
    },
    password: {
      actionLink: 'Вярнуцца да ўводу пароля',
      subtitle: 'Калі вы памятаеце свой пароль, вы можаце ўвесці яго для завершэння верыфікацыі.',
      title: 'Падцвердзіць праз пароль',
    },
    phoneCode: {
      formTitle: 'Увядзіце код, які быў адпраўлены на ваш тэлефон.',
      resendButton: 'Пераадправіць код на тэлефон',
      subtitle: 'Праверце смс-паведамленне для атрымання кода.',
      title: 'Код з тэлефона',
    },
    phoneCodeMfa: {
      formTitle: 'Увядзіце код MFA, адпраўлены на ваш тэлефон.',
      resendButton: 'Пераадправіць код MFA',
      subtitle: 'Праверце смс-паведамленне для атрымання кода MFA.',
      title: 'Код MFA з тэлефона',
    },
    totpMfa: {
      formTitle: 'Увядзіце код TOTP з вашага прыкладання.',
      subtitle: 'Вы можаце выкарыстоўваць прыкладанне для атрымання аднаразовага кода.',
      title: 'Код TOTP',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Дадаць уліковы запіс',
      action__signOutAll: 'Выйсці з усіх уліковых запісаў',
      subtitle: 'Выберыце ўліковы запіс, з якім вы жадаеце працягваць.',
      title: 'Выберыце ўліковы запіс',
    },
    alternativeMethods: {
      actionLink: 'Дапамога',
      actionText: 'Не маеце нічога з гэтага?',
      blockButton__backupCode: 'Выкарыстайце код аднаўлення',
      blockButton__emailCode: 'Адправіць код на {{identifier}}',
      blockButton__emailLink: 'Адправіць спасылку на {{identifier}}',
      blockButton__passkey: 'Выкарыстаць passkey',
      blockButton__password: 'Увайсці з паролем',
      blockButton__phoneCode: 'Адправіць код на {{identifier}}',
      blockButton__totp: 'Выкарыстайце аўтэнтыфікатар',
      getHelp: {
        blockButton__emailSupport: 'Напісаць у падтрымку',
        content:
          'Калі вы сутыкнуліся з цяжкасцямі з уваходам у ваш уліковы запіс, напішыце нам, і мы паспрабуем аднавіць ваш доступ у найкарацейшыя тэрміны.',
        title: 'Дапамога',
      },
      subtitle: 'Сустрэлі праблемы? Вы можаце выкарыстоўваць любы з гэтых метадаў для ўваходу.',
      title: 'Выкарыстаць іншы метад',
    },
    backupCodeMfa: {
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Увядзіце код аднаўлення',
    },
    emailCode: {
      formTitle: 'Код верыфікацыі',
      resendButton: 'Пераадправіць код',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Праверце вашу пошту',
    },
    emailLink: {
      clientMismatch: {
        title: 'Несумяшчальнасць з кліентам',
        subtitle:
          'Гэтая сесія не адпавядае вашаму кліенту або прыладзе. Калі ласка, пераканайцеся, што вы выкарыстоўваеце правільны запіс.',
      },
      expired: {
        subtitle: 'Верніцеся на пачатковую ўкладку, каб працягнуць.',
        title: 'Гэтая верыфікацыйная спасылка скончылася',
      },
      failed: {
        subtitle: 'Верніцеся на пачатковую ўкладку, каб працягнуць.',
        title: 'Гэтая верыфікацыйная спасылка неадэкватная.',
      },
      formSubtitle: 'Выкарыстоўвайце верыфікацыйную спасылку, адпраўленую на вашу пошту',
      formTitle: 'Верыфікацыйная спасылка',
      loading: {
        subtitle: 'Вы хутка будзеце перанакіраваны',
        title: 'Уваходзім...',
      },
      resendButton: 'Пераадправіць спасылку',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Праверце вашу пошту',
      unusedTab: {
        title: 'Укладку можна зачыніць',
      },
      verified: {
        subtitle: 'Вы хутка будзеце перанакіраваны',
        title: 'Успешны ўваход',
      },
      verifiedSwitchTab: {
        subtitle: 'Верніцеся на пачатковую ўкладку, каб працягнуць',
        subtitleNewTab: 'Верніцеся на толькі што адчыненую ўкладку, каб працягнуць',
        titleNewTab: 'Залогіньцеся на іншай укладцы',
      },
    },
    forgotPassword: {
      formTitle: 'Код аднаўлення пароля',
      resendButton: 'Адправіць код яшчэ раз',
      subtitle: 'каб скідаць ваш пароль',
      subtitle_email: 'Спачатку увядзіце код, адпраўлены на ваш адрас электроннай пошты',
      subtitle_phone: 'Спачатку увядзіце код, адпраўлены на ваш тэлефон',
      title: 'Скід пароля',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Аднавіць пароль',
      label__alternativeMethods: 'Або ўвайдзіце іншым спосабам',
      title: 'Забыўся пароль?',
    },
    noAvailableMethods: {
      message: 'Немагчыма ўвайсці. Няма даступных фактараў аўтэнтыфікацыі.',
      subtitle: 'Адбылася памылка',
      title: 'Немагчыма ўвайсці',
    },
    passkey: {
      subtitle: 'Выкарыстоўвайце паскей для бяспечнага ўваходу.',
      title: 'Увядзіце паскей',
    },
    password: {
      actionLink: 'Выкарыстаць іншы метад',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Увядзіце пароль',
    },
    passwordPwned: {
      title: 'Пароль быў узламаны',
    },
    phoneCode: {
      formTitle: 'Код верыфікацыі',
      resendButton: 'Пераадправіць код',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Праверце ваш тэлефон',
    },
    phoneCodeMfa: {
      formTitle: 'Код верыфікацыі',
      resendButton: 'Пераадправіць код',
      subtitle: 'Каб працягнуць, увядзіце код, адправлены на ваш тэлефон.',
      title: 'Праверце ваш тэлефон',
    },
    resetPassword: {
      formButtonPrimary: 'Скідаць пароль',
      requiredMessage: 'Па меркаванню бяспекі неабходна скідаць ваш пароль.',
      successMessage: 'Ваш пароль паспяхова зменены. Выконваецца ўваход, пачакайце.',
      title: 'Скідаць пароль',
    },
    resetPasswordMfa: {
      detailsLabel: 'Неабходна верыфікаваць вашу асобу перад аднаўленнем пароля',
    },
    start: {
      actionLink: 'Зарэгістравацца',
      actionLink__join_waitlist: 'Далучыцца да чаргі',
      actionLink__use_email: 'Выкарыстаць пошту',
      actionLink__use_email_username: 'Выкарыстаць пошту або імя карыстальніка',
      actionLink__use_passkey: 'Выкарыстаць паскей',
      actionLink__use_phone: 'Выкарыстаць нумар тэлефона',
      actionLink__use_username: 'Выкарыстаць імя карыстальніка',
      actionText: 'Няма ўліковага запісу?',
      actionText__join_waitlist: 'Далучыцеся да чакання',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Увайсці',
      __experimental_titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Код верыфікацыі',
      subtitle: 'Увядзіце код, атрыманы з вашага TOTP-генератара.',
      title: 'Двухфактарная верыфікацыя',
    },
  },
  signUp: {
    continue: {
      actionLink: 'Увайсці',
      actionText: 'Ужо ёсць уліковы запіс?',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Запоўніце ўсе палі',
    },
    emailCode: {
      formSubtitle: 'Увядзіце код верыфікацыі, адпраўлены вам на пошту',
      formTitle: 'Код верыфікацыі',
      resendButton: 'Пераадправіць код',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Верыфікуйце вашу пошту',
    },
    emailLink: {
      clientMismatch: {
        title: 'Падключэнне passkey',
        subtitle: 'Каб працягнуць, выкарыстоўвайце passkey для ўваходу або рэгістрацыі.',
      },
      formSubtitle: 'Выкарыстоўвайце верыфікацыйную спасылку, адпраўленую вам на пошту',
      formTitle: 'Верыфікацыйная спасылка',
      loading: {
        title: 'Уваходзім...',
      },
      resendButton: 'Пераадправіць спасылку',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Праверце вашу пошту',
      verified: {
        title: 'Успешны ўваход',
      },
      verifiedSwitchTab: {
        subtitle: 'Вярніцеся на новую адкрытую ўкладку, каб працягнуць',
        subtitleNewTab: 'Вярніцеся на папярэднюю ўкладку, каб працягнуць',
        title: 'Пошта верыфікавана',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Я згаджаюся з палітыкай канфідэнцыяльнасці',
        label__onlyTermsOfService: 'Я згаджаюся з умовамі выкарыстання',
        label__termsOfServiceAndPrivacyPolicy: 'Я згаджаюся з умовамі выкарыстання і палітыкай канфідэнцыяльнасці',
      },
      continue: {
        subtitle: 'Калі ласка, пагадзіцеся з умовамі, каб працягнуць.',
        title: 'Пагадзіцца з умовамі і працягнуць',
      },
    },
    phoneCode: {
      formSubtitle: 'Увядзіце верыфікацыйны код, адправлены на Ваш тэлефон',
      formTitle: 'Верыфікацыйны код',
      resendButton: 'Пераадправіць код',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Верыфікуйце Ваш нумар тэлефона',
    },
    restrictedAccess: {
      actionLink: 'Звяжыцеся з падтрымкай',
      actionText: 'Калі ў вас ёсць пытанні, звяртайцеся ў службу падтрымкі.',
      blockButton__emailSupport: 'Звярнуцца ў службу падтрымкі па электроннай пошце',
      blockButton__joinWaitlist: 'Далучыцца да чакальнага спісу',
      subtitle:
        'Доступ да гэтага раздзела абмежаваны. Калі ласка, звярніцеся ў службу падтрымкі для атрымання дапамогі.',
      subtitleWaitlist: 'Вы знаходзіцеся ў чакальным спісе. Мы паведамім вам, калі стане даступна.',
      title: 'Абмежаваны доступ',
    },
    start: {
      actionLink: 'Увайсці',
      actionLink__use_email: 'Увайсці з дапамогай электроннай пошты',
      actionLink__use_phone: 'Увайсці з дапамогай тэлефона',
      actionText: 'Ужо ёсць акаўнт?',
      subtitle: 'каб працягнуць працу ў "{{applicationName}}"',
      title: 'Стварыце Ваш акаўнт',
    },
  },
  socialButtonsBlockButton: 'Працягнуць з дапамогай {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: 'Увядзіце дадатковыя спосабы ўваходу',

  unstable__errors: {
    already_a_member_in_organization: 'Вы ўжо з’яўляецеся членам гэтай арганізацыі.',
    captcha_invalid:
      'Рэгістрацыя не ўдалася з-за памылак бяспекі. Калі ласка, абнавіце старонку, каб паспрабаваць яшчэ раз, або звяжыцеся са службай падтрымкі для атрымання дапамогі.',
    captcha_unavailable:
      'Рэгістрацыя не ўдалася з-за памылак праверкі ботаў. Калі ласка, абнавіце старонку, каб паспрабаваць яшчэ раз або звяжыцеся са службай падтрымкі для атрымання дапамогі.',
    form_code_incorrect: 'Невядомы код. Пераканайцеся, што вы ўвялі правільны код.',
    form_identifier_exists: 'Гэты ідэнтыфікатар ужо існуе.',
    form_identifier_exists__email_address: 'Гэты адрас электроннай пошты ўжо выкарыстоўваецца.',
    form_identifier_exists__phone_number: 'Гэты нумар тэлефона ўжо выкарыстоўваецца.',
    form_identifier_exists__username: 'Гэта імя ўжо занята.',
    form_identifier_not_found: 'Ідэнтыфікатар не знойдзены.',
    form_param_format_invalid__email_address:
      'Адрас электроннай пошты павінен быць сапраўдным адрасам электроннай пошты.',
    form_param_format_invalid__phone_number: 'Нумар тэлефона павінен быць у сапраўдным міжнародным фармаце',
    form_param_max_length_exceeded__first_name: 'Імя не павінна перавышаць 256 сімвалаў.',
    form_param_max_length_exceeded__last_name: 'Прозвішча не павінна перавышаць 256 сімвалаў.',
    form_param_max_length_exceeded__name: 'Імя не павінна перавышаць 256 сімвалаў.',
    form_param_nil: 'Гэта поле абавязковае.',
    form_param_value_invalid: 'Невядомы або недапушчальны значэнне.',
    form_password_incorrect: 'Невірны пароль.',
    form_password_length_too_short: 'Пароль занадта кароткі.',
    form_password_not_strong_enough: 'Ваш пароль недастаткова надзейны.',
    form_password_pwned: 'Гэты пароль быў узламаны і не можа быць выкарыстаны, паспрабуйце іншы пароль.',
    form_password_pwned__sign_in: 'Гэты пароль быў узламаны, калі ласка, абярыце іншы.',
    form_password_size_in_bytes_exceeded:
      'Ваш пароль перавышае максімальна дапушчальнае колькасць байтаў, скараціце яго або выдаліце некаторыя спецыяльныя сімвалы.',
    form_password_validation_failed: 'Неверагодны пароль',
    form_username_invalid_character: 'Імя карыстальніка змяшчае недапушчальныя сімвалы.',
    form_username_invalid_length: 'Імя карыстальніка павінна быць ад 3 да 50 сімвалаў.',
    identification_deletion_failed: 'Вы не можаце выдаліць вашу апошнюю ідэнтыфікацыю.',
    not_allowed_access: 'Вы не маеце правоў доступу.',
    organization_domain_blocked: 'Дамен арганізацыі заблакаван.',
    organization_domain_common: 'Дамен арганізацыі звычайны і не можа быць выкарыстаны.',
    organization_membership_quota_exceeded: 'Квота ўдзельнікаў арганізацыі перавышана.',
    organization_minimum_permissions_needed: 'Патрабуюцца мінімальныя правы доступу.',
    passkey_already_exists: 'Passkey ужо існуе. Калі ласка, выкарыстоўвайце іншы.',
    passkey_not_supported: 'Passkey не падтрымліваецца на гэтай платформе.',
    passkey_pa_not_supported: 'Passkey для гэтага прыкладання не падтрымліваецца.',
    passkey_registration_cancelled: 'Рэгістрацыя passkey была адмоўлена.',
    passkey_retrieval_cancelled: 'Атрыманне passkey было адмоўлена.',
    passwordComplexity: {
      maximumLength: 'менш за {{length}} сімвалаў',
      minimumLength: '{{length}} або больш сімвалаў',
      requireLowercase: 'літару ў ніжнім рэгістры',
      requireNumbers: 'лічбу',
      requireSpecialCharacter: 'спецыяльны сімвал',
      requireUppercase: 'літару ў верхнім рэгістры',
      sentencePrefix: 'Ваш пароль павінен утрымліваць',
    },
    phone_number_exists: 'Гэты нумар тэлефона ўжо заняты. Калі ласка, паспрабуйце іншы.',

    zxcvbn: {
      couldBeStronger: 'Ваш пароль падыходзіць, але мог бы быць надзейнейшым. Паспрабуйце дадаць больш сімвалаў.',
      goodPassword: 'Добрая праца. Гэта выдатны пароль.',
      notEnough: 'Ваш пароль недастаткова надзейны.',
      suggestions: {
        allUppercase: 'Зрабіце заглавнымі некаторыя, але не ўсе літары.',
        anotherWord: 'Дадайце больш слоў, якія менш распаўсюджаны.',
        associatedYears: 'Пазбягайце гадоў, якія звязаны з вамі.',
        capitalization: 'Зрабіце заглавнымі не толькі першую літару',
        dates: 'Пазбягайце дат і гадоў, якія звязаны з вамі.',
        l33t: 'Пазбягайце прадказальных замен літар, такіх як «@» замест «a».',
        longerKeyboardPattern:
          'Выкарыстоўвайце больш доўгія спалучэнні клавіш і некалькі разоў змяняйце напрамак уводу.',
        noNeed: 'Вы можаце ствараць надзейныя паролі без выкарыстання сімвалаў, лікаў або заглавных літар.',
        pwned: 'Калі вы выкарыстоўваеце гэты пароль у іншым месцы, вам варта змяніць яго.',
        recentYears: 'Пазбягайце апошніх гадоў.',
        repeated: 'Пазбягайце паўтаральных слоў і сімвалаў.',
        reverseWords: 'Пазбягайце адваротнага напісання часта выкарыстоўваных слоў.',
        sequences: 'Пазбягайце частых паслядоўнасцяў сімвалаў.',
        useWords: 'Выкарыстоўвайце некалькі слоў, але пазбягайце распаўсюджаных фраз.',
      },
      warnings: {
        common: 'Гэта распаўсюджаны пароль.',
        commonNames: 'Распаўсюджаныя імёны і прозвішчы лёгка адгадаць.',
        dates: 'Даты лёгка адгадаць.',
        extendedRepeat: "Паўтаральныя шаблоны сімвалаў, такія як 'abcabcabc', лёгка адгадаць.",
        keyPattern: 'Кароткія спалучэнні клавіш лёгка адгадаць.',
        namesByThemselves: 'Адзінкі імёны або прозвішчы лёгка адгадаць.',
        pwned: 'Ваш пароль быў раскрыты ў выніку ўцечкі даных у Інтэрнэце.',
        recentYears: 'Апошнія гады лёгка адгадаць.',
        sequences: "Частыя паслядоўнасці сімвалаў, такіх як 'abc', лёгка адгадаць.",
        similarToCommon: 'Гэты пароль падобны на часта выкарыстоўваны пароль.',
        simpleRepeat: "Паўтаральныя сімвалы, такія як 'aaa', лёгка адгадаць.",
        straightRow: 'Простыя шэрагі клавіш на клавіятуры лёгка адгадаць.',
        topHundred: 'Гэта часта выкарыстоўваны пароль.',
        topTen: 'Гэта вельмі часта выкарыстоўваны пароль.',
        userInputs: 'Не павінна быць ніякіх асабістых дадзеных або дадзеных, звязаных са старонкай.',
        wordByItself: 'Аднакавыя словы лёгка адгадаць.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Дадаць уліковы запіс',
    action__manageAccount: 'Кіраванне ўліковым запісам',
    action__signOut: 'Выйсці',
    action__signOutAll: 'Выйсці з усіх уліковых запісаў',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Скапіравана!',
      actionLabel__copy: 'Скапіраваць усё',
      actionLabel__download: 'Спампаваць .txt',
      actionLabel__print: 'Друкаваць',
      infoText1: 'Рэзервовыя коды будуць уключаны для гэтага ўліковага запісу.',
      infoText2:
        'Захоўвайце рэзервовыя коды ў тайне і захоўвайце іх у бяспецы. Вы можаце стварыць новыя рэзервовыя коды, калі падазраеце, што яны былі скампраметаваныя.',
      subtitle__codelist: 'Захоўвайце іх у бяспецы і не паведамляйце нікому.',
      successMessage:
        'Рэзервовыя коды ўключаны. Вы можаце выкарыстоўваць адзін з гэтых кодоў для ўваходу ў свой уліковы запіс, калі вы страціце доступ да свайго аўтэнтыфікацыйнага прылады. Кожны код можа быць выкарыстаны толькі аднойчы.',
      successSubtitle:
        'Вы можаце выкарыстоўваць адзін з гэтых кодоў для ўваходу ў свой уліковы запіс, калі вы страціце доступ да свайго аўтэнтыфікацыйнага прылады.',
      title: 'Дадаць рэзервовы код пацверджання',
      title__codelist: 'Рэзервовы коды',
    },
    connectedAccountPage: {
      formHint: 'Выберыце правайдара для падключэння вашага ўліковага запісу.',
      formHint__noAccounts: 'Няма даступных правайдараў знешніх уліковых запісаў.',
      removeResource: {
        messageLine1: '{{identifier}} будзе выдалены з вашага ўліковага запісу.',
        messageLine2:
          'Вы больш не зможаце выкарыстоўваць гэты падключаны ўліковы запіс, і любыя залежныя функцыі больш не будуць працаваць.',
        successMessage: '{{connectedAccount}} быў выдалены з вашага ўліковага запісу.',
        title: 'Выдаліць падключаны ўліковы запіс',
      },
      socialButtonsBlockButton: 'Падключыць уліковы запіс {{provider|titleize}}',
      successMessage: 'Правайдар быў дададзены ў ваш уліковы запіс',
      title: 'Дадаць падключаны ўліковы запіс',
    },
    deletePage: {
      actionDescription: "Увядзіце 'Выдаліць уліковы запіс' ніжэй, каб працягнуць.",
      confirm: 'Выдаліць уліковы запіс',
      messageLine1: 'Вы ўпэўнены, што хочаце выдаліць свой уліковы запіс?',
      messageLine2: "Гэта дзеянне з'яўляецца бессрочным і неабратным.",
      title: 'Выдаліць уліковы запіс',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'На гэты адрас электроннай пошты будзе адпраўлена ліста з верификацыйным кодам.',
        formSubtitle: 'Увядзіце верификацыйны код, адпраўлены на {{identifier}}',
        formTitle: 'Верификацыйны код',
        resendButton: 'Адправіць код паўторна',
        successMessage: 'Адрас электроннай пошты {{identifier}} быў дададзены ў ваш уліковы запіс.',
      },
      emailLink: {
        formHint: 'На гэты адрас электроннай пошты будзе адпраўлена верифікацыйная спасылка.',
        formSubtitle: 'Націсніце на верифікацыйную спасылку ў лісьце, адпраўленым на {{identifier}}',
        formTitle: 'Верифікацыйная спасылка',
        resendButton: 'Адправіць спасылку паўторна',
        successMessage: 'Адрас электроннай пошты {{identifier}} быў дададзены ў ваш уліковы запіс.',
      },
      enterpriseSsoLink: {
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      removeResource: {
        messageLine1: '{{identifier}} будзе выдалены з гэтага ўліковага запісу.',
        messageLine2: 'Вы больш не зможаце ўваходзіць, выкарыстоўваючы гэты адрас электроннай пошты.',
        successMessage: '{{emailAddress}} быў выдалены з вашага ўліковага запісу.',
        title: 'Выдаліць адрас электроннай пошты',
      },
      title: 'Дадаць адрас электроннай пошты',
      verifyTitle: 'Праверыць адрас электроннай пошты',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Працягнуць',
    formButtonPrimary__finish: 'Гатова',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Захаваць',
    formButtonReset: 'Скасаванне',
    mfaPage: {
      formHint: 'Выберыце метад для дадавання.',
      title: 'Дадаць двухфактарную аўтэнтыфікацыю',
    },
    mfaPhoneCodePage: {
      backButton: 'Выкарыстаць існуючы нумар',
      primaryButton__addPhoneNumber: 'Дадаць нумар тэлефона',
      removeResource: {
        messageLine1: '{{identifier}} больш не будзе атрымліваць коды пацверджання пры ўваходзе ў сістэму.',
        messageLine2: 'Ваша ўліковая запіс будзе менш абароненай. Вы ўпэўнены, што хочаце працягнуць?',
        successMessage: 'Двухфактарная праверка з кодам з SMS была выдалена для {{mfaPhoneCode}}',
        title: 'Выдаліць двухфактарную праверку',
      },
      subtitle__availablePhoneNumbers:
        'Выберыце нумар тэлефона для рэгістрацыі ў двухфактарнай праверцы з кодам з SMS.',
      subtitle__unavailablePhoneNumbers:
        'Няма даступных нумароў тэлефона для рэгістрацыі ў двухфактарнай праверцы з кодам з SMS.',
      successMessage1:
        'Пры ўваходзе вам неабходна будзе ўвесці код пацверджання, адпраўлены на гэты нумар тэлефона, як дадатковы крок.',
      successMessage2:
        'Захавайце гэтыя рэзервовыя коды і захоўвайце іх у бяспецы. Калі вы страціце доступ да свайго аўтэнтыфікацыйнага прылады, вы зможаце выкарыстоўваць рэзервовыя коды для ўваходу.',
      successTitle: 'Праверка кода SMS уключана',
      title: 'Дадаць праверку кодам з SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Замест гэтага адсканіруйце QR-код',
        buttonUnableToScan__nonPrimary: 'Не ўдаецца адсканаваць QR-код?',
        infoText__ableToScan:
          'Настройце новы метад уваходу ў вашым прыкладным аўтэнтыфікатары і адсканіруйце наступны QR-код, каб звязаць яго з вашай уліковай запісю.',
        infoText__unableToScan:
          'Настройце новы метад уваходу ў вашым прыкладным аўтэнтыфікатары і увядзіце ніжэй прадстаўлены ключ.',
        inputLabel__unableToScan1:
          'Упэўніцеся, што ўключаныя адзіночныя паролі на аснове часу, затым завяршыце звязванне сваёй уліковай запісю.',
        inputLabel__unableToScan2:
          'Акрамя таго, калі ваша прыкладанне аўтэнтыфікацыі падтрымлівае URI TOTP, вы таксама можаце скапіраваць поўны URI.',
      },
      removeResource: {
        messageLine1:
          'Код пацверджання з гэтага прыкладання аўтэнтыфікацыі больш не спатрэбіцца пры ўваходзе ў сістэму.',
        messageLine2: 'Ваш уліковы запіс будзе менш абароненым. Вы ўпэўнены, што хочаце працягнуць?',
        successMessage: 'Двухфактарная аўтэнтыфікацыя праз прыкладанне аўтэнтыфікацыі была выдалена.',
        title: 'Выдаліць двухфактарную аўтэнтыфікацыю',
      },
      successMessage:
        'Двухфактарная праверка ў цяперашні час уключана. Пры ўваходзе ў сістэму вам трэба будзе ўвесці код пацверджання з гэтага прыкладання як дадатковы крок.',
      title: 'Дадаць прыкладанне аўтэнтыфікацыі',
      verifySubtitle: 'Увядзіце код пацверджання, створаны вашым прыкладаннем аўтэнтыфікацыі',
      verifyTitle: 'Код пацверджання',
    },
    mobileButton__menu: 'Меню',
    navbar: {
      account: 'Профіль',
      description: 'Кіруйце інфармацыяй аб вашым уліковым запісе.',
      security: 'Бяспека',
      title: 'Уліковы запіс',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: 'Вы ўпэўнены, што хочаце выдаліць гэты passkey?',
        title: 'Выдаленне passkey',
      },
      subtitle__rename: 'Увядзіце новае імя для passkey.',
      title__rename: 'Перайменаваць passkey',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Рэкамендуецца выйсці з усіх іншых прылад, якія маглі выкарыстоўваць ваш стары пароль.',
      readonly:
        'Ваш пароль пакуль не можа быць адрэдагаваны, бо вы можаце ўвайсці толькі праз прадпрыемстваў злучэння.',
      successMessage__set: 'Ваш пароль усталяваны.',
      successMessage__signOutOfOtherSessions: 'Усе іншыя прылады былі выведзены з сістэмы.',
      successMessage__update: 'Ваш пароль быў абноўлены.',
      title__set: 'Усталяваць пароль',
      title__update: 'Змяніць пароль',
    },
    phoneNumberPage: {
      infoText: 'На гэты нумар тэлефона будзе адпраўлена тэкставае паведамленне з верифікацыйнай спасылкай.',
      removeResource: {
        messageLine1: '{{identifier}} будзе выдалены з гэтага ўліковага запісу.',
        messageLine2: 'Вы больш не зможаце ўвайсці, выкарыстоўваючы гэты нумар тэлефона.',
        successMessage: '{{phoneNumber}} быў выдалены з вашага ўліковага запісу.',
        title: 'Выдаліць нумар тэлефона',
      },
      successMessage: '{{identifier}} быў дададзены да вашага ўліковага запісу.',
      title: 'Дадаць нумар тэлефона',
      verifySubtitle: 'Увядзіце код пацверджання, адпраўлены на {{identifier}}',
      verifyTitle: 'Праверыць нумар тэлефона',
    },
    profilePage: {
      fileDropAreaHint: 'Загрузіце малюнак у фарматах JPG, PNG, GIF або WEBP памерам менш за 10 МБ',
      imageFormDestructiveActionSubtitle: 'Выдаліць малюнак',
      imageFormSubtitle: 'Загрузіць малюнак',
      imageFormTitle: 'Малюнак профілю',
      readonly: 'Ваша інфармацыя профілю была прадстаўлена прадпрыемствам злучэння і не можа быць адрэдагавана.',
      successMessage: 'Ваш профіль быў абноўлены.',
      title: 'Абнавіць профіль',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Выйсці з прылады',
        title: 'Актыўныя прылады',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Паспрабаваць зноў',
        actionLabel__reauthorize: 'Аўтарызаваць зараз',
        destructiveActionTitle: 'Выдаліць',
        primaryButton: 'Падключыць уліковы запіс',
        subtitle__disconnected: 'Злучэнне страчана, паспрабуйце падключыцца зноў.',
        subtitle__reauthorize:
          'Абноўлены неабходныя скопы, і вы можаце адчуваць абмежаваную функцыянальнасць. Калі ласка, перааўтарызуйце гэта прыкладанне, каб пазбегнуць любых праблем.',
        title: 'Падключаныя ўліковыя запісы',
      },
      dangerSection: {
        deleteAccountButton: 'Выдаліць уліковы запіс',
        title: 'Выдаленне ўліковага запісу',
      },
      emailAddressesSection: {
        destructiveAction: 'Выдаліць адрас электроннай пошты',
        detailsAction__nonPrimary: 'Усталяваць у якасці асноўнага',
        detailsAction__primary: 'Завяршыць праверку',
        detailsAction__unverified: 'Завяршыць праверку',
        primaryButton: 'Дадаць адрас электроннай пошты',
        title: 'Адрасы электроннай пошты',
      },
      enterpriseAccountsSection: {
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Уліковы запіс',
      headerTitle__security: 'Бяспека',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Сгенераваць коды',
          headerTitle: 'Рэзервовыя коды',
          subtitle__regenerate:
            'Атрымаеце новы набор бяспечных рэзервовых кодаў. Папярэднія рэзервовыя коды будуць выдалены і не могуць быць выкарыстаны.',
          title__regenerate: 'Сгенераваць новыя рэзервовыя коды',
        },
        phoneCode: {
          actionLabel__setDefault: 'Усталяваць па змаўчанні',
          destructiveActionLabel: 'Выдаліць нумар тэлефона',
        },
        primaryButton: 'Дадаць двухфактарную аўтэнтыфікацыю',
        title: 'Двухфактарная аўтэнтыфікацыя',
        totp: {
          destructiveActionTitle: 'Выдаліць',
          headerTitle: 'Прыкладное аўтэнтыфікацыі',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Выдаліць passkey',
        menuAction__rename: 'Перайменаваць passkey',
        title: 'Passkeys',
      },
      passwordSection: {
        primaryButton__setPassword: 'Усталяваць пароль',
        primaryButton__updatePassword: 'Змяніць пароль',
        title: 'Пароль',
      },
      phoneNumbersSection: {
        destructiveAction: 'Выдаліць нумар тэлефона',
        detailsAction__nonPrimary: 'Усталяваць як асноўны',
        detailsAction__primary: 'Завяршыць праверку',
        detailsAction__unverified: 'Завяршыць праверку',
        primaryButton: 'Дадаць нумар тэлефона',
        title: 'Нумары тэлефонаў',
      },
      profileSection: {
        primaryButton: 'Абнавіць профіль',
        title: 'Профіль',
      },
      usernameSection: {
        primaryButton__setUsername: 'Усталяваць імя карыстальніка',
        primaryButton__updateUsername: 'Змяніць імя карыстальніка',
        title: 'Імя карыстальніка',
      },
      web3WalletsSection: {
        destructiveAction: 'Выдаліць кашалёк',
        primaryButton: 'Web3 кашалькі',
        title: 'Web3 кашалькі',
      },
    },
    usernamePage: {
      successMessage: 'Імя карыстальніка было абноўлена.',
      title__set: 'Абнавіць імя карыстальніка',
      title__update: 'Абнавіць імя карыстальніка',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} будзе выдалены з гэтага ўліковага запісу.',
        messageLine2: 'Вы больш не зможаце ўвайсці, выкарыстоўваючы гэты web3 кашалёк.',
        successMessage: '{{web3Wallet}} быў выдалены з вашага ўліковага запісу.',
        title: 'Выдаліць web3 кашалёк',
      },
      subtitle__availableWallets: 'Выберыце web3 кашалёк для падключэння да вашага ўліковага запісу.',
      subtitle__unavailableWallets: 'Няма даступных web3 кашалькоў.',
      successMessage: 'Кашалёк быў дададзены да вашага ўліковага запісу.',
      title: 'Дадаць web3 кашалёк',
      web3WalletButtonsBlockButton: 'Падключыць web3 кашалёк',
    },
  },

  waitlist: {
    start: {
      actionLink: 'Зарэгістравацца ў чакальным спісе',
      actionText: 'Жадаеце прыєднацца да чакальнага спісу?',
      formButton: 'Далучыцца да чакальнага спісу',
      subtitle: 'Мы паведамім вам, калі месца будуць даступныя.',
      title: 'Чакальны спіс',
    },
    success: {
      message: 'Ваша заявка была паспяхова адпраўлена ў чакальны спіс.',
      subtitle: 'Дзякуй за вашае терпліванне, мы паведамім вам, калі з’явяцца месцы.',
      title: 'Вы ў чакальным спісе',
    },
  },
} as const;
