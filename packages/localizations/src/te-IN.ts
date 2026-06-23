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

export const teIN: LocalizationResource = {
  locale: 'te-IN',
  apiKeys: {
    action__add: 'కొత్త కీని జోడించు',
    action__search: 'కీలను శోధించు',
    copySecret: {
      formButtonPrimary__copyAndClose: 'కాపీ చేసి మూసివేయి',
      formHint: 'భద్రత కారణాల కోసం, మేము మీకు తర్వాత దాన్ని మళ్లీ చూడడానికి అనుమతించము.',
      formTitle: 'ఇప్పుడే మీ "{{name}}" API కీని కాపీ చేయండి',
    },
    createdAndExpirationStatus__expiresOn:
      "సృష్టించబడింది {{ createdDate | shortDate('te-IN') }} • గడువు ముగుస్తుంది {{ expiresDate | longDate('te-IN') }}",
    createdAndExpirationStatus__never: "సృష్టించబడింది {{ createdDate | shortDate('te-IN') }} • ఎప్పటికీ గడువు ముగియదు",
    detailsTitle__emptyRow: 'API కీలు కనుగొనబడలేదు',
    formButtonPrimary__add: 'కీని సృష్టించు',
    formFieldCaption__expiration__expiresOn: 'గడువు ముగుస్తోంది {{ date }}',
    formFieldCaption__expiration__never: 'ఈ కీ ఎప్పటికీ గడువు ముగియదు',
    formFieldOption__expiration__180d: '180 రోజులు',
    formFieldOption__expiration__1d: '1 రోజు',
    formFieldOption__expiration__1y: '1 సంవత్సరం',
    formFieldOption__expiration__30d: '30 రోజులు',
    formFieldOption__expiration__60d: '60 రోజులు',
    formFieldOption__expiration__7d: '7 రోజులు',
    formFieldOption__expiration__90d: '90 రోజులు',
    formFieldOption__expiration__never: 'ఎప్పటికీ కాదు',
    formHint: 'కొత్త కీని రూపొందించడానికి ఒక పేరును అందించండి. మీరు ఎప్పుడైనా దాన్ని ఉపసంహరించుకోవచ్చు.',
    formTitle: 'కొత్త API కీని జోడించు',
    lastUsed__days: '{{days}} రోజుల క్రితం',
    lastUsed__hours: '{{hours}} గంటల క్రితం',
    lastUsed__minutes: '{{minutes}} నిమిషాల క్రితం',
    lastUsed__months: '{{months}} నెలల క్రితం',
    lastUsed__seconds: '{{seconds}} సెకన్ల క్రితం',
    lastUsed__years: '{{years}} సంవత్సరాల క్రితం',
    menuAction__revoke: 'కీని ఉపసంహరించు',
    revokeConfirmation: {
      confirmationText: 'ఉపసంహరించు',
      formButtonPrimary__revoke: 'కీని ఉపసంహరించు',
      formHint: 'మీరు ఖచ్చితంగా ఈ రహస్య కీని తొలగించాలనుకుంటున్నారా?',
      formTitle: '"{{apiKeyName}}" రహస్య కీని ఉపసంహరించాలా?',
      inputLabel: undefined,
    },
    tableHeader__actions: undefined,
    tableHeader__lastUsed: undefined,
    tableHeader__name: undefined,
  },
  backButton: 'వెనుకకు',
  badge__activePlan: 'క్రియాశీలం',
  badge__banned: undefined,
  badge__canceledEndsAt: "రద్దు చేయబడింది • ముగుస్తుంది {{ date | shortDate('te-IN') }}",
  badge__currentPlan: 'ప్రస్తుత ప్లాన్',
  badge__default: 'డిఫాల్ట్',
  badge__endsAt: "ముగుస్తుంది {{ date | shortDate('te-IN') }}",
  badge__expired: 'గడువు ముగిసింది',
  badge__freeTrial: 'ఉచిత ట్రయల్',
  badge__otherImpersonatorDevice: 'ఇతర నకిలీ పరికరం',
  badge__pastDueAt: "బకాయి {{ date | shortDate('te-IN') }}",
  badge__pastDuePlan: 'బకాయి',
  badge__primary: 'ప్రాథమిక',
  badge__renewsAt: "పునరుద్ధరించబడుతుంది {{ date | shortDate('te-IN') }}",
  badge__requiresAction: 'చర్య అవసరం',
  badge__startsAt: "ప్రారంభమవుతుంది {{ date | shortDate('te-IN') }}",
  badge__thisDevice: 'ఈ పరికరం',
  badge__trialEndsAt: "ట్రయల్ ముగుస్తుంది {{ date | shortDate('te-IN') }}",
  badge__unverified: 'ధృవీకరించబడలేదు',
  badge__upcomingPlan: 'రాబోయే',
  badge__userDevice: 'వినియోగదారు పరికరం',
  badge__you: 'మీరు',
  billing: {
    accountCredit: undefined,
    addPaymentMethod__label: 'చెల్లింపు పద్ధతిని జోడించు',
    alwaysFree: 'ఎల్లప్పుడూ ఉచితం',
    annually: 'వార్షికంగా',
    availableFeatures: 'అందుబాటులో ఉన్న ఫీచర్లు',
    billedAnnually: 'వార్షిక బిల్లింగ్',
    billedAnnuallyOnly: undefined,
    billedMonthly: undefined,
    billedMonthlyOnly: 'నెలవారీగా మాత్రమే బిల్ చేయబడుతుంది',
    cancelFreeTrial: 'ఉచిత ట్రయల్‌ను రద్దు చేయి',
    cancelFreeTrialAccessUntil:
      "మీ ట్రయల్ {{ date | longDate('te-IN') }} వరకు క్రియాశీలంగా ఉంటుంది. ఆ తర్వాత, మీరు ట్రయల్ ఫీచర్లకు ప్రాప్యతను కోల్పోతారు. మీకు ఎలాంటి ఛార్జీ విధించబడదు.",
    cancelFreeTrialTitle: '{{plan}} ప్లాన్ కోసం ఉచిత ట్రయల్‌ను రద్దు చేయాలా?',
    cancelSubscription: 'సబ్‌స్క్రిప్షన్‌ను రద్దు చేయి',
    cancelSubscriptionAccessUntil:
      "{{ date | longDate('te-IN') }} వరకు మీరు '{{plan}}' ఫీచర్లను ఉపయోగించడం కొనసాగించవచ్చు, ఆ తర్వాత మీకు ప్రాప్యత ఉండదు.",
    cancelSubscriptionNoCharge: 'ఈ సబ్‌స్క్రిప్షన్ కోసం మీకు ఎలాంటి ఛార్జీ విధించబడదు.',
    cancelSubscriptionPastDue:
      'మీ సబ్‌స్క్రిప్షన్ వెంటనే ముగుస్తుంది మరియు మీరు అన్ని ప్లాన్ ఫీచర్లకు ప్రాప్యతను కోల్పోతారు. మీ తదుపరి సబ్‌స్క్రిప్షన్‌లో బకాయి మొత్తాన్ని చెల్లించమని మిమ్మల్ని అడగబడతారు.',
    cancelSubscriptionTitle: '{{plan}} సబ్‌స్క్రిప్షన్‌ను రద్దు చేయాలా?',
    cannotSubscribeMonthly:
      'నెలవారీగా చెల్లించడం ద్వారా మీరు ఈ ప్లాన్‌కు సబ్‌స్క్రైబ్ చేయలేరు. ఈ ప్లాన్‌కు సబ్‌స్క్రైబ్ చేయడానికి, మీరు వార్షికంగా చెల్లించడాన్ని ఎంచుకోవాలి.',
    cannotSubscribeUnrecoverable:
      'మీరు ఈ ప్లాన్‌కు సబ్‌స్క్రైబ్ చేయలేరు. మీ ప్రస్తుత సబ్‌స్క్రిప్షన్ ఈ ప్లాన్ కంటే ఖరీదైనది.',
    checkout: {
      description__paymentSuccessful: 'మీ చెల్లింపు విజయవంతమైంది.',
      description__subscriptionSuccessful: 'మీ కొత్త సబ్‌స్క్రిప్షన్ పూర్తిగా సిద్ధంగా ఉంది.',
      downgradeNotice:
        'బిల్లింగ్ చక్రం ముగిసే వరకు మీరు మీ ప్రస్తుత సబ్‌స్క్రిప్షన్‌ను మరియు దాని ఫీచర్లను ఉంచుకుంటారు, ఆ తర్వాత మీరు ఈ సబ్‌స్క్రిప్షన్‌కు మార్చబడతారు.',
      emailForm: {
        subtitle: 'మీ కొనుగోలును పూర్తి చేయడానికి ముందు, రసీదులు పంపబడే ఇమెయిల్ చిరునామాను మీరు జోడించాలి.',
        title: 'ఇమెయిల్ చిరునామాను జోడించు',
      },
      lineItems: {
        title__freeTrialEndsAt: 'ట్రయల్ ముగిసే తేదీ',
        title__paymentMethod: 'చెల్లింపు పద్ధతి',
        title__statementId: 'స్టేట్‌మెంట్ ID',
        title__subscriptionBegins: 'సబ్‌స్క్రిప్షన్ ప్రారంభమవుతుంది',
        title__totalPaid: 'మొత్తం చెల్లించబడింది',
      },
      pastDueNotice: 'మీ మునుపటి సబ్‌స్క్రిప్షన్ చెల్లింపు లేకుండా బకాయిగా ఉంది.',
      perMonth: 'నెలకు',
      title: 'చెక్అవుట్',
      title__paymentSuccessful: 'చెల్లింపు విజయవంతమైంది!',
      title__subscriptionSuccessful: 'విజయం!',
      title__trialSuccess: 'ట్రయల్ విజయవంతంగా ప్రారంభమైంది!',
      totalDueAfterTrial: '{{days}} రోజుల్లో ట్రయల్ ముగిసిన తర్వాత చెల్లించవలసిన మొత్తం',
      totalDuePerPeriod: undefined,
    },
    credit: 'క్రెడిట్',
    creditRemainder: 'మీ ప్రస్తుత సబ్‌స్క్రిప్షన్ యొక్క మిగిలిన కాలానికి క్రెడిట్.',
    defaultFreePlanActive: 'మీరు ప్రస్తుతం ఉచిత ప్లాన్‌లో ఉన్నారు',
    free: 'ఉచితం',
    getStarted: 'ప్రారంభించండి',
    highlightedPlanBadge: 'ప్రసిద్ధ',
    keepFreeTrial: 'ఉచిత ట్రయల్‌ను ఉంచు',
    keepSubscription: 'సబ్‌స్క్రిప్షన్‌ను ఉంచు',
    manage: 'నిర్వహించు',
    manageSubscription: 'సభ్యత్వాన్ని నిర్వహించండి',
    month: 'నెల',
    monthAbbreviation: undefined,
    monthPerUnit: undefined,
    monthly: 'నెలవారీ',
    pastDue: 'బకాయి',
    pay: '{{amount}} చెల్లించు',
    payerCreditRemainder: undefined,
    paymentMethod: {
      applePayDescription: {
        annual: 'వార్షిక చెల్లింపు',
        monthly: 'నెలవారీ చెల్లింపు',
      },
      dev: {
        anyNumbers: 'ఏవైనా సంఖ్యలు',
        cardNumber: 'కార్డ్ నంబర్',
        cvcZip: 'CVC, ZIP',
        developmentMode: 'డెవలప్‌మెంట్ మోడ్',
        expirationDate: 'గడువు తేదీ',
        testCardInfo: 'టెస్ట్ కార్డ్ సమాచారం',
      },
    },
    paymentMethods__label: 'చెల్లింపు పద్ధతులు',
    pricingTable: {
      billingCycle: 'బిల్లింగ్ చక్రం',
      included: 'చేర్చబడింది',
      seatCost: {
        additionalSeats: undefined,
        freeUpToSeats: undefined,
        includedSeats: undefined,
        perSeat: undefined,
        tooltip: {
          additionalSeatsEach: undefined,
          firstSeatsIncludedInPlan: undefined,
          freeForUpToSeats: undefined,
        },
        unlimitedSeats: undefined,
        upToSeats: undefined,
      },
    },
    proratedDiscount: undefined,
    prorationCredit: undefined,
    reSubscribe: 'మళ్లీ సబ్‌స్క్రైబ్ చేయి',
    seatBreakdownIncludedPlural: undefined,
    seatBreakdownIncludedSingular: undefined,
    seatBreakdownPlural: undefined,
    seatBreakdownSingular: undefined,
    seats: undefined,
    seatsWithLimit: undefined,
    seeAllFeatures: 'అన్ని ఫీచర్లను చూడు',
    startFreeTrial: 'ఉచిత ట్రయల్‌ను ప్రారంభించు',
    startFreeTrial__days: '{{days}}-రోజుల ఉచిత ట్రయల్‌ను ప్రారంభించు',
    subscribe: 'సబ్‌స్క్రైబ్ చేయి',
    subscriptionDetails: {
      beginsOn: 'ప్రారంభమయ్యే తేదీ',
      currentBillingCycle: 'ప్రస్తుత బిల్లింగ్ చక్రం',
      endsOn: 'ముగిసే తేదీ',
      firstPaymentAmount: 'మొదటి చెల్లింపు మొత్తం',
      firstPaymentOn: 'మొదటి చెల్లింపు',
      nextPaymentAmount: 'తదుపరి చెల్లింపు మొత్తం',
      nextPaymentOn: 'తదుపరి చెల్లింపు',
      pastDueAt: 'బకాయి తేదీ',
      renewsAt: 'పునరుద్ధరించబడుతుంది',
      subscribedOn: 'సబ్‌స్క్రైబ్ చేసిన తేదీ',
      title: 'సబ్‌స్క్రిప్షన్',
      trialEndsOn: 'ట్రయల్ ముగిసే తేదీ',
      trialStartedOn: 'ట్రయల్ ప్రారంభమైన తేదీ',
    },
    subtotal: 'ఉప మొత్తం',
    subtotalRenewal: undefined,
    switchPlan: 'ఈ ప్లాన్‌కు మారండి',
    switchToAnnual: 'వార్షికానికి మార్చు',
    switchToAnnualWithAnnualPrice: 'వార్షికానికి మార్చు {{currency}}{{price}} / సంవత్సరం',
    switchToMonthly: 'నెలవారీకి మార్చు',
    switchToMonthlyWithPrice: 'నెలవారీకి మార్చు {{currency}}{{price}} / నెల',
    totalDue: 'చెల్లించవలసిన మొత్తం',
    totalDuePerPeriod: undefined,
    totalDueToday: 'ఈరోజు చెల్లించవలసిన మొత్తం',
    viewFeatures: 'ఫీచర్లను చూడు',
    viewPayment: 'చెల్లింపును చూడు',
    year: 'సంవత్సరం',
    yearAbbreviation: undefined,
    yearPerUnit: undefined,
  },
  configureSSO: {
    configureStep: {
      attributeMappingTable: {
        badges: {
          optional: undefined,
          required: undefined,
        },
      },
      samlCustom: {
        assignUsersStep: {
          headerSubtitle: undefined,
          paragraph: undefined,
          title: undefined,
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attributeName: undefined,
              userProfile: undefined,
            },
            rows: {
              email: {
                attributeName: undefined,
                userProfile: undefined,
              },
              firstName: {
                attributeName: undefined,
                userProfile: undefined,
              },
              lastName: {
                attributeName: undefined,
                userProfile: undefined,
              },
            },
          },
          headerSubtitle: undefined,
          paragraph: undefined,
        },
        createAppStep: {
          createAppInstructions: {
            paragraph: undefined,
            title: undefined,
          },
          headerSubtitle: undefined,
          serviceProviderFields: {
            acsUrl: {
              label: undefined,
            },
            spEntityId: {
              label: undefined,
            },
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: undefined,
          manual: {
            description: undefined,
            issuer: {
              label: undefined,
              placeholder: undefined,
            },
            signOnUrl: {
              label: undefined,
              placeholder: undefined,
            },
            signingCertificate: {
              fileUploaded: undefined,
              label: undefined,
              removeFile: undefined,
              replaceFile: undefined,
              uploadFile: undefined,
            },
          },
          metadataUrl: {
            description: undefined,
            label: undefined,
            placeholder: undefined,
          },
          modes: {
            ariaLabel: undefined,
            manual: undefined,
            metadataUrl: undefined,
            title: undefined,
          },
        },
        mainHeaderTitle: undefined,
      },
      samlGoogle: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              appAttribute: undefined,
              googleAttribute: undefined,
            },
            rows: {
              email: {
                appAttribute: undefined,
                googleAttribute: undefined,
              },
              firstName: {
                appAttribute: undefined,
                googleAttribute: undefined,
              },
              lastName: {
                appAttribute: undefined,
                googleAttribute: undefined,
              },
            },
          },
          headerSubtitle: undefined,
          paragraph: undefined,
          step1: undefined,
          step2: undefined,
        },
        configureUserAccess: {
          assignUsersInstructions: {
            paragraph1: undefined,
            paragraph2: undefined,
            step1: undefined,
            step2: undefined,
            step3: undefined,
          },
          headerSubtitle: undefined,
        },
        createAppStep: {
          createAppInstructions: {
            step1: undefined,
            step2: undefined,
            step3: undefined,
            step4: undefined,
            step5: undefined,
            title: undefined,
          },
          headerSubtitle: undefined,
        },
        identityProviderMetadataStep: {
          headerSubtitle: undefined,
          manual: {
            description: undefined,
            issuer: {
              label: undefined,
              placeholder: undefined,
            },
            signOnUrl: {
              label: undefined,
              placeholder: undefined,
            },
            signingCertificate: {
              fileUploaded: undefined,
              label: undefined,
              removeFile: undefined,
              replaceFile: undefined,
              uploadFile: undefined,
            },
          },
          metadataFile: {
            description: undefined,
            fileUploaded: undefined,
            label: undefined,
            removeFile: undefined,
            replaceFile: undefined,
            uploadFile: undefined,
          },
          modes: {
            ariaLabel: undefined,
            manual: undefined,
            metadataFile: undefined,
            title: undefined,
          },
        },
        mainHeaderTitle: undefined,
        serviceProviderStep: {
          headerSubtitle: undefined,
          nameIdInstructions: {
            step1: undefined,
            step2: undefined,
          },
          paragraph: undefined,
          serviceProviderFields: {
            acsUrl: {
              label: undefined,
            },
            spEntityId: {
              label: undefined,
            },
          },
          title: undefined,
        },
      },
      samlMicrosoft: {
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              attribute: undefined,
              claimName: undefined,
              value: undefined,
            },
            rows: {
              email: {
                attribute: undefined,
                claimName: undefined,
                value: undefined,
              },
              firstName: {
                attribute: undefined,
                claimName: undefined,
                value: undefined,
              },
              lastName: {
                attribute: undefined,
                claimName: undefined,
                value: undefined,
              },
            },
          },
          headerSubtitle: undefined,
          paragraph: undefined,
          step1: undefined,
          step2: undefined,
          step3: undefined,
          title: undefined,
        },
        createAppStep: {
          assignUsersInstructions: {
            paragraph1: undefined,
            step1: undefined,
            step2: undefined,
            step3: undefined,
            step4: undefined,
            step5: undefined,
            step6: undefined,
            title: undefined,
          },
          createAppInstructions: {
            step1: undefined,
            step2: undefined,
            step3: undefined,
            step4: {
              label: undefined,
              subSteps: {
                appName: undefined,
                create: undefined,
                nonGallery: undefined,
              },
            },
            title: undefined,
          },
          headerSubtitle: undefined,
        },
        identityProviderMetadataStep: {
          headerSubtitle: undefined,
          manual: {
            description: undefined,
            issuer: {
              label: undefined,
              placeholder: undefined,
            },
            signOnUrl: {
              label: undefined,
              placeholder: undefined,
            },
            signingCertificate: {
              fileUploaded: undefined,
              label: undefined,
              removeFile: undefined,
              replaceFile: undefined,
              uploadFile: undefined,
            },
          },
          metadataUrl: {
            description: undefined,
            label: undefined,
            placeholder: undefined,
          },
          modes: {
            ariaLabel: undefined,
            manual: undefined,
            metadataUrl: undefined,
            title: undefined,
          },
        },
        mainHeaderTitle: undefined,
        serviceProviderStep: {
          headerSubtitle: undefined,
          serviceProviderFields: {
            acsUrl: {
              label: undefined,
            },
            spEntityId: {
              label: undefined,
            },
          },
          step1: undefined,
          step2: undefined,
          step3: undefined,
          step4: undefined,
          step5: undefined,
          step6: undefined,
          title: undefined,
        },
      },
      samlOkta: {
        assignUsersStep: {
          assignUsersInstructions: {
            paragraph: undefined,
            step1: undefined,
            step2: undefined,
            step3: undefined,
            step4: undefined,
            step5: undefined,
            title: undefined,
          },
          headerSubtitle: undefined,
        },
        attributeMappingStep: {
          attributeMappingTable: {
            columns: {
              expression: undefined,
              name: undefined,
            },
            rows: {
              email: {
                expression: undefined,
                name: undefined,
              },
              firstName: {
                expression: undefined,
                name: undefined,
              },
              lastName: {
                expression: undefined,
                name: undefined,
              },
            },
          },
          headerSubtitle: undefined,
          paragraph: undefined,
          step1: undefined,
          step2: undefined,
        },
        createAppStep: {
          completeSamlIntegrationInstructions: {
            step1: undefined,
            step2: undefined,
            title: undefined,
          },
          createAppInstructions: {
            step1: undefined,
            step2: undefined,
            step3: undefined,
            step4: undefined,
            step5: undefined,
            title: undefined,
          },
          headerSubtitle: undefined,
          serviceProviderInstructions: {
            paragraph1: undefined,
            paragraph2: undefined,
            serviceProviderFields: {
              acsUrl: {
                label: undefined,
              },
              spEntityId: {
                label: undefined,
              },
            },
            title: undefined,
          },
        },
        identityProviderMetadataStep: {
          headerSubtitle: undefined,
          manual: {
            description: undefined,
            issuer: {
              label: undefined,
              placeholder: undefined,
            },
            signOnUrl: {
              label: undefined,
              placeholder: undefined,
            },
            signingCertificate: {
              fileUploaded: undefined,
              label: undefined,
              removeFile: undefined,
              replaceFile: undefined,
              uploadFile: undefined,
            },
          },
          metadataUrl: {
            description: undefined,
            label: undefined,
            placeholder: undefined,
          },
          modes: {
            ariaLabel: undefined,
            manual: undefined,
            metadataUrl: undefined,
            title: undefined,
          },
        },
        mainHeaderTitle: undefined,
      },
    },
    confirmation: {
      configurationSection: {
        configureAgainLink: undefined,
        issuerLabel: undefined,
        ssoUrlLabel: undefined,
        title: undefined,
      },
      domainSection: {
        title: undefined,
      },
      enableSection: {
        title: undefined,
      },
      inactiveBanner: {
        title: undefined,
      },
      resetSection: {
        confirmationFieldLabel: undefined,
        submitButton: undefined,
        title: undefined,
        warning: undefined,
      },
      statusSection: {
        activeBadge: undefined,
        inactiveBadge: undefined,
        title: undefined,
      },
    },
    missingManageEnterpriseConnectionsPermission: {
      subtitle: 'మీ అనుమతులను అప్‌గ్రేడ్ చేయడానికి మీ సంస్థ నిర్వాహకుడిని సంప్రదించండి.',
      title: 'సింగిల్ సైన్-ఆన్ (SSO) నిర్వహించడానికి మీకు అనుమతి లేదు',
    },
    navbar: {
      title: 'సింగిల్ సైన్-ఆన్ (SSO) కాన్ఫిగర్ చేయండి',
    },
    organizationDomainsStep: {
      domainCard: {
        badge__unverified: 'ధృవీకరించబడలేదు',
        badge__verified: 'ధృవీకరించబడింది',
        removeButtonTooltip__lastVerifiedDomain: undefined,
        removeButtonTooltip__lastVerifiedDomainActive: undefined,
        txtRecord: {
          hostLabel: 'హోస్ట్ / పేరు',
          instructions:
            'ఈ TXT రికార్డ్‌ను మీ DNS ప్రొవైడర్‌కు జోడించండి. రికార్డ్ సక్రియం అయిన వెంటనే మేము స్వయంచాలకంగా ధృవీకరిస్తాము.',
          typeLabel: 'రకం',
          valueLabel: 'విలువ',
        },
        verifiedAtLabel: "{{ date | shortDate('te-IN') }} న ధృవీకరించబడింది",
      },
      domainSuggestion: {
        formButtonPrimary__add: '{{domain}} జోడించు',
        messageLabel: 'మీ ఇమెయిల్ {{domain}} ను ఉపయోగిస్తుంది. మీరు దీన్ని జోడించాలనుకుంటున్నారా?',
      },
      formButtonPrimary__add: 'జోడించు',
      formFieldInputPlaceholder__domain: 'మీ డొమైన్‌ను ఇక్కడ టైప్ చేసి, ప్రారంభించడానికి జోడించు క్లిక్ చేయండి',
      formFieldLabel__domain: 'డొమైన్‌లు',
      removeDomainDialog: {
        cancelButton: undefined,
        removeButton: undefined,
        subtitle__active: undefined,
        subtitle__inactive: undefined,
        title: undefined,
      },
      subtitle: 'మీ సంస్థ సైన్ ఇన్ చేయడానికి ఉపయోగించే డొమైన్‌ల యాజమాన్యాన్ని జోడించి ధృవీకరించండి.',
      title: 'SSO డొమైన్‌లను జోడించండి',
    },
    resetConnectionDialog: {
      cancelButton: undefined,
      confirmationFieldLabel: undefined,
      confirmationFieldPlaceholder: undefined,
      resetButton: undefined,
      subtitle: undefined,
      title: undefined,
    },
    selectProviderStep: {
      saml: {
        customSaml: 'కస్టమ్ SAML ప్రొవైడర్',
        google: undefined,
        groupLabel: 'SAML',
        microsoft: undefined,
        okta: 'Okta Workforce',
      },
      subtitle: 'మీరు SSO సెటప్ చేయబోతున్న ప్రొవైడర్‌ను ఎంచుకోండి.',
      title: 'ప్రొవైడర్‌ను ఎంచుకోండి',
      warning: 'ఒకసారి ప్రొవైడర్ ఎంచుకున్న తర్వాత, కాన్ఫిగరేషన్ ముగిసే వరకు మీరు మళ్లీ మార్చలేరు',
    },
    testConfigurationStep: {
      error__noSuccessfulTestRun: undefined,
      subtitle: undefined,
      testResults: {
        actionLabel__refresh: undefined,
        empty: {
          subtitle: undefined,
          title: undefined,
        },
        polling: undefined,
        status__failed: undefined,
        status__pending: undefined,
        status__success: undefined,
        title: undefined,
      },
      testRunDetails: {
        howToFix: {
          actionLabel__viewDocumentation: undefined,
          oauth_access_denied: {
            description: undefined,
          },
          oauth_fetch_user_error: {
            intro: undefined,
            step1: undefined,
            step2: undefined,
          },
          oauth_token_exchange_error: {
            description: undefined,
          },
          saml_email_address_domain_mismatch: {
            description: undefined,
          },
          saml_response_relaystate_missing: {
            description: undefined,
          },
          saml_user_attribute_missing: {
            intro: undefined,
            step1: undefined,
            step2: undefined,
            step3: undefined,
          },
          sectionTitle: undefined,
        },
        parsedUserInfo: {
          email: undefined,
          firstName: undefined,
          sectionTitle: undefined,
        },
        runDetails: {
          actionLabel__copied: undefined,
          actionLabel__copy: undefined,
          errorCode: undefined,
          fullMessage: undefined,
          sectionTitle: undefined,
          status: undefined,
          timestamp: undefined,
        },
        title: undefined,
      },
      testUrl: {
        actionLabel__open: undefined,
      },
      title: undefined,
    },
  },
  createOrganization: {
    formButtonSubmit: 'సంస్థను సృష్టించండి',
    invitePage: {
      formButtonReset: 'దాటవేయండి',
    },
    title: 'సంస్థను సృష్టించండి',
  },
  dates: {
    lastDay: "నిన్న {{ date | timeString('te-IN') }}",
    next6Days: "{{ date | weekday('te-IN','long') }} {{ date | timeString('te-IN') }}",
    nextDay: "రేపు {{ date | timeString('te-IN') }}",
    numeric: "{{ date | numeric('te-IN') }}",
    previous6Days: "గత {{ date | weekday('te-IN','long') }} {{ date | timeString('te-IN') }}",
    sameDay: "ఈరోజు {{ date | timeString('te-IN') }}",
  },
  dividerText: 'లేదా',
  footerActionLink__alternativePhoneCodeProvider: 'బదులుగా SMS ద్వారా కోడ్‌ను పంపు',
  footerActionLink__useAnotherMethod: 'మరొక పద్ధతిని ఉపయోగించండి',
  footerPageLink__help: 'సహాయం',
  footerPageLink__privacy: 'గోప్యత',
  footerPageLink__terms: 'నిబంధనలు',
  formButtonPrimary: 'కొనసాగించండి',
  formButtonPrimary__verify: 'ధృవీకరించండి',
  formFieldAction__forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
  formFieldError__matchingPasswords: 'పాస్‌వర్డ్‌లు సరిపోలాయి.',
  formFieldError__notMatchingPasswords: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు.',
  formFieldError__verificationLinkExpired: 'ధృవీకరణ లింక్ గడువు ముగిసింది. దయచేసి కొత్త లింక్‌ను అభ్యర్థించండి.',
  formFieldHintText__optional: 'ఐచ్ఛికం',
  formFieldHintText__slug: 'స్లగ్ అనేది మానవ-చదవగలిగే ID, అది ప్రత్యేకంగా ఉండాలి. ఇది తరచుగా URL లలో ఉపయోగించబడుతుంది.',
  formFieldInputPlaceholder__apiKeyDescription: 'మీరు ఈ కీని ఎందుకు రూపొందిస్తున్నారో వివరించండి',
  formFieldInputPlaceholder__apiKeyExpirationDate: 'తేదీని ఎంచుకో',
  formFieldInputPlaceholder__apiKeyName: 'మీ రహస్య కీ పేరును నమోదు చేయండి',
  formFieldInputPlaceholder__backupCode: 'బ్యాకప్ కోడ్‌ని నమోదు చేయండి',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'ఖాతాను తొలగించండి',
  formFieldInputPlaceholder__emailAddress: 'మీ ఇమెయిల్ చిరునామాను నమోదు చేయండి',
  formFieldInputPlaceholder__emailAddress_username: 'ఇమెయిల్ లేదా వినియోగదారు పేరును నమోదు చేయండి',
  formFieldInputPlaceholder__emailAddresses: 'example@email.com, example2@email.com',
  formFieldInputPlaceholder__firstName: 'మొదటి పేరు',
  formFieldInputPlaceholder__lastName: 'చివరి పేరు',
  formFieldInputPlaceholder__organizationDomain: 'example.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'you@example.com',
  formFieldInputPlaceholder__organizationName: 'సంస్థ పేరు',
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  formFieldInputPlaceholder__password: 'మీ పాస్‌వర్డ్‌ను నమోదు చేయండి',
  formFieldInputPlaceholder__phoneNumber: 'మీ ఫోన్ నంబర్‌ను నమోదు చేయండి',
  formFieldInputPlaceholder__signUpPassword: undefined,
  formFieldInputPlaceholder__username: 'మీ వినియోగదారు పేరును నమోదు చేయండి',
  formFieldInput__emailAddress_format: 'ఉదాహరణ ఫార్మాట్: name@example.com',
  formFieldLabel__apiKey: 'API కీ',
  formFieldLabel__apiKeyDescription: 'వివరణ',
  formFieldLabel__apiKeyExpiration: 'కాలం ముగిసింది',
  formFieldLabel__apiKeyName: 'రహస్య కీ పేరు',
  formFieldLabel__automaticInvitations: 'ఈ డొమైన్ కోసం స్వయంచాలక ఆహ్వానాలను ప్రారంభించండి',
  formFieldLabel__backupCode: 'బ్యాకప్ కోడ్',
  formFieldLabel__confirmDeletion: 'నిర్ధారణ',
  formFieldLabel__confirmPassword: 'పాస్‌వర్డ్‌ని నిర్ధారించండి',
  formFieldLabel__currentPassword: 'ప్రస్తుత పాస్‌వర్డ్',
  formFieldLabel__emailAddress: 'ఇమెయిల్ చిరునామా',
  formFieldLabel__emailAddress_username: 'ఇమెయిల్ చిరునామా లేదా వినియోగదారు పేరు',
  formFieldLabel__emailAddresses: 'ఇమెయిల్ చిరునామాలు',
  formFieldLabel__firstName: 'మొదటి పేరు',
  formFieldLabel__lastName: 'చివరి పేరు',
  formFieldLabel__newPassword: 'కొత్త పాస్‌వర్డ్',
  formFieldLabel__organizationDomain: 'డొమైన్',
  formFieldLabel__organizationDomainDeletePending: 'పెండింగ్ ఆహ్వానాలు మరియు సూచనలను తొలగించండి',
  formFieldLabel__organizationDomainEmailAddress: 'ధృవీకరణ ఇమెయిల్ చిరునామా',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'ఈ డొమైన్ క్రింద ఇమెయిల్ చిరునామాను నమోదు చేయండి కోడ్‌ను పొందడానికి మరియు ఈ డొమైన్‌ను ధృవీకరించడానికి.',
  formFieldLabel__organizationName: 'పేరు',
  formFieldLabel__organizationSlug: 'స్లగ్',
  formFieldLabel__passkeyName: 'పాస్‌కీ పేరు',
  formFieldLabel__password: 'పాస్‌వర్డ్',
  formFieldLabel__phoneNumber: 'ఫోన్ నంబర్',
  formFieldLabel__role: 'పాత్ర',
  formFieldLabel__signOutOfOtherSessions: 'అన్ని ఇతర పరికరాల నుండి సైన్ అవుట్ అవ్వండి',
  formFieldLabel__username: 'వినియోగదారు పేరు',
  identityPreviewEditButton__emailAddress: undefined,
  identityPreviewEditButton__identifier: undefined,
  identityPreviewEditButton__phoneNumber: undefined,
  impersonationFab: {
    action__signOut: 'సైన్ అవుట్',
    title: '{{identifier}} గా సైన్ ఇన్ చేసారు',
  },
  lastAuthenticationStrategy: 'చివరిగా ఉపయోగించినది',
  maintenanceMode: 'మేము ప్రస్తుతం నిర్వహణలో ఉన్నాము, కానీ చింతించకండి, ఇది కొన్ని నిమిషాల కంటే ఎక్కువ సమయం తీసుకోదు.',
  membershipRole__admin: 'నిర్వాహకుడు',
  membershipRole__basicMember: 'సభ్యుడు',
  membershipRole__guestMember: 'అతిథి',
  oauthConsent: {
    action__allow: undefined,
    action__deny: undefined,
    offlineAccessNotice: undefined,
    redirectNotice: undefined,
    redirectUriModal: {
      subtitle: undefined,
      title: undefined,
    },
    scopeList: {
      title: undefined,
    },
    subtitle: undefined,
    viewFullUrl: undefined,
    warning: undefined,
  },
  organizationList: {
    action__createOrganization: 'సంస్థను సృష్టించండి',
    action__invitationAccept: 'చేరండి',
    action__suggestionsAccept: 'చేరడానికి అభ్యర్థించండి',
    createOrganization: 'సంస్థను సృష్టించండి',
    invitationAcceptedLabel: 'చేరారు',
    subtitle: '{{applicationName}}కి కొనసాగించడానికి',
    suggestionsAcceptedLabel: 'ఆమోదం కోసం పెండింగ్‌లో ఉంది',
    title: 'ఖాతాను ఎంచుకోండి',
    titleWithoutPersonal: 'సంస్థను ఎంచుకోండి',
  },
  organizationProfile: {
    apiKeysPage: {
      title: 'API కీలు',
    },
    badge__automaticInvitation: 'స్వయంచాలక ఆహ్వానాలు',
    badge__automaticSuggestion: 'స్వయంచాలక సూచనలు',
    badge__enterpriseSso: undefined,
    badge__manualInvitation: 'స్వయంచాలక నమోదు లేదు',
    badge__unverified: 'ధృవీకరించబడలేదు',
    billingPage: {
      paymentHistorySection: {
        empty: 'చెల్లింపు చరిత్ర లేదు',
        notFound: 'చెల్లింపు ప్రయత్నం కనుగొనబడలేదు',
        tableHeader__amount: 'మొత్తం',
        tableHeader__date: 'తేదీ',
        tableHeader__status: 'స్థితి',
      },
      paymentMethodsSection: {
        actionLabel__default: 'డిఫాల్ట్‌గా చేయండి',
        actionLabel__remove: 'తొలగించండి',
        add: 'కొత్త చెల్లింపు మూలాన్ని జోడించండి',
        addSubtitle: 'మీ ఖాతాకు కొత్త చెల్లింపు మూలాన్ని జోడించండి.',
        cancelButton: 'రద్దు చేయండి',
        formButtonPrimary__add: 'చెల్లింపు పద్ధతిని జోడించండి',
        formButtonPrimary__pay: '{{amount}} చెల్లించండి',
        payWithTestCardButton: 'టెస్ట్ కార్డ్‌తో చెల్లించు',
        removeMethod: {
          messageLine1: '{{identifier}} ఈ ఖాతా నుండి తొలగించబడుతుంది.',
          messageLine2:
            'మీరు ఇకపై ఈ చెల్లింపు మూలాన్ని ఉపయోగించలేరు మరియు దానిపై ఆధారపడిన పునరావృత సబ్‌స్క్రిప్షన్‌లు ఇకపై పనిచేయవు.',
          successMessage: '{{paymentMethod}} మీ ఖాతా నుండి తొలగించబడింది.',
          title: 'చెల్లింపు మూలాన్ని తొలగించండి',
        },
        title: 'అందుబాటులో ఉన్న ఎంపికలు',
      },
      start: {
        headerTitle__payments: 'చెల్లింపులు',
        headerTitle__plans: 'ప్లాన్‌లు',
        headerTitle__statements: 'ఇన్‌వాయిస్‌లు',
        headerTitle__subscriptions: 'సబ్‌స్క్రిప్షన్',
      },
      statementsSection: {
        empty: 'ప్రదర్శించడానికి స్టేట్‌మెంట్‌లు లేవు',
        itemCaption__paidForPlan: '{{plan}} {{period}} ప్లాన్ కోసం చెల్లించబడింది',
        itemCaption__payerCredit: undefined,
        itemCaption__proratedCredit: 'మునుపటి సబ్‌స్క్రిప్షన్ యొక్క పాక్షిక వినియోగానికి దామాషా క్రెడిట్',
        itemCaption__subscribedAndPaidForPlan: '{{plan}} {{period}} ప్లాన్ కోసం సబ్‌స్క్రైబ్ చేసి చెల్లించబడింది',
        notFound: 'స్టేట్‌మెంట్ కనుగొనబడలేదు',
        tableHeader__amount: 'మొత్తం',
        tableHeader__date: 'తేదీ',
        title: 'స్టేట్‌మెంట్‌లు',
        totalPaid: 'మొత్తం చెల్లించబడింది',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'నిర్వహించు',
        actionLabel__newSubscription: 'ఒక ప్లాన్‌కు సబ్‌స్క్రైబ్ చేయి',
        actionLabel__switchPlan: 'ప్లాన్‌లను మార్చు',
        includedSeatsUsage: undefined,
        overview: undefined,
        paidSeatsUsage: undefined,
        seatLimit: undefined,
        seatLimitAndIncludedSeats: undefined,
        tableHeader__edit: 'సవరించు',
        tableHeader__plan: 'ప్లాన్',
        tableHeader__startDate: 'ప్రారంభ తేదీ',
        title: 'సబ్‌స్క్రిప్షన్',
      },
      subscriptionsSection: {
        actionLabel__default: 'నిర్వహించు',
      },
      switchPlansSection: {
        title: 'ప్లాన్‌లను మార్చు',
      },
      title: 'బిల్లింగ్ & చెల్లింపులు',
    },
    createDomainPage: {
      subtitle:
        'ధృవీకరించడానికి డొమైన్‌ను జోడించండి. ఈ డొమైన్‌లో ఇమెయిల్ చిరునామాలు ఉన్న వినియోగదారులు స్వయంచాలకంగా సంస్థలో చేరవచ్చు లేదా చేరడానికి అభ్యర్థించవచ్చు.',
      title: 'డొమైన్ జోడించండి',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'ఆహ్వానాలు పంపడం సాధ్యం కాలేదు. కింది ఇమెయిల్ చిరునామాల కోసం ఇప్పటికే పెండింగ్‌లో ఉన్న ఆహ్వానాలు ఉన్నాయి: {{email_addresses}}.',
      formButtonPrimary__continue: 'ఆహ్వానాలను పంపండి',
      formButtonPrimary__purchaseSeats: undefined,
      selectDropdown__role: 'పాత్రను ఎంచుకోండి',
      subtitle:
        'ఒకటి లేదా అంతకంటే ఎక్కువ ఇమెయిల్ చిరునామాలను నమోదు చేయండి లేదా అతికించండి, స్థలాలు లేదా కామాలతో విడదీయబడింది.',
      successMessage: 'ఆహ్వానాలు విజయవంతంగా పంపబడ్డాయి',
      title: 'కొత్త సభ్యులను ఆహ్వానించండి',
    },
    membersPage: {
      action__invite: 'ఆహ్వానించండి',
      action__search: 'శోధించండి',
      activeMembersTab: {
        menuAction__remove: 'సభ్యుడిని తీసివేయండి',
        tableHeader__actions: 'చర్యలు',
        tableHeader__joined: 'చేరారు',
        tableHeader__role: 'పాత్ర',
        tableHeader__user: 'వినియోగదారు',
      },
      alerts: {
        roleSetMigrationInProgress: {
          subtitle:
            'మేము అందుబాటులో ఉన్న పాత్రలను అప్‌డేట్ చేస్తున్నాము. అది పూర్తయిన తర్వాత, మీరు మళ్ళీ పాత్రలను అప్‌డేట్ చేయగలరు.',
          title: 'పాత్రలు తాత్కాలికంగా లాక్ చేయబడ్డాయి',
        },
      },
      detailsTitle__emptyRow: 'ప్రదర్శించడానికి సభ్యులు లేరు',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'ఇమెయిల్ డొమైన్‌ను మీ సంస్థతో అనుసంధానించడం ద్వారా వినియోగదారులను ఆహ్వానించండి. సరిపోలే ఇమెయిల్ డొమైన్‌తో సైన్ అప్ చేసే ఎవరైనా సంస్థలో ఎప్పుడైనా చేరగలరు.',
          headerTitle: 'స్వయంచాలక ఆహ్వానాలు',
          primaryButton: 'ధృవీకరించబడిన డొమైన్‌లను నిర్వహించండి',
        },
        table__emptyRow: 'ప్రదర్శించడానికి ఆహ్వానాలు లేవు',
      },
      invitedMembersTab: {
        menuAction__revoke: 'ఆహ్వానాన్ని రద్దు చేయండి',
        tableHeader__invited: 'ఆహ్వానించారు',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'సరిపోలే ఇమెయిల్ డొమైన్‌తో సైన్ అప్ చేసే వినియోగదారులు, మీ సంస్థలో చేరడానికి అభ్యర్థించమని సూచనను చూడగలరు.',
          headerTitle: 'స్వయంచాలక సూచనలు',
          primaryButton: 'ధృవీకరించబడిన డొమైన్‌లను నిర్వహించండి',
        },
        menuAction__approve: 'ఆమోదించండి',
        menuAction__reject: 'తిరస్కరించండి',
        tableHeader__requested: 'ప్రాప్యతను అభ్యర్థించారు',
        table__emptyRow: 'ప్రదర్శించడానికి అభ్యర్థనలు లేవు',
      },
      start: {
        headerTitle__invitations: 'ఆహ్వానాలు',
        headerTitle__members: 'సభ్యులు',
        headerTitle__requests: 'అభ్యర్థనలు',
      },
    },
    navbar: {
      apiKeys: 'API కీలు',
      billing: 'బిల్లింగ్',
      description: 'మీ సంస్థను నిర్వహించండి.',
      general: 'సాధారణ',
      members: 'సభ్యులు',
      security: undefined,
      title: 'సంస్థ',
    },
    plansPage: {
      alerts: {
        noPermissionsToManageBilling: 'ఈ సంస్థ యొక్క బిల్లింగ్‌ను నిర్వహించడానికి మీకు అనుమతులు లేవు.',
        planMembershipLimitExceeded: undefined,
      },
      title: 'ప్లాన్‌లు',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'కొనసాగించడానికి క్రింద "{{organizationName}}" టైప్ చేయండి.',
          messageLine1: 'మీరు ఖచ్చితంగా ఈ సంస్థను తొలగించాలనుకుంటున్నారా?',
          messageLine2: 'ఈ చర్య శాశ్వతం మరియు తిరగదీయలేనిది.',
          successMessage: 'మీరు సంస్థను తొలగించారు.',
          title: 'సంస్థను తొలగించండి',
        },
        leaveOrganization: {
          actionDescription: 'కొనసాగించడానికి క్రింద "{{organizationName}}" టైప్ చేయండి.',
          messageLine1:
            'మీరు ఖచ్చితంగా ఈ సంస్థను వదిలివేయాలనుకుంటున్నారా? మీరు ఈ సంస్థ మరియు దాని అప్లికేషన్‌లకు ప్రాప్యతను కోల్పోతారు.',
          messageLine2: 'ఈ చర్య శాశ్వతం మరియు తిరగదీయలేనిది.',
          successMessage: 'మీరు సంస్థను వదిలివేశారు.',
          title: 'సంస్థను వదిలివేయండి',
        },
        title: 'ప్రమాదం',
      },
      domainSection: {
        menuAction__manage: 'నిర్వహించండి',
        menuAction__remove: 'తొలగించండి',
        menuAction__verify: 'ధృవీకరించండి',
        primaryButton: 'డొమైన్ జోడించండి',
        subtitle:
          'ధృవీకరించబడిన ఇమెయిల్ డొమైన్ ఆధారంగా వినియోగదారులు స్వయంచాలకంగా సంస్థలో చేరడానికి లేదా చేరడానికి అభ్యర్థించడానికి అనుమతించండి.',
        title: 'ధృవీకరించబడిన డొమైన్‌లు',
      },
      successMessage: 'సంస్థ నవీకరించబడింది.',
      title: 'ప్రొఫైల్‌ను నవీకరించండి',
    },
    removeDomainPage: {
      messageLine1: 'ఇమెయిల్ డొమైన్ {{domain}} తొలగించబడుతుంది.',
      messageLine2: 'దీని తర్వాత వినియోగదారులు స్వయంచాలకంగా సంస్థలో చేరలేరు.',
      successMessage: '{{domain}} తొలగించబడింది.',
      title: 'డొమైన్‌ను తొలగించండి',
    },
    securityPage: {
      removeDialog: {
        confirmButton: undefined,
        subtitle: undefined,
        title: undefined,
      },
      ssoSection: {
        badge__active: undefined,
        badge__inProgress: undefined,
        badge__inactive: undefined,
        badge__unconfigured: undefined,
        descriptionLine1: undefined,
        domainLabel: undefined,
        menuAction__activate: undefined,
        menuAction__deactivate: undefined,
        menuAction__edit: undefined,
        menuAction__remove: undefined,
        primaryButton__continueConfiguration: undefined,
        primaryButton__startConfiguration: undefined,
        title: undefined,
      },
      title: undefined,
    },
    start: {
      headerTitle__general: 'సాధారణ',
      headerTitle__members: 'సభ్యులు',
      membershipSeatUsageLabel: undefined,
      profileSection: {
        primaryButton: 'ప్రొఫైల్‌ను నవీకరించండి',
        title: 'సంస్థ ప్రొఫైల్',
        uploadAction__title: 'లోగో',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'ఈ డొమైన్‌ను తొలగించడం ఆహ్వానించబడిన వినియోగదారులను ప్రభావితం చేస్తుంది.',
        removeDomainActionLabel__remove: 'డొమైన్‌ను తొలగించండి',
        removeDomainSubtitle: 'ఈ డొమైన్‌ను మీ ధృవీకరించబడిన డొమైన్‌ల నుండి తొలగించండి',
        removeDomainTitle: 'డొమైన్‌ను తొలగించండి',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'వినియోగదారులు సైన్-అప్ చేసినప్పుడు స్వయంచాలకంగా సంస్థలో చేరడానికి ఆహ్వానించబడతారు మరియు ఎప్పుడైనా చేరగలరు.',
        automaticInvitationOption__label: 'స్వయంచాలక ఆహ్వానాలు',
        automaticSuggestionOption__description:
          'వినియోగదారులు చేరడానికి అభ్యర్థించమని సూచనను అందుకుంటారు, కానీ వారు సంస్థలో చేరగలిగే ముందు నిర్వాహకుడు ఆమోదించాలి.',
        automaticSuggestionOption__label: 'స్వయంచాలక సూచనలు',
        calloutInfoLabel: 'నమోదు మోడ్‌ను మార్చడం కొత్త వినియోగదారులను మాత్రమే ప్రభావితం చేస్తుంది.',
        calloutInvitationCountLabel: 'వినియోగదారులకు పంపిన పెండింగ్ ఆహ్వానాలు: {{count}}',
        calloutSuggestionCountLabel: 'వినియోగదారులకు పంపిన పెండింగ్ సూచనలు: {{count}}',
        manualInvitationOption__description: 'వినియోగదారులు సంస్థకు కేవలం మాన్యువల్‌గా మాత్రమే ఆహ్వానించబడతారు.',
        manualInvitationOption__label: 'స్వయంచాలక నమోదు లేదు',
        subtitle: 'ఈ డొమైన్ నుండి వినియోగదారులు సంస్థలో ఎలా చేరాలో ఎంచుకోండి.',
      },
      start: {
        headerTitle__danger: 'ప్రమాదం',
        headerTitle__enrollment: 'నమోదు ఎంపికలు',
      },
      subtitle: 'డొమైన్ {{domain}} ఇప్పుడు ధృవీకరించబడింది. నమోదు మోడ్‌ను ఎంచుకోవడం ద్వారా కొనసాగించండి.',
      title: '{{domain}}ని నవీకరించండి',
    },
    verifyDomainPage: {
      formSubtitle: 'మీ ఇమెయిల్ చిరునామాకు పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: 'డొమైన్ {{domainName}} ఇమెయిల్ ద్వారా ధృవీకరించబడాలి.',
      subtitleVerificationCodeScreen:
        'ధృవీకరణ కోడ్ {{emailAddress}}కి పంపబడింది. కొనసాగించడానికి కోడ్‌ను నమోదు చేయండి.',
      title: 'డొమైన్‌ను ధృవీకరించండి',
    },
  },
  organizationSwitcher: {
    action__closeOrganizationSwitcher: 'సంస్థ స్విచ్చర్‌ను మూసివేయి',
    action__createOrganization: 'సంస్థను సృష్టించండి',
    action__invitationAccept: 'చేరండి',
    action__manageOrganization: 'నిర్వహించండి',
    action__openOrganizationSwitcher: 'సంస్థ స్విచ్చర్‌ను తెరువు',
    action__suggestionsAccept: 'చేరడానికి అభ్యర్థించండి',
    notSelected: 'సంస్థ ఎంచుకోబడలేదు',
    personalWorkspace: 'వ్యక్తిగత ఖాతా',
    suggestionsAcceptedLabel: 'ఆమోదం కోసం పెండింగ్‌లో ఉంది',
  },
  paginationButton__next: 'తదుపరి',
  paginationButton__previous: 'ముందు',
  paginationRowText__displaying: 'ప్రదర్శిస్తోంది',
  paginationRowText__of: 'మొత్తం',
  reverification: {
    alternativeMethods: {
      actionLink: 'సహాయం పొందండి',
      actionText: 'వీటిలో ఏవీ లేవా?',
      blockButton__backupCode: 'బ్యాకప్ కోడ్‌ను ఉపయోగించండి',
      blockButton__emailCode: '{{identifier}}కి ఇమెయిల్ కోడ్',
      blockButton__passkey: 'మీ పాస్‌కీని ఉపయోగించండి',
      blockButton__password: 'మీ పాస్‌వర్డ్‌తో కొనసాగించండి',
      blockButton__phoneCode: '{{identifier}}కి SMS కోడ్‌ను పంపండి',
      blockButton__totp: 'మీ ప్రమాణీకరణ యాప్‌ను ఉపయోగించండి',
      getHelp: {
        blockButton__emailSupport: 'ఇమెయిల్ మద్దతు',
        content:
          'మీ ఖాతాను ధృవీకరించడంలో సమస్యలు ఉంటే, మాకు ఇమెయిల్ చేయండి మరియు మేము మీరు వీలైనంత త్వరగా ప్రాప్యతను పునరుద్ధరించడానికి మీతో పని చేస్తాము.',
        title: 'సహాయం పొందండి',
      },
      subtitle: 'సమస్యలు ఎదుర్కొంటున్నారా? ధృవీకరణ కోసం మీరు ఈ పద్ధతులలో దేనినైనా ఉపయోగించవచ్చు.',
      title: 'మరొక పద్ధతిని ఉపయోగించండి',
    },
    backupCodeMfa: {
      subtitle: 'రెండు-దశల ప్రామాణీకరణను సెటప్ చేసేటప్పుడు మీరు అందుకున్న బ్యాకప్ కోడ్‌ను నమోదు చేయండి',
      title: 'బ్యాకప్ కోడ్‌ను నమోదు చేయండి',
    },
    emailCode: {
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: 'కొనసాగించడానికి మీ ఇమెయిల్‌కి పంపిన కోడ్‌ను నమోదు చేయండి',
      title: 'ధృవీకరణ అవసరం',
    },
    noAvailableMethods: {
      message: 'ధృవీకరణతో కొనసాగలేము. సరైన ప్రమాణీకరణ కారకం కాన్ఫిగర్ చేయబడలేదు',
      subtitle: 'లోపం సంభవించింది',
      title: 'మీ ఖాతాను ధృవీకరించలేము',
    },
    passkey: {
      blockButton__passkey: 'మీ పాస్‌కీని ఉపయోగించండి',
      subtitle:
        'మీ పాస్‌కీని ఉపయోగించడం మీ గుర్తింపును నిర్ధారిస్తుంది. మీ పరికరం మీ వేలిముద్ర, ముఖం లేదా స్క్రీన్ లాక్ కోసం అడగవచ్చు.',
      title: 'మీ పాస్‌కీని ఉపయోగించండి',
    },
    password: {
      actionLink: 'మరొక పద్ధతిని ఉపయోగించండి',
      subtitle: 'కొనసాగించడానికి మీ ప్రస్తుత పాస్‌వర్డ్‌ను నమోదు చేయండి',
      title: 'ధృవీకరణ అవసరం',
    },
    phoneCode: {
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: 'కొనసాగించడానికి మీ ఫోన్‌కి పంపిన కోడ్‌ను నమోదు చేయండి',
      title: 'ధృవీకరణ అవసరం',
    },
    phoneCodeMfa: {
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: 'కొనసాగించడానికి మీ ఫోన్‌కి పంపిన కోడ్‌ను నమోదు చేయండి',
      title: 'ధృవీకరణ అవసరం',
    },
    totpMfa: {
      formTitle: 'ధృవీకరణ కోడ్',
      subtitle: 'కొనసాగించడానికి మీ ప్రమాణీకరణ యాప్ ద్వారా రూపొందించిన కోడ్‌ను నమోదు చేయండి',
      title: 'ధృవీకరణ అవసరం',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'ఖాతాను జోడించండి',
      action__signOutAll: 'అన్ని ఖాతాల నుండి సైన్ అవుట్ అవ్వండి',
      subtitle: 'మీరు కొనసాగించాలనుకుంటున్న ఖాతాను ఎంచుకోండి.',
      title: 'ఖాతాను ఎంచుకోండి',
    },
    alternativeMethods: {
      actionLink: 'సహాయం పొందండి',
      actionText: 'వీటిలో ఏవీ లేవా?',
      blockButton__backupCode: 'బ్యాకప్ కోడ్‌ను ఉపయోగించండి',
      blockButton__emailCode: '{{identifier}}కి ఇమెయిల్ కోడ్',
      blockButton__emailLink: '{{identifier}}కి ఇమెయిల్ లింక్',
      blockButton__passkey: 'మీ పాస్‌కీతో సైన్ ఇన్ చేయండి',
      blockButton__password: 'మీ పాస్‌వర్డ్‌తో సైన్ ఇన్ చేయండి',
      blockButton__phoneCode: '{{identifier}}కి SMS కోడ్‌ను పంపండి',
      blockButton__totp: 'మీ ప్రమాణీకరణ యాప్‌ను ఉపయోగించండి',
      getHelp: {
        blockButton__emailSupport: 'ఇమెయిల్ మద్దతు',
        content:
          'మీ ఖాతాలో సైన్ ఇన్ చేయడంలో సమస్యలు ఉంటే, మాకు ఇమెయిల్ చేయండి మరియు మేము మీరు వీలైనంత త్వరగా ప్రాప్యతను పునరుద్ధరించడానికి మీతో పని చేస్తాము.',
        title: 'సహాయం పొందండి',
      },
      subtitle: 'సమస్యలు ఎదుర్కొంటున్నారా? సైన్ ఇన్ చేయడానికి మీరు ఈ పద్ధతులలో దేనినైనా ఉపయోగించవచ్చు.',
      title: 'మరొక పద్ధతిని ఉపయోగించండి',
    },
    alternativePhoneCodeProvider: {
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్లీ పంపు',
      subtitle: '{{applicationName}}కి కొనసాగడానికి',
      title: 'మీ {{provider}}ని తనిఖీ చేయండి',
    },
    backupCodeMfa: {
      subtitle: 'మీ బ్యాకప్ కోడ్ రెండు-దశల ప్రమాణీకరణను సెటప్ చేసేటప్పుడు మీరు పొందిన కోడ్.',
      title: 'బ్యాకప్ కోడ్‌ను నమోదు చేయండి',
    },
    emailCode: {
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: '{{applicationName}}కి కొనసాగించడానికి',
      title: 'మీ ఇమెయిల్‌ను తనిఖీ చేయండి',
    },
    emailCodeMfa: {
      formTitle: 'మీ ఇమెయిల్‌ను తనిఖీ చేయండి',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: '{{applicationName}}కి కొనసాగించడానికి',
      title: 'మీ ఇమెయిల్‌ను తనిఖీ చేయండి',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'కొనసాగించడానికి, మీరు సైన్-ఇన్ ప్రారంభించిన పరికరం మరియు బ్రౌజర్‌లో ధృవీకరణ లింక్‌ను తెరవండి',
        title: 'ఈ పరికరానికి ధృవీకరణ లింక్ చెల్లదు',
      },
      expired: {
        subtitle: 'కొనసాగించడానికి అసలు ట్యాబ్‌కి తిరిగి వెళ్ళండి.',
        title: 'ఈ ధృవీకరణ లింక్ గడువు ముగిసింది',
      },
      failed: {
        subtitle: 'కొనసాగించడానికి అసలు ట్యాబ్‌కి తిరిగి వెళ్ళండి.',
        title: 'ఈ ధృవీకరణ లింక్ చెల్లనిది',
      },
      formSubtitle: 'మీ ఇమెయిల్‌కి పంపిన ధృవీకరణ లింక్‌ను ఉపయోగించండి',
      formTitle: 'ధృవీకరణ లింక్',
      loading: {
        subtitle: 'మీరు త్వరలో పునఃనిర్దేశించబడతారు',
        title: 'సైన్ ఇన్ చేస్తోంది...',
      },
      resendButton: 'లింక్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: '{{applicationName}}కి కొనసాగించడానికి',
      title: 'మీ ఇమెయిల్‌ను తనిఖీ చేయండి',
      unusedTab: {
        title: 'మీరు ఈ ట్యాబ్‌ను మూసివేయవచ్చు',
      },
      verified: {
        subtitle: 'మీరు త్వరలో పునఃనిర్దేశించబడతారు',
        title: 'విజయవంతంగా సైన్ ఇన్ చేశారు',
      },
      verifiedSwitchTab: {
        subtitle: 'కొనసాగించడానికి అసలు ట్యాబ్‌కి తిరిగి వెళ్ళండి',
        subtitleNewTab: 'కొనసాగించడానికి కొత్తగా తెరిచిన ట్యాబ్‌కి తిరిగి వెళ్ళండి',
        titleNewTab: 'ఇతర ట్యాబ్‌లో సైన్ ఇన్ చేశారు',
      },
    },
    emailLinkMfa: {
      formSubtitle: 'మీ ఇమెయిల్‌కు పంపబడిన ధృవీకరణ లింక్‌ను ఉపయోగించండి',
      resendButton: 'లింక్ రాలేదా? మళ్లీ పంపండి',
      subtitle: '{{applicationName}} కు కొనసాగించడానికి',
      title: 'మీ ఇమెయిల్‌ను తనిఖీ చేయండి',
    },
    enterpriseConnections: {
      subtitle: 'మీరు కొనసాగించాలనుకుంటున్న ఎంటర్‌ప్రైజ్ ఖాతాను ఎంచుకోండి.',
      title: 'మీ ఎంటర్‌ప్రైజ్ ఖాతాను ఎంచుకోండి',
    },
    forgotPassword: {
      formTitle: 'పాస్‌వర్డ్ రీసెట్ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: 'మీ పాస్‌వర్డ్‌ను రీసెట్ చేయడానికి',
      subtitle_email: 'మొదట, మీ ఇమెయిల్ చిరునామాకు పంపిన కోడ్‌ను నమోదు చేయండి',
      subtitle_phone: 'మొదట, మీ ఫోన్‌కి పంపిన కోడ్‌ను నమోదు చేయండి',
      title: 'పాస్‌వర్డ్ రీసెట్ చేయండి',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'మీ పాస్‌వర్డ్‌ను రీసెట్ చేయండి',
      label__alternativeMethods: 'లేదా, మరొక పద్ధతితో సైన్ ఇన్ చేయండి',
      title: 'పాస్‌వర్డ్ మర్చిపోయారా?',
    },
    newDeviceVerificationNotice:
      'మీరు కొత్త పరికరం నుండి సైన్ ఇన్ చేస్తున్నారు. మీ ఖాతాను సురక్షితంగా ఉంచడానికి మేము ధృవీకరణను అభ్యర్థిస్తున్నాము.',
    noAvailableMethods: {
      message: 'సైన్ ఇన్‌తో కొనసాగలేము. అందుబాటులో ఉన్న ప్రమాణీకరణ కారకం లేదు.',
      subtitle: 'లోపం సంభవించింది',
      title: 'సైన్ ఇన్ చేయలేము',
    },
    passkey: {
      subtitle:
        'మీ పాస్‌కీని ఉపయోగించడం అది మీరని నిర్ధారిస్తుంది. మీ పరికరం మీ వేలిముద్ర, ముఖం లేదా స్క్రీన్ లాక్ కోసం అడగవచ్చు.',
      title: 'మీ పాస్‌కీని ఉపయోగించండి',
    },
    password: {
      actionLink: 'మరొక పద్ధతిని ఉపయోగించండి',
      subtitle: 'మీ ఖాతాతో సంబంధం ఉన్న పాస్‌వర్డ్‌ను నమోదు చేయండి',
      title: 'మీ పాస్‌వర్డ్‌ను నమోదు చేయండి',
    },
    passwordCompromised: {
      title: 'పాస్‌వర్డ్ రాజీపడింది',
    },
    passwordPwned: {
      title: 'పాస్‌వర్డ్ ప్రమాదంలో ఉంది',
    },
    passwordUntrusted: {
      title: 'పాస్‌వర్డ్ విశ్వసనీయం కాదు',
    },
    phoneCode: {
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: '{{applicationName}}కి కొనసాగించడానికి',
      title: 'మీ ఫోన్‌ను తనిఖీ చేయండి',
    },
    phoneCodeMfa: {
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: 'కొనసాగించడానికి, దయచేసి మీ ఫోన్‌కి పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      title: 'మీ ఫోన్‌ను తనిఖీ చేయండి',
    },
    resetPassword: {
      formButtonPrimary: 'పాస్‌వర్డ్ రీసెట్ చేయండి',
      requiredMessage: 'భద్రతా కారణాల వల్ల, మీ పాస్‌వర్డ్‌ను రీసెట్ చేయడం అవసరం.',
      successMessage:
        'మీ పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది. మిమ్మల్ని సైన్ ఇన్ చేస్తోంది, దయచేసి ఒక క్షణం వేచి ఉండండి.',
      title: 'కొత్త పాస్‌వర్డ్‌ను సెట్ చేయండి',
    },
    resetPasswordMfa: {
      detailsLabel: 'మీ పాస్‌వర్డ్‌ను రీసెట్ చేయడానికి ముందు మీ గుర్తింపును మేము ధృవీకరించాలి.',
    },
    start: {
      actionLink: 'సైన్ అప్ చేయండి',
      actionLink__join_waitlist: 'వెయిట్‌లిస్ట్‌లో చేరండి',
      actionLink__use_email: 'ఇమెయిల్‌ను ఉపయోగించండి',
      actionLink__use_email_username: 'ఇమెయిల్ లేదా వినియోగదారు పేరును ఉపయోగించండి',
      actionLink__use_passkey: 'బదులుగా పాస్‌కీని ఉపయోగించండి',
      actionLink__use_phone: 'ఫోన్‌ను ఉపయోగించండి',
      actionLink__use_username: 'వినియోగదారు పేరును ఉపయోగించండి',
      actionText: 'ఖాతా లేదా?',
      actionText__join_waitlist: 'త్వరగా ప్రాప్యత కావాలా?',
      alternativePhoneCodeProvider: {
        actionLink: 'మరొక పద్ధతిని ఉపయోగించు',
        label: '{{provider}} ఫోన్ నంబర్',
        subtitle: '{{provider}}లో ధృవీకరణ కోడ్‌ను పొందడానికి మీ ఫోన్ నంబర్‌ను నమోదు చేయండి.',
        title: '{{provider}}తో {{applicationName}}కి సైన్ ఇన్ చేయండి',
      },
      subtitle: 'మళ్ళీ స్వాగతం! కొనసాగించడానికి దయచేసి సైన్ ఇన్ చేయండి',
      subtitleCombined: undefined,
      title: '{{applicationName}}కి సైన్ ఇన్ చేయండి',
      titleCombined: '{{applicationName}}కి కొనసాగించండి',
    },
    totpMfa: {
      formTitle: 'ధృవీకరణ కోడ్',
      subtitle: 'కొనసాగించడానికి, దయచేసి మీ ప్రమాణీకరణ యాప్ ద్వారా రూపొందించిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      title: 'రెండు-దశల ధృవీకరణ',
    },
    web3Solana: {
      subtitle: 'సైన్ ఇన్ చేయడానికి క్రింద వాలెట్‌ను ఎంచుకోండి',
      title: 'Solana తో సైన్ ఇన్ చేయండి',
    },
  },
  signInEnterPasswordTitle: 'మీ పాస్‌వర్డ్‌ను నమోదు చేయండి',
  signUp: {
    alternativePhoneCodeProvider: {
      resendButton: 'కోడ్ అందలేదా? మళ్లీ పంపు',
      subtitle: 'మీ {{provider}}కి పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      title: 'మీ {{provider}}ని ధృవీకరించండి',
    },
    continue: {
      actionLink: 'సైన్ ఇన్ చేయండి',
      actionText: 'ఇప్పటికే ఖాతా ఉందా?',
      subtitle: 'కొనసాగించడానికి దయచేసి మిగిలిన వివరాలను పూరించండి.',
      title: 'లేని ఫీల్డ్‌లను పూరించండి',
    },
    emailCode: {
      formSubtitle: 'మీ ఇమెయిల్ చిరునామాకు పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: 'మీ ఇమెయిల్‌కి పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      title: 'మీ ఇమెయిల్‌ను ధృవీకరించండి',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'కొనసాగించడానికి, మీరు సైన్-అప్ ప్రారంభించిన పరికరం మరియు బ్రౌజర్‌లో ధృవీకరణ లింక్‌ను తెరవండి',
        title: 'ఈ పరికరానికి ధృవీకరణ లింక్ చెల్లదు',
      },
      formSubtitle: 'మీ ఇమెయిల్ చిరునామాకు పంపిన ధృవీకరణ లింక్‌ను ఉపయోగించండి',
      formTitle: 'ధృవీకరణ లింక్',
      loading: {
        title: 'సైన్ అప్ చేస్తోంది...',
      },
      resendButton: 'లింక్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: '{{applicationName}}కి కొనసాగించడానికి',
      title: 'మీ ఇమెయిల్‌ను ధృవీకరించండి',
      verified: {
        title: 'విజయవంతంగా సైన్ అప్ చేశారు',
      },
      verifiedSwitchTab: {
        subtitle: 'కొనసాగించడానికి కొత్తగా తెరిచిన ట్యాబ్‌కి తిరిగి వెళ్ళండి',
        subtitleNewTab: 'కొనసాగించడానికి మునుపటి ట్యాబ్‌కి తిరిగి వెళ్ళండి',
        title: 'విజయవంతంగా ఇమెయిల్ ధృవీకరించబడింది',
      },
    },
    enterpriseConnections: {
      subtitle: 'మీరు కొనసాగించాలనుకుంటున్న ఎంటర్‌ప్రైజ్ ఖాతాను ఎంచుకోండి.',
      title: 'మీ ఎంటర్‌ప్రైజ్ ఖాతాను ఎంచుకోండి',
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'నేను {{ privacyPolicyLink || link("గోప్యతా విధానం") }}కి అంగీకరిస్తున్నాను',
        label__onlyTermsOfService: 'నేను {{ termsOfServiceLink || link("సేవా నిబంధనలు") }}కి అంగీకరిస్తున్నాను',
        label__termsOfServiceAndPrivacyPolicy:
          'నేను {{ termsOfServiceLink || link("సేవా నిబంధనలు") }} మరియు {{ privacyPolicyLink || link("గోప్యతా విధానం") }}కి అంగీకరిస్తున్నాను',
      },
      continue: {
        subtitle: 'కొనసాగించడానికి దయచేసి నిబంధనలను చదివి అంగీకరించండి',
        title: 'చట్టపరమైన అంగీకారం',
      },
    },
    phoneCode: {
      formSubtitle: 'మీ ఫోన్ నంబర్‌కి పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      formTitle: 'ధృవీకరణ కోడ్',
      resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
      subtitle: 'మీ ఫోన్‌కి పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      title: 'మీ ఫోన్‌ను ధృవీకరించండి',
    },
    restrictedAccess: {
      actionLink: 'సైన్ ఇన్ చేయండి',
      actionText: 'ఇప్పటికే ఖాతా ఉందా?',
      blockButton__emailSupport: 'ఇమెయిల్ మద్దతు',
      blockButton__joinWaitlist: 'వెయిట్‌లిస్ట్‌లో చేరండి',
      subtitle:
        'ప్రస్తుతం సైన్ అప్‌లు నిలిపివేయబడ్డాయి. మీకు ప్రాప్యత ఉండాలని మీరు నమ్మితే, దయచేసి మద్దతును సంప్రదించండి.',
      subtitleWaitlist:
        'ప్రస్తుతం సైన్ అప్‌లు నిలిపివేయబడ్డాయి. మేము ప్రారంభించినప్పుడు తెలుసుకోడానికి వెయిట్‌లిస్ట్‌లో చేరండి.',
      title: 'ప్రాప్యత పరిమితం చేయబడింది',
    },
    start: {
      actionLink: 'సైన్ ఇన్ చేయండి',
      actionLink__use_email: 'బదులుగా ఇమెయిల్‌ను ఉపయోగించండి',
      actionLink__use_phone: 'బదులుగా ఫోన్‌ను ఉపయోగించండి',
      actionText: 'ఇప్పటికే ఖాతా ఉందా?',
      alternativePhoneCodeProvider: {
        actionLink: 'మరొక పద్ధతిని ఉపయోగించు',
        label: '{{provider}} ఫోన్ నంబర్',
        subtitle: '{{provider}}లో ధృవీకరణ కోడ్‌ను పొందడానికి మీ ఫోన్ నంబర్‌ను నమోదు చేయండి.',
        title: '{{provider}}తో {{applicationName}}కి సైన్ అప్ చేయండి',
      },
      subtitle: 'స్వాగతం! ప్రారంభించడానికి దయచేసి వివరాలను పూరించండి.',
      subtitleCombined: 'స్వాగతం! ప్రారంభించడానికి దయచేసి వివరాలను పూరించండి.',
      title: 'మీ ఖాతాను సృష్టించండి',
      titleCombined: 'మీ ఖాతాను సృష్టించండి',
    },
    web3Solana: {
      subtitle: 'సైన్ అప్ చేయడానికి క్రింద వాలెట్‌ను ఎంచుకోండి',
      title: 'Solana తో సైన్ అప్ చేయండి',
    },
  },
  socialButtonsBlockButton: '{{provider|titleize}}తో కొనసాగించండి',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  taskChooseOrganization: {
    alerts: {
      organizationAlreadyExists:
        'గుర్తించిన కంపెనీ పేరు ({{organizationName}}) మరియు {{organizationDomain}} కోసం ఒక సంస్థ ఇప్పటికే ఉంది. ఆహ్వానం ద్వారా చేరండి.',
    },
    chooseOrganization: {
      action__createOrganization: 'కొత్త సంస్థను సృష్టించండి',
      action__invitationAccept: 'చేరండి',
      action__suggestionsAccept: 'చేరడానికి అభ్యర్థించండి',
      subtitle: 'ఇప్పటికే ఉన్న సంస్థలో చేరండి లేదా కొత్తదాన్ని సృష్టించండి',
      subtitle__createOrganizationDisabled: 'ఇప్పటికే ఉన్న సంస్థలో చేరండి',
      suggestionsAcceptedLabel: 'ఆమోదం కోసం పెండింగ్‌లో ఉంది',
      title: 'ఒక సంస్థను ఎంచుకోండి',
    },
    createOrganization: {
      formButtonReset: 'రద్దు చేయి',
      formButtonSubmit: 'కొనసాగించు',
      formFieldInputPlaceholder__name: 'నా సంస్థ',
      formFieldInputPlaceholder__slug: 'na-sanstha',
      formFieldLabel__name: 'పేరు',
      formFieldLabel__slug: 'స్లగ్',
      subtitle: 'కొనసాగించడానికి మీ సంస్థ వివరాలను నమోదు చేయండి',
      title: 'మీ సంస్థను సెటప్ చేయండి',
    },
    organizationCreationDisabled: {
      subtitle: 'ఆహ్వానం కోసం మీ సంస్థ నిర్వాహకుడిని సంప్రదించండి.',
      title: 'మీరు ఒక సంస్థకు చెంది ఉండాలి',
    },
    signOut: {
      actionLink: 'సైన్ అవుట్',
      actionText: '{{identifier}}గా సైన్ ఇన్ చేయబడింది',
    },
  },
  taskResetPassword: {
    formButtonPrimary: 'పాస్‌వర్డ్‌ను రీసెట్ చేయి',
    signOut: {
      actionLink: 'సైన్ అవుట్',
      actionText: '{{identifier}}గా సైన్ ఇన్ చేయబడింది',
    },
    subtitle: 'మీరు కొనసాగడానికి ముందు మీ ఖాతాకు కొత్త పాస్‌వర్డ్ అవసరం',
    title: 'మీ పాస్‌వర్డ్‌ను రీసెట్ చేయండి',
  },
  taskSetupMfa: {
    badge: 'రెండు-దశల ధృవీకరణ సెటప్',
    signOut: {
      actionLink: 'సైన్ అవుట్',
      actionText: '{{identifier}}గా సైన్ ఇన్ చేయబడింది',
    },
    smsCode: {
      addPhone: {
        formButtonPrimary: 'కొనసాగించు',
        infoText:
          'ధృవీకరణ కోడ్‌ను కలిగి ఉన్న టెక్స్ట్ సందేశం ఈ ఫోన్ నంబర్‌కు పంపబడుతుంది. సందేశం మరియు డేటా ఛార్జీలు వర్తించవచ్చు.',
      },
      addPhoneNumber: 'ఫోన్ నంబర్‌ను జోడించు',
      cancel: 'రద్దు చేయి',
      subtitle: 'SMS కోడ్ రెండు-దశల ధృవీకరణ కోసం మీరు ఉపయోగించాలనుకుంటున్న ఫోన్ నంబర్‌ను ఎంచుకోండి',
      success: {
        finishButton: 'కొనసాగించు',
        message1:
          'రెండు-దశల ధృవీకరణ ఇప్పుడు ప్రారంభించబడింది. సైన్ ఇన్ చేసేటప్పుడు, అదనపు దశగా ఈ ఫోన్ నంబర్‌కు పంపిన ధృవీకరణ కోడ్‌ను మీరు నమోదు చేయాలి.',
        message2:
          'ఈ బ్యాకప్ కోడ్‌లను సేవ్ చేసి సురక్షితమైన చోట భద్రపరచండి. మీ ప్రామాణీకరణ పరికరానికి ప్రాప్యతను కోల్పోతే, సైన్ ఇన్ చేయడానికి మీరు బ్యాకప్ కోడ్‌లను ఉపయోగించవచ్చు.',
        title: 'SMS కోడ్ ధృవీకరణ ప్రారంభించబడింది',
      },
      title: 'SMS కోడ్ ధృవీకరణను జోడించు',
      verifyPhone: {
        formButtonPrimary: 'కొనసాగించు',
        formTitle: 'ధృవీకరణ కోడ్',
        resendButton: 'కోడ్ అందలేదా? మళ్లీ పంపు',
        subtitle: 'దీనికి పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
        title: 'మీ ఫోన్ నంబర్‌ను ధృవీకరించండి',
      },
    },
    start: {
      methodSelection: {
        phoneCode: 'SMS కోడ్',
        totp: 'ప్రామాణీకరణ అప్లికేషన్',
      },
      subtitle: 'అదనపు భద్రతా పొరతో మీ ఖాతాను రక్షించడానికి మీరు ఏ పద్ధతిని ఇష్టపడతారో ఎంచుకోండి',
      title: 'రెండు-దశల ధృవీకరణను సెటప్ చేయండి',
    },
    totpCode: {
      addAuthenticatorApp: {
        buttonAbleToScan__nonPrimary: 'బదులుగా QR కోడ్‌ను స్కాన్ చేయి',
        buttonUnableToScan__nonPrimary: 'QR కోడ్‌ను స్కాన్ చేయలేకపోతున్నారా?',
        formButtonPrimary: 'కొనసాగించు',
        formButtonReset: 'రద్దు చేయి',
        infoText__ableToScan:
          'మీ ప్రామాణీకరణ యాప్‌లో కొత్త సైన్-ఇన్ పద్ధతిని సెటప్ చేసి, దాన్ని మీ ఖాతాకు లింక్ చేయడానికి కింది QR కోడ్‌ను స్కాన్ చేయండి.',
        infoText__unableToScan:
          'మీ ప్రామాణీకరణలో కొత్త సైన్-ఇన్ పద్ధతిని సెటప్ చేసి, దిగువ అందించిన కీని నమోదు చేయండి.',
        inputLabel__unableToScan1:
          'సమయ-ఆధారిత లేదా ఒక-సారి పాస్‌వర్డ్‌లు ప్రారంభించబడ్డాయని నిర్ధారించుకోండి, ఆపై మీ ఖాతాను లింక్ చేయడాన్ని పూర్తి చేయండి.',
      },
      success: {
        finishButton: 'కొనసాగించు',
        message1:
          'రెండు-దశల ధృవీకరణ ఇప్పుడు ప్రారంభించబడింది. సైన్ ఇన్ చేసేటప్పుడు, అదనపు దశగా ఈ ప్రామాణీకరణ నుండి ధృవీకరణ కోడ్‌ను మీరు నమోదు చేయాలి.',
        message2:
          'ఈ బ్యాకప్ కోడ్‌లను సేవ్ చేసి సురక్షితమైన చోట భద్రపరచండి. మీ ప్రామాణీకరణ పరికరానికి ప్రాప్యతను కోల్పోతే, సైన్ ఇన్ చేయడానికి మీరు బ్యాకప్ కోడ్‌లను ఉపయోగించవచ్చు.',
        title: 'ప్రామాణీకరణ అప్లికేషన్ ధృవీకరణ ప్రారంభించబడింది',
      },
      title: 'ప్రామాణీకరణ అప్లికేషన్‌ను జోడించు',
      verifyTotp: {
        formButtonPrimary: 'కొనసాగించు',
        formButtonReset: 'రద్దు చేయి',
        formTitle: 'ధృవీకరణ కోడ్',
        subtitle: 'మీ ప్రామాణీకరణ ద్వారా రూపొందించబడిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
        title: 'ప్రామాణీకరణ అప్లికేషన్‌ను జోడించు',
      },
    },
  },
  unstable__errors: {
    already_a_member_in_organization: '{{email}} ఇప్పటికే సంస్థ సభ్యుడు.',
    api_key_name_already_exists: undefined,
    api_key_usage_exceeded: undefined,
    avatar_file_size_exceeded: 'ఫైల్ పరిమాణం గరిష్ట 10MB పరిమితిని మించిపోయింది. దయచేసి చిన్న ఫైల్‌ను ఎంచుకోండి.',
    avatar_file_type_invalid: 'ఫైల్ రకం సపోర్ట్ చేయబడలేదు. దయచేసి JPG, PNG, GIF లేదా WEBP చిత్రాన్ని అప్‌లోడ్ చేయండి.',
    captcha_invalid:
      'భద్రతా ధృవీకరణలు విఫలమైనందున సైన్ అప్ విజయవంతం కాలేదు. మళ్ళీ ప్రయత్నించడానికి దయచేసి పేజీని రిఫ్రెష్ చేయండి లేదా మరింత సహాయం కోసం మద్దతును సంప్రదించండి.',
    captcha_unavailable:
      'బాట్ ధృవీకరణ విఫలమైనందున సైన్ అప్ విజయవంతం కాలేదు. మళ్ళీ ప్రయత్నించడానికి దయచేసి పేజీని రిఫ్రెష్ చేయండి లేదా మరింత సహాయం కోసం మద్దతును సంప్రదించండి.',
    form_code_incorrect: undefined,
    form_email_address_blocked:
      'తాత్కాలిక ఇమెయిల్ సేవలు మద్దతు లేవు. దయచేసి ఖాతాను సృష్టించడానికి మీ సాధారణ ఇమెయిల్ చిరునామాను ఉపయోగించండి.',
    form_identifier_exists__email_address: 'ఈ ఇమెయిల్ చిరునామా తీసుకోబడింది. దయచేసి మరొకదాన్ని ప్రయత్నించండి.',
    form_identifier_exists__phone_number: 'ఈ ఫోన్ నంబర్ తీసుకోబడింది. దయచేసి మరొకదాన్ని ప్రయత్నించండి.',
    form_identifier_exists__username: 'ఈ వినియోగదారు పేరు తీసుకోబడింది. దయచేసి మరొకదాన్ని ప్రయత్నించండి.',
    form_identifier_not_found: 'ఈ గుర్తింపుదారుతో ఖాతా కనుగొనబడలేదు. దయచేసి తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.',
    form_new_password_matches_current: 'కొత్త పాస్‌వర్డ్ ప్రస్తుత పాస్‌వర్డ్‌తో సమానంగా ఉండకూడదు.',
    form_param_format_invalid: 'నమోదు చేసిన విలువ చెల్లని ఫార్మాట్‌లో ఉంది. దయచేసి తనిఖీ చేసి దిద్దుబాటు చేయండి.',
    form_param_format_invalid__email_address: 'ఇమెయిల్ చిరునామా చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామా అయి ఉండాలి.',
    form_param_format_invalid__phone_number: 'ఫోన్ నంబర్ చెల్లుబాటు అయ్యే అంతర్జాతీయ ఫార్మాట్‌లో ఉండాలి.',
    form_param_max_length_exceeded__first_name: 'మొదటి పేరు 256 అక్షరాలను మించకూడదు.',
    form_param_max_length_exceeded__last_name: 'చివరి పేరు 256 అక్షరాలను మించకూడదు.',
    form_param_max_length_exceeded__name: 'పేరు 256 అక్షరాలను మించకూడదు.',
    form_param_nil: 'ఈ ఫీల్డ్ అవసరం మరియు ఖాళీగా ఉండకూడదు.',
    form_param_type_invalid: undefined,
    form_param_type_invalid__email_address: undefined,
    form_param_type_invalid__phone_number: undefined,
    form_param_value_invalid: 'నమోదు చేసిన విలువ చెల్లనిది. దయచేసి దిద్దుబాటు చేయండి.',
    form_password_compromised__sign_in: undefined,
    form_password_incorrect: 'మీరు నమోదు చేసిన పాస్‌వర్డ్ తప్పు. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    form_password_length_too_short: 'మీ పాస్‌వర్డ్ చాలా చిన్నది. ఇది కనీసం 8 అక్షరాల పొడవు ఉండాలి.',
    form_password_not_strong_enough: 'మీ పాస్‌వర్డ్ సరిపడా బలంగా లేదు.',
    form_password_or_identifier_incorrect:
      'పాస్‌వర్డ్ లేదా ఇమెయిల్ చిరునామా తప్పు. దయచేసి మళ్ళీ ప్రయత్నించండి లేదా మరొక పద్ధతిని ఉపయోగించండి.',
    form_password_pwned:
      'ఈ పాస్‌వర్డ్ డేటా ఉల్లంఘన భాగంగా కనుగొనబడింది మరియు ఉపయోగించడానికి వీలుపడదు, దయచేసి మరొక పాస్‌వర్డ్‌ను ప్రయత్నించండి.',
    form_password_pwned__sign_in:
      'ఈ పాస్‌వర్డ్ డేటా ఉల్లంఘన భాగంగా కనుగొనబడింది మరియు ఉపయోగించడానికి వీలుపడదు, దయచేసి మీ పాస్‌వర్డ్‌ను రీసెట్ చేయండి.',
    form_password_size_in_bytes_exceeded:
      'మీ పాస్‌వర్డ్ అనుమతించిన గరిష్ట బైట్ల సంఖ్యను మించింది, దయచేసి దాన్ని చిన్నదిగా చేయండి లేదా కొన్ని ప్రత్యేక అక్షరాలను తొలగించండి.',
    form_password_untrusted__sign_in:
      'మీ పాస్‌వర్డ్ రాజీపడి ఉండవచ్చు. మీ ఖాతాను రక్షించడానికి, దయచేసి ప్రత్యామ్నాయ సైన్-ఇన్ పద్ధతితో కొనసాగండి. సైన్ ఇన్ చేసిన తర్వాత మీ పాస్‌వర్డ్‌ను రీసెట్ చేయవలసి ఉంటుంది.',
    form_password_validation_failed: 'తప్పు పాస్‌వర్డ్',
    form_username_invalid_character:
      'మీ వినియోగదారు పేరులో చెల్లని అక్షరాలు ఉన్నాయి. దయచేసి అక్షరాలు, సంఖ్యలు మరియు అండర్‌స్కోర్‌లను మాత్రమే ఉపయోగించండి.',
    form_username_invalid_length: 'మీ వినియోగదారు పేరు {{min_length}} మరియు {{max_length}} అక్షరాల మధ్య ఉండాలి.',
    form_username_needs_non_number_char: 'మీ వినియోగదారు పేరులో కనీసం ఒక సంఖ్యేతర అక్షరం ఉండాలి.',
    identification_deletion_failed: 'మీరు మీ చివరి గుర్తింపును తొలగించలేరు.',
    insufficient_seats_change_plan: undefined,
    insufficient_seats_contact_support: undefined,
    not_allowed_access:
      'మీకు ఈ పేజీని యాక్సెస్ చేయడానికి అనుమతి లేదు. ఇది లోపం అని మీరు నమ్మితే దయచేసి మద్దతును సంప్రదించండి.',
    oauth_access_denied: undefined,
    organization_domain_blocked: 'ఇది నిరోధించబడిన ఇమెయిల్ ప్రొవైడర్ డొమైన్. దయచేసి వేరొకదాన్ని ఉపయోగించండి.',
    organization_domain_common: 'ఇది సాధారణ ఇమెయిల్ ప్రొవైడర్ డొమైన్. దయచేసి వేరొకదాన్ని ఉపయోగించండి.',
    organization_domain_exists_for_enterprise_connection: 'ఈ డొమైన్ ఇప్పటికే మీ సంస్థ SSOకి ఉపయోగించబడుతోంది',
    organization_membership_quota_exceeded:
      'మీరు మీ సంస్థ సభ్యత్వాలను, పెండింగ్ ఆహ్వానాలతో సహా పరిమితిని చేరుకున్నారు.',
    organization_minimum_permissions_needed: 'కనీస అవసరమైన అనుమతులు కలిగిన కనీసం ఒక సంస్థ సభ్యుడు ఉండాలి.',
    organization_not_found_or_unauthorized:
      'మీరు ఇకపై ఈ సంస్థలో సభ్యులు కాదు. దయచేసి మరొకదాన్ని ఎంచుకోండి లేదా సృష్టించండి.',
    organization_not_found_or_unauthorized_with_create_organization_disabled:
      'మీరు ఇకపై ఈ సంస్థలో సభ్యులు కాదు. దయచేసి మరొకదాన్ని ఎంచుకోండి.',
    passkey_already_exists: 'ఈ పరికరంతో పాస్‌కీ ఇప్పటికే నమోదు చేయబడింది.',
    passkey_not_supported: 'పాస్‌కీలు ఈ పరికరంలో మద్దతు లేవు.',
    passkey_pa_not_supported: 'నమోదు కోసం ప్లాట్‌ఫామ్ ప్రమాణీకరణకర్త అవసరం కానీ పరికరం దానికి మద్దతు ఇవ్వదు.',
    passkey_registration_cancelled: 'పాస్‌కీ నమోదు రద్దు చేయబడింది లేదా సమయం ముగిసింది.',
    passkey_retrieval_cancelled: 'పాస్‌కీ ధృవీకరణ రద్దు చేయబడింది లేదా సమయం ముగిసింది.',
    passwordComplexity: {
      maximumLength: '{{length}} కంటే తక్కువ అక్షరాలు',
      minimumLength: '{{length}} లేదా అంతకంటే ఎక్కువ అక్షరాలు',
      requireLowercase: 'ఒక చిన్న అక్షరం',
      requireNumbers: 'ఒక సంఖ్య',
      requireSpecialCharacter: 'ఒక ప్రత్యేక అక్షరం',
      requireUppercase: 'ఒక పెద్ద అక్షరం',
      sentencePrefix: 'మీ పాస్‌వర్డ్‌లో ఉండాలి',
    },
    phone_number_exists: 'ఈ ఫోన్ నంబర్ తీసుకోబడింది. దయచేసి మరొకదాన్ని ప్రయత్నించండి.',
    session_exists: undefined,
    web3_missing_identifier: 'Web3 వాలెట్ పొడిగింపు కనుగొనబడలేదు. కొనసాగించడానికి దయచేసి ఒకదాన్ని ఇన్‌స్టాల్ చేయండి.',
    web3_signature_request_rejected: 'మీరు సంతకం అభ్యర్థనను తిరస్కరించారు. కొనసాగేందుకు దయచేసి మళ్లీ ప్రయత్నించండి.',
    web3_solana_signature_generation_failed:
      'సంతకం తయారు చేసే సమయంలో లోపం జరిగింది. కొనసాగేందుకు దయచేసి మళ్లీ ప్రయత్నించండి.',
    zxcvbn: {
      couldBeStronger:
        'మీ పాస్‌వర్డ్ పనిచేస్తుంది, కానీ మరింత బలంగా ఉండవచ్చు. మరిన్ని అక్షరాలను జోడించడానికి ప్రయత్నించండి.',
      goodPassword: 'మీ పాస్‌వర్డ్ అన్ని అవసరమైన అవసరాలను తీరుస్తుంది.',
      notEnough: 'మీ పాస్‌వర్డ్ సరిపడా బలంగా లేదు.',
      suggestions: {
        allUppercase: 'కొన్ని అక్షరాలను కేపిటలైజ్ చేయండి, కానీ అన్నింటినీ కాదు.',
        anotherWord: 'తక్కువ సాధారణమైన మరిన్ని పదాలను జోడించండి.',
        associatedYears: 'మీతో సంబంధం ఉన్న సంవత్సరాలను నివారించండి.',
        capitalization: 'మొదటి అక్షరం కంటే ఎక్కువ అక్షరాలను కేపిటలైజ్ చేయండి.',
        dates: 'మీతో సంబంధం ఉన్న తేదీలు మరియు సంవత్సరాలను నివారించండి.',
        l33t: "'a' కోసం '@' వంటి అనుమానిత అక్షర ప్రత్యామ్నాయాలను నివారించండి.",
        longerKeyboardPattern: 'పొడవైన కీబోర్డ్ నమూనాలను ఉపయోగించండి మరియు టైపింగ్ దిశను పలుమార్లు మార్చండి.',
        noNeed: 'చిహ్నాలు, సంఖ్యలు లేదా పెద్ద అక్షరాలను ఉపయోగించకుండానే మీరు బలమైన పాస్‌వర్డ్‌లను సృష్టించవచ్చు.',
        pwned: 'మీరు ఈ పాస్‌వర్డ్‌ను మరెక్కడైనా ఉపయోగిస్తే, మీరు దాన్ని మార్చాలి.',
        recentYears: 'ఇటీవలి సంవత్సరాలను నివారించండి.',
        repeated: 'పునరావృత పదాలు మరియు అక్షరాలను నివారించండి.',
        reverseWords: 'సాధారణ పదాల తిరగవేసిన స్పెల్లింగ్‌లను నివారించండి.',
        sequences: 'సాధారణ అక్షర క్రమాలను నివారించండి.',
        useWords: 'బహుళ పదాలను ఉపయోగించండి, కానీ సాధారణ పదబంధాలను నివారించండి.',
      },
      warnings: {
        common: 'ఇది సాధారణంగా ఉపయోగించే పాస్‌వర్డ్.',
        commonNames: 'సాధారణ పేర్లు మరియు ఇంటిపేర్లు సులభంగా ఊహించవచ్చు.',
        dates: 'తేదీలు సులభంగా ఊహించవచ్చు.',
        extendedRepeat: '"abcabcabc" వంటి పునరావృత అక్షర నమూనాలు సులభంగా ఊహించవచ్చు.',
        keyPattern: 'చిన్న కీబోర్డ్ నమూనాలు సులభంగా ఊహించవచ్చు.',
        namesByThemselves: 'ఒంటరి పేర్లు లేదా ఇంటిపేర్లు సులభంగా ఊహించవచ్చు.',
        pwned: 'మీ పాస్‌వర్డ్ ఇంటర్నెట్‌లో డేటా ఉల్లంఘన ద్వారా బయటపడింది.',
        recentYears: 'ఇటీవలి సంవత్సరాలు సులభంగా ఊహించవచ్చు.',
        sequences: '"abc" వంటి సాధారణ అక్షర క్రమాలు సులభంగా ఊహించవచ్చు.',
        similarToCommon: 'ఇది సాధారణంగా ఉపయోగించే పాస్‌వర్డ్‌కు సమానంగా ఉంది.',
        simpleRepeat: '"aaa" వంటి పునరావృత అక్షరాలు సులభంగా ఊహించవచ్చు.',
        straightRow: 'మీ కీబోర్డ్‌లోని నేరుగా వరుసలు సులభంగా ఊహించవచ్చు.',
        topHundred: 'ఇది తరచుగా ఉపయోగించే పాస్‌వర్డ్.',
        topTen: 'ఇది విస్తృతంగా ఉపయోగించే పాస్‌వర్డ్.',
        userInputs: 'వ్యక్తిగత లేదా పేజీకి సంబంధించిన డేటా ఉండకూడదు.',
        wordByItself: 'ఒంటరి పదాలు సులభంగా ఊహించవచ్చు.',
      },
    },
  },
  userButton: {
    action__addAccount: 'ఖాతాను జోడించండి',
    action__closeUserMenu: 'వినియోగదారు మెనుని మూసివేయి',
    action__manageAccount: 'ఖాతాను నిర్వహించండి',
    action__openUserMenu: 'వినియోగదారు మెనుని తెరువు',
    action__signOut: 'సైన్ అవుట్',
    action__signOutAll: 'అన్ని ఖాతాల నుండి సైన్ అవుట్ అవ్వండి',
    label__userButtonPopover: 'ఖాతా ప్యానెల్',
    label__accountActions: 'ఖాతా చర్యలు',
    label__activeSessions: 'క్రియాశీల సెషన్‌లు',
  },
  userProfile: {
    apiKeysPage: {
      title: 'API కీలు',
    },
    backupCodePage: {
      actionLabel__copied: 'కాపీ చేయబడింది!',
      actionLabel__copy: 'అన్నింటినీ కాపీ చేయండి',
      actionLabel__download: '.txt గా డౌన్‌లోడ్ చేయండి',
      actionLabel__print: 'ముద్రించండి',
      infoText1: 'బ్యాకప్ కోడ్‌లు ఈ ఖాతా కోసం ప్రారంభించబడతాయి.',
      infoText2:
        'బ్యాకప్ కోడ్‌లను రహస్యంగా ఉంచండి మరియు సురక్షితంగా నిల్వ చేయండి. బ్యాకప్ కోడ్‌లు ప్రమాదంలో పడ్డాయని మీరు అనుమానిస్తే, బ్యాకప్ కోడ్‌లను మళ్లీ రూపొందించవచ్చు.',
      subtitle__codelist: 'వాటిని సురక్షితంగా నిల్వ చేయండి మరియు రహస్యంగా ఉంచండి.',
      successMessage:
        'బ్యాకప్ కోడ్‌లు ఇప్పుడు ప్రారంభించబడ్డాయి. మీ ప్రమాణీకరణ పరికరంపై యాక్సెస్‌ను కోల్పోతే, మీ ఖాతాలోకి సైన్ ఇన్ చేయడానికి మీరు వీటిలో ఒకదాన్ని ఉపయోగించవచ్చు. ప్రతి కోడ్ ఒకసారి మాత్రమే ఉపయోగించబడుతుంది.',
      successSubtitle:
        'మీ ప్రమాణీకరణ పరికరంపై యాక్సెస్‌ను కోల్పోతే, మీ ఖాతాలోకి సైన్ ఇన్ చేయడానికి మీరు వీటిలో ఒకదాన్ని ఉపయోగించవచ్చు.',
      title: 'బ్యాకప్ కోడ్ ధృవీకరణను జోడించండి',
      title__codelist: 'బ్యాకప్ కోడ్‌లు',
    },
    billingPage: {
      paymentHistorySection: {
        empty: 'చెల్లింపు చరిత్ర లేదు',
        notFound: 'చెల్లింపు ప్రయత్నం కనుగొనబడలేదు',
        tableHeader__amount: 'మొత్తం',
        tableHeader__date: 'తేదీ',
        tableHeader__status: 'స్థితి',
      },
      paymentMethodsSection: {
        actionLabel__default: 'డిఫాల్ట్‌గా చేయండి',
        actionLabel__remove: 'తొలగించండి',
        add: 'కొత్త చెల్లింపు మూలాన్ని జోడించండి',
        addSubtitle: 'మీ ఖాతాకు కొత్త చెల్లింపు మూలాన్ని జోడించండి.',
        cancelButton: 'రద్దు చేయండి',
        formButtonPrimary__add: 'చెల్లింపు పద్ధతిని జోడించండి',
        formButtonPrimary__pay: '{{amount}} చెల్లించండి',
        payWithTestCardButton: 'టెస్ట్ కార్డ్‌తో చెల్లించు',
        removeMethod: {
          messageLine1: '{{identifier}} ఈ ఖాతా నుండి తొలగించబడుతుంది.',
          messageLine2:
            'మీరు ఇకపై ఈ చెల్లింపు మూలాన్ని ఉపయోగించలేరు మరియు దానిపై ఆధారపడిన పునరావృత సబ్‌స్క్రిప్షన్‌లు ఇకపై పనిచేయవు.',
          successMessage: '{{paymentMethod}} మీ ఖాతా నుండి తొలగించబడింది.',
          title: 'చెల్లింపు మూలాన్ని తొలగించండి',
        },
        title: 'అందుబాటులో ఉన్న ఎంపికలు',
      },
      start: {
        headerTitle__payments: 'చెల్లింపులు',
        headerTitle__plans: 'ప్లాన్‌లు',
        headerTitle__statements: 'ఇన్‌వాయిస్‌లు',
        headerTitle__subscriptions: 'సబ్‌స్క్రిప్షన్',
      },
      statementsSection: {
        empty: 'ప్రదర్శించడానికి స్టేట్‌మెంట్‌లు లేవు',
        itemCaption__paidForPlan: '{{plan}} {{period}} ప్లాన్ కోసం చెల్లించబడింది',
        itemCaption__payerCredit: undefined,
        itemCaption__proratedCredit: 'మునుపటి సబ్‌స్క్రిప్షన్ యొక్క పాక్షిక వినియోగానికి దామాషా క్రెడిట్',
        itemCaption__subscribedAndPaidForPlan: '{{plan}} {{period}} ప్లాన్ కోసం సబ్‌స్క్రైబ్ చేసి చెల్లించబడింది',
        notFound: 'స్టేట్‌మెంట్ కనుగొనబడలేదు',
        tableHeader__amount: 'మొత్తం',
        tableHeader__date: 'తేదీ',
        title: 'స్టేట్‌మెంట్‌లు',
        totalPaid: 'మొత్తం చెల్లించబడింది',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'నిర్వహించు',
        actionLabel__newSubscription: 'ఒక ప్లాన్‌కు సబ్‌స్క్రైబ్ చేయి',
        actionLabel__switchPlan: 'ప్లాన్‌లను మార్చు',
        overview: undefined,
        tableHeader__edit: 'సవరించు',
        tableHeader__plan: 'ప్లాన్',
        tableHeader__startDate: 'ప్రారంభ తేదీ',
        title: 'సబ్‌స్క్రిప్షన్',
      },
      subscriptionsSection: {
        actionLabel__default: 'నిర్వహించు',
      },
      switchPlansSection: {
        title: 'ప్లాన్‌లను మార్చు',
      },
      title: 'బిల్లింగ్ & చెల్లింపులు',
    },
    connectedAccountPage: {
      formHint: 'మీ ఖాతాను కనెక్ట్ చేయడానికి ప్రొవైడర్‌ను ఎంచుకోండి.',
      formHint__noAccounts: 'అందుబాటులో ఉన్న బాహ్య ఖాతా ప్రొవైడర్‌లు లేవు.',
      removeResource: {
        messageLine1: '{{identifier}} ఈ ఖాతా నుండి తొలగించబడుతుంది.',
        messageLine2: 'మీరు ఇకపై ఈ కనెక్టెడ్ ఖాతాను ఉపయోగించలేరు మరియు దాని ఆధారిత ఫీచర్‌లు ఇకపై పనిచేయవు.',
        successMessage: '{{connectedAccount}} మీ ఖాతా నుండి తొలగించబడింది.',
        title: 'కనెక్టెడ్ ఖాతాను తొలగించండి',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'ప్రొవైడర్ మీ ఖాతాకు జోడించబడింది',
      title: 'కనెక్టెడ్ ఖాతాను జోడించండి',
    },
    deletePage: {
      actionDescription: 'కొనసాగించడానికి క్రింద "Delete account" అని టైప్ చేయండి.',
      confirm: 'ఖాతాను తొలగించండి',
      messageLine1:
        'మీరు ఖచ్చితంగా మీ ఖాతాను తొలగించాలనుకుంటున్నారా? కొన్ని సంబంధిత డేటా ఉంచబడవచ్చు. పూర్తి డేటా తొలగింపును అభ్యర్థించడానికి, దయచేసి మద్దతును సంప్రదించండి.',
      messageLine2: 'ఈ చర్య శాశ్వతం మరియు తిరగదీయలేనిది.',
      title: 'ఖాతాను తొలగించండి',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'ధృవీకరణ కోడ్‌తో ఈమెయిల్ ఈ ఇమెయిల్ చిరునామాకు పంపబడుతుంది.',
        formSubtitle: '{{identifier}}కి పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
        formTitle: 'ధృవీకరణ కోడ్',
        resendButton: 'కోడ్ అందలేదా? మళ్ళీ పంపండి',
        successMessage: 'ఇమెయిల్ {{identifier}} మీ ఖాతాకు జోడించబడింది.',
      },
      emailLink: {
        formHint: 'ధృవీకరణ లింక్‌తో ఈమెయిల్ ఈ ఇమెయిల్ చిరునామాకు పంపబడుతుంది.',
        formSubtitle: '{{identifier}}కి పంపిన ఇమెయిల్‌లోని ధృవీకరణ లింక్‌పై క్లిక్ చేయండి',
        formTitle: 'ధృవీకరణ లింక్',
        resendButton: 'లింక్ అందలేదా? మళ్ళీ పంపండి',
        successMessage: 'ఇమెయిల్ {{identifier}} మీ ఖాతాకు జోడించబడింది.',
      },
      enterpriseSSOLink: {
        formButton: 'సైన్-ఇన్ చేయడానికి క్లిక్ చేయండి',
        formSubtitle: '{{identifier}}తో సైన్-ఇన్‌ను పూర్తి చేయండి',
      },
      formHint: 'ఇది మీ ఖాతాకు జోడించబడటానికి ముందు ఈ ఇమెయిల్ చిరునామాను ధృవీకరించాల్సి ఉంటుంది.',
      removeResource: {
        messageLine1: '{{identifier}} ఈ ఖాతా నుండి తొలగించబడుతుంది.',
        messageLine2: 'మీరు ఇకపై ఈ ఇమెయిల్ చిరునామాను ఉపయోగించి సైన్ ఇన్ చేయలేరు.',
        successMessage: '{{emailAddress}} మీ ఖాతా నుండి తొలగించబడింది.',
        title: 'ఇమెయిల్ చిరునామాను తొలగించండి',
      },
      title: 'ఇమెయిల్ చిరునామాను జోడించండి',
      verifyTitle: 'ఇమెయిల్ చిరునామాను ధృవీకరించండి',
    },
    formButtonPrimary__add: 'జోడించండి',
    formButtonPrimary__continue: 'కొనసాగించండి',
    formButtonPrimary__finish: 'ముగించండి',
    formButtonPrimary__remove: 'తొలగించండి',
    formButtonPrimary__save: 'సేవ్ చేయండి',
    formButtonReset: 'రద్దు చేయండి',
    mfaPage: {
      formHint: 'జోడించడానికి పద్ధతిని ఎంచుకోండి.',
      title: 'రెండు-దశల ధృవీకరణను జోడించండి',
    },
    mfaPhoneCodePage: {
      backButton: 'ఉన్న నంబర్‌ను ఉపయోగించండి',
      primaryButton__addPhoneNumber: 'ఫోన్ నంబర్‌ను జోడించండి',
      removeResource: {
        messageLine1: '{{identifier}} ఇకపై సైన్ ఇన్ చేసేటప్పుడు ధృవీకరణ కోడ్‌లను అందుకోదు.',
        messageLine2: 'మీ ఖాతా అంత సురక్షితంగా ఉండకపోవచ్చు. మీరు ఖచ్చితంగా కొనసాగించాలనుకుంటున్నారా?',
        successMessage: 'SMS కోడ్ రెండు-దశల ధృవీకరణ {{mfaPhoneCode}} కోసం తొలగించబడింది',
        title: 'రెండు-దశల ధృవీకరణను తొలగించండి',
      },
      subtitle__availablePhoneNumbers:
        'SMS కోడ్ రెండు-దశల ధృవీకరణకు నమోదు చేయడానికి ఉన్న ఫోన్ నంబర్‌ను ఎంచుకోండి లేదా కొత్తదాన్ని జోడించండి.',
      subtitle__unavailablePhoneNumbers:
        'SMS కోడ్ రెండు-దశల ధృవీకరణకు నమోదు చేయడానికి అందుబాటులో ఉన్న ఫోన్ నంబర్‌లు లేవు, దయచేసి కొత్తదాన్ని జోడించండి.',
      successMessage1: 'సైన్ ఇన్ చేసేటప్పుడు, అదనపు దశగా ఈ ఫోన్ నంబర్‌కి పంపిన ధృవీకరణ కోడ్‌ను మీరు నమోదు చేయాలి.',
      successMessage2:
        'ఈ బ్యాకప్ కోడ్‌లను సేవ్ చేసి వాటిని సురక్షితంగా నిల్వ చేయండి. మీరు మీ ప్రమాణీకరణ పరికరంపై యాక్సెస్‌ను కోల్పోతే, సైన్ ఇన్ చేయడానికి మీరు బ్యాకప్ కోడ్‌లను ఉపయోగించవచ్చు.',
      successTitle: 'SMS కోడ్ ధృవీకరణ ప్రారంభించబడింది',
      title: 'SMS కోడ్ ధృవీకరణను జోడించండి',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'బదులుగా QR కోడ్‌ను స్కాన్ చేయండి',
        buttonUnableToScan__nonPrimary: 'QR కోడ్‌ను స్కాన్ చేయలేరా?',
        infoText__ableToScan:
          'మీ ప్రమాణీకరణ యాప్‌లో కొత్త సైన్-ఇన్ పద్ధతిని సెటప్ చేసి, దానిని మీ ఖాతాకు లింక్ చేయడానికి క్రింది QR కోడ్‌ను స్కాన్ చేయండి.',
        infoText__unableToScan:
          'మీ ప్రమాణీకరణలో కొత్త సైన్-ఇన్ పద్ధతిని సెటప్ చేసి, క్రింద అందించిన కీని నమోదు చేయండి.',
        inputLabel__unableToScan1:
          'టైమ్-బేస్డ్ లేదా వన్-టైమ్ పాస్‌వర్డ్‌లు ప్రారంభించబడ్డాయని నిర్ధారించుకోండి, ఆపై మీ ఖాతాను లింక్ చేయడం పూర్తి చేయండి.',
        inputLabel__unableToScan2:
          'ప్రత్యామ్నాయంగా, మీ ప్రమాణీకరణ TOTP URI లను మద్దతిస్తే, మీరు పూర్తి URIని కూడా కాపీ చేయవచ్చు.',
      },
      removeResource: {
        messageLine1: 'సైన్ ఇన్ చేసేటప్పుడు ఇకపై ఈ ప్రమాణీకరణ నుండి ధృవీకరణ కోడ్‌లు అవసరం కాదు.',
        messageLine2: 'మీ ఖాతా అంత సురక్షితంగా ఉండకపోవచ్చు. మీరు ఖచ్చితంగా కొనసాగించాలనుకుంటున్నారా?',
        successMessage: 'ప్రమాణీకరణ అప్లికేషన్ ద్వారా రెండు-దశల ధృవీకరణ తొలగించబడింది.',
        title: 'రెండు-దశల ధృవీకరణను తొలగించండి',
      },
      successMessage:
        'రెండు-దశల ధృవీకరణ ఇప్పుడు ప్రారంభించబడింది. సైన్ ఇన్ చేసేటప్పుడు, మీరు అదనపు దశగా ఈ ప్రమాణీకరణ నుండి ధృవీకరణ కోడ్‌ను నమోదు చేయాలి.',
      title: 'ప్రమాణీకరణ అప్లికేషన్‌ను జోడించండి',
      verifySubtitle: 'మీ ప్రమాణీకరణ ద్వారా రూపొందించిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      verifyTitle: 'ధృవీకరణ కోడ్',
    },
    mobileButton__menu: 'మెనూ',
    navbar: {
      account: 'ప్రొఫైల్',
      apiKeys: 'API కీలు',
      billing: 'బిల్లింగ్',
      description: 'మీ ఖాతా సమాచారాన్ని నిర్వహించండి.',
      security: 'భద్రత',
      title: 'ఖాతా',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} ఈ ఖాతా నుండి తొలగించబడుతుంది.',
        title: 'పాస్‌కీని తొలగించండి',
      },
      subtitle__rename: 'మీరు దాన్ని సులభంగా కనుగొనేలా పాస్‌కీ పేరును మార్చవచ్చు.',
      title__rename: 'పాస్‌కీ పేరు మార్చండి',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'మీ పాత పాస్‌వర్డ్‌ను ఉపయోగించి ఉండవచ్చు ఇతర అన్ని పరికరాల నుండి సైన్ అవుట్ అవ్వడం సిఫార్సు చేయబడింది.',
      readonly:
        'మీరు ఎంటర్‌ప్రైజ్ కనెక్షన్ ద్వారా మాత్రమే సైన్ ఇన్ చేయగలిగినందున మీ పాస్‌వర్డ్‌ను ప్రస్తుతం సవరించలేరు.',
      successMessage__set: 'మీ పాస్‌వర్డ్ సెట్ చేయబడింది.',
      successMessage__signOutOfOtherSessions: 'అన్ని ఇతర పరికరాలు సైన్ అవుట్ చేయబడ్డాయి.',
      successMessage__update: 'మీ పాస్‌వర్డ్ నవీకరించబడింది.',
      title__set: 'పాస్‌వర్డ్‌ను సెట్ చేయండి',
      title__update: 'పాస్‌వర్డ్‌ను నవీకరించండి',
    },
    phoneNumberPage: {
      infoText:
        'ధృవీకరణ కోడ్‌తో కూడిన టెక్స్ట్ మెసేజ్ ఈ ఫోన్ నంబర్‌కు పంపబడుతుంది. మెసేజ్ మరియు డేటా రేట్లు వర్తించవచ్చు.',
      removeResource: {
        messageLine1: '{{identifier}} ఈ ఖాతా నుండి తొలగించబడుతుంది.',
        messageLine2: 'మీరు ఇకపై ఈ ఫోన్ నంబర్‌ను ఉపయోగించి సైన్ ఇన్ చేయలేరు.',
        successMessage: '{{phoneNumber}} మీ ఖాతా నుండి తొలగించబడింది.',
        title: 'ఫోన్ నంబర్‌ను తొలగించండి',
      },
      successMessage: '{{identifier}} మీ ఖాతాకు జోడించబడింది.',
      title: 'ఫోన్ నంబర్‌ను జోడించండి',
      verifySubtitle: '{{identifier}}కి పంపిన ధృవీకరణ కోడ్‌ను నమోదు చేయండి',
      verifyTitle: 'ఫోన్ నంబర్‌ను ధృవీకరించండి',
    },
    plansPage: {
      title: 'ప్లాన్‌లు',
    },
    profilePage: {
      fileDropAreaHint: 'సిఫార్సు చేయబడిన పరిమాణం 1:1, 10MB వరకు.',
      imageFormDestructiveActionSubtitle: 'తొలగించండి',
      imageFormSubtitle: 'అప్‌లోడ్ చేయండి',
      imageFormTitle: 'ప్రొఫైల్ చిత్రం',
      readonly: 'మీ ప్రొఫైల్ సమాచారం ఎంటర్‌ప్రైజ్ కనెక్షన్ ద్వారా అందించబడింది మరియు సవరించబడదు.',
      successMessage: 'మీ ప్రొఫైల్ నవీకరించబడింది.',
      title: 'ప్రొఫైల్‌ను నవీకరించండి',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'పరికరాన్ని సైన్ అవుట్ చేయండి',
        title: 'యాక్టివ్ పరికరాలు',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'మళ్ళీ కనెక్ట్ చేయండి',
        actionLabel__reauthorize: 'ఇప్పుడు అధికారం ఇవ్వండి',
        destructiveActionTitle: 'తొలగించండి',
        primaryButton: 'ఖాతాను కనెక్ట్ చేయండి',
        subtitle__disconnected: 'ఈ ఖాతా డిస్‌కనెక్ట్ చేయబడింది.',
        subtitle__reauthorize:
          'అవసరమైన స్కోప్‌లు నవీకరించబడ్డాయి మరియు మీరు పరిమిత కార్యాచరణను అనుభవించవచ్చు. ఏదైనా సమస్యలను నివారించడానికి దయచేసి ఈ అప్లికేషన్‌ను తిరిగి అధికారం ఇవ్వండి',
        title: 'కనెక్టెడ్ ఖాతాలు',
      },
      dangerSection: {
        deleteAccountButton: 'ఖాతాను తొలగించండి',
        title: 'ఖాతాను తొలగించండి',
      },
      emailAddressesSection: {
        destructiveAction: 'ఇమెయిల్‌ను తొలగించండి',
        detailsAction__nonPrimary: 'ప్రాథమికంగా సెట్ చేయండి',
        detailsAction__primary: 'ధృవీకరణను పూర్తి చేయండి',
        detailsAction__unverified: 'ధృవీకరించండి',
        primaryButton: 'ఇమెయిల్ చిరునామాను జోడించండి',
        title: 'ఇమెయిల్ చిరునామాలు',
      },
      enterpriseAccountsSection: {
        primaryButton: 'ఖాతాను కనెక్ట్ చేయండి',
        title: 'ఎంటర్‌ప్రైజ్ ఖాతాలు',
      },
      headerTitle__account: 'ప్రొఫైల్ వివరాలు',
      headerTitle__security: 'భద్రత',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'మళ్ళీ రూపొందించండి',
          headerTitle: 'బ్యాకప్ కోడ్‌లు',
          subtitle__regenerate:
            'కొత్త సెట్ సురక్షిత బ్యాకప్ కోడ్‌లను పొందండి. మునుపటి బ్యాకప్ కోడ్‌లు తొలగించబడతాయి మరియు ఉపయోగించబడవు.',
          title__regenerate: 'బ్యాకప్ కోడ్‌లను మళ్ళీ రూపొందించండి',
        },
        phoneCode: {
          actionLabel__setDefault: 'డిఫాల్ట్‌గా సెట్ చేయండి',
          destructiveActionLabel: 'తొలగించండి',
        },
        primaryButton: 'రెండు-దశల ధృవీకరణను జోడించండి',
        title: 'రెండు-దశల ధృవీకరణ',
        totp: {
          destructiveActionTitle: 'తొలగించండి',
          headerTitle: 'ప్రమాణీకరణ అప్లికేషన్',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'తొలగించండి',
        menuAction__rename: 'పేరు మార్చండి',
        primaryButton: 'పాస్‌కీని జోడించండి',
        title: 'పాస్‌కీలు',
      },
      passwordSection: {
        primaryButton__setPassword: 'పాస్‌వర్డ్‌ను సెట్ చేయండి',
        primaryButton__updatePassword: 'పాస్‌వర్డ్‌ను నవీకరించండి',
        title: 'పాస్‌వర్డ్',
      },
      phoneNumbersSection: {
        destructiveAction: 'ఫోన్ నంబర్‌ను తొలగించండి',
        detailsAction__nonPrimary: 'ప్రాథమికంగా సెట్ చేయండి',
        detailsAction__primary: 'ధృవీకరణను పూర్తి చేయండి',
        detailsAction__unverified: 'ఫోన్ నంబర్‌ను ధృవీకరించండి',
        primaryButton: 'ఫోన్ నంబర్‌ను జోడించండి',
        title: 'ఫోన్ నంబర్లు',
      },
      profileSection: {
        primaryButton: 'ప్రొఫైల్‌ను నవీకరించండి',
        title: 'ప్రొఫైల్',
      },
      usernameSection: {
        primaryButton__setUsername: 'వినియోగదారు పేరును సెట్ చేయండి',
        primaryButton__updateUsername: 'వినియోగదారు పేరును నవీకరించండి',
        title: 'వినియోగదారు పేరు',
      },
      web3WalletsSection: {
        destructiveAction: 'వాలెట్‌ను తొలగించండి',
        detailsAction__nonPrimary: 'ప్రాథమికంగా సెట్ చేయండి',
        primaryButton: 'వాలెట్‌ను కనెక్ట్ చేయండి',
        title: 'Web3 వాలెట్‌లు',
        web3SelectSolanaWalletScreen: {
          subtitle: 'మీ ఖాతాతో కనెక్ట్ చేయడానికి Solana వాలెట్‌ను ఎంచుకోండి.',
          title: 'Solana వాలెట్‌ను జోడించండి',
        },
      },
    },
    usernamePage: {
      successMessage: 'మీ వినియోగదారు పేరు నవీకరించబడింది.',
      title__set: 'వినియోగదారు పేరును సెట్ చేయండి',
      title__update: 'వినియోగదారు పేరును నవీకరించండి',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} ఈ ఖాతా నుండి తొలగించబడుతుంది.',
        messageLine2: 'మీరు ఇకపై ఈ web3 వాలెట్‌ను ఉపయోగించి సైన్ ఇన్ చేయలేరు.',
        successMessage: '{{web3Wallet}} మీ ఖాతా నుండి తొలగించబడింది.',
        title: 'web3 వాలెట్‌ను తొలగించండి',
      },
      subtitle__availableWallets: 'మీ ఖాతాకు కనెక్ట్ చేయడానికి web3 వాలెట్‌ను ఎంచుకోండి.',
      subtitle__unavailableWallets: 'అందుబాటులో ఉన్న web3 వాలెట్‌లు లేవు.',
      successMessage: 'వాలెట్ మీ ఖాతాకు జోడించబడింది.',
      title: 'web3 వాలెట్‌ను జోడించండి',
      web3WalletButtonsBlockButton: '{{provider|titleize}}',
    },
  },
  waitlist: {
    start: {
      actionLink: 'సైన్ ఇన్ చేయండి',
      actionText: 'ఇప్పటికే ప్రాప్యత ఉందా?',
      formButton: 'వెయిట్‌లిస్ట్‌లో చేరండి',
      subtitle: 'మీ ఇమెయిల్ చిరునామాను నమోదు చేయండి మరియు మీ స్థానం సిద్ధంగా ఉన్నప్పుడు మేము మీకు తెలియజేస్తాము',
      title: 'వెయిట్‌లిస్ట్‌లో చేరండి',
    },
    success: {
      message: 'మీరు త్వరలో పునఃనిర్దేశించబడతారు...',
      subtitle: 'మీ స్థానం సిద్ధంగా ఉన్నప్పుడు మేము మిమ్మల్ని సంప్రదిస్తాము',
      title: 'వెయిట్‌లిస్ట్‌లో చేరినందుకు ధన్యవాదాలు!',
    },
  },
  web3SolanaWalletButtons: {
    connect: '{{walletName}} తో కనెక్ట్ అవ్వండి',
    continue: '{{walletName}} తో కొనసాగించండి',
    noneAvailable:
      'Solana Web3 వాలెట్లు ఏవీ గుర్తించబడలేదు. Web3 కి మద్దతు ఉన్న {{ solanaWalletsLink || link("wallet extension") }} ను ఇన్‌స్టాల్ చేయండి.',
  },
} as const;
