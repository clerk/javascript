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

export const msMY: LocalizationResource = {
  locale: 'ms-MY',
  apiKeys: {
    action__add: 'Tambah kunci baharu',
    action__search: 'Cari kunci',
    copySecret: {
      formButtonPrimary__copyAndClose: 'Salin & Tutup',
      formHint: 'Atas sebab keselamatan, kami tidak akan membenarkan anda melihatnya semula kemudian.',
      formTitle: 'Salin kunci API "{{name}}" anda sekarang',
    },
    createdAndExpirationStatus__expiresOn:
      "Dicipta {{ createdDate | shortDate('ms-MY') }} • Tamat tempoh {{ expiresDate | longDate('ms-MY') }}",
    createdAndExpirationStatus__never: "Dicipta {{ createdDate | shortDate('ms-MY') }} • Tidak pernah tamat tempoh",
    detailsTitle__emptyRow: 'Tiada kunci API ditemui',
    formButtonPrimary__add: 'Cipta kunci',
    formFieldCaption__expiration__expiresOn: 'Tamat tempoh {{ date }}',
    formFieldCaption__expiration__never: 'Kunci ini tidak akan tamat tempoh',
    formFieldOption__expiration__180d: '180 Hari',
    formFieldOption__expiration__1d: '1 Hari',
    formFieldOption__expiration__1y: '1 Tahun',
    formFieldOption__expiration__30d: '30 Hari',
    formFieldOption__expiration__60d: '60 Hari',
    formFieldOption__expiration__7d: '7 Hari',
    formFieldOption__expiration__90d: '90 Hari',
    formFieldOption__expiration__never: 'Tidak pernah',
    formHint: 'Berikan nama untuk menjana kunci baharu. Anda boleh membatalkannya pada bila-bila masa.',
    formTitle: 'Tambah kunci API baharu',
    lastUsed__days: '{{days}} hari lalu',
    lastUsed__hours: '{{hours}} jam lalu',
    lastUsed__minutes: '{{minutes}} minit lalu',
    lastUsed__months: '{{months}} bulan lalu',
    lastUsed__seconds: '{{seconds}} saat lalu',
    lastUsed__years: '{{years}} tahun lalu',
    menuAction__revoke: 'Batalkan kunci',
    revokeConfirmation: {
      confirmationText: 'Batalkan',
      formButtonPrimary__revoke: 'Batalkan kunci',
      formHint: 'Adakah anda pasti mahu memadamkan kunci Rahsia ini?',
      formTitle: 'Batalkan kunci rahsia "{{apiKeyName}}"?',
      inputLabel: undefined,
    },
    tableHeader__actions: undefined,
    tableHeader__lastUsed: undefined,
    tableHeader__name: undefined,
  },
  backButton: 'Kembali',
  badge__activePlan: 'Aktif',
  badge__banned: undefined,
  badge__canceledEndsAt: "Dibatalkan • Tamat {{ date | shortDate('ms-MY') }}",
  badge__currentPlan: 'Pelan Semasa',
  badge__default: 'Lalai',
  badge__endsAt: "Tamat {{ date | shortDate('ms-MY') }}",
  badge__expired: 'Tamat tempoh',
  badge__freeTrial: 'Percubaan percuma',
  badge__otherImpersonatorDevice: 'Peranti penyamar lain',
  badge__pastDueAt: "Tertunggak {{ date | shortDate('ms-MY') }}",
  badge__pastDuePlan: 'Tertunggak',
  badge__primary: 'Utama',
  badge__renewsAt: "Diperbaharui {{ date | shortDate('ms-MY') }}",
  badge__requiresAction: 'Memerlukan tindakan',
  badge__startsAt: "Bermula {{ date | shortDate('ms-MY') }}",
  badge__thisDevice: 'Peranti ini',
  badge__trialEndsAt: "Percubaan tamat {{ date | shortDate('ms-MY') }}",
  badge__unverified: 'Belum disahkan',
  badge__upcomingPlan: 'Akan datang',
  badge__userDevice: 'Peranti pengguna',
  badge__you: 'Anda',
  billing: {
    accountCredit: undefined,
    addPaymentMethod__label: 'Tambah kaedah pembayaran',
    alwaysFree: 'Sentiasa percuma',
    annually: 'Tahunan',
    availableFeatures: 'Ciri yang tersedia',
    billedAnnually: 'Dibilkan secara tahunan',
    billedAnnuallyOnly: undefined,
    billedMonthly: undefined,
    billedMonthlyOnly: 'Hanya dibilkan secara bulanan',
    cancelFreeTrial: 'Batalkan percubaan percuma',
    cancelFreeTrialAccessUntil:
      "Percubaan anda akan kekal aktif sehingga {{ date | longDate('ms-MY') }}. Selepas itu, anda akan kehilangan akses kepada ciri percubaan. Anda tidak akan dikenakan caj.",
    cancelFreeTrialTitle: 'Batalkan percubaan percuma untuk pelan {{plan}}?',
    cancelSubscription: 'Batalkan langganan',
    cancelSubscriptionAccessUntil:
      "Anda boleh terus menggunakan ciri '{{plan}}' sehingga {{ date | longDate('ms-MY') }}, selepas itu anda tidak lagi mempunyai akses.",
    cancelSubscriptionNoCharge: 'Anda tidak akan dikenakan caj untuk langganan ini.',
    cancelSubscriptionPastDue:
      'Langganan anda akan tamat serta-merta dan anda akan kehilangan akses kepada semua ciri pelan. Anda akan diminta membayar jumlah tertunggak pada langganan anda yang seterusnya.',
    cancelSubscriptionTitle: 'Batalkan Langganan {{plan}}?',
    cannotSubscribeMonthly:
      'Anda tidak boleh melanggan pelan ini dengan membayar secara bulanan. Untuk melanggan pelan ini, anda perlu memilih untuk membayar secara tahunan.',
    cannotSubscribeUnrecoverable:
      'Anda tidak boleh melanggan pelan ini. Langganan sedia ada anda lebih mahal daripada pelan ini.',
    checkout: {
      description__paymentSuccessful: 'Pembayaran anda berjaya.',
      description__subscriptionSuccessful: 'Langganan baharu anda telah sedia.',
      downgradeNotice:
        'Anda akan mengekalkan langganan semasa anda dan cirinya sehingga akhir kitaran pengebilan, kemudian anda akan ditukar kepada langganan ini.',
      emailForm: {
        subtitle:
          'Sebelum anda boleh melengkapkan pembelian anda, anda mesti menambah alamat e-mel di mana resit akan dihantar.',
        title: 'Tambah alamat e-mel',
      },
      lineItems: {
        title__freeTrialEndsAt: 'Percubaan tamat pada',
        title__paymentMethod: 'Kaedah pembayaran',
        title__statementId: 'ID Penyata',
        title__subscriptionBegins: 'Langganan bermula',
        title__totalPaid: 'Jumlah dibayar',
      },
      pastDueNotice: 'Langganan anda sebelum ini tertunggak, tanpa pembayaran.',
      perMonth: 'sebulan',
      title: 'Pembayaran',
      title__paymentSuccessful: 'Pembayaran berjaya!',
      title__subscriptionSuccessful: 'Berjaya!',
      title__trialSuccess: 'Percubaan berjaya dimulakan!',
      totalDueAfterTrial: 'Jumlah Perlu Dibayar selepas percubaan tamat dalam {{days}} hari',
      totalDuePerPeriod: undefined,
    },
    credit: 'Kredit',
    creditRemainder: 'Kredit untuk baki langganan semasa anda.',
    defaultFreePlanActive: 'Anda kini menggunakan pelan Percuma',
    free: 'Percuma',
    getStarted: 'Mulakan',
    highlightedPlanBadge: 'Popular',
    keepFreeTrial: 'Kekalkan percubaan percuma',
    keepSubscription: 'Kekalkan langganan',
    manage: 'Urus',
    manageSubscription: 'Urus keahlian',
    month: 'Bulan',
    monthAbbreviation: undefined,
    monthPerUnit: undefined,
    monthly: 'Bulanan',
    pastDue: 'Tertunggak',
    pay: 'Bayar {{amount}}',
    payerCreditRemainder: undefined,
    paymentMethod: {
      applePayDescription: {
        annual: 'Pembayaran tahunan',
        monthly: 'Pembayaran bulanan',
      },
      dev: {
        anyNumbers: 'Sebarang nombor',
        cardNumber: 'Nombor kad',
        cvcZip: 'CVC, ZIP',
        developmentMode: 'Mod pembangunan',
        expirationDate: 'Tarikh tamat tempoh',
        testCardInfo: 'Maklumat kad ujian',
      },
    },
    paymentMethods__label: 'Kaedah Pembayaran',
    pricingTable: {
      billingCycle: 'Kitaran pengebilan',
      included: 'Disertakan',
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
    reSubscribe: 'Langgan semula',
    seatBreakdownIncludedPlural: undefined,
    seatBreakdownIncludedSingular: undefined,
    seatBreakdownPlural: undefined,
    seatBreakdownSingular: undefined,
    seats: undefined,
    seatsWithLimit: undefined,
    seeAllFeatures: 'Lihat semua ciri',
    startFreeTrial: 'Mulakan percubaan percuma',
    startFreeTrial__days: 'Mulakan percubaan percuma {{days}} hari',
    subscribe: 'Langgan',
    subscriptionDetails: {
      beginsOn: 'Bermula pada',
      currentBillingCycle: 'Kitaran pengebilan semasa',
      endsOn: 'Tamat pada',
      firstPaymentAmount: 'Jumlah pembayaran pertama',
      firstPaymentOn: 'Pembayaran pertama pada',
      nextPaymentAmount: 'Jumlah pembayaran seterusnya',
      nextPaymentOn: 'Pembayaran seterusnya pada',
      pastDueAt: 'Tertunggak pada',
      renewsAt: 'Diperbaharui pada',
      subscribedOn: 'Dilanggan pada',
      title: 'Langganan',
      trialEndsOn: 'Percubaan tamat pada',
      trialStartedOn: 'Percubaan bermula pada',
    },
    subtotal: 'Jumlah kecil',
    subtotalRenewal: undefined,
    switchPlan: 'Tukar ke pelan ini',
    switchToAnnual: 'Tukar kepada tahunan',
    switchToAnnualWithAnnualPrice: 'Tukar kepada tahunan {{currency}}{{price}} / tahun',
    switchToMonthly: 'Tukar kepada bulanan',
    switchToMonthlyWithPrice: 'Tukar kepada bulanan {{currency}}{{price}} / bulan',
    totalDue: 'Jumlah perlu dibayar',
    totalDuePerPeriod: undefined,
    totalDueToday: 'Jumlah Perlu Dibayar Hari Ini',
    viewFeatures: 'Lihat ciri',
    viewPayment: 'Lihat pembayaran',
    year: 'Tahun',
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
      subtitle: 'Hubungi pentadbir organisasi anda untuk menaik taraf kebenaran anda.',
      title: 'Anda tidak mempunyai kebenaran untuk mengurus Log Masuk Tunggal (SSO)',
    },
    navbar: {
      title: 'Konfigurasi Log Masuk Tunggal (SSO)',
    },
    organizationDomainsStep: {
      domainCard: {
        badge__unverified: 'Belum disahkan',
        badge__verified: 'Disahkan',
        removeButtonTooltip__lastVerifiedDomain: undefined,
        removeButtonTooltip__lastVerifiedDomainActive: undefined,
        txtRecord: {
          hostLabel: 'Hos / Nama',
          instructions:
            'Tambahkan rekod TXT ini kepada penyedia DNS anda. Kami akan mengesahkan secara automatik sebaik sahaja rekod aktif.',
          typeLabel: 'Jenis',
          valueLabel: 'Nilai',
        },
        verifiedAtLabel: "Disahkan pada {{ date | shortDate('ms-MY') }}",
      },
      domainSuggestion: {
        formButtonPrimary__add: 'Tambah {{domain}}',
        messageLabel: 'E-mel anda menggunakan {{domain}}. Adakah anda mahu menambahkannya?',
      },
      formButtonPrimary__add: 'Tambah',
      formFieldInputPlaceholder__domain: 'Taip domain anda di sini dan klik tambah untuk bermula',
      formFieldLabel__domain: 'Domain',
      removeDomainDialog: {
        cancelButton: undefined,
        removeButton: undefined,
        subtitle__active: undefined,
        subtitle__inactive: undefined,
        title: undefined,
      },
      subtitle: 'Tambah dan sahkan pemilikan domain yang digunakan organisasi anda untuk log masuk.',
      title: 'Tambah domain SSO',
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
        customSaml: 'Pembekal SAML Tersuai',
        google: undefined,
        groupLabel: 'SAML',
        microsoft: undefined,
        okta: 'Okta Workforce',
      },
      subtitle: 'Pilih pembekal yang anda akan sediakan SSO untuknya.',
      title: 'Pilih pembekal',
      warning: 'Setelah pembekal dipilih anda tidak boleh menukar lagi sehingga konfigurasi selesai',
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
    formButtonSubmit: 'Cipta organisasi',
    invitePage: {
      formButtonReset: 'Langkau',
    },
    title: 'Cipta organisasi',
  },
  dates: {
    lastDay: "Semalam pada {{ date | timeString('ms-MY') }}",
    next6Days: "{{ date | weekday('ms-MY','long') }} pada {{ date | timeString('ms-MY') }}",
    nextDay: "Esok pada {{ date | timeString('ms-MY') }}",
    numeric: "{{ date | numeric('ms-MY') }}",
    previous6Days: "{{ date | weekday('ms-MY','long') }} lepas pada {{ date | timeString('ms-MY') }}",
    sameDay: "Hari ini pada {{ date | timeString('ms-MY') }}",
  },
  dividerText: 'atau',
  footerActionLink__alternativePhoneCodeProvider: 'Hantar kod melalui SMS sebaliknya',
  footerActionLink__useAnotherMethod: 'Gunakan kaedah lain',
  footerPageLink__help: 'Bantuan',
  footerPageLink__privacy: 'Privasi',
  footerPageLink__terms: 'Terma',
  formButtonPrimary: 'Teruskan',
  formButtonPrimary__verify: 'Sahkan',
  formFieldAction__forgotPassword: 'Lupa kata laluan?',
  formFieldError__matchingPasswords: 'Kata laluan sepadan.',
  formFieldError__notMatchingPasswords: 'Kata laluan tidak sepadan.',
  formFieldError__verificationLinkExpired: 'Pautan pengesahan telah tamat tempoh. Sila minta pautan baharu.',
  formFieldHintText__optional: 'Pilihan',
  formFieldHintText__slug: 'Slug adalah ID mesra manusia yang mestilah unik. Ia sering digunakan dalam URL.',
  formFieldInputPlaceholder__apiKeyDescription: 'Terangkan mengapa anda menjana kunci ini',
  formFieldInputPlaceholder__apiKeyExpirationDate: 'Pilih tarikh',
  formFieldInputPlaceholder__apiKeyName: 'Masukkan nama kunci rahsia anda',
  formFieldInputPlaceholder__backupCode: 'Masukkan kod sandaran',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Padam akaun',
  formFieldInputPlaceholder__emailAddress: 'Masukkan alamat e-mel anda',
  formFieldInputPlaceholder__emailAddress_username: 'Masukkan e-mel atau nama pengguna',
  formFieldInputPlaceholder__emailAddresses: 'contoh@emel.com, contoh2@emel.com',
  formFieldInputPlaceholder__firstName: 'Nama pertama',
  formFieldInputPlaceholder__lastName: 'Nama terakhir',
  formFieldInputPlaceholder__organizationDomain: 'contoh.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'anda@contoh.com',
  formFieldInputPlaceholder__organizationName: 'Nama organisasi',
  formFieldInputPlaceholder__organizationSlug: 'organisasi-saya',
  formFieldInputPlaceholder__password: 'Masukkan kata laluan anda',
  formFieldInputPlaceholder__phoneNumber: 'Masukkan nombor telefon anda',
  formFieldInputPlaceholder__signUpPassword: undefined,
  formFieldInputPlaceholder__username: 'Masukkan nama pengguna anda',
  formFieldInput__emailAddress_format: 'Contoh format: name@example.com',
  formFieldLabel__apiKey: 'Kunci API',
  formFieldLabel__apiKeyDescription: 'Penerangan',
  formFieldLabel__apiKeyExpiration: 'Tamat tempoh',
  formFieldLabel__apiKeyName: 'Nama kunci rahsia',
  formFieldLabel__automaticInvitations: 'Aktifkan jemputan automatik untuk domain ini',
  formFieldLabel__backupCode: 'Kod sandaran',
  formFieldLabel__confirmDeletion: 'Pengesahan',
  formFieldLabel__confirmPassword: 'Sahkan kata laluan',
  formFieldLabel__currentPassword: 'Kata laluan semasa',
  formFieldLabel__emailAddress: 'Alamat e-mel',
  formFieldLabel__emailAddress_username: 'Alamat e-mel atau nama pengguna',
  formFieldLabel__emailAddresses: 'Alamat e-mel',
  formFieldLabel__firstName: 'Nama pertama',
  formFieldLabel__lastName: 'Nama terakhir',
  formFieldLabel__newPassword: 'Kata laluan baharu',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Padam jemputan dan cadangan tertunggak',
  formFieldLabel__organizationDomainEmailAddress: 'Alamat e-mel pengesahan',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Masukkan alamat e-mel di bawah domain ini untuk menerima kod dan mengesahkan domain ini.',
  formFieldLabel__organizationName: 'Nama',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Nama kunci pas',
  formFieldLabel__password: 'Kata laluan',
  formFieldLabel__phoneNumber: 'Nombor telefon',
  formFieldLabel__role: 'Peranan',
  formFieldLabel__signOutOfOtherSessions: 'Daftar keluar dari semua peranti lain',
  formFieldLabel__username: 'Nama pengguna',
  identityPreviewEditButton__emailAddress: undefined,
  identityPreviewEditButton__identifier: undefined,
  identityPreviewEditButton__phoneNumber: undefined,
  impersonationFab: {
    action__signOut: 'Daftar keluar',
    title: 'Didaftarkan sebagai {{identifier}}',
  },
  lastAuthenticationStrategy: 'Terakhir digunakan',
  maintenanceMode:
    'Kami sedang menjalani penyelenggaraan, tetapi jangan risau, ini tidak sepatutnya mengambil masa lebih daripada beberapa minit.',
  membershipRole__admin: 'Pentadbir',
  membershipRole__basicMember: 'Ahli',
  membershipRole__guestMember: 'Tetamu',
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
    action__createOrganization: 'Cipta organisasi',
    action__invitationAccept: 'Sertai',
    action__suggestionsAccept: 'Minta untuk menyertai',
    createOrganization: 'Cipta Organisasi',
    invitationAcceptedLabel: 'Disertai',
    subtitle: 'untuk meneruskan ke {{applicationName}}',
    suggestionsAcceptedLabel: 'Menunggu kelulusan',
    title: 'Pilih akaun',
    titleWithoutPersonal: 'Pilih organisasi',
  },
  organizationProfile: {
    apiKeysPage: {
      title: 'Kunci API',
    },
    badge__automaticInvitation: 'Jemputan automatik',
    badge__automaticSuggestion: 'Cadangan automatik',
    badge__enterpriseSso: undefined,
    badge__manualInvitation: 'Tiada pendaftaran automatik',
    badge__unverified: 'Belum disahkan',
    billingPage: {
      paymentHistorySection: {
        empty: 'Tiada sejarah pembayaran',
        notFound: 'Percubaan pembayaran tidak ditemui',
        tableHeader__amount: 'Jumlah',
        tableHeader__date: 'Tarikh',
        tableHeader__status: 'Status',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Jadikan lalai',
        actionLabel__remove: 'Keluarkan',
        add: 'Tambah sumber pembayaran baharu',
        addSubtitle: 'Tambah sumber pembayaran baharu ke akaun anda.',
        cancelButton: 'Batal',
        formButtonPrimary__add: 'Tambah Kaedah Pembayaran',
        formButtonPrimary__pay: 'Bayar {{amount}}',
        payWithTestCardButton: 'Bayar dengan kad ujian',
        removeMethod: {
          messageLine1: '{{identifier}} akan dikeluarkan dari akaun ini.',
          messageLine2:
            'Anda tidak akan dapat menggunakan sumber pembayaran ini lagi dan langganan berulang yang bergantung padanya tidak akan berfungsi lagi.',
          successMessage: '{{paymentMethod}} telah dikeluarkan dari akaun anda.',
          title: 'Keluarkan sumber pembayaran',
        },
        title: 'Pilihan tersedia',
      },
      start: {
        headerTitle__payments: 'Pembayaran',
        headerTitle__plans: 'Pelan',
        headerTitle__statements: 'Invois',
        headerTitle__subscriptions: 'Langganan',
      },
      statementsSection: {
        empty: 'Tiada penyata untuk dipaparkan',
        itemCaption__paidForPlan: 'Dibayar untuk pelan {{plan}} {{period}}',
        itemCaption__payerCredit: undefined,
        itemCaption__proratedCredit: 'Kredit prorata untuk penggunaan separa langganan sebelumnya',
        itemCaption__subscribedAndPaidForPlan: 'Dilanggan dan dibayar untuk pelan {{plan}} {{period}}',
        notFound: 'Penyata tidak ditemui',
        tableHeader__amount: 'Jumlah',
        tableHeader__date: 'Tarikh',
        title: 'Penyata',
        totalPaid: 'Jumlah dibayar',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Urus',
        actionLabel__newSubscription: 'Langgan satu pelan',
        actionLabel__switchPlan: 'Tukar pelan',
        includedSeatsUsage: undefined,
        overview: undefined,
        paidSeatsUsage: undefined,
        seatLimit: undefined,
        seatLimitAndIncludedSeats: undefined,
        tableHeader__edit: 'Sunting',
        tableHeader__plan: 'Pelan',
        tableHeader__startDate: 'Tarikh mula',
        title: 'Langganan',
      },
      subscriptionsSection: {
        actionLabel__default: 'Urus',
      },
      switchPlansSection: {
        title: 'Tukar pelan',
      },
      title: 'Pengebilan & Pembayaran',
    },
    createDomainPage: {
      subtitle:
        'Tambahkan domain untuk pengesahan. Pengguna dengan alamat e-mel di domain ini boleh menyertai organisasi secara automatik atau meminta untuk menyertai.',
      title: 'Tambah domain',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Jemputan tidak dapat dihantar. Terdapat jemputan tertunggak untuk alamat e-mel berikut: {{email_addresses}}.',
      formButtonPrimary__continue: 'Hantar jemputan',
      formButtonPrimary__purchaseSeats: undefined,
      selectDropdown__role: 'Pilih peranan',
      subtitle: 'Masukkan atau tampal satu atau lebih alamat e-mel, dipisahkan oleh ruang atau koma.',
      successMessage: 'Jemputan berjaya dihantar',
      title: 'Jemput ahli baharu',
    },
    membersPage: {
      action__invite: 'Jemput',
      action__search: 'Cari',
      activeMembersTab: {
        menuAction__remove: 'Keluarkan ahli',
        tableHeader__actions: 'Tindakan',
        tableHeader__joined: 'Disertai',
        tableHeader__role: 'Peranan',
        tableHeader__user: 'Pengguna',
      },
      alerts: {
        roleSetMigrationInProgress: {
          subtitle:
            'Kami sedang mengemas kini peranan yang tersedia. Setelah selesai, anda akan dapat mengemas kini peranan semula.',
          title: 'Peranan dikunci buat sementara waktu',
        },
      },
      detailsTitle__emptyRow: 'Tiada ahli untuk dipaparkan',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Jemput pengguna dengan menghubungkan domain e-mel dengan organisasi anda. Sesiapa yang mendaftar dengan domain e-mel yang sepadan akan dapat menyertai organisasi pada bila-bila masa.',
          headerTitle: 'Jemputan automatik',
          primaryButton: 'Urus domain yang disahkan',
        },
        table__emptyRow: 'Tiada jemputan untuk dipaparkan',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Batal jemputan',
        tableHeader__invited: 'Dijemput',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Pengguna yang mendaftar dengan domain e-mel yang sepadan, akan dapat melihat cadangan untuk meminta untuk menyertai organisasi anda.',
          headerTitle: 'Cadangan automatik',
          primaryButton: 'Urus domain yang disahkan',
        },
        menuAction__approve: 'Lulus',
        menuAction__reject: 'Tolak',
        tableHeader__requested: 'Meminta akses',
        table__emptyRow: 'Tiada permintaan untuk dipaparkan',
      },
      start: {
        headerTitle__invitations: 'Jemputan',
        headerTitle__members: 'Ahli',
        headerTitle__requests: 'Permintaan',
      },
    },
    navbar: {
      apiKeys: 'Kunci API',
      billing: 'Pengebilan',
      description: 'Urus organisasi anda.',
      general: 'Am',
      members: 'Ahli',
      security: undefined,
      title: 'Organisasi',
    },
    plansPage: {
      alerts: {
        noPermissionsToManageBilling: 'Anda tidak mempunyai kebenaran untuk mengurus pengebilan bagi organisasi ini.',
        planMembershipLimitExceeded: undefined,
      },
      title: 'Pelan',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Taip "{{organizationName}}" di bawah untuk meneruskan.',
          messageLine1: 'Adakah anda pasti mahu memadam organisasi ini?',
          messageLine2: 'Tindakan ini adalah kekal dan tidak boleh dibatalkan.',
          successMessage: 'Anda telah memadam organisasi.',
          title: 'Padam organisasi',
        },
        leaveOrganization: {
          actionDescription: 'Taip "{{organizationName}}" di bawah untuk meneruskan.',
          messageLine1:
            'Adakah anda pasti mahu meninggalkan organisasi ini? Anda akan kehilangan akses kepada organisasi ini dan aplikasinya.',
          messageLine2: 'Tindakan ini adalah kekal dan tidak boleh dibatalkan.',
          successMessage: 'Anda telah meninggalkan organisasi.',
          title: 'Tinggalkan organisasi',
        },
        title: 'Bahaya',
      },
      domainSection: {
        menuAction__manage: 'Urus',
        menuAction__remove: 'Padam',
        menuAction__verify: 'Sahkan',
        primaryButton: 'Tambah domain',
        subtitle:
          'Benarkan pengguna menyertai organisasi secara automatik atau meminta untuk menyertai berdasarkan domain e-mel yang disahkan.',
        title: 'Domain yang disahkan',
      },
      successMessage: 'Organisasi telah dikemas kini.',
      title: 'Kemas kini profil',
    },
    removeDomainPage: {
      messageLine1: 'Domain e-mel {{domain}} akan dikeluarkan.',
      messageLine2: 'Pengguna tidak akan dapat menyertai organisasi secara automatik selepas ini.',
      successMessage: '{{domain}} telah dikeluarkan.',
      title: 'Keluarkan domain',
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
      headerTitle__general: 'Am',
      headerTitle__members: 'Ahli',
      membershipSeatUsageLabel: undefined,
      profileSection: {
        primaryButton: 'Kemas kini profil',
        title: 'Profil Organisasi',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Mengeluarkan domain ini akan mempengaruhi pengguna yang dijemput.',
        removeDomainActionLabel__remove: 'Keluarkan domain',
        removeDomainSubtitle: 'Keluarkan domain ini daripada domain yang disahkan anda',
        removeDomainTitle: 'Keluarkan domain',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Pengguna akan dijemput secara automatik untuk menyertai organisasi apabila mereka mendaftar dan boleh menyertai pada bila-bila masa.',
        automaticInvitationOption__label: 'Jemputan automatik',
        automaticSuggestionOption__description:
          'Pengguna menerima cadangan untuk meminta untuk menyertai, tetapi mesti diluluskan oleh pentadbir sebelum mereka dapat menyertai organisasi.',
        automaticSuggestionOption__label: 'Cadangan automatik',
        calloutInfoLabel: 'Mengubah mod pendaftaran hanya akan mempengaruhi pengguna baharu.',
        calloutInvitationCountLabel: 'Jemputan tertunggak yang dihantar kepada pengguna: {{count}}',
        calloutSuggestionCountLabel: 'Cadangan tertunggak yang dihantar kepada pengguna: {{count}}',
        manualInvitationOption__description: 'Pengguna hanya boleh dijemput secara manual ke organisasi.',
        manualInvitationOption__label: 'Tiada pendaftaran automatik',
        subtitle: 'Pilih bagaimana pengguna dari domain ini boleh menyertai organisasi.',
      },
      start: {
        headerTitle__danger: 'Bahaya',
        headerTitle__enrollment: 'Pilihan pendaftaran',
      },
      subtitle: 'Domain {{domain}} kini disahkan. Teruskan dengan memilih mod pendaftaran.',
      title: 'Kemas kini {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Masukkan kod pengesahan yang dihantar ke alamat e-mel anda',
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'Domain {{domainName}} perlu disahkan melalui e-mel.',
      subtitleVerificationCodeScreen:
        'Kod pengesahan telah dihantar ke {{emailAddress}}. Masukkan kod untuk meneruskan.',
      title: 'Sahkan domain',
    },
  },
  organizationSwitcher: {
    action__closeOrganizationSwitcher: 'Tutup penukar organisasi',
    action__createOrganization: 'Cipta organisasi',
    action__invitationAccept: 'Sertai',
    action__manageOrganization: 'Urus',
    action__openOrganizationSwitcher: 'Buka penukar organisasi',
    action__suggestionsAccept: 'Minta untuk menyertai',
    notSelected: 'Tiada organisasi dipilih',
    personalWorkspace: 'Akaun peribadi',
    suggestionsAcceptedLabel: 'Menunggu kelulusan',
  },
  paginationButton__next: 'Seterusnya',
  paginationButton__previous: 'Sebelumnya',
  paginationRowText__displaying: 'Memaparkan',
  paginationRowText__of: 'daripada',
  reverification: {
    alternativeMethods: {
      actionLink: 'Dapatkan bantuan',
      actionText: 'Tidak mempunyai mana-mana ini?',
      blockButton__backupCode: 'Gunakan kod sandaran',
      blockButton__emailCode: 'E-mel kod ke {{identifier}}',
      blockButton__passkey: 'Gunakan kunci pas anda',
      blockButton__password: 'Teruskan dengan kata laluan anda',
      blockButton__phoneCode: 'Hantar kod SMS ke {{identifier}}',
      blockButton__totp: 'Gunakan aplikasi pengesah anda',
      getHelp: {
        blockButton__emailSupport: 'E-mel sokongan',
        content:
          'Jika anda mengalami masalah mengesahkan akaun anda, e-mel kami dan kami akan bekerja dengan anda untuk memulihkan akses secepat mungkin.',
        title: 'Dapatkan bantuan',
      },
      subtitle: 'Menghadapi masalah? Anda boleh menggunakan mana-mana kaedah ini untuk pengesahan.',
      title: 'Gunakan kaedah lain',
    },
    backupCodeMfa: {
      subtitle: 'Masukkan kod sandaran yang anda terima semasa menyediakan pengesahan dua langkah',
      title: 'Masukkan kod sandaran',
    },
    emailCode: {
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'Masukkan kod yang dihantar ke e-mel anda untuk meneruskan',
      title: 'Pengesahan diperlukan',
    },
    noAvailableMethods: {
      message: 'Tidak dapat meneruskan pengesahan. Tiada faktor pengesahan yang sesuai dikonfigurasi',
      subtitle: 'Ralat berlaku',
      title: 'Tidak dapat mengesahkan akaun anda',
    },
    passkey: {
      blockButton__passkey: 'Gunakan kunci pas anda',
      subtitle:
        'Menggunakan kunci pas anda mengesahkan identiti anda. Peranti anda mungkin meminta cap jari, wajah, atau kunci skrin anda.',
      title: 'Gunakan kunci pas anda',
    },
    password: {
      actionLink: 'Gunakan kaedah lain',
      subtitle: 'Masukkan kata laluan semasa anda untuk meneruskan',
      title: 'Pengesahan diperlukan',
    },
    phoneCode: {
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'Masukkan kod yang dihantar ke telefon anda untuk meneruskan',
      title: 'Pengesahan diperlukan',
    },
    phoneCodeMfa: {
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'Masukkan kod yang dihantar ke telefon anda untuk meneruskan',
      title: 'Pengesahan diperlukan',
    },
    totpMfa: {
      formTitle: 'Kod pengesahan',
      subtitle: 'Masukkan kod yang dijana oleh aplikasi pengesah anda untuk meneruskan',
      title: 'Pengesahan diperlukan',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Tambah akaun',
      action__signOutAll: 'Daftar keluar dari semua akaun',
      subtitle: 'Pilih akaun yang anda ingin teruskan.',
      title: 'Pilih akaun',
    },
    alternativeMethods: {
      actionLink: 'Dapatkan bantuan',
      actionText: 'Tidak mempunyai mana-mana ini?',
      blockButton__backupCode: 'Gunakan kod sandaran',
      blockButton__emailCode: 'E-mel kod ke {{identifier}}',
      blockButton__emailLink: 'E-mel pautan ke {{identifier}}',
      blockButton__passkey: 'Daftar masuk dengan kunci pas anda',
      blockButton__password: 'Daftar masuk dengan kata laluan anda',
      blockButton__phoneCode: 'Hantar kod SMS ke {{identifier}}',
      blockButton__totp: 'Gunakan aplikasi pengesah anda',
      getHelp: {
        blockButton__emailSupport: 'E-mel sokongan',
        content:
          'Jika anda mengalami masalah mendaftar masuk ke akaun anda, e-mel kami dan kami akan bekerja dengan anda untuk memulihkan akses secepat mungkin.',
        title: 'Dapatkan bantuan',
      },
      subtitle: 'Menghadapi masalah? Anda boleh menggunakan mana-mana kaedah ini untuk mendaftar masuk.',
      title: 'Gunakan kaedah lain',
    },
    alternativePhoneCodeProvider: {
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'untuk meneruskan ke {{applicationName}}',
      title: 'Semak {{provider}} anda',
    },
    backupCodeMfa: {
      subtitle: 'Kod sandaran anda adalah kod yang anda terima semasa menyediakan pengesahan dua langkah.',
      title: 'Masukkan kod sandaran',
    },
    emailCode: {
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'untuk meneruskan ke {{applicationName}}',
      title: 'Periksa e-mel anda',
    },
    emailCodeMfa: {
      formTitle: 'Periksa e-mel anda',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'untuk meneruskan ke {{applicationName}}',
      title: 'Periksa e-mel anda',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Untuk meneruskan, buka pautan pengesahan pada peranti dan pelayar dari mana anda memulakan pendaftaran masuk',
        title: 'Pautan pengesahan tidak sah untuk peranti ini',
      },
      expired: {
        subtitle: 'Kembali ke tab asal untuk meneruskan.',
        title: 'Pautan pengesahan ini telah tamat tempoh',
      },
      failed: {
        subtitle: 'Kembali ke tab asal untuk meneruskan.',
        title: 'Pautan pengesahan ini tidak sah',
      },
      formSubtitle: 'Gunakan pautan pengesahan yang dihantar ke e-mel anda',
      formTitle: 'Pautan pengesahan',
      loading: {
        subtitle: 'Anda akan dialihkan tidak lama lagi',
        title: 'Mendaftar masuk...',
      },
      resendButton: 'Tidak menerima pautan? Hantar semula',
      subtitle: 'untuk meneruskan ke {{applicationName}}',
      title: 'Periksa e-mel anda',
      unusedTab: {
        title: 'Anda boleh menutup tab ini',
      },
      verified: {
        subtitle: 'Anda akan dialihkan tidak lama lagi',
        title: 'Berjaya mendaftar masuk',
      },
      verifiedSwitchTab: {
        subtitle: 'Kembali ke tab asal untuk meneruskan',
        subtitleNewTab: 'Kembali ke tab yang baru dibuka untuk meneruskan',
        titleNewTab: 'Didaftarkan masuk pada tab lain',
      },
    },
    emailLinkMfa: {
      formSubtitle: 'Gunakan pautan pengesahan yang dihantar ke e-mel anda',
      resendButton: 'Tidak menerima pautan? Hantar semula',
      subtitle: 'untuk meneruskan ke {{applicationName}}',
      title: 'Semak e-mel anda',
    },
    enterpriseConnections: {
      subtitle: 'Pilih akaun perusahaan yang anda ingin teruskan.',
      title: 'Pilih akaun perusahaan anda',
    },
    forgotPassword: {
      formTitle: 'Kod tetapan semula kata laluan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'untuk menetapkan semula kata laluan anda',
      subtitle_email: 'Pertama, masukkan kod yang dihantar ke alamat e-mel anda',
      subtitle_phone: 'Pertama, masukkan kod yang dihantar ke telefon anda',
      title: 'Tetapkan semula kata laluan',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Tetapkan semula kata laluan anda',
      label__alternativeMethods: 'Atau, daftar masuk dengan kaedah lain',
      title: 'Lupa Kata Laluan?',
    },
    newDeviceVerificationNotice:
      'Anda sedang mendaftar masuk dari peranti baharu. Kami meminta pengesahan untuk menjaga keselamatan akaun anda.',
    noAvailableMethods: {
      message: 'Tidak dapat meneruskan pendaftaran masuk. Tiada faktor pengesahan yang tersedia.',
      subtitle: 'Ralat berlaku',
      title: 'Tidak dapat mendaftar masuk',
    },
    passkey: {
      subtitle:
        'Menggunakan kunci pas anda mengesahkan bahawa itu adalah anda. Peranti anda mungkin meminta cap jari, wajah atau kunci skrin anda.',
      title: 'Gunakan kunci pas anda',
    },
    password: {
      actionLink: 'Gunakan kaedah lain',
      subtitle: 'Masukkan kata laluan yang berkaitan dengan akaun anda',
      title: 'Masukkan kata laluan anda',
    },
    passwordCompromised: {
      title: 'Kata laluan terjejas',
    },
    passwordPwned: {
      title: 'Kata laluan dikompromi',
    },
    passwordUntrusted: {
      title: 'Kata laluan tidak dipercayai',
    },
    phoneCode: {
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'untuk meneruskan ke {{applicationName}}',
      title: 'Periksa telefon anda',
    },
    phoneCodeMfa: {
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'Untuk meneruskan, sila masukkan kod pengesahan yang dihantar ke telefon anda',
      title: 'Periksa telefon anda',
    },
    resetPassword: {
      formButtonPrimary: 'Tetapkan Semula Kata Laluan',
      requiredMessage: 'Atas sebab keselamatan, adalah diperlukan untuk menetapkan semula kata laluan anda.',
      successMessage: 'Kata laluan anda telah berjaya diubah. Mendaftarkan anda masuk, sila tunggu sebentar.',
      title: 'Tetapkan kata laluan baharu',
    },
    resetPasswordMfa: {
      detailsLabel: 'Kami perlu mengesahkan identiti anda sebelum menetapkan semula kata laluan anda.',
    },
    start: {
      actionLink: 'Daftar',
      actionLink__join_waitlist: 'Sertai senarai menunggu',
      actionLink__use_email: 'Gunakan e-mel',
      actionLink__use_email_username: 'Gunakan e-mel atau nama pengguna',
      actionLink__use_passkey: 'Gunakan kunci pas sebaliknya',
      actionLink__use_phone: 'Gunakan telefon',
      actionLink__use_username: 'Gunakan nama pengguna',
      actionText: 'Tidak mempunyai akaun?',
      actionText__join_waitlist: 'Mahu akses awal?',
      alternativePhoneCodeProvider: {
        actionLink: 'Gunakan kaedah lain',
        label: 'Nombor telefon {{provider}}',
        subtitle: 'Masukkan nombor telefon anda untuk mendapatkan kod pengesahan di {{provider}}.',
        title: 'Log masuk ke {{applicationName}} dengan {{provider}}',
      },
      subtitle: 'Selamat kembali! Sila daftar masuk untuk meneruskan',
      subtitleCombined: undefined,
      title: 'Daftar masuk ke {{applicationName}}',
      titleCombined: 'Teruskan ke {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Kod pengesahan',
      subtitle: 'Untuk meneruskan, sila masukkan kod pengesahan yang dijana oleh aplikasi pengesah anda',
      title: 'Pengesahan dua langkah',
    },
    web3Solana: {
      subtitle: 'Pilih dompet di bawah untuk log masuk',
      title: 'Log masuk dengan Solana',
    },
  },
  signInEnterPasswordTitle: 'Masukkan kata laluan anda',
  signUp: {
    alternativePhoneCodeProvider: {
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'Masukkan kod pengesahan yang dihantar ke {{provider}} anda',
      title: 'Sahkan {{provider}} anda',
    },
    continue: {
      actionLink: 'Daftar masuk',
      actionText: 'Sudah mempunyai akaun?',
      subtitle: 'Sila isi butiran yang tinggal untuk meneruskan.',
      title: 'Isi medan yang hilang',
    },
    emailCode: {
      formSubtitle: 'Masukkan kod pengesahan yang dihantar ke alamat e-mel anda',
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'Masukkan kod pengesahan yang dihantar ke e-mel anda',
      title: 'Sahkan e-mel anda',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Untuk meneruskan, buka pautan pengesahan pada peranti dan pelayar dari mana anda memulakan pendaftaran',
        title: 'Pautan pengesahan tidak sah untuk peranti ini',
      },
      formSubtitle: 'Gunakan pautan pengesahan yang dihantar ke alamat e-mel anda',
      formTitle: 'Pautan pengesahan',
      loading: {
        title: 'Mendaftar...',
      },
      resendButton: 'Tidak menerima pautan? Hantar semula',
      subtitle: 'untuk meneruskan ke {{applicationName}}',
      title: 'Sahkan e-mel anda',
      verified: {
        title: 'Berjaya mendaftar',
      },
      verifiedSwitchTab: {
        subtitle: 'Kembali ke tab yang baru dibuka untuk meneruskan',
        subtitleNewTab: 'Kembali ke tab sebelumnya untuk meneruskan',
        title: 'Berjaya mengesahkan e-mel',
      },
    },
    enterpriseConnections: {
      subtitle: 'Pilih akaun perusahaan yang anda ingin teruskan.',
      title: 'Pilih akaun perusahaan anda',
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Saya bersetuju dengan {{ privacyPolicyLink || link("Dasar Privasi") }}',
        label__onlyTermsOfService: 'Saya bersetuju dengan {{ termsOfServiceLink || link("Terma Perkhidmatan") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Saya bersetuju dengan {{ termsOfServiceLink || link("Terma Perkhidmatan") }} dan {{ privacyPolicyLink || link("Dasar Privasi") }}',
      },
      continue: {
        subtitle: 'Sila baca dan terima terma untuk meneruskan',
        title: 'Persetujuan undang-undang',
      },
    },
    phoneCode: {
      formSubtitle: 'Masukkan kod pengesahan yang dihantar ke nombor telefon anda',
      formTitle: 'Kod pengesahan',
      resendButton: 'Tidak menerima kod? Hantar semula',
      subtitle: 'Masukkan kod pengesahan yang dihantar ke telefon anda',
      title: 'Sahkan telefon anda',
    },
    restrictedAccess: {
      actionLink: 'Daftar masuk',
      actionText: 'Sudah mempunyai akaun?',
      blockButton__emailSupport: 'E-mel sokongan',
      blockButton__joinWaitlist: 'Sertai senarai menunggu',
      subtitle:
        'Pendaftaran kini dilumpuhkan. Jika anda percaya anda sepatutnya mempunyai akses, sila hubungi sokongan.',
      subtitleWaitlist:
        'Pendaftaran kini dilumpuhkan. Untuk menjadi yang pertama tahu bila kami melancarkan, sertai senarai menunggu.',
      title: 'Akses terhad',
    },
    start: {
      actionLink: 'Daftar masuk',
      actionLink__use_email: 'Gunakan e-mel sebaliknya',
      actionLink__use_phone: 'Gunakan telefon sebaliknya',
      actionText: 'Sudah mempunyai akaun?',
      alternativePhoneCodeProvider: {
        actionLink: 'Gunakan kaedah lain',
        label: 'Nombor telefon {{provider}}',
        subtitle: 'Masukkan nombor telefon anda untuk mendapatkan kod pengesahan di {{provider}}.',
        title: 'Daftar ke {{applicationName}} dengan {{provider}}',
      },
      subtitle: 'Selamat datang! Sila isi butiran untuk memulakan.',
      subtitleCombined: 'Selamat datang! Sila isi butiran untuk memulakan.',
      title: 'Cipta akaun anda',
      titleCombined: 'Cipta akaun anda',
    },
    web3Solana: {
      subtitle: 'Pilih dompet di bawah untuk mendaftar',
      title: 'Daftar dengan Solana',
    },
  },
  socialButtonsBlockButton: 'Teruskan dengan {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  taskChooseOrganization: {
    alerts: {
      organizationAlreadyExists:
        'Organisasi sudah wujud untuk nama syarikat yang dikesan ({{organizationName}}) dan {{organizationDomain}}. Sertai melalui jemputan.',
    },
    chooseOrganization: {
      action__createOrganization: 'Cipta organisasi baharu',
      action__invitationAccept: 'Sertai',
      action__suggestionsAccept: 'Minta untuk menyertai',
      subtitle: 'Sertai organisasi sedia ada atau cipta yang baharu',
      subtitle__createOrganizationDisabled: 'Sertai organisasi sedia ada',
      suggestionsAcceptedLabel: 'Menunggu kelulusan',
      title: 'Pilih organisasi',
    },
    createOrganization: {
      formButtonReset: 'Batal',
      formButtonSubmit: 'Teruskan',
      formFieldInputPlaceholder__name: 'Organisasi Saya',
      formFieldInputPlaceholder__slug: 'organisasi-saya',
      formFieldLabel__name: 'Nama',
      formFieldLabel__slug: 'Slug',
      subtitle: 'Masukkan butiran organisasi anda untuk meneruskan',
      title: 'Sediakan organisasi anda',
    },
    organizationCreationDisabled: {
      subtitle: 'Hubungi pentadbir organisasi anda untuk jemputan.',
      title: 'Anda mesti menjadi ahli organisasi',
    },
    signOut: {
      actionLink: 'Daftar keluar',
      actionText: 'Log masuk sebagai {{identifier}}',
    },
  },
  taskResetPassword: {
    formButtonPrimary: 'Tetapkan Semula Kata Laluan',
    signOut: {
      actionLink: 'Log keluar',
      actionText: 'Log masuk sebagai {{identifier}}',
    },
    subtitle: 'Akaun anda memerlukan kata laluan baharu sebelum anda boleh meneruskan',
    title: 'Tetapkan semula kata laluan anda',
  },
  taskSetupMfa: {
    badge: 'Persediaan pengesahan dua langkah',
    signOut: {
      actionLink: 'Log keluar',
      actionText: 'Log masuk sebagai {{identifier}}',
    },
    smsCode: {
      addPhone: {
        formButtonPrimary: 'Teruskan',
        infoText:
          'Mesej teks yang mengandungi kod pengesahan akan dihantar ke nombor telefon ini. Kadar mesej dan data mungkin dikenakan.',
      },
      addPhoneNumber: 'Tambah nombor telefon',
      cancel: 'Batalkan',
      subtitle: 'Pilih nombor telefon yang anda mahu gunakan untuk pengesahan dua langkah kod SMS',
      success: {
        finishButton: 'Teruskan',
        message1:
          'Pengesahan dua langkah kini didayakan. Apabila log masuk, anda perlu memasukkan kod pengesahan yang dihantar ke nombor telefon ini sebagai langkah tambahan.',
        message2:
          'Simpan kod sandaran ini dan simpan di tempat yang selamat. Jika anda kehilangan akses kepada peranti pengesahan anda, anda boleh menggunakan kod sandaran untuk log masuk.',
        title: 'Pengesahan kod SMS didayakan',
      },
      title: 'Tambah pengesahan kod SMS',
      verifyPhone: {
        formButtonPrimary: 'Teruskan',
        formTitle: 'Kod pengesahan',
        resendButton: 'Tidak menerima kod? Hantar semula',
        subtitle: 'Masukkan kod pengesahan yang dihantar ke',
        title: 'Sahkan nombor telefon anda',
      },
    },
    start: {
      methodSelection: {
        phoneCode: 'Kod SMS',
        totp: 'Aplikasi pengesah',
      },
      subtitle: 'Pilih kaedah yang anda lebih suka untuk melindungi akaun anda dengan lapisan keselamatan tambahan',
      title: 'Sediakan pengesahan dua langkah',
    },
    totpCode: {
      addAuthenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Imbas kod QR sebaliknya',
        buttonUnableToScan__nonPrimary: 'Tidak boleh imbas kod QR?',
        formButtonPrimary: 'Teruskan',
        formButtonReset: 'Batalkan',
        infoText__ableToScan:
          'Sediakan kaedah log masuk baharu dalam aplikasi pengesah anda dan imbas kod QR berikut untuk memautkannya ke akaun anda.',
        infoText__unableToScan:
          'Sediakan kaedah log masuk baharu dalam pengesah anda dan masukkan Kunci yang disediakan di bawah.',
        inputLabel__unableToScan1:
          'Pastikan kata laluan Berasaskan Masa atau Sekali Guna didayakan, kemudian selesaikan pemautan akaun anda.',
      },
      success: {
        finishButton: 'Teruskan',
        message1:
          'Pengesahan dua langkah kini didayakan. Apabila log masuk, anda perlu memasukkan kod pengesahan daripada pengesah ini sebagai langkah tambahan.',
        message2:
          'Simpan kod sandaran ini dan simpan di tempat yang selamat. Jika anda kehilangan akses kepada peranti pengesahan anda, anda boleh menggunakan kod sandaran untuk log masuk.',
        title: 'Pengesahan aplikasi pengesah didayakan',
      },
      title: 'Tambah aplikasi pengesah',
      verifyTotp: {
        formButtonPrimary: 'Teruskan',
        formButtonReset: 'Batalkan',
        formTitle: 'Kod pengesahan',
        subtitle: 'Masukkan kod pengesahan yang dijana oleh pengesah anda',
        title: 'Tambah aplikasi pengesah',
      },
    },
  },
  unstable__errors: {
    already_a_member_in_organization: '{{email}} sudah menjadi ahli organisasi.',
    api_key_name_already_exists: undefined,
    api_key_usage_exceeded: undefined,
    avatar_file_size_exceeded: 'Saiz fail melebihi had maksimum 10MB. Sila pilih fail yang lebih kecil.',
    avatar_file_type_invalid: 'Jenis fail tidak disokong. Sila muat naik imej JPG, PNG, GIF atau WEBP.',
    captcha_invalid:
      'Pendaftaran tidak berjaya kerana pengesahan keselamatan gagal. Sila muat semula halaman untuk mencuba lagi atau hubungi sokongan untuk bantuan lebih lanjut.',
    captcha_unavailable:
      'Pendaftaran tidak berjaya kerana pengesahan bot gagal. Sila muat semula halaman untuk mencuba lagi atau hubungi sokongan untuk bantuan lebih lanjut.',
    form_code_incorrect: undefined,
    form_email_address_blocked:
      'Perkhidmatan e-mel sementara tidak disokong. Sila gunakan alamat e-mel biasa anda untuk membuat akaun.',
    form_identifier_exists__email_address: 'Alamat e-mel ini telah diambil. Sila cuba yang lain.',
    form_identifier_exists__phone_number: 'Nombor telefon ini telah diambil. Sila cuba yang lain.',
    form_identifier_exists__username: 'Nama pengguna ini telah diambil. Sila cuba yang lain.',
    form_identifier_not_found: 'Tiada akaun dijumpai dengan pengenal ini. Sila periksa dan cuba lagi.',
    form_new_password_matches_current: 'Kata laluan baharu tidak boleh sama dengan kata laluan semasa.',
    form_param_format_invalid:
      'Nilai yang dimasukkan adalah dalam format yang tidak sah. Sila periksa dan betulkannya.',
    form_param_format_invalid__email_address: 'Alamat e-mel mestilah alamat e-mel yang sah.',
    form_param_format_invalid__phone_number: 'Nombor telefon mestilah dalam format antarabangsa yang sah.',
    form_param_max_length_exceeded__first_name: 'Nama pertama tidak boleh melebihi 256 aksara.',
    form_param_max_length_exceeded__last_name: 'Nama terakhir tidak boleh melebihi 256 aksara.',
    form_param_max_length_exceeded__name: 'Nama tidak boleh melebihi 256 aksara.',
    form_param_nil: 'Medan ini diperlukan dan tidak boleh kosong.',
    form_param_type_invalid: undefined,
    form_param_type_invalid__email_address: undefined,
    form_param_type_invalid__phone_number: undefined,
    form_param_value_invalid: 'Nilai yang dimasukkan tidak sah. Sila betulkannya.',
    form_password_compromised__sign_in: undefined,
    form_password_incorrect: 'Kata laluan yang anda masukkan tidak betul. Sila cuba lagi.',
    form_password_length_too_short: 'Kata laluan anda terlalu pendek. Ia mesti sekurang-kurangnya 8 aksara panjang.',
    form_password_not_strong_enough: 'Kata laluan anda tidak cukup kuat.',
    form_password_or_identifier_incorrect:
      'Kata laluan atau alamat e-mel tidak betul. Cuba lagi atau gunakan kaedah lain.',
    form_password_pwned:
      'Kata laluan ini telah dijumpai sebagai sebahagian daripada pelanggaran dan tidak boleh digunakan, sila cuba kata laluan lain.',
    form_password_pwned__sign_in:
      'Kata laluan ini telah dijumpai sebagai sebahagian daripada pelanggaran dan tidak boleh digunakan, sila tetapkan semula kata laluan anda.',
    form_password_size_in_bytes_exceeded:
      'Kata laluan anda telah melebihi bilangan maksimum bait yang dibenarkan, sila pendekkannya atau keluarkan beberapa aksara khas.',
    form_password_untrusted__sign_in:
      'Kata laluan anda mungkin terjejas. Untuk melindungi akaun anda, sila teruskan dengan kaedah log masuk alternatif. Anda dikehendaki menetapkan semula kata laluan anda selepas log masuk.',
    form_password_validation_failed: 'Kata Laluan Tidak Betul',
    form_username_invalid_character:
      'Nama pengguna anda mengandungi aksara yang tidak sah. Sila gunakan hanya huruf, nombor, dan garis bawah.',
    form_username_invalid_length:
      'Nama pengguna anda mestilah antara {{min_length}} dan {{max_length}} aksara panjang.',
    form_username_needs_non_number_char:
      'Nama pengguna anda mesti mengandungi sekurang-kurangnya satu aksara bukan nombor.',
    identification_deletion_failed: 'Anda tidak boleh memadamkan pengenalan terakhir anda.',
    insufficient_seats_change_plan: undefined,
    insufficient_seats_contact_support: undefined,
    not_allowed_access:
      'Anda tidak mempunyai kebenaran untuk mengakses halaman ini. Sila hubungi sokongan jika anda percaya ini adalah kesilapan.',
    oauth_access_denied: undefined,
    organization_domain_blocked: 'Ini adalah domain pembekal e-mel yang disekat. Sila gunakan yang berbeza.',
    organization_domain_common: 'Ini adalah domain pembekal e-mel biasa. Sila gunakan yang berbeza.',
    organization_domain_exists_for_enterprise_connection: 'Domain ini sudah digunakan untuk SSO organisasi anda',
    organization_membership_quota_exceeded:
      'Anda telah mencapai had keahlian organisasi anda, termasuk jemputan tertunggak.',
    organization_minimum_permissions_needed:
      'Mesti ada sekurang-kurangnya satu ahli organisasi dengan kebenaran minimum yang diperlukan.',
    organization_not_found_or_unauthorized: 'Anda bukan lagi ahli organisasi ini. Sila pilih atau cipta yang lain.',
    organization_not_found_or_unauthorized_with_create_organization_disabled:
      'Anda bukan lagi ahli organisasi ini. Sila pilih yang lain.',
    passkey_already_exists: 'Kunci pas sudah didaftarkan dengan peranti ini.',
    passkey_not_supported: 'Kunci pas tidak disokong pada peranti ini.',
    passkey_pa_not_supported: 'Pendaftaran memerlukan pengesah platform tetapi peranti tidak menyokongnya.',
    passkey_registration_cancelled: 'Pendaftaran kunci pas dibatalkan atau tamat masa.',
    passkey_retrieval_cancelled: 'Pengesahan kunci pas dibatalkan atau tamat masa.',
    passwordComplexity: {
      maximumLength: 'kurang daripada {{length}} aksara',
      minimumLength: '{{length}} atau lebih aksara',
      requireLowercase: 'huruf kecil',
      requireNumbers: 'nombor',
      requireSpecialCharacter: 'aksara khas',
      requireUppercase: 'huruf besar',
      sentencePrefix: 'Kata laluan anda mesti mengandungi',
    },
    phone_number_exists: 'Nombor telefon ini telah diambil. Sila cuba yang lain.',
    session_exists: undefined,
    web3_missing_identifier: 'Sambungan Dompet Web3 tidak dapat dijumpai. Sila pasang satu untuk meneruskan.',
    web3_signature_request_rejected: 'Anda telah menolak permintaan tandatangan. Sila cuba lagi untuk meneruskan.',
    web3_solana_signature_generation_failed:
      'Ralat berlaku semasa menjana tandatangan. Sila cuba lagi untuk meneruskan.',
    zxcvbn: {
      couldBeStronger: 'Kata laluan anda berfungsi, tetapi boleh lebih kuat. Cuba tambah lebih banyak aksara.',
      goodPassword: 'Kata laluan anda memenuhi semua keperluan yang diperlukan.',
      notEnough: 'Kata laluan anda tidak cukup kuat.',
      suggestions: {
        allUppercase: 'Gunakan huruf besar untuk sebahagian, tetapi bukan semua huruf.',
        anotherWord: 'Tambah lebih banyak perkataan yang kurang biasa.',
        associatedYears: 'Elakkan tahun yang berkaitan dengan anda.',
        capitalization: 'Gunakan huruf besar lebih daripada huruf pertama.',
        dates: 'Elakkan tarikh dan tahun yang berkaitan dengan anda.',
        l33t: "Elakkan penggantian huruf yang boleh diramal seperti '@' untuk 'a'.",
        longerKeyboardPattern: 'Gunakan corak papan kekunci yang lebih panjang dan tukar arah menaip beberapa kali.',
        noNeed: 'Anda boleh mencipta kata laluan yang kuat tanpa menggunakan simbol, nombor, atau huruf besar.',
        pwned: 'Jika anda menggunakan kata laluan ini di tempat lain, anda harus mengubahnya.',
        recentYears: 'Elakkan tahun terkini.',
        repeated: 'Elakkan perkataan dan aksara yang berulang.',
        reverseWords: 'Elakkan ejaan terbalik perkataan biasa.',
        sequences: 'Elakkan urutan aksara biasa.',
        useWords: 'Gunakan beberapa perkataan, tetapi elakkan frasa biasa.',
      },
      warnings: {
        common: 'Ini adalah kata laluan yang biasa digunakan.',
        commonNames: 'Nama dan nama keluarga biasa mudah diteka.',
        dates: 'Tarikh mudah diteka.',
        extendedRepeat: 'Corak aksara berulang seperti "abcabcabc" mudah diteka.',
        keyPattern: 'Corak papan kekunci pendek mudah diteka.',
        namesByThemselves: 'Nama tunggal atau nama keluarga mudah diteka.',
        pwned: 'Kata laluan anda telah terdedah oleh pelanggaran data di Internet.',
        recentYears: 'Tahun terkini mudah diteka.',
        sequences: 'Urutan aksara biasa seperti "abc" mudah diteka.',
        similarToCommon: 'Ini serupa dengan kata laluan yang biasa digunakan.',
        simpleRepeat: 'Aksara berulang seperti "aaa" mudah diteka.',
        straightRow: 'Baris lurus kekunci pada papan kekunci anda mudah diteka.',
        topHundred: 'Ini adalah kata laluan yang sering digunakan.',
        topTen: 'Ini adalah kata laluan yang sangat digunakan.',
        userInputs: 'Tidak sepatutnya ada data peribadi atau berkaitan halaman.',
        wordByItself: 'Perkataan tunggal mudah diteka.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Tambah akaun',
    action__closeUserMenu: 'Tutup menu pengguna',
    action__manageAccount: 'Urus akaun',
    action__openUserMenu: 'Buka menu pengguna',
    action__signOut: 'Daftar keluar',
    action__signOutAll: 'Daftar keluar dari semua akaun',
    label__userButtonPopover: 'Panel akaun',
    label__accountActions: 'Tindakan akaun',
    label__activeSessions: 'Sesi aktif',
  },
  userProfile: {
    apiKeysPage: {
      title: 'Kunci API',
    },
    backupCodePage: {
      actionLabel__copied: 'Disalin!',
      actionLabel__copy: 'Salin semua',
      actionLabel__download: 'Muat turun .txt',
      actionLabel__print: 'Cetak',
      infoText1: 'Kod sandaran akan diaktifkan untuk akaun ini.',
      infoText2:
        'Simpan kod sandaran dengan selamat dan rahsia. Anda boleh menjana semula kod sandaran jika anda mengesyaki ia telah dikompromi.',
      subtitle__codelist: 'Simpan dengan selamat dan rahsia.',
      successMessage:
        'Kod sandaran kini diaktifkan. Anda boleh menggunakan salah satu daripadanya untuk mendaftar masuk ke akaun anda, jika anda kehilangan akses ke peranti pengesahan anda. Setiap kod hanya boleh digunakan sekali.',
      successSubtitle:
        'Anda boleh menggunakan salah satu daripadanya untuk mendaftar masuk ke akaun anda, jika anda kehilangan akses ke peranti pengesahan anda.',
      title: 'Tambah pengesahan kod sandaran',
      title__codelist: 'Kod sandaran',
    },
    billingPage: {
      paymentHistorySection: {
        empty: 'Tiada sejarah pembayaran',
        notFound: 'Percubaan pembayaran tidak ditemui',
        tableHeader__amount: 'Jumlah',
        tableHeader__date: 'Tarikh',
        tableHeader__status: 'Status',
      },
      paymentMethodsSection: {
        actionLabel__default: 'Jadikan lalai',
        actionLabel__remove: 'Keluarkan',
        add: 'Tambah sumber pembayaran baharu',
        addSubtitle: 'Tambah sumber pembayaran baharu ke akaun anda.',
        cancelButton: 'Batal',
        formButtonPrimary__add: 'Tambah Kaedah Pembayaran',
        formButtonPrimary__pay: 'Bayar {{amount}}',
        payWithTestCardButton: 'Bayar dengan kad ujian',
        removeMethod: {
          messageLine1: '{{identifier}} akan dikeluarkan dari akaun ini.',
          messageLine2:
            'Anda tidak akan dapat menggunakan sumber pembayaran ini lagi dan langganan berulang yang bergantung padanya tidak akan berfungsi lagi.',
          successMessage: '{{paymentMethod}} telah dikeluarkan dari akaun anda.',
          title: 'Keluarkan sumber pembayaran',
        },
        title: 'Pilihan tersedia',
      },
      start: {
        headerTitle__payments: 'Pembayaran',
        headerTitle__plans: 'Pelan',
        headerTitle__statements: 'Invois',
        headerTitle__subscriptions: 'Langganan',
      },
      statementsSection: {
        empty: 'Tiada penyata untuk dipaparkan',
        itemCaption__paidForPlan: 'Dibayar untuk pelan {{plan}} {{period}}',
        itemCaption__payerCredit: undefined,
        itemCaption__proratedCredit: 'Kredit prorata untuk penggunaan separa langganan sebelumnya',
        itemCaption__subscribedAndPaidForPlan: 'Dilanggan dan dibayar untuk pelan {{plan}} {{period}}',
        notFound: 'Penyata tidak ditemui',
        tableHeader__amount: 'Jumlah',
        tableHeader__date: 'Tarikh',
        title: 'Penyata',
        totalPaid: 'Jumlah dibayar',
      },
      subscriptionsListSection: {
        actionLabel__manageSubscription: 'Urus',
        actionLabel__newSubscription: 'Langgan satu pelan',
        actionLabel__switchPlan: 'Tukar pelan',
        overview: undefined,
        tableHeader__edit: 'Sunting',
        tableHeader__plan: 'Pelan',
        tableHeader__startDate: 'Tarikh mula',
        title: 'Langganan',
      },
      subscriptionsSection: {
        actionLabel__default: 'Urus',
      },
      switchPlansSection: {
        title: 'Tukar pelan',
      },
      title: 'Pengebilan',
    },
    connectedAccountPage: {
      formHint: 'Pilih pembekal untuk menghubungkan akaun anda.',
      formHint__noAccounts: 'Tiada pembekal akaun luaran yang tersedia.',
      removeResource: {
        messageLine1: '{{identifier}} akan dikeluarkan dari akaun ini.',
        messageLine2:
          'Anda tidak akan dapat menggunakan akaun yang dihubungkan ini lagi dan ciri-ciri yang bergantung padanya tidak akan berfungsi lagi.',
        successMessage: '{{connectedAccount}} telah dikeluarkan dari akaun anda.',
        title: 'Keluarkan akaun yang dihubungkan',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'Pembekal telah ditambah ke akaun anda',
      title: 'Tambah akaun yang dihubungkan',
    },
    deletePage: {
      actionDescription: 'Taip "Delete account" di bawah untuk meneruskan.',
      confirm: 'Padam akaun',
      messageLine1:
        'Adakah anda pasti mahu memadamkan akaun anda? Sesetengah data yang berkaitan mungkin disimpan. Untuk meminta pemadaman data sepenuhnya, sila hubungi sokongan.',
      messageLine2: 'Tindakan ini adalah kekal dan tidak boleh dibatalkan.',
      title: 'Padam akaun',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'E-mel yang mengandungi kod pengesahan akan dihantar ke alamat e-mel ini.',
        formSubtitle: 'Masukkan kod pengesahan yang dihantar ke {{identifier}}',
        formTitle: 'Kod pengesahan',
        resendButton: 'Tidak menerima kod? Hantar semula',
        successMessage: 'E-mel {{identifier}} telah ditambah ke akaun anda.',
      },
      emailLink: {
        formHint: 'E-mel yang mengandungi pautan pengesahan akan dihantar ke alamat e-mel ini.',
        formSubtitle: 'Klik pada pautan pengesahan dalam e-mel yang dihantar ke {{identifier}}',
        formTitle: 'Pautan pengesahan',
        resendButton: 'Tidak menerima pautan? Hantar semula',
        successMessage: 'E-mel {{identifier}} telah ditambah ke akaun anda.',
      },
      enterpriseSSOLink: {
        formButton: 'Klik untuk mendaftar masuk',
        formSubtitle: 'Selesaikan pendaftaran masuk dengan {{identifier}}',
      },
      formHint: 'Anda perlu mengesahkan alamat e-mel ini sebelum ia boleh ditambah ke akaun anda.',
      removeResource: {
        messageLine1: '{{identifier}} akan dikeluarkan dari akaun ini.',
        messageLine2: 'Anda tidak akan dapat mendaftar masuk menggunakan alamat e-mel ini lagi.',
        successMessage: '{{emailAddress}} telah dikeluarkan dari akaun anda.',
        title: 'Keluarkan alamat e-mel',
      },
      title: 'Tambah alamat e-mel',
      verifyTitle: 'Sahkan alamat e-mel',
    },
    formButtonPrimary__add: 'Tambah',
    formButtonPrimary__continue: 'Teruskan',
    formButtonPrimary__finish: 'Selesai',
    formButtonPrimary__remove: 'Keluarkan',
    formButtonPrimary__save: 'Simpan',
    formButtonReset: 'Batal',
    mfaPage: {
      formHint: 'Pilih kaedah untuk ditambah.',
      title: 'Tambah pengesahan dua langkah',
    },
    mfaPhoneCodePage: {
      backButton: 'Gunakan nombor sedia ada',
      primaryButton__addPhoneNumber: 'Tambah nombor telefon',
      removeResource: {
        messageLine1: '{{identifier}} tidak akan menerima kod pengesahan lagi semasa mendaftar masuk.',
        messageLine2: 'Akaun anda mungkin tidak selamat. Adakah anda pasti mahu meneruskan?',
        successMessage: 'Pengesahan dua langkah kod SMS telah dikeluarkan untuk {{mfaPhoneCode}}',
        title: 'Keluarkan pengesahan dua langkah',
      },
      subtitle__availablePhoneNumbers:
        'Pilih nombor telefon sedia ada untuk mendaftar untuk pengesahan dua langkah kod SMS atau tambah yang baharu.',
      subtitle__unavailablePhoneNumbers:
        'Tiada nombor telefon yang tersedia untuk mendaftar untuk pengesahan dua langkah kod SMS, sila tambah yang baharu.',
      successMessage1:
        'Semasa mendaftar masuk, anda perlu memasukkan kod pengesahan yang dihantar ke nombor telefon ini sebagai langkah tambahan.',
      successMessage2:
        'Simpan kod sandaran ini dan simpan di tempat yang selamat. Jika anda kehilangan akses ke peranti pengesahan anda, anda boleh menggunakan kod sandaran untuk mendaftar masuk.',
      successTitle: 'Pengesahan kod SMS diaktifkan',
      title: 'Tambah pengesahan kod SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Imbas kod QR sebaliknya',
        buttonUnableToScan__nonPrimary: 'Tidak dapat mengimbas kod QR?',
        infoText__ableToScan:
          'Sediakan kaedah pendaftaran masuk baharu dalam aplikasi pengesah anda dan imbas kod QR berikut untuk menghubungkannya ke akaun anda.',
        infoText__unableToScan:
          'Sediakan kaedah pendaftaran masuk baharu dalam pengesah anda dan masukkan Kunci yang diberikan di bawah.',
        inputLabel__unableToScan1:
          'Pastikan Kata laluan Berasaskan Masa atau Sekali diaktifkan, kemudian selesaikan menghubungkan akaun anda.',
        inputLabel__unableToScan2:
          'Secara alternatif, jika pengesah anda menyokong URI TOTP, anda juga boleh menyalin URI penuh.',
      },
      removeResource: {
        messageLine1: 'Kod pengesahan dari pengesah ini tidak lagi diperlukan semasa mendaftar masuk.',
        messageLine2: 'Akaun anda mungkin tidak selamat. Adakah anda pasti mahu meneruskan?',
        successMessage: 'Pengesahan dua langkah melalui aplikasi pengesah telah dikeluarkan.',
        title: 'Keluarkan pengesahan dua langkah',
      },
      successMessage:
        'Pengesahan dua langkah kini diaktifkan. Semasa mendaftar masuk, anda perlu memasukkan kod pengesahan dari pengesah ini sebagai langkah tambahan.',
      title: 'Tambah aplikasi pengesah',
      verifySubtitle: 'Masukkan kod pengesahan yang dijana oleh pengesah anda',
      verifyTitle: 'Kod pengesahan',
    },
    mobileButton__menu: 'Menu',
    navbar: {
      account: 'Profil',
      apiKeys: 'Kunci API',
      billing: 'Pengebilan',
      description: 'Urus maklumat akaun anda.',
      security: 'Keselamatan',
      title: 'Akaun',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} akan dikeluarkan dari akaun ini.',
        title: 'Keluarkan kunci pas',
      },
      subtitle__rename: 'Anda boleh mengubah nama kunci pas untuk memudahkan carian.',
      title__rename: 'Namakan Semula Kunci Pas',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Adalah disyorkan untuk mendaftar keluar dari semua peranti lain yang mungkin telah menggunakan kata laluan lama anda.',
      readonly:
        'Kata laluan anda pada masa ini tidak boleh disunting kerana anda hanya boleh mendaftar masuk melalui sambungan perusahaan.',
      successMessage__set: 'Kata laluan anda telah ditetapkan.',
      successMessage__signOutOfOtherSessions: 'Semua peranti lain telah didaftarkan keluar.',
      successMessage__update: 'Kata laluan anda telah dikemas kini.',
      title__set: 'Tetapkan kata laluan',
      title__update: 'Kemas kini kata laluan',
    },
    phoneNumberPage: {
      infoText:
        'Mesej teks yang mengandungi kod pengesahan akan dihantar ke nombor telefon ini. Kadar mesej dan data mungkin dikenakan.',
      removeResource: {
        messageLine1: '{{identifier}} akan dikeluarkan dari akaun ini.',
        messageLine2: 'Anda tidak akan dapat mendaftar masuk menggunakan nombor telefon ini lagi.',
        successMessage: '{{phoneNumber}} telah dikeluarkan dari akaun anda.',
        title: 'Keluarkan nombor telefon',
      },
      successMessage: '{{identifier}} telah ditambah ke akaun anda.',
      title: 'Tambah nombor telefon',
      verifySubtitle: 'Masukkan kod pengesahan yang dihantar ke {{identifier}}',
      verifyTitle: 'Sahkan nombor telefon',
    },
    plansPage: {
      title: 'Pelan',
    },
    profilePage: {
      fileDropAreaHint: 'Saiz yang disyorkan 1:1, sehingga 10MB.',
      imageFormDestructiveActionSubtitle: 'Keluarkan',
      imageFormSubtitle: 'Muat naik',
      imageFormTitle: 'Imej profil',
      readonly: 'Maklumat profil anda telah disediakan oleh sambungan perusahaan dan tidak boleh disunting.',
      successMessage: 'Profil anda telah dikemas kini.',
      title: 'Kemas kini profil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Daftar keluar dari peranti',
        title: 'Peranti aktif',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Sambung semula',
        actionLabel__reauthorize: 'Benarkan sekarang',
        destructiveActionTitle: 'Keluarkan',
        primaryButton: 'Sambung akaun',
        subtitle__disconnected: 'Akaun ini telah diputuskan sambungan.',
        subtitle__reauthorize:
          'Skop yang diperlukan telah dikemas kini, dan anda mungkin mengalami fungsi terhad. Sila benarkan semula aplikasi ini untuk mengelakkan sebarang masalah',
        title: 'Akaun yang disambungkan',
      },
      dangerSection: {
        deleteAccountButton: 'Padam akaun',
        title: 'Padam akaun',
      },
      emailAddressesSection: {
        destructiveAction: 'Keluarkan e-mel',
        detailsAction__nonPrimary: 'Tetapkan sebagai utama',
        detailsAction__primary: 'Selesaikan pengesahan',
        detailsAction__unverified: 'Sahkan',
        primaryButton: 'Tambah alamat e-mel',
        title: 'Alamat e-mel',
      },
      enterpriseAccountsSection: {
        primaryButton: 'Sambung akaun',
        title: 'Akaun perusahaan',
      },
      headerTitle__account: 'Butiran profil',
      headerTitle__security: 'Keselamatan',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Jana semula',
          headerTitle: 'Kod sandaran',
          subtitle__regenerate:
            'Dapatkan set kod sandaran yang baharu dan selamat. Kod sandaran sebelumnya akan dipadamkan dan tidak boleh digunakan.',
          title__regenerate: 'Jana semula kod sandaran',
        },
        phoneCode: {
          actionLabel__setDefault: 'Tetapkan sebagai lalai',
          destructiveActionLabel: 'Keluarkan',
        },
        primaryButton: 'Tambah pengesahan dua langkah',
        title: 'Pengesahan dua langkah',
        totp: {
          destructiveActionTitle: 'Keluarkan',
          headerTitle: 'Aplikasi pengesah',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Keluarkan',
        menuAction__rename: 'Namakan semula',
        primaryButton: 'Tambah kunci pas',
        title: 'Kunci pas',
      },
      passwordSection: {
        primaryButton__setPassword: 'Tetapkan kata laluan',
        primaryButton__updatePassword: 'Kemas kini kata laluan',
        title: 'Kata laluan',
      },
      phoneNumbersSection: {
        destructiveAction: 'Keluarkan nombor telefon',
        detailsAction__nonPrimary: 'Tetapkan sebagai utama',
        detailsAction__primary: 'Selesaikan pengesahan',
        detailsAction__unverified: 'Sahkan nombor telefon',
        primaryButton: 'Tambah nombor telefon',
        title: 'Nombor telefon',
      },
      profileSection: {
        primaryButton: 'Kemas kini profil',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Tetapkan nama pengguna',
        primaryButton__updateUsername: 'Kemas kini nama pengguna',
        title: 'Nama pengguna',
      },
      web3WalletsSection: {
        destructiveAction: 'Keluarkan dompet',
        detailsAction__nonPrimary: 'Tetapkan sebagai utama',
        primaryButton: 'Sambung dompet',
        title: 'Dompet web3',
        web3SelectSolanaWalletScreen: {
          subtitle: 'Pilih dompet Solana untuk disambungkan ke akaun anda.',
          title: 'Tambah dompet Solana',
        },
      },
    },
    usernamePage: {
      successMessage: 'Nama pengguna anda telah dikemas kini.',
      title__set: 'Tetapkan nama pengguna',
      title__update: 'Kemas kini nama pengguna',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} akan dikeluarkan dari akaun ini.',
        messageLine2: 'Anda tidak akan dapat mendaftar masuk menggunakan dompet web3 ini lagi.',
        successMessage: '{{web3Wallet}} telah dikeluarkan dari akaun anda.',
        title: 'Keluarkan dompet web3',
      },
      subtitle__availableWallets: 'Pilih dompet web3 untuk disambungkan ke akaun anda.',
      subtitle__unavailableWallets: 'Tiada dompet web3 yang tersedia.',
      successMessage: 'Dompet telah ditambah ke akaun anda.',
      title: 'Tambah dompet web3',
      web3WalletButtonsBlockButton: '{{provider|titleize}}',
    },
  },
  waitlist: {
    start: {
      actionLink: 'Daftar masuk',
      actionText: 'Sudah mempunyai akses?',
      formButton: 'Sertai senarai menunggu',
      subtitle: 'Masukkan alamat e-mel anda dan kami akan memberitahu anda apabila tempat anda sudah bersedia',
      title: 'Sertai senarai menunggu',
    },
    success: {
      message: 'Anda akan dialihkan tidak lama lagi...',
      subtitle: 'Kami akan menghubungi anda apabila tempat anda sudah bersedia',
      title: 'Terima kasih kerana menyertai senarai menunggu!',
    },
  },
  web3SolanaWalletButtons: {
    connect: 'Sambung dengan {{walletName}}',
    continue: 'Teruskan dengan {{walletName}}',
    noneAvailable:
      'Tiada dompet Solana Web3 dikesan. Sila pasang {{ solanaWalletsLink || link("wallet extension") }} yang menyokong Web3.',
  },
} as const;
