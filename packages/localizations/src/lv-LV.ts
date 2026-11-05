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

export const lvLV: LocalizationResource = {
  locale: 'lv-LV',
  apiKeys: {
    action__add: 'Pievienot jaunu atslēgu',
    action__search: 'Meklēt atslēgas',
    copySecret: {
      formButtonPrimary__copyAndClose: 'Kopēt un aizvērt',
      formHint: "Drošības apsvērumu dēļ mēs vairs neļausim jums to apskatīt vēlāk.",
      formTitle: 'Kopējiet savu "{{name}}" API atslēgu tagad',
    },
    createdAndExpirationStatus__expiresOn:
      "Izveidota {{ createdDate | shortDate('lv-LV') }} • Beidzas {{ expiresDate | longDate('lv-LV') }}",
    createdAndExpirationStatus__never: "Izveidota {{ createdDate | shortDate('lv-LV') }} • Nekad nebeidzas",
    detailsTitle__emptyRow: 'Nav atrasta neviena API atslēga',
    formButtonPrimary__add: 'Izveidot atslēgu',
    formFieldCaption__expiration__expiresOn: 'Beidzas {{ date }}',
    formFieldCaption__expiration__never: 'Šī atslēga nekad nebeigsies',
    formFieldOption__expiration__180d: '180 dienas',
    formFieldOption__expiration__1d: '1 diena',
    formFieldOption__expiration__1y: '1 gads',
    formFieldOption__expiration__30d: '30 dienas',
    formFieldOption__expiration__60d: '60 dienas',
    formFieldOption__expiration__7d: '7 dienas',
    formFieldOption__expiration__90d: '90 dienas',
    formFieldOption__expiration__never: 'Nekad',
    formHint: 'Norādiet nosaukumu, lai ģenerētu jaunu atslēgu. Jūs varēsiet to atsaukt jebkurā laikā.',
    formTitle: 'Pievienot jaunu API atslēgu',
    lastUsed__days: 'pirms {{days}} d',
    lastUsed__hours: 'pirms {{hours}} st',
    lastUsed__minutes: 'pirms {{minutes}} min',
    lastUsed__months: 'pirms {{months}} mēn',
    lastUsed__seconds: 'pirms {{seconds}} s',
    lastUsed__years: 'pirms {{years}} g',
    menuAction__revoke: 'Atsaukt atslēgu',
    revokeConfirmation: {
      confirmationText: 'Atsaukt',
      formButtonPrimary__revoke: 'Atsaukt atslēgu',
      formHint: 'Vai tiešām vēlaties dzēst šo slepeno atslēgu?',
      formTitle: 'Atsaukt slepeno atslēgu "{{apiKeyName}}"?',
      inputLabel: 'Ierakstiet "Atsaukt", lai apstiprinātu',
    },
    tableHeader__actions: 'Darbības',
    tableHeader__lastUsed: 'Pēdējo reizi izmantots',
    tableHeader__name: 'Nosaukums',
  },
  backButton: 'Atpakaļ',
  badge__activePlan: 'Aktīvs',
  badge__banned: 'Bloķēts',
  badge__canceledEndsAt: "Atcelts • Beidzas {{ date | shortDate('lv-LV') }}",
  badge__currentPlan: 'Pašreizējais plāns',
  badge__default: 'Noklusējums',
  badge__deprovisioned: 'Deaktivizēts',
  badge__endsAt: "Beidzas {{ date | shortDate('lv-LV') }}",
  badge__expired: 'Beidzies',
  badge__freeTrial: 'Bezmaksas izmēģinājums',
  badge__otherImpersonatorDevice: 'Cita ierīce, kas darbojas jūsu vārdā',
  badge__pastDueAt: "Nokavēts {{ date | shortDate('lv-LV') }}",
  badge__pastDuePlan: 'Nokavēts',
  badge__primary: 'Primārais',
  badge__renewsAt: "Atjaunojas {{ date | shortDate('lv-LV') }}",
  badge__requiresAction: 'Nepieciešama darbība',
  badge__startsAt: "Sākas {{ date | shortDate('lv-LV') }}",
  badge__thisDevice: 'Šī ierīce',
  badge__trialEndsAt: "Izmēģinājums beidzas {{ date | shortDate('lv-LV') }}",
  badge__unverified: 'Neverificēts',
  badge__upcomingPlan: 'Gaidāmais',
  badge__userDevice: 'Lietotāja ierīce',
  badge__you: 'Jūs',
  billing: {
    accountCredit: 'Konta kredīts',
    addPaymentMethod__label: 'Pievienot maksājuma metodi',
    alwaysFree: 'Vienmēr bezmaksas',
    annually: 'Reizi gadā',
    availableFeatures: 'Pieejamās funkcijas',
    billedAnnually: 'Apmaksa reizi gadā',
    billedAnnuallyOnly: 'Tikai ar apmaksu reizi gadā',
    billedMonthly: 'Apmaksa reizi mēnesī',
    billedMonthlyOnly: 'Tikai ar apmaksu reizi mēnesī',
    cancelFreeTrial: 'Atcelt bezmaksas izmēģinājumu',
    cancelFreeTrialAccessUntil:
      "Jūsu izmēģinājums paliks aktīvs līdz {{ date | longDate('lv-LV') }}. Pēc tam jūs zaudēsiet piekļuvi izmēģinājuma funkcijām. No jums netiks iekasēta maksa.",
    cancelFreeTrialTitle: 'Atcelt bezmaksas izmēģinājumu plānam {{plan}}?',
    cancelSubscription: 'Atcelt abonementu',
    cancelSubscriptionAccessUntil:
      "Jūs varat turpināt lietot '{{plan}}' funkcijas līdz {{ date | longDate('lv-LV') }}, pēc tam jums vairs nebūs piekļuves.",
    cancelSubscriptionNoCharge: 'Par šo abonementu no jums netiks iekasēta maksa.',
    cancelSubscriptionPastDue:
      'Jūsu abonements tiks nekavējoties pārtraukts, un jūs zaudēsiet piekļuvi visām plāna funkcijām. Jums tiks lūgts samaksāt nokavēto summu nākamajā abonementā.',
    cancelSubscriptionTitle: 'Atcelt {{plan}} abonementu?',
    cannotSubscribeMonthly:
      'Jūs nevarat abonēt šo plānu, maksājot reizi mēnesī. Lai abonētu šo plānu, jums jāizvēlas maksāt reizi gadā.',
    cannotSubscribeUnrecoverable:
      'Jūs nevarat abonēt šo plānu. Jūsu pašreizējais abonements ir dārgāks par šo plānu.',
    checkout: {
      addPromoCode: 'Pievienot reklāmas kodu',
      applyPromoCode: 'Lietot',
      description__paymentSuccessful: 'Jūsu maksājums bija veiksmīgs.',
      description__subscriptionSuccessful: 'Jūsu jaunais abonements ir gatavs.',
      discount: 'Atlaide',
      downgradeNotice:
        'Jūs saglabāsiet pašreizējo abonementu un tā funkcijas līdz norēķinu cikla beigām, pēc tam jūs tiksiet pārslēgts uz šo abonementu.',
      emailForm: {
        subtitle: 'Pirms pirkuma pabeigšanas jums jāpievieno e-pasta adrese, uz kuru tiks sūtīti čeki.',
        title: 'Pievienot e-pasta adresi',
      },
      lineItems: {
        title__freeTrialEndsAt: 'Izmēģinājums beidzas',
        title__paymentMethod: 'Maksājuma metode',
        title__statementId: 'Pārskata ID',
        title__subscriptionBegins: 'Abonements sākas',
        title__totalPaid: 'Kopā samaksāts',
      },
      pastDueNotice: 'Jūsu iepriekšējais abonements bija nokavēts, bez maksājuma.',
      perMonth: 'mēnesī',
      promoCodePlaceholder: 'Ievadiet reklāmas kodu',
      removePromoCode: 'Noņemt reklāmas kodu',
      title: 'Norēķināšanās',
      title__paymentSuccessful: 'Maksājums bija veiksmīgs!',
      title__subscriptionSuccessful: 'Veiksmīgi!',
      title__trialSuccess: 'Izmēģinājums veiksmīgi sākts!',
      totalDueAfterTrial: 'Kopējā maksājamā summa pēc izmēģinājuma beigām pēc {{days}} dienām',
      totalDuePerPeriod: 'Kopējā maksājamā summa periodā',
    },
    credit: 'Kredīts',
    creditRemainder: 'Kredīts par atlikušo pašreizējā abonementa daļu.',
    defaultFreePlanActive: "Jūs pašlaik izmantojat bezmaksas plānu",
    discountAmount: '{{amount}} atlaide',
    discountCyclesRemaining: 'Atlikuši {{cycles}} {{period}}',
    discountDuration: '{{amount}} atlaide pirmajiem {{cycles}} {{period}}',
    free: 'Bezmaksas',
    getStarted: 'Sākt',
    highlightedPlanBadge: 'Populārs',
    keepFreeTrial: 'Saglabāt bezmaksas izmēģinājumu',
    keepSubscription: 'Saglabāt abonementu',
    manage: 'Pārvaldīt',
    manageSubscription: 'Pārvaldīt abonementu',
    month: 'Mēnesis',
    monthAbbreviation: 'mēn',
    monthPerUnit: 'Mēnesis par {{unitName}}',
    monthly: 'Reizi mēnesī',
    months: 'Mēneši',
    pastDue: 'Nokavēts',
    pay: 'Maksāt {{amount}}',
    payerCreditRemainder: 'Kredīts no konta atlikuma.',
    paymentMethod: {
      applePayDescription: {
        annual: 'Gada maksājums',
        monthly: 'Mēneša maksājums',
      },
      dev: {
        anyNumbers: 'Jebkuri cipari',
        cardNumber: 'Kartes numurs',
        cvcZip: 'CVC, pasta indekss',
        developmentMode: 'Izstrādes režīms',
        expirationDate: 'Derīguma termiņš',
        testCardInfo: 'Testa kartes informācija',
      },
    },
    paymentMethods__label: 'Maksājuma metodes',
    pricingTable: {
      billingCycle: 'Norēķinu cikls',
      included: 'Iekļauts',
      seatCost: {
        additionalSeats: '({{additionalTierFeePerBlockAmount}}/{{periodAbbreviation}} par papildu)',
        freeUpToSeats: 'Bezmaksas līdz {{endsAfterBlock}} vietām',
        includedSeats: 'Iekļautas {{includedSeats}} vietas',
        perSeat: '{{feePerBlockAmount}}/{{periodAbbreviation}} par vietu',
        tooltip: {
          additionalSeatsEach: 'Papildu vietas maksā {{feePerBlockAmount}}/{{period}} katra.',
          firstSeatsIncludedInPlan: 'Pirmās {{endsAfterBlock}} vietas ir iekļautas plānā.',
          freeForUpToSeats: 'Bezmaksas līdz {{endsAfterBlock}} vietām.',
        },
        unlimitedSeats: 'Neierobežots vietu skaits',
        upToSeats: 'Līdz {{endsAfterBlock}} vietām',
      },
    },
    proratedDiscount: 'Proporcionālā atlaide',
    prorationCredit: 'Proporcionālais kredīts',
    reSubscribe: 'Abonēt atkārtoti',
    seatBreakdownIncludedPlural: '{{chargeable}} vietas par {{rate}}/mēn ({{totalSeats}} kopā - {{included}} iekļautas)',
    seatBreakdownIncludedSingular: '1 vieta par {{rate}}/mēn ({{totalSeats}} kopā - {{included}} iekļautas)',
    seatBreakdownPlural: '{{chargeable}} vietas par {{rate}}/mēn',
    seatBreakdownSingular: '1 vieta par {{rate}}/mēn',
    seats: 'Vietas',
    seatsWithLimit: 'Vietas (līdz {{limit}})',
    seeAllFeatures: 'Skatīt visas funkcijas',
    startFreeTrial: 'Sākt bezmaksas izmēģinājumu',
    startFreeTrial__days: 'Sākt {{days}} dienu bezmaksas izmēģinājumu',
    subscribe: 'Abonēt',
    subscriptionDetails: {
      beginsOn: 'Sākas',
      currentBillingCycle: 'Pašreizējais norēķinu cikls',
      endsOn: 'Beidzas',
      firstPaymentAmount: 'Pirmā maksājuma summa',
      firstPaymentOn: 'Pirmais maksājums',
      nextPaymentAmount: 'Nākamā maksājuma summa',

      nextPaymentOn: 'Nākamais maksājums',
      pastDueAt: 'Nokavēts',
      renewsAt: 'Atjaunošana',
      subscribedOn: 'Abonēts',
      title: 'Abonements',
      trialEndsOn: 'Izmēģinājuma periods beidzas',
      trialStartedOn: 'Izmēģinājuma periods sākās',
    },
    subtotal: 'Starpsumma',
    subtotalRenewal: 'Starpsumma par periodu',
    switchPlan: 'Pāriet uz šo plānu',
    switchToAnnual: 'Pāriet uz gada plānu',
    switchToAnnualWithAnnualPrice: 'Pāriet uz gada plānu {{price}} / gadā',
    switchToMonthly: 'Pāriet uz mēneša plānu',
    switchToMonthlyWithPrice: 'Pāriet uz mēneša plānu {{price}} / mēnesī',
    totalDue: 'Kopējā maksājamā summa',
    totalDuePerPeriod: 'Kopējā summa par periodu',
    totalDueToday: 'Kopējā maksājamā summa šodien',
    viewFeatures: 'Skatīt funkcijas',
    viewPayment: 'Skatīt maksājumu',
    year: 'Gads',
    yearAbbreviation: 'g.',
    yearPerUnit: 'Gads par {{unitName}}',
    years: 'Gadi',
  },
  configureSSO: {
    activate: {
      activateButton: 'Aktivizēt SSO',
      activeSubtitle: 'Ikvienam, kas pierakstās ar {{domain}}, jāizmanto jūsu identitātes nodrošinātājs.',
      activeTitle: 'SSO savienojums ir aktīvs',
      doneButton: 'Gatavs',
      skipButton: 'Pagaidām izlaist',
      subtitle:
        'Jūsu SSO savienojums ir gatavs. Pēc aktivizēšanas ikvienam, kas pierakstās ar {{domain}}, jāizmanto jūsu identitātes nodrošinātājs.',
      title: 'SSO savienojums konfigurēts',
    },
    changeProviderDialog: {
      cancelButton: 'Atcelt',
      confirmButton: 'Mainīt nodrošinātāju',
      subtitle: 'Pārejot uz {{provider}}, tiks noņemts jūsu {{currentProvider}} savienojums un būs nepieciešama jauna iestatīšana.',
      title: 'Mainīt nodrošinātāju uz {{provider}}',
    },
    configureStep: {
      activeConnectionWarning: {
        dismiss: 'Aizvērt',
        title:
          'Šis savienojums ir aktīvs. Saglabājot izmaiņas, tās stājas spēkā nekavējoties un var traucēt pašreizējo dalībnieku pierakstīšanos.',
      },
      attributeMappingTable: {
        badges: {
          optional: 'Neobligāts',
          required: 'Obligāts',
        },
      },
      oidcCustom: {
        credentialsStep: {
          clientId: {
            label: 'Klienta ID',
            placeholder: 'Ielīmējiet klienta ID šeit...',
          },
          clientSecret: {
            label: 'Klienta noslēpums',
            placeholder: 'Ielīmējiet klienta noslēpumu šeit...',
          },
          headerSubtitle: 'Pievienojiet savas lietojumprogrammas akreditācijas datus',
          paragraph: 'Savā identitātes nodrošinātāja OIDC lietojumprogrammā iegūstiet šīs vērtības.',
        },
        endpointsStep: {
          discoveryUrl: {
            description:
              'Savā identitātes nodrošinātāja OIDC lietojumprogrammā iegūstiet atklāšanas galapunktu. Ielīmējiet to zemāk.',
            label: 'Atklāšanas galapunkts',
            placeholder: 'Ielīmējiet URL šeit...',
          },
          headerSubtitle: 'Pievienojiet sava identitātes nodrošinātāja galapunktus',
          manual: {
            authUrl: {
              label: 'Autorizācijas URL',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            description: 'Savā identitātes nodrošinātāja OIDC lietojumprogrammā iegūstiet šīs vērtības.',
            tokenUrl: {
              label: 'Talona URL',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            userInfoUrl: {
              label: 'Lietotāja informācijas URL',
              placeholder: 'Ielīmējiet URL šeit...',
            },
          },
          modes: {
            ariaLabel: 'OIDC galapunktu konfigurēšanas metode',
            discoveryUrl: 'Pievienot, izmantojot atklāšanas galapunktu',
            manual: 'Konfigurēt manuāli',
          },
        },
        mainHeaderTitle: 'Konfigurējiet savu identitātes nodrošinātāju',
        redirectUriStep: {
          claims: {
            description: 'Pārliecinieties, ka jūsu ID talons ietver šādus apgalvojumus:',
            table: {
              columns: {
                attribute: 'Clerk atribūts',
                claim: 'ID talona apgalvojums',
              },
              rows: {
                email: {
                  attribute: 'Primārais e-pasts',
                },
                firstName: {
                  attribute: 'Vārds',
                },
                lastName: {
                  attribute: 'Uzvārds',
                },
                subject: {
                  attribute: 'Ārējais lietotāja ID',
                },
              },
            },
          },
          headerSubtitle: 'Izveidojiet jaunu OIDC lietojumprogrammu savā identitātes nodrošinātāja vadības panelī',
          paragraph:
            'Savā identitātes nodrošinātāja vadības panelī izveidojiet jaunu OIDC lietojumprogrammu, kas atbalsta autorizācijas koda piešķiršanas veidu, un izmantojiet šādu novirzīšanas URI:',
          redirectUri: {
            label: 'Atļautais novirzīšanas URI',
          },
        },
      },
      samlCustom: {
        assignUsersStep: {
          headerSubtitle: 'Piešķiriet lietotājus vai grupas savai SAML lietojumprogrammai',
          paragraph: 'Piešķiriet lietotājus vai grupas savai lietojumprogrammai, pirms tie var pierakstīties ar SSO.',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attributeName: 'Atribūta nosaukums',
              userAttribute: 'Lietotāja atribūts',
            },
            rows: {
              email: {
                attributeName: 'Primārais e-pasts',
                userAttribute: 'mail',
              },
              firstName: {
                attributeName: 'Vārds',
                userAttribute: 'firstName',
              },
              lastName: {
                attributeName: 'Uzvārds',
                userAttribute: 'lastName',
              },
            },
          },
          headerSubtitle: 'Saistiet lietotāja atribūtus no sava identitātes nodrošinātāja ar savu lietojumprogrammu.',
          paragraph: 'Jūsu SAML atbildei jāietver šādi atribūti:',
        },
        createAppStep: {
          createAppInstructions: {
            paragraph:
              'Savā identitātes nodrošinātāja vadības panelī izveidojiet jaunu SAML 2.0 lietojumprogrammu un izmantojiet šādus pakalpojumu sniedzēja datus:',
          },
          headerSubtitle: 'Izveidojiet jaunu SAML lietojumprogrammu savā identitātes nodrošinātāja vadības panelī',
          serviceProviderFields: {
            acsUrl: {
              label: 'Apliecinājumu patērētāja pakalpojuma (ACS) URL',
            },
            spEntityId: {
              label: 'Entītijas ID',
            },
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Konfigurējiet identitātes nodrošinātāja metadatus',
          manual: {
            description: 'Savā identitātes nodrošinātāja SAML lietojumprogrammā iegūstiet šīs vērtības.',
            issuer: {
              label: 'Izdevējs',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            signOnUrl: {
              label: 'Pierakstīšanās URL',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            signingCertificate: {
              fileUploaded: 'Fails augšupielādēts',
              label: 'Parakstīšanas sertifikāts',
              removeFile: 'Noņemt failu',
              replaceFile: 'Aizstāt failu',
              uploadFile: 'Augšupielādēt failu',
            },
          },
          metadataUrl: {

            description: 'Savā identitātes nodrošinātāja SAML lietojumprogrammā iegūstiet metadatu URL. Ielīmējiet to tālāk.',
            label: 'Metadatu URL',
            placeholder: 'Ielīmējiet URL šeit...',
          },
          modes: {
            ariaLabel: 'Konfigurācija ',
            manual: 'Konfigurēt manuāli',
            metadataUrl: 'Pievienot, izmantojot metadatus',
          },
        },
        mainHeaderTitle: 'Konfigurējiet savu identitātes nodrošinātāju',
      },
      samlGoogle: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              appAttribute: 'Lietotnes atribūts',
              googleAttribute: 'Google atribūts',
            },
            rows: {
              email: {
                appAttribute: 'email',
                googleAttribute: 'Primārais e-pasts',
              },
              firstName: {
                appAttribute: 'firstName',
                googleAttribute: 'Vārds',
              },
              lastName: {
                appAttribute: 'lastName',
                googleAttribute: 'Uzvārds',
              },
            },
          },
          headerSubtitle: 'Kartējiet lietotāja atribūtus no „Google Workspace“ uz savu lietojumprogrammu',
          paragraph: 'Mēs sagaidām, ka jūsu SAML atbilde atgriezīs lietotāja e-pastu, vārdu un uzvārdu.',
          step1: '„<bold>Google Admin Console</bold>“ atrodiet sadaļu <bold>Attributes</bold>.',
          step2:
            'Katram atribūtam atlasiet <bold>Add mapping</bold> un ievadiet tālāk norādīto Google un lietotnes atribūtu:',
        },
        configureUserAccess: {
          assignUsersInstructions: {
            paragraph1:
              "Kad Google konfigurācija būs pabeigta, jūs tiksiet novirzīts uz lietotnes pārskata lapu.",
            paragraph2:
              'Google šo izmaiņu izplatīšana var aizņemt līdz 24 stundām. Savienojums paliks neaktīvs, līdz tās stāsies spēkā.',
            step1: 'Atveriet sadaļu <bold>User access</bold>.',
            step2: 'Atlasiet <bold>ON for everyone.</bold>',
            step3: 'Atlasiet <bold>Save</bold>.',
          },
          headerSubtitle: 'Iespējojiet savu „Google Workspace“ SAML lietojumprogrammu',
        },
        createAppStep: {
          createAppInstructions: {
            step1: 'Sānu navigācijā sadaļā <bold>Apps</bold> atlasiet <bold>Web and mobile apps.</bold>',
            step2: 'Atlasiet <bold>Add app</bold> un pēc tam <bold>Add custom SAML app.</bold>',
            step3: 'Ievadiet <bold>App name.</bold>',
            step4: 'Atlasiet <bold>Continue</bold>.',
            title: 'Programmā „Google Workspace“ izveidojiet jaunu SAML lietojumprogrammu:',
          },
          headerSubtitle: 'Izveidojiet jaunu SAML lietojumprogrammu programmā „Google Workspace“',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Pievienojiet savas „Google Workspace“ lietojumprogrammas metadatus',
          manual: {
            description: 'Savā „Google Workspace“ lietojumprogrammā iegūstiet šīs vērtības.',
            issuer: {
              label: 'Entītijas ID',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            signOnUrl: {
              label: 'SSO URL',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            signingCertificate: {
              fileUploaded: 'Fails augšupielādēts',
              label: 'Parakstīšanas sertifikāts',
              removeFile: 'Noņemt failu',
              replaceFile: 'Aizstāt failu',
              uploadFile: 'Augšupielādēt failu',
            },
          },
          metadataFile: {
            description: 'Savā „Google Workspace“ lietojumprogrammā lejupielādējiet IdP metadatus un augšupielādējiet tos tālāk.',
            fileUploaded: 'Fails augšupielādēts',
            label: 'IdP metadati',
            removeFile: 'Noņemt failu',
            replaceFile: 'Aizstāt failu',
            uploadFile: 'Augšupielādēt failu',
          },
          modes: {
            ariaLabel: 'Konfigurācija',
            manual: 'Konfigurēt manuāli',
            metadataFile: 'Pievienot, izmantojot metadatus',
          },
        },
        mainHeaderTitle: 'Konfigurējiet „Google Workspace“',
        serviceProviderStep: {
          headerSubtitle: 'Konfigurējiet pakalpojumu sniedzēju',
          nameIdInstructions: {
            step1:
              'Sadaļā <bold>Name ID</bold> atveriet <bold>Name ID</bold> formāta nolaižamo sarakstu un atlasiet <bold>Email</bold>.',
            step2: 'Atlasiet <bold>Continue</bold>',
          },
          paragraph:
            'Lai konfigurētu pakalpojumu sniedzēju, savai „Google Workspace“ SAML lietojumprogrammai jāpievieno šie divi lauki:',
          serviceProviderFields: {
            acsUrl: {
              label: 'ACS URL',
            },
            spEntityId: {
              label: 'Entītijas ID',
            },
          },
          title: 'Konfigurējiet pakalpojumu sniedzēju',
        },
      },
      samlMicrosoft: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attribute: 'Atribūts',
              claimName: 'Claim nosaukums',
              value: 'Vērtība',
            },
            copyClaimName: 'Kopēt claim nosaukumu',
            copyClaimNameCopied: 'Nokopēts',
            rows: {
              email: {
                attribute: 'E-pasta adrese',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
                value: 'user.mail',
              },
              firstName: {
                attribute: 'Vārds',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
                value: 'user.givenname',
              },
              lastName: {
                attribute: 'Uzvārds',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
                value: 'user.surname',
              },
            },
          },
          headerSubtitle: 'Iestatiet atribūtus, ko „Microsoft Entra“ iekļauj jūsu SAML atbildē',
          step1: 'Lapā <bold>SAML-based Sign-on</bold> atrodiet sadaļu <bold>Attributes & Claims</bold>.',
          step2: 'Atlasiet <bold>Edit.</bold>',
          title: 'Jūsu SAML atbildē jābūt šādiem atribūtiem:',
        },
        createAppStep: {
          assignUsersInstructions: {
            step1: 'Sadaļā <bold>Getting Started</bold> atlasiet <bold>Assign users and groups.</bold>',
            step2: "Atlasiet <bold>Add user/group.</bold> Jūs tiksiet novirzīts uz <bold>Add Assignment page.</bold>",
            step3: 'Atlasiet <bold>None Selected link.</bold>',
            step4:
              "Lapas apakšā atlasiet <bold>Select</bold>. Jūs tiksiet novirzīts uz <bold>Add Assignment</bold> lapu.",
            step5: 'Atlasiet <bold>Assign</bold>',
            title: 'Piešķiriet lietotājus vai grupas programmā „Microsoft“',
          },
          createAppInstructions: {
            step1: 'Piesakieties „Microsoft Azure“ portālā un dodieties uz <bold>Enterprise applications.</bold>',
            step2:
              "Noklikšķiniet uz <bold>New application.</bold> Jūs tiksiet novirzīts uz <bold>Browse Microsoft Entra Gallery</bold> lapu.",
            step3: 'Atlasiet <bold>Create your own application.</bold>',
            step4: {
              label: 'Atvērtajā modālajā logā:',
              subSteps: {
                appName: 'Aizpildiet savas lietojumprogrammas nosaukumu.',
                create: 'Atlasiet <bold>Create</bold>.',
                nonGallery:
                  "Atlasiet <bold>Integrate any other application you don't find in the gallery (Non-gallery)</bold>.",
              },
            },
            title: 'Izveidojiet jaunu uzņēmuma lietojumprogrammu',
          },
          headerSubtitle: 'Izveidojiet jaunu uzņēmuma lietojumprogrammu savā „Azure“ portālā',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Pievienojiet savas „Microsoft Entra“ lietojumprogrammas metadatus',
          manual: {
            description:
              'Lapā <bold>SAML-based Sign-on</bold> atrodiet sadaļu <bold>SAML Certificates</bold>. Iegūstiet šīs vērtības un pievienojiet tās tālāk.',
            issuer: {
              label: 'Izdevējs',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            signOnUrl: {
              label: 'Pierakstīšanās URL',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            signingCertificate: {
              fileUploaded: 'Fails augšupielādēts',
              label: 'Parakstīšanas sertifikāts',

              removeFile: 'Noņemt failu',
              replaceFile: 'Aizstāt failu',
              uploadFile: 'Augšupielādēt failu',
            },
          },
          metadataUrl: {
            description:
              'Lapā <bold>SAML-based Sign-on</bold> atrodiet sadaļu <bold>SAML Certificates</bold> un nokopējiet <bold>App Federation Metadata Url</bold>. Ielīmējiet tālāk.',
            label: 'Metadatu URL',
            placeholder: 'Ielīmējiet URL šeit...',
          },
          modes: {
            ariaLabel: 'Konfigurācija ',
            manual: 'Konfigurēt manuāli',
            metadataUrl: 'Pievienot, izmantojot metadatus',
          },
        },
        mainHeaderTitle: 'Konfigurēt Microsoft Entra',
        serviceProviderStep: {
          headerSubtitle: 'Pievienot pakalpojumu sniedzēja konfigurāciju Microsoft Entra',
          serviceProviderFields: {
            acsUrl: {
              label: 'Atbildes URL (Assertion Consumer Service URL)',
            },
            spEntityId: {
              label: 'Identifikators (Entity ID)',
            },
          },
          step1: 'Sānu navigācijā atveriet nolaižamo izvēlni <bold>Manage</bold> un atlasiet Single sign-on.',
          step2: 'Sadaļā <bold>Select a single sign-on method</bold> atlasiet <bold>SAML</bold>.',
          step3: 'Atrodiet sadaļu <bold>Basic SAML Configuration</bold>.',
          step4: 'Atlasiet <bold>Edit</bold>. Tiks atvērts panelis <bold>Basic SAML Configuration</bold>.',
          step5:
            'Iekopējiet tālāk norādītās vērtības laukos <bold>Identifier (Entity ID)</bold> un <bold>Reply URL (ACS URL)</bold>:',
          step6: 'Paneļa augšdaļā atlasiet <bold>Save</bold>. Aizveriet paneli.',
          title: 'Pievienot pakalpojumu sniedzēja informāciju',
        },
      },
      samlOkta: {
        assignUsersStep: {
          assignUsersInstructions: {
            paragraph: 'Piešķiriet lietotājus vai grupas savai Okta lietotnei, pirms tie var pierakstīties ar SSO',
            step1: 'Okta informācijas panelī atlasiet cilni <bold>Assignments</bold>.',
            step2:
              'Atveriet nolaižamo izvēlni <bold>Assign</bold> un atlasiet <bold>Assign to people</bold> vai <bold>Assign to groups</bold>.',
            step3: 'Meklējiet piešķiramo lietotāju vai grupu.',
            step4: 'Blakus lietotājam vai grupai noklikšķiniet uz <bold>Assign</bold>.',
            step5: 'Noklikšķiniet uz <bold>Done.</bold>',
          },
          headerSubtitle: 'Piešķirt lietotājus savai Okta lietotnei',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              expression: 'Izteiksme',
              name: 'Atribūta nosaukums',
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
          headerSubtitle: 'Iestatīt atribūtus, ko Okta iekļauj jūsu SAML atbildē',
          paragraph: 'Jūsu SAML atbildē jāiekļauj šādi atribūti:',
          step1: 'Okta informācijas panelī atrodiet sadaļu <bold>Attribute Statements</bold>.',
          step2:
            'Katram atribūtam atlasiet <bold>Add Expression</bold> un ievadiet šādus nosaukuma un izteiksmes pārus:',
        },
        createAppStep: {
          completeSamlIntegrationInstructions: {
            step1: 'Sadaļā <bold>Feedback</bold> atlasiet <bold>This is an internal app that we have created.</bold>',
            step2: 'Noklikšķiniet uz <bold>Finish</bold>, lai pabeigtu integrāciju.',
            title: 'Pabeigt SAML integrāciju',
          },
          createAppInstructions: {
            step1: 'Pierakstieties Okta un dodieties uz <bold>Admin → Applications.</bold>',
            step2: 'Noklikšķiniet uz <bold>Create App Integration.</bold> un atlasiet <bold>SAML 2.0.</bold>',
            step3: 'Aizpildiet General Settings. Lietotnes nosaukums ir obligāts.',
            step4: 'Noklikšķiniet uz <bold>Next</bold>, lai pabeigtu lietotnes izveidi.',
            title: 'Izveidot jaunu SAML lietotni Okta',
          },
          headerSubtitle: 'Izveidot un konfigurēt SAML lietotni savā Okta informācijas panelī',
          serviceProviderInstructions: {
            paragraph1:
              "Pēc <bold>General Settings</bold> aizpildīšanas jūs redzēsiet lapu <bold>Configure SAML</bold>.",
            paragraph2: 'Pievienojiet šos divus laukus savai Okta lietotnei, lai konfigurētu pakalpojumu sniedzēju.',
            serviceProviderFields: {
              acsUrl: {
                label: 'Vienotās pierakstīšanās URL',
              },
              spEntityId: {
                label: 'Audience URI (SP Entity ID)',
              },
            },
            title: 'Konfigurēt pakalpojumu sniedzēju',
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Pievienot savas Okta lietotnes metadatus',
          manual: {
            description: 'Savā Okta SAML lietotnē dodieties uz cilni <bold>Sign On</bold> un iegūstiet šīs vērtības.',
            issuer: {
              label: 'Izdevējs',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            signOnUrl: {
              label: 'Pierakstīšanās URL',
              placeholder: 'Ielīmējiet URL šeit...',
            },
            signingCertificate: {
              fileUploaded: 'Fails augšupielādēts',
              label: 'Parakstīšanas sertifikāts',
              removeFile: 'Noņemt failu',
              replaceFile: 'Aizstāt failu',
              uploadFile: 'Augšupielādēt failu',
            },
          },
          metadataUrl: {
            description:
              'Savā Okta SAML lietotnē dodieties uz cilni <bold>Sign On</bold> un iegūstiet metadatu URL. Ielīmējiet to tālāk.',
            label: 'Metadatu URL',
            placeholder: 'Ielīmējiet URL šeit...',
          },
          modes: {
            ariaLabel: 'Konfigurācija',
            manual: 'Konfigurēt manuāli',
            metadataUrl: 'Pievienot, izmantojot metadatus',
          },
        },
        mainHeaderTitle: 'Konfigurēt Okta Workforce',
      },
      unsupportedProvider: {
        description:
          'Šis identitātes nodrošinātājs šajā Clerk versijā netiek atbalstīts. Atjauniniet uz jaunāko versiju, lai pabeigtu tā iestatīšanu.',
        title: 'Neatbalstīts nodrošinātājs',
      },
    },
    missingManageEnterpriseConnectionsPermission: {
      subtitle: "Lai paaugstinātu savas atļaujas, sazinieties ar savas organizācijas administratoru.",
      title: 'Jums nav atļaujas pārvaldīt vienoto pierakstīšanos (SSO)',
    },
    navbar: {
      title: 'Konfigurēt vienoto pierakstīšanos (SSO)',
    },
    organizationDomainsStep: {
      domainCard: {
        badge__expired: 'Beidzies derīgums',
        badge__unverified: 'Neverificēts',
        badge__verified: 'Verificēts',
        expiredAtLabel:
          "Domēna verifikācija beidzās {{ date | shortDate('lv-LV') }}. Verificējiet vēlreiz, lai ģenerētu jaunu DNS ierakstu.",
        expiredLabel: 'Domēna verifikācija beidzās. Verificējiet vēlreiz, lai ģenerētu jaunu DNS ierakstu.',
        removeButtonTooltip__lastVerifiedDomain: 'Lai iestatītu SSO, ir nepieciešams vismaz viens verificēts domēns.',
        removeButtonTooltip__lastVerifiedDomainActive: 'Lai SSO būtu iespējots, ir nepieciešams vismaz viens verificēts domēns.',
        txtRecord: {
          hostLabel: 'Resursdators / Nosaukums',
          instructions: "Pievienojiet šo TXT ierakstu savam DNS pakalpojumu sniedzējam. Mēs verificēsim automātiski, tiklīdz ieraksts būs aktīvs.",
          typeLabel: 'Tips',
          valueLabel: 'Vērtība',
        },
        verifiedAtLabel: "Verificēts {{ date | shortDate('lv-LV') }}",
        verifyAgainButton: 'Verificēt vēlreiz',
      },
      domainSuggestion: {
        formButtonPrimary__add: 'Pievienot {{domain}}',
        messageLabel: 'Jūsu e-pastā tiek izmantots {{domain}}. Vai vēlaties to pievienot?',
      },
      formButtonPrimary__add: 'Pievienot',
      formFieldInputPlaceholder__domain: 'Ierakstiet šeit savu domēnu un noklikšķiniet uz pievienošanas, lai sāktu',
      formFieldLabel__domain: 'Domēns',
      removeDomainDialog: {
        cancelButton: 'Atcelt',
        removeButton: 'Noņemt domēnu',
        subtitle__active:
          "Jūs gatavojaties noņemt {{domain}} no šī uzņēmuma savienojuma. Lietotāji vairs nevarēs pierakstīties ar {{domain}}.",
        subtitle__inactive: "Jūs gatavojaties noņemt {{domain}} no šī uzņēmuma savienojuma.",
        title: 'Domēna noņemšana',
      },
      subtitle: 'Pievienojiet un verificējiet īpašumtiesības uz domēniem, ko jūsu organizācija izmanto pierakstīšanai.',
      title: 'Pievienot SSO domēnus',
    },
    resetConnectionDialog: {
      cancelButton: 'Atcelt',
      confirmationFieldLabel: 'Ierakstiet "{{name}}" zemāk, lai turpinātu',

      confirmationFieldPlaceholder: '{{name}}',
      resetButton: 'Atiestatīt savienojumu',
      subtitle:
        'Vai tiešām vēlaties atiestatīt savienojumu? Šī darbība ir neatgriezeniska, un jums būs jākonfigurē visi soļi no jauna',
      title: 'Atiestatīt savienojumu',
    },
    selectProviderStep: {
      oidc: {
        groupLabel: 'OpenID Connect (OIDC)',
        oidcProvider: 'OIDC nodrošinātājs',
      },
      saml: {
        customSaml: 'Pielāgots SAML nodrošinātājs',
        google: 'Google Workspace',
        groupLabel: 'SAML',
        microsoft: 'Microsoft Entra (iepriekš AD)',
        okta: 'Okta Workforce',
      },
      subtitle: "Savienojuma informāciju konfigurēsiet nākamajā solī",
      title: 'Izvēlieties savu identitātes nodrošinātāju',
      warning: 'Kad nodrošinātājs ir atlasīts, to vairs nevarēsit mainīt, līdz konfigurācija būs pabeigta',
    },
    testConfigurationStep: {
      error__noSuccessfulTestRun:
        'Lai varētu turpināt, nepieciešama vismaz viena veiksmīga testa palaišana. Ģenerējiet testa URL un pabeidziet pierakstīšanās plūsmu.',
      subtitle: 'Pierakstieties, izmantojot testa URL, lai pārbaudītu, vai jūsu SSO savienojums ir konfigurēts pareizi',
      testResults: {
        actionLabel__refresh: 'Atsvaidzināt žurnālus',
        empty: {
          subtitle: 'Atlasiet <bold>Atvērt testa URL</bold>, lai palaistu savu pirmo testu',
          title: 'Nav testa rezultātu',
        },
        polling: 'Gaida, līdz testa palaišana tiks pabeigta…',
        status__failed: 'Neizdevās',
        status__pending: 'Gaida',
        status__success: 'Veiksmīgi',
        title: 'Jūsu testa rezultāti',
      },
      testRunDetails: {
        howToFix: {
          actionLabel__viewDocumentation: 'Skatīt dokumentāciju',
          oauth_access_denied: {
            description:
              "Šī kļūda rodas, kad lietotājs OAuth nodrošinātāja autorizācijas ekrānā noklikšķināja uz Atcelt vai Noliegt, vai arī nodrošinātājs noraidīja autorizācijas pieprasījumu. Pārbaudiet, vai OAuth lietojumprogrammas akreditācijas dati (klienta ID un klienta noslēpums) ir konfigurēti pareizi.",
          },
          oauth_fetch_user_error: {
            intro: 'Lai novērstu šo kļūdu, veiciet šīs darbības:',
            step1:
              'Pārbaudiet, vai OAuth tvērumi, kas konfigurēti jūsu savienojuma iestatījumos, ietver nepieciešamās atļaujas lietotāja profila informācijas lasīšanai.',
            step2: 'Pārliecinieties, ka lietotāja informācijas galapunkta URL ir konfigurēts pareizi.',
          },
          oauth_token_exchange_error: {
            description:
              "Pārbaudiet, vai jūsu OAuth lietojumprogrammas klienta ID un klienta noslēpums ir konfigurēti pareizi un atbilst akreditācijas datiem no jūsu OAuth nodrošinātāja vadības paneļa.",
          },
          saml_email_address_domain_mismatch: {
            description:
              'Pārbaudiet, vai lietotājs pierakstās ar e-pasta adresi, kas atbilst vienam no šim savienojumam atļautajiem domēniem. Ja nepieciešams pievienot papildu domēnus, atjauniniet atļautos domēnus savienojuma iestatījumos.',
          },
          saml_response_relaystate_missing: {
            description:
              'Pārbaudiet, vai jūsu identitātes nodrošinātājs pareizi atgriež RelayState parametru, kas tika nosūtīts sākotnējā pieprasījumā.',
          },
          saml_user_attribute_missing: {
            intro: 'Lai novērstu šo kļūdu, veiciet šīs darbības:',
            step1: "Atveriet sava identitātes nodrošinātāja konfigurācijas vadības paneli.",
            step2: "Dodieties uz savas lietojumprogrammas SAML iestatījumiem vai atribūtu kartēšanas konfigurāciju.",
            step3: "Pārliecinieties, ka atribūts 'mail' ir pareizi kartēts uz lietotāja e-pasta adreses lauku.",
          },
          sectionTitle: 'Kā novērst',
        },
        parsedUserInfo: {
          email: 'E-pasts',
          firstName: 'Vārds',
          sectionTitle: 'Parsētā lietotāja informācija',
        },
        runDetails: {
          actionLabel__copied: 'Nokopēts',
          actionLabel__copy: 'Kopēt ziņojumu',
          errorCode: 'Kļūdas kods',
          fullMessage: 'Pilns ziņojums',
          sectionTitle: 'Palaišanas informācija',
          status: 'Statuss',
          timestamp: 'Laika zīmogs',
        },
        title: 'Testa palaišana',
      },
      testUrl: {
        actionLabel__open: 'Atvērt testa URL',
      },
      title: 'Pārbaudiet savu SSO savienojumu',
    },
  },
  createOrganization: {
    formButtonSubmit: 'Izveidot organizāciju',
    invitePage: {
      formButtonReset: 'Izlaist',
    },
    title: 'Izveidot organizāciju',
  },
  dates: {
    lastDay: "Vakar plkst. {{ date | timeString('lv-LV') }}",
    next6Days: "{{ date | weekday('lv-LV','long') }} plkst. {{ date | timeString('lv-LV') }}",
    nextDay: "Rīt plkst. {{ date | timeString('lv-LV') }}",
    numeric: "{{ date | numeric('lv-LV') }}",
    previous6Days: "Iepriekšējā {{ date | weekday('lv-LV','long') }} plkst. {{ date | timeString('lv-LV') }}",
    sameDay: "Šodien plkst. {{ date | timeString('lv-LV') }}",
  },
  dividerText: 'vai',
  footerActionLink__alternativePhoneCodeProvider: 'Tā vietā sūtīt kodu ar SMS',
  footerActionLink__useAnotherMethod: 'Izmantot citu metodi',
  footerPageLink__help: 'Palīdzība',
  footerPageLink__privacy: 'Privātums',
  footerPageLink__terms: 'Noteikumi',
  formButtonPrimary: 'Turpināt',
  formButtonPrimary__verify: 'Apstiprināt',
  formFieldAction__forgotPassword: 'Aizmirsāt paroli?',
  formFieldError__matchingPasswords: 'Paroles sakrīt.',
  formFieldError__notMatchingPasswords: "Paroles nesakrīt.",
  formFieldError__verificationLinkExpired: 'Verifikācijas saites derīguma termiņš ir beidzies. Lūdzu, pieprasiet jaunu saiti.',
  formFieldHintText__optional: 'Neobligāti',
  formFieldHintText__slug: 'Slug ir cilvēkam lasāms ID, kam jābūt unikālam. To bieži izmanto URL adresēs.',
  formFieldInputPlaceholder__apiKeyDescription: 'Paskaidrojiet, kāpēc ģenerējat šo atslēgu',
  formFieldInputPlaceholder__apiKeyExpirationDate: 'Atlasiet datumu',
  formFieldInputPlaceholder__apiKeyName: 'Ievadiet savas slepenās atslēgas nosaukumu',
  formFieldInputPlaceholder__backupCode: 'Ievadiet rezerves kodu',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Dzēst kontu',
  formFieldInputPlaceholder__emailAddress: 'Ievadiet savu e-pasta adresi',
  formFieldInputPlaceholder__emailAddress_username: 'Ievadiet e-pastu vai lietotājvārdu',
  formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
  formFieldInputPlaceholder__firstName: 'Vārds',
  formFieldInputPlaceholder__lastName: 'Uzvārds',
  formFieldInputPlaceholder__organizationDomain: 'example.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'you@example.com',
  formFieldInputPlaceholder__organizationName: 'Organizācijas nosaukums',
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  formFieldInputPlaceholder__password: 'Ievadiet savu paroli',
  formFieldInputPlaceholder__phoneNumber: 'Ievadiet savu tālruņa numuru',
  formFieldInputPlaceholder__signUpPassword: 'Izveidojiet paroli',
  formFieldInputPlaceholder__username: 'Ievadiet savu lietotājvārdu',
  formFieldInput__emailAddress_format: 'Piemēra formāts: name@example.com',
  formFieldLabel__apiKey: 'API atslēga',
  formFieldLabel__apiKeyDescription: 'Apraksts',
  formFieldLabel__apiKeyExpiration: 'Derīguma termiņš',
  formFieldLabel__apiKeyName: 'Slepenās atslēgas nosaukums',
  formFieldLabel__automaticInvitations: 'Iespējot automātiskos ielūgumus šim domēnam',
  formFieldLabel__backupCode: 'Rezerves kods',
  formFieldLabel__confirmDeletion: 'Apstiprinājums',
  formFieldLabel__confirmPassword: 'Apstipriniet paroli',
  formFieldLabel__currentPassword: 'Pašreizējā parole',
  formFieldLabel__emailAddress: 'E-pasta adrese',
  formFieldLabel__emailAddress_username: 'E-pasta adrese vai lietotājvārds',
  formFieldLabel__emailAddresses: 'E-pasta adreses',
  formFieldLabel__firstName: 'Vārds',
  formFieldLabel__lastName: 'Uzvārds',
  formFieldLabel__newPassword: 'Jauna parole',
  formFieldLabel__organizationDomain: 'Domēns',
  formFieldLabel__organizationDomainDeletePending: 'Dzēst gaidošos ielūgumus un ieteikumus',
  formFieldLabel__organizationDomainEmailAddress: 'Verifikācijas e-pasta adrese',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Ievadiet e-pasta adresi zem šī domēna, lai saņemtu kodu un verificētu šo domēnu.',
  formFieldLabel__organizationName: 'Nosaukums',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Pieejas atslēgas nosaukums',
  formFieldLabel__password: 'Parole',
  formFieldLabel__phoneNumber: 'Tālruņa numurs',
  formFieldLabel__role: 'Loma',
  formFieldLabel__signOutOfOtherSessions: 'Izrakstīties no visām pārējām ierīcēm',
  formFieldLabel__username: 'Lietotājvārds',
  identityPreviewEditButton__emailAddress: 'Rediģēt e-pasta adresi',
  identityPreviewEditButton__identifier: 'Rediģēt identifikatoru',
  identityPreviewEditButton__phoneNumber: 'Rediģēt tālruņa numuru',
  impersonationFab: {
    action__signOut: 'Izrakstīties',
    title: 'Pierakstījies kā {{identifier}}',
  },
  lastAuthenticationStrategy: 'Pēdējoreiz izmantots',
  maintenanceMode:
    "Pašlaik veicam apkopes darbus, taču neuztraucieties — tam nevajadzētu aizņemt vairāk par dažām minūtēm.",
  membershipRole__admin: 'Administrators',
  membershipRole__basicMember: 'Dalībnieks',
  membershipRole__guestMember: 'Viesis',
  oauthConsent: {
    action__allow: 'Atļaut',
    action__deny: 'Noraidīt',
    offlineAccessNotice: " Jūs paliksiet pierakstījies, līdz izrakstīsieties vai atsauksiet piekļuvi.",
    redirectNotice: 'Ja atļausiet piekļuvi, šī lietotne jūs novirzīs uz {{domainAction}}.',
    redirectUriModal: {
      subtitle: 'Pārliecinieties, ka uzticaties {{applicationName}} un ka šis URL pieder {{applicationName}}.',
      title: 'Novirzīšanas URL',
    },
    scopeList: {
      privateMetadata: 'Jūsu privātie metadati, kurus iestatījis {{applicationName}} un kuri var ietvert sensitīvu informāciju',
      title: 'Tas ļaus {{applicationName}} piekļūt:',

    },
    subtitle: 'vēlas piekļūt {{applicationName}} {{identifier}} vārdā',
    viewFullUrl: 'Skatīt pilno URL',
    warning:
      'Pārliecinieties, ka uzticaties {{applicationName}} ({{domainAction}}). Iespējams, kopīgojat sensitīvus datus ar šo vietni vai lietotni.',
  },
  oauthDeviceVerification: {
    action__tryAnotherCode: 'Ievadiet citu kodu',
    confirmation: {
      action__approve: 'Apstiprināt',
      action__deny: 'Noraidīt',
      scopeListTitle: 'Tas ļaus {{applicationName}} piekļūt:',
      subtitle: 'Apstipriniet šo pieprasījumu {{identifier}}',
      title: 'Atļaut {{applicationName}} piekļūt jūsu kontam?',
      warning: 'Apstipriniet šo pieprasījumu tikai tad, ja to sākāt savā citā ierīcē.',
    },
    error: {
      expiredSubtitle: 'Sāciet no jauna savā ierīcē.',
      expiredTitle: 'Šis kods ir beidzies',
      genericSubtitle: 'Pārbaudiet savienojumu un mēģiniet vēlreiz.',
      genericTitle: 'Mēs nevarējām pārbaudīt šo kodu',
      invalidCode: 'Ievadiet derīgu 8 zīmju kodu.',
      rateLimitedSubtitle: 'Pagaidiet, pirms mēģināt citu kodu.',
      rateLimitedTitle: 'Pārāk daudz mēģinājumu',
      unknownCode: "Mēs nevarējām atrast šo kodu. Pārbaudiet to un mēģiniet vēlreiz.",
    },
    start: {
      action__continue: 'Turpināt',
      subtitle: 'Ievadiet kodu, kas redzams ierīcē vai lietotnē, kuru vēlaties autorizēt.',
      title: 'Pārbaudiet ierīci',
      userCodeLabel: 'Ierīces kods',
    },
    status: {
      alreadyApprovedSubtitle: 'Lai turpinātu, atgriezieties savā ierīcē.',
      alreadyApprovedTitle: "Jūs to esat apstiprinājis",
      alreadyDecidedSubtitle: 'Lēmums pieņemts citur. Atgriezieties savā ierīcē.',
      alreadyDecidedTitle: 'Šis pieprasījums jau ir pabeigts',
      alreadyDeniedSubtitle: 'Ja vēlaties mēģināt vēlreiz, sāciet no jauna savā ierīcē.',
      alreadyDeniedTitle: 'Šis pieprasījums tika noraidīts',
      approvedSubtitle: 'Jūs apstiprinājāt šo pieprasījumu. Lai turpinātu, atgriezieties savā ierīcē.',
      approvedTitle: 'Ierīce apstiprināta',
      consumedSubtitle: 'Jūsu ierīce ir autorizēta. Varat aizvērt šo logu.',
      consumedTitle: 'Šis kods jau ir izmantots',
      deniedSubtitle: 'Jūs noraidījāt šo pieprasījumu. Atgriezieties savā ierīcē.',
      deniedTitle: 'Piekļuve liegta',
    },
  },
  organizationList: {
    action__createOrganization: 'Izveidot organizāciju',
    action__invitationAccept: 'Pievienoties',
    action__suggestionsAccept: 'Pieprasīt pievienošanos',
    createOrganization: 'Izveidot organizāciju',
    invitationAcceptedLabel: 'Pievienots',
    subtitle: 'lai turpinātu uz {{applicationName}}',
    suggestionsAcceptedLabel: 'Gaida apstiprinājumu',
    title: 'Izvēlieties kontu',
    titleWithoutPersonal: 'Izvēlieties organizāciju',
  },
  organizationProfile: {
    apiKeysPage: {
      title: 'API atslēgas',
    },
    badge__automaticInvitation: 'Automātiskie ielūgumi',
    badge__automaticSuggestion: 'Automātiskie ieteikumi',
    badge__enterpriseSso: 'Enterprise SSO',
    badge__manualInvitation: 'Bez automātiskas reģistrācijas',
    badge__unverified: 'Neverificēts',
    billingPage: {
      accountCreditsSection: {
        title: 'Konta kredīti',
        viewHistory: 'Skatīt kredītu vēsturi',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Datums',
        title: 'Konta kredītu vēsture',
      },
      paymentHistorySection: {
        empty: 'Nav maksājumu vēstures',
        notFound: 'Maksājuma mēģinājums nav atrasts',
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Datums',
        tableHeader__status: 'Statuss',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Padarīt par noklusējumu',
        actionLabel__remove: 'Noņemt',
        add: 'Pievienot jaunu maksājuma metodi',
        addSubtitle: 'Pievienojiet savam kontam jaunu maksājuma metodi.',
        cancelButton: 'Atcelt',
        formButtonPrimary__add: 'Pievienot maksājuma metodi',
        formButtonPrimary__pay: 'Maksāt {{amount}}',
        payWithTestCardButton: 'Maksāt ar testa karti',
        removeMethod: {
          messageLine1: '{{identifier}} tiks noņemts no šī konta.',
          messageLine2:
            'Jūs vairs nevarēsiet izmantot šo maksājuma metodi, un no tās atkarīgie atkārtotie abonementi vairs nedarbosies.',
          successMessage: '{{paymentMethod}} ir noņemts no jūsu konta.',
          title: 'Noņemt maksājuma metodi',
        },
        title: 'Maksājuma metodes',
      },
      start: {
        headerTitle__payments: 'Maksājumi',
        headerTitle__plans: 'Plāni',
        headerTitle__statements: 'Izraksti',
        headerTitle__subscriptions: 'Abonements',
      },
      statementsSection: {
        empty: 'Nav rādāmu izrakstu',
        itemCaption__paidForPlan: 'Apmaksāts {{plan}} {{period}} plāns',
        itemCaption__payerCredit: 'Kredīts no konta atlikuma',
        itemCaption__proratedCredit: 'Proporcionāls kredīts par iepriekšējā abonementa daļēju izmantošanu',
        itemCaption__subscribedAndPaidForPlan: 'Abonēts un apmaksāts {{plan}} {{period}} plāns',
        notFound: 'Izraksts nav atrasts',
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Datums',
        title: 'Izraksti',
        totalPaid: 'Kopā samaksāts',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Pārvaldīt',
        actionLabel__newSubscription: 'Abonēt plānu',
        actionLabel__switchPlan: 'Mainīt plānus',
        includedSeatsUsage: 'Iekļautas {{includedSeats}} vietas',
        overview: 'Pārskats',
        paidSeatsUsage: '{{seatsQuantity}} vietas x {{amount}}',
        seatLimit: 'Līdz {{seatLimit}} vietām',
        seatLimitAndIncludedSeats: 'Līdz {{seatLimit}} vietām (iekļautas {{includedSeats}})',
        tableHeader__edit: 'Rediģēt',
        tableHeader__plan: 'Plāns',
        tableHeader__startDate: 'Sākuma datums',
        title: 'Abonements',
      },
      subscriptionsSection: {
        actionLabel__default: 'Pārvaldīt',
      },
      switchPlansSection: {
        title: 'Mainīt plānus',
      },
      title: 'Norēķini',
    },
    createDomainPage: {
      subtitle:
        'Pievienojiet domēnu verifikācijai. Lietotāji ar e-pasta adresēm šajā domēnā var pievienoties organizācijai automātiski vai pieprasīt pievienošanos.',
      title: 'Pievienot domēnu',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Ielūgumus nevarēja nosūtīt. Uz šīm e-pasta adresēm jau gaida ielūgumi: {{email_addresses}}.',
      formButtonPrimary__continue: 'Nosūtīt ielūgumus',
      formButtonPrimary__purchaseSeats: 'Iegādāties papildu vietas',
      selectDropdown__role: 'Izvēlieties lomu',
      subtitle: 'Ievadiet vai ielīmējiet vienu vai vairākas e-pasta adreses, atdalītas ar atstarpēm vai komatiem.',
      successMessage: 'Ielūgumi veiksmīgi nosūtīti',
      title: 'Uzaicināt jaunus dalībniekus',
    },
    membersPage: {
      action__invite: 'Uzaicināt',
      action__search: 'Meklēt',
      activeMembersTab: {
        menuAction__remove: 'Noņemt dalībnieku',
        tableHeader__actions: 'Darbības',
        tableHeader__joined: 'Pievienojies',
        tableHeader__role: 'Loma',
        tableHeader__user: 'Lietotājs',
      },
      alerts: {
        roleSetMigrationInProgress: {
          subtitle: 'Mēs atjauninām pieejamās lomas. Kad tas būs pabeigts, varēsiet lomas atjaunināt vēlreiz.',
          title: 'Lomas uz laiku ir bloķētas',
        },
      },
      detailsTitle__emptyRow: 'Nav rādāmu dalībnieku',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Uzaiciniet lietotājus, savienojot e-pasta domēnu ar savu organizāciju. Ikviens, kurš reģistrējas ar atbilstošu e-pasta domēnu, varēs pievienoties organizācijai jebkurā laikā.',
          headerTitle: 'Automātiskie ielūgumi',
          primaryButton: 'Pārvaldīt verificētos domēnus',
        },
        table__emptyRow: 'Nav rādāmu ielūgumu',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Atsaukt ielūgumu',
        tableHeader__invited: 'Uzaicināts',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Lietotāji, kuri reģistrējas ar atbilstošu e-pasta domēnu, redzēs ieteikumu pieprasīt pievienošanos jūsu organizācijai.',
          headerTitle: 'Automātiskie ieteikumi',
          primaryButton: 'Pārvaldīt verificētos domēnus',
        },

        menuAction__approve: 'Apstiprināt',
        menuAction__reject: 'Noraidīt',
        tableHeader__requested: 'Pieprasītā piekļuve',
        table__emptyRow: 'Nav pieprasījumu, ko rādīt',
      },
      start: {
        headerTitle__invitations: 'Ielūgumi',
        headerTitle__members: 'Dalībnieki',
        headerTitle__requests: 'Pieprasījumi',
      },
    },
    navbar: {
      apiKeys: 'API atslēgas',
      billing: 'Norēķini',
      description: 'Pārvaldiet savu organizāciju.',
      general: 'Vispārīgi',
      members: 'Dalībnieki',
      security: 'Drošība',
      title: 'Organizācija',
    },
    plansPage: {
      alerts: {
        noPermissionsToManageBilling: 'Jums nav atļaujas pārvaldīt šīs organizācijas norēķinus.',
        planMembershipLimitExceeded:
          'Jūsu organizācijā ir {{count}} dalībnieki (ieskaitot neapstiprinātus ielūgumus). Šis plāns atļauj tikai {{limit}} dalībniekus.',
      },
      title: 'Plāni',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Ierakstiet "{{organizationName}}" zemāk, lai turpinātu.',
          messageLine1: 'Vai tiešām vēlaties dzēst šo organizāciju?',
          messageLine2: 'Šī darbība ir pastāvīga un neatgriezeniska.',
          successMessage: 'Jūs esat izdzēsis organizāciju.',
          title: 'Dzēst organizāciju',
        },
        leaveOrganization: {
          actionDescription: 'Ierakstiet "{{organizationName}}" zemāk, lai turpinātu.',
          messageLine1:
            'Vai tiešām vēlaties pamest šo organizāciju? Jūs zaudēsiet piekļuvi šai organizācijai un tās lietotnēm.',
          messageLine2: 'Šī darbība ir pastāvīga un neatgriezeniska.',
          successMessage: 'Jūs esat pametis organizāciju.',
          title: 'Pamest organizāciju',
        },
        title: 'Bīstamība',
      },
      domainSection: {
        menuAction__manage: 'Pārvaldīt',
        menuAction__remove: 'Dzēst',
        menuAction__verify: 'Verificēt',
        primaryButton: 'Pievienot domēnu',
        subtitle:
          'Ļaujiet lietotājiem pievienoties organizācijai automātiski vai pieprasīt pievienošanos, pamatojoties uz verificētu e-pasta domēnu.',
        title: 'Verificētie domēni',
      },
      successMessage: 'Organizācija ir atjaunināta.',
      title: 'Atjaunināt profilu',
    },
    removeDomainPage: {
      messageLine1: 'E-pasta domēns {{domain}} tiks noņemts.',
      messageLine2: 'Pēc tam lietotāji vairs nevarēs automātiski pievienoties organizācijai.',
      successMessage: '{{domain}} ir noņemts.',
      title: 'Noņemt domēnu',
    },
    securityPage: {
      removeDialog: {
        confirmButton: 'Noņemt savienojumu',
        subtitle:
          'Vai tiešām vēlaties noņemt savienojumu? Šī darbība ir neatgriezeniska un izdzēš savienojumu un visu tā konfigurāciju.',
        title: 'Noņemt SSO savienojumu',
      },
      ssoSection: {
        badge__active: 'Aktīvs',
        badge__inProgress: 'Notiek',
        badge__inactive: 'Neaktīvs',
        badge__unconfigured: 'Nekonfigurēts',
        descriptionLine1: 'Pieprasīt dalībniekiem ar atbilstošu e-pasta domēnu pierakstīties, izmantojot jūsu identitātes nodrošinātāju.',
        domainLabel: 'Domēni:',
        menuAction__activate: 'Aktivizēt',
        menuAction__deactivate: 'Deaktivizēt',
        menuAction__edit: 'Rediģēt',
        menuAction__remove: 'Noņemt',
        primaryButton__continueConfiguration: 'Turpināt konfigurēšanu',
        primaryButton__startConfiguration: 'Sākt konfigurēšanu',
        title: 'SSO',
        tooltip:
          'Dalībnieki bez atbilstoša domēna joprojām var pierakstīties, izmantojot esošās autentifikācijas metodes. Jauni dalībnieki šajā organizācijā tiks piešķirti lomai {{role}}.',
        tooltipLabel: 'Vairāk informācijas',
        tooltip__noRole: 'Dalībnieki bez atbilstoša domēna joprojām var pierakstīties, izmantojot esošās autentifikācijas metodes.',
      },
      title: 'Drošība',
    },
    start: {
      headerTitle__general: 'Vispārīgi',
      headerTitle__members: 'Dalībnieki',
      membershipSeatUsageLabel: 'Izmantotas {{count}} no {{limit}} vietām',
      profileSection: {
        primaryButton: 'Atjaunināt profilu',
        title: 'Profils',
        uploadAction__title: 'Logotips',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Šī domēna noņemšana ietekmēs uzaicinātos lietotājus.',
        removeDomainActionLabel__remove: 'Noņemt domēnu',
        removeDomainSubtitle: 'Noņemiet šo domēnu no verificētajiem domēniem',
        removeDomainTitle: 'Noņemt domēnu',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Lietotāji tiek automātiski uzaicināti pievienoties organizācijai, kad viņi reģistrējas, un var pievienoties jebkurā laikā.',
        automaticInvitationOption__label: 'Automātiskie ielūgumi',
        automaticSuggestionOption__description:
          'Lietotāji saņem ieteikumu pieprasīt pievienošanos, taču pirms pievienošanās organizācijai tos ir jāapstiprina administratoram.',
        automaticSuggestionOption__label: 'Automātiskie ieteikumi',
        calloutInfoLabel: 'Reģistrēšanās režīma maiņa ietekmēs tikai jaunus lietotājus.',
        calloutInvitationCountLabel: 'Neapstiprināti ielūgumi, kas nosūtīti lietotājiem: {{count}}',
        calloutSuggestionCountLabel: 'Neapstiprināti ieteikumi, kas nosūtīti lietotājiem: {{count}}',
        manualInvitationOption__description: 'Lietotājus organizācijā var uzaicināt tikai manuāli.',
        manualInvitationOption__label: 'Nav automātiskas reģistrēšanās',
        subtitle: 'Izvēlieties, kā lietotāji no šī domēna var pievienoties organizācijai.',
      },
      start: {
        headerTitle__danger: 'Bīstamība',
        headerTitle__enrollment: 'Reģistrēšanās iespējas',
      },
      subtitle: 'Domēns {{domain}} tagad ir verificēts. Turpiniet, izvēloties reģistrēšanās režīmu.',
      title: 'Atjaunināt {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Ievadiet verifikācijas kodu, kas nosūtīts uz jūsu e-pasta adresi',
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Nosūtīt atkārtoti",
      subtitle: 'Domēns {{domainName}} ir jāverificē, izmantojot e-pastu.',
      subtitleVerificationCodeScreen: 'Verifikācijas kods tika nosūtīts uz {{emailAddress}}. Ievadiet kodu, lai turpinātu.',
      title: 'Verificēt domēnu',
    },
  },
  organizationSwitcher: {
    action__closeOrganizationSwitcher: 'Aizvērt organizāciju pārslēgu',
    action__createOrganization: 'Izveidot organizāciju',
    action__invitationAccept: 'Pievienoties',
    action__manageOrganization: 'Pārvaldīt',
    action__openOrganizationSwitcher: 'Atvērt organizāciju pārslēgu',
    action__suggestionsAccept: 'Pieprasīt pievienošanos',
    notSelected: 'Nav izvēlēta neviena organizācija',
    personalWorkspace: 'Personīgais konts',
    suggestionsAcceptedLabel: 'Gaida apstiprinājumu',
  },
  paginationButton__next: 'Tālāk',
  paginationButton__previous: 'Iepriekšējā',
  paginationRowText__displaying: 'Rāda',
  paginationRowText__of: 'no',
  reverification: {
    alternativeMethods: {
      actionLink: 'Saņemt palīdzību',
      actionText: 'Nav neviena no šīm?',
      blockButton__backupCode: 'Izmantot rezerves kodu',
      blockButton__emailCode: 'Nosūtīt kodu uz e-pastu {{identifier}}',
      blockButton__passkey: 'Izmantot savu piekļuves atslēgu',
      blockButton__password: 'Turpināt ar savu paroli',
      blockButton__phoneCode: 'Nosūtīt SMS kodu uz {{identifier}}',
      blockButton__totp: 'Izmantot savu autentifikatora lietotni',
      getHelp: {
        blockButton__emailSupport: 'E-pasta atbalsts',
        content:
          'Ja jums ir grūtības verificēt savu kontu, rakstiet mums uz e-pastu, un mēs strādāsim kopā ar jums, lai pēc iespējas ātrāk atjaunotu piekļuvi.',
        title: 'Saņemt palīdzību',
      },
      subtitle: 'Radušās problēmas? Verifikācijai varat izmantot jebkuru no šīm metodēm.',
      title: 'Izmantot citu metodi',
    },
    backupCodeMfa: {
      subtitle: 'Ievadiet rezerves kodu, ko saņēmāt, iestatot divpakāpju autentifikāciju',
      title: 'Ievadiet rezerves kodu',
    },
    emailCode: {
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Nosūtīt atkārtoti",
      subtitle: 'Ievadiet kodu, kas nosūtīts uz jūsu e-pastu, lai turpinātu',
      title: 'Nepieciešama verifikācija',
    },
    noAvailableMethods: {
      message: 'Nevar turpināt verifikāciju. Nav konfigurēts neviens piemērots autentifikācijas faktors',
      subtitle: 'Radās kļūda',
      title: 'Nevar verificēt jūsu kontu',
    },
    passkey: {
      blockButton__passkey: 'Izmantot savu piekļuves atslēgu',
      subtitle:
        'Piekļuves atslēgas izmantošana apstiprina jūsu identitāti. Jūsu ierīce var lūgt pirksta nospiedumu, seju vai ekrāna bloķēšanu.',
      title: 'Izmantot savu piekļuves atslēgu',

    },
    password: {
      actionLink: 'Izmantot citu metodi',
      subtitle: 'Lai turpinātu, ievadiet savu pašreizējo paroli',
      title: 'Nepieciešama verifikācija',
    },
    phoneCode: {
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Sūtīt vēlreiz",
      subtitle: 'Lai turpinātu, ievadiet uz jūsu tālruni nosūtīto kodu',
      title: 'Nepieciešama verifikācija',
    },
    phoneCodeMfa: {
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Sūtīt vēlreiz",
      subtitle: 'Lai turpinātu, ievadiet uz jūsu tālruni nosūtīto kodu',
      title: 'Nepieciešama verifikācija',
    },
    totpMfa: {
      formTitle: 'Verifikācijas kods',
      subtitle: 'Lai turpinātu, ievadiet kodu, ko ģenerējusi jūsu autentifikatora lietotne',
      title: 'Nepieciešama verifikācija',
    },
  },
  searchInput: {
    action__clear: 'Notīrīt meklēšanu',
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Pievienot kontu',
      action__signOutAll: 'Izrakstīties no visiem kontiem',
      subtitle: 'Izvēlieties kontu, ar kuru vēlaties turpināt.',
      title: 'Izvēlieties kontu',
    },
    alternativeMethods: {
      actionLink: 'Saņemt palīdzību',
      actionText: 'Jums nav neviena no šiem?',
      blockButton__backupCode: 'Izmantot rezerves kodu',
      blockButton__emailCode: 'Nosūtīt kodu e-pastā uz {{identifier}}',
      blockButton__emailLink: 'Nosūtīt saiti e-pastā uz {{identifier}}',
      blockButton__passkey: 'Pierakstīties ar savu piekļuves atslēgu',
      blockButton__password: 'Pierakstīties ar savu paroli',
      blockButton__phoneCode: 'Nosūtīt SMS kodu uz {{identifier}}',
      blockButton__totp: 'Izmantot autentifikatora lietotni',
      getHelp: {
        blockButton__emailSupport: 'Rakstīt atbalstam',
        content:
          'Ja jums rodas problēmas, piesakoties savā kontā, rakstiet mums un mēs pēc iespējas ātrāk palīdzēsim atjaunot piekļuvi.',
        title: 'Saņemt palīdzību',
      },
      subtitle: 'Radušās problēmas? Varat izmantot jebkuru no šīm metodēm, lai pierakstītos.',
      title: 'Izmantot citu metodi',
    },
    alternativePhoneCodeProvider: {
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Sūtīt vēlreiz",
      subtitle: 'lai turpinātu {{applicationName}}',
      title: 'Pārbaudiet {{provider}}',
    },
    backupCodeMfa: {
      subtitle: 'Jūsu rezerves kods ir tas, ko saņēmāt, iestatot divu soļu autentifikāciju.',
      title: 'Ievadiet rezerves kodu',
    },
    emailCode: {
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Sūtīt vēlreiz",
      subtitle: 'lai turpinātu {{applicationName}}',
      title: 'Pārbaudiet savu e-pastu',
    },
    emailCodeMfa: {
      formTitle: 'Pārbaudiet savu e-pastu',
      resendButton: "Nesaņēmāt kodu? Sūtīt vēlreiz",
      subtitle: 'lai turpinātu {{applicationName}}',
      title: 'Pārbaudiet savu e-pastu',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Lai turpinātu, atveriet verifikācijas saiti ierīcē un pārlūkprogrammā, no kuras sākāt pierakstīšanos',
        title: 'Verifikācijas saite šai ierīcei nav derīga',
      },
      expired: {
        subtitle: 'Lai turpinātu, atgriezieties sākotnējā cilnē.',
        title: 'Šīs verifikācijas saites derīguma termiņš ir beidzies',
      },
      failed: {
        subtitle: 'Lai turpinātu, atgriezieties sākotnējā cilnē.',
        title: 'Šī verifikācijas saite nav derīga',
      },
      formSubtitle: 'Izmantojiet verifikācijas saiti, kas nosūtīta uz jūsu e-pastu',
      formTitle: 'Verifikācijas saite',
      loading: {
        subtitle: 'Drīz jūs pārvirzīs',
        title: 'Notiek pierakstīšanās...',
      },
      resendButton: "Nesaņēmāt saiti? Sūtīt vēlreiz",
      subtitle: 'lai turpinātu {{applicationName}}',
      title: 'Pārbaudiet savu e-pastu',
      unusedTab: {
        title: 'Varat aizvērt šo cilni',
      },
      verified: {
        subtitle: 'Drīz jūs pārvirzīs',
        title: 'Veiksmīgi pierakstījāties',
      },
      verifiedSwitchTab: {
        subtitle: 'Lai turpinātu, atgriezieties sākotnējā cilnē',
        subtitleNewTab: 'Lai turpinātu, atgriezieties tikko atvērtajā cilnē',
        titleNewTab: 'Pierakstījāties citā cilnē',
      },
      verifiedTransferable: {
        subtitle: 'Lai turpinātu, atgriezieties sākotnējā cilnē',
        title: 'E-pasts verificēts',
      },
    },
    emailLinkMfa: {
      formSubtitle: 'Izmantojiet verifikācijas saiti, kas nosūtīta uz jūsu e-pastu',
      resendButton: "Nesaņēmāt saiti? Sūtīt vēlreiz",
      subtitle: 'lai turpinātu {{applicationName}}',
      title: 'Pārbaudiet savu e-pastu',
    },
    enterpriseConnections: {
      subtitle: 'Izvēlieties uzņēmuma kontu, ar kuru vēlaties turpināt.',
      title: 'Izvēlieties uzņēmuma kontu',
    },
    forgotPassword: {
      formTitle: 'Paroles atiestatīšanas kods',
      resendButton: "Nesaņēmāt kodu? Sūtīt vēlreiz",
      subtitle: 'lai atiestatītu paroli',
      subtitle_email: 'Vispirms ievadiet kodu, kas nosūtīts uz jūsu e-pasta adresi',
      subtitle_phone: 'Vispirms ievadiet kodu, kas nosūtīts uz jūsu tālruni',
      title: 'Atiestatīt paroli',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Atiestatīt paroli',
      label__alternativeMethods: 'Vai arī pierakstieties ar citu metodi',
      title: 'Aizmirsāt paroli?',
    },
    newDeviceVerificationNotice:
      "Jūs pierakstāties no jaunas ierīces. Mēs lūdzam verifikāciju, lai jūsu konts būtu drošībā.",
    noAvailableMethods: {
      message: "Nevar turpināt pierakstīšanos. Nav pieejama autentifikācijas faktora.",
      subtitle: 'Radās kļūda',
      title: 'Nevar pierakstīties',
    },
    passkey: {
      subtitle: "Piekļuves atslēgas izmantošana apstiprina, ka tas esat jūs. Jūsu ierīce var lūgt pirksta nospiedumu, sejas atpazīšanu vai ekrāna bloķēšanu.",
      title: 'Izmantot savu piekļuves atslēgu',
    },
    password: {
      actionLink: 'Izmantot citu metodi',
      subtitle: 'Ievadiet ar kontu saistīto paroli',
      title: 'Ievadiet savu paroli',
    },
    passwordCompromised: {
      title: 'Parole ir apdraudēta',
    },
    passwordPwned: {
      title: 'Parole ir apdraudēta',
    },
    passwordUntrusted: {
      title: 'Parole nav uzticama',
    },
    phoneCode: {
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Sūtīt vēlreiz",
      subtitle: 'lai turpinātu {{applicationName}}',
      title: 'Pārbaudiet savu tālruni',
    },
    phoneCodeMfa: {
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Sūtīt vēlreiz",
      subtitle: 'Lai turpinātu, ievadiet uz jūsu tālruni nosūtīto verifikācijas kodu',
      title: 'Pārbaudiet savu tālruni',
    },
    protectCheck: {
      loading: 'Ielādē…',
      retryButton: 'Mēģināt vēlreiz',
      subtitle: 'Lūdzu, uzgaidiet, kamēr mēs pārbaudām jūsu pieprasījumu.',
      title: 'Pārbaudām jūsu pieprasījumu',
    },
    resetPassword: {
      formButtonPrimary: 'Atiestatīt paroli',
      requiredMessage: 'Drošības apsvērumu dēļ ir jāatiestata parole.',
      successMessage: 'Jūsu parole tika veiksmīgi nomainīta. Notiek pierakstīšanās, lūdzu, uzgaidiet brīdi.',
      title: 'Iestatīt jaunu paroli',
    },
    resetPasswordMfa: {
      detailsLabel: 'Pirms paroles atiestatīšanas mums ir jāpārbauda jūsu identitāte.',
    },
    start: {
      actionLink: 'Reģistrēties',
      actionLink__join_waitlist: 'Pievienoties gaidīšanas sarakstam',
      actionLink__use_email: 'Izmantot e-pastu',

      actionLink__use_email_username: 'Lietot e-pastu vai lietotājvārdu',
      actionLink__use_passkey: 'Tā vietā lietot piekļuves atslēgu',
      actionLink__use_phone: 'Lietot tālruni',
      actionLink__use_username: 'Lietot lietotājvārdu',
      actionText: 'Vai jums nav konta?',
      actionText__join_waitlist: 'Vēlaties agrīnu piekļuvi?',
      alternativePhoneCodeProvider: {
        actionLink: 'Lietot citu metodi',
        label: '{{provider}} tālruņa numurs',
        subtitle: 'Ievadiet savu tālruņa numuru, lai saņemtu verifikācijas kodu, izmantojot {{provider}}.',
        title: 'Pierakstīties {{applicationName}}, izmantojot {{provider}}',
      },
      subtitle: 'Laipni lūdzam atpakaļ! Lai turpinātu, pierakstieties',
      subtitleCombined: undefined,
      title: 'Pierakstīties {{applicationName}}',
      titleCombined: 'Turpināt uz {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Verifikācijas kods',
      subtitle: 'Lai turpinātu, ievadiet verifikācijas kodu, ko ģenerējusi jūsu autentifikatora lietotne',
      title: 'Divpakāpju verifikācija',
    },
    web3Solana: {
      subtitle: 'Lai pierakstītos, izvēlieties tālāk norādīto maku',
      title: 'Pierakstīties ar Solana',
    },
  },
  signInEnterPasswordTitle: 'Ievadiet savu paroli',
  signUp: {
    alternativePhoneCodeProvider: {
      resendButton: "Nesaņēmāt kodu? Nosūtīt vēlreiz",
      subtitle: 'Ievadiet verifikācijas kodu, kas nosūtīts uz jūsu {{provider}}',
      title: 'Apstipriniet savu {{provider}}',
    },
    continue: {
      actionLink: 'Pierakstīties',
      actionText: 'Vai jums jau ir konts?',
      subtitle: 'Lūdzu, aizpildiet atlikušos datus, lai turpinātu.',
      title: 'Aizpildiet trūkstošos laukus',
    },
    emailCode: {
      formSubtitle: 'Ievadiet verifikācijas kodu, kas nosūtīts uz jūsu e-pasta adresi',
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Nosūtīt vēlreiz",
      subtitle: 'Ievadiet verifikācijas kodu, kas nosūtīts uz jūsu e-pastu',
      title: 'Apstipriniet savu e-pastu',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Lai turpinātu, atveriet verifikācijas saiti ierīcē un pārlūkprogrammā, no kuras sākāt reģistrāciju',
        title: 'Verifikācijas saite šai ierīcei nav derīga',
      },
      formSubtitle: 'Lietojiet verifikācijas saiti, kas nosūtīta uz jūsu e-pasta adresi',
      formTitle: 'Verifikācijas saite',
      loading: {
        title: 'Notiek reģistrācija...',
      },
      resendButton: "Nesaņēmāt saiti? Nosūtīt vēlreiz",
      subtitle: 'lai turpinātu uz {{applicationName}}',
      title: 'Apstipriniet savu e-pastu',
      verified: {
        title: 'Reģistrācija veiksmīga',
      },
      verifiedSwitchTab: {
        subtitle: 'Lai turpinātu, atgriezieties tikko atvērtajā cilnē',
        subtitleNewTab: 'Lai turpinātu, atgriezieties iepriekšējā cilnē',
        title: 'E-pasts veiksmīgi apstiprināts',
      },
    },
    enterpriseConnections: {
      subtitle: 'Atlasiet uzņēmuma kontu, ar kuru vēlaties turpināt.',
      title: 'Izvēlieties savu uzņēmuma kontu',
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Piekrītu {{ privacyPolicyLink || link("Privātuma politikai") }}',
        label__onlyTermsOfService: 'Piekrītu {{ termsOfServiceLink || link("Lietošanas noteikumiem") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Piekrītu {{ termsOfServiceLink || link("Lietošanas noteikumiem") }} un {{ privacyPolicyLink || link("Privātuma politikai") }}',
      },
      continue: {
        subtitle: 'Lūdzu, izlasiet un pieņemiet noteikumus, lai turpinātu',
        title: 'Juridiska piekrišana',
      },
    },
    phoneCode: {
      formSubtitle: 'Ievadiet verifikācijas kodu, kas nosūtīts uz jūsu tālruņa numuru',
      formTitle: 'Verifikācijas kods',
      resendButton: "Nesaņēmāt kodu? Nosūtīt vēlreiz",
      subtitle: 'Ievadiet verifikācijas kodu, kas nosūtīts uz jūsu tālruni',
      title: 'Apstipriniet savu tālruni',
    },
    protectCheck: {
      loading: 'Ielādē…',
      retryButton: 'Mēģināt vēlreiz',
      subtitle: 'Lūdzu, uzgaidiet, kamēr mēs pārbaudām jūsu pieprasījumu.',
      title: 'Tiek pārbaudīts jūsu pieprasījums',
    },
    restrictedAccess: {
      actionLink: 'Pierakstīties',
      actionText: 'Vai jums jau ir konts?',
      blockButton__emailSupport: 'E-pasta atbalsts',
      blockButton__joinWaitlist: 'Pievienoties gaidīšanas sarakstam',
      subtitle: 'Reģistrācija pašlaik ir atspējota. Ja uzskatāt, ka jums vajadzētu būt piekļuvei, sazinieties ar atbalsta dienestu.',
      subtitleWaitlist: 'Reģistrācija pašlaik ir atspējota. Lai pirmais uzzinātu, kad mēs sāksim darbību, pievienojieties gaidīšanas sarakstam.',
      title: 'Piekļuve ierobežota',
    },
    start: {
      actionLink: 'Pierakstīties',
      actionLink__use_email: 'Tā vietā lietot e-pastu',
      actionLink__use_phone: 'Tā vietā lietot tālruni',
      actionText: 'Vai jums jau ir konts?',
      alternativePhoneCodeProvider: {
        actionLink: 'Lietot citu metodi',
        label: '{{provider}} tālruņa numurs',
        subtitle: 'Ievadiet savu tālruņa numuru, lai saņemtu verifikācijas kodu, izmantojot {{provider}}.',
        title: 'Reģistrēties {{applicationName}}, izmantojot {{provider}}',
      },
      subtitle: 'Laipni lūdzam! Lūdzu, aizpildiet datus, lai sāktu.',
      subtitleCombined: 'Laipni lūdzam! Lūdzu, aizpildiet datus, lai sāktu.',
      title: 'Izveidot savu kontu',
      titleCombined: 'Izveidot savu kontu',
    },
    web3Solana: {
      subtitle: 'Lai reģistrētos, izvēlieties tālāk norādīto maku',
      title: 'Reģistrēties ar Solana',
    },
  },
  socialButtonsBlockButton: 'Turpināt ar {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  taskChooseOrganization: {
    alerts: {
      organizationAlreadyExists:
        'Organizācija jau pastāv ar noteikto uzņēmuma nosaukumu ({{organizationName}}) un {{organizationDomain}}. Pievienojieties ar ielūgumu.',
    },
    chooseOrganization: {
      action__createOrganization: 'Izveidot jaunu organizāciju',
      action__invitationAccept: 'Pievienoties',
      action__suggestionsAccept: 'Pieprasīt pievienošanos',
      subtitle: 'Pievienojieties esošai organizācijai vai izveidojiet jaunu',
      subtitle__createOrganizationDisabled: 'Pievienoties esošai organizācijai',
      suggestionsAcceptedLabel: 'Gaida apstiprinājumu',
      title: 'Izvēlieties organizāciju',
    },
    createOrganization: {
      formButtonReset: 'Atcelt',
      formButtonSubmit: 'Turpināt',
      formFieldInputPlaceholder__name: 'Mana organizācija',
      formFieldInputPlaceholder__slug: 'my-organization',
      formFieldLabel__name: 'Nosaukums',
      formFieldLabel__slug: 'Slug',
      subtitle: 'Ievadiet savas organizācijas datus, lai turpinātu',
      title: 'Iestatiet savu organizāciju',
    },
    organizationCreationDisabled: {
      subtitle: 'Lai saņemtu ielūgumu, sazinieties ar savas organizācijas administratoru.',
      title: 'Jums jāpieder kādai organizācijai',
    },
    signOut: {
      actionLink: 'Izrakstīties',
      actionText: 'Pierakstījies kā {{identifier}}',
    },
  },
  taskResetPassword: {
    formButtonPrimary: 'Atiestatīt paroli',
    signOut: {
      actionLink: 'Izrakstīties',
      actionText: 'Pierakstījies kā {{identifier}}',
    },
    subtitle: 'Pirms varat turpināt, jūsu kontam nepieciešama jauna parole',
    title: 'Atiestatiet savu paroli',
  },
  taskSetupMfa: {
    badge: 'Divpakāpju verifikācijas iestatīšana',
    signOut: {
      actionLink: 'Izrakstīties',
      actionText: 'Pierakstījies kā {{identifier}}',
    },
    smsCode: {
      addPhone: {
        formButtonPrimary: 'Turpināt',
        infoText:
          'Uz šo tālruņa numuru tiks nosūtīta īsziņa ar verifikācijas kodu. Var tikt piemērotas ziņojumu un datu pārraides maksas.',
      },
      addPhoneNumber: 'Pievienot tālruņa numuru',
      cancel: 'Atcelt',
      subtitle: 'Izvēlieties tālruņa numuru, kuru vēlaties izmantot divpakāpju verifikācijai ar SMS kodu',
      success: {
        finishButton: 'Turpināt',
        message1:
          'Divpakāpju verifikācija tagad ir iespējota. Pierakstoties jums kā papildu darbība būs jāievada verifikācijas kods, kas nosūtīts uz šo tālruņa numuru.',
        message2:
          'Saglabājiet šos rezerves kodus un glabājiet tos drošā vietā. Ja zaudējat piekļuvi savai autentifikācijas ierīcei, varat izmantot rezerves kodus, lai pierakstītos.',

        title: 'SMS koda verifikācija iespējota',
      },
      title: 'Pievienot SMS koda verifikāciju',
      verifyPhone: {
        formButtonPrimary: 'Turpināt',
        formTitle: 'Verifikācijas kods',
        resendButton: "Nesaņēmāt kodu? Nosūtīt atkārtoti",
        subtitle: 'Ievadiet verifikācijas kodu, kas nosūtīts uz',
        title: 'Apstipriniet savu tālruņa numuru',
      },
    },
    start: {
      methodSelection: {
        phoneCode: 'SMS kods',
        totp: 'Autentifikatora lietotne',
      },
      subtitle: 'Izvēlieties, kuru metodi vēlaties, lai aizsargātu savu kontu ar papildu drošības līmeni',
      title: 'Iestatīt divpakāpju verifikāciju',
    },
    totpCode: {
      addAuthenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Tā vietā skenējiet QR kodu',
        buttonUnableToScan__nonPrimary: "Nevarat skenēt QR kodu?",
        formButtonPrimary: 'Turpināt',
        formButtonReset: 'Atcelt',
        infoText__ableToScan:
          'Iestatiet jaunu pierakstīšanās metodi savā autentifikatora lietotnē un skenējiet šo QR kodu, lai to saistītu ar savu kontu.',
        infoText__unableToScan: 'Iestatiet jaunu pierakstīšanās metodi savā autentifikatorā un ievadiet tālāk norādīto atslēgu.',
        inputLabel__unableToScan1:
          'Pārliecinieties, ka ir iespējotas uz laiku balstītās vai vienreizējās paroles, un pēc tam pabeidziet konta saistīšanu.',
      },
      success: {
        finishButton: 'Turpināt',
        message1:
          'Divpakāpju verifikācija tagad ir iespējota. Pierakstoties jums kā papildu solis būs jāievada šī autentifikatora verifikācijas kods.',
        message2:
          'Saglabājiet šos rezerves kodus un glabājiet tos drošā vietā. Ja zaudējat piekļuvi savai autentifikācijas ierīcei, pierakstīšanai varat izmantot rezerves kodus.',
        title: 'Autentifikatora lietotnes verifikācija iespējota',
      },
      title: 'Pievienot autentifikatora lietotni',
      verifyTotp: {
        formButtonPrimary: 'Turpināt',
        formButtonReset: 'Atcelt',
        formTitle: 'Verifikācijas kods',
        subtitle: 'Ievadiet autentifikatora ģenerēto verifikācijas kodu',
        title: 'Pievienot autentifikatora lietotni',
      },
    },
  },
  unstable__errors: {
    action_blocked: "Šo darbību neizdevās pabeigt. Lūdzu, vēlāk mēģiniet vēlreiz vai, ja tas turpinās, sazinieties ar atbalstu.",
    already_a_member_in_organization: '{{email}} jau ir organizācijas dalībnieks.',
    api_key_name_already_exists: 'API atslēgas nosaukums jau pastāv.',
    api_key_usage_exceeded: 'Esat sasniedzis lietošanas limitu. Limitu var noņemt, pārejot uz maksas plānu.',
    avatar_file_size_exceeded: 'Faila izmērs pārsniedz maksimālo 10 MB limitu. Lūdzu, izvēlieties mazāku failu.',
    avatar_file_type_invalid: 'Faila tips netiek atbalstīts. Lūdzu, augšupielādējiet JPG, PNG, GIF vai WEBP attēlu.',
    captcha_invalid: undefined,
    captcha_unavailable:
      'Reģistrācija neizdevās, jo neizdevās bota validācija. Lūdzu, atsvaidziniet lapu, lai mēģinātu vēlreiz, vai sazinieties ar atbalstu, lai saņemtu papildu palīdzību.',
    form_code_incorrect: undefined,
    form_email_address_blocked: undefined,
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
    form_new_password_matches_current: 'Jaunā parole nedrīkst būt tāda pati kā pašreizējā parole.',
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: undefined,
    form_param_format_invalid__phone_number: undefined,
    form_param_max_length_exceeded__first_name: undefined,
    form_param_max_length_exceeded__last_name: undefined,
    form_param_max_length_exceeded__name: undefined,
    form_param_nil: undefined,
    form_param_type_invalid: undefined,
    form_param_type_invalid__email_address: undefined,
    form_param_type_invalid__phone_number: undefined,
    form_param_value_invalid: undefined,
    form_password_compromised__sign_in: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: 'Jūsu parole ir pārāk īsa. Tai jābūt vismaz 8 rakstzīmes garai.',
    form_password_matches_identifier:
      'Parole nedrīkst sakrist ar jūsu e-pasta adresi, tālruņa numuru vai lietotājvārdu. Konta drošībai, lūdzu, izmantojiet citu paroli.',
    form_password_not_strong_enough: 'Jūsu parole nav pietiekami spēcīga.',
    form_password_or_identifier_incorrect: undefined,
    form_password_pwned:
      'Šī parole ir atrasta datu noplūdē un to nevar izmantot; lūdzu, izmēģiniet citu paroli.',
    form_password_pwned__sign_in:
      'Šī parole ir atrasta datu noplūdē un to nevar izmantot; lūdzu, atiestatiet savu paroli.',
    form_password_size_in_bytes_exceeded: undefined,
    form_password_untrusted__sign_in:
      'Jūsu parole var būt apdraudēta. Lai aizsargātu kontu, lūdzu, turpiniet ar alternatīvu pierakstīšanās metodi. Pēc pierakstīšanās jums būs jāatiestata parole.',
    form_password_validation_failed: undefined,
    form_username_invalid_character: undefined,
    form_username_invalid_length: 'Jūsu lietotājvārdam jābūt no {{min_length}} līdz {{max_length}} rakstzīmēm garam.',
    form_username_needs_non_number_char: 'Jūsu lietotājvārdam jāsatur vismaz viena rakstzīme, kas nav cipars.',
    identification_deletion_failed: undefined,
    insufficient_seats_change_plan:
      'Jūsu organizācijai nav pietiekami daudz vietu, lai uzaicinātu vēlamo dalībnieku skaitu. Lūdzu, pārejiet uz plānu, kas atbalsta dalībnieku skaitu, kuru mēģināt uzaicināt.',
    insufficient_seats_contact_support:
      'Jūsu organizācijai nav pietiekami daudz vietu, lai uzaicinātu vēlamo dalībnieku skaitu. Lūdzu, sazinieties ar atbalstu.',
    not_allowed_access: undefined,
    oauth_access_denied: 'Jūs nepiešķīrāt piekļuvi savam kontam.',
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded:
      'Esat sasniedzis organizācijas dalības limitu, ieskaitot neapstiprinātos uzaicinājumus.',
    organization_minimum_permissions_needed: undefined,
    organization_not_found_or_unauthorized:
      'Jūs vairs neesat šīs organizācijas dalībnieks. Lūdzu, izvēlieties vai izveidojiet citu.',
    organization_not_found_or_unauthorized_with_create_organization_disabled:
      'Jūs vairs neesat šīs organizācijas dalībnieks. Lūdzu, izvēlieties citu.',
    passkey_already_exists: 'Šai ierīcei jau ir reģistrēta piekļuves atslēga (passkey).',
    passkey_not_supported: 'Piekļuves atslēgas (passkeys) šajā ierīcē netiek atbalstītas.',
    passkey_pa_not_supported: 'Reģistrācijai nepieciešams platformas autentifikators, taču ierīce to neatbalsta.',
    passkey_registration_cancelled: 'Piekļuves atslēgas reģistrācija tika atcelta vai beidzās tās derīguma termiņš.',
    passkey_retrieval_cancelled: 'Piekļuves atslēgas verifikācija tika atcelta vai beidzās tās derīguma termiņš.',
    passwordComplexity: {
      maximumLength: 'mazāk nekā {{length}} rakstzīmes',
      minimumLength: '{{length}} vai vairāk rakstzīmes',
      requireLowercase: 'mazais burts',
      requireNumbers: 'cipars',
      requireSpecialCharacter: 'īpašā rakstzīme',
      requireUppercase: 'lielais burts',
      sentencePrefix: 'Jūsu parolei jāsatur',
    },
    phone_number_exists: undefined,
    protect_check_aborted: undefined,
    protect_check_already_resolved: undefined,
    protect_check_execution_failed: "Verifikācija netika pabeigta. Lūdzu, mēģiniet vēlreiz.",
    protect_check_invalid_script: "Neizdevās ielādēt verifikāciju. Ja tas turpinās, lūdzu, sazinieties ar atbalstu.",
    protect_check_invalid_sdk_url: "Verifikāciju neizdevās sākt. Lūdzu, sazinieties ar atbalstu.",
    protect_check_script_load_failed:
      "Neizdevās ielādēt verifikāciju. To var izraisīt tīkla problēma vai satura drošības politika (Content Security Policy), kas bloķē verifikācijas skriptu. Lūdzu, mēģiniet vēlreiz vai sazinieties ar atbalstu.",
    protect_check_timed_out: "Verifikācija netika pabeigta laikā. Lūdzu, mēģiniet vēlreiz.",
    protect_check_unsupported_environment:
      "Verifikācija šajā vidē netiek atbalstīta. Lūdzu, turpiniet standarta pārlūkā vai sazinieties ar atbalstu.",
    session_exists: undefined,
    ticket_expired_code: 'Šīs saites derīguma termiņš ir beidzies. Lūdzu, sāciet no jauna vai pieprasiet jaunu saiti.',
    ticket_invalid_code:
      'Šī saite vairs nav derīga vai jau ir izmantota. Lūdzu, sāciet no jauna vai pieprasiet jaunu saiti.',
    web3_missing_identifier: 'Web3 maciņa paplašinājums netiek atrasts. Lūdzu, instalējiet to, lai turpinātu.',
    web3_signature_request_rejected: 'Jūs noraidījāt paraksta pieprasījumu. Lūdzu, mēģiniet vēlreiz, lai turpinātu.',
    web3_solana_signature_generation_failed:
      'Ģenerējot parakstu, radās kļūda. Lūdzu, mēģiniet vēlreiz, lai turpinātu.',
    zxcvbn: {
      couldBeStronger: 'Jūsu parole der, taču varētu būt spēcīgāka. Mēģiniet pievienot vairāk rakstzīmju.',
      goodPassword: 'Jūsu parole atbilst visām nepieciešamajām prasībām.',
      notEnough: 'Jūsu parole nav pietiekami spēcīga.',
      suggestions: {
        allUppercase: 'Rakstiet ar lielo burtu dažus, bet ne visus burtus.',
        anotherWord: 'Pievienojiet vairāk vārdu, kas ir retāk sastopami.',
        associatedYears: 'Izvairieties no gadiem, kas saistīti ar jums.',
        capitalization: 'Rakstiet ar lielo burtu vairāk nekā tikai pirmo burtu.',
        dates: 'Izvairieties no datumiem un gadiem, kas saistīti ar jums.',
        l33t: "Izvairieties no paredzamiem burtu aizstājumiem, piemēram, '@' 'a' vietā.",
        longerKeyboardPattern: 'Izmantojiet garākus tastatūras rakstus un vairākkārt mainiet rakstīšanas virzienu.',
        noNeed: 'Spēcīgas paroles var izveidot arī bez simboliem, cipariem vai lielajiem burtiem.',
        pwned: 'Ja izmantojat šo paroli citur, jums to vajadzētu nomainīt.',
        recentYears: 'Izvairieties no neseniem gadiem.',
        repeated: 'Izvairieties no atkārtotiem vārdiem un rakstzīmēm.',
        reverseWords: 'Izvairieties no parastu vārdu apgrieztām rakstībām.',
        sequences: 'Izvairieties no parastām rakstzīmju secībām.',
        useWords: 'Izmantojiet vairākus vārdus, bet izvairieties no parastām frāzēm.',
      },
      warnings: {
        common: 'Šī ir bieži lietota parole.',
        commonNames: 'Parastus vārdus un uzvārdus ir viegli uzminēt.',
        dates: 'Datumus ir viegli uzminēt.',
        extendedRepeat: 'Atkārtotus rakstzīmju modeļus, piemēram, "abcabcabc", ir viegli uzminēt.',
        keyPattern: 'Īsus tastatūras rakstus ir viegli uzminēt.',
        namesByThemselves: 'Atsevišķus vārdus vai uzvārdus ir viegli uzminēt.',
        pwned: 'Jūsu parole tika atklāta interneta datu noplūdē.',
        recentYears: 'Nesenus gadus ir viegli uzminēt.',
        sequences: 'Parastas rakstzīmju secības, piemēram, "abc", ir viegli uzminēt.',
        similarToCommon: 'Šī parole ir līdzīga bieži lietotai parolei.',
        simpleRepeat: 'Atkārtotas rakstzīmes, piemēram, "aaa", ir viegli uzminēt.',
        straightRow: 'Taisnas tastatūras taustiņu rindas ir viegli uzminēt.',
        topHundred: 'Šī ir bieži lietota parole.',
        topTen: 'Šī ir ļoti bieži lietota parole.',
        userInputs: 'Nedrīkst būt nekādu personisku vai ar lapu saistītu datu.',
        wordByItself: 'Atsevišķus vārdus ir viegli uzminēt.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Pievienot kontu',
    action__closeUserMenu: 'Aizvērt lietotāja izvēlni',
    action__manageAccount: 'Pārvaldīt kontu',
    action__openUserMenu: 'Atvērt lietotāja izvēlni',
    action__signOut: 'Izrakstīties',
    action__signOutAll: 'Izrakstīties no visiem kontiem',
    label__accountActions: 'Konta darbības',
    label__activeSessions: 'Aktīvās sesijas',

    label__userButtonPopover: 'Konta panelis',
  },
  userProfile: {
    apiKeysPage: {
      title: 'API atslēgas',
    },
    backupCodePage: {
      actionLabel__copied: 'Nokopēts!',
      actionLabel__copy: 'Kopēt visu',
      actionLabel__download: 'Lejupielādēt .txt',
      actionLabel__print: 'Drukāt',
      infoText1: 'Šim kontam tiks iespējoti rezerves kodi.',
      infoText2:
        'Glabājiet rezerves kodus slepenus un uzglabājiet tos droši. Ja jums ir aizdomas, ka tie ir kompromitēti, varat tos ģenerēt no jauna.',
      subtitle__codelist: 'Uzglabājiet tos droši un paturiet slepenus.',
      successMessage:
        'Rezerves kodi tagad ir iespējoti. Ja zaudēsiet piekļuvi autentifikācijas ierīcei, varēsiet izmantot vienu no šiem kodiem, lai pierakstītos savā kontā. Katru kodu var izmantot tikai vienreiz.',
      successSubtitle:
        'Ja zaudēsiet piekļuvi autentifikācijas ierīcei, varēsiet izmantot vienu no šiem kodiem, lai pierakstītos savā kontā.',
      title: 'Pievienot rezerves koda verifikāciju',
      title__codelist: 'Rezerves kodi',
    },
    billingPage: {
      accountCreditsSection: {
        title: 'Konta kredīti',
        viewHistory: 'Skatīt kredītu vēsturi',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Datums',
        title: 'Konta kredītu vēsture',
      },
      paymentHistorySection: {
        empty: 'Nav maksājumu vēstures',
        notFound: 'Maksājuma mēģinājums nav atrasts',
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Datums',
        tableHeader__status: 'Statuss',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Padarīt par noklusējumu',
        actionLabel__remove: 'Noņemt',
        add: 'Pievienot jaunu maksājuma metodi',
        addSubtitle: 'Pievienojiet savam kontam jaunu maksājuma metodi.',
        cancelButton: 'Atcelt',
        formButtonPrimary__add: 'Pievienot maksājuma metodi',
        formButtonPrimary__pay: 'Maksāt {{amount}}',
        payWithTestCardButton: 'Maksāt ar testa karti',
        removeMethod: {
          messageLine1: '{{identifier}} tiks noņemts no šī konta.',
          messageLine2:
            'Jūs vairs nevarēsiet izmantot šo maksājuma avotu, un visi no tā atkarīgie periodiskie abonementi vairs nedarbosies.',
          successMessage: '{{paymentMethod}} ir noņemts no jūsu konta.',
          title: 'Noņemt maksājuma metodi',
        },
        title: 'Maksājuma metodes',
      },
      start: {
        headerTitle__payments: 'Maksājumi',
        headerTitle__plans: 'Plāni',
        headerTitle__statements: 'Pārskati',
        headerTitle__subscriptions: 'Abonements',
      },
      statementsSection: {
        empty: 'Nav pārskatu, ko parādīt',
        itemCaption__paidForPlan: 'Apmaksāts {{plan}} {{period}} plāns',
        itemCaption__payerCredit: 'Kredīts no konta atlikuma',
        itemCaption__proratedCredit: 'Proporcionāls kredīts par iepriekšējā abonementa daļēju izmantošanu',
        itemCaption__subscribedAndPaidForPlan: 'Abonēts un apmaksāts {{plan}} {{period}} plāns',
        notFound: 'Pārskats nav atrasts',
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Datums',
        title: 'Pārskati',
        totalPaid: 'Kopā samaksāts',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Pārvaldīt',
        actionLabel__newSubscription: 'Abonēt plānu',
        actionLabel__switchPlan: 'Mainīt plānus',
        overview: 'Pārskats',
        tableHeader__edit: 'Rediģēt',
        tableHeader__plan: 'Plāns',
        tableHeader__startDate: 'Sākuma datums',
        title: 'Abonements',
      },
      subscriptionsSection: {
        actionLabel__default: 'Pārvaldīt',
      },
      switchPlansSection: {
        title: 'Mainīt plānus',
      },
      title: 'Norēķini',
    },
    connectedAccountPage: {
      formHint: 'Izvēlieties pakalpojumu sniedzēju, lai savienotu savu kontu.',
      formHint__noAccounts: 'Nav pieejamu ārējo kontu pakalpojumu sniedzēju.',
      removeResource: {
        messageLine1: '{{identifier}} tiks noņemts no šī konta.',
        messageLine2:
          'Jūs vairs nevarēsiet izmantot šo savienoto kontu, un visas no tā atkarīgās funkcijas vairs nedarbosies.',
        successMessage: '{{connectedAccount}} ir noņemts no jūsu konta.',
        title: 'Noņemt savienoto kontu',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'Pakalpojumu sniedzējs ir pievienots jūsu kontam',
      title: 'Pievienot savienoto kontu',
    },
    deletePage: {
      actionDescription: 'Lai turpinātu, ierakstiet tālāk "Dzēst kontu".',
      confirm: 'Dzēst kontu',
      messageLine1:
        'Vai tiešām vēlaties dzēst savu kontu? Daži saistītie dati var tikt saglabāti. Lai pieprasītu pilnīgu datu dzēšanu, sazinieties ar atbalsta dienestu.',
      messageLine2: 'Šī darbība ir neatgriezeniska un to nevar atsaukt.',
      title: 'Dzēst kontu',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Uz šo e-pasta adresi tiks nosūtīts e-pasts ar verifikācijas kodu.',
        formSubtitle: 'Ievadiet verifikācijas kodu, kas nosūtīts uz {{identifier}}',
        formTitle: 'Verifikācijas kods',
        resendButton: "Nesaņēmāt kodu? Nosūtīt vēlreiz",
        successMessage: 'E-pasts {{identifier}} ir pievienots jūsu kontam.',
      },
      emailLink: {
        formHint: 'Uz šo e-pasta adresi tiks nosūtīts e-pasts ar verifikācijas saiti.',
        formSubtitle: 'Noklikšķiniet uz verifikācijas saites e-pastā, kas nosūtīts uz {{identifier}}',
        formTitle: 'Verifikācijas saite',
        resendButton: "Nesaņēmāt saiti? Nosūtīt vēlreiz",
        successMessage: 'E-pasts {{identifier}} ir pievienots jūsu kontam.',
      },
      enterpriseSSOLink: {
        formButton: 'Noklikšķiniet, lai pierakstītos',
        formSubtitle: 'Pabeidziet pierakstīšanos ar {{identifier}}',
      },
      formHint: "Šī e-pasta adrese ir jāverificē, pirms to var pievienot jūsu kontam.",
      removeResource: {
        messageLine1: '{{identifier}} tiks noņemts no šī konta.',
        messageLine2: 'Jūs vairs nevarēsiet pierakstīties, izmantojot šo e-pasta adresi.',
        successMessage: '{{emailAddress}} ir noņemts no jūsu konta.',
        title: 'Noņemt e-pasta adresi',
      },
      title: 'Pievienot e-pasta adresi',
      verifyTitle: 'Verificēt e-pasta adresi',
    },
    formButtonPrimary__add: 'Pievienot',
    formButtonPrimary__continue: 'Turpināt',
    formButtonPrimary__finish: 'Pabeigt',
    formButtonPrimary__remove: 'Noņemt',
    formButtonPrimary__save: 'Saglabāt',
    formButtonReset: 'Atcelt',
    mfaPage: {
      formHint: 'Izvēlieties metodi, ko pievienot.',
      title: 'Pievienot divpakāpju verifikāciju',
    },
    mfaPhoneCodePage: {
      backButton: 'Izmantot esošo numuru',
      primaryButton__addPhoneNumber: 'Pievienot tālruņa numuru',
      removeResource: {
        messageLine1: '{{identifier}} vairs nesaņems verifikācijas kodus, pierakstoties.',
        messageLine2: 'Jūsu konts var nebūt tik drošs. Vai tiešām vēlaties turpināt?',
        successMessage: 'SMS koda divpakāpju verifikācija ir noņemta numuram {{mfaPhoneCode}}',
        title: 'Noņemt divpakāpju verifikāciju',
      },
      subtitle__availablePhoneNumbers:
        'Izvēlieties esošu tālruņa numuru, lai reģistrētu SMS koda divpakāpju verifikāciju, vai pievienojiet jaunu.',
      subtitle__unavailablePhoneNumbers:
        'Nav pieejamu tālruņa numuru, ko reģistrēt SMS koda divpakāpju verifikācijai; lūdzu, pievienojiet jaunu.',
      successMessage1:
        'Pierakstoties kā papildu darbību būs jāievada uz šo tālruņa numuru nosūtīts verifikācijas kods.',
      successMessage2:
        'Saglabājiet šos rezerves kodus un uzglabājiet tos drošā vietā. Ja zaudēsiet piekļuvi autentifikācijas ierīcei, pierakstīšanās varēsiet izmantot rezerves kodus.',
      successTitle: 'SMS koda verifikācija ir iespējota',
      title: 'Pievienot SMS koda verifikāciju',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Tā vietā skenējiet QR kodu',
        buttonUnableToScan__nonPrimary: 'Nevarat skenēt QR kodu?',
        infoText__ableToScan:
          'Iestatiet jaunu pierakstīšanās metodi autentifikatora lietotnē un skenējiet šo QR kodu, lai to saistītu ar savu kontu.',
        infoText__unableToScan: 'Iestatiet jaunu pierakstīšanās metodi autentifikatorā un ievadiet tālāk norādīto atslēgu.',
        inputLabel__unableToScan1:
          'Pārliecinieties, ka ir iespējotas uz laiku balstītās vai vienreizējās paroles, un pēc tam pabeidziet konta saistīšanu.',
        inputLabel__unableToScan2:
          'Varat arī kopēt pilnu URI, ja jūsu autentifikators atbalsta TOTP URI.',
      },
      removeResource: {
        messageLine1: 'Pierakstoties vairs nebūs nepieciešami verifikācijas kodi no šī autentifikatora.',
        messageLine2: 'Jūsu konts var nebūt tik drošs. Vai tiešām vēlaties turpināt?',
        successMessage: 'Divpakāpju verifikācija, izmantojot autentifikatora lietotni, ir noņemta.',
        title: 'Noņemt divpakāpju verifikāciju',
      },
      successMessage:
        'Divpakāpju verifikācija tagad ir iespējota. Pierakstoties kā papildu darbību būs jāievada verifikācijas kods no šī autentifikatora.',

      title: 'Pievienot autentifikatora lietotni',
      verifySubtitle: 'Ievadiet verifikācijas kodu, ko ģenerējis jūsu autentifikators',
      verifyTitle: 'Verifikācijas kods',
    },
    mobileButton__menu: 'Izvēlne',
    navbar: {
      account: 'Profils',
      apiKeys: 'API atslēgas',
      billing: 'Norēķini',
      description: 'Pārvaldiet sava konta informāciju.',
      security: 'Drošība',
      title: 'Konts',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} tiks noņemts no šī konta.',
        title: 'Noņemt passkey',
      },
      subtitle__rename: 'Varat mainīt passkey nosaukumu, lai to būtu vieglāk atrast.',
      title__rename: 'Pārdēvēt passkey',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Ieteicams izrakstīties no visām pārējām ierīcēm, kurās, iespējams, tika izmantota jūsu vecā parole.',
      readonly: 'Jūsu paroli pašlaik nevar rediģēt, jo pierakstīties varat tikai caur uzņēmuma savienojumu.',
      successMessage__set: 'Jūsu parole ir iestatīta.',
      successMessage__signOutOfOtherSessions: 'No visām pārējām ierīcēm ir izrakstīts.',
      successMessage__update: 'Jūsu parole ir atjaunināta.',
      title__set: 'Iestatīt paroli',
      title__update: 'Atjaunināt paroli',
    },
    phoneNumberPage: {
      infoText:
        'Uz šo tālruņa numuru tiks nosūtīta īsziņa ar verifikācijas kodu. Var tikt piemēroti īsziņu un datu tarifi.',
      removeResource: {
        messageLine1: '{{identifier}} tiks noņemts no šī konta.',
        messageLine2: 'Jūs vairs nevarēsiet pierakstīties, izmantojot šo tālruņa numuru.',
        successMessage: '{{phoneNumber}} ir noņemts no jūsu konta.',
        title: 'Noņemt tālruņa numuru',
      },
      successMessage: '{{identifier}} ir pievienots jūsu kontam.',
      title: 'Pievienot tālruņa numuru',
      verifySubtitle: 'Ievadiet verifikācijas kodu, kas nosūtīts uz {{identifier}}',
      verifyTitle: 'Apstiprināt tālruņa numuru',
    },
    plansPage: {
      title: 'Plāni',
    },
    profilePage: {
      fileDropAreaHint: 'Ieteicamais izmērs 1:1, līdz 10 MB.',
      imageFormDestructiveActionSubtitle: 'Noņemt',
      imageFormSubtitle: 'Augšupielādēt',
      imageFormTitle: 'Profila attēls',
      readonly: 'Jūsu profila informāciju ir sniedzis uzņēmuma savienojums, un to nevar rediģēt.',
      successMessage: 'Jūsu profils ir atjaunināts.',
      title: 'Atjaunināt profilu',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Izrakstīties no ierīces',
        title: 'Aktīvās ierīces',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Atjaunot savienojumu',
        actionLabel__reauthorize: 'Autorizēt tagad',
        destructiveActionTitle: 'Noņemt',
        primaryButton: 'Savienot kontu',
        subtitle__disconnected: 'Šis konts ir atvienots.',
        subtitle__reauthorize:
          'Nepieciešamās atļaujas ir atjauninātas, un jums var būt ierobežota funkcionalitāte. Lūdzu, autorizējiet šo lietotni vēlreiz, lai izvairītos no problēmām',
        title: 'Savienotie konti',
      },
      dangerSection: {
        deleteAccountButton: 'Dzēst kontu',
        title: 'Dzēst kontu',
      },
      emailAddressesSection: {
        destructiveAction: 'Noņemt e-pastu',
        detailsAction__nonPrimary: 'Iestatīt kā primāro',
        detailsAction__primary: 'Pabeigt verifikāciju',
        detailsAction__unverified: 'Verificēt',
        primaryButton: 'Pievienot e-pasta adresi',
        title: 'E-pasta adreses',
      },
      enterpriseAccountsSection: {
        primaryButton: 'Savienot kontu',
        title: 'Uzņēmuma konti',
      },
      headerTitle__account: 'Profila informācija',
      headerTitle__security: 'Drošība',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Ģenerēt no jauna',
          headerTitle: 'Rezerves kodi',
          subtitle__regenerate:
            'Iegūstiet jaunu drošu rezerves kodu komplektu. Iepriekšējie rezerves kodi tiks dzēsti, un tos vairs nevarēs izmantot.',
          title__regenerate: 'Ģenerēt rezerves kodus no jauna',
        },
        phoneCode: {
          actionLabel__setDefault: 'Iestatīt kā noklusējumu',
          destructiveActionLabel: 'Noņemt',
        },
        primaryButton: 'Pievienot divpakāpju verifikāciju',
        title: 'Divpakāpju verifikācija',
        totp: {
          destructiveActionTitle: 'Noņemt',
          headerTitle: 'Autentifikatora lietotne',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Noņemt',
        menuAction__rename: 'Pārdēvēt',
        primaryButton: 'Pievienot passkey',
        title: 'Passkeys',
      },
      passwordSection: {
        primaryButton__setPassword: 'Iestatīt paroli',
        primaryButton__updatePassword: 'Atjaunināt paroli',
        title: 'Parole',
      },
      phoneNumbersSection: {
        destructiveAction: 'Noņemt tālruņa numuru',
        detailsAction__nonPrimary: 'Iestatīt kā primāro',
        detailsAction__primary: 'Pabeigt verifikāciju',
        detailsAction__unverified: 'Verificēt tālruņa numuru',
        primaryButton: 'Pievienot tālruņa numuru',
        title: 'Tālruņa numuri',
      },
      profileSection: {
        primaryButton: 'Atjaunināt profilu',
        title: 'Profils',
      },
      usernameSection: {
        primaryButton__setUsername: 'Iestatīt lietotājvārdu',
        primaryButton__updateUsername: 'Atjaunināt lietotājvārdu',
        title: 'Lietotājvārds',
      },
      web3WalletsSection: {
        destructiveAction: 'Noņemt maku',
        detailsAction__nonPrimary: 'Iestatīt kā primāro',
        primaryButton: 'Savienot maku',
        title: 'Web3 maki',
        web3SelectSolanaWalletScreen: {
          subtitle: 'Izvēlieties Solana maku, ko savienot ar savu kontu.',
          title: 'Pievienot Solana maku',
        },
      },
    },
    usernamePage: {
      successMessage: 'Jūsu lietotājvārds ir atjaunināts.',
      title__set: 'Iestatīt lietotājvārdu',
      title__update: 'Atjaunināt lietotājvārdu',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} tiks noņemts no šī konta.',
        messageLine2: 'Jūs vairs nevarēsiet pierakstīties, izmantojot šo web3 maku.',
        successMessage: '{{web3Wallet}} ir noņemts no jūsu konta.',
        title: 'Noņemt web3 maku',
      },
      subtitle__availableWallets: 'Izvēlieties web3 maku, ko savienot ar savu kontu.',
      subtitle__unavailableWallets: 'Nav pieejamu web3 maku.',
      successMessage: 'Maks ir pievienots jūsu kontam.',
      title: 'Pievienot web3 maku',
      web3WalletButtonsBlockButton: '{{provider|titleize}}',
    },
  },
  waitlist: {
    start: {
      actionLink: 'Pierakstīties',
      actionText: 'Vai jums jau ir piekļuve?',
      formButton: 'Pievienoties gaidīšanas sarakstam',
      subtitle: 'Ievadiet savu e-pasta adresi, un mēs jums paziņosim, kad jūsu vieta būs gatava',
      title: 'Pievienoties gaidīšanas sarakstam',
    },
    success: {
      message: 'Drīz jūs tiksiet pāradresēts...',
      subtitle: 'Mēs ar jums sazināsimies, kad jūsu vieta būs gatava',
      title: 'Paldies, ka pievienojāties gaidīšanas sarakstam!',
    },
  },
  web3SolanaWalletButtons: {
    connect: 'Savienot, izmantojot {{walletName}}',
    continue: 'Turpināt, izmantojot {{walletName}}',
    noneAvailable:
      'Netika atrasts neviens Solana Web3 maks. Lūdzu, instalējiet Web3 atbalstītu {{ solanaWalletsLink || link("maka paplašinājumu") }}.',
  },

} as const;
