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

import type { LocalizationResource } from '@clerk/shared/types';

export const ukUA: LocalizationResource = {
  locale: 'uk-UA',
  apiKeys: {
    action__add: 'Додати новий ключ',
    action__search: 'Пошук ключів',
    copySecret: {
      formButtonPrimary__copyAndClose: 'Копіювати та закрити',
      formHint: 'З міркувань безпеки ми не дозволимо вам переглянути його пізніше.',
      formTitle: 'Скопіюйте ваш API-ключ "{{name}}" зараз',
    },
    createdAndExpirationStatus__expiresOn:
      "Створено {{ createdDate | shortDate('uk-UA') }} • Термін дії до {{ expiresDate | longDate('uk-UA') }}",
    createdAndExpirationStatus__never: "Створено {{ createdDate | shortDate('uk-UA') }} • Безстроковий",
    detailsTitle__emptyRow: 'API-ключів не знайдено',
    formButtonPrimary__add: 'Створити ключ',
    formFieldCaption__expiration__expiresOn: 'Діє до {{ date }}',
    formFieldCaption__expiration__never: 'Цей ключ безстроковий',
    formFieldOption__expiration__180d: '180 днів',
    formFieldOption__expiration__1d: '1 день',
    formFieldOption__expiration__1y: '1 рік',
    formFieldOption__expiration__30d: '30 днів',
    formFieldOption__expiration__60d: '60 днів',
    formFieldOption__expiration__7d: '7 днів',
    formFieldOption__expiration__90d: '90 днів',
    formFieldOption__expiration__never: 'Безстроково',
    formHint: 'Вкажіть назву, щоб згенерувати новий ключ. Ви зможете відкликати його в будь-який момент.',
    formTitle: 'Додати новий API-ключ',
    lastUsed__days: '{{days}} дн. тому',
    lastUsed__hours: '{{hours}} год. тому',
    lastUsed__minutes: '{{minutes}} хв. тому',
    lastUsed__months: '{{months}} міс. тому',
    lastUsed__seconds: '{{seconds}} с тому',
    lastUsed__years: '{{years}} р. тому',
    menuAction__revoke: 'Відкликати ключ',
    revokeConfirmation: {
      confirmationText: 'Відкликати',
      formButtonPrimary__revoke: 'Відкликати ключ',
      formHint: 'Ви впевнені, що хочете видалити цей секретний ключ?',
      formTitle: 'Відкликати секретний ключ "{{apiKeyName}}"?',
      inputLabel: 'Введіть "Відкликати", щоб підтвердити',
    },
    tableHeader__actions: 'Дії',
    tableHeader__lastUsed: 'Останнє використання',
    tableHeader__name: 'Назва',
  },
  backButton: 'Назад',
  badge__activePlan: 'Активний',
  badge__banned: 'Заблокований',
  badge__canceledEndsAt: "Скасовано • Завершується {{ date | shortDate('uk-UA') }}",
  badge__currentPlan: 'Поточний план',
  badge__default: 'За замовчуванням',
  badge__deprovisioned: 'Деактивовано',
  badge__endsAt: "Завершується {{ date | shortDate('uk-UA') }}",
  badge__expired: 'Термін дії минув',
  badge__freeTrial: 'Безкоштовний пробний період',
  badge__otherImpersonatorDevice: 'Інший пристрій-двійник',
  badge__pastDueAt: "Прострочено {{ date | shortDate('uk-UA') }}",
  badge__pastDuePlan: 'Прострочено',
  badge__primary: 'Основний',
  badge__renewsAt: "Поновлюється {{ date | shortDate('uk-UA') }}",
  badge__requiresAction: 'Потребує дії',
  badge__startsAt: "Починається {{ date | shortDate('uk-UA') }}",
  badge__thisDevice: 'Цей пристрій',
  badge__trialEndsAt: "Пробний період завершується {{ date | shortDate('uk-UA') }}",
  badge__unverified: 'Неперевірений',
  badge__upcomingPlan: 'Наступний',
  badge__userDevice: 'Пристрій користувача',
  badge__you: 'Ви',
  billing: {
    accountCredit: 'Кредит облікового запису',
    addPaymentMethod__label: 'Додати спосіб оплати',
    alwaysFree: 'Завжди безкоштовно',
    annually: 'Щорічно',
    availableFeatures: 'Доступні функції',
    billedAnnually: 'Оплата щорічно',
    billedAnnuallyOnly: 'Оплата лише щорічно',
    billedMonthly: 'Оплата щомісяця',
    billedMonthlyOnly: 'Оплата лише щомісяця',
    cancelFreeTrial: 'Скасувати безкоштовний пробний період',
    cancelFreeTrialAccessUntil:
      "Ваш пробний період залишатиметься активним до {{ date | longDate('uk-UA') }}. Після цього ви втратите доступ до функцій пробного періоду. Кошти не стягуватимуться.",
    cancelFreeTrialTitle: 'Скасувати безкоштовний пробний період плану {{plan}}?',
    cancelSubscription: 'Скасувати підписку',
    cancelSubscriptionAccessUntil:
      "Ви можете користуватися функціями плану '{{plan}}' до {{ date | longDate('uk-UA') }}, після чого втратите доступ.",
    cancelSubscriptionNoCharge: 'Кошти за цю підписку не стягуватимуться.',
    cancelSubscriptionPastDue:
      'Вашу підписку буде негайно завершено, і ви втратите доступ до всіх функцій плану. Під час наступної підписки вам буде запропоновано сплатити прострочену суму.',
    cancelSubscriptionTitle: 'Скасувати підписку {{plan}}?',
    cannotSubscribeMonthly:
      'Ви не можете оформити цей план зі щомісячною оплатою. Щоб підписатися на цей план, виберіть щорічну оплату.',
    cannotSubscribeUnrecoverable: 'Ви не можете підписатися на цей план. Ваша поточна підписка дорожча за цей план.',
    checkout: {
      description__paymentSuccessful: 'Ваш платіж успішно виконано.',
      description__subscriptionSuccessful: 'Вашу нову підписку оформлено.',
      downgradeNotice:
        'Ваша поточна підписка та її функції діятимуть до кінця розрахункового періоду, після чого вас буде переведено на цю підписку.',
      emailForm: {
        subtitle: 'Перш ніж завершити покупку, додайте адресу електронної пошти, на яку надсилатимуться квитанції.',
        title: 'Додайте адресу електронної пошти',
      },
      lineItems: {
        title__freeTrialEndsAt: 'Пробний період завершується',
        title__paymentMethod: 'Спосіб оплати',
        title__statementId: 'Ідентифікатор виписки',
        title__subscriptionBegins: 'Підписка починається',
        title__totalPaid: 'Усього сплачено',
      },
      pastDueNotice: 'Ваша попередня підписка була прострочена без оплати.',
      perMonth: 'на місяць',
      title: 'Оформлення замовлення',
      title__paymentSuccessful: 'Платіж успішно виконано!',
      title__subscriptionSuccessful: 'Готово!',
      title__trialSuccess: 'Пробний період успішно розпочато!',
      totalDueAfterTrial: 'Усього до сплати після завершення пробного періоду через {{days}} дн.',
      totalDuePerPeriod: 'Усього до сплати за період',
    },
    credit: 'Кредит',
    creditRemainder: 'Кредит за залишок вашої поточної підписки.',
    defaultFreePlanActive: 'Наразі ви користуєтеся безкоштовним планом',
    free: 'Безкоштовно',
    getStarted: 'Розпочати',
    highlightedPlanBadge: 'Популярний',
    keepFreeTrial: 'Залишити безкоштовний пробний період',
    keepSubscription: 'Залишити підписку',
    manage: 'Керувати',
    manageSubscription: 'Керувати підпискою',
    month: 'Місяць',
    monthAbbreviation: 'міс',
    monthPerUnit: 'Місяць за {{unitName}}',
    monthly: 'Щомісячно',
    pastDue: 'Прострочено',
    pay: 'Сплатити {{amount}}',
    payerCreditRemainder: 'Кредит із балансу рахунку.',
    paymentMethod: {
      applePayDescription: {
        annual: 'Щорічний платіж',
        monthly: 'Щомісячний платіж',
      },
      dev: {
        anyNumbers: 'Будь-які цифри',
        cardNumber: 'Номер картки',
        cvcZip: 'CVC, поштовий індекс',
        developmentMode: 'Режим розробки',
        expirationDate: 'Термін дії',
        testCardInfo: 'Дані тестової картки',
      },
    },
    paymentMethods__label: 'Способи оплати',
    pricingTable: {
      billingCycle: 'Розрахунковий період',
      included: 'Включено',
      seatCost: {
        additionalSeats: '({{additionalTierFeePerBlockAmount}}/{{periodAbbreviation}} за додаткові)',
        freeUpToSeats: 'Безкоштовно до {{endsAfterBlock}} місць',
        includedSeats: 'Включено {{includedSeats}} місць',
        perSeat: '{{feePerBlockAmount}}/{{periodAbbreviation}} за місце',
        tooltip: {
          additionalSeatsEach: 'Додаткові місця коштують {{feePerBlockAmount}}/{{period}} кожне.',
          firstSeatsIncludedInPlan: 'Перші {{endsAfterBlock}} місць включено в план.',
          freeForUpToSeats: 'Безкоштовно до {{endsAfterBlock}} місць.',
        },
        unlimitedSeats: 'Необмежена кількість місць',
        upToSeats: 'До {{endsAfterBlock}} місць',
      },
    },
    proratedDiscount: 'Пропорційна знижка',
    prorationCredit: 'Пропорційний кредит',
    reSubscribe: 'Поновити підписку',
    seatBreakdownIncludedPlural: '{{chargeable}} × {{rate}}/міс (усього: {{totalSeats}}, включено: {{included}})',
    seatBreakdownIncludedSingular: '1 місце по {{rate}}/міс (усього: {{totalSeats}}, включено: {{included}})',
    seatBreakdownPlural: '{{chargeable}} × {{rate}}/міс',
    seatBreakdownSingular: '1 місце по {{rate}}/міс',
    seats: 'Місця',
    seatsWithLimit: 'Місця (до {{limit}})',
    seeAllFeatures: 'Переглянути всі функції',
    startFreeTrial: 'Почати безкоштовний пробний період',
    startFreeTrial__days: 'Почати {{days}}-денний безкоштовний пробний період',
    subscribe: 'Підписатися',
    subscriptionDetails: {
      beginsOn: 'Починається',
      currentBillingCycle: 'Поточний розрахунковий період',
      endsOn: 'Завершується',
      firstPaymentAmount: 'Сума першого платежу',
      firstPaymentOn: 'Перший платіж',
      nextPaymentAmount: 'Сума наступного платежу',
      nextPaymentOn: 'Наступний платіж',
      pastDueAt: 'Прострочено з',
      renewsAt: 'Поновлюється',
      subscribedOn: 'Підписка оформлена',
      title: 'Підписка',
      trialEndsOn: 'Пробний період завершується',
      trialStartedOn: 'Пробний період розпочато',
    },
    subtotal: 'Проміжна сума',
    subtotalRenewal: 'Проміжна сума за період',
    switchPlan: 'Перейти на цей план',
    switchToAnnual: 'Перейти на щорічну оплату',
    switchToAnnualWithAnnualPrice: 'Перейти на щорічну оплату {{price}} / рік',
    switchToMonthly: 'Перейти на щомісячну оплату',
    switchToMonthlyWithPrice: 'Перейти на щомісячну оплату {{price}} / місяць',
    totalDue: 'Усього до сплати',
    totalDuePerPeriod: 'Усього за період',
    totalDueToday: 'Усього до сплати сьогодні',
    viewFeatures: 'Переглянути функції',
    viewPayment: 'Переглянути платіж',
    year: 'Рік',
    yearAbbreviation: 'р',
    yearPerUnit: 'Рік за {{unitName}}',
  },
  configureSSO: {
    activate: {
      activateButton: 'Активувати SSO',
      activeSubtitle: 'Усі, хто входить із {{domain}}, повинні використовувати вашого постачальника ідентифікації.',
      activeTitle: "З'єднання SSO активне",
      doneButton: 'Готово',
      skipButton: 'Пропустити поки що',
      subtitle:
        "Ваше з'єднання SSO готове. Після активації всі, хто входить із {{domain}}, повинні використовувати вашого постачальника ідентифікації.",
      title: "З'єднання SSO налаштовано",
    },
    changeProviderDialog: {
      cancelButton: 'Скасувати',
      confirmButton: 'Змінити постачальника',
      subtitle: "Перехід на {{provider}} видалить ваше з'єднання {{currentProvider}} і вимагатиме нового налаштування.",
      title: 'Змінити постачальника на {{provider}}',
    },
    configureStep: {
      activeConnectionWarning: {
        dismiss: 'Закрити',
        title:
          "Це з'єднання активне. Збережені зміни застосовуються негайно і можуть порушити вхід для поточних учасників.",
      },
      attributeMappingTable: {
        badges: {
          optional: "Необов'язковий",
          required: "Обов'язковий",
        },
      },
      oidcCustom: {
        credentialsStep: {
          clientId: {
            label: 'Ідентифікатор клієнта',
            placeholder: 'Вставте ідентифікатор клієнта сюди...',
          },
          clientSecret: {
            label: 'Секрет клієнта',
            placeholder: 'Вставте секрет клієнта сюди...',
          },
          headerSubtitle: 'Додайте облікові дані вашого застосунку',
          paragraph: 'Отримайте ці значення в OIDC-застосунку вашого постачальника ідентифікації.',
        },
        endpointsStep: {
          discoveryUrl: {
            description:
              'Отримайте discovery-ендпоінт в OIDC-застосунку вашого постачальника ідентифікації. Вставте його нижче.',
            label: 'Discovery-ендпоінт',
            placeholder: 'Вставте URL сюди...',
          },
          headerSubtitle: 'Додайте ендпоінти вашого постачальника ідентифікації',
          manual: {
            authUrl: {
              label: 'URL авторизації',
              placeholder: 'Вставте URL сюди...',
            },
            description: 'Отримайте ці значення в OIDC-застосунку вашого постачальника ідентифікації.',
            tokenUrl: {
              label: 'URL токена',
              placeholder: 'Вставте URL сюди...',
            },
            userInfoUrl: {
              label: 'URL даних користувача',
              placeholder: 'Вставте URL сюди...',
            },
          },
          modes: {
            ariaLabel: 'Спосіб налаштування ендпоінтів OIDC',
            discoveryUrl: 'Додати через discovery-ендпоінт',
            manual: 'Налаштувати вручну',
          },
        },
        mainHeaderTitle: 'Налаштуйте вашого постачальника ідентифікації',
        redirectUriStep: {
          claims: {
            description: 'Переконайтеся, що ваш ID-токен містить такі клейми:',
            table: {
              columns: {
                attribute: 'Атрибут Clerk',
                claim: 'Клейм ID-токена',
              },
              rows: {
                email: {
                  attribute: 'Основна електронна пошта',
                },
                firstName: {
                  attribute: "Ім'я",
                },
                lastName: {
                  attribute: 'Прізвище',
                },
                subject: {
                  attribute: 'Зовнішній ID користувача',
                },
              },
            },
          },
          headerSubtitle: 'Створіть новий OIDC-застосунок у панелі керування вашого постачальника ідентифікації',
          paragraph:
            'У панелі керування вашого постачальника ідентифікації створіть новий OIDC-застосунок із підтримкою типу авторизації authorization code та використайте такий redirect URI:',
          redirectUri: {
            label: 'Авторизований redirect URI',
          },
        },
      },
      samlCustom: {
        assignUsersStep: {
          headerSubtitle: 'Призначте користувачів або групи вашому SAML-застосунку',
          paragraph: 'Призначте користувачів або групи вашому застосунку, перш ніж вони зможуть входити через SSO.',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attributeName: 'Назва атрибута',
              userAttribute: 'Атрибут користувача',
            },
            rows: {
              email: {
                attributeName: 'Основна електронна пошта',
                userAttribute: 'mail',
              },
              firstName: {
                attributeName: "Ім'я",
                userAttribute: 'firstName',
              },
              lastName: {
                attributeName: 'Прізвище',
                userAttribute: 'lastName',
              },
            },
          },
          headerSubtitle: 'Зіставте атрибути користувачів вашого постачальника ідентифікації з вашим застосунком.',
          paragraph: 'Ваша SAML-відповідь повинна містити такі атрибути:',
        },
        createAppStep: {
          createAppInstructions: {
            paragraph:
              'У панелі керування вашого постачальника ідентифікації створіть новий застосунок SAML 2.0 та використайте такі дані постачальника послуг:',
          },
          headerSubtitle: 'Створіть новий SAML-застосунок у панелі керування вашого постачальника ідентифікації',
          serviceProviderFields: {
            acsUrl: {
              label: 'URL Assertion Consumer Service (ACS)',
            },
            spEntityId: {
              label: 'Entity ID',
            },
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Налаштуйте метадані постачальника ідентифікації',
          manual: {
            description: 'Отримайте ці значення в SAML-застосунку вашого постачальника ідентифікації.',
            issuer: {
              label: 'Issuer',
              placeholder: 'Вставте URL сюди...',
            },
            signOnUrl: {
              label: 'URL входу',
              placeholder: 'Вставте URL сюди...',
            },
            signingCertificate: {
              fileUploaded: 'Файл завантажено',
              label: 'Сертифікат підпису',
              removeFile: 'Видалити файл',
              replaceFile: 'Замінити файл',
              uploadFile: 'Завантажити файл',
            },
          },
          metadataUrl: {
            description:
              'Отримайте URL метаданих у SAML-застосунку вашого постачальника ідентифікації. Вставте його нижче.',
            label: 'URL метаданих',
            placeholder: 'Вставте URL сюди...',
          },
          modes: {
            ariaLabel: 'Налаштування ',
            manual: 'Налаштувати вручну',
            metadataUrl: 'Додати через метадані',
          },
        },
        mainHeaderTitle: 'Налаштуйте вашого постачальника ідентифікації',
      },
      samlGoogle: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              appAttribute: 'Атрибут застосунку',
              googleAttribute: 'Атрибут Google',
            },
            rows: {
              email: {
                appAttribute: 'email',
                googleAttribute: 'Основна електронна пошта',
              },
              firstName: {
                appAttribute: 'firstName',
                googleAttribute: "Ім'я",
              },
              lastName: {
                appAttribute: 'lastName',
                googleAttribute: 'Прізвище',
              },
            },
          },
          headerSubtitle: 'Зіставте атрибути користувачів Google Workspace з вашим застосунком',
          paragraph: "Очікується, що ваша SAML-відповідь поверне електронну пошту, ім'я та прізвище користувача.",
          step1: 'У <bold>Google Admin Console</bold> знайдіть розділ <bold>Attributes</bold>.',
          step2: 'Виберіть <bold>Add mapping</bold> для кожного атрибута та введіть такі атрибути Google і застосунку:',
        },
        configureUserAccess: {
          assignUsersInstructions: {
            paragraph1: 'Після завершення налаштування в Google вас буде перенаправлено на сторінку огляду застосунку.',
            paragraph2:
              "Google може знадобитися до 24 годин, щоб застосувати ці зміни. З'єднання залишатиметься неактивним, доки вони не наберуть чинності.",
            step1: 'Відкрийте розділ <bold>User access</bold>.',
            step2: 'Виберіть <bold>ON for everyone.</bold>',
            step3: 'Виберіть <bold>Save</bold>.',
          },
          headerSubtitle: 'Увімкніть ваш SAML-застосунок Google Workspace',
        },
        createAppStep: {
          createAppInstructions: {
            step1: 'У бічній навігації в розділі <bold>Apps</bold> виберіть <bold>Web and mobile apps.</bold>',
            step2: 'Виберіть <bold>Add app</bold>, потім <bold>Add custom SAML app.</bold>',
            step3: 'Введіть <bold>App name.</bold>',
            step4: 'Виберіть <bold>Continue</bold>.',
            title: 'У Google Workspace створіть новий SAML-застосунок:',
          },
          headerSubtitle: 'Створіть новий SAML-застосунок у Google Workspace',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Додайте метадані вашого застосунку Google Workspace',
          manual: {
            description: 'Отримайте ці значення у вашому застосунку Google Workspace.',
            issuer: {
              label: 'Entity ID',
              placeholder: 'Вставте URL сюди...',
            },
            signOnUrl: {
              label: 'SSO URL',
              placeholder: 'Вставте URL сюди...',
            },
            signingCertificate: {
              fileUploaded: 'Файл завантажено',
              label: 'Сертифікат підпису',
              removeFile: 'Видалити файл',
              replaceFile: 'Замінити файл',
              uploadFile: 'Завантажити файл',
            },
          },
          metadataFile: {
            description: 'У застосунку Google Workspace отримайте файл метаданих IdP і завантажте його нижче.',
            fileUploaded: 'Файл завантажено',
            label: 'Метадані IdP',
            removeFile: 'Видалити файл',
            replaceFile: 'Замінити файл',
            uploadFile: 'Завантажити файл',
          },
          modes: {
            ariaLabel: 'Налаштування',
            manual: 'Налаштувати вручну',
            metadataFile: 'Додати через метадані',
          },
        },
        mainHeaderTitle: 'Налаштуйте Google Workspace',
        serviceProviderStep: {
          headerSubtitle: 'Налаштуйте постачальника послуг',
          nameIdInstructions: {
            step1:
              'У розділі <bold>Name ID</bold> відкрийте випадний список формату <bold>Name ID</bold> і виберіть <bold>Email</bold>.',
            step2: 'Виберіть <bold>Continue</bold>',
          },
          paragraph:
            'Щоб налаштувати постачальника послуг, додайте ці два поля до вашого SAML-застосунку Google Workspace:',
          serviceProviderFields: {
            acsUrl: {
              label: 'ACS URL',
            },
            spEntityId: {
              label: 'Entity ID',
            },
          },
          title: 'Налаштуйте постачальника послуг',
        },
      },
      samlMicrosoft: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attribute: 'Атрибут',
              claimName: 'Назва клейму',
              value: 'Значення',
            },
            copyClaimName: 'Копіювати назву клейму',
            copyClaimNameCopied: 'Скопійовано',
            rows: {
              email: {
                attribute: 'Адреса електронної пошти',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
                value: 'user.mail',
              },
              firstName: {
                attribute: "Ім'я",
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
                value: 'user.givenname',
              },
              lastName: {
                attribute: 'Прізвище',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
                value: 'user.surname',
              },
            },
          },
          headerSubtitle: 'Налаштуйте атрибути, які Microsoft Entra включає у вашу SAML-відповідь',
          step1: 'На сторінці <bold>SAML-based Sign-on</bold> знайдіть розділ <bold>Attributes & Claims</bold>.',
          step2: 'Виберіть <bold>Edit.</bold>',
          title: 'Ваша SAML-відповідь повинна містити такі атрибути:',
        },
        createAppStep: {
          assignUsersInstructions: {
            step1: 'У розділі <bold>Getting Started</bold> виберіть <bold>Assign users and groups.</bold>',
            step2:
              'Виберіть <bold>Add user/group.</bold> Вас буде перенаправлено на сторінку <bold>Add Assignment.</bold>',
            step3: 'Виберіть посилання <bold>None Selected.</bold>',
            step4:
              'Виберіть <bold>Select</bold> унизу сторінки. Вас буде перенаправлено на сторінку <bold>Add Assignment</bold>.',
            step5: 'Виберіть <bold>Assign</bold>',
            title: 'Призначте користувачів або групи в Microsoft',
          },
          createAppInstructions: {
            step1: 'Увійдіть у Microsoft Azure Portal і перейдіть до <bold>Enterprise applications.</bold>',
            step2:
              'Натисніть <bold>New application.</bold> Вас буде перенаправлено на сторінку <bold>Browse Microsoft Entra Gallery</bold>.',
            step3: 'Виберіть <bold>Create your own application.</bold>',
            step4: {
              label: 'У вікні, що відкриється:',
              subSteps: {
                appName: 'Вкажіть назву вашого застосунку.',
                create: 'Виберіть <bold>Create</bold>.',
                nonGallery:
                  "Виберіть <bold>Integrate any other application you don't find in the gallery (Non-gallery)</bold>.",
              },
            },
            title: 'Створіть новий корпоративний застосунок',
          },
          headerSubtitle: 'Створіть новий корпоративний застосунок у вашому Azure Portal',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Додайте метадані вашого застосунку Microsoft Entra',
          manual: {
            description:
              'На сторінці <bold>SAML-based Sign-on</bold> знайдіть розділ <bold>SAML Certificates</bold>. Отримайте ці значення та додайте їх нижче.',
            issuer: {
              label: 'Issuer',
              placeholder: 'Вставте URL сюди...',
            },
            signOnUrl: {
              label: 'URL входу',
              placeholder: 'Вставте URL сюди...',
            },
            signingCertificate: {
              fileUploaded: 'Файл завантажено',
              label: 'Сертифікат підпису',
              removeFile: 'Видалити файл',
              replaceFile: 'Замінити файл',
              uploadFile: 'Завантажити файл',
            },
          },
          metadataUrl: {
            description:
              'На сторінці <bold>SAML-based Sign-on</bold> знайдіть розділ <bold>SAML Certificates</bold> і скопіюйте <bold>App Federation Metadata Url</bold>. Вставте нижче.',
            label: 'URL метаданих',
            placeholder: 'Вставте URL сюди...',
          },
          modes: {
            ariaLabel: 'Налаштування ',
            manual: 'Налаштувати вручну',
            metadataUrl: 'Додати через метадані',
          },
        },
        mainHeaderTitle: 'Налаштуйте Microsoft Entra',
        serviceProviderStep: {
          headerSubtitle: 'Додайте конфігурацію постачальника послуг у Microsoft Entra',
          serviceProviderFields: {
            acsUrl: {
              label: 'Reply URL (Assertion Consumer Service URL)',
            },
            spEntityId: {
              label: 'Identifier (Entity ID)',
            },
          },
          step1: 'У бічній навігації відкрийте випадний список <bold>Manage</bold> і виберіть Single sign-on.',
          step2: 'У розділі <bold>Select a single sign-on method</bold> виберіть <bold>SAML</bold>.',
          step3: 'Знайдіть розділ <bold>Basic SAML Configuration</bold>.',
          step4: 'Виберіть <bold>Edit</bold>. Відкриється панель <bold>Basic SAML Configuration</bold>.',
          step5:
            'Скопіюйте такі значення в поля <bold>Identifier (Entity ID)</bold> та <bold>Reply URL (ACS URL)</bold>:',
          step6: 'Виберіть <bold>Save</bold> угорі панелі. Закрийте панель.',
          title: 'Додайте дані постачальника послуг',
        },
      },
      samlOkta: {
        assignUsersStep: {
          assignUsersInstructions: {
            paragraph:
              'Призначте користувачів або групи вашому застосунку Okta, перш ніж вони зможуть входити через SSO',
            step1: 'У панелі керування Okta виберіть вкладку <bold>Assignments</bold>.',
            step2:
              'Відкрийте випадний список <bold>Assign</bold> і виберіть <bold>Assign to people</bold> або <bold>Assign to groups</bold>.',
            step3: 'Знайдіть користувача або групу для призначення.',
            step4: 'Натисніть <bold>Assign</bold> поруч із користувачем або групою.',
            step5: 'Натисніть <bold>Done.</bold>',
          },
          headerSubtitle: 'Призначте користувачів вашому застосунку Okta',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              expression: 'Вираз',
              name: 'Назва атрибута',
            },
            rows: {
              email: {
                expression: 'user.profile.email',
                name: 'mail',
              },
              firstName: {
                expression: 'user.profile.firstName',
                name: 'firstName',
              },
              lastName: {
                expression: 'user.profile.lastName',
                name: 'lastName',
              },
            },
          },
          headerSubtitle: 'Налаштуйте атрибути, які Okta включає у вашу SAML-відповідь',
          paragraph: 'Ваша SAML-відповідь повинна містити такі атрибути:',
          step1: 'У панелі керування Okta знайдіть розділ <bold>Attribute Statements</bold>.',
          step2: 'Виберіть <bold>Add Expression</bold> для кожного атрибута та введіть такі пари назв і виразів:',
        },
        createAppStep: {
          completeSamlIntegrationInstructions: {
            step1:
              'У розділі <bold>Feedback</bold> виберіть <bold>This is an internal app that we have created.</bold>',
            step2: 'Натисніть <bold>Finish</bold>, щоб завершити інтеграцію.',
            title: 'Завершіть SAML-інтеграцію',
          },
          createAppInstructions: {
            step1: 'Увійдіть в Okta і перейдіть до <bold>Admin → Applications.</bold>',
            step2: 'Натисніть <bold>Create App Integration.</bold> і виберіть <bold>SAML 2.0.</bold>',
            step3: "Заповніть General Settings. Назва застосунку обов'язкова.",
            step4: 'Натисніть <bold>Next</bold>, щоб завершити створення застосунку.',
            title: 'Створіть новий SAML-застосунок в Okta',
          },
          headerSubtitle: 'Створіть і налаштуйте SAML-застосунок у вашій панелі керування Okta',
          serviceProviderInstructions: {
            paragraph1:
              'Після заповнення <bold>General Settings</bold> ви побачите сторінку <bold>Configure SAML</bold>.',
            paragraph2: 'Додайте ці два поля до вашого застосунку Okta, щоб налаштувати постачальника послуг.',
            serviceProviderFields: {
              acsUrl: {
                label: 'Single sign-on URL',
              },
              spEntityId: {
                label: 'Audience URI (SP Entity ID)',
              },
            },
            title: 'Налаштуйте постачальника послуг',
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Додайте метадані вашого застосунку Okta',
          manual: {
            description:
              'У вашому SAML-застосунку Okta перейдіть на вкладку <bold>Sign On</bold> і отримайте ці значення.',
            issuer: {
              label: 'Issuer',
              placeholder: 'Вставте URL сюди...',
            },
            signOnUrl: {
              label: 'URL входу',
              placeholder: 'Вставте URL сюди...',
            },
            signingCertificate: {
              fileUploaded: 'Файл завантажено',
              label: 'Сертифікат підпису',
              removeFile: 'Видалити файл',
              replaceFile: 'Замінити файл',
              uploadFile: 'Завантажити файл',
            },
          },
          metadataUrl: {
            description:
              'У вашому SAML-застосунку Okta перейдіть на вкладку <bold>Sign On</bold>, отримайте URL метаданих і вставте його нижче.',
            label: 'URL метаданих',
            placeholder: 'Вставте URL сюди...',
          },
          modes: {
            ariaLabel: 'Налаштування',
            manual: 'Налаштувати вручну',
            metadataUrl: 'Додати через метадані',
          },
        },
        mainHeaderTitle: 'Налаштуйте Okta Workforce',
      },
      unsupportedProvider: {
        description:
          'Цей постачальник ідентифікації не підтримується в цій версії Clerk. Оновіться до останньої версії, щоб завершити налаштування.',
        title: 'Непідтримуваний постачальник',
      },
    },
    missingManageEnterpriseConnectionsPermission: {
      subtitle: 'Зверніться до адміністратора вашої організації, щоб розширити ваші дозволи.',
      title: 'У вас немає дозволу на керування єдиним входом (SSO)',
    },
    navbar: {
      title: 'Налаштувати єдиний вхід (SSO)',
    },
    organizationDomainsStep: {
      domainCard: {
        badge__expired: 'Термін дії минув',
        badge__unverified: 'Не підтверджено',
        badge__verified: 'Підтверджено',
        expiredAtLabel:
          "Термін дії підтвердження домену минув {{ date | shortDate('uk-UA') }}. Підтвердьте знову, щоб згенерувати новий DNS-запис.",
        expiredLabel: 'Термін дії підтвердження домену минув. Підтвердьте знову, щоб згенерувати новий DNS-запис.',
        removeButtonTooltip__lastVerifiedDomain: 'Для налаштування SSO потрібен принаймні один підтверджений домен.',
        removeButtonTooltip__lastVerifiedDomainActive:
          'Щоб SSO залишався ввімкненим, потрібен принаймні один підтверджений домен.',
        txtRecord: {
          hostLabel: 'Хост / Імʼя',
          instructions:
            'Додайте цей TXT-запис до свого DNS-провайдера. Ми перевіримо його автоматично, щойно запис стане активним.',
          typeLabel: 'Тип',
          valueLabel: 'Значення',
        },
        verifiedAtLabel: "Підтверджено {{ date | shortDate('uk-UA') }}",
        verifyAgainButton: 'Підтвердити знову',
      },
      domainSuggestion: {
        formButtonPrimary__add: 'Додати {{domain}}',
        messageLabel: 'Ваша електронна пошта використовує {{domain}}. Бажаєте додати його?',
      },
      formButtonPrimary__add: 'Додати',
      formFieldInputPlaceholder__domain: 'Додати домен',
      formFieldLabel__domain: 'Домен',
      removeDomainDialog: {
        cancelButton: 'Скасувати',
        removeButton: 'Видалити домен',
        subtitle__active:
          "Ви збираєтеся видалити {{domain}} з цього корпоративного з'єднання. Користувачі більше не зможуть входити з {{domain}}.",
        subtitle__inactive: "Ви збираєтеся видалити {{domain}} з цього корпоративного з'єднання.",
        title: 'Видалення домену',
      },
      subtitle: 'Додайте та підтвердьте право власності на домени, які ваша організація використовує для входу.',
      title: 'Додати домени SSO',
    },
    resetConnectionDialog: {
      cancelButton: 'Скасувати',
      confirmationFieldLabel: 'Введіть "{{name}}" нижче, щоб продовжити',
      confirmationFieldPlaceholder: '{{name}}',
      resetButton: "Скинути з'єднання",
      subtitle:
        "Ви впевнені, що хочете скинути з'єднання? Ця дія незворотна, і вам доведеться налаштувати всі кроки знову",
      title: "Скинути з'єднання",
    },
    selectProviderStep: {
      oidc: {
        groupLabel: 'OpenID Connect (OIDC)',
        oidcProvider: 'Постачальник OIDC',
      },
      saml: {
        customSaml: 'Користувацький постачальник SAML',
        google: 'Google Workspace',
        groupLabel: 'SAML',
        microsoft: 'Microsoft Entra (колишній AD)',
        okta: 'Okta Workforce',
      },
      subtitle: 'Виберіть постачальника, для якого ви налаштовуватимете SSO.',
      title: 'Виберіть постачальника',
      warning: 'Після вибору постачальника ви не зможете змінити його, доки не буде завершено налаштування',
    },
    testConfigurationStep: {
      error__noSuccessfulTestRun:
        'Перш ніж продовжити, потрібен принаймні один успішний тестовий запуск. Згенеруйте тестовий URL і пройдіть процес входу.',
      subtitle: "Увійдіть через тестовий URL, щоб переконатися, що ваше з'єднання SSO налаштовано правильно",
      testResults: {
        actionLabel__refresh: 'Оновити журнали',
        empty: {
          subtitle: 'Виберіть <bold>Відкрити тестовий URL</bold>, щоб запустити перший тест',
          title: 'Немає результатів тестування',
        },
        polling: 'Очікування завершення тестового запуску…',
        status__failed: 'Невдало',
        status__pending: 'В очікуванні',
        status__success: 'Успішно',
        title: 'Ваші результати тестування',
      },
      testRunDetails: {
        howToFix: {
          actionLabel__viewDocumentation: 'Переглянути документацію',
          oauth_access_denied: {
            description:
              'Ця помилка виникає, коли користувач натиснув "Скасувати" або "Відхилити" на екрані авторизації постачальника OAuth, або постачальник відхилив запит на авторизацію. Переконайтеся, що облікові дані OAuth-застосунку (Client ID і Client Secret) налаштовано правильно.',
          },
          oauth_fetch_user_error: {
            intro: 'Щоб виправити цю помилку, виконайте такі кроки:',
            step1:
              "Переконайтеся, що області доступу (scopes) OAuth, налаштовані у вашому з'єднанні, містять необхідні дозволи для читання інформації профілю користувача.",
            step2: 'Переконайтеся, що URL ендпоінта даних користувача налаштовано правильно.',
          },
          oauth_token_exchange_error: {
            description:
              'Переконайтеся, що Client ID і Client Secret вашого OAuth-застосунку налаштовано правильно і вони збігаються з обліковими даними з панелі керування вашого постачальника OAuth.',
          },
          saml_email_address_domain_mismatch: {
            description:
              "Переконайтеся, що користувач входить з адресою електронної пошти, яка відповідає одному з дозволених доменів цього з'єднання. Якщо потрібно додати інші домени, оновіть список дозволених доменів у налаштуваннях з'єднання.",
          },
          saml_response_relaystate_missing: {
            description:
              'Перевірте, що ваш постачальник ідентифікації коректно повертає параметр RelayState, надісланий у початковому запиті.',
          },
          saml_user_attribute_missing: {
            intro: 'Щоб виправити цю помилку, виконайте такі кроки:',
            step1: 'Відкрийте панель налаштувань вашого постачальника ідентифікації.',
            step2: 'Перейдіть до налаштувань SAML вашого застосунку або конфігурації зіставлення атрибутів.',
            step3:
              'Переконайтеся, що атрибут "mail" правильно зіставлено з полем адреси електронної пошти користувача.',
          },
          sectionTitle: 'Як виправити',
        },
        parsedUserInfo: {
          email: 'Електронна пошта',
          firstName: "Ім'я",
          sectionTitle: 'Розпізнані дані користувача',
        },
        runDetails: {
          actionLabel__copied: 'Скопійовано',
          actionLabel__copy: 'Копіювати повідомлення',
          errorCode: 'Код помилки',
          fullMessage: 'Повне повідомлення',
          sectionTitle: 'Деталі запуску',
          status: 'Статус',
          timestamp: 'Часова мітка',
        },
        title: 'Тестовий запуск',
      },
      testUrl: {
        actionLabel__open: 'Відкрити тестовий URL',
      },
      title: "Протестуйте ваше з'єднання SSO",
    },
  },
  createOrganization: {
    formButtonSubmit: 'Створити організацію',
    invitePage: {
      formButtonReset: 'Пропустити',
    },
    title: 'Створити організацію',
  },
  dates: {
    lastDay: "Вчора в {{ date | timeString('uk-UA') }}",
    next6Days: "{{ date | weekday('uk-UA','long') }} в {{ date | timeString('uk-UA') }}",
    nextDay: "Завтра в {{ date | timeString('uk-UA') }}",
    numeric: "{{ date | numeric('uk-UA') }}",
    previous6Days: "Останній {{ date | weekday('uk-UA','long') }} в {{ date | timeString('uk-UA') }}",
    sameDay: "Сьогодні в {{ date | timeString('uk-UA') }}",
  },
  dividerText: 'або',
  footerActionLink__alternativePhoneCodeProvider: 'Надіслати код через SMS натомість',
  footerActionLink__useAnotherMethod: 'Використовувати інший метод',
  footerPageLink__help: 'Допомога',
  footerPageLink__privacy: 'Приватність',
  footerPageLink__terms: 'Умови',
  formButtonPrimary: 'Продовжити',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Забули пароль?',
  formFieldError__matchingPasswords: 'Паролі збігаються.',
  formFieldError__notMatchingPasswords: 'Паролі не збігаються.',
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: "Необов'язково",
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__apiKeyDescription: 'Поясніть, навіщо ви генеруєте цей ключ',
  formFieldInputPlaceholder__apiKeyExpirationDate: 'Виберіть дату',
  formFieldInputPlaceholder__apiKeyName: 'Введіть назву секретного ключа',
  formFieldInputPlaceholder__backupCode: 'Введіть резервний код',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: 'Введіть вашу адресу електронної пошти',
  formFieldInputPlaceholder__emailAddress_username: "Введіть пошту або ім'я користувача",
  formFieldInputPlaceholder__emailAddresses:
    'Введіть або вставте одну або більше адрес електронної пошти, розділених пробілами або комами',
  formFieldInputPlaceholder__firstName: "Ім'я",
  formFieldInputPlaceholder__lastName: 'Прізвище',
  formFieldInputPlaceholder__organizationDomain: 'example.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'you@example.com',
  formFieldInputPlaceholder__organizationName: 'Назва організації',
  formFieldInputPlaceholder__organizationSlug: 'moia-org',
  formFieldInputPlaceholder__password: 'Введіть ваш пароль',
  formFieldInputPlaceholder__phoneNumber: 'Введіть ваш номер телефону',
  formFieldInputPlaceholder__signUpPassword: 'Створіть пароль',
  formFieldInputPlaceholder__username: "Введіть ваше ім'я користувача",
  formFieldInput__emailAddress_format: 'Приклад формату: name@example.com',
  formFieldLabel__apiKey: 'API-ключ',
  formFieldLabel__apiKeyDescription: 'Опис',
  formFieldLabel__apiKeyExpiration: 'Термін дії',
  formFieldLabel__apiKeyName: 'Назва секретного ключа',
  formFieldLabel__automaticInvitations: 'Enable automatic invitations for this domain',
  formFieldLabel__backupCode: 'Код відновлення',
  formFieldLabel__confirmDeletion: 'Підтвердження',
  formFieldLabel__confirmPassword: 'Підтвердження пароля',
  formFieldLabel__currentPassword: 'Поточний пароль',
  formFieldLabel__emailAddress: 'Пошта',
  formFieldLabel__emailAddress_username: "Пошта або ім'я користувача",
  formFieldLabel__emailAddresses: 'Поштові адреси',
  formFieldLabel__firstName: "Ім'я",
  formFieldLabel__lastName: 'Прізвище',
  formFieldLabel__newPassword: 'Новий пароль',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Назва організації',
  formFieldLabel__organizationSlug: 'URL адреса',
  formFieldLabel__passkeyName: 'Назва ключа доступу',
  formFieldLabel__password: 'Пароль',
  formFieldLabel__phoneNumber: 'Номер телефону',
  formFieldLabel__role: 'Роль',
  formFieldLabel__signOutOfOtherSessions: 'Вийти з усіх інших пристроїв',
  formFieldLabel__username: "Ім'я користувача",
  identityPreviewEditButton__emailAddress: 'Змінити адресу електронної пошти',
  identityPreviewEditButton__identifier: 'Змінити ідентифікатор',
  identityPreviewEditButton__phoneNumber: 'Змінити номер телефону',
  impersonationFab: {
    action__signOut: 'Вийти',
    title: 'Ви увійшли як {{identifier}}',
  },
  lastAuthenticationStrategy: 'Останнє використання',
  maintenanceMode: 'Наразі проводяться технічні роботи, але не хвилюйтеся, це не займе більше кількох хвилин.',
  membershipRole__admin: 'Адміністратор',
  membershipRole__basicMember: 'Член',
  membershipRole__guestMember: 'Гість',
  oauthConsent: {
    action__allow: 'Дозволити',
    action__deny: 'Відхилити',
    offlineAccessNotice: ' Ви залишатиметеся в системі, доки не вийдете або не відкличете доступ.',
    redirectNotice: 'Якщо ви дозволите доступ, цей застосунок перенаправить вас на {{domainAction}}.',
    redirectUriModal: {
      subtitle: 'Переконайтеся, що ви довіряєте {{applicationName}} і що цей URL належить {{applicationName}}.',
      title: 'URL перенаправлення',
    },
    scopeList: {
      title: 'Це надасть {{applicationName}} доступ до:',
    },
    subtitle: 'запитує доступ до {{applicationName}} від імені {{identifier}}',
    viewFullUrl: 'Переглянути повний URL',
    warning:
      'Переконайтеся, що ви довіряєте {{applicationName}} ({{domainAction}}). Ви можете передавати конфіденційні дані цьому сайту або застосунку.',
  },
  organizationList: {
    action__createOrganization: 'Create organization',
    action__invitationAccept: 'Join',
    action__suggestionsAccept: 'Request to join',
    createOrganization: 'Create Organization',
    invitationAcceptedLabel: 'Joined',
    subtitle: 'to continue to {{applicationName}}',
    suggestionsAcceptedLabel: 'Pending approval',
    title: 'Choose an account',
    titleWithoutPersonal: 'Choose an organization',
  },
  organizationProfile: {
    apiKeysPage: {
      title: 'API-ключі',
    },
    badge__automaticInvitation: 'Automatic invitations',
    badge__automaticSuggestion: 'Automatic suggestions',
    badge__enterpriseSso: 'Корпоративний SSO',
    badge__manualInvitation: 'No automatic enrollment',
    badge__unverified: 'Unverified',
    billingPage: {
      accountCreditsSection: {
        title: 'Кредити облікового запису',
        viewHistory: 'Переглянути історію кредитів',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Сума',
        tableHeader__date: 'Дата',
        title: 'Історія кредитів облікового запису',
      },
      paymentHistorySection: {
        empty: 'Історія платежів відсутня',
        notFound: 'Спробу платежу не знайдено',
        tableHeader__amount: 'Сума',
        tableHeader__date: 'Дата',
        tableHeader__status: 'Статус',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Зробити основним',
        actionLabel__remove: 'Видалити',
        add: 'Додати новий спосіб оплати',
        addSubtitle: 'Додайте новий спосіб оплати до вашого облікового запису.',
        cancelButton: 'Скасувати',
        formButtonPrimary__add: 'Додати спосіб оплати',
        formButtonPrimary__pay: 'Сплатити {{amount}}',
        payWithTestCardButton: 'Сплатити тестовою карткою',
        removeMethod: {
          messageLine1: '{{identifier}} буде видалено з цього облікового запису.',
          messageLine2:
            'Ви більше не зможете використовувати цей спосіб оплати, і всі регулярні підписки, які від нього залежать, перестануть працювати.',
          successMessage: '{{paymentMethod}} було видалено з вашого облікового запису.',
          title: 'Видалити спосіб оплати',
        },
        title: 'Способи оплати',
      },
      start: {
        headerTitle__payments: 'Платежі',
        headerTitle__plans: 'Плани',
        headerTitle__statements: 'Виписки',
        headerTitle__subscriptions: 'Підписка',
      },
      statementsSection: {
        empty: 'Немає виписок для відображення',
        itemCaption__paidForPlan: 'Оплачено план {{plan}} ({{period}})',
        itemCaption__payerCredit: 'Кредит із балансу рахунку',
        itemCaption__proratedCredit: 'Пропорційний кредит за часткове використання попередньої підписки',
        itemCaption__subscribedAndPaidForPlan: 'Оформлено підписку та оплачено план {{plan}} ({{period}})',
        notFound: 'Виписку не знайдено',
        tableHeader__amount: 'Сума',
        tableHeader__date: 'Дата',
        title: 'Виписки',
        totalPaid: 'Усього сплачено',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Керувати',
        actionLabel__newSubscription: 'Підписатися на план',
        actionLabel__switchPlan: 'Змінити план',
        includedSeatsUsage: 'Включено {{includedSeats}} місць',
        overview: 'Огляд',
        paidSeatsUsage: '{{seatsQuantity}} місць x {{amount}}',
        seatLimit: 'До {{seatLimit}} місць',
        seatLimitAndIncludedSeats: 'До {{seatLimit}} місць ({{includedSeats}} включено)',
        tableHeader__edit: 'Редагувати',
        tableHeader__plan: 'План',
        tableHeader__startDate: 'Дата початку',
        title: 'Підписка',
      },
      subscriptionsSection: {
        actionLabel__default: 'Керувати',
      },
      switchPlansSection: {
        title: 'Змінити план',
      },
      title: 'Оплата',
    },
    createDomainPage: {
      subtitle:
        'Add the domain to verify. Users with email addresses at this domain can join the organization automatically or request to join.',
      title: 'Add domain',
    },
    invitePage: {
      detailsTitle__inviteFailed: 'Запрошення не вдалося надіслати. Виправте наступне і повторіть спробу:',
      formButtonPrimary__continue: 'Надіслати запрошення',
      formButtonPrimary__purchaseSeats: 'Придбати додаткові місця',
      selectDropdown__role: 'Select role',
      subtitle: 'Запросіть нових учасників до цієї організації',
      successMessage: 'Запрошення успішно надіслано',
      title: 'Запросити учасників',
    },
    membersPage: {
      action__invite: 'Запросити',
      action__search: 'Пошук',
      activeMembersTab: {
        menuAction__remove: 'Видалити учасника',
        tableHeader__actions: 'Дії',
        tableHeader__joined: 'Приєднався',
        tableHeader__role: 'Роль',
        tableHeader__user: 'Користувач',
      },
      alerts: {
        roleSetMigrationInProgress: {
          subtitle: 'Ми оновлюємо доступні ролі. Коли це буде зроблено, ви зможете знову оновлювати ролі.',
          title: 'Ролі тимчасово заблоковані',
        },
      },
      detailsTitle__emptyRow: 'Немає учасників для відображення',
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
        menuAction__revoke: 'Відкликати запрошення',
        tableHeader__invited: 'Запрошені',
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
        headerTitle__invitations: 'Invitations',
        headerTitle__members: 'Members',
        headerTitle__requests: 'Requests',
      },
    },
    navbar: {
      apiKeys: 'API-ключі',
      billing: 'Оплата',
      description: 'Manage your organization.',
      general: 'General',
      members: 'Members',
      security: 'Безпека',
      title: 'Organization',
    },
    plansPage: {
      alerts: {
        noPermissionsToManageBilling: 'У вас немає дозволів на керування оплатою цієї організації.',
        planMembershipLimitExceeded:
          'У вашій організації {{count}} учасників (включно з очікуваними запрошеннями). Цей план дозволяє лише {{limit}} учасників.',
      },
      title: 'Плани',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Type "{{organizationName}}" below to continue.',
          messageLine1: 'Are you sure you want to delete this organization?',
          messageLine2: 'This action is permanent and irreversible.',
          successMessage: 'You have deleted the organization.',
          title: 'Delete organization',
        },
        leaveOrganization: {
          actionDescription: 'Type "{{organizationName}}" below to continue.',
          messageLine1:
            'Ви впевнені, що хочете покинути цю організацію? Ви втратите доступ до цієї організації та її додатків.',
          messageLine2: 'Ця дія є постійною і незворотною.',
          successMessage: 'Ви покинули організацію.',
          title: 'Покинути організацію',
        },
        title: 'Небезпека',
      },
      domainSection: {
        menuAction__manage: 'Manage',
        menuAction__remove: 'Delete',
        menuAction__verify: 'Verify',
        primaryButton: 'Add domain',
        subtitle:
          'Allow users to join the organization automatically or request to join based on a verified email domain.',
        title: 'Verified domains',
      },
      successMessage: 'Організацію було оновлено.',
      title: 'Профіль організації',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    securityPage: {
      removeDialog: {
        confirmButton: "Видалити з'єднання",
        subtitle:
          "Ви впевнені, що хочете видалити з'єднання? Ця дія незворотна і видаляє з'єднання та всю його конфігурацію.",
        title: "Видалити з'єднання SSO",
      },
      ssoSection: {
        badge__active: 'Активне',
        badge__inProgress: 'В процесі',
        badge__inactive: 'Неактивне',
        badge__unconfigured: 'Не налаштовано',
        descriptionLine1:
          'Вимагайте від учасників із відповідним доменом електронної пошти входити через вашого постачальника ідентифікації.',
        domainLabel: 'Домени:',
        menuAction__activate: 'Активувати',
        menuAction__deactivate: 'Деактивувати',
        menuAction__edit: 'Редагувати',
        menuAction__remove: 'Видалити',
        primaryButton__continueConfiguration: 'Продовжити налаштування',
        primaryButton__startConfiguration: 'Почати налаштування',
        title: 'SSO',
        tooltip:
          'Учасники без відповідного домену все ще можуть входити за допомогою наявних методів автентифікації. Новим учасникам буде призначено роль {{role}} у цій організації.',
        tooltipLabel: 'Докладніше',
        tooltip__noRole:
          'Учасники без відповідного домену все ще можуть входити за допомогою наявних методів автентифікації.',
      },
      title: 'Безпека',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Учасники',
      membershipSeatUsageLabel: 'Використано {{count}} з {{limit}} місць',
      profileSection: {
        primaryButton: 'Оновити профіль',
        title: 'Profile',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Removing this domain will affect invited users.',
        removeDomainActionLabel__remove: 'Remove domain',
        removeDomainSubtitle: 'Remove this domain from your verified domains',
        removeDomainTitle: 'Remove domain',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Users are automatically invited to join the organization when they sign-up and can join anytime.',
        automaticInvitationOption__label: 'Automatic invitations',
        automaticSuggestionOption__description:
          'Users receive a suggestion to request to join, but must be approved by an admin before they are able to join the organization.',
        automaticSuggestionOption__label: 'Automatic suggestions',
        calloutInfoLabel: 'Changing the enrollment mode will only affect new users.',
        calloutInvitationCountLabel: 'Pending invitations sent to users: {{count}}',
        calloutSuggestionCountLabel: 'Pending suggestions sent to users: {{count}}',
        manualInvitationOption__description: 'Users can only be invited manually to the organization.',
        manualInvitationOption__label: 'No automatic enrollment',
        subtitle: 'Choose how users from this domain can join the organization.',
      },
      start: {
        headerTitle__danger: 'Danger',
        headerTitle__enrollment: 'Enrollment options',
      },
      subtitle: 'The domain {{domain}} is now verified. Continue by selecting enrollment mode.',
      title: 'Update {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Enter the verification code sent to your email address',
      formTitle: 'Verification code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'The domain {{domainName}} needs to be verified via email.',
      subtitleVerificationCodeScreen: 'A verification code was sent to {{emailAddress}}. Enter the code to continue.',
      title: 'Verify domain',
    },
  },
  organizationSwitcher: {
    action__closeOrganizationSwitcher: 'Закрити перемикач організацій',
    action__createOrganization: 'Створити організацію',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Управління організацією',
    action__openOrganizationSwitcher: 'Відкрити перемикач організацій',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Організація не обрана',
    personalWorkspace: 'Особистий робочий простір',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Вперед',
  paginationButton__previous: 'Назад',
  paginationRowText__displaying: 'Відображення',
  paginationRowText__of: 'з',
  reverification: {
    alternativeMethods: {
      actionLink: 'Допомога',
      actionText: 'Не маєте жодного з цих методів?',
      blockButton__backupCode: 'Використати резервний код',
      blockButton__emailCode: 'Надіслати код на {{identifier}}',
      blockButton__passkey: 'Використати ключ доступу',
      blockButton__password: 'Продовжити з паролем',
      blockButton__phoneCode: 'Надіслати SMS-код на {{identifier}}',
      blockButton__totp: 'Використати додаток автентифікації',
      getHelp: {
        blockButton__emailSupport: 'Написати в підтримку',
        content:
          'Якщо у вас виникли труднощі з підтвердженням вашого облікового запису, напишіть нам, і ми попрацюємо з вами, щоб відновити доступ якнайшвидше.',
        title: 'Допомога',
      },
      subtitle: 'Виникли проблеми? Ви можете використати будь-який із цих методів для підтвердження.',
      title: 'Використати інший метод',
    },
    backupCodeMfa: {
      subtitle: 'Введіть резервний код, який ви отримали під час налаштування двоетапної перевірки',
      title: 'Введіть резервний код',
    },
    emailCode: {
      formTitle: 'Код підтвердження',
      resendButton: 'Не отримали код? Повторно відправити',
      subtitle: 'Введіть код, надісланий на вашу електронну пошту, щоб продовжити',
      title: 'Потрібне підтвердження',
    },
    noAvailableMethods: {
      message: 'Не вдається виконати підтвердження. Не налаштовано жодного відповідного фактора автентифікації',
      subtitle: 'Виникла помилка',
      title: 'Не вдалося підтвердити ваш обліковий запис',
    },
    passkey: {
      blockButton__passkey: 'Використати ключ доступу',
      subtitle:
        'Використання ключа доступу підтверджує вашу особу. Ваш пристрій може запитати відбиток пальця, обличчя або код блокування екрана.',
      title: 'Використайте ключ доступу',
    },
    password: {
      actionLink: 'Використати інший метод',
      subtitle: 'Введіть ваш поточний пароль, щоб продовжити',
      title: 'Потрібне підтвердження',
    },
    phoneCode: {
      formTitle: 'Код підтвердження',
      resendButton: 'Не отримали код? Повторно відправити',
      subtitle: 'Введіть код, надісланий на ваш телефон, щоб продовжити',
      title: 'Потрібне підтвердження',
    },
    phoneCodeMfa: {
      formTitle: 'Код підтвердження',
      resendButton: 'Не отримали код? Повторно відправити',
      subtitle: 'Введіть код, надісланий на ваш телефон, щоб продовжити',
      title: 'Потрібне підтвердження',
    },
    totpMfa: {
      formTitle: 'Код підтвердження',
      subtitle: 'Введіть код, згенерований вашим додатком автентифікації, щоб продовжити',
      title: 'Потрібне підтвердження',
    },
  },
  searchInput: {
    action__clear: 'Очистити пошук',
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Допомога',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Використовуйте код відновлення',
      blockButton__emailCode: 'Надіслати код на {{identifier}}',
      blockButton__emailLink: 'Надіслати посилання на {{identifier}}',
      blockButton__passkey: 'Увійти за допомогою ключа доступу',
      blockButton__password: 'Увійти з паролем',
      blockButton__phoneCode: 'Надіслати код на {{identifier}}',
      blockButton__totp: 'Використовуйте аутентифікатор',
      getHelp: {
        blockButton__emailSupport: 'Написати в підтримку',
        content:
          'Якщо у вас виникли труднощі з входом у Ваш акаунт, напишіть нам, і ми попрацюємо з Вами, щоб відновити доступ якнайшвидше.',
        title: 'Допомога',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Використовувати інший метод',
    },
    alternativePhoneCodeProvider: {
      formTitle: 'Код підтвердження',
      resendButton: 'Не отримали код? Повторно відправити',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      title: 'Перевірте ваш {{provider}}',
    },
    backupCodeMfa: {
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      title: 'Введіть код відновлення',
    },
    emailCode: {
      formTitle: 'Код підтвердження',
      resendButton: 'Не отримали код? Повторно відправити',
      subtitle: 'продовжити до {{applicationName}}',
      title: 'Перевірте свою електронну пошту',
    },
    emailCodeMfa: {
      formTitle: 'Перевірте свою електронну пошту',
      resendButton: 'Не отримали код? Повторно відправити',
      subtitle: 'продовжити до {{applicationName}}',
      title: 'Перевірте свою електронну пошту',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Щоб продовжити, відкрийте посилання для підтвердження на пристрої та в браузері, з яких ви розпочали вхід',
        title: 'Посилання для підтвердження недійсне для цього пристрою',
      },
      expired: {
        subtitle: 'Поверніться на початкову вкладку, щоб продовжити.',
        title: 'Термін дії цього посилання для підтвердження закінчився',
      },
      failed: {
        subtitle: 'Поверніться на початкову вкладку, щоб продовжити',
        title: 'Це посилання для підтвердження є недійсним',
      },
      formSubtitle: 'Використовуйте посилання для підтвердження, надіслане на Вашу електронну пошту',
      formTitle: 'Посилання для підтвердження',
      loading: {
        subtitle: 'Вас буде перенаправлено найближчим часом',
        title: 'Вхід в систему...',
      },
      resendButton: 'Перевідправити посилання',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      title: 'Перевірте Вашу пошту',
      unusedTab: {
        title: 'Вкладку можна закрити',
      },
      verified: {
        subtitle: 'Ви скоро будете перенаправлені',
        title: 'Успішний вхід',
      },
      verifiedSwitchTab: {
        subtitle: 'Поверніться на попередню вкладку, щоб продовжити',
        subtitleNewTab: 'Поверніться до щойно відкритої вкладки, щоб продовжити',
        titleNewTab: 'Ви ввійшли на іншій вкладці',
      },
      verifiedTransferable: {
        subtitle: 'Поверніться на початкову вкладку, щоб продовжити',
        title: 'Електронну пошту підтверджено',
      },
    },
    emailLinkMfa: {
      formSubtitle: 'Використовуйте посилання для підтвердження, надіслане на вашу електронну пошту',
      resendButton: 'Не отримали посилання? Надіслати знову',
      subtitle: 'щоб продовжити до {{applicationName}}',
      title: 'Перевірте свою електронну пошту',
    },
    enterpriseConnections: {
      subtitle: 'Виберіть корпоративний обліковий запис, з яким бажаєте продовжити.',
      title: 'Виберіть ваш корпоративний обліковий запис',
    },
    forgotPassword: {
      formTitle: 'Код відновлення пароля',
      resendButton: 'Надіслати код ще раз',
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Відновити пароль',
      label__alternativeMethods: 'Або, увійти іншим способом',
      title: 'Забули пароль?',
    },
    newDeviceVerificationNotice:
      'Ви входите з нового пристрою. Ми просимо підтвердження для забезпечення безпеки вашого облікового запису.',
    noAvailableMethods: {
      message: 'Не вдається виконати вхід. Немає доступного фактору автентифікації.',
      subtitle: 'Виникла помилка',
      title: 'Не вдалося увійти',
    },
    passkey: {
      subtitle:
        'Використання ключа доступу підтверджує, що це ви. Ваш пристрій може запитати відбиток пальця, обличчя або код блокування екрана.',
      title: 'Використайте ключ доступу',
    },
    password: {
      actionLink: 'Використати інший метод',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      title: 'Введіть пароль',
    },
    passwordCompromised: {
      title: 'Пароль скомпрометовано',
    },
    passwordPwned: {
      title: 'Пароль скомпрометовано',
    },
    passwordUntrusted: {
      title: 'Пароль може бути ненадійним',
    },
    phoneCode: {
      formTitle: 'Код підтвердження',
      resendButton: 'Не отримали код? повторно відправити',
      subtitle: 'продовжити в {{applicationName}}',
      title: 'Перевірте свій телефон',
    },
    phoneCodeMfa: {
      formTitle: 'Код підтвердження',
      resendButton: 'Не отримали код? повторно відправити',
      subtitle: 'Щоб продовжити, введіть код підтвердження, надісланий на ваш телефон',
      title: 'Перевірте свій телефон',
    },
    protectCheck: {
      loading: 'Завантаження…',
      retryButton: 'Спробувати ще раз',
      subtitle: 'Зачекайте, поки ми перевіряємо ваш запит.',
      title: 'Перевірка вашого запиту',
    },
    resetPassword: {
      formButtonPrimary: 'Скинути пароль',
      requiredMessage: 'For security reasons, it is required to reset your password.',
      successMessage: 'Ваш пароль успішно змінено. Виконується вхід, зачекайте.',
      title: 'Скинути пароль',
    },
    resetPasswordMfa: {
      detailsLabel: 'Необхідно верифікувати вашу особу перед відновленням пароля',
    },
    start: {
      actionLink: 'Зареєструватися',
      actionLink__join_waitlist: 'Приєднатися до списку очікування',
      actionLink__use_email: 'Використовувати пошту',
      actionLink__use_email_username: "Використовувати пошту або ім'я користувача",
      actionLink__use_passkey: 'Використати ключ доступу натомість',
      actionLink__use_phone: 'Використовувати номер телефону',
      actionLink__use_username: "Використовувати ім'я користувача",
      actionText: 'Немає акаунта?',
      actionText__join_waitlist: 'Бажаєте ранній доступ?',
      alternativePhoneCodeProvider: {
        actionLink: 'Використати інший метод',
        label: 'Номер телефону {{provider}}',
        subtitle: 'Введіть ваш номер телефону, щоб отримати код підтвердження в {{provider}}.',
        title: 'Увійдіть у {{applicationName}} через {{provider}}',
      },
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      subtitleCombined: undefined,
      title: 'Увійти',
      titleCombined: 'Продовжити до {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Верифікаційний код',
      subtitle: 'Щоб продовжити, введіть код підтвердження, згенерований вашим додатком автентифікації',
      title: 'Двоетапна перевірка',
    },
    web3Solana: {
      subtitle: 'Виберіть гаманець нижче, щоб увійти',
      title: 'Увійти через Solana',
    },
  },
  signInEnterPasswordTitle: 'Введіть Ваш пароль',
  signUp: {
    alternativePhoneCodeProvider: {
      resendButton: 'Не отримали код? Повторно відправити',
      subtitle: 'Введіть код підтвердження, надісланий на ваш {{provider}}',
      title: 'Підтвердьте ваш {{provider}}',
    },
    continue: {
      actionLink: 'Увійти',
      actionText: 'Уже є акаунт?',
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      title: 'Заповніть усі поля',
    },
    emailCode: {
      formSubtitle: 'Введіть код підтвердження, надісланий на вашу електронну адресу',
      formTitle: 'Код підтвердження',
      resendButton: 'Не отримали код? Повторно відправити',
      subtitle: 'продовжити до {{applicationName}}',
      title: 'Підтвердіть свою електронну пошту',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Щоб продовжити, відкрийте посилання для підтвердження на пристрої та в браузері, з яких ви розпочали реєстрацію',
        title: 'Посилання для підтвердження недійсне для цього пристрою',
      },
      formSubtitle: 'Використовуйте посилання для підтвердження, надіслане на вашу електронну адресу',
      formTitle: 'Посилання для підтвердження',
      loading: {
        title: 'Реєстрація...',
      },
      resendButton: 'Не отримали посилання? Повторно відправити',
      subtitle: 'продовжити до {{applicationName}}',
      title: 'Підтвердіть свою електронну пошту',
      verified: {
        title: 'Успішно зареєстровано',
      },
      verifiedSwitchTab: {
        subtitle: 'Поверніться на нову вкладку, щоб продовжити',
        subtitleNewTab: 'Повернутися до попередньої вкладки для продовження',
        title: 'Успішно перевірено email',
      },
    },
    enterpriseConnections: {
      subtitle: 'Виберіть корпоративний обліковий запис, з яким бажаєте продовжити.',
      title: 'Виберіть ваш корпоративний обліковий запис',
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Я погоджуюся з {{ privacyPolicyLink || link("Політикою конфіденційності") }}',
        label__onlyTermsOfService: 'Я погоджуюся з {{ termsOfServiceLink || link("Умовами використання") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Я погоджуюся з {{ termsOfServiceLink || link("Умовами використання") }} та {{ privacyPolicyLink || link("Політикою конфіденційності") }}',
      },
      continue: {
        subtitle: 'Прочитайте та прийміть умови, щоб продовжити',
        title: 'Правова згода',
      },
    },
    phoneCode: {
      formSubtitle: 'Введіть код підтвердження, надісланий на ваш номер телефону',
      formTitle: 'Код підтвердження',
      resendButton: 'Не отримали код? Повторно відправити',
      subtitle: 'продовжити з {{applicationName}}',
      title: 'Підтвердіть свій телефон',
    },
    protectCheck: {
      loading: 'Завантаження…',
      retryButton: 'Спробувати ще раз',
      subtitle: 'Зачекайте, поки ми перевіряємо ваш запит.',
      title: 'Перевірка вашого запиту',
    },
    restrictedAccess: {
      actionLink: 'Увійти',
      actionText: 'Уже є акаунт?',
      blockButton__emailSupport: 'Написати в підтримку',
      blockButton__joinWaitlist: 'Приєднатися до списку очікування',
      subtitle: 'Реєстрацію наразі вимкнено. Якщо ви вважаєте, що повинні мати доступ, зверніться до служби підтримки.',
      subtitleWaitlist:
        'Реєстрацію наразі вимкнено. Щоб першими дізнатися про запуск, приєднайтеся до списку очікування.',
      title: 'Доступ обмежено',
    },
    start: {
      actionLink: 'Увійти',
      actionLink__use_email: 'Використати електронну пошту натомість',
      actionLink__use_phone: 'Використати номер телефону натомість',
      actionText: 'Уже є акаунт?',
      alternativePhoneCodeProvider: {
        actionLink: 'Використати інший метод',
        label: 'Номер телефону {{provider}}',
        subtitle: 'Введіть ваш номер телефону, щоб отримати код підтвердження в {{provider}}.',
        title: 'Зареєструйтеся в {{applicationName}} через {{provider}}',
      },
      subtitle: 'щоб продовжити роботу в "{{applicationName}}"',
      subtitleCombined: 'щоб продовжити роботу в "{{applicationName}}"',
      title: 'Створіть Ваш акаунт',
      titleCombined: 'Створіть Ваш акаунт',
    },
    web3Solana: {
      subtitle: 'Виберіть гаманець нижче, щоб зареєструватися',
      title: 'Зареєструватися через Solana',
    },
  },
  socialButtonsBlockButton: 'Продовжити за допомогою {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  taskChooseOrganization: {
    alerts: {
      organizationAlreadyExists:
        'Організація вже існує для виявленої назви компанії ({{organizationName}}) та {{organizationDomain}}. Приєднуйтесь за запрошенням.',
    },
    chooseOrganization: {
      action__createOrganization: 'Створити нову організацію',
      action__invitationAccept: 'Приєднатися',
      action__suggestionsAccept: 'Запросити приєднання',
      subtitle: 'Приєднайтеся до існуючої організації або створіть нову',
      subtitle__createOrganizationDisabled: 'Приєднайтеся до існуючої організації',
      suggestionsAcceptedLabel: 'Очікує схвалення',
      title: 'Виберіть організацію',
    },
    createOrganization: {
      formButtonReset: 'Скасувати',
      formButtonSubmit: 'Продовжити',
      formFieldInputPlaceholder__name: 'Моя організація',
      formFieldInputPlaceholder__slug: 'moya-organizatsiya',
      formFieldLabel__name: 'Назва',
      formFieldLabel__slug: 'Slug',
      subtitle: 'Введіть дані вашої організації для продовження',
      title: 'Налаштуйте вашу організацію',
    },
    organizationCreationDisabled: {
      subtitle: 'Зверніться до адміністратора вашої організації для отримання запрошення.',
      title: 'Ви повинні належати до організації',
    },
    signOut: {
      actionLink: 'Вийти',
      actionText: 'Увійшли як {{identifier}}',
    },
  },
  taskResetPassword: {
    formButtonPrimary: 'Скинути пароль',
    signOut: {
      actionLink: 'Вийти',
      actionText: 'Увійшли як {{identifier}}',
    },
    subtitle: 'Ваш обліковий запис потребує нового пароля, перш ніж ви зможете продовжити',
    title: 'Скиньте ваш пароль',
  },
  taskSetupMfa: {
    badge: 'Налаштування двоетапної перевірки',
    signOut: {
      actionLink: 'Вийти',
      actionText: 'Увійшли як {{identifier}}',
    },
    smsCode: {
      addPhone: {
        formButtonPrimary: 'Продовжити',
        infoText:
          'На цей номер телефону буде надіслано текстове повідомлення з кодом підтвердження. Може стягуватися плата за повідомлення та передачу даних.',
      },
      addPhoneNumber: 'Додати номер телефону',
      cancel: 'Скасувати',
      subtitle:
        'Виберіть номер телефону, який ви хочете використовувати для двоетапної перевірки за допомогою SMS-коду',
      success: {
        finishButton: 'Продовжити',
        message1:
          'Двоетапну перевірку ввімкнено. Під час входу вам потрібно буде ввести код підтвердження, надісланий на цей номер телефону, як додатковий крок.',
        message2:
          'Збережіть ці резервні коди в надійному місці. Якщо ви втратите доступ до свого автентифікаційного пристрою, ви зможете увійти за допомогою резервних кодів.',
        title: 'Перевірку за допомогою SMS-коду ввімкнено',
      },
      title: 'Додати перевірку за допомогою SMS-коду',
      verifyPhone: {
        formButtonPrimary: 'Продовжити',
        formTitle: 'Код підтвердження',
        resendButton: 'Не отримали код? Повторно відправити',
        subtitle: 'Введіть код підтвердження, надісланий на',
        title: 'Підтвердьте ваш номер телефону',
      },
    },
    start: {
      methodSelection: {
        phoneCode: 'SMS-код',
        totp: 'Застосунок автентифікації',
      },
      subtitle: 'Виберіть метод, яким ви бажаєте захистити свій обліковий запис додатковим рівнем безпеки',
      title: 'Налаштуйте двоетапну перевірку',
    },
    totpCode: {
      addAuthenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Замість цього відскануйте QR-код',
        buttonUnableToScan__nonPrimary: 'Не вдається відсканувати QR-код?',
        formButtonPrimary: 'Продовжити',
        formButtonReset: 'Скасувати',
        infoText__ableToScan:
          "Налаштуйте новий метод входу у вашому застосунку автентифікації та відскануйте наступний QR-код, щоб пов'язати його з вашим обліковим записом.",
        infoText__unableToScan:
          'Налаштуйте новий метод входу у вашому застосунку автентифікації та введіть нижче наданий ключ.',
        inputLabel__unableToScan1:
          "Переконайтеся, що ввімкнено одноразові паролі на основі часу, потім завершіть зв'язування свого облікового запису.",
      },
      success: {
        finishButton: 'Продовжити',
        message1:
          'Двоетапну перевірку ввімкнено. Під час входу вам потрібно буде ввести код підтвердження з цього застосунку автентифікації як додатковий крок.',
        message2:
          'Збережіть ці резервні коди в надійному місці. Якщо ви втратите доступ до свого автентифікаційного пристрою, ви зможете увійти за допомогою резервних кодів.',
        title: 'Перевірку через застосунок автентифікації ввімкнено',
      },
      title: 'Додати застосунок автентифікації',
      verifyTotp: {
        formButtonPrimary: 'Продовжити',
        formButtonReset: 'Скасувати',
        formTitle: 'Код підтвердження',
        subtitle: 'Введіть код підтвердження, згенерований вашим застосунком автентифікації',
        title: 'Додати застосунок автентифікації',
      },
    },
  },
  unstable__errors: {
    action_blocked:
      'Цю дію не вдалося виконати. Спробуйте пізніше або зверніться до служби підтримки, якщо проблема не зникне.',
    already_a_member_in_organization: '{{email}} вже є учасником організації.',
    api_key_name_already_exists: 'API-ключ із такою назвою вже існує.',
    api_key_usage_exceeded: 'Ви досягли ліміту використання. Ви можете зняти ліміт, перейшовши на платний план.',
    avatar_file_size_exceeded: 'Розмір файлу перевищує максимальний ліміт 10 МБ. Будь ласка, виберіть менший файл.',
    avatar_file_type_invalid:
      'Тип файлу не підтримується. Будь ласка, завантажте зображення у форматі JPG, PNG, GIF або WEBP.',
    captcha_invalid:
      'Sign up unsuccessful due to failed security validations. Please refresh the page to try again or reach out to support for more assistance.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: undefined,
    form_email_address_blocked:
      'Тимчасові поштові служби не підтримуються. Будь ласка, використовуйте свою звичайну адресу електронної пошти для створення облікового запису.',
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: 'Не вдалося знайти акаунт з цими даними.',
    form_new_password_matches_current: 'Новий пароль не може збігатися з поточним паролем.',
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'Email address must be a valid email address.',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: undefined,
    form_param_type_invalid: undefined,
    form_param_type_invalid__email_address: undefined,
    form_param_type_invalid__phone_number: undefined,
    form_param_value_invalid: undefined,
    form_password_compromised__sign_in: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: 'Ваш пароль занадто короткий. Він має містити щонайменше 8 символів.',
    form_password_not_strong_enough: 'Ваш пароль недостатньо надійний.',
    form_password_or_identifier_incorrect:
      'Пароль або адреса електронної пошти невірні. Спробуйте ще раз або використайте інший метод.',
    form_password_pwned: 'Цей пароль було зламано і його не можна використовувати, спробуйте інший пароль.',
    form_password_pwned__sign_in:
      'Цей пароль було знайдено серед витоків даних, і його не можна використовувати. Будь ласка, скиньте свій пароль.',
    form_password_size_in_bytes_exceeded:
      'Ваш пароль перевищує максимально допустиму кількість байтів, скоротіть його або видаліть деякі спеціальні символи.',
    form_password_untrusted__sign_in:
      'Ваш пароль може бути скомпрометовано. Щоб захистити свій обліковий запис, продовжте за допомогою альтернативного методу входу. Після входу вам потрібно буде скинути пароль.',
    form_password_validation_failed: 'Невірний пароль',
    form_username_invalid_character: undefined,
    form_username_invalid_length: "Ім'я користувача має містити від {{min_length}} до {{max_length}} символів.",
    form_username_needs_non_number_char: "Ім'я користувача повинно містити принаймні один нецифровий символ.",
    identification_deletion_failed: 'You cannot delete your last identification.',
    insufficient_seats_change_plan:
      'У вашій організації недостатньо місць, щоб запросити бажану кількість учасників. Перейдіть на план, який підтримує кількість учасників, яких ви намагаєтеся запросити.',
    insufficient_seats_contact_support:
      'У вашій організації недостатньо місць, щоб запросити бажану кількість учасників. Зверніться до служби підтримки.',
    not_allowed_access:
      "Адреса електронної пошти або номер телефону не дозволено для реєстрації. Це може бути пов'язано з використанням '+', '=', '#' або '.' в адресі електронної пошти, використанням домену, пов'язаного з тимчасовою електронною поштою, або явного виключення.",
    oauth_access_denied: 'Ви не надали доступ до свого облікового запису.',
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded:
      'Ви досягли ліміту членства в організаціях, включно з надісланими запрошеннями.',
    organization_minimum_permissions_needed: undefined,
    organization_not_found_or_unauthorized: 'Ви більше не є учасником цієї організації. Виберіть або створіть іншу.',
    organization_not_found_or_unauthorized_with_create_organization_disabled:
      'Ви більше не є учасником цієї організації. Виберіть іншу.',
    passkey_already_exists: 'Ключ доступу вже зареєстровано на цьому пристрої.',
    passkey_not_supported: 'Ключі доступу не підтримуються на цьому пристрої.',
    passkey_pa_not_supported: 'Для реєстрації потрібен платформний автентифікатор, але пристрій його не підтримує.',
    passkey_registration_cancelled: 'Реєстрацію ключа доступу було скасовано або час очікування минув.',
    passkey_retrieval_cancelled: 'Підтвердження ключа доступу було скасовано або час очікування минув.',
    passwordComplexity: {
      maximumLength: 'менше {{length}} символів',
      minimumLength: '{{length}} або більше символів',
      requireLowercase: 'букву в нижньому регістрі',
      requireNumbers: 'цифру',
      requireSpecialCharacter: 'спеціальний символ',
      requireUppercase: 'букву у верхньому регістрі',
      sentencePrefix: 'Ваш пароль повинен містити',
    },
    phone_number_exists: 'Цей номер телефону вже використовується. Спробуйте інший.',
    protect_check_aborted: undefined,
    protect_check_already_resolved: undefined,
    protect_check_execution_failed: 'Перевірку не завершено. Спробуйте ще раз.',
    protect_check_invalid_script:
      'Не вдалося завантажити перевірку. Зверніться до служби підтримки, якщо проблема не зникне.',
    protect_check_invalid_sdk_url: 'Не вдалося розпочати перевірку. Зверніться до служби підтримки.',
    protect_check_script_load_failed:
      'Не вдалося завантажити перевірку. Це може бути спричинено проблемою з мережею або політикою Content Security Policy, яка блокує скрипт перевірки. Спробуйте ще раз або зверніться до служби підтримки.',
    protect_check_timed_out: 'Перевірку не завершено вчасно. Спробуйте ще раз.',
    protect_check_unsupported_environment:
      'Перевірка не підтримується в цьому середовищі. Продовжте у звичайному браузері або зверніться до служби підтримки.',
    session_exists: 'Ви вже увійшли в систему.',
    web3_missing_identifier: 'Не знайдено розширення Web3-гаманця. Установіть його, щоб продовжити.',
    web3_signature_request_rejected: 'Ви відхилили запит на підпис. Будь ласка, спробуйте ще раз, щоб продовжити.',
    web3_solana_signature_generation_failed:
      'Під час створення підпису сталася помилка. Будь ласка, спробуйте ще раз, щоб продовжити.',
    zxcvbn: {
      couldBeStronger: 'Ваш пароль підходить, але міг би бути надійнішим. Спробуйте додати більше символів.',
      goodPassword: 'Хороша робота. Це відмінний пароль.',
      notEnough: 'Ваш пароль недостатньо надійний.',
      suggestions: {
        allUppercase: 'Робіть великими деякі, але не всі букви.',
        anotherWord: 'Додайте більше слів, які менш поширені.',
        associatedYears: "Уникайте років, які пов'язані з вами.",
        capitalization: 'Робіть великими не тільки першу букву',
        dates: "Уникайте дат і років, які пов'язані з вами.",
        l33t: 'Уникайте передбачуваних замін букв, таких як "@" замість "a".',
        longerKeyboardPattern: 'Використовуйте довші поєднання клавіш і кілька разів змінюйте напрямок введення.',
        noNeed: 'Ви можете створювати надійні паролі без використання символів, цифр або великих літер.',
        pwned: 'Якщо ви використовуєте цей пароль в іншому місці, вам слід змінити його.',
        recentYears: 'Уникайте останніх років.',
        repeated: 'Уникайте повторюваних слів і символів.',
        reverseWords: 'Уникайте зворотного написання часто використовуваних слів.',
        sequences: 'Уникайте частих послідовностей символів.',
        useWords: 'Використовуйте кілька слів, але уникайте поширених фраз.',
      },
      warnings: {
        common: 'Це поширений пароль.',
        commonNames: 'Поширені імена та прізвища легко вгадати.',
        dates: 'Дати легко вгадати.',
        extendedRepeat: 'Шаблони символів, що повторюються, такі як "abcabcabcabc", легко вгадати.',
        keyPattern: 'Короткі поєднання клавіш легко вгадати.',
        namesByThemselves: 'Одні імена або прізвища легко вгадати.',
        pwned: 'Ваш пароль було розкрито внаслідок витоку даних в Інтернеті.',
        recentYears: 'Останні роки легко вгадати.',
        sequences: 'Часті послідовності символів, такі як "abc", легко вгадати.',
        similarToCommon: 'Цей пароль схожий на часто використовуваний пароль.',
        simpleRepeat: 'Символи, що повторюються, такі як "aaa", легко вгадати.',
        straightRow: 'Прямі ряди клавіш на клавіатурі легко вгадати.',
        topHundred: 'Це часто використовуваний пароль.',
        topTen: 'Це дуже часто використовуваний пароль.',
        userInputs: "Не повинно бути ніяких особистих даних або даних, пов'язаних зі сторінкою.",
        wordByItself: 'Окремі слова легко вгадати.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Додати акаунт',
    action__closeUserMenu: 'Закрити меню користувача',
    action__manageAccount: 'Управління акаунтом',
    action__openUserMenu: 'Відкрити меню користувача',
    action__signOut: 'Вийти',
    action__signOutAll: 'Вийти з усіх акаунтів',
    label__accountActions: 'Дії облікового запису',
    label__activeSessions: 'Активні сеанси',
    label__userButtonPopover: 'Панель облікового запису',
  },
  userProfile: {
    apiKeysPage: {
      title: 'API-ключі',
    },
    backupCodePage: {
      actionLabel__copied: 'Скопійовано!',
      actionLabel__copy: 'Копіювати все',
      actionLabel__download: 'Завантажити .txt',
      actionLabel__print: 'Друк',
      infoText1: 'Резервні коди будуть включені для цього облікового запису.',
      infoText2:
        'Зберігайте резервні коди в таємниці та зберігайте їх у безпеці. Ви можете створити нові резервні коди, якщо підозрюєте, що вони були скомпрометовані.',
      subtitle__codelist: 'Зберігайте їх у безпеці та не повідомляйте нікому.',
      successMessage:
        'Резервні коди ввімкнено. Ви можете використовувати один із цих кодів для входу до свого облікового запису, якщо ви втратите доступ до свого аутентифікаційного пристрою. Кожен код може бути використаний тільки один раз.',
      successSubtitle:
        'Ви можете використовувати один із цих кодів для входу у свій обліковий запис, якщо ви втратите доступ до свого аутентифікаційного пристрою.',
      title: 'Додати резервний код підтвердження',
      title__codelist: 'Резервні коди',
    },
    billingPage: {
      accountCreditsSection: {
        title: 'Кредити облікового запису',
        viewHistory: 'Переглянути історію кредитів',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Сума',
        tableHeader__date: 'Дата',
        title: 'Історія кредитів облікового запису',
      },
      paymentHistorySection: {
        empty: 'Історія платежів відсутня',
        notFound: 'Спробу платежу не знайдено',
        tableHeader__amount: 'Сума',
        tableHeader__date: 'Дата',
        tableHeader__status: 'Статус',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Зробити основним',
        actionLabel__remove: 'Видалити',
        add: 'Додати новий спосіб оплати',
        addSubtitle: 'Додайте новий спосіб оплати до вашого облікового запису.',
        cancelButton: 'Скасувати',
        formButtonPrimary__add: 'Додати спосіб оплати',
        formButtonPrimary__pay: 'Сплатити {{amount}}',
        payWithTestCardButton: 'Сплатити тестовою карткою',
        removeMethod: {
          messageLine1: '{{identifier}} буде видалено з цього облікового запису.',
          messageLine2:
            'Ви більше не зможете використовувати це джерело оплати, і всі регулярні підписки, які від нього залежать, перестануть працювати.',
          successMessage: '{{paymentMethod}} було видалено з вашого облікового запису.',
          title: 'Видалити спосіб оплати',
        },
        title: 'Способи оплати',
      },
      start: {
        headerTitle__payments: 'Платежі',
        headerTitle__plans: 'Плани',
        headerTitle__statements: 'Виписки',
        headerTitle__subscriptions: 'Підписка',
      },
      statementsSection: {
        empty: 'Немає виписок для відображення',
        itemCaption__paidForPlan: 'Оплачено план {{plan}} ({{period}})',
        itemCaption__payerCredit: 'Кредит із балансу рахунку',
        itemCaption__proratedCredit: 'Пропорційний кредит за часткове використання попередньої підписки',
        itemCaption__subscribedAndPaidForPlan: 'Оформлено підписку та оплачено план {{plan}} ({{period}})',
        notFound: 'Виписку не знайдено',
        tableHeader__amount: 'Сума',
        tableHeader__date: 'Дата',
        title: 'Виписки',
        totalPaid: 'Усього сплачено',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Керувати',
        actionLabel__newSubscription: 'Підписатися на план',
        actionLabel__switchPlan: 'Змінити план',
        overview: 'Огляд',
        tableHeader__edit: 'Редагувати',
        tableHeader__plan: 'План',
        tableHeader__startDate: 'Дата початку',
        title: 'Підписка',
      },
      subscriptionsSection: {
        actionLabel__default: 'Керувати',
      },
      switchPlansSection: {
        title: 'Змінити план',
      },
      title: 'Оплата',
    },
    connectedAccountPage: {
      formHint: 'Виберіть провайдера для підключення вашого акаунта.',
      formHint__noAccounts: 'Немає доступних провайдерів зовнішніх акаунтів.',
      removeResource: {
        messageLine1: '{{identifier}} буде видалено з вашого облікового запису.',
        messageLine2:
          'Ви більше не зможете використовувати цей підключений акаунт, і будь-які залежні функції більше не працюватимуть.',
        successMessage: '{{connectedAccount}} було видалено з вашого облікового запису.',
        title: 'Видалити підключений акаунт',
      },
      socialButtonsBlockButton: 'Підключити акаунт {{provider|titleize}}',
      successMessage: 'Провайдера було додано до вашого акаунта',
      title: 'Додати підключений акаунт',
    },
    deletePage: {
      actionDescription: 'Введіть "Видалити акаунт" нижче, щоб продовжити.',
      confirm: 'Видалити акаунт',
      messageLine1:
        "Ви впевнені, що хочете видалити свій обліковий запис? Деякі пов'язані дані можуть бути збережені. Щоб запросити повне видалення даних, зверніться до служби підтримки.",
      messageLine2: 'Ця дія є остаточною та незворотною.',
      title: 'Видалити акаунт',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'На цю адресу електронної пошти буде надіслано лист із верифікаційним кодом.',
        formSubtitle: 'Введіть верифікаційний код, відправлений на {{identifier}}',
        formTitle: 'Верифікаційний код',
        resendButton: 'Надіслати код повторно',
        successMessage: 'Адресу електронної пошти {{identifier}} було додано до вашого облікового запису.',
      },
      emailLink: {
        formHint: 'На цю адресу електронної пошти буде надіслано верифікаційне посилання.',
        formSubtitle: 'Натисніть на верифікаційне посилання в листі, відправленому на {{identifier}}',
        formTitle: 'Верифікаційне посилання',
        resendButton: 'Надіслати посилання повторно',
        successMessage: 'Адресу електронної пошти {{identifier}} було додано до вашого облікового запису.',
      },
      enterpriseSSOLink: {
        formButton: 'Натисніть, щоб увійти',
        formSubtitle: 'Завершіть вхід із {{identifier}}',
      },
      formHint:
        'Вам потрібно підтвердити цю адресу електронної пошти, перш ніж її можна буде додати до вашого облікового запису.',
      removeResource: {
        messageLine1: '{{identifier}} буде видалено з цього акаунта.',
        messageLine2: 'Ви більше не зможете увійти з використанням цієї адреси електронної пошти.',
        successMessage: '{{emailAddress}} було видалено з вашого облікового запису.',
        title: 'Видалити адресу електронної пошти',
      },
      title: 'Додати адресу електронної пошти',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Продовжити',
    formButtonPrimary__finish: 'Завершити',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Скасувати',
    mfaPage: {
      formHint: 'Виберіть метод для додавання.',
      title: 'Додати двофакторну аутентифікацію',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Додати номер телефону',
      removeResource: {
        messageLine1: '{{identifier}} більше не буде отримувати коди підтвердження при вході в систему.',
        messageLine2: 'Ваш обліковий запис буде менш захищеним. Ви впевнені, що хочете продовжити?',
        successMessage: 'Двоетапна перевірка з кодом з SMS була видалена для {{mfaPhoneCode}}',
        title: 'Видалити двоетапну перевірку',
      },
      subtitle__availablePhoneNumbers: 'Виберіть номер телефону для реєстрації у двоетапній перевірці з кодом з SMS.',
      subtitle__unavailablePhoneNumbers:
        'Немає доступних номерів телефону для реєстрації в двоетапній перевірці з кодом з SMS.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Додати перевірку кодом з SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Замість цього відскануйте QR-код',
        buttonUnableToScan__nonPrimary: 'Не вдається відсканувати QR-код?',
        infoText__ableToScan:
          "Налаштуйте новий метод входу у вашому застосунку аутентифікації та відскануйте наступний QR-код, щоб пов'язати його з вашим обліковим записом.",
        infoText__unableToScan:
          'Налаштуйте новий метод входу у вашому застосунку автентифікації та введіть нижче наданий ключ.',
        inputLabel__unableToScan1:
          "Переконайтеся, що ввімкнено одноразові паролі на основі часу, потім завершіть зв'язування свого облікового запису.",
        inputLabel__unableToScan2:
          'Крім того, якщо ваш додаток аутентифікації підтримує URI TOTP, ви також можете скопіювати повний URI.',
      },
      removeResource: {
        messageLine1:
          'Верифікаційний код із цього додатка автентифікації більше не буде потрібен під час входу в систему.',
        messageLine2: 'Ваш акаунт буде менш захищеним. Ви впевнені, що хочете продовжити?',
        successMessage: 'Двоетапну автентифікацію через застосунок автентифікації було видалено.',
        title: 'Видалення двоетапної аутентифікації',
      },
      successMessage:
        'Двоетапна перевірка ввімкнена. Під час входу в систему вам потрібно буде ввести верифікаційний код із цього додатка як додатковий крок.',
      title: 'Додати додаток аутентифікації',
      verifySubtitle: 'Введіть верифікаційний код, створений вашим додатком аутентифікації',
      verifyTitle: 'Верифікаційний код',
    },
    mobileButton__menu: 'Меню',
    navbar: {
      account: 'Profile',
      apiKeys: 'API-ключі',
      billing: 'Оплата',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} буде видалено з цього облікового запису.',
        title: 'Видалити ключ доступу',
      },
      subtitle__rename: 'Ви можете змінити назву ключа доступу, щоб його було легше знайти.',
      title__rename: 'Перейменувати ключ доступу',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'It is recommended to sign out of all other devices which may have used your old password.',
      readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      successMessage__set: 'Ваш пароль встановлено.',
      successMessage__signOutOfOtherSessions: 'Усі інші пристрої були виведені із системи.',
      successMessage__update: 'Ваш пароль було оновлено.',
      title__set: 'Встановити пароль',
      title__update: 'Змінити пароль',
    },
    phoneNumberPage: {
      infoText: 'На цей номер телефону буде надіслано текстове повідомлення з верифікаційним посиланням.',
      removeResource: {
        messageLine1: '{{identifier}} буде видалено з цього облікового запису.',
        messageLine2: 'Ви більше не зможете увійти, використовуючи цей номер телефону.',
        successMessage: '{{phoneNumber}} було видалено з вашого облікового запису.',
        title: 'Видалити номер телефону',
      },
      successMessage: '{{identifier}} було додано до вашого облікового запису.',
      title: 'Додати номер телефону',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    plansPage: {
      title: 'Плани',
    },
    profilePage: {
      fileDropAreaHint: 'Завантажте зображення у форматах JPG, PNG, GIF або WEBP розміром менше 10 МБ',
      imageFormDestructiveActionSubtitle: 'Видалити зображення',
      imageFormSubtitle: 'Завантажити зображення',
      imageFormTitle: 'Зображення профілю',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Ваш профіль було оновлено.',
      title: 'Оновити профіль',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Вийти з пристрою',
        title: 'Активні пристрої',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Спробувати знову',
        actionLabel__reauthorize: 'Авторизувати зараз',
        destructiveActionTitle: 'Видалити',
        primaryButton: 'Підключити акаунт',
        subtitle__disconnected: "Цей акаунт було від'єднано.",
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Підключені акаунти',
      },
      dangerSection: {
        deleteAccountButton: 'Видалити акаунт',
        title: 'Небезпека',
      },
      emailAddressesSection: {
        destructiveAction: 'Видалити адресу електронної пошти',
        detailsAction__nonPrimary: 'Встановити як основну',
        detailsAction__primary: 'Завершити перевірку',
        detailsAction__unverified: 'Завершити перевірку',
        primaryButton: 'Додати адресу електронної пошти',
        title: 'Адреси електронної пошти',
      },
      enterpriseAccountsSection: {
        primaryButton: 'Підключити акаунт',
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Обліковий запис',
      headerTitle__security: 'Безпека',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Згенерувати коди',
          headerTitle: 'Резервні коди',
          subtitle__regenerate:
            'Отримайте новий набір безпечних резервних кодів. Попередні резервні коди будуть видалені і не можуть бути використані.',
          title__regenerate: 'Згенерувати нові резервні коди',
        },
        phoneCode: {
          actionLabel__setDefault: 'Встановити за замовчуванням',
          destructiveActionLabel: 'Видалити номер телефону',
        },
        primaryButton: 'Додати двофакторну аутентифікацію',
        title: 'Двофакторна аутентифікація',
        totp: {
          destructiveActionTitle: 'Видалити',
          headerTitle: 'Додаток аутентифікації',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Видалити',
        menuAction__rename: 'Перейменувати',
        primaryButton: 'Додати ключ доступу',
        title: 'Ключі доступу',
      },
      passwordSection: {
        primaryButton__setPassword: 'Встановити пароль',
        primaryButton__updatePassword: 'Змінити пароль',
        title: 'Пароль',
      },
      phoneNumbersSection: {
        destructiveAction: 'Видалити номер телефону',
        detailsAction__nonPrimary: 'Встановити як основний',
        detailsAction__primary: 'Завершити верифікацію',
        detailsAction__unverified: 'Завершити верифікацію',
        primaryButton: 'Додати номер телефону',
        title: 'Номери телефонів',
      },
      profileSection: {
        primaryButton: 'Оновити профіль',
        title: 'Профіль',
      },
      usernameSection: {
        primaryButton__setUsername: "Встановити ім'я користувача",
        primaryButton__updateUsername: "Змінити ім'я користувача",
        title: "Ім'я користувача",
      },
      web3WalletsSection: {
        destructiveAction: 'Видалити гаманець',
        detailsAction__nonPrimary: 'Встановити як основний',
        primaryButton: 'Web3 гаманці',
        title: 'Web3 гаманці',
        web3SelectSolanaWalletScreen: {
          subtitle: 'Виберіть гаманець Solana, щоб підключити його до свого облікового запису.',
          title: 'Додати гаманець Solana',
        },
      },
    },
    usernamePage: {
      successMessage: "Ім'я користувача було оновлено.",
      title__set: "Оновити ім'я користувача",
      title__update: "Оновити ім'я користувача",
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} буде видалено з цього облікового запису.',
        messageLine2: 'Ви більше не зможете Увійти з використанням цього web3 гаманця.',
        successMessage: '{{web3Wallet}} було видалено з вашого облікового запису.',
        title: 'Видалити web3 гаманець',
      },
      subtitle__availableWallets: 'Виберіть web3 гаманець для підключення до вашого облікового запису.',
      subtitle__unavailableWallets: 'Немає доступних web3 гаманців.',
      successMessage: 'Гаманець було додано до вашого облікового запису.',
      title: 'Додати web3 гаманець',
      web3WalletButtonsBlockButton: '{{provider|titleize}}',
    },
  },
  waitlist: {
    start: {
      actionLink: 'Увійти',
      actionText: 'Вже маєте доступ?',
      formButton: 'Приєднатися до списку очікування',
      subtitle: 'Введіть свою електронну адресу, і ми повідомимо вас, коли ваше місце буде готове',
      title: 'Приєднатися до списку очікування',
    },
    success: {
      message: 'Ви будете перенаправлені незабаром...',
      subtitle: "Ми зв'яжемося з вами, коли ваше місце буде готове",
      title: 'Дякуємо за приєднання до списку очікування!',
    },
  },
  web3SolanaWalletButtons: {
    connect: 'Підключитися через {{walletName}}',
    continue: 'Продовжити через {{walletName}}',
    noneAvailable:
      'Гаманці Solana Web3 не виявлено. Установіть {{ solanaWalletsLink || link("wallet extension") }} з підтримкою Web3.',
  },
} as const;
