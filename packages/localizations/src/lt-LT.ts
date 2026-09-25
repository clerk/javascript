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

export const ltLT: LocalizationResource = {
  locale: 'lt-LT',
  apiKeys: {
    action__add: 'Pridėti naują raktą',
    action__search: 'Ieškoti raktų',
    copySecret: {
      formButtonPrimary__copyAndClose: 'Kopijuoti ir uždaryti',
      formHint: "Dėl saugumo priežasčių nebeleisime jums jo peržiūrėti vėliau.",
      formTitle: 'Dabar nukopijuokite savo "{{name}}" API raktą',
    },
    createdAndExpirationStatus__expiresOn:
      "Sukurta {{ createdDate | shortDate('lt-LT') }} • Baigiasi {{ expiresDate | longDate('lt-LT') }}",
    createdAndExpirationStatus__never: "Sukurta {{ createdDate | shortDate('lt-LT') }} • Niekada nesibaigia",
    detailsTitle__emptyRow: 'Nerasta API raktų',
    formButtonPrimary__add: 'Sukurti raktą',
    formFieldCaption__expiration__expiresOn: 'Baigiasi {{ date }}',
    formFieldCaption__expiration__never: 'Šis raktas niekada nesibaigs',
    formFieldOption__expiration__180d: '180 dienų',
    formFieldOption__expiration__1d: '1 diena',
    formFieldOption__expiration__1y: '1 metai',
    formFieldOption__expiration__30d: '30 dienų',
    formFieldOption__expiration__60d: '60 dienų',
    formFieldOption__expiration__7d: '7 dienos',
    formFieldOption__expiration__90d: '90 dienų',
    formFieldOption__expiration__never: 'Niekada',
    formHint: 'Nurodykite pavadinimą, kad sugeneruotumėte naują raktą. Galėsite jį atšaukti bet kada.',
    formTitle: 'Pridėti naują API raktą',
    lastUsed__days: 'prieš {{days}} d.',
    lastUsed__hours: 'prieš {{hours}} val.',
    lastUsed__minutes: 'prieš {{minutes}} min.',
    lastUsed__months: 'prieš {{months}} mėn.',
    lastUsed__seconds: 'prieš {{seconds}} sek.',
    lastUsed__years: 'prieš {{years}} m.',
    menuAction__revoke: 'Atšaukti raktą',
    revokeConfirmation: {
      confirmationText: 'Atšaukti',
      formButtonPrimary__revoke: 'Atšaukti raktą',
      formHint: 'Ar tikrai norite ištrinti šį slaptąjį raktą?',
      formTitle: 'Atšaukti slaptąjį raktą "{{apiKeyName}}"?',
      inputLabel: 'Įveskite "Revoke", kad patvirtintumėte',
    },
    tableHeader__actions: 'Veiksmai',
    tableHeader__lastUsed: 'Paskutinį kartą naudota',
    tableHeader__name: 'Pavadinimas',
  },
  backButton: 'Atgal',
  badge__activePlan: 'Aktyvus',
  badge__banned: 'Užblokuotas',
  badge__canceledEndsAt: "Atšaukta • Baigiasi {{ date | shortDate('lt-LT') }}",
  badge__currentPlan: 'Dabartinis planas',
  badge__default: 'Numatytasis',
  badge__deprovisioned: 'Atjungtas',
  badge__endsAt: "Baigiasi {{ date | shortDate('lt-LT') }}",
  badge__expired: 'Pasibaigęs',
  badge__freeTrial: 'Nemokamas bandomasis laikotarpis',
  badge__otherImpersonatorDevice: 'Kitas apsimetėlio įrenginys',
  badge__pastDueAt: "Pradelstas {{ date | shortDate('lt-LT') }}",
  badge__pastDuePlan: 'Pradelstas',
  badge__primary: 'Pagrindinis',
  badge__renewsAt: "Atnaujinama {{ date | shortDate('lt-LT') }}",
  badge__requiresAction: 'Reikia veiksmo',
  badge__startsAt: "Prasideda {{ date | shortDate('lt-LT') }}",
  badge__thisDevice: 'Šis įrenginys',
  badge__trialEndsAt: "Bandomasis laikotarpis baigiasi {{ date | shortDate('lt-LT') }}",
  badge__unverified: 'Nepatvirtintas',
  badge__upcomingPlan: 'Būsimas',
  badge__userDevice: 'Vartotojo įrenginys',
  badge__you: 'Jūs',
  billing: {
    accountCredit: 'Sąskaitos kreditas',
    addPaymentMethod__label: 'Pridėti mokėjimo būdą',
    alwaysFree: 'Visada nemokama',
    annually: 'Kasmet',
    availableFeatures: 'Galimos funkcijos',
    billedAnnually: 'Apmokama kasmet',
    billedAnnuallyOnly: 'Apmokama tik kasmet',
    billedMonthly: 'Apmokama kas mėnesį',
    billedMonthlyOnly: 'Apmokama tik kas mėnesį',
    cancelFreeTrial: 'Atšaukti nemokamą bandomąjį laikotarpį',
    cancelFreeTrialAccessUntil:
      "Jūsų bandomasis laikotarpis veiks iki {{ date | longDate('lt-LT') }}. Po to prarasite prieigą prie bandomojo laikotarpio funkcijų. Jums nebus taikomas mokestis.",
    cancelFreeTrialTitle: 'Atšaukti nemokamą bandomąjį laikotarpį planui {{plan}}?',
    cancelSubscription: 'Atšaukti prenumeratą',
    cancelSubscriptionAccessUntil:
      "Galite toliau naudotis '{{plan}}' funkcijomis iki {{ date | longDate('lt-LT') }}, po to prieigos nebeturėsite.",
    cancelSubscriptionNoCharge: 'Už šią prenumeratą jums nebus taikomas mokestis.',
    cancelSubscriptionPastDue:
      'Jūsų prenumerata baigsis nedelsiant ir prarasite prieigą prie visų plano funkcijų. Jums reikės sumokėti pradelstą sumą kitos prenumeratos metu.',
    cancelSubscriptionTitle: 'Atšaukti prenumeratą {{plan}}?',
    cannotSubscribeMonthly:
      'Negalite užsiprenumeruoti šio plano mokėdami kas mėnesį. Norėdami užsiprenumeruoti šį planą, turite pasirinkti mokėjimą kasmet.',
    cannotSubscribeUnrecoverable:
      'Negalite užsiprenumeruoti šio plano. Jūsų dabartinė prenumerata yra brangesnė nei šis planas.',
    checkout: {
      addPromoCode: 'Pridėti reklamos kodą',
      applyPromoCode: 'Taikyti',
      description__paymentSuccessful: 'Mokėjimas sėkmingai atliktas.',
      description__subscriptionSuccessful: 'Jūsų nauja prenumerata paruošta.',
      discount: 'Nuolaida',
      downgradeNotice:
        'Išsaugosite dabartinę prenumeratą ir jos funkcijas iki atsiskaitymo ciklo pabaigos, tada būsite perkelti į šią prenumeratą.',
      emailForm: {
        subtitle: 'Prieš užbaigdami pirkimą, turite pridėti el. pašto adresą, kuriuo bus siunčiami kvitai.',
        title: 'Pridėti el. pašto adresą',
      },
      lineItems: {
        title__freeTrialEndsAt: 'Bandomasis laikotarpis baigiasi',
        title__paymentMethod: 'Mokėjimo būdas',
        title__statementId: 'Išrašo ID',
        title__subscriptionBegins: 'Prenumerata prasideda',
        title__totalPaid: 'Iš viso sumokėta',
      },
      pastDueNotice: 'Jūsų ankstesnė prenumerata buvo pradelsta, be mokėjimo.',
      perMonth: 'per mėnesį',
      promoCodePlaceholder: 'Įveskite reklamos kodą',
      removePromoCode: 'Pašalinti reklamos kodą',
      title: 'Atsiskaitymas',
      title__paymentSuccessful: 'Mokėjimas sėkmingai atliktas!',
      title__subscriptionSuccessful: 'Pavyko!',
      title__trialSuccess: 'Bandomasis laikotarpis sėkmingai pradėtas!',
      totalDueAfterTrial: 'Iš viso mokėtina, kai bandomasis laikotarpis baigsis po {{days}} dienų',
      totalDuePerPeriod: 'Iš viso mokėtina per laikotarpį',
    },
    credit: 'Kreditas',
    creditRemainder: 'Kreditas už likusį dabartinės prenumeratos laikotarpį.',
    defaultFreePlanActive: "Šiuo metu esate nemokamame plane",
    discountAmount: '{{amount}} nuolaida',
    discountCyclesRemaining: 'Liko {{cycles}} {{period}}',
    discountDuration: '{{amount}} nuolaida pirmiems {{cycles}} {{period}}',
    free: 'Nemokama',
    getStarted: 'Pradėti',
    highlightedPlanBadge: 'Populiarus',
    keepFreeTrial: 'Išsaugoti nemokamą bandomąjį laikotarpį',
    keepSubscription: 'Išsaugoti prenumeratą',
    manage: 'Tvarkyti',
    manageSubscription: 'Tvarkyti prenumeratą',
    month: 'Mėnuo',
    monthAbbreviation: 'mėn.',
    monthPerUnit: 'Mėnuo už {{unitName}}',
    monthly: 'Kas mėnesį',
    months: 'Mėnesiai',
    pastDue: 'Pradelstas',
    pay: 'Mokėti {{amount}}',
    payerCreditRemainder: 'Kreditas iš sąskaitos likučio.',
    paymentMethod: {
      applePayDescription: {
        annual: 'Metinis mokėjimas',
        monthly: 'Mėnesinis mokėjimas',
      },
      dev: {
        anyNumbers: 'Bet kokie skaičiai',
        cardNumber: 'Kortelės numeris',
        cvcZip: 'CVC, pašto kodas',
        developmentMode: 'Kūrimo režimas',
        expirationDate: 'Galiojimo data',
        testCardInfo: 'Bandomosios kortelės informacija',
      },
    },
    paymentMethods__label: 'Mokėjimo būdai',
    pricingTable: {
      billingCycle: 'Atsiskaitymo ciklas',
      included: 'Įtraukta',
      seatCost: {
        additionalSeats: '({{additionalTierFeePerBlockAmount}}/{{periodAbbreviation}} už papildomas)',
        freeUpToSeats: 'Nemokamai iki {{endsAfterBlock}} vietų',
        includedSeats: 'Įtraukta {{includedSeats}} vietų',
        perSeat: '{{feePerBlockAmount}}/{{periodAbbreviation}} už vietą',
        tooltip: {
          additionalSeatsEach: 'Papildomos vietos kainuoja {{feePerBlockAmount}}/{{period}} kiekviena.',
          firstSeatsIncludedInPlan: 'Pirmosios {{endsAfterBlock}} vietos įtrauktos į planą.',
          freeForUpToSeats: 'Nemokamai iki {{endsAfterBlock}} vietų.',
        },
        unlimitedSeats: 'Neribotas vietų skaičius',
        upToSeats: 'Iki {{endsAfterBlock}} vietų',
      },
    },
    proratedDiscount: 'Proporcinga nuolaida',
    prorationCredit: 'Proporcingas kreditas',
    reSubscribe: 'Prenumeruoti iš naujo',
    seatBreakdownIncludedPlural: '{{chargeable}} vietų po {{rate}}/mėn. ({{totalSeats}} iš viso - {{included}} įtraukta)',
    seatBreakdownIncludedSingular: '1 vieta po {{rate}}/mėn. ({{totalSeats}} iš viso - {{included}} įtraukta)',
    seatBreakdownPlural: '{{chargeable}} vietų po {{rate}}/mėn.',
    seatBreakdownSingular: '1 vieta po {{rate}}/mėn.',
    seats: 'Vietos',
    seatsWithLimit: 'Vietos (iki {{limit}})',
    seeAllFeatures: 'Peržiūrėti visas funkcijas',
    startFreeTrial: 'Pradėti nemokamą bandomąjį laikotarpį',
    startFreeTrial__days: 'Pradėti {{days}} dienų nemokamą bandomąjį laikotarpį',
    subscribe: 'Prenumeruoti',
    subscriptionDetails: {
      beginsOn: 'Prasideda',
      currentBillingCycle: 'Dabartinis atsiskaitymo ciklas',
      endsOn: 'Baigiasi',
      firstPaymentAmount: 'Pirmojo mokėjimo suma',
      firstPaymentOn: 'Pirmasis mokėjimas',
      nextPaymentAmount: 'Kito mokėjimo suma',

      nextPaymentOn: 'Kitas mokėjimas',
      pastDueAt: 'Pradelsta',
      renewsAt: 'Atnaujinama',
      subscribedOn: 'Prenumeruota',
      title: 'Prenumerata',
      trialEndsOn: 'Bandomasis laikotarpis baigiasi',
      trialStartedOn: 'Bandomasis laikotarpis prasidėjo',
    },
    subtotal: 'Tarpinė suma',
    subtotalRenewal: 'Tarpinė suma per laikotarpį',
    switchPlan: 'Pereiti prie šio plano',
    switchToAnnual: 'Pereiti prie metinio plano',
    switchToAnnualWithAnnualPrice: 'Pereiti prie metinio plano {{price}} / metus',
    switchToMonthly: 'Pereiti prie mėnesinio plano',
    switchToMonthlyWithPrice: 'Pereiti prie mėnesinio plano {{price}} / mėnesį',
    totalDue: 'Visa mokėtina suma',
    totalDuePerPeriod: 'Visa suma per laikotarpį',
    totalDueToday: 'Visa mokėtina suma šiandien',
    viewFeatures: 'Peržiūrėti funkcijas',
    viewPayment: 'Peržiūrėti mokėjimą',
    year: 'Metai',
    yearAbbreviation: 'm.',
    yearPerUnit: 'Metai per {{unitName}}',
    years: 'Metai',
  },
  configureSSO: {
    activate: {
      activateButton: 'Aktyvuoti SSO',
      activeSubtitle: 'Kiekvienas, kuris prisijungia su {{domain}}, turi naudoti jūsų tapatybės teikėją.',
      activeTitle: 'SSO ryšys aktyvus',
      doneButton: 'Atlikta',
      skipButton: 'Praleisti kol kas',
      subtitle:
        'Jūsų SSO ryšys paruoštas. Suaktyvinus, kiekvienas, kuris prisijungia su {{domain}}, turi naudoti jūsų tapatybės teikėją.',
      title: 'SSO ryšys sukonfigūruotas',
    },
    changeProviderDialog: {
      cancelButton: 'Atšaukti',
      confirmButton: 'Pakeisti teikėją',
      subtitle: 'Perėjus prie {{provider}} bus pašalintas jūsų {{currentProvider}} ryšys ir reikės naujos sąrankos.',
      title: 'Pakeisti teikėją į {{provider}}',
    },
    configureStep: {
      activeConnectionWarning: {
        dismiss: 'Atmesti',
        title:
          'Šis ryšys aktyvus. Išsaugojus pakeitimus jie įsigalioja nedelsiant ir gali sutrikdyti dabartinių narių prisijungimą.',
      },
      attributeMappingTable: {
        badges: {
          optional: 'Neprivaloma',
          required: 'Privaloma',
        },
      },
      oidcCustom: {
        credentialsStep: {
          clientId: {
            label: 'Kliento ID',
            placeholder: 'Įklijuokite kliento ID čia...',
          },
          clientSecret: {
            label: 'Kliento paslaptis',
            placeholder: 'Įklijuokite kliento paslaptį čia...',
          },
          headerSubtitle: 'Pridėkite savo programos kredencialus',
          paragraph: 'Savo tapatybės teikėjo OIDC programoje gaukite šias reikšmes.',
        },
        endpointsStep: {
          discoveryUrl: {
            description:
              'Savo tapatybės teikėjo OIDC programoje gaukite atradimo galinį tašką. Įklijuokite jį žemiau.',
            label: 'Atradimo galinis taškas',
            placeholder: 'Įklijuokite URL čia...',
          },
          headerSubtitle: 'Pridėkite savo tapatybės teikėjo galinius taškus',
          manual: {
            authUrl: {
              label: 'Autorizacijos URL',
              placeholder: 'Įklijuokite URL čia...',
            },
            description: 'Savo tapatybės teikėjo OIDC programoje gaukite šias reikšmes.',
            tokenUrl: {
              label: 'Žetono URL',
              placeholder: 'Įklijuokite URL čia...',
            },
            userInfoUrl: {
              label: 'Vartotojo informacijos URL',
              placeholder: 'Įklijuokite URL čia...',
            },
          },
          modes: {
            ariaLabel: 'OIDC galinio taško konfigūravimo būdas',
            discoveryUrl: 'Pridėti per atradimo galinį tašką',
            manual: 'Konfigūruoti rankiniu būdu',
          },
        },
        mainHeaderTitle: 'Konfigūruokite savo tapatybės teikėją',
        redirectUriStep: {
          claims: {
            description: 'Įsitikinkite, kad jūsų ID žetonas apima šiuos teiginius:',
            table: {
              columns: {
                attribute: 'Clerk atributas',
                claim: 'ID žetono teiginys',
              },
              rows: {
                email: {
                  attribute: 'Pagrindinis el. paštas',
                },
                firstName: {
                  attribute: 'Vardas',
                },
                lastName: {
                  attribute: 'Pavardė',
                },
                subject: {
                  attribute: 'Išorinis vartotojo ID',
                },
              },
            },
          },
          headerSubtitle: 'Sukurkite naują OIDC programą savo tapatybės teikėjo valdymo skydelyje',
          paragraph:
            'Savo tapatybės teikėjo valdymo skydelyje sukurkite naują OIDC programą, palaikančią autorizacijos kodo suteikimo tipą, ir naudokite šį nukreipimo URI:',
          redirectUri: {
            label: 'Leidžiamas nukreipimo URI',
          },
        },
      },
      samlCustom: {
        assignUsersStep: {
          headerSubtitle: 'Priskirkite vartotojus arba grupes savo SAML programai',
          paragraph: 'Priskirkite vartotojus arba grupes savo programai, kad jie galėtų prisijungti naudodami SSO.',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attributeName: 'Atributo pavadinimas',
              userAttribute: 'Vartotojo atributas',
            },
            rows: {
              email: {
                attributeName: 'Pagrindinis el. paštas',
                userAttribute: 'mail',
              },
              firstName: {
                attributeName: 'Vardas',
                userAttribute: 'firstName',
              },
              lastName: {
                attributeName: 'Pavardė',
                userAttribute: 'lastName',
              },
            },
          },
          headerSubtitle: 'Susiekite vartotojo atributus iš savo tapatybės teikėjo su savo programa.',
          paragraph: 'Jūsų SAML atsakymas turi apimti šiuos atributus:',
        },
        createAppStep: {
          createAppInstructions: {
            paragraph:
              'Savo tapatybės teikėjo valdymo skydelyje sukurkite naują SAML 2.0 programą ir naudokite šiuos paslaugų teikėjo duomenis:',
          },
          headerSubtitle: 'Sukurkite naują SAML programą savo tapatybės teikėjo valdymo skydelyje',
          serviceProviderFields: {
            acsUrl: {
              label: 'Teiginių vartojimo paslaugos (ACS) URL',
            },
            spEntityId: {
              label: 'Subjekto ID',
            },
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Konfigūruokite tapatybės teikėjo metaduomenis',
          manual: {
            description: 'Savo tapatybės teikėjo SAML programoje gaukite šias reikšmes.',
            issuer: {
              label: 'Išdavėjas',
              placeholder: 'Įklijuokite URL čia...',
            },
            signOnUrl: {
              label: 'Prisijungimo URL',
              placeholder: 'Įklijuokite URL čia...',
            },
            signingCertificate: {
              fileUploaded: 'Failas įkeltas',
              label: 'Pasirašymo sertifikatas',
              removeFile: 'Pašalinti failą',
              replaceFile: 'Pakeisti failą',
              uploadFile: 'Įkelti failą',
            },
          },
          metadataUrl: {

            description: 'Savo tapatybės teikėjo SAML programoje paimkite metaduomenų URL. Įklijuokite jį žemiau.',
            label: 'Metaduomenų URL',
            placeholder: 'Įklijuokite URL čia...',
          },
          modes: {
            ariaLabel: 'Konfigūracija ',
            manual: 'Konfigūruoti rankiniu būdu',
            metadataUrl: 'Pridėti naudojant metaduomenis',
          },
        },
        mainHeaderTitle: 'Konfigūruokite savo tapatybės teikėją',
      },
      samlGoogle: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              appAttribute: 'Programos atributas',
              googleAttribute: '„Google“ atributas',
            },
            rows: {
              email: {
                appAttribute: 'email',
                googleAttribute: 'Pagrindinis el. paštas',
              },
              firstName: {
                appAttribute: 'firstName',
                googleAttribute: 'Vardas',
              },
              lastName: {
                appAttribute: 'lastName',
                googleAttribute: 'Pavardė',
              },
            },
          },
          headerSubtitle: 'Susiekite naudotojo atributus iš „Google Workspace“ su savo programa',
          paragraph: 'Tikimės, kad jūsų SAML atsakymas grąžins naudotojo el. pašto adresą, vardą ir pavardę.',
          step1: '„<bold>Google Admin Console</bold>“ raskite skyrių <bold>Attributes</bold>.',
          step2:
            'Kiekvienam atributui pasirinkite <bold>Add mapping</bold> ir įveskite toliau nurodytus „Google“ bei programos atributus:',
        },
        configureUserAccess: {
          assignUsersInstructions: {
            paragraph1:
              "Kai konfigūracija „Google“ bus baigta, būsite nukreipti į programos apžvalgos puslapį.",
            paragraph2:
              '„Google“ šių pakeitimų paskelbimas gali užtrukti iki 24 valandų. Ryšys liks neaktyvus, kol jie įsigalios.',
            step1: 'Atidarykite skyrių <bold>User access</bold>.',
            step2: 'Pasirinkite <bold>ON for everyone.</bold>',
            step3: 'Pasirinkite <bold>Save</bold>.',
          },
          headerSubtitle: 'Įjunkite savo „Google Workspace“ SAML programą',
        },
        createAppStep: {
          createAppInstructions: {
            step1: 'Šoninėje naršymo juostoje, skiltyje <bold>Apps</bold>, pasirinkite <bold>Web and mobile apps.</bold>',
            step2: 'Pasirinkite <bold>Add app</bold>, tada <bold>Add custom SAML app.</bold>',
            step3: 'Įveskite <bold>App name.</bold>',
            step4: 'Pasirinkite <bold>Continue</bold>.',
            title: '„Google Workspace“ sukurkite naują SAML programą:',
          },
          headerSubtitle: 'Sukurkite naują SAML programą „Google Workspace“',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Pridėkite savo „Google Workspace“ programos metaduomenis',
          manual: {
            description: 'Savo „Google Workspace“ programoje paimkite šias reikšmes.',
            issuer: {
              label: 'Objekto ID',
              placeholder: 'Įklijuokite URL čia...',
            },
            signOnUrl: {
              label: 'SSO URL',
              placeholder: 'Įklijuokite URL čia...',
            },
            signingCertificate: {
              fileUploaded: 'Failas įkeltas',
              label: 'Pasirašymo sertifikatas',
              removeFile: 'Pašalinti failą',
              replaceFile: 'Pakeisti failą',
              uploadFile: 'Įkelti failą',
            },
          },
          metadataFile: {
            description: 'Savo „Google Workspace“ programoje atsisiųskite IdP metaduomenis ir įkelkite juos žemiau.',
            fileUploaded: 'Failas įkeltas',
            label: 'IdP metaduomenys',
            removeFile: 'Pašalinti failą',
            replaceFile: 'Pakeisti failą',
            uploadFile: 'Įkelti failą',
          },
          modes: {
            ariaLabel: 'Konfigūracija',
            manual: 'Konfigūruoti rankiniu būdu',
            metadataFile: 'Pridėti naudojant metaduomenis',
          },
        },
        mainHeaderTitle: 'Konfigūruokite „Google Workspace“',
        serviceProviderStep: {
          headerSubtitle: 'Konfigūruokite paslaugos teikėją',
          nameIdInstructions: {
            step1:
              'Skyriuje <bold>Name ID</bold> atidarykite išskleidžiamąjį <bold>Name ID</bold> formato sąrašą ir pasirinkite <bold>Email</bold>.',
            step2: 'Pasirinkite <bold>Continue</bold>',
          },
          paragraph:
            'Norėdami sukonfigūruoti savo paslaugos teikėją, turite pridėti šiuos du laukus prie savo „Google Workspace“ SAML programos:',
          serviceProviderFields: {
            acsUrl: {
              label: 'ACS URL',
            },
            spEntityId: {
              label: 'Objekto ID',
            },
          },
          title: 'Konfigūruokite paslaugos teikėją',
        },
      },
      samlMicrosoft: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attribute: 'Atributas',
              claimName: 'Claim pavadinimas',
              value: 'Reikšmė',
            },
            copyClaimName: 'Kopijuoti claim pavadinimą',
            copyClaimNameCopied: 'Nukopijuota',
            rows: {
              email: {
                attribute: 'El. pašto adresas',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
                value: 'user.mail',
              },
              firstName: {
                attribute: 'Vardas',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
                value: 'user.givenname',
              },
              lastName: {
                attribute: 'Pavardė',
                claimName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
                value: 'user.surname',
              },
            },
          },
          headerSubtitle: 'Nustatykite atributus, kuriuos „Microsoft Entra“ įtraukia į jūsų SAML atsakymą',
          step1: 'Puslapyje <bold>SAML-based Sign-on</bold> raskite skyrių <bold>Attributes & Claims</bold>.',
          step2: 'Pasirinkite <bold>Edit.</bold>',
          title: 'Jūsų SAML atsakyme turi būti šie atributai:',
        },
        createAppStep: {
          assignUsersInstructions: {
            step1: 'Skyriuje <bold>Getting Started</bold> pasirinkite <bold>Assign users and groups.</bold>',
            step2: "Pasirinkite <bold>Add user/group.</bold> Būsite nukreipti į <bold>Add Assignment page.</bold>",
            step3: 'Pasirinkite <bold>None Selected link.</bold>',
            step4:
              "Puslapio apačioje pasirinkite <bold>Select</bold>. Būsite nukreipti į <bold>Add Assignment</bold> puslapį.",
            step5: 'Pasirinkite <bold>Assign</bold>',
            title: 'Priskirkite naudotojus arba grupes „Microsoft“',
          },
          createAppInstructions: {
            step1: 'Prisijunkite prie „Microsoft Azure“ portalo ir eikite į <bold>Enterprise applications.</bold>',
            step2:
              "Spustelėkite <bold>New application.</bold> Būsite nukreipti į <bold>Browse Microsoft Entra Gallery</bold> puslapį.",
            step3: 'Pasirinkite <bold>Create your own application.</bold>',
            step4: {
              label: 'Atsidariusiame modale:',
              subSteps: {
                appName: 'Įveskite savo programos pavadinimą.',
                create: 'Pasirinkite <bold>Create</bold>.',
                nonGallery:
                  "Pasirinkite <bold>Integrate any other application you don't find in the gallery (Non-gallery)</bold>.",
              },
            },
            title: 'Sukurkite naują įmonės programą',
          },
          headerSubtitle: 'Sukurkite naują įmonės programą savo „Azure“ portale',
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Pridėkite savo „Microsoft Entra“ programos metaduomenis',
          manual: {
            description:
              'Puslapyje <bold>SAML-based Sign-on</bold> raskite skyrių <bold>SAML Certificates</bold>. Paimkite šias reikšmes ir pridėkite jas žemiau.',
            issuer: {
              label: 'Išdavėjas',
              placeholder: 'Įklijuokite URL čia...',
            },
            signOnUrl: {
              label: 'Prisijungimo URL',
              placeholder: 'Įklijuokite URL čia...',
            },
            signingCertificate: {
              fileUploaded: 'Failas įkeltas',
              label: 'Pasirašymo sertifikatas',

              removeFile: 'Pašalinti failą',
              replaceFile: 'Pakeisti failą',
              uploadFile: 'Įkelti failą',
            },
          },
          metadataUrl: {
            description:
              'Puslapyje <bold>SAML pagrindu paremtas prisijungimas</bold> raskite skyrių <bold>SAML sertifikatai</bold> ir nukopijuokite <bold>App Federation Metadata Url</bold>. Įklijuokite žemiau.',
            label: 'Metaduomenų URL',
            placeholder: 'Įklijuokite URL čia...',
          },
          modes: {
            ariaLabel: 'Konfigūracija ',
            manual: 'Konfigūruoti rankiniu būdu',
            metadataUrl: 'Pridėti per metaduomenis',
          },
        },
        mainHeaderTitle: 'Konfigūruoti „Microsoft Entra“',
        serviceProviderStep: {
          headerSubtitle: 'Pridėti paslaugų teikėjo konfigūraciją prie „Microsoft Entra“',
          serviceProviderFields: {
            acsUrl: {
              label: 'Atsakymo URL (Assertion Consumer Service URL)',
            },
            spEntityId: {
              label: 'Identifikatorius (entiteto ID)',
            },
          },
          step1: 'Šoninėje naršymo juostoje atidarykite išskleidžiamąjį sąrašą <bold>Valdyti</bold> ir pasirinkite vienkartinį prisijungimą.',
          step2: 'Skyriuje <bold>Pasirinkite vienkartinio prisijungimo metodą</bold> pasirinkite <bold>SAML</bold>.',
          step3: 'Raskite skyrių <bold>Pagrindinė SAML konfigūracija</bold>.',
          step4: 'Pasirinkite <bold>Redaguoti</bold>. Atsidarys skydelis <bold>Pagrindinė SAML konfigūracija</bold>.',
          step5:
            'Nukopijuokite šias reikšmes į <bold>Identifikatorius (entiteto ID)</bold> ir <bold>Atsakymo URL (ACS URL)</bold>:',
          step6: 'Skydelio viršuje pasirinkite <bold>Išsaugoti</bold>. Uždarykite skydelį.',
          title: 'Pridėti paslaugų teikėjo duomenis',
        },
      },
      samlOkta: {
        assignUsersStep: {
          assignUsersInstructions: {
            paragraph: 'Priskirkite vartotojus arba grupes savo „Okta“ programai, kad jie galėtų prisijungti naudodami SSO.',
            step1: '„Okta“ skydelyje pasirinkite skirtuką <bold>Priskyrimai</bold>.',
            step2:
              'Atidarykite išskleidžiamąjį sąrašą <bold>Priskirti</bold> ir pasirinkite <bold>Priskirti žmonėms</bold> arba <bold>Priskirti grupėms</bold>.',
            step3: 'Ieškokite vartotojo arba grupės, kurią norite priskirti.',
            step4: 'Šalia vartotojo arba grupės spustelėkite <bold>Priskirti</bold>.',
            step5: 'Spustelėkite <bold>Atlikta.</bold>',
          },
          headerSubtitle: 'Priskirkite vartotojus savo „Okta“ programai',
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              expression: 'Išraiška',
              name: 'Atributo pavadinimas',
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
          headerSubtitle: 'Nustatykite atributus, kuriuos „Okta“ įtraukia į jūsų SAML atsakymą',
          paragraph: 'Jūsų SAML atsakyme turi būti šie atributai:',
          step1: '„Okta“ skydelyje raskite skyrių <bold>Atributų teiginiai</bold>.',
          step2:
            'Kiekvienam atributui pasirinkite <bold>Pridėti išraišką</bold> ir įveskite šias pavadinimų bei išraiškų poras:',
        },
        createAppStep: {
          completeSamlIntegrationInstructions: {
            step1: 'Skiltyje <bold>Atsiliepimai</bold> pasirinkite <bold>Tai vidinė programa, kurią sukūrėme mes.</bold>',
            step2: 'Spustelėkite <bold>Baigti</bold>, kad užbaigtumėte integraciją.',
            title: 'Užbaikite SAML integraciją',
          },
          createAppInstructions: {
            step1: 'Prisijunkite prie „Okta“ ir eikite į <bold>Administravimas → Programos.</bold>',
            step2: 'Spustelėkite <bold>Sukurti programos integraciją.</bold> ir pasirinkite <bold>SAML 2.0.</bold>',
            step3: 'Užpildykite bendruosius nustatymus. Programos pavadinimas yra būtinas.',
            step4: 'Spustelėkite <bold>Toliau</bold>, kad užbaigtumėte programos kūrimą.',
            title: 'Sukurkite naują SAML programą „Okta“',
          },
          headerSubtitle: 'Sukurkite ir konfigūruokite SAML programą savo „Okta“ skydelyje',
          serviceProviderInstructions: {
            paragraph1:
              "Užbaigę <bold>Bendruosius nustatymus</bold>, pamatysite puslapį <bold>Konfigūruoti SAML</bold>.",
            paragraph2: 'Pridėkite šiuos du laukus prie savo „Okta“ programos, kad sukonfigūruotumėte paslaugų teikėją.',
            serviceProviderFields: {
              acsUrl: {
                label: 'Vienkartinio prisijungimo URL',
              },
              spEntityId: {
                label: 'Auditorijos URI (SP entiteto ID)',
              },
            },
            title: 'Konfigūruoti paslaugų teikėją',
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: 'Pridėti savo „Okta“ programos metaduomenis',
          manual: {
            description: 'Savo „Okta“ SAML programoje eikite į skirtuką <bold>Prisijungimas</bold> ir paimkite šias reikšmes.',
            issuer: {
              label: 'Išdavėjas',
              placeholder: 'Įklijuokite URL čia...',
            },
            signOnUrl: {
              label: 'Prisijungimo URL',
              placeholder: 'Įklijuokite URL čia...',
            },
            signingCertificate: {
              fileUploaded: 'Failas įkeltas',
              label: 'Pasirašymo sertifikatas',
              removeFile: 'Pašalinti failą',
              replaceFile: 'Pakeisti failą',
              uploadFile: 'Įkelti failą',
            },
          },
          metadataUrl: {
            description:
              'Savo „Okta“ SAML programoje eikite į skirtuką <bold>Prisijungimas</bold> ir paimkite metaduomenų URL. Įklijuokite jį žemiau.',
            label: 'Metaduomenų URL',
            placeholder: 'Įklijuokite URL čia...',
          },
          modes: {
            ariaLabel: 'Konfigūracija',
            manual: 'Konfigūruoti rankiniu būdu',
            metadataUrl: 'Pridėti per metaduomenis',
          },
        },
        mainHeaderTitle: 'Konfigūruoti „Okta Workforce“',
      },
      unsupportedProvider: {
        description:
          'Šis tapatybės teikėjas nėra palaikomas šioje „Clerk“ versijoje. Atnaujinkite į naujausią versiją, kad užbaigtumėte jo nustatymą.',
        title: 'Nepalaikomas teikėjas',
      },
    },
    missingManageEnterpriseConnectionsPermission: {
      subtitle: "Susisiekite su savo organizacijos administratoriumi, kad padidintumėte savo teises.",
      title: 'Neturite teisės valdyti vienkartinio prisijungimo (SSO)',
    },
    navbar: {
      title: 'Konfigūruoti vienkartinį prisijungimą (SSO)',
    },
    organizationDomainsStep: {
      domainCard: {
        badge__expired: 'Pasibaigęs',
        badge__unverified: 'Nepatvirtintas',
        badge__verified: 'Patvirtintas',
        expiredAtLabel:
          "Domeno patvirtinimas baigėsi {{ date | shortDate('lt-LT') }}. Patvirtinkite dar kartą, kad sugeneruotumėte naują DNS įrašą.",
        expiredLabel: 'Domeno patvirtinimas baigėsi. Patvirtinkite dar kartą, kad sugeneruotumėte naują DNS įrašą.',
        removeButtonTooltip__lastVerifiedDomain: 'Norint nustatyti SSO, reikia bent vieno patvirtinto domeno.',
        removeButtonTooltip__lastVerifiedDomainActive: 'Norint išlaikyti SSO įjungtą, reikia bent vieno patvirtinto domeno.',
        txtRecord: {
          hostLabel: 'Host / Pavadinimas',
          instructions: "Pridėkite šį TXT įrašą prie savo DNS teikėjo. Mes automatiškai patikrinsime, kai įrašas taps aktyvus.",
          typeLabel: 'Tipas',
          valueLabel: 'Reikšmė',
        },
        verifiedAtLabel: "Patvirtinta {{ date | shortDate('lt-LT') }}",
        verifyAgainButton: 'Patvirtinti dar kartą',
      },
      domainSuggestion: {
        formButtonPrimary__add: 'Pridėti {{domain}}',
        messageLabel: 'Jūsų el. paštas naudoja {{domain}}. Ar norite jį pridėti?',
      },
      formButtonPrimary__add: 'Pridėti',
      formFieldInputPlaceholder__domain: 'Įveskite savo domeną čia ir spustelėkite Pridėti, kad pradėtumėte',
      formFieldLabel__domain: 'Domenas',
      removeDomainDialog: {
        cancelButton: 'Atšaukti',
        removeButton: 'Pašalinti domeną',
        subtitle__active:
          "Ketinate pašalinti {{domain}} iš šio įmonės ryšio. Vartotojai nebegalės prisijungti naudodami {{domain}}.",
        subtitle__inactive: "Ketinate pašalinti {{domain}} iš šio įmonės ryšio.",
        title: 'Domeno šalinimas',
      },
      subtitle: 'Pridėkite ir patvirtinkite domenų, kuriuos jūsų organizacija naudoja prisijungimui, nuosavybę.',
      title: 'Pridėti SSO domenus',
    },
    resetConnectionDialog: {
      cancelButton: 'Atšaukti',
      confirmationFieldLabel: 'Žemiau įveskite "{{name}}", kad tęstumėte',

      confirmationFieldPlaceholder: '{{name}}',
      resetButton: 'Atkurti ryšį',
      subtitle:
        'Ar tikrai norite atkurti ryšį? Šis veiksmas yra negrįžtamas ir turėsite iš naujo sukonfigūruoti visus veiksmus',
      title: 'Atkurti ryšį',
    },
    selectProviderStep: {
      oidc: {
        groupLabel: 'OpenID Connect (OIDC)',
        oidcProvider: 'OIDC teikėjas',
      },
      saml: {
        customSaml: 'Pasirinktinis SAML teikėjas',
        google: 'Google Workspace',
        groupLabel: 'SAML',
        microsoft: 'Microsoft Entra (anksčiau AD)',
        okta: 'Okta Workforce',
      },
      subtitle: "Ryšio duomenis sukonfigūruosite kitame veiksme",
      title: 'Pasirinkite tapatybės teikėją',
      warning: 'Pasirinkus teikėją, jo negalėsite pakeisti, kol konfigūracija nebus baigta',
    },
    testConfigurationStep: {
      error__noSuccessfulTestRun:
        'Prieš tęsdami turite atlikti bent vieną sėkmingą testinį paleidimą. Sugeneruokite testo URL ir užbaikite prisijungimo srautą.',
      subtitle: 'Prisijunkite per testo URL, kad patikrintumėte, ar jūsų SSO ryšys sukonfigūruotas teisingai',
      testResults: {
        actionLabel__refresh: 'Atnaujinti žurnalus',
        empty: {
          subtitle: 'Pasirinkite <bold>Atidaryti testo URL</bold>, kad paleistumėte pirmąjį testą',
          title: 'Nėra testo rezultatų',
        },
        polling: 'Laukiama, kol testo paleidimas bus baigtas…',
        status__failed: 'Nepavyko',
        status__pending: 'Laukiama',
        status__success: 'Sėkminga',
        title: 'Jūsų testo rezultatai',
      },
      testRunDetails: {
        howToFix: {
          actionLabel__viewDocumentation: 'Peržiūrėti dokumentaciją',
          oauth_access_denied: {
            description:
              "Ši klaida atsiranda, kai naudotojas OAuth teikėjo autorizacijos ekrane paspaudė Atšaukti arba Atmesti, arba teikėjas atmetė autorizacijos užklausą. Patikrinkite, ar OAuth programos kredencialai (kliento ID ir kliento paslaptis) yra sukonfigūruoti teisingai.",
          },
          oauth_fetch_user_error: {
            intro: 'Norėdami ištaisyti šią klaidą, atlikite šiuos veiksmus:',
            step1:
              'Patikrinkite, ar OAuth aprėptys, sukonfigūruotos jūsų ryšio nustatymuose, apima būtinus leidimus skaityti naudotojo profilio informaciją.',
            step2: 'Įsitikinkite, kad naudotojo informacijos galinio taško URL yra sukonfigūruotas teisingai.',
          },
          oauth_token_exchange_error: {
            description:
              "Patikrinkite, ar jūsų OAuth programos kliento ID ir kliento paslaptis yra sukonfigūruoti teisingai ir atitinka kredencialus iš jūsų OAuth teikėjo valdymo skydelio.",
          },
          saml_email_address_domain_mismatch: {
            description:
              'Patikrinkite, ar naudotojas prisijungia el. pašto adresu, kuris atitinka vieną iš šiam ryšiui leidžiamų domenų. Jei reikia pridėti papildomų domenų, atnaujinkite leidžiamus domenus ryšio nustatymuose.',
          },
          saml_response_relaystate_missing: {
            description:
              'Patikrinkite, ar jūsų tapatybės teikėjas teisingai grąžina RelayState parametrą, kuris buvo išsiųstas pradinėje užklausoje.',
          },
          saml_user_attribute_missing: {
            intro: 'Norėdami ištaisyti šią klaidą, atlikite šiuos veiksmus:',
            step1: "Atidarykite savo tapatybės teikėjo konfigūracijos valdymo skydelį.",
            step2: "Eikite į savo programos SAML nustatymus arba atributų susiejimo konfigūraciją.",
            step3: "Įsitikinkite, kad atributas 'mail' yra tinkamai susietas su naudotojo el. pašto adreso lauku.",
          },
          sectionTitle: 'Kaip ištaisyti',
        },
        parsedUserInfo: {
          email: 'El. paštas',
          firstName: 'Vardas',
          sectionTitle: 'Nuskaityta naudotojo informacija',
        },
        runDetails: {
          actionLabel__copied: 'Nukopijuota',
          actionLabel__copy: 'Kopijuoti pranešimą',
          errorCode: 'Klaidos kodas',
          fullMessage: 'Visas pranešimas',
          sectionTitle: 'Paleidimo informacija',
          status: 'Būsena',
          timestamp: 'Laiko žyma',
        },
        title: 'Testinis paleidimas',
      },
      testUrl: {
        actionLabel__open: 'Atidaryti testo URL',
      },
      title: 'Patikrinkite savo SSO ryšį',
    },
  },
  createOrganization: {
    formButtonSubmit: 'Sukurti organizaciją',
    invitePage: {
      formButtonReset: 'Praleisti',
    },
    title: 'Sukurti organizaciją',
  },
  dates: {
    lastDay: "Vakar {{ date | timeString('lt-LT') }}",
    next6Days: "{{ date | weekday('lt-LT','long') }} {{ date | timeString('lt-LT') }}",
    nextDay: "Rytoj {{ date | timeString('lt-LT') }}",
    numeric: "{{ date | numeric('lt-LT') }}",
    previous6Days: "Praėjusį {{ date | weekday('lt-LT','long') }} {{ date | timeString('lt-LT') }}",
    sameDay: "Šiandien {{ date | timeString('lt-LT') }}",
  },
  dividerText: 'arba',
  footerActionLink__alternativePhoneCodeProvider: 'Vietoj to siųsti kodą SMS žinute',
  footerActionLink__useAnotherMethod: 'Naudoti kitą metodą',
  footerPageLink__help: 'Pagalba',
  footerPageLink__privacy: 'Privatumas',
  footerPageLink__terms: 'Sąlygos',
  formButtonPrimary: 'Tęsti',
  formButtonPrimary__verify: 'Patvirtinti',
  formFieldAction__forgotPassword: 'Pamiršote slaptažodį?',
  formFieldError__matchingPasswords: 'Slaptažodžiai sutampa.',
  formFieldError__notMatchingPasswords: "Slaptažodžiai nesutampa.",
  formFieldError__verificationLinkExpired: 'Patvirtinimo nuorodos galiojimas baigėsi. Prašome paprašyti naujos nuorodos.',
  formFieldHintText__optional: 'Neprivaloma',
  formFieldHintText__slug: 'Slug yra žmogui suprantamas ID, kuris turi būti unikalus. Jis dažnai naudojamas URL adresuose.',
  formFieldInputPlaceholder__apiKeyDescription: 'Paaiškinkite, kodėl kuriate šį raktą',
  formFieldInputPlaceholder__apiKeyExpirationDate: 'Pasirinkite datą',
  formFieldInputPlaceholder__apiKeyName: 'Įveskite savo slaptojo rakto pavadinimą',
  formFieldInputPlaceholder__backupCode: 'Įveskite atsarginį kodą',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Ištrinti paskyrą',
  formFieldInputPlaceholder__emailAddress: 'Įveskite savo el. pašto adresą',
  formFieldInputPlaceholder__emailAddress_username: 'Įveskite el. paštą arba naudotojo vardą',
  formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
  formFieldInputPlaceholder__firstName: 'Vardas',
  formFieldInputPlaceholder__lastName: 'Pavardė',
  formFieldInputPlaceholder__organizationDomain: 'example.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'you@example.com',
  formFieldInputPlaceholder__organizationName: 'Organizacijos pavadinimas',
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  formFieldInputPlaceholder__password: 'Įveskite savo slaptažodį',
  formFieldInputPlaceholder__phoneNumber: 'Įveskite savo telefono numerį',
  formFieldInputPlaceholder__signUpPassword: 'Sukurkite slaptažodį',
  formFieldInputPlaceholder__username: 'Įveskite savo naudotojo vardą',
  formFieldInput__emailAddress_format: 'Pavyzdinis formatas: name@example.com',
  formFieldLabel__apiKey: 'API raktas',
  formFieldLabel__apiKeyDescription: 'Aprašymas',
  formFieldLabel__apiKeyExpiration: 'Galiojimo pabaiga',
  formFieldLabel__apiKeyName: 'Slaptojo rakto pavadinimas',
  formFieldLabel__automaticInvitations: 'Įjungti automatinius kvietimus šiam domenui',
  formFieldLabel__backupCode: 'Atsarginis kodas',
  formFieldLabel__confirmDeletion: 'Patvirtinimas',
  formFieldLabel__confirmPassword: 'Patvirtinkite slaptažodį',
  formFieldLabel__currentPassword: 'Dabartinis slaptažodis',
  formFieldLabel__emailAddress: 'El. pašto adresas',
  formFieldLabel__emailAddress_username: 'El. pašto adresas arba naudotojo vardas',
  formFieldLabel__emailAddresses: 'El. pašto adresai',
  formFieldLabel__firstName: 'Vardas',
  formFieldLabel__lastName: 'Pavardė',
  formFieldLabel__newPassword: 'Naujas slaptažodis',
  formFieldLabel__organizationDomain: 'Domenas',
  formFieldLabel__organizationDomainDeletePending: 'Ištrinti laukiančius kvietimus ir pasiūlymus',
  formFieldLabel__organizationDomainEmailAddress: 'Patvirtinimo el. pašto adresas',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Įveskite el. pašto adresą šiame domene, kad gautumėte kodą ir patvirtintumėte šį domeną.',
  formFieldLabel__organizationName: 'Pavadinimas',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Prisijungimo rakto pavadinimas',
  formFieldLabel__password: 'Slaptažodis',
  formFieldLabel__phoneNumber: 'Telefono numeris',
  formFieldLabel__role: 'Rolė',
  formFieldLabel__signOutOfOtherSessions: 'Atsijungti nuo visų kitų įrenginių',
  formFieldLabel__username: 'Naudotojo vardas',
  identityPreviewEditButton__emailAddress: 'Redaguoti el. pašto adresą',
  identityPreviewEditButton__identifier: 'Redaguoti identifikatorių',
  identityPreviewEditButton__phoneNumber: 'Redaguoti telefono numerį',
  impersonationFab: {
    action__signOut: 'Atsijungti',
    title: 'Prisijungta kaip {{identifier}}',
  },
  lastAuthenticationStrategy: 'Paskutinį kartą naudota',
  maintenanceMode:
    "Šiuo metu atliekame techninės priežiūros darbus, bet nesijaudinkite, tai neturėtų užtrukti ilgiau nei kelias minutes.",
  membershipRole__admin: 'Administratorius',
  membershipRole__basicMember: 'Narys',
  membershipRole__guestMember: 'Svečias',
  oauthConsent: {
    action__allow: 'Leisti',
    action__deny: 'Atmesti',
    offlineAccessNotice: " Liksite prisijungę, kol neatsijungsite arba neatšauksite prieigos.",
    redirectNotice: 'Jei leisite prieigą, ši programa nukreips jus į {{domainAction}}.',
    redirectUriModal: {
      subtitle: 'Įsitikinkite, kad pasitikite {{applicationName}} ir kad šis URL priklauso {{applicationName}}.',
      title: 'Peradresavimo URL',
    },
    scopeList: {
      privateMetadata: 'Jūsų privati metaduomenų informacija, nustatyta {{applicationName}}, kuri gali apimti slaptą informaciją',
      title: 'Tai suteiks {{applicationName}} prieigą prie:',

    },
    subtitle: 'nori pasiekti {{applicationName}} {{identifier}} vardu',
    viewFullUrl: 'Peržiūrėti visą URL',
    warning:
      'Įsitikinkite, kad pasitikite {{applicationName}} ({{domainAction}}). Gali būti, kad šiai svetainei ar programai perduodate neskelbtinus duomenis.',
  },
  oauthDeviceVerification: {
    action__tryAnotherCode: 'Įveskite kitą kodą',
    confirmation: {
      action__approve: 'Patvirtinti',
      action__deny: 'Atmesti',
      scopeListTitle: 'Tai suteiks {{applicationName}} prieigą prie:',
      subtitle: 'Patvirtinkite šią užklausą {{identifier}}',
      title: 'Leisti {{applicationName}} pasiekti jūsų paskyrą?',
      warning: 'Patvirtinkite šią užklausą tik tuo atveju, jei ją inicijavote kitame įrenginyje.',
    },
    error: {
      expiredSubtitle: 'Pradėkite iš naujo savo įrenginyje.',
      expiredTitle: 'Šio kodo galiojimas baigėsi',
      genericSubtitle: 'Patikrinkite ryšį ir bandykite dar kartą.',
      genericTitle: 'Nepavyko patvirtinti šio kodo',
      invalidCode: 'Įveskite tinkamą 8 simbolių kodą.',
      rateLimitedSubtitle: 'Palaukite prieš bandydami kitą kodą.',
      rateLimitedTitle: 'Per daug bandymų',
      unknownCode: "Tokio kodo neradome. Patikrinkite jį ir bandykite dar kartą.",
    },
    start: {
      action__continue: 'Tęsti',
      subtitle: 'Įveskite kodą, rodomą įrenginyje arba programoje, kurią norite autorizuoti.',
      title: 'Patvirtinkite įrenginį',
      userCodeLabel: 'Įrenginio kodas',
    },
    status: {
      alreadyApprovedSubtitle: 'Norėdami tęsti, grįžkite prie savo įrenginio.',
      alreadyApprovedTitle: "Jūs tai patvirtinote",
      alreadyDecidedSubtitle: 'Sprendimas priimtas kitur. Grįžkite prie savo įrenginio.',
      alreadyDecidedTitle: 'Ši užklausa jau buvo užbaigta',
      alreadyDeniedSubtitle: 'Jei norite bandyti dar kartą, pradėkite iš naujo savo įrenginyje.',
      alreadyDeniedTitle: 'Ši užklausa buvo atmesta',
      approvedSubtitle: 'Patvirtinote šią užklausą. Norėdami tęsti, grįžkite prie savo įrenginio.',
      approvedTitle: 'Įrenginys patvirtintas',
      consumedSubtitle: 'Jūsų įrenginys autorizuotas. Galite uždaryti šį langą.',
      consumedTitle: 'Šis kodas jau buvo panaudotas',
      deniedSubtitle: 'Atmetėte šią užklausą. Grįžkite prie savo įrenginio.',
      deniedTitle: 'Prieiga atmesta',
    },
  },
  organizationList: {
    action__createOrganization: 'Sukurti organizaciją',
    action__invitationAccept: 'Prisijungti',
    action__suggestionsAccept: 'Prašyti prisijungti',
    createOrganization: 'Sukurti organizaciją',
    invitationAcceptedLabel: 'Prisijungta',
    subtitle: 'norėdami pereiti prie {{applicationName}}',
    suggestionsAcceptedLabel: 'Laukiama patvirtinimo',
    title: 'Pasirinkite paskyrą',
    titleWithoutPersonal: 'Pasirinkite organizaciją',
  },
  organizationProfile: {
    apiKeysPage: {
      title: 'API raktai',
    },
    badge__automaticInvitation: 'Automatiniai pakvietimai',
    badge__automaticSuggestion: 'Automatiniai pasiūlymai',
    badge__enterpriseSso: 'Enterprise SSO',
    badge__manualInvitation: 'Be automatinio registravimo',
    badge__unverified: 'Nepatvirtinta',
    billingPage: {
      accountCreditsSection: {
        title: 'Paskyros kreditai',
        viewHistory: 'Peržiūrėti kreditų istoriją',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Suma',
        tableHeader__date: 'Data',
        title: 'Paskyros kreditų istorija',
      },
      paymentHistorySection: {
        empty: 'Nėra mokėjimų istorijos',
        notFound: 'Mokėjimo bandymas nerastas',
        tableHeader__amount: 'Suma',
        tableHeader__date: 'Data',
        tableHeader__status: 'Būsena',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Padaryti numatytuoju',
        actionLabel__remove: 'Pašalinti',
        add: 'Pridėti naują mokėjimo būdą',
        addSubtitle: 'Prie savo paskyros pridėkite naują mokėjimo būdą.',
        cancelButton: 'Atšaukti',
        formButtonPrimary__add: 'Pridėti mokėjimo būdą',
        formButtonPrimary__pay: 'Mokėti {{amount}}',
        payWithTestCardButton: 'Mokėti bandomąja kortele',
        removeMethod: {
          messageLine1: '{{identifier}} bus pašalintas iš šios paskyros.',
          messageLine2:
            'Nebegalėsite naudoti šio mokėjimo būdo, o nuo jo priklausančios pasikartojančios prenumeratos nustos veikti.',
          successMessage: '{{paymentMethod}} buvo pašalintas iš jūsų paskyros.',
          title: 'Pašalinti mokėjimo būdą',
        },
        title: 'Mokėjimo būdai',
      },
      start: {
        headerTitle__payments: 'Mokėjimai',
        headerTitle__plans: 'Planai',
        headerTitle__statements: 'Išrašai',
        headerTitle__subscriptions: 'Prenumerata',
      },
      statementsSection: {
        empty: 'Nėra rodomų išrašų',
        itemCaption__paidForPlan: 'Apmokėta už {{plan}} {{period}} planą',
        itemCaption__payerCredit: 'Kreditas iš paskyros likučio',
        itemCaption__proratedCredit: 'Proporcingas kreditas už dalinį ankstesnės prenumeratos naudojimą',
        itemCaption__subscribedAndPaidForPlan: 'Užsiprenumeruota ir apmokėta už {{plan}} {{period}} planą',
        notFound: 'Išrašas nerastas',
        tableHeader__amount: 'Suma',
        tableHeader__date: 'Data',
        title: 'Išrašai',
        totalPaid: 'Iš viso sumokėta',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Tvarkyti',
        actionLabel__newSubscription: 'Prenumeruoti planą',
        actionLabel__switchPlan: 'Keisti planus',
        includedSeatsUsage: 'Įtraukta {{includedSeats}} vietų',
        overview: 'Apžvalga',
        paidSeatsUsage: '{{seatsQuantity}} vietos x {{amount}}',
        seatLimit: 'Iki {{seatLimit}} vietų',
        seatLimitAndIncludedSeats: 'Iki {{seatLimit}} vietų (įtraukta {{includedSeats}})',
        tableHeader__edit: 'Redaguoti',
        tableHeader__plan: 'Planas',
        tableHeader__startDate: 'Pradžios data',
        title: 'Prenumerata',
      },
      subscriptionsSection: {
        actionLabel__default: 'Tvarkyti',
      },
      switchPlansSection: {
        title: 'Keisti planus',
      },
      title: 'Atsiskaitymas',
    },
    createDomainPage: {
      subtitle:
        'Pridėkite domeną patikrinimui. Naudotojai, kurių el. pašto adresai yra šiame domene, gali prisijungti prie organizacijos automatiškai arba paprašyti prisijungti.',
      title: 'Pridėti domeną',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Pakvietimų nepavyko išsiųsti. Šiems el. pašto adresams jau yra laukiančių pakvietimų: {{email_addresses}}.',
      formButtonPrimary__continue: 'Siųsti pakvietimus',
      formButtonPrimary__purchaseSeats: 'Įsigyti papildomų vietų',
      selectDropdown__role: 'Pasirinkti vaidmenį',
      subtitle: 'Įveskite arba įklijuokite vieną ar daugiau el. pašto adresų, atskirtų tarpais arba kableliais.',
      successMessage: 'Pakvietimai sėkmingai išsiųsti',
      title: 'Pakviesti naujus narius',
    },
    membersPage: {
      action__invite: 'Pakviesti',
      action__search: 'Ieškoti',
      activeMembersTab: {
        menuAction__remove: 'Pašalinti narį',
        tableHeader__actions: 'Veiksmai',
        tableHeader__joined: 'Prisijungė',
        tableHeader__role: 'Vaidmuo',
        tableHeader__user: 'Naudotojas',
      },
      alerts: {
        roleSetMigrationInProgress: {
          subtitle: 'Atnaujiname galimus vaidmenis. Kai tai bus padaryta, vėl galėsite atnaujinti vaidmenis.',
          title: 'Vaidmenys laikinai užrakinti',
        },
      },
      detailsTitle__emptyRow: 'Nėra rodomų narių',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Pakvieskite naudotojus prijungdami el. pašto domeną prie savo organizacijos. Kiekvienas, užsiregistruojantis su atitinkančiu el. pašto domenu, galės bet kada prisijungti prie organizacijos.',
          headerTitle: 'Automatiniai pakvietimai',
          primaryButton: 'Tvarkyti patvirtintus domenus',
        },
        table__emptyRow: 'Nėra rodomų pakvietimų',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Atšaukti pakvietimą',
        tableHeader__invited: 'Pakviesta',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Naudotojai, užsiregistravę su atitinkančiu el. pašto domenu, matys pasiūlymą paprašyti prisijungti prie jūsų organizacijos.',
          headerTitle: 'Automatiniai pasiūlymai',
          primaryButton: 'Tvarkyti patvirtintus domenus',
        },

        menuAction__approve: 'Patvirtinti',
        menuAction__reject: 'Atmesti',
        tableHeader__requested: 'Prašoma prieiga',
        table__emptyRow: 'Nėra užklausų, kurias būtų galima rodyti',
      },
      start: {
        headerTitle__invitations: 'Kvietimai',
        headerTitle__members: 'Nariai',
        headerTitle__requests: 'Užklausos',
      },
    },
    navbar: {
      apiKeys: 'API raktai',
      billing: 'Atsiskaitymas',
      description: 'Tvarkykite savo organizaciją.',
      general: 'Bendra',
      members: 'Nariai',
      security: 'Sauga',
      title: 'Organizacija',
    },
    plansPage: {
      alerts: {
        noPermissionsToManageBilling: 'Neturite teisių tvarkyti šios organizacijos atsiskaitymą.',
        planMembershipLimitExceeded:
          'Jūsų organizacija turi {{count}} narių (įskaitant laukiančius kvietimus). Šis planas leidžia tik {{limit}} narių.',
      },
      title: 'Planai',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Norėdami tęsti, žemiau įveskite „{{organizationName}}“.',
          messageLine1: 'Ar tikrai norite ištrinti šią organizaciją?',
          messageLine2: 'Šis veiksmas yra galutinis ir negrįžtamas.',
          successMessage: 'Organizacija buvo ištrinta.',
          title: 'Ištrinti organizaciją',
        },
        leaveOrganization: {
          actionDescription: 'Norėdami tęsti, žemiau įveskite „{{organizationName}}“.',
          messageLine1:
            'Ar tikrai norite palikti šią organizaciją? Prarasite prieigą prie šios organizacijos ir jos programų.',
          messageLine2: 'Šis veiksmas yra galutinis ir negrįžtamas.',
          successMessage: 'Jūs palikote organizaciją.',
          title: 'Palikti organizaciją',
        },
        title: 'Pavojus',
      },
      domainSection: {
        menuAction__manage: 'Tvarkyti',
        menuAction__remove: 'Ištrinti',
        menuAction__verify: 'Patvirtinti',
        primaryButton: 'Pridėti domeną',
        subtitle:
          'Leiskite naudotojams prisijungti prie organizacijos automatiškai arba paprašyti prisijungti pagal patvirtintą el. pašto domeną.',
        title: 'Patvirtinti domenai',
      },
      successMessage: 'Organizacija buvo atnaujinta.',
      title: 'Atnaujinti profilį',
    },
    removeDomainPage: {
      messageLine1: 'El. pašto domenas {{domain}} bus pašalintas.',
      messageLine2: 'Po to naudotojai nebegalės automatiškai prisijungti prie organizacijos.',
      successMessage: '{{domain}} buvo pašalintas.',
      title: 'Pašalinti domeną',
    },
    securityPage: {
      removeDialog: {
        confirmButton: 'Pašalinti ryšį',
        subtitle:
          'Ar tikrai norite pašalinti ryšį? Šis veiksmas yra negrįžtamas ir ištrins ryšį bei visą jo konfigūraciją.',
        title: 'Pašalinti SSO ryšį',
      },
      ssoSection: {
        badge__active: 'Aktyvus',
        badge__inProgress: 'Vykdoma',
        badge__inactive: 'Neaktyvus',
        badge__unconfigured: 'Nekonfigūruota',
        descriptionLine1: 'Reikalaukite, kad nariai, kurių el. pašto domenas atitinka, prisijungtų per jūsų tapatybės teikėją.',
        domainLabel: 'Domenai:',
        menuAction__activate: 'Aktyvinti',
        menuAction__deactivate: 'Išjungti',
        menuAction__edit: 'Redaguoti',
        menuAction__remove: 'Pašalinti',
        primaryButton__continueConfiguration: 'Tęsti konfigūravimą',
        primaryButton__startConfiguration: 'Pradėti konfigūravimą',
        title: 'SSO',
        tooltip:
          'Nariai, kurių domenas neatitinka, vis tiek gali prisijungti naudodami esamus autentifikavimo metodus. Nauji nariai šioje organizacijoje bus priskirti vaidmeniui {{role}}.',
        tooltipLabel: 'Daugiau informacijos',
        tooltip__noRole: 'Nariai, kurių domenas neatitinka, vis tiek gali prisijungti naudodami esamus autentifikavimo metodus.',
      },
      title: 'Sauga',
    },
    start: {
      headerTitle__general: 'Bendra',
      headerTitle__members: 'Nariai',
      membershipSeatUsageLabel: 'Panaudota {{count}} iš {{limit}} vietų',
      profileSection: {
        primaryButton: 'Atnaujinti profilį',
        title: 'Profilis',
        uploadAction__title: 'Logotipas',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Šio domeno pašalinimas paveiks pakviestus naudotojus.',
        removeDomainActionLabel__remove: 'Pašalinti domeną',
        removeDomainSubtitle: 'Pašalinkite šį domeną iš patvirtintų domenų',
        removeDomainTitle: 'Pašalinti domeną',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Naudotojai automatiškai pakviečiami prisijungti prie organizacijos, kai užsiregistruoja, ir gali prisijungti bet kada.',
        automaticInvitationOption__label: 'Automatiniai kvietimai',
        automaticSuggestionOption__description:
          'Naudotojai gauna pasiūlymą paprašyti prisijungti, tačiau prieš prisijungdami prie organizacijos turi būti patvirtinti administratoriaus.',
        automaticSuggestionOption__label: 'Automatiniai pasiūlymai',
        calloutInfoLabel: 'Registracijos režimo keitimas paveiks tik naujus naudotojus.',
        calloutInvitationCountLabel: 'Laukiantys kvietimai, išsiųsti naudotojams: {{count}}',
        calloutSuggestionCountLabel: 'Laukiantys pasiūlymai, išsiųsti naudotojams: {{count}}',
        manualInvitationOption__description: 'Naudotojai gali būti pakviesti į organizaciją tik rankiniu būdu.',
        manualInvitationOption__label: 'Be automatinės registracijos',
        subtitle: 'Pasirinkite, kaip šio domeno naudotojai gali prisijungti prie organizacijos.',
      },
      start: {
        headerTitle__danger: 'Pavojus',
        headerTitle__enrollment: 'Registracijos parinktys',
      },
      subtitle: 'Domenas {{domain}} dabar patvirtintas. Tęskite pasirinkdami registracijos režimą.',
      title: 'Atnaujinti {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Įveskite patvirtinimo kodą, išsiųstą į jūsų el. pašto adresą',
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'Domenas {{domainName}} turi būti patvirtintas el. paštu.',
      subtitleVerificationCodeScreen: 'Patvirtinimo kodas buvo išsiųstas adresu {{emailAddress}}. Įveskite kodą, kad tęstumėte.',
      title: 'Patvirtinti domeną',
    },
  },
  organizationSwitcher: {
    action__closeOrganizationSwitcher: 'Uždaryti organizacijos perjungiklį',
    action__createOrganization: 'Sukurti organizaciją',
    action__invitationAccept: 'Prisijungti',
    action__manageOrganization: 'Tvarkyti',
    action__openOrganizationSwitcher: 'Atidaryti organizacijos perjungiklį',
    action__suggestionsAccept: 'Paprašyti prisijungti',
    notSelected: 'Nepasirinkta jokia organizacija',
    personalWorkspace: 'Asmeninė paskyra',
    suggestionsAcceptedLabel: 'Laukia patvirtinimo',
  },
  paginationButton__next: 'Kitas',
  paginationButton__previous: 'Ankstesnis',
  paginationRowText__displaying: 'Rodoma',
  paginationRowText__of: 'iš',
  reverification: {
    alternativeMethods: {
      actionLink: 'Gauti pagalbos',
      actionText: 'Neturite nė vieno iš šių?',
      blockButton__backupCode: 'Naudoti atsarginį kodą',
      blockButton__emailCode: 'Siųsti kodą el. paštu adresu {{identifier}}',
      blockButton__passkey: 'Naudoti prieigos raktą',
      blockButton__password: 'Tęsti su slaptažodžiu',
      blockButton__phoneCode: 'Siųsti SMS kodą numeriu {{identifier}}',
      blockButton__totp: 'Naudoti autentifikavimo programėlę',
      getHelp: {
        blockButton__emailSupport: 'Rašyti pagalbai el. paštu',
        content:
          'Jei kyla problemų patvirtinant paskyrą, parašykite mums el. paštu ir padėsime kuo greičiau atkurti prieigą.',
        title: 'Gauti pagalbos',
      },
      subtitle: 'Susidūrėte su problemomis? Patvirtinimui galite naudoti bet kurį iš šių metodų.',
      title: 'Naudoti kitą metodą',
    },
    backupCodeMfa: {
      subtitle: 'Įveskite atsarginį kodą, kurį gavote nustatydami dviejų pakopų autentifikavimą',
      title: 'Įveskite atsarginį kodą',
    },
    emailCode: {
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'Norėdami tęsti, įveskite kodą, išsiųstą į jūsų el. paštą',
      title: 'Reikalingas patvirtinimas',
    },
    noAvailableMethods: {
      message: 'Negalima tęsti patvirtinimo. Nesukonfigūruotas joks tinkamas autentifikavimo veiksnys',
      subtitle: 'Įvyko klaida',
      title: 'Nepavyksta patvirtinti jūsų paskyros',
    },
    passkey: {
      blockButton__passkey: 'Naudoti prieigos raktą',
      subtitle:
        'Prieigos rakto naudojimas patvirtina jūsų tapatybę. Įrenginys gali paprašyti piršto antspaudo, veido arba ekrano užrakto.',
      title: 'Naudoti prieigos raktą',

    },
    password: {
      actionLink: 'Naudoti kitą būdą',
      subtitle: 'Norėdami tęsti, įveskite dabartinį slaptažodį',
      title: 'Reikalingas patvirtinimas',
    },
    phoneCode: {
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'Norėdami tęsti, įveskite į jūsų telefoną išsiųstą kodą',
      title: 'Reikalingas patvirtinimas',
    },
    phoneCodeMfa: {
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'Norėdami tęsti, įveskite į jūsų telefoną išsiųstą kodą',
      title: 'Reikalingas patvirtinimas',
    },
    totpMfa: {
      formTitle: 'Patvirtinimo kodas',
      subtitle: 'Norėdami tęsti, įveskite kodą, sugeneruotą jūsų autentifikavimo programėlės',
      title: 'Reikalingas patvirtinimas',
    },
  },
  searchInput: {
    action__clear: 'Išvalyti paiešką',
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Pridėti paskyrą',
      action__signOutAll: 'Atsijungti iš visų paskyrų',
      subtitle: 'Pasirinkite paskyrą, su kuria norite tęsti.',
      title: 'Pasirinkite paskyrą',
    },
    alternativeMethods: {
      actionLink: 'Gauti pagalbos',
      actionText: 'Neturite nė vieno iš šių?',
      blockButton__backupCode: 'Naudoti atsarginį kodą',
      blockButton__emailCode: 'Siųsti kodą el. paštu adresu {{identifier}}',
      blockButton__emailLink: 'Siųsti nuorodą el. paštu adresu {{identifier}}',
      blockButton__passkey: 'Prisijungti naudojant prisijungimo raktą',
      blockButton__password: 'Prisijungti naudojant slaptažodį',
      blockButton__phoneCode: 'Siųsti SMS kodą numeriu {{identifier}}',
      blockButton__totp: 'Naudoti autentifikavimo programėlę',
      getHelp: {
        blockButton__emailSupport: 'Rašyti el. laišką pagalbos tarnybai',
        content:
          'Jei kyla problemų prisijungiant prie paskyros, parašykite mums el. paštu ir mes padėsime kuo greičiau atkurti prieigą.',
        title: 'Gauti pagalbos',
      },
      subtitle: 'Susidūrėte su problemomis? Galite naudoti bet kurį iš šių prisijungimo būdų.',
      title: 'Naudoti kitą būdą',
    },
    alternativePhoneCodeProvider: {
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'norėdami tęsti programoje {{applicationName}}',
      title: 'Patikrinkite {{provider}}',
    },
    backupCodeMfa: {
      subtitle: 'Atsarginis kodas yra tas, kurį gavote nustatydami dviejų žingsnių autentifikavimą.',
      title: 'Įveskite atsarginį kodą',
    },
    emailCode: {
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'norėdami tęsti programoje {{applicationName}}',
      title: 'Patikrinkite el. paštą',
    },
    emailCodeMfa: {
      formTitle: 'Patikrinkite el. paštą',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'norėdami tęsti programoje {{applicationName}}',
      title: 'Patikrinkite el. paštą',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Norėdami tęsti, atidarykite patvirtinimo nuorodą įrenginyje ir naršyklėje, iš kurių pradėjote prisijungimą',
        title: 'Patvirtinimo nuoroda šiam įrenginiui negalioja',
      },
      expired: {
        subtitle: 'Norėdami tęsti, grįžkite į pradinį skirtuką.',
        title: 'Šios patvirtinimo nuorodos galiojimas baigėsi',
      },
      failed: {
        subtitle: 'Norėdami tęsti, grįžkite į pradinį skirtuką.',
        title: 'Ši patvirtinimo nuoroda negalioja',
      },
      formSubtitle: 'Naudokite jums el. paštu išsiųstą patvirtinimo nuorodą',
      formTitle: 'Patvirtinimo nuoroda',
      loading: {
        subtitle: 'Netrukus būsite nukreipti',
        title: 'Prisijungiama...',
      },
      resendButton: "Negavote nuorodos? Siųsti iš naujo",
      subtitle: 'norėdami tęsti programoje {{applicationName}}',
      title: 'Patikrinkite el. paštą',
      unusedTab: {
        title: 'Galite uždaryti šį skirtuką',
      },
      verified: {
        subtitle: 'Netrukus būsite nukreipti',
        title: 'Sėkmingai prisijungta',
      },
      verifiedSwitchTab: {
        subtitle: 'Norėdami tęsti, grįžkite į pradinį skirtuką',
        subtitleNewTab: 'Norėdami tęsti, grįžkite į naujai atidarytą skirtuką',
        titleNewTab: 'Prisijungta kitame skirtuke',
      },
      verifiedTransferable: {
        subtitle: 'Norėdami tęsti, grįžkite į pradinį skirtuką',
        title: 'El. paštas patvirtintas',
      },
    },
    emailLinkMfa: {
      formSubtitle: 'Naudokite jums el. paštu išsiųstą patvirtinimo nuorodą',
      resendButton: "Negavote nuorodos? Siųsti iš naujo",
      subtitle: 'norėdami tęsti programoje {{applicationName}}',
      title: 'Patikrinkite el. paštą',
    },
    enterpriseConnections: {
      subtitle: 'Pasirinkite įmonės paskyrą, su kuria norite tęsti.',
      title: 'Pasirinkite įmonės paskyrą',
    },
    forgotPassword: {
      formTitle: 'Slaptažodžio atkūrimo kodas',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'norėdami atkurti slaptažodį',
      subtitle_email: 'Pirmiausia įveskite kodą, išsiųstą jūsų el. pašto adresu',
      subtitle_phone: 'Pirmiausia įveskite kodą, išsiųstą į jūsų telefoną',
      title: 'Atkurti slaptažodį',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Atkurti slaptažodį',
      label__alternativeMethods: 'Arba prisijunkite kitu būdu',
      title: 'Pamiršote slaptažodį?',
    },
    newDeviceVerificationNotice:
      "Prisijungiate iš naujo įrenginio. Prašome patvirtinimo, kad jūsų paskyra išliktų saugi.",
    noAvailableMethods: {
      message: "Nepavyksta tęsti prisijungimo. Nėra prieinamo autentifikavimo būdo.",
      subtitle: 'Įvyko klaida',
      title: 'Nepavyksta prisijungti',
    },
    passkey: {
      subtitle: "Prisijungimo rakto naudojimas patvirtina, kad tai jūs. Įrenginys gali paprašyti piršto antspaudo, veido arba ekrano užrakto.",
      title: 'Naudoti prisijungimo raktą',
    },
    password: {
      actionLink: 'Naudoti kitą būdą',
      subtitle: 'Įveskite su paskyra susietą slaptažodį',
      title: 'Įveskite slaptažodį',
    },
    passwordCompromised: {
      title: 'Slaptažodis pažeistas',
    },
    passwordPwned: {
      title: 'Slaptažodis pažeistas',
    },
    passwordUntrusted: {
      title: 'Slaptažodis nepatikimas',
    },
    phoneCode: {
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'norėdami tęsti programoje {{applicationName}}',
      title: 'Patikrinkite telefoną',
    },
    phoneCodeMfa: {
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti iš naujo",
      subtitle: 'Norėdami tęsti, įveskite į jūsų telefoną išsiųstą patvirtinimo kodą',
      title: 'Patikrinkite telefoną',
    },
    protectCheck: {
      loading: 'Įkeliama…',
      retryButton: 'Bandyti dar kartą',
      subtitle: 'Palaukite, kol patikriname jūsų užklausą.',
      title: 'Tikrinama jūsų užklausa',
    },
    resetPassword: {
      formButtonPrimary: 'Atkurti slaptažodį',
      requiredMessage: 'Dėl saugumo priežasčių būtina atkurti slaptažodį.',
      successMessage: 'Slaptažodis sėkmingai pakeistas. Prisijungiame, palaukite akimirką.',
      title: 'Nustatyti naują slaptažodį',
    },
    resetPasswordMfa: {
      detailsLabel: 'Prieš atkurdami slaptažodį, turime patvirtinti jūsų tapatybę.',
    },
    start: {
      actionLink: 'Registruotis',
      actionLink__join_waitlist: 'Prisijungti prie laukiančiųjų sąrašo',
      actionLink__use_email: 'Naudoti el. paštą',

      actionLink__use_email_username: 'Naudokite el. paštą arba naudotojo vardą',
      actionLink__use_passkey: 'Vietoj to naudokite passkey',
      actionLink__use_phone: 'Naudokite telefoną',
      actionLink__use_username: 'Naudokite naudotojo vardą',
      actionText: 'Neturite paskyros?',
      actionText__join_waitlist: 'Norite ankstyvos prieigos?',
      alternativePhoneCodeProvider: {
        actionLink: 'Naudokite kitą būdą',
        label: '{{provider}} telefono numeris',
        subtitle: 'Įveskite savo telefono numerį, kad gautumėte patvirtinimo kodą per {{provider}}.',
        title: 'Prisijunkite prie {{applicationName}} naudodami {{provider}}',
      },
      subtitle: 'Sveiki sugrįžę! Prisijunkite, kad tęstumėte',
      subtitleCombined: undefined,
      title: 'Prisijunkite prie {{applicationName}}',
      titleCombined: 'Tęsti į {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Patvirtinimo kodas',
      subtitle: 'Norėdami tęsti, įveskite patvirtinimo kodą, sugeneruotą jūsų autentifikavimo programėlėje',
      title: 'Dviejų pakopų patvirtinimas',
    },
    web3Solana: {
      subtitle: 'Norėdami prisijungti, pasirinkite piniginę žemiau',
      title: 'Prisijunkite naudodami Solana',
    },
  },
  signInEnterPasswordTitle: 'Įveskite slaptažodį',
  signUp: {
    alternativePhoneCodeProvider: {
      resendButton: "Negavote kodo? Siųsti dar kartą",
      subtitle: 'Įveskite patvirtinimo kodą, išsiųstą į jūsų {{provider}}',
      title: 'Patvirtinkite savo {{provider}}',
    },
    continue: {
      actionLink: 'Prisijungti',
      actionText: 'Jau turite paskyrą?',
      subtitle: 'Norėdami tęsti, užpildykite likusius duomenis.',
      title: 'Užpildykite trūkstamus laukus',
    },
    emailCode: {
      formSubtitle: 'Įveskite patvirtinimo kodą, išsiųstą į jūsų el. pašto adresą',
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti dar kartą",
      subtitle: 'Įveskite patvirtinimo kodą, išsiųstą į jūsų el. paštą',
      title: 'Patvirtinkite savo el. paštą',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Norėdami tęsti, atidarykite patvirtinimo nuorodą įrenginyje ir naršyklėje, iš kurių pradėjote registraciją',
        title: 'Patvirtinimo nuoroda šiam įrenginiui negalioja',
      },
      formSubtitle: 'Naudokite patvirtinimo nuorodą, išsiųstą į jūsų el. pašto adresą',
      formTitle: 'Patvirtinimo nuoroda',
      loading: {
        title: 'Registruojama...',
      },
      resendButton: "Negavote nuorodos? Siųsti dar kartą",
      subtitle: 'norėdami tęsti į {{applicationName}}',
      title: 'Patvirtinkite savo el. paštą',
      verified: {
        title: 'Sėkmingai užsiregistruota',
      },
      verifiedSwitchTab: {
        subtitle: 'Norėdami tęsti, grįžkite į naujai atidarytą skirtuką',
        subtitleNewTab: 'Norėdami tęsti, grįžkite į ankstesnį skirtuką',
        title: 'El. paštas sėkmingai patvirtintas',
      },
    },
    enterpriseConnections: {
      subtitle: 'Pasirinkite įmonės paskyrą, su kuria norite tęsti.',
      title: 'Pasirinkite savo įmonės paskyrą',
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Sutinku su {{ privacyPolicyLink || link("Privatumo politika") }}',
        label__onlyTermsOfService: 'Sutinku su {{ termsOfServiceLink || link("Paslaugų teikimo sąlygos") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Sutinku su {{ termsOfServiceLink || link("Paslaugų teikimo sąlygos") }} ir {{ privacyPolicyLink || link("Privatumo politika") }}',
      },
      continue: {
        subtitle: 'Norėdami tęsti, perskaitykite ir sutikite su sąlygomis',
        title: 'Teisinis sutikimas',
      },
    },
    phoneCode: {
      formSubtitle: 'Įveskite patvirtinimo kodą, išsiųstą į jūsų telefono numerį',
      formTitle: 'Patvirtinimo kodas',
      resendButton: "Negavote kodo? Siųsti dar kartą",
      subtitle: 'Įveskite patvirtinimo kodą, išsiųstą į jūsų telefoną',
      title: 'Patvirtinkite savo telefoną',
    },
    protectCheck: {
      loading: 'Įkeliama…',
      retryButton: 'Bandyti dar kartą',
      subtitle: 'Palaukite, kol patikrinsime jūsų užklausą.',
      title: 'Tikrinama jūsų užklausa',
    },
    restrictedAccess: {
      actionLink: 'Prisijungti',
      actionText: 'Jau turite paskyrą?',
      blockButton__emailSupport: 'Susisiekite el. paštu',
      blockButton__joinWaitlist: 'Prisijungti prie laukiančiųjų sąrašo',
      subtitle: 'Registracija šiuo metu išjungta. Jei manote, kad turėtumėte turėti prieigą, susisiekite su pagalba.',
      subtitleWaitlist: 'Registracija šiuo metu išjungta. Norėdami pirmieji sužinoti, kada pradėsime veiklą, prisijunkite prie laukiančiųjų sąrašo.',
      title: 'Prieiga apribota',
    },
    start: {
      actionLink: 'Prisijungti',
      actionLink__use_email: 'Vietoj to naudokite el. paštą',
      actionLink__use_phone: 'Vietoj to naudokite telefoną',
      actionText: 'Jau turite paskyrą?',
      alternativePhoneCodeProvider: {
        actionLink: 'Naudokite kitą būdą',
        label: '{{provider}} telefono numeris',
        subtitle: 'Įveskite savo telefono numerį, kad gautumėte patvirtinimo kodą per {{provider}}.',
        title: 'Užsiregistruokite prie {{applicationName}} naudodami {{provider}}',
      },
      subtitle: 'Sveiki! Norėdami pradėti, užpildykite duomenis.',
      subtitleCombined: 'Sveiki! Norėdami pradėti, užpildykite duomenis.',
      title: 'Sukurkite paskyrą',
      titleCombined: 'Sukurkite paskyrą',
    },
    web3Solana: {
      subtitle: 'Norėdami užsiregistruoti, pasirinkite piniginę žemiau',
      title: 'Užsiregistruokite naudodami Solana',
    },
  },
  socialButtonsBlockButton: 'Tęsti su {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  taskChooseOrganization: {
    alerts: {
      organizationAlreadyExists:
        'Organizacija jau egzistuoja nustatytam įmonės pavadinimui ({{organizationName}}) ir {{organizationDomain}}. Prisijunkite gavę kvietimą.',
    },
    chooseOrganization: {
      action__createOrganization: 'Kurti naują organizaciją',
      action__invitationAccept: 'Prisijungti',
      action__suggestionsAccept: 'Prašyti prisijungti',
      subtitle: 'Prisijunkite prie esamos organizacijos arba sukurkite naują',
      subtitle__createOrganizationDisabled: 'Prisijunkite prie esamos organizacijos',
      suggestionsAcceptedLabel: 'Laukiama patvirtinimo',
      title: 'Pasirinkite organizaciją',
    },
    createOrganization: {
      formButtonReset: 'Atšaukti',
      formButtonSubmit: 'Tęsti',
      formFieldInputPlaceholder__name: 'Mano organizacija',
      formFieldInputPlaceholder__slug: 'my-organization',
      formFieldLabel__name: 'Pavadinimas',
      formFieldLabel__slug: 'Slug',
      subtitle: 'Norėdami tęsti, įveskite savo organizacijos duomenis',
      title: 'Nustatykite savo organizaciją',
    },
    organizationCreationDisabled: {
      subtitle: 'Dėl kvietimo susisiekite su savo organizacijos administratoriumi.',
      title: 'Turite priklausyti organizacijai',
    },
    signOut: {
      actionLink: 'Atsijungti',
      actionText: 'Prisijungta kaip {{identifier}}',
    },
  },
  taskResetPassword: {
    formButtonPrimary: 'Atkurti slaptažodį',
    signOut: {
      actionLink: 'Atsijungti',
      actionText: 'Prisijungta kaip {{identifier}}',
    },
    subtitle: 'Prieš tęsdami turite nustatyti naują slaptažodį',
    title: 'Atkurkite slaptažodį',
  },
  taskSetupMfa: {
    badge: 'Dviejų pakopų patvirtinimo nustatymas',
    signOut: {
      actionLink: 'Atsijungti',
      actionText: 'Prisijungta kaip {{identifier}}',
    },
    smsCode: {
      addPhone: {
        formButtonPrimary: 'Tęsti',
        infoText:
          'Į šį telefono numerį bus išsiųsta SMS žinutė su patvirtinimo kodu. Gali būti taikomi žinučių ir duomenų tarifai.',
      },
      addPhoneNumber: 'Pridėti telefono numerį',
      cancel: 'Atšaukti',
      subtitle: 'Pasirinkite telefono numerį, kurį norite naudoti dviejų pakopų patvirtinimui SMS kodu',
      success: {
        finishButton: 'Tęsti',
        message1:
          'Dviejų pakopų patvirtinimas dabar įjungtas. Prisijungdami turėsite įvesti patvirtinimo kodą, išsiųstą į šį telefono numerį, kaip papildomą veiksmą.',
        message2:
          'Išsaugokite šiuos atsarginius kodus ir laikykite juos saugioje vietoje. Jei prarasite prieigą prie savo autentifikavimo įrenginio, galėsite prisijungti naudodami atsarginius kodus.',

        title: 'SMS kodo patvirtinimas įjungtas',
      },
      title: 'Pridėti SMS kodo patvirtinimą',
      verifyPhone: {
        formButtonPrimary: 'Tęsti',
        formTitle: 'Patvirtinimo kodas',
        resendButton: "Negavote kodo? Siųsti iš naujo",
        subtitle: 'Įveskite patvirtinimo kodą, išsiųstą į',
        title: 'Patvirtinkite savo telefono numerį',
      },
    },
    start: {
      methodSelection: {
        phoneCode: 'SMS kodas',
        totp: 'Autentifikatoriaus programa',
      },
      subtitle: 'Pasirinkite, kurį metodą norite naudoti, kad apsaugotumėte paskyrą papildomu saugumo lygiu',
      title: 'Nustatyti dviejų pakopų patvirtinimą',
    },
    totpCode: {
      addAuthenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Vietoj to nuskaityti QR kodą',
        buttonUnableToScan__nonPrimary: "Negalite nuskaityti QR kodo?",
        formButtonPrimary: 'Tęsti',
        formButtonReset: 'Atšaukti',
        infoText__ableToScan:
          'Nustatykite naują prisijungimo metodą savo autentifikatoriaus programėlėje ir nuskaitykite toliau pateiktą QR kodą, kad susietumėte jį su paskyra.',
        infoText__unableToScan: 'Nustatykite naują prisijungimo metodą autentifikatoriuje ir įveskite toliau pateiktą raktą.',
        inputLabel__unableToScan1:
          'Įsitikinkite, kad įjungti laiku pagrįsti arba vienkartiniai slaptažodžiai, tada užbaikite paskyros susiejimą.',
      },
      success: {
        finishButton: 'Tęsti',
        message1:
          'Dviejų pakopų patvirtinimas dabar įjungtas. Prisijungdami turėsite įvesti patvirtinimo kodą iš šio autentifikatoriaus kaip papildomą veiksmą.',
        message2:
          'Išsaugokite šiuos atsarginius kodus ir laikykite juos saugioje vietoje. Jei prarasite prieigą prie autentifikavimo įrenginio, galėsite naudoti atsarginius kodus prisijungti.',
        title: 'Autentifikatoriaus programos patvirtinimas įjungtas',
      },
      title: 'Pridėti autentifikatoriaus programą',
      verifyTotp: {
        formButtonPrimary: 'Tęsti',
        formButtonReset: 'Atšaukti',
        formTitle: 'Patvirtinimo kodas',
        subtitle: 'Įveskite autentifikatoriaus sugeneruotą patvirtinimo kodą',
        title: 'Pridėti autentifikatoriaus programą',
      },
    },
  },
  unstable__errors: {
    action_blocked: "Šio veiksmo nepavyko užbaigti. Pabandykite dar kartą vėliau arba susisiekite su palaikymu, jei tai kartojasi.",
    already_a_member_in_organization: '{{email}} jau yra organizacijos narys.',
    api_key_name_already_exists: 'API rakto pavadinimas jau egzistuoja.',
    api_key_usage_exceeded: 'Pasiekėte naudojimo limitą. Galite pašalinti limitą pereidami prie mokamo plano.',
    avatar_file_size_exceeded: 'Failo dydis viršija didžiausią 10 MB limitą. Pasirinkite mažesnį failą.',
    avatar_file_type_invalid: 'Failo tipas nepalaikomas. Įkelkite JPG, PNG, GIF arba WEBP vaizdą.',
    captcha_invalid: undefined,
    captcha_unavailable:
      'Registracija nepavyko dėl nepavykusio roboto patikrinimo. Atnaujinkite puslapį ir bandykite dar kartą arba susisiekite su palaikymu dėl papildomos pagalbos.',
    form_code_incorrect: undefined,
    form_email_address_blocked: undefined,
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
    form_new_password_matches_current: 'Naujas slaptažodis negali būti toks pat kaip dabartinis slaptažodis.',
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
    form_password_length_too_short: 'Jūsų slaptažodis per trumpas. Jį turi sudaryti bent 8 simboliai.',
    form_password_matches_identifier:
      'Slaptažodis negali sutapti su jūsų el. pašto adresu, telefono numeriu arba vartotojo vardu. Dėl paskyros saugumo naudokite kitą slaptažodį.',
    form_password_not_strong_enough: 'Jūsų slaptažodis nėra pakankamai stiprus.',
    form_password_or_identifier_incorrect: undefined,
    form_password_pwned:
      'Šis slaptažodis buvo rastas duomenų nutekėjime ir negali būti naudojamas, pabandykite kitą slaptažodį.',
    form_password_pwned__sign_in:
      'Šis slaptažodis buvo rastas duomenų nutekėjime ir negali būti naudojamas, atstatykite slaptažodį.',
    form_password_size_in_bytes_exceeded: undefined,
    form_password_untrusted__sign_in:
      'Jūsų slaptažodis gali būti pažeistas. Norėdami apsaugoti paskyrą, tęskite naudodami alternatyvų prisijungimo metodą. Po prisijungimo turėsite atstatyti slaptažodį.',
    form_password_validation_failed: undefined,
    form_username_invalid_character: undefined,
    form_username_invalid_length: 'Jūsų vartotojo vardą turi sudaryti nuo {{min_length}} iki {{max_length}} simbolių.',
    form_username_needs_non_number_char: 'Jūsų vartotojo varde turi būti bent vienas ne skaitmenų simbolis.',
    identification_deletion_failed: undefined,
    insufficient_seats_change_plan:
      'Jūsų organizacija neturi pakankamai vietų, kad pakviestų norimą narių skaičių. Pereikite prie plano, kuris palaiko narių, kuriuos bandote pakviesti, skaičių.',
    insufficient_seats_contact_support:
      'Jūsų organizacija neturi pakankamai vietų, kad pakviestų norimą narių skaičių. Susisiekite su palaikymu.',
    not_allowed_access: undefined,
    oauth_access_denied: 'Nesuteikėte prieigos prie savo paskyros.',
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded:
      'Pasiekėte organizacijos narysčių limitą, įskaitant nepriimtus kvietimus.',
    organization_minimum_permissions_needed: undefined,
    organization_not_found_or_unauthorized:
      'Jūs nebėrate šios organizacijos narys. Pasirinkite arba sukurkite kitą.',
    organization_not_found_or_unauthorized_with_create_organization_disabled:
      'Jūs nebėrate šios organizacijos narys. Pasirinkite kitą.',
    passkey_already_exists: 'Šiame įrenginyje jau užregistruotas prieigos raktas.',
    passkey_not_supported: 'Šiame įrenginyje prieigos raktai nepalaikomi.',
    passkey_pa_not_supported: 'Registracijai reikalingas platformos autentifikatorius, tačiau įrenginys jo nepalaiko.',
    passkey_registration_cancelled: 'Prieigos rakto registracija buvo atšaukta arba baigėsi laukimo laikas.',
    passkey_retrieval_cancelled: 'Prieigos rakto patvirtinimas buvo atšauktas arba baigėsi laukimo laikas.',
    passwordComplexity: {
      maximumLength: 'mažiau nei {{length}} simbolių',
      minimumLength: '{{length}} arba daugiau simbolių',
      requireLowercase: 'mažoji raidė',
      requireNumbers: 'skaičius',
      requireSpecialCharacter: 'specialusis simbolis',
      requireUppercase: 'didžioji raidė',
      sentencePrefix: 'Jūsų slaptažodyje turi būti',
    },
    phone_number_exists: undefined,
    protect_check_aborted: undefined,
    protect_check_already_resolved: undefined,
    protect_check_execution_failed: "Patvirtinimas nebuvo užbaigtas. Pabandykite dar kartą.",
    protect_check_invalid_script: "Nepavyko įkelti patvirtinimo. Susisiekite su palaikymu, jei tai kartojasi.",
    protect_check_invalid_sdk_url: "Patvirtinimo nepavyko pradėti. Susisiekite su palaikymu.",
    protect_check_script_load_failed:
      "Nepavyko įkelti patvirtinimo. Tai gali lemti tinklo problema arba turinio saugos politika, kuri blokuoja patvirtinimo scenarijų. Pabandykite dar kartą arba susisiekite su palaikymu.",
    protect_check_timed_out: "Patvirtinimas nebuvo užbaigtas laiku. Pabandykite dar kartą.",
    protect_check_unsupported_environment:
      "Patvirtinimas šioje aplinkoje nepalaikomas. Tęskite įprastoje naršyklėje arba susisiekite su palaikymu.",
    session_exists: undefined,
    ticket_expired_code: 'Šios nuorodos galiojimas baigėsi. Pradėkite iš naujo arba paprašykite naujos nuorodos.',
    ticket_invalid_code:
      'Ši nuoroda nebegalioja arba jau buvo panaudota. Pradėkite iš naujo arba paprašykite naujos nuorodos.',
    web3_missing_identifier: 'Web3 piniginės plėtinys nerastas. Įdiekite jį, kad galėtumėte tęsti.',
    web3_signature_request_rejected: 'Atmetėte parašo užklausą. Pabandykite dar kartą, kad galėtumėte tęsti.',
    web3_solana_signature_generation_failed:
      'Generuojant parašą įvyko klaida. Pabandykite dar kartą, kad galėtumėte tęsti.',
    zxcvbn: {
      couldBeStronger: 'Jūsų slaptažodis tinka, bet galėtų būti stipresnis. Pabandykite pridėti daugiau simbolių.',
      goodPassword: 'Jūsų slaptažodis atitinka visus būtinus reikalavimus.',
      notEnough: 'Jūsų slaptažodis nėra pakankamai stiprus.',
      suggestions: {
        allUppercase: 'Didžiosiomis rašykite kai kurias, bet ne visas raides.',
        anotherWord: 'Pridėkite daugiau rečiau vartojamų žodžių.',
        associatedYears: 'Venkite metų, susijusių su jumis.',
        capitalization: 'Didžiosiomis rašykite ne tik pirmąją raidę.',
        dates: 'Venkite datų ir metų, susijusių su jumis.',
        l33t: "Venkite nuspėjamų raidžių keitimų, pavyzdžiui, '@' vietoj 'a'.",
        longerKeyboardPattern: 'Naudokite ilgesnius klaviatūros šablonus ir kelis kartus keiskite spausdinimo kryptį.',
        noNeed: 'Galite sukurti stiprius slaptažodžius nenaudodami simbolių, skaičių ar didžiųjų raidžių.',
        pwned: 'Jei šį slaptažodį naudojate kitur, turėtumėte jį pakeisti.',
        recentYears: 'Venkite pastarųjų metų.',
        repeated: 'Venkite pasikartojančių žodžių ir simbolių.',
        reverseWords: 'Venkite atvirkščiai rašomų įprastų žodžių.',
        sequences: 'Venkite įprastų simbolių sekų.',
        useWords: 'Naudokite kelis žodžius, bet venkite įprastų frazių.',
      },
      warnings: {
        common: 'Tai dažnai naudojamas slaptažodis.',
        commonNames: 'Įprastus vardus ir pavardes lengva atspėti.',
        dates: 'Datos yra lengvai atspėjamos.',
        extendedRepeat: 'Pasikartojančius simbolių šablonus, pvz., "abcabcabc", lengva atspėti.',
        keyPattern: 'Trumpus klaviatūros šablonus lengva atspėti.',
        namesByThemselves: 'Pavienius vardus ar pavardes lengva atspėti.',
        pwned: 'Jūsų slaptažodis buvo atskleistas dėl duomenų nutekėjimo internete.',
        recentYears: 'Pastaruosius metus lengva atspėti.',
        sequences: 'Įprastas simbolių sekas, pvz., "abc", lengva atspėti.',
        similarToCommon: 'Tai panašu į dažnai naudojamą slaptažodį.',
        simpleRepeat: 'Pasikartojančius simbolius, pvz., "aaa", lengva atspėti.',
        straightRow: 'Tiesias klavišų eiles klaviatūroje lengva atspėti.',
        topHundred: 'Tai dažnai naudojamas slaptažodis.',
        topTen: 'Tai labai plačiai naudojamas slaptažodis.',
        userInputs: 'Neturėtų būti jokių asmeninių ar su puslapiu susijusių duomenų.',
        wordByItself: 'Pavienius žodžius lengva atspėti.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Pridėti paskyrą',
    action__closeUserMenu: 'Uždaryti vartotojo meniu',
    action__manageAccount: 'Tvarkyti paskyrą',
    action__openUserMenu: 'Atidaryti vartotojo meniu',
    action__signOut: 'Atsijungti',
    action__signOutAll: 'Atsijungti iš visų paskyrų',
    label__accountActions: 'Paskyros veiksmai',
    label__activeSessions: 'Aktyvios sesijos',

    label__userButtonPopover: 'Paskyros skydelis',
  },
  userProfile: {
    apiKeysPage: {
      title: 'API raktai',
    },
    backupCodePage: {
      actionLabel__copied: 'Nukopijuota!',
      actionLabel__copy: 'Kopijuoti visus',
      actionLabel__download: 'Atsisiųsti .txt',
      actionLabel__print: 'Spausdinti',
      infoText1: 'Atsarginiai kodai bus įjungti šiai paskyrai.',
      infoText2:
        'Laikykite atsarginius kodus paslaptyje ir saugokite juos saugiai. Galite iš naujo sugeneruoti atsarginius kodus, jei įtariate, kad jie buvo pažeisti.',
      subtitle__codelist: 'Saugokite juos saugiai ir laikykite paslaptyje.',
      successMessage:
        'Atsarginiai kodai dabar įjungti. Galite naudoti vieną iš jų prisijungdami prie savo paskyros, jei prarasite prieigą prie savo autentifikavimo įrenginio. Kiekvieną kodą galima naudoti tik vieną kartą.',
      successSubtitle:
        'Galite naudoti vieną iš jų prisijungdami prie savo paskyros, jei prarasite prieigą prie savo autentifikavimo įrenginio.',
      title: 'Pridėti atsarginio kodo patvirtinimą',
      title__codelist: 'Atsarginiai kodai',
    },
    billingPage: {
      accountCreditsSection: {
        title: 'Paskyros kreditai',
        viewHistory: 'Peržiūrėti kreditų istoriją',
      },
      creditHistoryPage: {
        tableHeader__amount: 'Suma',
        tableHeader__date: 'Data',
        title: 'Paskyros kreditų istorija',
      },
      paymentHistorySection: {
        empty: 'Nėra mokėjimų istorijos',
        notFound: 'Mokėjimo bandymas nerastas',
        tableHeader__amount: 'Suma',
        tableHeader__date: 'Data',
        tableHeader__status: 'Būsena',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Nustatyti kaip numatytąjį',
        actionLabel__remove: 'Pašalinti',
        add: 'Pridėti naują mokėjimo būdą',
        addSubtitle: 'Pridėkite naują mokėjimo būdą prie savo paskyros.',
        cancelButton: 'Atšaukti',
        formButtonPrimary__add: 'Pridėti mokėjimo būdą',
        formButtonPrimary__pay: 'Mokėti {{amount}}',
        payWithTestCardButton: 'Mokėti bandomąja kortele',
        removeMethod: {
          messageLine1: '{{identifier}} bus pašalintas iš šios paskyros.',
          messageLine2:
            'Nebegalėsite naudoti šio mokėjimo šaltinio, o bet kokios nuo jo priklausančios pasikartojančios prenumeratos nebeveiks.',
          successMessage: '{{paymentMethod}} buvo pašalintas iš jūsų paskyros.',
          title: 'Pašalinti mokėjimo būdą',
        },
        title: 'Mokėjimo būdai',
      },
      start: {
        headerTitle__payments: 'Mokėjimai',
        headerTitle__plans: 'Planai',
        headerTitle__statements: 'Ataskaitos',
        headerTitle__subscriptions: 'Prenumerata',
      },
      statementsSection: {
        empty: 'Nėra ataskaitų, kurias būtų galima rodyti',
        itemCaption__paidForPlan: 'Sumokėta už {{plan}} {{period}} planą',
        itemCaption__payerCredit: 'Kreditas iš paskyros likučio',
        itemCaption__proratedCredit: 'Proporcingas kreditas už dalinį ankstesnės prenumeratos naudojimą',
        itemCaption__subscribedAndPaidForPlan: 'Užsiprenumeruota ir sumokėta už {{plan}} {{period}} planą',
        notFound: 'Ataskaita nerasta',
        tableHeader__amount: 'Suma',
        tableHeader__date: 'Data',
        title: 'Ataskaitos',
        totalPaid: 'Iš viso sumokėta',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Tvarkyti',
        actionLabel__newSubscription: 'Užsiprenumeruoti planą',
        actionLabel__switchPlan: 'Keisti planus',
        overview: 'Apžvalga',
        tableHeader__edit: 'Redaguoti',
        tableHeader__plan: 'Planas',
        tableHeader__startDate: 'Pradžios data',
        title: 'Prenumerata',
      },
      subscriptionsSection: {
        actionLabel__default: 'Tvarkyti',
      },
      switchPlansSection: {
        title: 'Keisti planus',
      },
      title: 'Atsiskaitymas',
    },
    connectedAccountPage: {
      formHint: 'Pasirinkite teikėją, kad prijungtumėte savo paskyrą.',
      formHint__noAccounts: 'Nėra galimų išorinių paskyrų teikėjų.',
      removeResource: {
        messageLine1: '{{identifier}} bus pašalintas iš šios paskyros.',
        messageLine2:
          'Nebegalėsite naudoti šios prijungtos paskyros, o nuo jos priklausančios funkcijos nebeveiks.',
        successMessage: '{{connectedAccount}} buvo pašalinta iš jūsų paskyros.',
        title: 'Pašalinti prijungtą paskyrą',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'Teikėjas buvo pridėtas prie jūsų paskyros',
      title: 'Pridėti prijungtą paskyrą',
    },
    deletePage: {
      actionDescription: 'Toliau įveskite „Ištrinti paskyrą“, kad tęstumėte.',
      confirm: 'Ištrinti paskyrą',
      messageLine1:
        'Ar tikrai norite ištrinti savo paskyrą? Kai kurie susiję duomenys gali būti išsaugoti. Norėdami prašyti visiško duomenų ištrynimo, susisiekite su palaikymu.',
      messageLine2: 'Šis veiksmas yra galutinis ir negrįžtamas.',
      title: 'Ištrinti paskyrą',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Šiuo el. pašto adresu bus išsiųstas el. laiškas su patvirtinimo kodu.',
        formSubtitle: 'Įveskite patvirtinimo kodą, išsiųstą adresu {{identifier}}',
        formTitle: 'Patvirtinimo kodas',
        resendButton: "Negavote kodo? Siųsti dar kartą",
        successMessage: 'El. paštas {{identifier}} buvo pridėtas prie jūsų paskyros.',
      },
      emailLink: {
        formHint: 'Šiuo el. pašto adresu bus išsiųstas el. laiškas su patvirtinimo nuoroda.',
        formSubtitle: 'Spustelėkite patvirtinimo nuorodą el. laiške, išsiųstame adresu {{identifier}}',
        formTitle: 'Patvirtinimo nuoroda',
        resendButton: "Negavote nuorodos? Siųsti dar kartą",
        successMessage: 'El. paštas {{identifier}} buvo pridėtas prie jūsų paskyros.',
      },
      enterpriseSSOLink: {
        formButton: 'Spustelėkite norėdami prisijungti',
        formSubtitle: 'Užbaikite prisijungimą naudodami {{identifier}}',
      },
      formHint: "Prieš pridėdami šį el. pašto adresą prie paskyros turėsite jį patvirtinti.",
      removeResource: {
        messageLine1: '{{identifier}} bus pašalintas iš šios paskyros.',
        messageLine2: 'Nebegalėsite prisijungti naudodami šį el. pašto adresą.',
        successMessage: '{{emailAddress}} buvo pašalintas iš jūsų paskyros.',
        title: 'Pašalinti el. pašto adresą',
      },
      title: 'Pridėti el. pašto adresą',
      verifyTitle: 'Patvirtinti el. pašto adresą',
    },
    formButtonPrimary__add: 'Pridėti',
    formButtonPrimary__continue: 'Tęsti',
    formButtonPrimary__finish: 'Baigti',
    formButtonPrimary__remove: 'Pašalinti',
    formButtonPrimary__save: 'Išsaugoti',
    formButtonReset: 'Atšaukti',
    mfaPage: {
      formHint: 'Pasirinkite metodą, kurį pridėti.',
      title: 'Pridėti dviejų žingsnių patvirtinimą',
    },
    mfaPhoneCodePage: {
      backButton: 'Naudoti esamą numerį',
      primaryButton__addPhoneNumber: 'Pridėti telefono numerį',
      removeResource: {
        messageLine1: '{{identifier}} nebegaus patvirtinimo kodų prisijungiant.',
        messageLine2: 'Jūsų paskyra gali būti ne tokia saugi. Ar tikrai norite tęsti?',
        successMessage: 'SMS kodo dviejų žingsnių patvirtinimas buvo pašalintas numeriui {{mfaPhoneCode}}',
        title: 'Pašalinti dviejų žingsnių patvirtinimą',
      },
      subtitle__availablePhoneNumbers:
        'Pasirinkite esamą telefono numerį, kad užregistruotumėte SMS kodo dviejų žingsnių patvirtinimą, arba pridėkite naują.',
      subtitle__unavailablePhoneNumbers:
        'Nėra galimų telefono numerių SMS kodo dviejų žingsnių patvirtinimui užregistruoti, pridėkite naują.',
      successMessage1:
        'Prisijungdami turėsite įvesti patvirtinimo kodą, išsiųstą šiuo telefono numeriu, kaip papildomą žingsnį.',
      successMessage2:
        'Išsaugokite šiuos atsarginius kodus ir laikykite juos saugioje vietoje. Jei prarasite prieigą prie savo autentifikavimo įrenginio, galėsite naudoti atsarginius kodus prisijungti.',
      successTitle: 'SMS kodo patvirtinimas įjungtas',
      title: 'Pridėti SMS kodo patvirtinimą',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Vietoj to nuskaityti QR kodą',
        buttonUnableToScan__nonPrimary: 'Negalite nuskaityti QR kodo?',
        infoText__ableToScan:
          'Savo autentifikavimo programėlėje nustatykite naują prisijungimo metodą ir nuskaitykite toliau pateiktą QR kodą, kad susietumėte jį su savo paskyra.',
        infoText__unableToScan: 'Savo autentifikavimo programėlėje nustatykite naują prisijungimo metodą ir įveskite toliau pateiktą raktą.',
        inputLabel__unableToScan1:
          'Įsitikinkite, kad įjungti laiku pagrįsti arba vienkartiniai slaptažodžiai, tada užbaikite paskyros susiejimą.',
        inputLabel__unableToScan2:
          'Arba, jei jūsų autentifikavimo programėlė palaiko TOTP URI, taip pat galite nukopijuoti visą URI.',
      },
      removeResource: {
        messageLine1: 'Prisijungiant nebereikės šios autentifikavimo programėlės patvirtinimo kodų.',
        messageLine2: 'Jūsų paskyra gali būti ne tokia saugi. Ar tikrai norite tęsti?',
        successMessage: 'Dviejų žingsnių patvirtinimas naudojant autentifikavimo programėlę buvo pašalintas.',
        title: 'Pašalinti dviejų žingsnių patvirtinimą',
      },
      successMessage:
        'Dviejų žingsnių patvirtinimas dabar įjungtas. Prisijungdami turėsite įvesti šios autentifikavimo programėlės patvirtinimo kodą kaip papildomą žingsnį.',

      title: 'Pridėti autentifikavimo programėlę',
      verifySubtitle: 'Įveskite autentifikavimo programėlės sugeneruotą patvirtinimo kodą',
      verifyTitle: 'Patvirtinimo kodas',
    },
    mobileButton__menu: 'Meniu',
    navbar: {
      account: 'Profilis',
      apiKeys: 'API raktai',
      billing: 'Atsiskaitymas',
      description: 'Tvarkykite savo paskyros informaciją.',
      security: 'Sauga',
      title: 'Paskyra',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} bus pašalintas iš šios paskyros.',
        title: 'Pašalinti passkey',
      },
      subtitle__rename: 'Galite pakeisti passkey pavadinimą, kad jį būtų lengviau rasti.',
      title__rename: 'Pervadinti passkey',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Rekomenduojama atsijungti iš visų kitų įrenginių, kuriuose galėjo būti naudojamas jūsų senas slaptažodis.',
      readonly: 'Šiuo metu jūsų slaptažodžio negalima keisti, nes prisijungti galite tik per įmonės ryšį.',
      successMessage__set: 'Jūsų slaptažodis nustatytas.',
      successMessage__signOutOfOtherSessions: 'Iš visų kitų įrenginių atsijungta.',
      successMessage__update: 'Jūsų slaptažodis atnaujintas.',
      title__set: 'Nustatyti slaptažodį',
      title__update: 'Atnaujinti slaptažodį',
    },
    phoneNumberPage: {
      infoText:
        'Šiuo telefono numeriu bus išsiųsta tekstinė žinutė su patvirtinimo kodu. Gali būti taikomi žinučių ir duomenų įkainiai.',
      removeResource: {
        messageLine1: '{{identifier}} bus pašalintas iš šios paskyros.',
        messageLine2: 'Nebegalėsite prisijungti naudodami šį telefono numerį.',
        successMessage: '{{phoneNumber}} pašalintas iš jūsų paskyros.',
        title: 'Pašalinti telefono numerį',
      },
      successMessage: '{{identifier}} pridėtas prie jūsų paskyros.',
      title: 'Pridėti telefono numerį',
      verifySubtitle: 'Įveskite patvirtinimo kodą, išsiųstą numeriu {{identifier}}',
      verifyTitle: 'Patvirtinti telefono numerį',
    },
    plansPage: {
      title: 'Planai',
    },
    profilePage: {
      fileDropAreaHint: 'Rekomenduojamas dydis 1:1, iki 10 MB.',
      imageFormDestructiveActionSubtitle: 'Pašalinti',
      imageFormSubtitle: 'Įkelti',
      imageFormTitle: 'Profilio nuotrauka',
      readonly: 'Jūsų profilio informacija pateikta per įmonės ryšį ir negali būti keičiama.',
      successMessage: 'Jūsų profilis atnaujintas.',
      title: 'Atnaujinti profilį',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Atsijungti iš įrenginio',
        title: 'Aktyvūs įrenginiai',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Prisijungti iš naujo',
        actionLabel__reauthorize: 'Suteikti prieigą dabar',
        destructiveActionTitle: 'Pašalinti',
        primaryButton: 'Prijungti paskyrą',
        subtitle__disconnected: 'Ši paskyra buvo atjungta.',
        subtitle__reauthorize:
          'Reikiamos teisės buvo atnaujintos, todėl galite susidurti su ribotomis funkcijomis. Iš naujo suteikite šiai programai prieigą, kad išvengtumėte problemų',
        title: 'Prijungtos paskyros',
      },
      dangerSection: {
        deleteAccountButton: 'Ištrinti paskyrą',
        title: 'Ištrinti paskyrą',
      },
      emailAddressesSection: {
        destructiveAction: 'Pašalinti el. paštą',
        detailsAction__nonPrimary: 'Nustatyti kaip pagrindinį',
        detailsAction__primary: 'Užbaigti patvirtinimą',
        detailsAction__unverified: 'Patvirtinti',
        primaryButton: 'Pridėti el. pašto adresą',
        title: 'El. pašto adresai',
      },
      enterpriseAccountsSection: {
        primaryButton: 'Prijungti paskyrą',
        title: 'Įmonės paskyros',
      },
      headerTitle__account: 'Profilio duomenys',
      headerTitle__security: 'Sauga',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Sugeneruoti iš naujo',
          headerTitle: 'Atsarginiai kodai',
          subtitle__regenerate:
            'Gaukite naują saugių atsarginių kodų rinkinį. Ankstesni atsarginiai kodai bus ištrinti ir nebegalės būti naudojami.',
          title__regenerate: 'Sugeneruoti atsarginius kodus iš naujo',
        },
        phoneCode: {
          actionLabel__setDefault: 'Nustatyti kaip numatytąjį',
          destructiveActionLabel: 'Pašalinti',
        },
        primaryButton: 'Pridėti dviejų veiksmų patvirtinimą',
        title: 'Dviejų veiksmų patvirtinimas',
        totp: {
          destructiveActionTitle: 'Pašalinti',
          headerTitle: 'Autentifikavimo programėlė',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Pašalinti',
        menuAction__rename: 'Pervadinti',
        primaryButton: 'Pridėti passkey',
        title: 'Passkeys',
      },
      passwordSection: {
        primaryButton__setPassword: 'Nustatyti slaptažodį',
        primaryButton__updatePassword: 'Atnaujinti slaptažodį',
        title: 'Slaptažodis',
      },
      phoneNumbersSection: {
        destructiveAction: 'Pašalinti telefono numerį',
        detailsAction__nonPrimary: 'Nustatyti kaip pagrindinį',
        detailsAction__primary: 'Užbaigti patvirtinimą',
        detailsAction__unverified: 'Patvirtinti telefono numerį',
        primaryButton: 'Pridėti telefono numerį',
        title: 'Telefono numeriai',
      },
      profileSection: {
        primaryButton: 'Atnaujinti profilį',
        title: 'Profilis',
      },
      usernameSection: {
        primaryButton__setUsername: 'Nustatyti vartotojo vardą',
        primaryButton__updateUsername: 'Atnaujinti vartotojo vardą',
        title: 'Vartotojo vardas',
      },
      web3WalletsSection: {
        destructiveAction: 'Pašalinti piniginę',
        detailsAction__nonPrimary: 'Nustatyti kaip pagrindinę',
        primaryButton: 'Prijungti piniginę',
        title: 'Web3 piniginės',
        web3SelectSolanaWalletScreen: {
          subtitle: 'Pasirinkite Solana piniginę, kurią norite prijungti prie savo paskyros.',
          title: 'Pridėti Solana piniginę',
        },
      },
    },
    usernamePage: {
      successMessage: 'Jūsų vartotojo vardas atnaujintas.',
      title__set: 'Nustatyti vartotojo vardą',
      title__update: 'Atnaujinti vartotojo vardą',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} bus pašalintas iš šios paskyros.',
        messageLine2: 'Nebegalėsite prisijungti naudodami šią web3 piniginę.',
        successMessage: '{{web3Wallet}} pašalinta iš jūsų paskyros.',
        title: 'Pašalinti web3 piniginę',
      },
      subtitle__availableWallets: 'Pasirinkite web3 piniginę, kurią norite prijungti prie savo paskyros.',
      subtitle__unavailableWallets: 'Nėra prieinamų web3 piniginių.',
      successMessage: 'Piniginė pridėta prie jūsų paskyros.',
      title: 'Pridėti web3 piniginę',
      web3WalletButtonsBlockButton: '{{provider|titleize}}',
    },
  },
  waitlist: {
    start: {
      actionLink: 'Prisijungti',
      actionText: 'Jau turite prieigą?',
      formButton: 'Prisijungti prie laukiančiųjų sąrašo',
      subtitle: 'Įveskite savo el. pašto adresą ir pranešime, kai jūsų vieta bus paruošta',
      title: 'Prisijungti prie laukiančiųjų sąrašo',
    },
    success: {
      message: 'Netrukus būsite nukreipti...',
      subtitle: 'Susisieksime, kai jūsų vieta bus paruošta',
      title: 'Dėkojame, kad prisijungėte prie laukiančiųjų sąrašo!',
    },
  },
  web3SolanaWalletButtons: {
    connect: 'Prisijungti naudojant {{walletName}}',
    continue: 'Tęsti naudojant {{walletName}}',
    noneAvailable:
      'Neaptikta Solana Web3 piniginių. Įdiekite Web3 palaikomą {{ solanaWalletsLink || link("piniginės plėtinį") }}.',
  },

} as const;
