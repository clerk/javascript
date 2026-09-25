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

export const etEE: LocalizationResource = {
  locale: 'et-EE',
  apiKeys: {
    action__add: 'Lisa uus võti',
    action__search: 'Otsi võtmeid',
    copySecret: {
      formButtonPrimary__copyAndClose: 'Kopeeri ja sulge',
      formHint: "Turvakaalutlustel ei lase me sul seda hiljem uuesti vaadata.",
      formTitle: 'Kopeeri oma "{{name}}" API võti kohe',
    },
    createdAndExpirationStatus__expiresOn:
      "Loodud {{ createdDate | shortDate('et-EE') }} • Aegub {{ expiresDate | longDate('et-EE') }}",
    createdAndExpirationStatus__never: "Loodud {{ createdDate | shortDate('et-EE') }} • Ei aegu kunagi",
    detailsTitle__emptyRow: 'API võtmeid ei leitud',
    formButtonPrimary__add: 'Loo võti',
    formFieldCaption__expiration__expiresOn: 'Aegub {{ date }}',
    formFieldCaption__expiration__never: 'See võti ei aegu kunagi',
    formFieldOption__expiration__180d: '180 päeva',
    formFieldOption__expiration__1d: '1 päev',
    formFieldOption__expiration__1y: '1 aasta',
    formFieldOption__expiration__30d: '30 päeva',
    formFieldOption__expiration__60d: '60 päeva',
    formFieldOption__expiration__7d: '7 päeva',
    formFieldOption__expiration__90d: '90 päeva',
    formFieldOption__expiration__never: 'Kunagi',
    formHint: 'Sisesta nimi uue võtme loomiseks. Sa saad selle igal ajal tühistada.',
    formTitle: 'Lisa uus API võti',
    lastUsed__days: '{{days}} p tagasi',
    lastUsed__hours: '{{hours}} h tagasi',
    lastUsed__minutes: '{{minutes}} min tagasi',
    lastUsed__months: '{{months}} k tagasi',
    lastUsed__seconds: '{{seconds}} s tagasi',
    lastUsed__years: '{{years}} a tagasi',
    menuAction__revoke: 'Tühista võti',
    revokeConfirmation: {
      confirmationText: 'Tühista',
      formButtonPrimary__revoke: 'Tühista võti',
      formHint: 'Kas oled kindel, et soovid selle salajase võtme kustutada?',
      formTitle: 'Kas tühistada salajane võti "{{apiKeyName}}"?',
      inputLabel: 'Sisesta kinnituseks "Tühista"',
    },
    tableHeader__actions: 'Toimingud',
    tableHeader__lastUsed: 'Viimati kasutatud',
    tableHeader__name: 'Nimi',
  },
  backButton: 'Tagasi',
  badge__activePlan: 'Aktiivne',
  badge__banned: 'Blokeeritud',
  badge__canceledEndsAt: "Tühistatud • Lõpeb {{ date | shortDate('et-EE') }}",
  badge__currentPlan: 'Praegune plaan',
  badge__default: 'Vaikimisi',
  badge__deprovisioned: 'Eemaldatud',
  badge__endsAt: "Lõpeb {{ date | shortDate('et-EE') }}",
  badge__expired: 'Aegunud',
  badge__freeTrial: 'Tasuta prooviperiood',
  badge__otherImpersonatorDevice: 'Muu impersonaatori seade',
  badge__pastDueAt: "Tähtaja ületanud {{ date | shortDate('et-EE') }}",
  badge__pastDuePlan: 'Tähtaeg ületatud',
  badge__primary: 'Esmane',
  badge__renewsAt: "Uueneb {{ date | shortDate('et-EE') }}",
  badge__requiresAction: 'Nõuab tegevust',
  badge__startsAt: "Algab {{ date | shortDate('et-EE') }}",
  badge__thisDevice: 'See seade',
  badge__trialEndsAt: "Prooviperiood lõpeb {{ date | shortDate('et-EE') }}",
  badge__unverified: 'Kinnitamata',
  badge__upcomingPlan: 'Tulevane',
  badge__userDevice: 'Kasutaja seade',
  badge__you: 'Sina',
  billing: {
    accountCredit: 'Konto krediit',
    addPaymentMethod__label: 'Lisa makseviis',
    alwaysFree: 'Alati tasuta',
    annually: 'Aastas',
    availableFeatures: 'Saadaolevad funktsioonid',
    billedAnnually: 'Arveldatakse aastas',
    billedAnnuallyOnly: 'Ainult aastapõhine arveldus',
    billedMonthly: 'Arveldatakse kuus',
    billedMonthlyOnly: 'Ainult kuupõhine arveldus',
    cancelFreeTrial: 'Tühista tasuta prooviperiood',
    cancelFreeTrialAccessUntil:
      "Sinu prooviperiood püsib aktiivne kuni {{ date | longDate('et-EE') }}. Pärast seda kaotad juurdepääsu prooviperioodi funktsioonidele. Sult ei võeta tasu.",
    cancelFreeTrialTitle: 'Kas tühista tasuta prooviperiood plaanile {{plan}}?',
    cancelSubscription: 'Tühista tellimus',
    cancelSubscriptionAccessUntil:
      "Sa saad plaani '{{plan}}' funktsioone kasutada kuni {{ date | longDate('et-EE') }}, pärast mida sul enam juurdepääsu pole.",
    cancelSubscriptionNoCharge: 'Selle tellimuse eest sult tasu ei võeta.',
    cancelSubscriptionPastDue:
      'Sinu tellimus lõpeb kohe ja kaotad juurdepääsu kõigile plaani funktsioonidele. Järgmise tellimuse puhul palutakse sul tasuda tähtaja ületanud summa.',
    cancelSubscriptionTitle: 'Kas tühista {{plan}} tellimus?',
    cannotSubscribeMonthly:
      'Seda plaani ei saa tellida kuupõhise maksmisega. Selle plaani tellimiseks pead valima aastapõhise maksmise.',
    cannotSubscribeUnrecoverable:
      'Seda plaani ei saa tellida. Sinu praegune tellimus on kallim kui see plaan.',
    checkout: {
      addPromoCode: 'Lisa sooduskood',
      applyPromoCode: 'Rakenda',
      description__paymentSuccessful: 'Sinu makse õnnestus.',
      description__subscriptionSuccessful: 'Sinu uus tellimus on valmis.',
      discount: 'Allahindlus',
      downgradeNotice:
        'Säilitad oma praeguse tellimuse ja selle funktsioonid kuni arveldustsükli lõpuni, seejärel lülitatakse sind sellele tellimusele üle.',
      emailForm: {
        subtitle: 'Enne ostu lõpuleviimist pead lisama e-posti aadressi, kuhu kviitungid saadetakse.',
        title: 'Lisa e-posti aadress',
      },
      lineItems: {
        title__freeTrialEndsAt: 'Prooviperiood lõpeb',
        title__paymentMethod: 'Makseviis',
        title__statementId: 'Väljavõtte ID',
        title__subscriptionBegins: 'Tellimus algab',
        title__totalPaid: 'Kokku tasutud',
      },
      pastDueNotice: 'Sinu eelmine tellimus oli tähtaja ületanud ja ilma makseta.',
      perMonth: 'kuus',
      promoCodePlaceholder: 'Sisesta sooduskood',
      removePromoCode: 'Eemalda sooduskood',
      title: 'Kassa',
      title__paymentSuccessful: 'Makse õnnestus!',
      title__subscriptionSuccessful: 'Õnnestus!',
      title__trialSuccess: 'Prooviperiood algas edukalt!',
      totalDueAfterTrial: 'Tasumisele kuulub kokku {{days}} päeva pärast prooviperioodi lõppu',
      totalDuePerPeriod: 'Tasumisele kuulub kokku perioodi kohta',
    },
    credit: 'Krediit',
    creditRemainder: 'Krediit praeguse tellimuse järelejäänud perioodi eest.',
    defaultFreePlanActive: "Oled praegu tasuta plaanil",
    discountAmount: '{{amount}} soodsam',
    discountCyclesRemaining: '{{cycles}} {{period}} jäänud',
    discountDuration: '{{amount}} soodsam esimesed {{cycles}} {{period}}',
    free: 'Tasuta',
    getStarted: 'Alusta',
    highlightedPlanBadge: 'Populaarne',
    keepFreeTrial: 'Jäta tasuta prooviperiood',
    keepSubscription: 'Jäta tellimus',
    manage: 'Halda',
    manageSubscription: 'Halda tellimust',
    month: 'Kuu',
    monthAbbreviation: 'k',
    monthPerUnit: 'Kuu ühiku {{unitName}} kohta',
    monthly: 'Kuus',
    months: 'Kuud',
    pastDue: 'Tähtaeg ületatud',
    pay: 'Maksa {{amount}}',
    payerCreditRemainder: 'Krediit konto saldost.',
    paymentMethod: {
      applePayDescription: {
        annual: 'Aastamakse',
        monthly: 'Kuumakse',
      },
      dev: {
        anyNumbers: 'Suvalised numbrid',
        cardNumber: 'Kaardi number',
        cvcZip: 'CVC, sihtnumber',
        developmentMode: 'Arendusrežiim',
        expirationDate: 'Aegumiskuupäev',
        testCardInfo: 'Testkaardi teave',
      },
    },
    paymentMethods__label: 'Makseviisid',
    pricingTable: {
      billingCycle: 'Arveldustsükkel',
      included: 'Sisaldub',
      seatCost: {
        additionalSeats: '({{additionalTierFeePerBlockAmount}}/{{periodAbbreviation}} lisa kohta)',
        freeUpToSeats: 'Tasuta kuni {{endsAfterBlock}} kohta',
        includedSeats: '{{includedSeats}} kohta sisaldub',
        perSeat: '{{feePerBlockAmount}}/{{periodAbbreviation}} koha kohta',
        tooltip: {
          additionalSeatsEach: 'Lisakohad on {{feePerBlockAmount}}/{{period}} igaüks.',
          firstSeatsIncludedInPlan: 'Esimesed {{endsAfterBlock}} kohta sisalduvad plaanis.',
          freeForUpToSeats: 'Tasuta kuni {{endsAfterBlock}} kohani.',
        },
        unlimitedSeats: 'Piiramatu arv kohti',
        upToSeats: 'Kuni {{endsAfterBlock}} kohta',
      },
    },
    proratedDiscount: 'Proportsionaalne allahindlus',
    prorationCredit: 'Proportsionaalne krediit',
    reSubscribe: 'Telli uuesti',
    seatBreakdownIncludedPlural: '{{chargeable}} kohta hinnaga {{rate}}/k (kokku {{totalSeats}} - {{included}} sisaldub)',
    seatBreakdownIncludedSingular: '1 koht hinnaga {{rate}}/k (kokku {{totalSeats}} - {{included}} sisaldub)',
    seatBreakdownPlural: '{{chargeable}} kohta hinnaga {{rate}}/k',
    seatBreakdownSingular: '1 koht hinnaga {{rate}}/k',
    seats: 'Kohad',
    seatsWithLimit: 'Kohad (kuni {{limit}})',
    seeAllFeatures: 'Vaata kõiki funktsioone',
    startFreeTrial: 'Alusta tasuta prooviperioodi',
    startFreeTrial__days: 'Alusta {{days}}-päevast tasuta prooviperioodi',
    subscribe: 'Telli',
    subscriptionDetails: {
      beginsOn: 'Algab',
      currentBillingCycle: 'Praegune arveldustsükkel',
      endsOn: 'Lõpeb',
      firstPaymentAmount: 'Esimese makse summa',
      firstPaymentOn: 'Esimene makse',
      nextPaymentAmount: 'Järgmise makse summa',

      nextPaymentOn: 'Järgmine makse',
      pastDueAt: 'Tähtaeg ületatud',
      renewsAt: 'Uueneb',
      subscribedOn: 'Tellitud',
      title: 'Tellimus',
      trialEndsOn: 'Prooviperiood lõpeb',
      trialStartedOn: 'Prooviperiood algas',
    },
    subtotal: 'Vahesumma',
    subtotalRenewal: 'Vahesumma perioodi kohta',
    switchPlan: 'Lülituge sellele plaanile',
    switchToAnnual: 'Lülituge aastasele plaanile',
    switchToAnnualWithAnnualPrice: 'Lülituge aastasele plaanile {{price}} / aastas',
    switchToMonthly: 'Lülituge kuisele plaanile',
    switchToMonthlyWithPrice: 'Lülituge kuisele plaanile {{price}} / kuus',
    totalDue: 'Tasumisele kuuluv summa',
    totalDuePerPeriod: 'Kokku perioodi kohta',
    totalDueToday: 'Täna tasumisele kuuluv summa',
    viewFeatures: 'Vaadake funktsioone',
    viewPayment: 'Vaadake makset',
    year: 'Aasta',
    yearAbbreviation: 'a',
    yearPerUnit: 'Aasta {{unitName}} kohta',
    years: 'Aastad',
  },
  configureSSO: {
    activate: {
      activateButton: 'Aktiveerige SSO',
      activeSubtitle: 'Igaüks, kes logib sisse domeeniga {{domain}}, peab kasutama teie identiteedipakkujat.',
      activeTitle: 'SSO-ühendus on aktiivne',
      doneButton: 'Valmis',
      skipButton: 'Jätke praegu vahele',
      subtitle:
        'Teie SSO-ühendus on valmis. Pärast aktiveerimist peab igaüks, kes logib sisse domeeniga {{domain}}, kasutama teie identiteedipakkujat.',
      title: 'SSO-ühendus on seadistatud',
    },
    changeProviderDialog: {
      cancelButton: 'Tühistage',
      confirmButton: 'Vahetage pakkujat',
      subtitle: 'Pakkujale {{provider}} üleminek eemaldab teie {{currentProvider}} ühenduse ja nõuab uut seadistust.',
      title: 'Vahetage pakkuja: {{provider}}',
    },
    configureStep: {
      activeConnectionWarning: {
        dismiss: 'Sulgege',
        title:
          'See ühendus on aktiivne. Muudatuste salvestamine rakendub kohe ja võib häirida praeguste liikmete sisselogimist.',
      },
      attributeMappingTable: {
        badges: {
          optional: 'Valikuline',
          required: 'Kohustuslik',
        },
      },
      oidcCustom: {
        credentialsStep: {
          clientId: {
            label: 'Kliendi ID',
            placeholder: 'Kleepige kliendi ID siia...',
          },
          clientSecret: {
            label: 'Kliendi saladus',
            placeholder: 'Kleepige kliendi saladus siia...',
          },
          headerSubtitle: 'Lisage oma rakenduse mandaadid',
          paragraph: 'Hankige need väärtused oma identiteedipakkuja OIDC rakendusest.',
        },
        endpointsStep: {
          discoveryUrl: {
            description:
              'Hankige oma identiteedipakkuja OIDC rakendusest avastamise lõpp-punkt. Kleepige see allpool.',
            label: 'Avastamise lõpp-punkt',
            placeholder: 'Kleepige URL siia...',
          },
          headerSubtitle: 'Lisage oma identiteedipakkuja lõpp-punktid',
          manual: {
            authUrl: {
              label: 'Autoriseerimise URL',
              placeholder: 'Kleepige URL siia...',
            },
            description: 'Hankige need väärtused oma identiteedipakkuja OIDC rakendusest.',
            tokenUrl: {
              label: 'Tõendi URL',
              placeholder: 'Kleepige URL siia...',
            },
            userInfoUrl: {
              label: 'Kasutajateabe URL',
              placeholder: 'Kleepige URL siia...',
            },
          },
          modes: {
            ariaLabel: 'OIDC lõpp-punkti seadistamise meetod',
            discoveryUrl: 'Lisage avastamise lõpp-punkti kaudu',
            manual: 'Seadistage käsitsi',
          },
        },
        mainHeaderTitle: 'Seadistage oma identiteedipakkuja',
        redirectUriStep: {
          claims: {
            description: 'Veenduge, et teie ID-tõend sisaldab järgmisi väiteid:',
            table: {
              columns: {
                attribute: 'Clerki atribuut',
                claim: 'ID-tõendi väide',
              },
              rows: {
                email: {
                  attribute: 'Peamine e-post',
                },
                firstName: {
                  attribute: 'Eesnimi',
                },
                lastName: {
                  attribute: 'Perekonnanimi',
                },
                subject: {
                  attribute: 'Väline kasutaja ID',
                },
              },
            },
          },
          headerSubtitle: 'Looge oma identiteedipakkuja halduspaneelis uus OIDC rakendus',
          paragraph:
            'Looge oma identiteedipakkuja halduspaneelis uus OIDC rakendus, mis toetab autoriseerimiskoodi andmise tüüpi, ja kasutage järgmist ümbersuunamis-URI-d:',
          redirectUri: {
            label: 'Lubatud ümbersuunamis-URI',
          },
        },
      },
      samlCustom: {
        assignUsersStep: {
          headerSubtitle: 'Määrake kasutajad või rühmad oma SAML-rakendusele',
          paragraph: 'Määrake kasutajad või rühmad oma rakendusele, enne kui nad saavad SSO-ga sisse logida.',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attributeName: 'Atribuudi nimi',
              userAttribute: 'Kasutaja atribuut',
            },
            rows: {
              email: {
                attributeName: 'Peamine e-post',
                userAttribute: 'mail',
              },
              firstName: {
                attributeName: 'Eesnimi',
                userAttribute: 'firstName',
              },
              lastName: {
                attributeName: 'Perekonnanimi',
                userAttribute: 'lastName',
              },
            },
          },
          headerSubtitle: 'Kaardistage kasutaja atribuudid oma identiteedipakkujast oma rakendusse.',
          paragraph: 'Teie SAML-vastus peab sisaldama järgmisi atribuute:',
        },
        createAppStep: {
          createAppInstructions: {
            paragraph:
              'Looge oma identiteedipakkuja halduspaneelis uus SAML 2.0 rakendus ja kasutage järgmisi teenusepakkuja andmeid:',
          },
          headerSubtitle: 'Looge oma identiteedipakkuja halduspaneelis uus SAML-rakendus',
          serviceProviderFields: {
            acsUrl: {
              label: 'Kinnituse tarbimisteenuse (ACS) URL',
            },
            spEntityId: {
              label: 'Olemi ID',
            },
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Seadistage identiteedipakkuja metaandmed',
          manual: {
            description: 'Hankige need väärtused oma identiteedipakkuja SAML-rakendusest.',
            issuer: {
              label: 'Väljastaja',
              placeholder: 'Kleepige URL siia...',
            },
            signOnUrl: {
              label: 'Sisselogimise URL',
              placeholder: 'Kleepige URL siia...',
            },
            signingCertificate: {
              fileUploaded: 'Fail üles laaditud',
              label: 'Allkirjastamise sertifikaat',
              removeFile: 'Eemaldage fail',
              replaceFile: 'Asendage fail',
              uploadFile: 'Laadige fail üles',
            },
          },
          metadataUrl: {

            description: 'Oma identiteedipakkuja SAML-rakenduses leidke metaandmete URL. Kleepige see allpool.',
            label: 'Metaandmete URL',
            placeholder: 'Kleepige URL siia...',
          },
          modes: {
            ariaLabel: 'Konfiguratsioon ',
            manual: 'Konfigureerige käsitsi',
            metadataUrl: 'Lisage metaandmete kaudu',
          },
        },
        mainHeaderTitle: 'Konfigureerige oma identiteedipakkuja',
      },
      samlGoogle: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              appAttribute: 'Rakenduse atribuut',
              googleAttribute: 'Google’i atribuut',
            },
            rows: {
              email: {
                appAttribute: 'email',
                googleAttribute: 'Peamine e-posti aadress',
              },
              firstName: {
                appAttribute: 'firstName',
                googleAttribute: 'Eesnimi',
              },
              lastName: {
                appAttribute: 'lastName',
                googleAttribute: 'Perekonnanimi',
              },
            },
          },
          headerSubtitle: 'Kaardistage kasutaja atribuudid Google Workspace’ist oma rakendusse',
          paragraph: 'Eeldame, et teie SAML-vastus tagastab kasutaja e-posti aadressi, eesnime ja perekonnanime.',
          step1: 'Otsige <bold>Google Admin Console</bold>’ist üles jaotis <bold>Attributes</bold>.',
          step2:
            'Valige iga atribuudi jaoks <bold>Add mapping</bold> ja sisestage järgmised Google’i ja rakenduse atribuudid:',
        },
        configureUserAccess: {
          assignUsersInstructions: {
            paragraph1:
              "Kui konfigureerimine on Google’is lõpule viidud, suunatakse teid rakenduse ülevaate lehele.",
            paragraph2:
              'Google’il võib nende muudatuste levitamine võtta kuni 24 tundi. Ühendus jääb passiivseks, kuni need jõustuvad.',
            step1: 'Avage jaotis <bold>User access</bold>.',
            step2: 'Valige <bold>ON for everyone.</bold>',
            step3: 'Valige <bold>Save</bold>.',
          },
          headerSubtitle: 'Lubage oma Google Workspace’i SAML-rakendus',
        },
        createAppStep: {
          createAppInstructions: {
            step1: 'Külgnavigatsioonis valige jaotise <bold>Apps</bold> alt <bold>Web and mobile apps.</bold>',
            step2: 'Valige <bold>Add app</bold> ja seejärel <bold>Add custom SAML app.</bold>',
            step3: 'Sisestage <bold>App name.</bold>',
            step4: 'Valige <bold>Continue</bold>.',
            title: 'Looge Google Workspace’is uus SAML-rakendus:',
          },
          headerSubtitle: 'Looge Google Workspace’is uus SAML-rakendus',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Lisage oma Google Workspace’i rakenduse metaandmed',
          manual: {
            description: 'Leidke oma Google Workspace’i rakenduses need väärtused.',
            issuer: {
              label: 'Üksuse ID',
              placeholder: 'Kleepige URL siia...',
            },
            signOnUrl: {
              label: 'SSO URL',
              placeholder: 'Kleepige URL siia...',
            },
            signingCertificate: {
              fileUploaded: 'Fail üles laaditud',
              label: 'Allkirjastamise sertifikaat',
              removeFile: 'Eemaldage fail',
              replaceFile: 'Asendage fail',
              uploadFile: 'Laadige fail üles',
            },
          },
          metadataFile: {
            description: 'Laadige oma Google Workspace’i rakenduses alla IdP metaandmed ja laadige need allpool üles.',
            fileUploaded: 'Fail üles laaditud',
            label: 'IdP metaandmed',
            removeFile: 'Eemaldage fail',
            replaceFile: 'Asendage fail',
            uploadFile: 'Laadige fail üles',
          },
          modes: {
            ariaLabel: 'Konfiguratsioon',
            manual: 'Konfigureerige käsitsi',
            metadataFile: 'Lisage metaandmete kaudu',
          },
        },
        mainHeaderTitle: 'Konfigureerige Google Workspace',
        serviceProviderStep: {
          headerSubtitle: 'Konfigureerige teenusepakkuja',
          nameIdInstructions: {
            step1:
              'Jaotise <bold>Name ID</bold> all avage <bold>Name ID</bold> vormingu rippmenüü ja valige <bold>Email</bold>.',
            step2: 'Valige <bold>Continue</bold>',
          },
          paragraph:
            'Teenusepakkuja konfigureerimiseks peate lisama need kaks välja oma Google Workspace’i SAML-rakendusse:',
          serviceProviderFields: {
            acsUrl: {
              label: 'ACS URL',
            },
            spEntityId: {
              label: 'Üksuse ID',
            },
          },
          title: 'Konfigureerige teenusepakkuja',
        },
      },
      samlMicrosoft: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attribute: 'Atribuut',
              claimName: 'Nõude nimi',
              value: 'Väärtus',
            },
            copyClaimName: 'Kopeeri nõude nimi',
            copyClaimNameCopied: 'Kopeeritud',
            rows: {
              email: {
                attribute: 'E-posti aadress',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
                value: 'user.mail',
              },
              firstName: {
                attribute: 'Eesnimi',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
                value: 'user.givenname',
              },
              lastName: {
                attribute: 'Perekonnanimi',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
                value: 'user.surname',
              },
            },
          },
          headerSubtitle: 'Määrake atribuudid, mille Microsoft Entra teie SAML-vastusesse kaasab',
          step1: 'Leheküljel <bold>SAML-based Sign-on</bold> otsige üles jaotis <bold>Attributes & Claims</bold>.',
          step2: 'Valige <bold>Edit.</bold>',
          title: 'Teie SAML-vastus peab sisaldama järgmisi atribuute:',
        },
        createAppStep: {
          assignUsersInstructions: {
            step1: 'Jaotises <bold>Getting Started</bold> valige <bold>Assign users and groups.</bold>',
            step2: "Valige <bold>Add user/group.</bold> Teid suunatakse lehele <bold>Add Assignment page.</bold>",
            step3: 'Valige <bold>None Selected link.</bold>',
            step4:
              "Lehe allosas valige <bold>Select</bold>. Teid suunatakse lehele <bold>Add Assignment</bold>.",
            step5: 'Valige <bold>Assign</bold>',
            title: 'Määrake oma kasutajad või rühmad Microsoftis',
          },
          createAppInstructions: {
            step1: 'Logige sisse Microsoft Azure’i portaali ja minge jaotisesse <bold>Enterprise applications.</bold>',
            step2:
              "Klõpsake <bold>New application.</bold> Teid suunatakse lehele <bold>Browse Microsoft Entra Gallery</bold>.",
            step3: 'Valige <bold>Create your own application.</bold>',
            step4: {
              label: 'Avanevas modaaliaknas:',
              subSteps: {
                appName: 'Sisestage oma rakenduse nimi.',
                create: 'Valige <bold>Create</bold>.',
                nonGallery:
                  "Valige <bold>Integrate any other application you don't find in the gallery (Non-gallery)</bold>.",
              },
            },
            title: 'Looge uus ettevõtterakendus',
          },
          headerSubtitle: 'Looge oma Azure’i portaalis uus ettevõtterakendus',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Lisage oma Microsoft Entra rakenduse metaandmed',
          manual: {
            description:
              'Leheküljel <bold>SAML-based Sign-on</bold> otsige üles jaotis <bold>SAML Certificates</bold>. Leidke need väärtused ja lisage need allpool.',
            issuer: {
              label: 'Väljaandja',
              placeholder: 'Kleepige URL siia...',
            },
            signOnUrl: {
              label: 'Sisselogimise URL',
              placeholder: 'Kleepige URL siia...',
            },
            signingCertificate: {
              fileUploaded: 'Fail üles laaditud',
              label: 'Allkirjastamise sertifikaat',

              removeFile: 'Eemalda fail',
              replaceFile: 'Asenda fail',
              uploadFile: 'Laadi fail üles',
            },
          },
          metadataUrl: {
            description:
              'Lehel <bold>SAML-põhine sisselogimine</bold> leia jaotis <bold>SAML-sertifikaadid</bold> ja kopeeri <bold>App Federation Metadata Url</bold>. Kleebi allpool.',
            label: 'Metaandmete URL',
            placeholder: 'Kleebi URL siia...',
          },
          modes: {
            ariaLabel: 'Konfiguratsioon ',
            manual: 'Konfigureeri käsitsi',
            metadataUrl: 'Lisa metaandmete kaudu',
          },
        },
        mainHeaderTitle: 'Konfigureeri Microsoft Entra',
        serviceProviderStep: {
          headerSubtitle: 'Lisa teenusepakkuja konfiguratsioon Microsoft Entrasse',
          serviceProviderFields: {
            acsUrl: {
              label: 'Vastuse URL (Assertion Consumer Service URL)',
            },
            spEntityId: {
              label: 'Identifikaator (entiteedi ID)',
            },
          },
          step1: 'Külgmenüüs ava rippmenüü <bold>Halda</bold> ja vali ühekordne sisselogimine.',
          step2: 'Jaotises <bold>Vali ühekordse sisselogimise meetod</bold> vali <bold>SAML</bold>.',
          step3: 'Leia jaotis <bold>Põhiline SAML-i konfiguratsioon</bold>.',
          step4: 'Vali <bold>Redigeeri</bold>. Avaneb paneel <bold>Põhiline SAML-i konfiguratsioon</bold>.',
          step5:
            'Kopeeri järgmised väärtused väljadesse <bold>Identifikaator (entiteedi ID)</bold> ja <bold>Vastuse URL (ACS URL)</bold>:',
          step6: 'Paneeli ülaosas vali <bold>Salvesta</bold>. Sulge paneel.',
          title: 'Lisa teenusepakkuja andmed',
        },
      },
      samlOkta: {
        assignUsersStep: {
          assignUsersInstructions: {
            paragraph: 'Määra kasutajad või rühmad oma Okta rakendusse, enne kui nad saavad SSO-ga sisse logida',
            step1: 'Okta töölaual vali vahekaart <bold>Määramised</bold>.',
            step2:
              'Ava rippmenüü <bold>Määra</bold> ja vali <bold>Määra inimestele</bold> või <bold>Määra rühmadele</bold>.',
            step3: 'Otsi kasutajat või rühma, keda määrata.',
            step4: 'Kasutaja või rühma kõrval klõpsa <bold>Määra</bold>.',
            step5: 'Klõpsa <bold>Valmis.</bold>',
          },
          headerSubtitle: 'Määra kasutajad oma Okta rakendusse',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              expression: 'Avaldis',
              name: 'Atribuudi nimi',
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
          headerSubtitle: 'Määra atribuudid, mida Okta lisab sinu SAML-vastusesse',
          paragraph: 'Sinu SAML-vastus peab sisaldama järgmisi atribuute:',
          step1: 'Okta töölaual leia jaotis <bold>Atribuudilaused</bold>.',
          step2:
            'Vali iga atribuudi jaoks <bold>Lisa avaldis</bold> ja sisesta järgmised nime ja avaldise paarid:',
        },
        createAppStep: {
          completeSamlIntegrationInstructions: {
            step1: 'Jaotises <bold>Tagasiside</bold> vali <bold>See on sisemine rakendus, mille oleme loonud.</bold>',
            step2: 'Integratsiooni lõpetamiseks klõpsa <bold>Lõpeta</bold>.',
            title: 'Lõpeta SAML-integratsioon',
          },
          createAppInstructions: {
            step1: 'Logi sisse Okta-sse ja ava <bold>Admin → Rakendused.</bold>',
            step2: 'Klõpsa <bold>Loo rakenduse integratsioon.</bold> ja vali <bold>SAML 2.0.</bold>',
            step3: 'Täida üldised sätted. Rakenduse nimi on kohustuslik.',
            step4: 'Rakenduse loomise lõpetamiseks klõpsa <bold>Edasi</bold>.',
            title: 'Loo Okta-s uus SAML-rakendus',
          },
          headerSubtitle: 'Loo ja konfigureeri SAML-rakendus oma Okta töölaual',
          serviceProviderInstructions: {
            paragraph1:
              "Pärast <bold>Üldiste sätete</bold> täitmist näed lehte <bold>Konfigureeri SAML</bold>.",
            paragraph2: 'Teenusepakkuja konfigureerimiseks lisa oma Okta rakendusse need kaks välja.',
            serviceProviderFields: {
              acsUrl: {
                label: 'Ühekordse sisselogimise URL',
              },
              spEntityId: {
                label: 'Sihtrühma URI (SP entiteedi ID)',
              },
            },
            title: 'Konfigureeri teenusepakkuja',
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Lisa oma Okta rakenduse metaandmed',
          manual: {
            description: 'Oma Okta SAML-rakenduses ava vahekaart <bold>Sisselogimine</bold> ja leia need väärtused.',
            issuer: {
              label: 'Väljaandja',
              placeholder: 'Kleebi URL siia...',
            },
            signOnUrl: {
              label: 'Sisselogimise URL',
              placeholder: 'Kleebi URL siia...',
            },
            signingCertificate: {
              fileUploaded: 'Fail üles laaditud',
              label: 'Allkirjastamise sertifikaat',
              removeFile: 'Eemalda fail',
              replaceFile: 'Asenda fail',
              uploadFile: 'Laadi fail üles',
            },
          },
          metadataUrl: {
            description:
              'Oma Okta SAML-rakenduses ava vahekaart <bold>Sisselogimine</bold> ja leia metaandmete URL. Kleebi see allpool.',
            label: 'Metaandmete URL',
            placeholder: 'Kleebi URL siia...',
          },
          modes: {
            ariaLabel: 'Konfiguratsioon',
            manual: 'Konfigureeri käsitsi',
            metadataUrl: 'Lisa metaandmete kaudu',
          },
        },
        mainHeaderTitle: 'Konfigureeri Okta Workforce',
      },
      unsupportedProvider: {
        description:
          'See identiteedipakkuja pole selles Clerk-i versioonis toetatud. Seadistamise lõpetamiseks uuenda uusimale versioonile.',
        title: 'Toetamata pakkuja',
      },
    },
    missingManageEnterpriseConnectionsPermission: {
      subtitle: "Võta ühendust oma organisatsiooni administraatoriga, et oma õigusi suurendada.",
      title: 'Sul pole õigust hallata ühekordset sisselogimist (SSO)',
    },
    navbar: {
      title: 'Konfigureeri ühekordne sisselogimine (SSO)',
    },
    organizationDomainsStep: {
      domainCard: {
        badge__expired: 'Aegunud',
        badge__unverified: 'Kinnitamata',
        badge__verified: 'Kinnitatud',
        expiredAtLabel:
          "Domeeni kinnitamine aegus {{ date | shortDate('et-EE') }}. Kinnita uuesti, et luua uus DNS-kirje.",
        expiredLabel: 'Domeeni kinnitamine aegus. Kinnita uuesti, et luua uus DNS-kirje.',
        removeButtonTooltip__lastVerifiedDomain: 'SSO seadistamiseks on vaja vähemalt ühte kinnitatud domeeni.',
        removeButtonTooltip__lastVerifiedDomainActive: 'SSO lubatuna hoidmiseks on vaja vähemalt ühte kinnitatud domeeni.',
        txtRecord: {
          hostLabel: 'Host / Nimi',
          instructions: "Lisa see TXT-kirje oma DNS-teenusepakkujasse. Kinnitame automaatselt, kui kirje on aktiivne.",
          typeLabel: 'Tüüp',
          valueLabel: 'Väärtus',
        },
        verifiedAtLabel: "Kinnitatud {{ date | shortDate('et-EE') }}",
        verifyAgainButton: 'Kinnita uuesti',
      },
      domainSuggestion: {
        formButtonPrimary__add: 'Lisa {{domain}}',
        messageLabel: 'Sinu e-posti aadress kasutab domeeni {{domain}}. Kas soovid selle lisada?',
      },
      formButtonPrimary__add: 'Lisa',
      formFieldInputPlaceholder__domain: 'Sisesta siia oma domeen ja alustamiseks klõpsa Lisa',
      formFieldLabel__domain: 'Domeen',
      removeDomainDialog: {
        cancelButton: 'Tühista',
        removeButton: 'Eemalda domeen',
        subtitle__active:
          "Oled eemaldamas domeeni {{domain}} sellest ettevõtte ühendusest. Kasutajad ei saa enam domeeniga {{domain}} sisse logida.",
        subtitle__inactive: "Oled eemaldamas domeeni {{domain}} sellest ettevõtte ühendusest.",
        title: 'Domeeni eemaldamine',
      },
      subtitle: 'Lisa ja kinnita nende domeenide omand, mida sinu organisatsioon sisselogimiseks kasutab.',
      title: 'Lisa SSO-domeenid',
    },
    resetConnectionDialog: {
      cancelButton: 'Tühista',
      confirmationFieldLabel: 'Jätkamiseks sisesta allpool "{{name}}"',

      confirmationFieldPlaceholder: '{{name}}',
      resetButton: 'Lähtesta ühendus',
      subtitle:
        'Kas soovid kindlasti ühenduse lähtestada? See toiming on pöördumatu ja pead kõik sammud uuesti seadistama',
      title: 'Lähtesta ühendus',
    },
    selectProviderStep: {
      oidc: {
        groupLabel: 'OpenID Connect (OIDC)',
        oidcProvider: 'OIDC pakkuja',
      },
      saml: {
        customSaml: 'Kohandatud SAML-i pakkuja',
        google: 'Google Workspace',
        groupLabel: 'SAML',
        microsoft: 'Microsoft Entra (varem AD)',
        okta: 'Okta Workforce',
      },
      subtitle: "Ühenduse üksikasjad seadistad järgmises sammus",
      title: 'Vali oma identiteedipakkuja',
      warning: 'Kui pakkuja on valitud, ei saa seda enne seadistuse lõppu muuta',
    },
    testConfigurationStep: {
      error__noSuccessfulTestRun:
        'Jätkamiseks peab olema vähemalt üks õnnestunud test. Loo testi URL ja läbi sisselogimisvoog.',
      subtitle: 'Logi sisse testi URL-i kaudu, et kontrollida, kas SSO-ühendus on õigesti seadistatud',
      testResults: {
        actionLabel__refresh: 'Värskenda logisid',
        empty: {
          subtitle: 'Esimese testi käivitamiseks vali <bold>Ava testi URL</bold>',
          title: 'Testitulemusi pole',
        },
        polling: 'Ootan testi lõppemist…',
        status__failed: 'Ebaõnnestus',
        status__pending: 'Ootel',
        status__success: 'Õnnestus',
        title: 'Sinu testitulemused',
      },
      testRunDetails: {
        howToFix: {
          actionLabel__viewDocumentation: 'Vaata dokumentatsiooni',
          oauth_access_denied: {
            description:
              "See viga tekib, kui kasutaja klõpsas OAuth-pakkuja autoriseerimisekraanil nuppu Tühista või Keeldu või kui pakkuja lükkas autoriseerimistaotluse tagasi. Kontrolli, kas OAuth-rakenduse andmed (Client ID ja Client Secret) on õigesti seadistatud.",
          },
          oauth_fetch_user_error: {
            intro: 'Vea parandamiseks järgi neid samme:',
            step1:
              'Kontrolli, kas ühenduse seadetes konfigureeritud OAuth-i õigused hõlmavad kasutajaprofiili teabe lugemiseks vajalikke õigusi.',
            step2: 'Veendu, et kasutaja teabe lõpp-punkti URL on õigesti seadistatud.',
          },
          oauth_token_exchange_error: {
            description:
              "Kontrolli, kas OAuth-rakenduse Client ID ja Client Secret on õigesti seadistatud ja vastavad OAuth-pakkuja halduspaneelil olevatele andmetele.",
          },
          saml_email_address_domain_mismatch: {
            description:
              'Kontrolli, kas kasutaja logib sisse e-posti aadressiga, mis vastab mõnele selle ühenduse lubatud domeenile. Kui pead lisama täiendavaid domeene, uuenda lubatud domeene ühenduse seadetes.',
          },
          saml_response_relaystate_missing: {
            description:
              'Kontrolli, kas identiteedipakkuja tagastab õigesti algses päringus saadetud RelayState parameetri.',
          },
          saml_user_attribute_missing: {
            intro: 'Vea parandamiseks järgi neid samme:',
            step1: "Ava identiteedipakkuja seadistuse halduspaneel.",
            step2: "Liigu rakenduse SAML-i seadete või atribuutide vastendamise seadistusse.",
            step3: "Veendu, et atribuut 'mail' on õigesti vastendatud kasutaja e-posti aadressi väljaga.",
          },
          sectionTitle: 'Kuidas parandada',
        },
        parsedUserInfo: {
          email: 'E-post',
          firstName: 'Eesnimi',
          sectionTitle: 'Tõlgendatud kasutaja teave',
        },
        runDetails: {
          actionLabel__copied: 'Kopeeritud',
          actionLabel__copy: 'Kopeeri sõnum',
          errorCode: 'Veakood',
          fullMessage: 'Täielik sõnum',
          sectionTitle: 'Käivituse üksikasjad',
          status: 'Olek',
          timestamp: 'Ajatempel',
        },
        title: 'Testkäivitus',
      },
      testUrl: {
        actionLabel__open: 'Ava testi URL',
      },
      title: 'Testi oma SSO-ühendust',
    },
  },
  createOrganization: {
    formButtonSubmit: 'Loo organisatsioon',
    invitePage: {
      formButtonReset: 'Jäta vahele',
    },
    title: 'Loo organisatsioon',
  },
  dates: {
    lastDay: "Eile kell {{ date | timeString('et-EE') }}",
    next6Days: "{{ date | weekday('et-EE','long') }} kell {{ date | timeString('et-EE') }}",
    nextDay: "Homme kell {{ date | timeString('et-EE') }}",
    numeric: "{{ date | numeric('et-EE') }}",
    previous6Days: "Eelmine {{ date | weekday('et-EE','long') }} kell {{ date | timeString('et-EE') }}",
    sameDay: "Täna kell {{ date | timeString('et-EE') }}",
  },
  dividerText: 'või',
  footerActionLink__alternativePhoneCodeProvider: 'Saada kood hoopis SMS-iga',
  footerActionLink__useAnotherMethod: 'Kasuta teist meetodit',
  footerPageLink__help: 'Abi',
  footerPageLink__privacy: 'Privaatsus',
  footerPageLink__terms: 'Tingimused',
  formButtonPrimary: 'Jätka',
  formButtonPrimary__verify: 'Kinnita',
  formFieldAction__forgotPassword: 'Unustasid parooli?',
  formFieldError__matchingPasswords: 'Paroolid ühtivad.',
  formFieldError__notMatchingPasswords: "Paroolid ei ühti.",
  formFieldError__verificationLinkExpired: 'Kinnituslink on aegunud. Palu uus link.',
  formFieldHintText__optional: 'Valikuline',
  formFieldHintText__slug: 'Slug on inimloetav identifikaator, mis peab olema kordumatu. Seda kasutatakse sageli URL-ides.',
  formFieldInputPlaceholder__apiKeyDescription: 'Selgita, miks sa selle võtme genereerid',
  formFieldInputPlaceholder__apiKeyExpirationDate: 'Vali kuupäev',
  formFieldInputPlaceholder__apiKeyName: 'Sisesta salajase võtme nimi',
  formFieldInputPlaceholder__backupCode: 'Sisesta varukood',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Kustuta konto',
  formFieldInputPlaceholder__emailAddress: 'Sisesta oma e-posti aadress',
  formFieldInputPlaceholder__emailAddress_username: 'Sisesta e-post või kasutajanimi',
  formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
  formFieldInputPlaceholder__firstName: 'Eesnimi',
  formFieldInputPlaceholder__lastName: 'Perekonnanimi',
  formFieldInputPlaceholder__organizationDomain: 'example.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'you@example.com',
  formFieldInputPlaceholder__organizationName: 'Organisatsiooni nimi',
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  formFieldInputPlaceholder__password: 'Sisesta oma parool',
  formFieldInputPlaceholder__phoneNumber: 'Sisesta oma telefoninumber',
  formFieldInputPlaceholder__signUpPassword: 'Loo parool',
  formFieldInputPlaceholder__username: 'Sisesta oma kasutajanimi',
  formFieldInput__emailAddress_format: 'Näidisvorming: name@example.com',
  formFieldLabel__apiKey: 'API võti',
  formFieldLabel__apiKeyDescription: 'Kirjeldus',
  formFieldLabel__apiKeyExpiration: 'Aegumine',
  formFieldLabel__apiKeyName: 'Salajase võtme nimi',
  formFieldLabel__automaticInvitations: 'Luba selle domeeni automaatsed kutsed',
  formFieldLabel__backupCode: 'Varukood',
  formFieldLabel__confirmDeletion: 'Kinnitus',
  formFieldLabel__confirmPassword: 'Kinnita parool',
  formFieldLabel__currentPassword: 'Praegune parool',
  formFieldLabel__emailAddress: 'E-posti aadress',
  formFieldLabel__emailAddress_username: 'E-posti aadress või kasutajanimi',
  formFieldLabel__emailAddresses: 'E-posti aadressid',
  formFieldLabel__firstName: 'Eesnimi',
  formFieldLabel__lastName: 'Perekonnanimi',
  formFieldLabel__newPassword: 'Uus parool',
  formFieldLabel__organizationDomain: 'Domeen',
  formFieldLabel__organizationDomainDeletePending: 'Kustuta ootel kutsed ja soovitused',
  formFieldLabel__organizationDomainEmailAddress: 'Kinnituse e-posti aadress',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Koodi saamiseks ja domeeni kinnitamiseks sisesta selle domeeni alla kuuluv e-posti aadress.',
  formFieldLabel__organizationName: 'Nimi',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Pääsuvõtme nimi',
  formFieldLabel__password: 'Parool',
  formFieldLabel__phoneNumber: 'Telefoninumber',
  formFieldLabel__role: 'Roll',
  formFieldLabel__signOutOfOtherSessions: 'Logi välja kõigist teistest seadmetest',
  formFieldLabel__username: 'Kasutajanimi',
  identityPreviewEditButton__emailAddress: 'Muuda e-posti aadressi',
  identityPreviewEditButton__identifier: 'Muuda identifikaatorit',
  identityPreviewEditButton__phoneNumber: 'Muuda telefoninumbrit',
  impersonationFab: {
    action__signOut: 'Logi välja',
    title: 'Sisse logitud kui {{identifier}}',
  },
  lastAuthenticationStrategy: 'Viimati kasutatud',
  maintenanceMode:
    "Teostame hetkel hooldustöid, kuid ära muretse — see ei tohiks kesta üle mõne minuti.",
  membershipRole__admin: 'Administraator',
  membershipRole__basicMember: 'Liige',
  membershipRole__guestMember: 'Külaline',
  oauthConsent: {
    action__allow: 'Luba',
    action__deny: 'Keela',
    offlineAccessNotice: " Püsid sisse logituna, kuni logid välja või tühistad juurdepääsu.",
    redirectNotice: 'Kui lubad juurdepääsu, suunab see rakendus sind aadressile {{domainAction}}.',
    redirectUriModal: {
      subtitle: 'Veendu, et usaldad rakendust {{applicationName}} ja et see URL kuulub rakendusele {{applicationName}}.',
      title: 'Ümbersuunamise URL',
    },
    scopeList: {
      privateMetadata: 'Sinu privaatne metaandmestik, mille on määranud {{applicationName}} ja mis võib sisaldada tundlikku teavet',
      title: 'See annab rakendusele {{applicationName}} juurdepääsu järgmisele:',

    },
    subtitle: 'soovib {{identifier}} nimel pääseda juurde rakendusele {{applicationName}}',
    viewFullUrl: 'Kuva täielik URL',
    warning:
      'Veenduge, et usaldate rakendust {{applicationName}} ({{domainAction}}). Võite selle saidi või rakendusega jagada tundlikke andmeid.',
  },
  oauthDeviceVerification: {
    action__tryAnotherCode: 'Sisestage teine kood',
    confirmation: {
      action__approve: 'Kinnitage',
      action__deny: 'Keelduge',
      scopeListTitle: 'See annab rakendusele {{applicationName}} juurdepääsu:',
      subtitle: 'Kinnitage see taotlus kasutajale {{identifier}}',
      title: 'Lubada rakendusel {{applicationName}} pääseda juurde teie kontole?',
      warning: 'Kinnitage see taotlus ainult siis, kui alustasite seda oma teises seadmes.',
    },
    error: {
      expiredSubtitle: 'Alustage oma seadmes uuesti.',
      expiredTitle: 'See kood on aegunud',
      genericSubtitle: 'Kontrollige ühendust ja proovige uuesti.',
      genericTitle: 'Me ei saanud seda koodi kinnitada',
      invalidCode: 'Sisestage kehtiv 8-kohaline kood.',
      rateLimitedSubtitle: 'Oodake enne teise koodi proovimist.',
      rateLimitedTitle: 'Liiga palju katseid',
      unknownCode: "Me ei leidnud seda koodi. Kontrollige seda ja proovige uuesti.",
    },
    start: {
      action__continue: 'Jätkake',
      subtitle: 'Sisestage kood, mis on kuvatud seadmel või rakenduses, mida soovite autoriseerida.',
      title: 'Kinnitage seade',
      userCodeLabel: 'Seadme kood',
    },
    status: {
      alreadyApprovedSubtitle: 'Jätkamiseks naaske oma seadmesse.',
      alreadyApprovedTitle: "Olete selle kinnitanud",
      alreadyDecidedSubtitle: 'Otsus tehti mujal. Naaske oma seadmesse.',
      alreadyDecidedTitle: 'See taotlus on juba lõpule viidud',
      alreadyDeniedSubtitle: 'Kui soovite uuesti proovida, alustage oma seadmes uuesti.',
      alreadyDeniedTitle: 'See taotlus lükati tagasi',
      approvedSubtitle: 'Kinnitasite selle taotluse. Jätkamiseks naaske oma seadmesse.',
      approvedTitle: 'Seade kinnitatud',
      consumedSubtitle: 'Teie seade on autoriseeritud. Võite selle akna sulgeda.',
      consumedTitle: 'See kood on juba kasutatud',
      deniedSubtitle: 'Lükkasite selle taotluse tagasi. Naaske oma seadmesse.',
      deniedTitle: 'Juurdepääs keelatud',
    },
  },
  organizationList: {
    action__createOrganization: 'Looge organisatsioon',
    action__invitationAccept: 'Liituge',
    action__suggestionsAccept: 'Taotlege liitumist',
    createOrganization: 'Looge organisatsioon',
    invitationAcceptedLabel: 'Liitunud',
    subtitle: 'jätkamiseks rakendusega {{applicationName}}',
    suggestionsAcceptedLabel: 'Ootab kinnitust',
    title: 'Valige konto',
    titleWithoutPersonal: 'Valige organisatsioon',
  },
  organizationProfile: {
    apiKeysPage: {
      title: 'API-võtmed',
    },
    badge__automaticInvitation: 'Automaatsed kutsed',
    badge__automaticSuggestion: 'Automaatsed soovitused',
    badge__enterpriseSso: 'Enterprise SSO',
    badge__manualInvitation: 'Automaatse liitumiseta',
    badge__unverified: 'Kinnitamata',
    billingPage: {
      accountCreditsSection: {
        title: 'Konto krediidid',
        viewHistory: 'Vaadake krediidiajalugu',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Kuupäev',
        title: 'Konto krediidiajalugu',
      },
      paymentHistorySection: {
        empty: 'Makseajalugu puudub',
        notFound: 'Maksekatset ei leitud',
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Kuupäev',
        tableHeader__status: 'Olek',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Määrake vaikimisi',
        actionLabel__remove: 'Eemaldage',
        add: 'Lisage uus makseviis',
        addSubtitle: 'Lisage oma kontole uus makseviis.',
        cancelButton: 'Tühistage',
        formButtonPrimary__add: 'Lisage makseviis',
        formButtonPrimary__pay: 'Makske {{amount}}',
        payWithTestCardButton: 'Makske testkaardiga',
        removeMethod: {
          messageLine1: '{{identifier}} eemaldatakse sellest kontost.',
          messageLine2:
            'Te ei saa enam seda makseviisi kasutada ja sellest sõltuvad korduvad tellimused lakkavad töötamast.',
          successMessage: '{{paymentMethod}} on teie kontolt eemaldatud.',
          title: 'Eemaldage makseviis',
        },
        title: 'Makseviisid',
      },
      start: {
        headerTitle__payments: 'Maksed',
        headerTitle__plans: 'Plaanid',
        headerTitle__statements: 'Väljavõtted',
        headerTitle__subscriptions: 'Tellimus',
      },
      statementsSection: {
        empty: 'Kuvatavaid väljavõtteid pole',
        itemCaption__paidForPlan: 'Tasutud plaani {{plan}} {{period}} eest',
        itemCaption__payerCredit: 'Krediit konto saldost',
        itemCaption__proratedCredit: 'Proportsionaalne krediit eelmise tellimuse osalise kasutuse eest',
        itemCaption__subscribedAndPaidForPlan: 'Tellitud ja tasutud plaani {{plan}} {{period}} eest',
        notFound: 'Väljavõtet ei leitud',
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Kuupäev',
        title: 'Väljavõtted',
        totalPaid: 'Kokku tasutud',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Hallake',
        actionLabel__newSubscription: 'Tellige plaan',
        actionLabel__switchPlan: 'Vahetage plaani',
        includedSeatsUsage: '{{includedSeats}} kohta sisaldub',
        overview: 'Ülevaade',
        paidSeatsUsage: '{{seatsQuantity}} kohta x {{amount}}',
        seatLimit: 'Kuni {{seatLimit}} kohta',
        seatLimitAndIncludedSeats: 'Kuni {{seatLimit}} kohta (sisaldub {{includedSeats}})',
        tableHeader__edit: 'Muutke',
        tableHeader__plan: 'Plaan',
        tableHeader__startDate: 'Alguskuupäev',
        title: 'Tellimus',
      },
      subscriptionsSection: {
        actionLabel__default: 'Hallake',
      },
      switchPlansSection: {
        title: 'Vahetage plaani',
      },
      title: 'Arveldamine',
    },
    createDomainPage: {
      subtitle:
        'Lisage kinnitamiseks domeen. Selle domeeni e-posti aadressidega kasutajad saavad organisatsiooniga liituda automaatselt või taotleda liitumist.',
      title: 'Lisage domeen',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Kutseid ei saanud saata. Järgmistel e-posti aadressidel on juba ootel kutsed: {{email_addresses}}.',
      formButtonPrimary__continue: 'Saatke kutsed',
      formButtonPrimary__purchaseSeats: 'Ostke lisakohti',
      selectDropdown__role: 'Valige roll',
      subtitle: 'Sisestage või kleepige üks või mitu e-posti aadressi, eraldatuna tühikute või komadega.',
      successMessage: 'Kutsed saadeti edukalt',
      title: 'Kutsuge uusi liikmeid',
    },
    membersPage: {
      action__invite: 'Kutsuge',
      action__search: 'Otsige',
      activeMembersTab: {
        menuAction__remove: 'Eemaldage liige',
        tableHeader__actions: 'Tegevused',
        tableHeader__joined: 'Liitunud',
        tableHeader__role: 'Roll',
        tableHeader__user: 'Kasutaja',
      },
      alerts: {
        roleSetMigrationInProgress: {
          subtitle: 'Uuendame saadaolevaid rolle. Kui see on tehtud, saate rolle uuesti muuta.',
          title: 'Rollid on ajutiselt lukus',
        },
      },
      detailsTitle__emptyRow: 'Kuvatavaid liikmeid pole',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Kutsuge kasutajaid, ühendades oma organisatsiooniga e-posti domeeni. Igaüks, kes registreerub sobiva e-posti domeeniga, saab organisatsiooniga igal ajal liituda.',
          headerTitle: 'Automaatsed kutsed',
          primaryButton: 'Hallake kinnitatud domeene',
        },
        table__emptyRow: 'Kuvatavaid kutseid pole',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Tühistage kutse',
        tableHeader__invited: 'Kutsutud',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Kasutajad, kes registreeruvad sobiva e-posti domeeniga, näevad soovitust taotleda teie organisatsiooniga liitumist.',
          headerTitle: 'Automaatsed soovitused',
          primaryButton: 'Hallake kinnitatud domeene',
        },

        menuAction__approve: 'Kinnita',
        menuAction__reject: 'Lükka tagasi',
        tableHeader__requested: 'Taotletud juurdepääs',
        table__emptyRow: 'Kuvamiseks pole ühtegi taotlust',
      },
      start: {
        headerTitle__invitations: 'Kutsed',
        headerTitle__members: 'Liikmed',
        headerTitle__requests: 'Taotlused',
      },
    },
    navbar: {
      apiKeys: 'API võtmed',
      billing: 'Arveldamine',
      description: 'Hallake oma organisatsiooni.',
      general: 'Üldine',
      members: 'Liikmed',
      security: 'Turvalisus',
      title: 'Organisatsioon',
    },
    plansPage: {
      alerts: {
        noPermissionsToManageBilling: 'Teil puuduvad õigused selle organisatsiooni arveldamise haldamiseks.',
        planMembershipLimitExceeded:
          'Teie organisatsioonis on {{count}} liiget (sh ootel kutsed). See plaan lubab ainult {{limit}} liiget.',
      },
      title: 'Plaanid',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Jätkamiseks tippige allpool "{{organizationName}}".',
          messageLine1: 'Kas olete kindel, et soovite selle organisatsiooni kustutada?',
          messageLine2: 'See toiming on püsiv ja pöördumatu.',
          successMessage: 'Olete organisatsiooni kustutanud.',
          title: 'Kustuta organisatsioon',
        },
        leaveOrganization: {
          actionDescription: 'Jätkamiseks tippige allpool "{{organizationName}}".',
          messageLine1:
            'Kas olete kindel, et soovite sellest organisatsioonist lahkuda? Kaotate juurdepääsu sellele organisatsioonile ja selle rakendustele.',
          messageLine2: 'See toiming on püsiv ja pöördumatu.',
          successMessage: 'Olete organisatsioonist lahkunud.',
          title: 'Lahku organisatsioonist',
        },
        title: 'Oht',
      },
      domainSection: {
        menuAction__manage: 'Halda',
        menuAction__remove: 'Kustuta',
        menuAction__verify: 'Kinnita',
        primaryButton: 'Lisa domeen',
        subtitle:
          'Lubage kasutajatel liituda organisatsiooniga automaatselt või taotleda liitumist kinnitatud e-posti domeeni alusel.',
        title: 'Kinnitatud domeenid',
      },
      successMessage: 'Organisatsioon on uuendatud.',
      title: 'Uuenda profiili',
    },
    removeDomainPage: {
      messageLine1: 'E-posti domeen {{domain}} eemaldatakse.',
      messageLine2: 'Pärast seda ei saa kasutajad organisatsiooniga automaatselt liituda.',
      successMessage: '{{domain}} on eemaldatud.',
      title: 'Eemalda domeen',
    },
    securityPage: {
      removeDialog: {
        confirmButton: 'Eemalda ühendus',
        subtitle:
          'Kas olete kindel, et soovite ühenduse eemaldada? See toiming on pöördumatu ning kustutab ühenduse ja kogu selle konfiguratsiooni.',
        title: 'Eemalda SSO-ühendus',
      },
      ssoSection: {
        badge__active: 'Aktiivne',
        badge__inProgress: 'Pooleli',
        badge__inactive: 'Mitteaktiivne',
        badge__unconfigured: 'Seadistamata',
        descriptionLine1: 'Nõudke, et sobiva e-posti domeeniga liikmed logiksid sisse teie identiteedipakkuja kaudu.',
        domainLabel: 'Domeenid:',
        menuAction__activate: 'Aktiveeri',
        menuAction__deactivate: 'Deaktiveeri',
        menuAction__edit: 'Muuda',
        menuAction__remove: 'Eemalda',
        primaryButton__continueConfiguration: 'Jätka seadistamist',
        primaryButton__startConfiguration: 'Alusta seadistamist',
        title: 'SSO',
        tooltip:
          'Sobiva domeenita liikmed saavad endiselt sisse logida olemasolevate autentimismeetoditega. Uutele liikmetele määratakse selles organisatsioonis roll {{role}}.',
        tooltipLabel: 'Rohkem teavet',
        tooltip__noRole: 'Sobiva domeenita liikmed saavad endiselt sisse logida olemasolevate autentimismeetoditega.',
      },
      title: 'Turvalisus',
    },
    start: {
      headerTitle__general: 'Üldine',
      headerTitle__members: 'Liikmed',
      membershipSeatUsageLabel: 'Kasutusel {{count}} kohta {{limit}}-st',
      profileSection: {
        primaryButton: 'Uuenda profiili',
        title: 'Profiil',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Selle domeeni eemaldamine mõjutab kutsutud kasutajaid.',
        removeDomainActionLabel__remove: 'Eemalda domeen',
        removeDomainSubtitle: 'Eemaldage see domeen kinnitatud domeenide hulgast',
        removeDomainTitle: 'Eemalda domeen',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Kasutajad kutsutakse organisatsiooniga liituma automaatselt, kui nad registreeruvad, ja nad saavad liituda igal ajal.',
        automaticInvitationOption__label: 'Automaatsed kutsed',
        automaticSuggestionOption__description:
          'Kasutajad saavad soovituse taotleda liitumist, kuid enne organisatsiooniga liitumist peab administraator nad heaks kiitma.',
        automaticSuggestionOption__label: 'Automaatsed soovitused',
        calloutInfoLabel: 'Liitumisrežiimi muutmine mõjutab ainult uusi kasutajaid.',
        calloutInvitationCountLabel: 'Kasutajatele saadetud ootel kutsed: {{count}}',
        calloutSuggestionCountLabel: 'Kasutajatele saadetud ootel soovitused: {{count}}',
        manualInvitationOption__description: 'Kasutajaid saab organisatsiooni kutsuda ainult käsitsi.',
        manualInvitationOption__label: 'Automaatne liitumine puudub',
        subtitle: 'Valige, kuidas selle domeeni kasutajad saavad organisatsiooniga liituda.',
      },
      start: {
        headerTitle__danger: 'Oht',
        headerTitle__enrollment: 'Liitumisvalikud',
      },
      subtitle: 'Domeen {{domain}} on nüüd kinnitatud. Jätkake, valides liitumisrežiimi.',
      title: 'Uuenda {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Sisestage oma e-posti aadressile saadetud kinnituskood',
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'Domeen {{domainName}} tuleb kinnitada e-posti teel.',
      subtitleVerificationCodeScreen: 'Kinnituskood saadeti aadressile {{emailAddress}}. Jätkamiseks sisestage kood.',
      title: 'Kinnita domeen',
    },
  },
  organizationSwitcher: {
    action__closeOrganizationSwitcher: 'Sulge organisatsioonivahetaja',
    action__createOrganization: 'Loo organisatsioon',
    action__invitationAccept: 'Liitu',
    action__manageOrganization: 'Halda',
    action__openOrganizationSwitcher: 'Ava organisatsioonivahetaja',
    action__suggestionsAccept: 'Taotle liitumist',
    notSelected: 'Organisatsiooni pole valitud',
    personalWorkspace: 'Isiklik konto',
    suggestionsAcceptedLabel: 'Ootab kinnitust',
  },
  paginationButton__next: 'Järgmine',
  paginationButton__previous: 'Eelmine',
  paginationRowText__displaying: 'Kuvatakse',
  paginationRowText__of: 'kokku',
  reverification: {
    alternativeMethods: {
      actionLink: 'Hankige abi',
      actionText: 'Kas teil pole ühtegi neist?',
      blockButton__backupCode: 'Kasutage varukoodi',
      blockButton__emailCode: 'Saatke kood e-postiga aadressile {{identifier}}',
      blockButton__passkey: 'Kasutage oma pääsmevõtit',
      blockButton__password: 'Jätkake oma parooliga',
      blockButton__phoneCode: 'Saatke SMS-kood numbrile {{identifier}}',
      blockButton__totp: 'Kasutage oma autentimisrakendust',
      getHelp: {
        blockButton__emailSupport: 'Kirjutage toele e-postiga',
        content:
          'Kui teil on konto kinnitamisega probleeme, kirjutage meile ja teeme teiega koostööd, et juurdepääs võimalikult kiiresti taastada.',
        title: 'Hankige abi',
      },
      subtitle: 'Tekkis probleeme? Kinnitamiseks võite kasutada mõnda neist meetoditest.',
      title: 'Kasutage teist meetodit',
    },
    backupCodeMfa: {
      subtitle: 'Sisestage varukood, mille saite kaheastmelise autentimise seadistamisel',
      title: 'Sisestage varukood',
    },
    emailCode: {
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'Jätkamiseks sisestage oma e-postile saadetud kood',
      title: 'Nõutav kinnitamine',
    },
    noAvailableMethods: {
      message: 'Kinnitamist ei saa jätkata. Ühtegi sobivat autentimistegurit pole seadistatud',
      subtitle: 'Ilmnes viga',
      title: 'Kontot ei saa kinnitada',
    },
    passkey: {
      blockButton__passkey: 'Kasutage oma pääsmevõtit',
      subtitle:
        'Pääsmevõtme kasutamine kinnitab teie identiteedi. Seade võib küsida teie sõrmejälge, nägu või ekraanilukku.',
      title: 'Kasutage oma pääsmevõtit',

    },
    password: {
      actionLink: 'Kasuta teist meetodit',
      subtitle: 'Jätkamiseks sisesta oma praegune parool',
      title: 'Nõutav kinnitamine',
    },
    phoneCode: {
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'Jätkamiseks sisesta oma telefonile saadetud kood',
      title: 'Nõutav kinnitamine',
    },
    phoneCodeMfa: {
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'Jätkamiseks sisesta oma telefonile saadetud kood',
      title: 'Nõutav kinnitamine',
    },
    totpMfa: {
      formTitle: 'Kinnituskood',
      subtitle: 'Jätkamiseks sisesta kood, mille genereeris sinu autentimisrakendus',
      title: 'Nõutav kinnitamine',
    },
  },
  searchInput: {
    action__clear: 'Tühjenda otsing',
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Lisa konto',
      action__signOutAll: 'Logi kõigilt kontodelt välja',
      subtitle: 'Vali konto, millega soovid jätkata.',
      title: 'Vali konto',
    },
    alternativeMethods: {
      actionLink: 'Hangi abi',
      actionText: 'Kas sul pole ühtegi neist?',
      blockButton__backupCode: 'Kasuta varukoodi',
      blockButton__emailCode: 'Saada kood aadressile {{identifier}}',
      blockButton__emailLink: 'Saada link aadressile {{identifier}}',
      blockButton__passkey: 'Logi sisse pääsuvõtmega',
      blockButton__password: 'Logi sisse parooliga',
      blockButton__phoneCode: 'Saada SMS-kood numbrile {{identifier}}',
      blockButton__totp: 'Kasuta oma autentimisrakendust',
      getHelp: {
        blockButton__emailSupport: 'Kirjuta toele e-posti teel',
        content:
          'Kui sul on probleeme kontole sisselogimisega, kirjuta meile e-posti teel ja aitame sul võimalikult kiiresti juurdepääsu taastada.',
        title: 'Hangi abi',
      },
      subtitle: 'Tekkis probleeme? Sisselogimiseks võid kasutada ükskõik millist neist meetoditest.',
      title: 'Kasuta teist meetodit',
    },
    alternativePhoneCodeProvider: {
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'jätkamiseks rakenduses {{applicationName}}',
      title: 'Kontrolli oma {{provider}}',
    },
    backupCodeMfa: {
      subtitle: 'Sinu varukood on see, mille said kaheastmelise autentimise seadistamisel.',
      title: 'Sisesta varukood',
    },
    emailCode: {
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'jätkamiseks rakenduses {{applicationName}}',
      title: 'Kontrolli oma e-posti',
    },
    emailCodeMfa: {
      formTitle: 'Kontrolli oma e-posti',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'jätkamiseks rakenduses {{applicationName}}',
      title: 'Kontrolli oma e-posti',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Jätkamiseks ava kinnituslink seadmes ja brauseris, milles alustasid sisselogimist',
        title: 'Kinnituslink ei kehti selle seadme jaoks',
      },
      expired: {
        subtitle: 'Jätkamiseks naase esialgsesse vahekaarti.',
        title: 'See kinnituslink on aegunud',
      },
      failed: {
        subtitle: 'Jätkamiseks naase esialgsesse vahekaarti.',
        title: 'See kinnituslink ei kehti',
      },
      formSubtitle: 'Kasuta oma e-postile saadetud kinnituslinki',
      formTitle: 'Kinnituslink',
      loading: {
        subtitle: 'Sind suunatakse peagi edasi',
        title: 'Sisselogimine...',
      },
      resendButton: "Ei saanud linki? Saada uuesti",
      subtitle: 'jätkamiseks rakenduses {{applicationName}}',
      title: 'Kontrolli oma e-posti',
      unusedTab: {
        title: 'Võid selle vahekaardi sulgeda',
      },
      verified: {
        subtitle: 'Sind suunatakse peagi edasi',
        title: 'Sisselogimine õnnestus',
      },
      verifiedSwitchTab: {
        subtitle: 'Jätkamiseks naase esialgsesse vahekaarti',
        subtitleNewTab: 'Jätkamiseks naase äsja avatud vahekaarti',
        titleNewTab: 'Sisse logitud teises vahekaardis',
      },
      verifiedTransferable: {
        subtitle: 'Jätkamiseks naase esialgsesse vahekaarti',
        title: 'E-post kinnitatud',
      },
    },
    emailLinkMfa: {
      formSubtitle: 'Kasuta oma e-postile saadetud kinnituslinki',
      resendButton: "Ei saanud linki? Saada uuesti",
      subtitle: 'jätkamiseks rakenduses {{applicationName}}',
      title: 'Kontrolli oma e-posti',
    },
    enterpriseConnections: {
      subtitle: 'Vali ettevõtte konto, millega soovid jätkata.',
      title: 'Vali oma ettevõtte konto',
    },
    forgotPassword: {
      formTitle: 'Parooli lähtestamise kood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'parooli lähtestamiseks',
      subtitle_email: 'Esmalt sisesta oma e-posti aadressile saadetud kood',
      subtitle_phone: 'Esmalt sisesta oma telefonile saadetud kood',
      title: 'Lähtesta parool',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Lähtesta oma parool',
      label__alternativeMethods: 'Või logi sisse mõne teise meetodiga',
      title: 'Unustasid parooli?',
    },
    newDeviceVerificationNotice:
      "Logid sisse uuest seadmest. Küsime kinnitust, et hoida sinu konto turvalisena.",
    noAvailableMethods: {
      message: "Sisselogimist ei saa jätkata. Ühtegi saadaolevat autentimistegurit pole.",
      subtitle: 'Tekkis viga',
      title: 'Sisse logida ei saa',
    },
    passkey: {
      subtitle: "Pääsuvõtme kasutamine kinnitab, et see oled sina. Sinu seade võib küsida sõrmejälge, nägu või ekraanilukku.",
      title: 'Kasuta oma pääsuvõtit',
    },
    password: {
      actionLink: 'Kasuta teist meetodit',
      subtitle: 'Sisesta oma kontoga seotud parool',
      title: 'Sisesta oma parool',
    },
    passwordCompromised: {
      title: 'Parool on lekkinud',
    },
    passwordPwned: {
      title: 'Parool on lekkinud',
    },
    passwordUntrusted: {
      title: 'Parool ei ole usaldusväärne',
    },
    phoneCode: {
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'jätkamiseks rakenduses {{applicationName}}',
      title: 'Kontrolli oma telefoni',
    },
    phoneCodeMfa: {
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'Jätkamiseks sisesta oma telefonile saadetud kinnituskood',
      title: 'Kontrolli oma telefoni',
    },
    protectCheck: {
      loading: 'Laadimine…',
      retryButton: 'Proovi uuesti',
      subtitle: 'Palun oota, kuni kinnitame sinu taotluse.',
      title: 'Sinu taotluse kinnitamine',
    },
    resetPassword: {
      formButtonPrimary: 'Lähtesta parool',
      requiredMessage: 'Turvalisuse huvides on vajalik parool lähtestada.',
      successMessage: 'Sinu parool muudeti edukalt. Logime sind sisse, palun oota hetk.',
      title: 'Määra uus parool',
    },
    resetPasswordMfa: {
      detailsLabel: 'Enne parooli lähtestamist peame su isiku tuvastama.',
    },
    start: {
      actionLink: 'Registreeru',
      actionLink__join_waitlist: 'Liitu ootenimekirjaga',
      actionLink__use_email: 'Kasuta e-posti',

      actionLink__use_email_username: 'Kasuta e-posti või kasutajanime',
      actionLink__use_passkey: 'Kasuta selle asemel pääsuvõtit',
      actionLink__use_phone: 'Kasuta telefoni',
      actionLink__use_username: 'Kasuta kasutajanime',
      actionText: 'Pole kontot?',
      actionText__join_waitlist: 'Soovid varajast juurdepääsu?',
      alternativePhoneCodeProvider: {
        actionLink: 'Kasuta teist meetodit',
        label: '{{provider}} telefoninumber',
        subtitle: 'Sisesta oma telefoninumber, et saada kinnituskood teenuses {{provider}}.',
        title: 'Logi sisse rakendusse {{applicationName}} teenusega {{provider}}',
      },
      subtitle: 'Tere tulemast tagasi! Jätkamiseks logi sisse',
      subtitleCombined: undefined,
      title: 'Logi sisse rakendusse {{applicationName}}',
      titleCombined: 'Jätka rakendusse {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Kinnituskood',
      subtitle: 'Jätkamiseks sisesta autentimisrakenduse loodud kinnituskood',
      title: 'Kaheastmeline kinnitus',
    },
    web3Solana: {
      subtitle: 'Sisselogimiseks vali allpool rahakott',
      title: 'Logi sisse Solanaga',
    },
  },
  signInEnterPasswordTitle: 'Sisesta oma parool',
  signUp: {
    alternativePhoneCodeProvider: {
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'Sisesta kinnituskood, mis saadeti sinu {{provider}}',
      title: 'Kinnita oma {{provider}}',
    },
    continue: {
      actionLink: 'Logi sisse',
      actionText: 'Kas sul on juba konto?',
      subtitle: 'Jätkamiseks täida ülejäänud andmed.',
      title: 'Täida puuduvad väljad',
    },
    emailCode: {
      formSubtitle: 'Sisesta kinnituskood, mis saadeti sinu e-posti aadressile',
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'Sisesta kinnituskood, mis saadeti sinu e-postile',
      title: 'Kinnita oma e-post',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Jätkamiseks ava kinnituslink samas seadmes ja brauseris, kus alustasid registreerimist',
        title: 'Kinnituslink ei sobi selle seadmega',
      },
      formSubtitle: 'Kasuta kinnituslinki, mis saadeti sinu e-posti aadressile',
      formTitle: 'Kinnituslink',
      loading: {
        title: 'Registreerimine...',
      },
      resendButton: "Ei saanud linki? Saada uuesti",
      subtitle: 'jätkamiseks rakendusse {{applicationName}}',
      title: 'Kinnita oma e-post',
      verified: {
        title: 'Registreerimine õnnestus',
      },
      verifiedSwitchTab: {
        subtitle: 'Jätkamiseks naaske äsja avatud vahekaardile',
        subtitleNewTab: 'Jätkamiseks naaske eelmisele vahekaardile',
        title: 'E-post edukalt kinnitatud',
      },
    },
    enterpriseConnections: {
      subtitle: 'Vali ettevõttekonto, millega soovid jätkata.',
      title: 'Vali oma ettevõttekonto',
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Nõustun {{ privacyPolicyLink || link("privaatsuspoliitikaga") }}',
        label__onlyTermsOfService: 'Nõustun {{ termsOfServiceLink || link("kasutustingimustega") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Nõustun {{ termsOfServiceLink || link("kasutustingimustega") }} ja {{ privacyPolicyLink || link("privaatsuspoliitikaga") }}',
      },
      continue: {
        subtitle: 'Jätkamiseks loe tingimused läbi ja nõustu nendega',
        title: 'Õiguslik nõusolek',
      },
    },
    phoneCode: {
      formSubtitle: 'Sisesta kinnituskood, mis saadeti sinu telefoninumbrile',
      formTitle: 'Kinnituskood',
      resendButton: "Ei saanud koodi? Saada uuesti",
      subtitle: 'Sisesta kinnituskood, mis saadeti sinu telefonile',
      title: 'Kinnita oma telefon',
    },
    protectCheck: {
      loading: 'Laadimine…',
      retryButton: 'Proovi uuesti',
      subtitle: 'Palun oota, kuni me sinu taotlust kontrollime.',
      title: 'Sinu taotluse kontrollimine',
    },
    restrictedAccess: {
      actionLink: 'Logi sisse',
      actionText: 'Kas sul on juba konto?',
      blockButton__emailSupport: 'E-posti tugi',
      blockButton__joinWaitlist: 'Liitu ootenimekirjaga',
      subtitle: 'Registreerimine on praegu keelatud. Kui arvad, et sul peaks olema juurdepääs, võta ühendust toega.',
      subtitleWaitlist: 'Registreerimine on praegu keelatud. Et olla esimene, kes meie käivitamisest teada saab, liitu ootenimekirjaga.',
      title: 'Juurdepääs piiratud',
    },
    start: {
      actionLink: 'Logi sisse',
      actionLink__use_email: 'Kasuta selle asemel e-posti',
      actionLink__use_phone: 'Kasuta selle asemel telefoni',
      actionText: 'Kas sul on juba konto?',
      alternativePhoneCodeProvider: {
        actionLink: 'Kasuta teist meetodit',
        label: '{{provider}} telefoninumber',
        subtitle: 'Sisesta oma telefoninumber, et saada kinnituskood teenuses {{provider}}.',
        title: 'Registreeru rakendusse {{applicationName}} teenusega {{provider}}',
      },
      subtitle: 'Tere tulemast! Alustamiseks täida andmed.',
      subtitleCombined: 'Tere tulemast! Alustamiseks täida andmed.',
      title: 'Loo oma konto',
      titleCombined: 'Loo oma konto',
    },
    web3Solana: {
      subtitle: 'Registreerumiseks vali allpool rahakott',
      title: 'Registreeru Solanaga',
    },
  },
  socialButtonsBlockButton: 'Jätka teenusega {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  taskChooseOrganization: {
    alerts: {
      organizationAlreadyExists:
        'Tuvastatud ettevõtte nime ({{organizationName}}) ja domeeni {{organizationDomain}} jaoks on organisatsioon juba olemas. Liitu kutse alusel.',
    },
    chooseOrganization: {
      action__createOrganization: 'Loo uus organisatsioon',
      action__invitationAccept: 'Liitu',
      action__suggestionsAccept: 'Taotle liitumist',
      subtitle: 'Liitu olemasoleva organisatsiooniga või loo uus',
      subtitle__createOrganizationDisabled: 'Liitu olemasoleva organisatsiooniga',
      suggestionsAcceptedLabel: 'Ootab kinnitust',
      title: 'Vali organisatsioon',
    },
    createOrganization: {
      formButtonReset: 'Tühista',
      formButtonSubmit: 'Jätka',
      formFieldInputPlaceholder__name: 'Minu organisatsioon',
      formFieldInputPlaceholder__slug: 'minu-organisatsioon',
      formFieldLabel__name: 'Nimi',
      formFieldLabel__slug: 'Slug',
      subtitle: 'Jätkamiseks sisesta oma organisatsiooni andmed',
      title: 'Seadista oma organisatsioon',
    },
    organizationCreationDisabled: {
      subtitle: 'Kutse saamiseks võta ühendust oma organisatsiooni administraatoriga.',
      title: 'Sa pead kuuluma mõnda organisatsiooni',
    },
    signOut: {
      actionLink: 'Logi välja',
      actionText: 'Sisse logitud kasutajana {{identifier}}',
    },
  },
  taskResetPassword: {
    formButtonPrimary: 'Lähtesta parool',
    signOut: {
      actionLink: 'Logi välja',
      actionText: 'Sisse logitud kasutajana {{identifier}}',
    },
    subtitle: 'Sinu konto vajab enne jätkamist uut parooli',
    title: 'Lähtesta oma parool',
  },
  taskSetupMfa: {
    badge: 'Kaheastmelise kinnituse seadistamine',
    signOut: {
      actionLink: 'Logi välja',
      actionText: 'Sisse logitud kasutajana {{identifier}}',
    },
    smsCode: {
      addPhone: {
        formButtonPrimary: 'Jätka',
        infoText:
          'Sellele telefoninumbrile saadetakse tekstisõnum kinnituskoodiga. Võivad kehtida sõnumi- ja andmesideteenuste tasud.',
      },
      addPhoneNumber: 'Lisa telefoninumber',
      cancel: 'Tühista',
      subtitle: 'Vali telefoninumber, mida soovid kasutada SMS-koodiga kaheastmeliseks kinnituseks',
      success: {
        finishButton: 'Jätka',
        message1:
          'Kaheastmeline kinnitus on nüüd lubatud. Sisselogimisel pead lisasammuna sisestama sellele telefoninumbrile saadetud kinnituskoodi.',
        message2:
          'Salvesta need varukoodid ja hoia neid turvalises kohas. Kui kaotad juurdepääsu oma autentimisseadmele, saad sisselogimiseks kasutada varukoode.',

        title: 'SMS-koodi kinnitamine lubatud',
      },
      title: 'Lisa SMS-koodi kinnitamine',
      verifyPhone: {
        formButtonPrimary: 'Jätka',
        formTitle: 'Kinnituskood',
        resendButton: "Ei saanud koodi? Saada uuesti",
        subtitle: 'Sisesta kinnituskood, mis saadeti aadressile',
        title: 'Kinnita oma telefoninumber',
      },
    },
    start: {
      methodSelection: {
        phoneCode: 'SMS-kood',
        totp: 'Autentimisrakendus',
      },
      subtitle: 'Vali meetod, millega soovid kaitsta oma kontot täiendava turvakihiga',
      title: 'Seadista kaheastmeline kinnitamine',
    },
    totpCode: {
      addAuthenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Skanni selle asemel QR-kood',
        buttonUnableToScan__nonPrimary: "Ei saa QR-koodi skannida?",
        formButtonPrimary: 'Jätka',
        formButtonReset: 'Tühista',
        infoText__ableToScan:
          'Seadista autentimisrakenduses uus sisselogimismeetod ja skanni järgmine QR-kood, et see oma kontoga siduda.',
        infoText__unableToScan: 'Seadista autentimisrakenduses uus sisselogimismeetod ja sisesta allpool toodud võti.',
        inputLabel__unableToScan1:
          'Veendu, et ajapõhised või ühekordsed paroolid on lubatud, ning seejärel lõpeta konto sidumine.',
      },
      success: {
        finishButton: 'Jätka',
        message1:
          'Kaheastmeline kinnitamine on nüüd lubatud. Sisselogimisel pead lisasammuna sisestama sellest autentimisrakendusest pärit kinnituskoodi.',
        message2:
          'Salvesta need varukoodid ja hoia neid turvalises kohas. Kui kaotad juurdepääsu oma autentimisseadmele, saad sisselogimiseks kasutada varukoode.',
        title: 'Autentimisrakenduse kinnitamine lubatud',
      },
      title: 'Lisa autentimisrakendus',
      verifyTotp: {
        formButtonPrimary: 'Jätka',
        formButtonReset: 'Tühista',
        formTitle: 'Kinnituskood',
        subtitle: 'Sisesta autentimisrakenduse loodud kinnituskood',
        title: 'Lisa autentimisrakendus',
      },
    },
  },
  unstable__errors: {
    action_blocked: "Seda toimingut ei õnnestunud lõpule viia. Proovi hiljem uuesti või võta ühendust toega, kui probleem püsib.",
    already_a_member_in_organization: '{{email}} on juba selle organisatsiooni liige.',
    api_key_name_already_exists: 'Selle nimega API-võti on juba olemas.',
    api_key_usage_exceeded: 'Oled jõudnud oma kasutuslimiidini. Limiidi saad eemaldada, kui lähed üle tasulisele paketile.',
    avatar_file_size_exceeded: 'Faili suurus ületab 10 MB maksimumlimiiti. Vali väiksem fail.',
    avatar_file_type_invalid: 'Failitüüpi ei toetata. Laadi üles JPG-, PNG-, GIF- või WEBP-pilt.',
    captcha_invalid: undefined,
    captcha_unavailable:
      'Registreerumine ebaõnnestus, kuna roboti kontrollimine nurjus. Värskenda lehte ja proovi uuesti või pöördu toe poole lisateabe saamiseks.',
    form_code_incorrect: undefined,
    form_email_address_blocked: undefined,
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
    form_new_password_matches_current: 'Uus parool ei tohi olla sama mis praegune parool.',
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
    form_password_length_too_short: 'Sinu parool on liiga lühike. See peab olema vähemalt 8 tähemärki pikk.',
    form_password_matches_identifier:
      'Parool ei tohi kattuda sinu e-posti aadressi, telefoninumbri ega kasutajanimega. Konto turvalisuse huvides kasuta teistsugust parooli.',
    form_password_not_strong_enough: 'Sinu parool ei ole piisavalt tugev.',
    form_password_or_identifier_incorrect: undefined,
    form_password_pwned:
      'See parool on leitud andmelekke osana ja seda ei saa kasutada. Proovi selle asemel teist parooli.',
    form_password_pwned__sign_in:
      'See parool on leitud andmelekke osana ja seda ei saa kasutada. Lähtesta oma parool.',
    form_password_size_in_bytes_exceeded: undefined,
    form_password_untrusted__sign_in:
      'Sinu parool võib olla ohustatud. Konto kaitsmiseks jätka mõne teise sisselogimismeetodiga. Pärast sisselogimist pead parooli lähtestama.',
    form_password_validation_failed: undefined,
    form_username_invalid_character: undefined,
    form_username_invalid_length: 'Sinu kasutajanimi peab olema {{min_length}} kuni {{max_length}} tähemärki pikk.',
    form_username_needs_non_number_char: 'Sinu kasutajanimi peab sisaldama vähemalt ühte mittenumbrilist tähemärki.',
    identification_deletion_failed: undefined,
    insufficient_seats_change_plan:
      'Sinu organisatsioonil ei ole piisavalt kohti, et kutsuda soovitud arv liikmeid. Vaheta pakett sellise vastu, mis toetab liikmete arvu, keda proovid kutsuda.',
    insufficient_seats_contact_support:
      'Sinu organisatsioonil ei ole piisavalt kohti, et kutsuda soovitud arv liikmeid. Võta ühendust toega.',
    not_allowed_access: undefined,
    oauth_access_denied: 'Sa ei andnud oma kontole juurdepääsu.',
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded:
      'Oled jõudnud oma organisatsiooni liikmesuste limiidini, sealhulgas lahtised kutsed.',
    organization_minimum_permissions_needed: undefined,
    organization_not_found_or_unauthorized:
      'Sa ei ole enam selle organisatsiooni liige. Vali või loo mõni teine.',
    organization_not_found_or_unauthorized_with_create_organization_disabled:
      'Sa ei ole enam selle organisatsiooni liige. Vali mõni teine.',
    passkey_already_exists: 'Selle seadmega on juba pääsuvõti registreeritud.',
    passkey_not_supported: 'Pääsuvõtmeid selles seadmes ei toetata.',
    passkey_pa_not_supported: 'Registreerimine nõuab platvormi autentijat, kuid seade seda ei toeta.',
    passkey_registration_cancelled: 'Pääsuvõtme registreerimine tühistati või aegus.',
    passkey_retrieval_cancelled: 'Pääsuvõtme kinnitamine tühistati või aegus.',
    passwordComplexity: {
      maximumLength: 'vähem kui {{length}} tähemärki',
      minimumLength: '{{length}} või rohkem tähemärki',
      requireLowercase: 'väiketäht',
      requireNumbers: 'number',
      requireSpecialCharacter: 'erimärk',
      requireUppercase: 'suurtäht',
      sentencePrefix: 'Sinu parool peab sisaldama',
    },
    phone_number_exists: undefined,
    protect_check_aborted: undefined,
    protect_check_already_resolved: undefined,
    protect_check_execution_failed: "Kinnitamine ei lõppenud. Proovi uuesti.",
    protect_check_invalid_script: "Kinnitamist ei õnnestunud laadida. Kui see kordub, võta ühendust toega.",
    protect_check_invalid_sdk_url: "Kinnitamist ei õnnestunud alustada. Võta ühendust toega.",
    protect_check_script_load_failed:
      "Kinnitamist ei õnnestunud laadida. Selle põhjuseks võib olla võrguprobleem või sisu turbepoliitika, mis blokeerib kinnitamisskripti. Proovi uuesti või võta ühendust toega.",
    protect_check_timed_out: "Kinnitamine ei lõppenud õigeks ajaks. Proovi uuesti.",
    protect_check_unsupported_environment:
      "Kinnitamist selles keskkonnas ei toetata. Jätka tavalises brauseris või võta ühendust toega.",
    session_exists: undefined,
    ticket_expired_code: 'See link on aegunud. Alusta uuesti või küsi uus link.',
    ticket_invalid_code:
      'See link ei kehti enam või on juba kasutatud. Alusta uuesti või küsi uus link.',
    web3_missing_identifier: 'Web3 rahakoti laiendust ei leitud. Jätkamiseks installi see.',
    web3_signature_request_rejected: 'Lükkasid allkirjataotluse tagasi. Jätkamiseks proovi uuesti.',
    web3_solana_signature_generation_failed:
      'Allkirja loomisel tekkis viga. Jätkamiseks proovi uuesti.',
    zxcvbn: {
      couldBeStronger: 'Sinu parool töötab, kuid võiks olla tugevam. Proovi lisada rohkem tähemärke.',
      goodPassword: 'Sinu parool vastab kõigile vajalikele nõuetele.',
      notEnough: 'Sinu parool ei ole piisavalt tugev.',
      suggestions: {
        allUppercase: 'Kasuta suurtähti osade, kuid mitte kõigi tähtede puhul.',
        anotherWord: 'Lisa rohkem vähem levinud sõnu.',
        associatedYears: 'Väldi aastaarve, mis on sinuga seotud.',
        capitalization: 'Kasuta suurtähti rohkem kui ainult esimese tähe puhul.',
        dates: 'Väldi kuupäevi ja aastaarve, mis on sinuga seotud.',
        l33t: "Väldi etteaimatavaid täheasendusi, nagu '@' tähe 'a' asemel.",
        longerKeyboardPattern: 'Kasuta pikemaid klaviatuurimustreid ja muuda trükkimise suunda mitu korda.',
        noNeed: 'Saad luua tugevaid paroole ilma sümboleid, numbreid või suurtähti kasutamata.',
        pwned: 'Kui kasutad seda parooli ka mujal, peaksid selle muutma.',
        recentYears: 'Väldi hiljutisi aastaarve.',
        repeated: 'Väldi korduvaid sõnu ja tähemärke.',
        reverseWords: 'Väldi tavaliste sõnade tagurpidi kirjutamist.',
        sequences: 'Väldi tavalisi tähemärgijadasid.',
        useWords: 'Kasuta mitut sõna, kuid väldi tavalisi fraase.',
      },
      warnings: {
        common: 'See on sageli kasutatav parool.',
        commonNames: 'Tavalisi ees- ja perekonnanimesid on lihtne ära arvata.',
        dates: 'Kuupäevi on lihtne ära arvata.',
        extendedRepeat: 'Korduvaid tähemärgimustreid, nagu "abcabcabc", on lihtne ära arvata.',
        keyPattern: 'Lühikesi klaviatuurimustreid on lihtne ära arvata.',
        namesByThemselves: 'Üksikuid ees- või perekonnanimesid on lihtne ära arvata.',
        pwned: 'Sinu parool lekkis internetis andmelekke tõttu.',
        recentYears: 'Hiljutisi aastaarve on lihtne ära arvata.',
        sequences: 'Tavalisi tähemärgijadasid, nagu "abc", on lihtne ära arvata.',
        similarToCommon: 'See sarnaneb sageli kasutatava parooliga.',
        simpleRepeat: 'Korduvaid tähemärke, nagu "aaa", on lihtne ära arvata.',
        straightRow: 'Sirgeid klahviridu klaviatuuril on lihtne ära arvata.',
        topHundred: 'See on sageli kasutatav parool.',
        topTen: 'See on väga laialt kasutatav parool.',
        userInputs: 'Ei tohiks olla isikuandmeid ega lehega seotud andmeid.',
        wordByItself: 'Üksikuid sõnu on lihtne ära arvata.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Lisa konto',
    action__closeUserMenu: 'Sulge kasutajamenüü',
    action__manageAccount: 'Halda kontot',
    action__openUserMenu: 'Ava kasutajamenüü',
    action__signOut: 'Logi välja',
    action__signOutAll: 'Logi välja kõigist kontodest',
    label__accountActions: 'Konto toimingud',
    label__activeSessions: 'Aktiivsed seansid',

    label__userButtonPopover: 'Konto paneel',
  },
  userProfile: {
    apiKeysPage: {
      title: 'API võtmed',
    },
    backupCodePage: {
      actionLabel__copied: 'Kopeeritud!',
      actionLabel__copy: 'Kopeeri kõik',
      actionLabel__download: 'Laadi alla .txt',
      actionLabel__print: 'Prindi',
      infoText1: 'Selle konto jaoks lubatakse varukoodid.',
      infoText2:
        'Hoia varukoodid saladuses ja säilita neid turvaliselt. Kui kahtlustad, et need on ohtu sattunud, saad varukoodid uuesti genereerida.',
      subtitle__codelist: 'Säilita neid turvaliselt ja hoia saladuses.',
      successMessage:
        'Varukoodid on nüüd lubatud. Võid ühte neist kasutada oma kontole sisselogimiseks, kui kaotad juurdepääsu oma autentimisseadmele. Iga koodi saab kasutada ainult ühe korra.',
      successSubtitle:
        'Võid ühte neist kasutada oma kontole sisselogimiseks, kui kaotad juurdepääsu oma autentimisseadmele.',
      title: 'Lisa varukoodi kinnitamine',
      title__codelist: 'Varukoodid',
    },
    billingPage: {
      accountCreditsSection: {
        title: 'Konto krediidid',
        viewHistory: 'Vaata krediidiajalugu',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Kuupäev',
        title: 'Konto krediidiajalugu',
      },
      paymentHistorySection: {
        empty: 'Makseajalugu puudub',
        notFound: 'Maksekatset ei leitud',
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Kuupäev',
        tableHeader__status: 'Olek',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Määra vaikimisi',
        actionLabel__remove: 'Eemalda',
        add: 'Lisa uus makseviis',
        addSubtitle: 'Lisa oma kontole uus makseviis.',
        cancelButton: 'Tühista',
        formButtonPrimary__add: 'Lisa makseviis',
        formButtonPrimary__pay: 'Maksa {{amount}}',
        payWithTestCardButton: 'Maksa testkaardiga',
        removeMethod: {
          messageLine1: '{{identifier}} eemaldatakse sellelt kontolt.',
          messageLine2:
            'Sa ei saa enam seda makseallikat kasutada ning kõik sellest sõltuvad korduvad tellimused lakkavad töötamast.',
          successMessage: '{{paymentMethod}} on sinu kontolt eemaldatud.',
          title: 'Eemalda makseviis',
        },
        title: 'Makseviisid',
      },
      start: {
        headerTitle__payments: 'Maksed',
        headerTitle__plans: 'Plaanid',
        headerTitle__statements: 'Väljavõtted',
        headerTitle__subscriptions: 'Tellimus',
      },
      statementsSection: {
        empty: 'Kuvamiseks pole väljavõtteid',
        itemCaption__paidForPlan: 'Tasutud {{plan}} {{period}} plaani eest',
        itemCaption__payerCredit: 'Krediit konto saldost',
        itemCaption__proratedCredit: 'Proportsionaalne krediit eelmise tellimuse osalise kasutuse eest',
        itemCaption__subscribedAndPaidForPlan: 'Tellitud ja tasutud {{plan}} {{period}} plaani eest',
        notFound: 'Väljavõtet ei leitud',
        tableHeader__amount: 'Summa',
        tableHeader__date: 'Kuupäev',
        title: 'Väljavõtted',
        totalPaid: 'Kokku tasutud',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Halda',
        actionLabel__newSubscription: 'Telli plaan',
        actionLabel__switchPlan: 'Vaheta plaani',
        overview: 'Ülevaade',
        tableHeader__edit: 'Muuda',
        tableHeader__plan: 'Plaan',
        tableHeader__startDate: 'Alguskuupäev',
        title: 'Tellimus',
      },
      subscriptionsSection: {
        actionLabel__default: 'Halda',
      },
      switchPlansSection: {
        title: 'Vaheta plaani',
      },
      title: 'Arveldus',
    },
    connectedAccountPage: {
      formHint: 'Vali teenusepakkuja, et oma konto ühendada.',
      formHint__noAccounts: 'Saadaval pole ühtegi välist konto teenusepakkujat.',
      removeResource: {
        messageLine1: '{{identifier}} eemaldatakse sellelt kontolt.',
        messageLine2:
          'Sa ei saa enam seda ühendatud kontot kasutada ning kõik sellest sõltuvad funktsioonid lakkavad töötamast.',
        successMessage: '{{connectedAccount}} on sinu kontolt eemaldatud.',
        title: 'Eemalda ühendatud konto',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'Teenusepakkuja on sinu kontole lisatud',
      title: 'Lisa ühendatud konto',
    },
    deletePage: {
      actionDescription: 'Jätkamiseks kirjuta allpool „Kustuta konto".',
      confirm: 'Kustuta konto',
      messageLine1:
        'Kas oled kindel, et soovid oma konto kustutada? Osa seotud andmeid võidakse säilitada. Täieliku andmete kustutamise taotlemiseks võta ühendust toega.',
      messageLine2: 'See toiming on püsiv ja pöördumatu.',
      title: 'Kustuta konto',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Sellele e-posti aadressile saadetakse kinnituskoodi sisaldav e-kiri.',
        formSubtitle: 'Sisesta kinnituskood, mis saadeti aadressile {{identifier}}',
        formTitle: 'Kinnituskood',
        resendButton: "Ei saanud koodi? Saada uuesti",
        successMessage: 'E-posti aadress {{identifier}} on sinu kontole lisatud.',
      },
      emailLink: {
        formHint: 'Sellele e-posti aadressile saadetakse kinnituslingi sisaldav e-kiri.',
        formSubtitle: 'Klõpsa kinnituslinki e-kirjas, mis saadeti aadressile {{identifier}}',
        formTitle: 'Kinnituslink',
        resendButton: "Ei saanud linki? Saada uuesti",
        successMessage: 'E-posti aadress {{identifier}} on sinu kontole lisatud.',
      },
      enterpriseSSOLink: {
        formButton: 'Klõpsa sisselogimiseks',
        formSubtitle: 'Lõpeta sisselogimine teenusega {{identifier}}',
      },
      formHint: "Enne kui selle e-posti aadressi saab sinu kontole lisada, tuleb see kinnitada.",
      removeResource: {
        messageLine1: '{{identifier}} eemaldatakse sellelt kontolt.',
        messageLine2: 'Sa ei saa enam selle e-posti aadressiga sisse logida.',
        successMessage: '{{emailAddress}} on sinu kontolt eemaldatud.',
        title: 'Eemalda e-posti aadress',
      },
      title: 'Lisa e-posti aadress',
      verifyTitle: 'Kinnita e-posti aadress',
    },
    formButtonPrimary__add: 'Lisa',
    formButtonPrimary__continue: 'Jätka',
    formButtonPrimary__finish: 'Lõpeta',
    formButtonPrimary__remove: 'Eemalda',
    formButtonPrimary__save: 'Salvesta',
    formButtonReset: 'Tühista',
    mfaPage: {
      formHint: 'Vali lisatav meetod.',
      title: 'Lisa kaheastmeline kinnitamine',
    },
    mfaPhoneCodePage: {
      backButton: 'Kasuta olemasolevat numbrit',
      primaryButton__addPhoneNumber: 'Lisa telefoninumber',
      removeResource: {
        messageLine1: '{{identifier}} ei saa enam sisselogimisel kinnituskoode.',
        messageLine2: 'Sinu konto ei pruugi enam nii turvaline olla. Kas oled kindel, et soovid jätkata?',
        successMessage: 'SMS-koodi kaheastmeline kinnitamine on eemaldatud numbrile {{mfaPhoneCode}}',
        title: 'Eemalda kaheastmeline kinnitamine',
      },
      subtitle__availablePhoneNumbers:
        'Vali olemasolev telefoninumber, et registreerida SMS-koodi kaheastmeline kinnitamine, või lisa uus.',
      subtitle__unavailablePhoneNumbers:
        'SMS-koodi kaheastmelise kinnitamise registreerimiseks pole ühtegi saadaolevat telefoninumbrit, lisa palun uus.',
      successMessage1:
        'Sisselogimisel tuleb sul lisasammuna sisestada sellele telefoninumbrile saadetud kinnituskood.',
      successMessage2:
        'Salvesta need varukoodid ja hoia neid turvalises kohas. Kui kaotad juurdepääsu oma autentimisseadmele, saad sisselogimiseks kasutada varukoode.',
      successTitle: 'SMS-koodi kinnitamine on lubatud',
      title: 'Lisa SMS-koodi kinnitamine',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Skanni selle asemel QR-koodi',
        buttonUnableToScan__nonPrimary: 'Ei saa QR-koodi skannida?',
        infoText__ableToScan:
          'Seadista oma autentimisrakenduses uus sisselogimismeetod ja skanni järgmine QR-kood, et see oma kontoga siduda.',
        infoText__unableToScan: 'Seadista oma autentimisrakenduses uus sisselogimismeetod ja sisesta allpool toodud võti.',
        inputLabel__unableToScan1:
          'Veendu, et ajapõhised või ühekordsed paroolid on lubatud, ja seejärel lõpeta konto sidumine.',
        inputLabel__unableToScan2:
          'Teise võimalusena, kui sinu autentimisrakendus toetab TOTP URI-sid, saad kopeerida ka terve URI.',
      },
      removeResource: {
        messageLine1: 'Selle autentimisrakenduse kinnituskoode ei nõuta enam sisselogimisel.',
        messageLine2: 'Sinu konto ei pruugi enam nii turvaline olla. Kas oled kindel, et soovid jätkata?',
        successMessage: 'Kaheastmeline kinnitamine autentimisrakenduse kaudu on eemaldatud.',
        title: 'Eemalda kaheastmeline kinnitamine',
      },
      successMessage:
        'Kaheastmeline kinnitamine on nüüd lubatud. Sisselogimisel tuleb sul lisasammuna sisestada selle autentimisrakenduse kinnituskood.',

      title: 'Lisa autentimisrakendus',
      verifySubtitle: 'Sisesta autentimisrakenduse loodud kinnituskood',
      verifyTitle: 'Kinnituskood',
    },
    mobileButton__menu: 'Menüü',
    navbar: {
      account: 'Profiil',
      apiKeys: 'API võtmed',
      billing: 'Arveldus',
      description: 'Halda oma konto teavet.',
      security: 'Turvalisus',
      title: 'Konto',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} eemaldatakse sellelt kontolt.',
        title: 'Eemalda pääsuvõti',
      },
      subtitle__rename: 'Saad pääsuvõtme nime muuta, et seda oleks lihtsam leida.',
      title__rename: 'Nimeta pääsuvõti ümber',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Soovitatav on välja logida kõigist teistest seadmetest, mis võisid kasutada sinu vana parooli.',
      readonly: 'Sinu parooli ei saa praegu muuta, kuna saad sisse logida ainult ettevõtte ühenduse kaudu.',
      successMessage__set: 'Sinu parool on määratud.',
      successMessage__signOutOfOtherSessions: 'Kõik teised seadmed on välja logitud.',
      successMessage__update: 'Sinu parool on uuendatud.',
      title__set: 'Määra parool',
      title__update: 'Uuenda parool',
    },
    phoneNumberPage: {
      infoText:
        'Sellele telefoninumbrile saadetakse kinnituskoodi sisaldav tekstisõnum. Sõnumi- ja andmesideteenuse tasud võivad kehtida.',
      removeResource: {
        messageLine1: '{{identifier}} eemaldatakse sellelt kontolt.',
        messageLine2: 'Sa ei saa enam selle telefoninumbriga sisse logida.',
        successMessage: '{{phoneNumber}} on sinu kontolt eemaldatud.',
        title: 'Eemalda telefoninumber',
      },
      successMessage: '{{identifier}} on sinu kontole lisatud.',
      title: 'Lisa telefoninumber',
      verifySubtitle: 'Sisesta kinnituskood, mis saadeti numbrile {{identifier}}',
      verifyTitle: 'Kinnita telefoninumber',
    },
    plansPage: {
      title: 'Plaanid',
    },
    profilePage: {
      fileDropAreaHint: 'Soovitatav suurus 1:1, kuni 10 MB.',
      imageFormDestructiveActionSubtitle: 'Eemalda',
      imageFormSubtitle: 'Laadi üles',
      imageFormTitle: 'Profiilipilt',
      readonly: 'Sinu profiiliteave on pärit ettevõtte ühendusest ja seda ei saa muuta.',
      successMessage: 'Sinu profiil on uuendatud.',
      title: 'Uuenda profiil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Logi seadmest välja',
        title: 'Aktiivsed seadmed',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Ühenda uuesti',
        actionLabel__reauthorize: 'Autoriseeri nüüd',
        destructiveActionTitle: 'Eemalda',
        primaryButton: 'Ühenda konto',
        subtitle__disconnected: 'See konto on lahti ühendatud.',
        subtitle__reauthorize:
          'Nõutavad õigused on uuendatud ja mõned funktsioonid võivad olla piiratud. Autoriseeri see rakendus uuesti, et vältida probleeme',
        title: 'Ühendatud kontod',
      },
      dangerSection: {
        deleteAccountButton: 'Kustuta konto',
        title: 'Kustuta konto',
      },
      emailAddressesSection: {
        destructiveAction: 'Eemalda e-posti aadress',
        detailsAction__nonPrimary: 'Määra esmaseks',
        detailsAction__primary: 'Lõpeta kinnitamine',
        detailsAction__unverified: 'Kinnita',
        primaryButton: 'Lisa e-posti aadress',
        title: 'E-posti aadressid',
      },
      enterpriseAccountsSection: {
        primaryButton: 'Ühenda konto',
        title: 'Ettevõtte kontod',
      },
      headerTitle__account: 'Profiili üksikasjad',
      headerTitle__security: 'Turvalisus',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Loo uuesti',
          headerTitle: 'Varukoodid',
          subtitle__regenerate:
            'Hangi uus komplekt turvalisi varukoode. Varasemad varukoodid kustutatakse ja neid ei saa enam kasutada.',
          title__regenerate: 'Loo varukoodid uuesti',
        },
        phoneCode: {
          actionLabel__setDefault: 'Määra vaikeseadeks',
          destructiveActionLabel: 'Eemalda',
        },
        primaryButton: 'Lisa kaheastmeline kinnitamine',
        title: 'Kaheastmeline kinnitamine',
        totp: {
          destructiveActionTitle: 'Eemalda',
          headerTitle: 'Autentimisrakendus',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Eemalda',
        menuAction__rename: 'Nimeta ümber',
        primaryButton: 'Lisa pääsuvõti',
        title: 'Pääsuvõtmed',
      },
      passwordSection: {
        primaryButton__setPassword: 'Määra parool',
        primaryButton__updatePassword: 'Uuenda parool',
        title: 'Parool',
      },
      phoneNumbersSection: {
        destructiveAction: 'Eemalda telefoninumber',
        detailsAction__nonPrimary: 'Määra esmaseks',
        detailsAction__primary: 'Lõpeta kinnitamine',
        detailsAction__unverified: 'Kinnita telefoninumber',
        primaryButton: 'Lisa telefoninumber',
        title: 'Telefoninumbrid',
      },
      profileSection: {
        primaryButton: 'Uuenda profiil',
        title: 'Profiil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Määra kasutajanimi',
        primaryButton__updateUsername: 'Uuenda kasutajanime',
        title: 'Kasutajanimi',
      },
      web3WalletsSection: {
        destructiveAction: 'Eemalda rahakott',
        detailsAction__nonPrimary: 'Määra esmaseks',
        primaryButton: 'Ühenda rahakott',
        title: 'Web3 rahakotid',
        web3SelectSolanaWalletScreen: {
          subtitle: 'Vali oma kontoga ühendamiseks Solana rahakott.',
          title: 'Lisa Solana rahakott',
        },
      },
    },
    usernamePage: {
      successMessage: 'Sinu kasutajanimi on uuendatud.',
      title__set: 'Määra kasutajanimi',
      title__update: 'Uuenda kasutajanime',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} eemaldatakse sellelt kontolt.',
        messageLine2: 'Sa ei saa enam selle Web3 rahakotiga sisse logida.',
        successMessage: '{{web3Wallet}} on sinu kontolt eemaldatud.',
        title: 'Eemalda Web3 rahakott',
      },
      subtitle__availableWallets: 'Vali oma kontoga ühendamiseks Web3 rahakott.',
      subtitle__unavailableWallets: 'Saadaolevaid Web3 rahakotte pole.',
      successMessage: 'Rahakott on sinu kontole lisatud.',
      title: 'Lisa Web3 rahakott',
      web3WalletButtonsBlockButton: '{{provider|titleize}}',
    },
  },
  waitlist: {
    start: {
      actionLink: 'Logi sisse',
      actionText: 'Kas sul on juba ligipääs?',
      formButton: 'Liitu ootenimekirjaga',
      subtitle: 'Sisesta oma e-posti aadress ja anname sulle teada, kui sinu koht on valmis',
      title: 'Liitu ootenimekirjaga',
    },
    success: {
      message: 'Sind suunatakse kohe edasi...',
      subtitle: 'Võtame sinuga ühendust, kui sinu koht on valmis',
      title: 'Täname ootenimekirjaga liitumise eest!',
    },
  },
  web3SolanaWalletButtons: {
    connect: 'Ühenda kontoga {{walletName}}',
    continue: 'Jätka kontoga {{walletName}}',
    noneAvailable:
      'Solana Web3 rahakotte ei tuvastatud. Palun paigalda Web3-d toetav {{ solanaWalletsLink || link("wallet extension") }}.',
  },

} as const;
