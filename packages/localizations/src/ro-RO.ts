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

export const roRO: LocalizationResource = {
  locale: 'ro-RO',
  apiKeys: {
    action__add: 'Adaugă cheie nouă',
    action__search: 'Caută chei',
    createdAndExpirationStatus__expiresOn:
      "Creată {{ createdDate | shortDate('ro-RO') }} • Expiră {{ expiresDate | longDate('ro-RO') }}",
    createdAndExpirationStatus__never:
      "Creată {{ createdDate | shortDate('ro-RO') }} • Nu expiră niciodată",
    detailsTitle__emptyRow: 'Nu au fost găsite chei API',
    formButtonPrimary__add: 'Creează cheie',
    formFieldCaption__expiration__expiresOn: 'Expiră la {{ date }}',
    formFieldCaption__expiration__never: 'Această cheie nu va expira',
    formFieldOption__expiration__180d: '180 de zile',
    formFieldOption__expiration__1d: '1 zi',
    formFieldOption__expiration__1y: '1 an',
    formFieldOption__expiration__30d: '30 de zile',
    formFieldOption__expiration__60d: '60 de zile',
    formFieldOption__expiration__7d: '7 zile',
    formFieldOption__expiration__90d: '90 de zile',
    formFieldOption__expiration__never: 'Niciodată',
    formHint:
      'Furnizează un nume pentru a genera o cheie nouă. O vei putea revoca oricând.',
    formTitle: 'Adaugă cheie API nouă',
    lastUsed__days: 'acum {{days}}z',
    lastUsed__hours: 'acum {{hours}}h',
    lastUsed__minutes: 'acum {{minutes}}m',
    lastUsed__months: 'acum {{months}}l',
    lastUsed__seconds: 'acum {{seconds}}s',
    lastUsed__years: 'acum {{years}}a',
    menuAction__revoke: 'Revocă cheia',
    revokeConfirmation: {
      confirmationText: 'Revocă',
      formButtonPrimary__revoke: 'Revocă cheia',
      formHint: 'Sigur vrei să ștergi această cheie Secret?',
      formTitle: 'Revoci cheia secretă „{{apiKeyName}}”?',
    },
  },
  backButton: 'Înapoi',
  badge__activePlan: 'Activ',
  badge__canceledEndsAt: "Anulat • Se încheie {{ date | shortDate('ro-RO') }}",
  badge__currentPlan: 'Plan curent',
  badge__default: 'Implicit',
  badge__endsAt: "Se încheie {{ date | shortDate('ro-RO') }}",
  badge__expired: 'Expirat',
  badge__freeTrial: 'Probă gratuită',
  badge__otherImpersonatorDevice: 'Alt dispozitiv de impersonare',
  badge__pastDueAt: "Restanță din {{ date | shortDate('ro-RO') }}",
  badge__pastDuePlan: 'Restanță',
  badge__primary: 'Principal',
  badge__renewsAt: "Reînnoire {{ date | shortDate('ro-RO') }}",
  badge__requiresAction: 'Necesită acțiune',
  badge__startsAt: "Începe {{ date | shortDate('ro-RO') }}",
  badge__thisDevice: 'Acest dispozitiv',
  badge__trialEndsAt: "Perioada de probă se încheie {{ date | shortDate('ro-RO') }}",
  badge__unverified: 'Neverificat',
  badge__upcomingPlan: 'Urmează',
  badge__userDevice: 'Dispozitiv utilizator',
  badge__you: 'Tu',
  commerce: {
    addPaymentMethod: 'Adaugă metodă de plată',
    alwaysFree: 'Întotdeauna gratuit',
    annually: 'Anual',
    availableFeatures: 'Funcții disponibile',
    billedAnnually: 'Facturat anual',
    billedMonthlyOnly: 'Doar facturare lunară',
    cancelFreeTrial: 'Anulează perioada de probă',
    cancelFreeTrialAccessUntil:
      "Perioada de probă rămâne activă până la {{ date | longDate('ro-RO') }}. După aceea, vei pierde accesul la funcțiile de probă. Nu vei fi taxat.",
    cancelFreeTrialTitle: 'Anulezi perioada de probă pentru planul {{plan}}?',
    cancelSubscription: 'Anulează abonamentul',
    cancelSubscriptionAccessUntil:
      "Poți folosi în continuare funcțiile „{{plan}}” până la {{ date | longDate('ro-RO') }}, după care nu vei mai avea acces.",
    cancelSubscriptionNoCharge: 'Nu vei fi taxat pentru acest abonament.',
    cancelSubscriptionTitle: 'Anulezi abonamentul {{plan}}?',
    cannotSubscribeMonthly:
      'Nu te poți abona la acest plan cu plată lunară. Pentru acest plan este necesară plata anuală.',
    cannotSubscribeUnrecoverable:
      'Nu te poți abona la acest plan. Abonamentul tău actual este mai scump decât acest plan.',
    checkout: {
      description__paymentSuccessful: 'Plata ta a fost efectuată cu succes.',
      description__subscriptionSuccessful: 'Noul tău abonament este configurat.',
      downgradeNotice:
        'Vei păstra abonamentul curent și funcțiile sale până la finalul ciclului de facturare, apoi vei fi schimbat la acest abonament.',
      emailForm: {
        subtitle:
          'Înainte de a finaliza achiziția, adaugă o adresă de email unde vor fi trimise chitanțele.',
        title: 'Adaugă o adresă de email',
      },
      lineItems: {
        title__freeTrialEndsAt: 'Perioada de probă se încheie pe',
        title__paymentMethod: 'Metodă de plată',
        title__statementId: 'ID extras',
        title__subscriptionBegins: 'Abonamentul începe',
        title__totalPaid: 'Total plătit',
      },
      pastDueNotice: 'Abonamentul anterior era restant, fără plată.',
      perMonth: 'pe lună',
      title: 'Plată',
      title__paymentSuccessful: 'Plata a reușit!',
      title__subscriptionSuccessful: 'Succes!',
      title__trialSuccess: 'Perioada de probă a început!',
      totalDueAfterTrial: 'Total de plată după ce perioada de probă se încheie în {{days}} zile',
    },
    credit: 'Credit',
    creditRemainder: 'Credit pentru restul abonamentului curent.',
    defaultFreePlanActive: 'În prezent ești pe planul Gratuit',
    free: 'Gratuit',
    getStarted: 'Începe',
    keepFreeTrial: 'Păstrează perioada de probă',
    keepSubscription: 'Păstrează abonamentul',
    manage: 'Gestionează',
    manageSubscription: 'Gestionează abonamentul',
    month: 'Lună',
    monthly: 'Lunar',
    pastDue: 'Restanță',
    pay: 'Plătește {{amount}}',
    paymentMethods: 'Metode de plată',
    paymentSource: {
      applePayDescription: {
        annual: 'Plată anuală',
        monthly: 'Plată lunară',
      },
      dev: {
        anyNumbers: 'Orice numere',
        cardNumber: 'Număr card',
        cvcZip: 'CVC, cod poștal',
        developmentMode: 'Mod de dezvoltare',
        expirationDate: 'Data expirării',
        testCardInfo: 'Informații card de test',
      },
    },
    popular: 'Popular',
    pricingTable: {
      billingCycle: 'Ciclu de facturare',
      included: 'Inclus',
    },
    reSubscribe: 'Re-abonează-te',
    seeAllFeatures: 'Vezi toate funcțiile',
    startFreeTrial: 'Începe perioada de probă',
    startFreeTrial__days: 'Începe perioada de probă de {{days}} zile',
    subscribe: 'Abonează-te',
    subscriptionDetails: {
      beginsOn: 'Începe pe',
      currentBillingCycle: 'Ciclu de facturare curent',
      endsOn: 'Se încheie pe',
      firstPaymentAmount: 'Prima plată',
      firstPaymentOn: 'Prima plată pe',
      nextPaymentAmount: 'Următoarea plată',
      nextPaymentOn: 'Următoarea plată pe',
      pastDueAt: 'Restanță pe',
      renewsAt: 'Se reînnoiește la',
      subscribedOn: 'Abonat pe',
      title: 'Abonament',
      trialEndsOn: 'Perioada de probă se încheie pe',
      trialStartedOn: 'Perioada de probă a început pe',
    },
    subtotal: 'Subtotal',
    switchPlan: 'Schimbă pe acest plan',
    switchToAnnual: 'Treci la anual',
    switchToAnnualWithAnnualPrice: 'Treci la anual {{currency}}{{price}} / an',
    switchToMonthly: 'Treci la lunar',
    switchToMonthlyWithPrice: 'Treci la lunar {{currency}}{{price}} / lună',
    totalDue: 'Total de plată',
    totalDueToday: 'Total de plată astăzi',
    viewFeatures: 'Vezi funcțiile',
    viewPayment: 'Vezi plata',
    year: 'An',
  },
  createOrganization: {
    formButtonSubmit: 'Creează organizație',
    invitePage: {
      formButtonReset: 'Omite',
    },
    title: 'Creează organizație',
  },
  dates: {
    lastDay: "Ieri la {{ date | timeString('ro-RO') }}",
    next6Days: "{{ date | weekday('ro-RO','long') }} la {{ date | timeString('ro-RO') }}",
    nextDay: "Mâine la {{ date | timeString('ro-RO') }}",
    numeric: "{{ date | numeric('ro-RO') }}",
    previous6Days: "{{ date | weekday('ro-RO','long') }} trecut la {{ date | timeString('ro-RO') }}",
    sameDay: "Astăzi la {{ date | timeString('ro-RO') }}",
  },
  dividerText: 'sau',
  footerActionLink__alternativePhoneCodeProvider: 'Trimite codul prin SMS în schimb',
  footerActionLink__useAnotherMethod: 'Folosește altă metodă',
  footerPageLink__help: 'Ajutor',
  footerPageLink__privacy: 'Confidențialitate',
  footerPageLink__terms: 'Termeni',
  formButtonPrimary: 'Continuă',
  formButtonPrimary__verify: 'Verifică',
  formFieldAction__forgotPassword: 'Ai uitat parola?',
  formFieldError__matchingPasswords: 'Parolele coincid.',
  formFieldError__notMatchingPasswords: 'Parolele nu coincid.',
  formFieldError__verificationLinkExpired: 'Linkul de verificare a expirat. Te rugăm să soliciți unul nou.',
  formFieldHintText__optional: 'Opțional',
  formFieldHintText__slug:
    'Un „slug” este un ID ușor de citit care trebuie să fie unic. Este folosit adesea în URL-uri.',
  formFieldInputPlaceholder__apiKeyDescription: 'Explică de ce generezi această cheie',
  formFieldInputPlaceholder__apiKeyExpirationDate: 'Selectează data',
  formFieldInputPlaceholder__apiKeyName: 'Introdu numele cheii secrete',
  formFieldInputPlaceholder__backupCode: 'Introdu codul de rezervă',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Șterge contul',
  formFieldInputPlaceholder__emailAddress: 'Introdu adresa de email',
  formFieldInputPlaceholder__emailAddress_username: 'Introdu email sau nume de utilizator',
  formFieldInputPlaceholder__emailAddresses: 'exemplu@email.com, exemplu2@email.com',
  formFieldInputPlaceholder__firstName: 'Prenume',
  formFieldInputPlaceholder__lastName: 'Nume',
  formFieldInputPlaceholder__organizationDomain: 'exemplu.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'tu@exemplu.com',
  formFieldInputPlaceholder__organizationName: 'Numele organizației',
  formFieldInputPlaceholder__organizationSlug: 'org-mea',
  formFieldInputPlaceholder__password: 'Introdu parola',
  formFieldInputPlaceholder__phoneNumber: 'Introdu numărul de telefon',
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__apiKeyDescription: 'Descriere',
  formFieldLabel__apiKeyExpiration: 'Expirare',
  formFieldLabel__apiKeyName: 'Numele cheii secrete',
  formFieldLabel__automaticInvitations: 'Activează invitații automate pentru acest domeniu',
  formFieldLabel__backupCode: 'Cod de rezervă',
  formFieldLabel__confirmDeletion: 'Confirmare',
  formFieldLabel__confirmPassword: 'Confirmă parola',
  formFieldLabel__currentPassword: 'Parola actuală',
  formFieldLabel__emailAddress: 'Adresă de email',
  formFieldLabel__emailAddress_username: 'Adresă de email sau nume de utilizator',
  formFieldLabel__emailAddresses: 'Adrese de email',
  formFieldLabel__firstName: 'Prenume',
  formFieldLabel__lastName: 'Nume',
  formFieldLabel__newPassword: 'Parolă nouă',
  formFieldLabel__organizationDomain: 'Domeniu',
  formFieldLabel__organizationDomainDeletePending: 'Șterge invitațiile și sugestiile în așteptare',
  formFieldLabel__organizationDomainEmailAddress: 'Adresă email de verificare',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Introdu o adresă de email sub acest domeniu pentru a primi un cod și a verifica domeniul.',
  formFieldLabel__organizationName: 'Nume',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Numele cheii de acces',
  formFieldLabel__password: 'Parolă',
  formFieldLabel__phoneNumber: 'Număr de telefon',
  formFieldLabel__role: 'Rol',
  formFieldLabel__signOutOfOtherSessions: 'Deconectează celelalte dispozitive',
  formFieldLabel__username: 'Nume de utilizator',
  impersonationFab: {
    action__signOut: 'Deconectează-te',
    title: 'Autentificat ca {{identifier}}',
  },
  maintenanceMode:
    'Efectuăm lucrări de mentenanță, dar nu va dura mai mult de câteva minute.',
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Membru',
  membershipRole__guestMember: 'Invitat',
  organizationList: {
    action__createOrganization: 'Creează organizație',
    action__invitationAccept: 'Alătură-te',
    action__suggestionsAccept: 'Solicită alăturarea',
    createOrganization: 'Creează organizație',
    invitationAcceptedLabel: 'Te-ai alăturat',
    subtitle: 'pentru a continua la {{applicationName}}',
    suggestionsAcceptedLabel: 'În așteptare',
    title: 'Alege un cont',
    titleWithoutPersonal: 'Alege o organizație',
  },
  organizationProfile: {
    apiKeysPage: { title: 'Chei API' },
    badge__automaticInvitation: 'Invitații automate',
    badge__automaticSuggestion: 'Sugestii automate',
    badge__manualInvitation: 'Fără înscriere automată',
    badge__unverified: 'Neverificat',
    billingPage: {
      paymentHistorySection: {
        empty: 'Nu există istoric de plăți',
        notFound: 'Plata nu a fost găsită',
        tableHeader__amount: 'Sumă',
        tableHeader__date: 'Dată',
        tableHeader__status: 'Stare',
      },
      paymentSourcesSection: {
        actionLabel__default: 'Setează ca implicită',
        actionLabel__remove: 'Elimină',
        add: 'Adaugă metodă de plată nouă',
        addSubtitle: 'Adaugă o nouă metodă de plată la cont.',
        cancelButton: 'Anulează',
        formButtonPrimary__add: 'Adaugă metoda de plată',
        formButtonPrimary__pay: 'Plătește {{amount}}',
        payWithTestCardButton: 'Plătește cu card de test',
        removeResource: {
          messageLine1: '{{identifier}} va fi eliminat(ă) din acest cont.',
          messageLine2:
            'Nu vei mai putea folosi această metodă de plată, iar abonamentele recurente dependente de ea nu vor mai funcționa.',
          successMessage: '{{paymentSource}} a fost eliminată din contul tău.',
          title: 'Elimină metoda de plată',
        },
        title: 'Metode de plată',
      },
      start: {
        headerTitle__payments: 'Plăți',
        headerTitle__plans: 'Planuri',
        headerTitle__statements: 'Extrase',
        headerTitle__subscriptions: 'Abonament',
      },
      statementsSection: {
        empty: 'Nu există extrase de afișat',
        itemCaption__paidForPlan: 'Plătit pentru planul {{plan}} ({{period}})',
        itemCaption__proratedCredit: 'Credit proporțional pentru utilizarea parțială a abonamentului anterior',
        itemCaption__subscribedAndPaidForPlan: 'Abonat și plătit pentru planul {{plan}} ({{period}})',
        notFound: 'Extrasul nu a fost găsit',
        tableHeader__amount: 'Sumă',
        tableHeader__date: 'Dată',
        title: 'Extrase',
        totalPaid: 'Total plătit',
      },
      subscriptionsListSection: {
        actionLabel__newSubscription: 'Abonează-te la un plan',
        actionLabel__switchPlan: 'Schimbă planurile',
        tableHeader__edit: 'Editează',
        tableHeader__plan: 'Plan',
        tableHeader__startDate: 'Data începerii',
        title: 'Abonament',
      },
      subscriptionsSection: { actionLabel__default: 'Gestionează' },
      switchPlansSection: { title: 'Schimbă planurile' },
      title: 'Facturare',
    },
    createDomainPage: {
      subtitle:
        'Adaugă domeniul pentru verificare. Utilizatorii cu adrese de email pe acest domeniu se pot alătura automat sau pot solicita alăturarea.',
      title: 'Adaugă domeniu',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Invitațiile nu au putut fi trimise. Există deja invitații în așteptare pentru următoarele adrese: {{email_addresses}}.',
      formButtonPrimary__continue: 'Trimite invitațiile',
      selectDropdown__role: 'Selectează rolul',
      subtitle:
        'Introdu sau lipește una sau mai multe adrese de email, separate prin spații sau virgule.',
      successMessage: 'Invitațiile au fost trimise cu succes',
      title: 'Invită membri noi',
    },
    membersPage: {
      action__invite: 'Invită',
      action__search: 'Caută',
      activeMembersTab: {
        menuAction__remove: 'Elimină membrul',
        tableHeader__actions: 'Acțiuni',
        tableHeader__joined: 'Alăturat',
        tableHeader__role: 'Rol',
        tableHeader__user: 'Utilizator',
      },
      detailsTitle__emptyRow: 'Nu sunt membri de afișat',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invită utilizatori conectând un domeniu de email la organizație. Oricine se înscrie cu un email ce se potrivește va putea intra oricând.',
          headerTitle: 'Invitații automate',
          primaryButton: 'Gestionează domeniile verificate',
        },
        table__emptyRow: 'Nu sunt invitații de afișat',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Revocă invitația',
        tableHeader__invited: 'Invitat',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Utilizatorii care se înscriu cu un email ce se potrivește pot primi sugestia de a cere acces.',
          headerTitle: 'Sugestii automate',
          primaryButton: 'Gestionează domeniile verificate',
        },
        menuAction__approve: 'Aprobă',
        menuAction__reject: 'Respinge',
        tableHeader__requested: 'Acces solicitat',
        table__emptyRow: 'Nu sunt cereri de afișat',
      },
      start: {
        headerTitle__invitations: 'Invitații',
        headerTitle__members: 'Membri',
        headerTitle__requests: 'Ceri de acces',
      },
    },
    navbar: {
      apiKeys: 'Chei API',
      billing: 'Facturare',
      description: 'Gestionează organizația.',
      general: 'General',
      members: 'Membri',
      title: 'Organizație',
    },
    plansPage: {
      alerts: {
        noPermissionsToManageBilling:
          'Nu ai permisiuni pentru a gestiona facturarea acestei organizații.',
      },
      title: 'Planuri',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Tastează „{{organizationName}}” mai jos pentru a continua.',
          messageLine1: 'Sigur vrei să ștergi această organizație?',
          messageLine2: 'Această acțiune este permanentă și ireversibilă.',
          successMessage: 'Ai șters organizația.',
          title: 'Șterge organizația',
        },
        leaveOrganization: {
          actionDescription: 'Tastează „{{organizationName}}” mai jos pentru a continua.',
          messageLine1:
            'Sigur vrei să părăsești această organizație? Vei pierde accesul la organizație și aplicațiile ei.',
          messageLine2: 'Această acțiune este permanentă și ireversibilă.',
          successMessage: 'Ai părăsit organizația.',
          title: 'Părăsește organizația',
        },
        title: 'Pericol',
      },
      domainSection: {
        menuAction__manage: 'Gestionează',
        menuAction__remove: 'Șterge',
        menuAction__verify: 'Verifică',
        primaryButton: 'Adaugă domeniu',
        subtitle:
          'Permite utilizatorilor să se alăture automat sau să solicite alăturarea pe baza unui domeniu de email verificat.',
        title: 'Domenii verificate',
      },
      successMessage: 'Organizația a fost actualizată.',
      title: 'Actualizează profilul',
    },
    removeDomainPage: {
      messageLine1: 'Domeniul de email {{domain}} va fi eliminat.',
      messageLine2:
        'Utilizatorii nu se vor mai putea alătura automat organizației după aceasta.',
      successMessage: '{{domain}} a fost eliminat.',
      title: 'Elimină domeniul',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Membri',
      profileSection: {
        primaryButton: 'Actualizează profilul',
        title: 'Profilul organizației',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Eliminarea acestui domeniu va afecta utilizatorii invitați.',
        removeDomainActionLabel__remove: 'Elimină domeniul',
        removeDomainSubtitle: 'Elimină acest domeniu din domeniile verificate',
        removeDomainTitle: 'Elimină domeniul',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Utilizatorii sunt invitați automat să se alăture și pot intra oricând.',
        automaticInvitationOption__label: 'Invitații automate',
        automaticSuggestionOption__description:
          'Utilizatorii primesc o sugestie de a solicita alăturarea, dar trebuie aprobați de un administrator.',
        automaticSuggestionOption__label: 'Sugestii automate',
        calloutInfoLabel:
          'Schimbarea modului de înscriere va afecta doar utilizatorii noi.',
        calloutInvitationCountLabel:
          'Invitații în așteptare trimise utilizatorilor: {{count}}',
        calloutSuggestionCountLabel:
          'Sugestii în așteptare trimise utilizatorilor: {{count}}',
        manualInvitationOption__description:
          'Utilizatorii pot fi invitați doar manual în organizație.',
        manualInvitationOption__label: 'Fără înscriere automată',
        subtitle:
          'Alege cum pot utilizatorii din acest domeniu să se alăture organizației.',
      },
      start: {
        headerTitle__danger: 'Pericol',
        headerTitle__enrollment: 'Opțiuni de înscriere',
      },
      subtitle:
        'Domeniul {{domain}} a fost verificat. Continuă selectând modul de înscriere.',
      title: 'Actualizează {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Introdu codul de verificare trimis la adresa ta de email',
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'Domeniul {{domainName}} trebuie verificat prin email.',
      subtitleVerificationCodeScreen:
        'Un cod de verificare a fost trimis la {{emailAddress}}. Introdu codul pentru a continua.',
      title: 'Verifică domeniul',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Creează organizație',
    action__invitationAccept: 'Alătură-te',
    action__manageOrganization: 'Gestionează',
    action__suggestionsAccept: 'Solicită alăturarea',
    notSelected: 'Nicio organizație selectată',
    personalWorkspace: 'Cont personal',
    suggestionsAcceptedLabel: 'În așteptare',
  },
  paginationButton__next: 'Înainte',
  paginationButton__previous: 'Înapoi',
  paginationRowText__displaying: 'Afișare',
  paginationRowText__of: 'din',
  reverification: {
    alternativeMethods: {
      actionLink: 'Obține ajutor',
      actionText: 'Nu ai niciuna dintre acestea?',
      blockButton__backupCode: 'Folosește un cod de rezervă',
      blockButton__emailCode: 'Trimite cod pe email către {{identifier}}',
      blockButton__passkey: 'Folosește cheia de acces',
      blockButton__password: 'Continuă cu parola',
      blockButton__phoneCode: 'Trimite cod prin SMS la {{identifier}}',
      blockButton__totp: 'Folosește aplicația de autentificare',
      getHelp: {
        blockButton__emailSupport: 'Trimite email la suport',
        content:
          'Dacă ai probleme la verificare, scrie-ne pe email și te ajutăm să-ți recapeți accesul cât mai repede.',
        title: 'Ajutor',
      },
      subtitle: 'Ai probleme? Poți folosi oricare dintre aceste metode pentru verificare.',
      title: 'Folosește altă metodă',
    },
    backupCodeMfa: {
      subtitle: 'Introdu codul de rezervă primit când ai configurat autentificarea în doi pași',
      title: 'Introdu un cod de rezervă',
    },
    emailCode: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'Introdu codul trimis pe email pentru a continua',
      title: 'Verificare necesară',
    },
    noAvailableMethods: {
      message: 'Nu se poate continua. Nu există un factor de autentificare configurat.',
      subtitle: 'A apărut o eroare',
      title: 'Nu îți putem verifica contul',
    },
    passkey: {
      blockButton__passkey: 'Folosește cheia de acces',
      subtitle:
        'Folosirea cheii de acces confirmă identitatea ta. Dispozitivul îți poate cere amprenta, fața sau codul de ecran.',
      title: 'Folosește cheia de acces',
    },
    password: {
      actionLink: 'Folosește altă metodă',
      subtitle: 'Introdu parola curentă pentru a continua',
      title: 'Verificare necesară',
    },
    phoneCode: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'Introdu codul trimis pe telefon pentru a continua',
      title: 'Verificare necesară',
    },
    phoneCodeMfa: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'Introdu codul trimis pe telefon pentru a continua',
      title: 'Verificare necesară',
    },
    totpMfa: {
      formTitle: 'Cod de verificare',
      subtitle: 'Introdu codul generat de aplicația ta de autentificare pentru a continua',
      title: 'Verificare în doi pași',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Adaugă cont',
      action__signOutAll: 'Deconectează toate conturile',
      subtitle: 'Selectează contul cu care vrei să continui.',
      title: 'Alege un cont',
    },
    alternativeMethods: {
      actionLink: 'Ajutor',
      actionText: 'Nu ai niciuna dintre acestea?',
      blockButton__backupCode: 'Folosește un cod de rezervă',
      blockButton__emailCode: 'Trimite cod pe email către {{identifier}}',
      blockButton__emailLink: 'Trimite link pe email către {{identifier}}',
      blockButton__passkey: 'Autentificare cu cheia de acces',
      blockButton__password: 'Autentificare cu parola',
      blockButton__phoneCode: 'Trimite cod prin SMS la {{identifier}}',
      blockButton__totp: 'Folosește aplicația de autentificare',
      getHelp: {
        blockButton__emailSupport: 'Trimite email la suport',
        content:
          'Dacă ai probleme la autentificare, scrie-ne pe email și te ajutăm să-ți recapeți accesul cât mai repede.',
        title: 'Ajutor',
      },
      subtitle: 'Ai probleme? Poți folosi oricare dintre aceste metode pentru autentificare.',
      title: 'Folosește altă metodă',
    },
    alternativePhoneCodeProvider: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verifică-ți {{provider}}',
    },
    backupCodeMfa: {
      subtitle:
        'Codul de rezervă este cel pe care l-ai primit la configurarea autentificării în doi pași.',
      title: 'Introdu un cod de rezervă',
    },
    emailCode: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verifică-ți emailul',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Pentru a continua, deschide linkul de verificare pe dispozitivul și în browserul de pe care ai început autentificarea',
        title: 'Linkul de verificare nu este valid pe acest dispozitiv',
      },
      expired: {
        subtitle: 'Revino în fila inițială pentru a continua.',
        title: 'Linkul de verificare a expirat',
      },
      failed: {
        subtitle: 'Revino în fila inițială pentru a continua.',
        title: 'Linkul de verificare este invalid',
      },
      formSubtitle: 'Folosește linkul de verificare trimis pe email',
      formTitle: 'Link de verificare',
      loading: {
        subtitle: 'Vei fi redirecționat în curând',
        title: 'Autentificare...',
      },
      resendButton: 'Nu ai primit un link? Retrimite',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verifică-ți emailul',
      unusedTab: { title: 'Poți închide această filă' },
      verified: {
        subtitle: 'Vei fi redirecționat în curând',
        title: 'Autentificat cu succes',
      },
      verifiedSwitchTab: {
        subtitle: 'Revino în fila originală pentru a continua',
        subtitleNewTab: 'Revino în noua filă deschisă pentru a continua',
        titleNewTab: 'Autentificat în altă filă',
      },
    },
    forgotPassword: {
      formTitle: 'Cod pentru resetarea parolei',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'pentru a-ți reseta parola',
      subtitle_email: 'Mai întâi introdu codul trimis la adresa de email',
      subtitle_phone: 'Mai întâi introdu codul trimis pe telefon',
      title: 'Resetează parola',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Resetează parola',
      label__alternativeMethods: 'Sau autentifică-te cu altă metodă',
      title: 'Ai uitat parola?',
    },
    noAvailableMethods: {
      message:
        'Nu se poate continua autentificarea. Nu există niciun factor de autentificare disponibil.',
      subtitle: 'A apărut o eroare',
      title: 'Nu te poți autentifica',
    },
    passkey: {
      subtitle:
        'Folosirea cheii de acces confirmă că ești tu. Dispozitivul îți poate cere amprenta, fața sau blocarea ecranului.',
      title: 'Folosește cheia de acces',
    },
    password: {
      actionLink: 'Folosește altă metodă',
      subtitle: 'Introdu parola asociată contului tău',
      title: 'Introdu parola',
    },
    passwordPwned: { title: 'Parola este compromisă' },
    phoneCode: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verifică-ți telefonul',
    },
    phoneCodeMfa: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle:
        'Pentru a continua, introdu codul de verificare trimis pe telefon',
      title: 'Verifică-ți telefonul',
    },
    resetPassword: {
      formButtonPrimary: 'Resetează parola',
      requiredMessage:
        'Din motive de securitate, este necesar să îți resetezi parola.',
      successMessage:
        'Parola a fost schimbată cu succes. Te autentificăm, te rugăm așteaptă un moment.',
      title: 'Setează parolă nouă',
    },
    resetPasswordMfa: {
      detailsLabel:
        'Trebuie să îți verificăm identitatea înainte de a reseta parola.',
    },
    start: {
      actionLink: 'Înregistrează-te',
      actionLink__join_waitlist: 'Înscrie-te pe lista de așteptare',
      actionLink__use_email: 'Folosește emailul',
      actionLink__use_email_username: 'Folosește email sau nume de utilizator',
      actionLink__use_passkey: 'Folosește cheia de acces',
      actionLink__use_phone: 'Folosește telefonul',
      actionLink__use_username: 'Folosește numele de utilizator',
      actionText: 'Nu ai cont?',
      actionText__join_waitlist: 'Vrei acces timpuriu?',
      alternativePhoneCodeProvider: {
        actionLink: 'Folosește altă metodă',
        label: 'Număr de telefon {{provider}}',
        subtitle:
          'Introdu numărul tău de telefon pentru a primi un cod de verificare pe {{provider}}.',
        title: 'Autentifică-te în {{applicationName}} cu {{provider}}',
      },
      subtitle: 'Bine ai revenit! Te rugăm să te autentifici pentru a continua',
      subtitleCombined: undefined,
      title: 'Autentifică-te în {{applicationName}}',
      titleCombined: 'Continuă către {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Cod de verificare',
      subtitle:
        'Pentru a continua, introdu codul generat de aplicația ta de autentificare',
      title: 'Verificare în doi pași',
    },
  },
  signInEnterPasswordTitle: 'Introdu parola',
  signUp: {
    alternativePhoneCodeProvider: {
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'Introdu codul de verificare trimis pe {{provider}}',
      title: 'Verifică-ți {{provider}}',
    },
    continue: {
      actionLink: 'Autentifică-te',
      actionText: 'Ai deja cont?',
      subtitle: 'Completează câmpurile rămase pentru a continua.',
      title: 'Completează câmpurile lipsă',
    },
    emailCode: {
      formSubtitle: 'Introdu codul de verificare trimis la adresa ta de email',
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'Introdu codul de verificare trimis pe email',
      title: 'Verifică-ți emailul',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Pentru a continua, deschide linkul de verificare pe dispozitivul și în browserul de pe care ai început înregistrarea',
        title: 'Linkul de verificare nu este valid pe acest dispozitiv',
      },
      formSubtitle: 'Folosește linkul de verificare trimis la adresa ta de email',
      formTitle: 'Link de verificare',
      loading: { title: 'Înregistrare...' },
      resendButton: 'Nu ai primit un link? Retrimite',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verifică-ți emailul',
      verified: { title: 'Înregistrare reușită' },
      verifiedSwitchTab: {
        subtitle: 'Revino în noua filă deschisă pentru a continua',
        subtitleNewTab: 'Revino în fila precedentă pentru a continua',
        title: 'Email verificat cu succes',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Sunt de acord cu {{ privacyPolicyLink || link("Politica de confidențialitate") }}',
        label__onlyTermsOfService: 'Sunt de acord cu {{ termsOfServiceLink || link("Termenii și condițiile") }}',
        label__termsOfServiceAndPrivacyPolicy:
          'Sunt de acord cu {{ termsOfServiceLink || link("Termenii și condițiile") }} și {{ privacyPolicyLink || link("Politica de confidențialitate") }}',
      },
      continue: {
        subtitle: 'Citește și acceptă termenii pentru a continua',
        title: 'Consimțământ legal',
      },
    },
    phoneCode: {
      formSubtitle: 'Introdu codul de verificare trimis pe telefon',
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ai primit un cod? Retrimite',
      subtitle: 'Introdu codul de verificare trimis pe telefon',
      title: 'Verifică-ți telefonul',
    },
    restrictedAccess: {
      actionLink: 'Autentifică-te',
      actionText: 'Ai deja cont?',
      blockButton__emailSupport: 'Trimite email la suport',
      blockButton__joinWaitlist: 'Înscrie-te pe lista de așteptare',
      subtitle:
        'Înregistrările sunt momentan dezactivate. Dacă crezi că ar trebui să ai acces, contactează suportul.',
      subtitleWaitlist:
        'Înregistrările sunt momentan dezactivate. Pentru a fi primul care află când lansăm, înscrie-te pe lista de așteptare.',
      title: 'Acces restricționat',
    },
    start: {
      actionLink: 'Autentifică-te',
      actionLink__use_email: 'Folosește emailul',
      actionLink__use_phone: 'Folosește telefonul',
      actionText: 'Ai deja cont?',
      alternativePhoneCodeProvider: {
        actionLink: 'Folosește altă metodă',
        label: 'Număr de telefon {{provider}}',
        subtitle:
          'Introdu numărul tău de telefon pentru a primi un cod de verificare pe {{provider}}.',
        title: 'Înregistrează-te în {{applicationName}} cu {{provider}}',
      },
      subtitle: 'Bun venit! Completează detaliile pentru a începe.',
      subtitleCombined: 'Bun venit! Completează detaliile pentru a începe.',
      title: 'Creează-ți contul',
      titleCombined: 'Creează-ți contul',
    },
  },
  socialButtonsBlockButton: 'Continuă cu {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  taskChooseOrganization: {
    chooseOrganization: {
      action__createOrganization: 'Creează organizație nouă',
      action__invitationAccept: 'Alătură-te',
      action__suggestionsAccept: 'Solicită alăturarea',
      subtitle: 'Alătură-te unei organizații existente sau creează una nouă',
      suggestionsAcceptedLabel: 'În așteptare',
      title: 'Alege o organizație',
    },
    createOrganization: {
      formButtonReset: 'Anulează',
      formButtonSubmit: 'Continuă',
      formFieldInputPlaceholder__name: 'Organizația mea',
      formFieldInputPlaceholder__slug: 'organizația-mea',
      formFieldLabel__name: 'Nume',
      formFieldLabel__slug: 'Slug',
      subtitle: 'Introdu detaliile organizației pentru a continua',
      title: 'Configurează-ți organizația',
    },
    signOut: {
      actionLink: 'Deconectează-te',
      actionText: 'Autentificat ca {{identifier}}',
    },
  },
  unstable__errors: {
    already_a_member_in_organization: '{{email}} este deja membru al organizației.',
    captcha_invalid: undefined,
    captcha_unavailable:
      'Înregistrarea a eșuat din cauza validării anti-bot. Reîmprospătează pagina sau contactează suportul.',
    form_code_incorrect: undefined,
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
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
    form_password_incorrect: undefined,
    form_password_length_too_short:
      'Parola este prea scurtă. Trebuie să aibă cel puțin 8 caractere.',
    form_password_not_strong_enough: 'Parola ta nu este suficient de puternică.',
    form_password_pwned:
      'Această parolă a fost găsită într-o breșă de securitate și nu poate fi folosită. Te rugăm alege alta.',
    form_password_pwned__sign_in:
      'Această parolă a fost găsită într-o breșă de securitate și nu poate fi folosită. Te rugăm resetează parola.',
    form_password_size_in_bytes_exceeded: undefined,
    form_password_validation_failed: undefined,
    form_username_invalid_character: undefined,
    form_username_invalid_length:
      'Numele de utilizator trebuie să aibă între {{min_length}} și {{max_length}} caractere.',
    identification_deletion_failed: undefined,
    not_allowed_access: undefined,
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded: undefined,
    organization_minimum_permissions_needed: undefined,
    organization_not_found_or_unauthorized:
      'Nu mai ești membru al acestei organizații. Te rugăm alege sau creează alta.',
    organization_not_found_or_unauthorized_with_create_organization_disabled:
      'Nu mai ești membru al acestei organizații. Te rugăm alege alta.',
    passkey_already_exists: 'Există deja o cheie de acces înregistrată pe acest dispozitiv.',
    passkey_not_supported: 'Cheile de acces nu sunt acceptate pe acest dispozitiv.',
    passkey_pa_not_supported:
      'Înregistrarea necesită un autentificator de platformă, dar dispozitivul nu îl suportă.',
    passkey_registration_cancelled:
      'Înregistrarea cheii de acces a fost anulată sau a expirat.',
    passkey_retrieval_cancelled:
      'Verificarea cu cheia de acces a fost anulată sau a expirat.',
    passwordComplexity: {
      maximumLength: 'mai puțin de {{length}} caractere',
      minimumLength: '{{length}} sau mai multe caractere',
      requireLowercase: 'o literă mică',
      requireNumbers: 'o cifră',
      requireSpecialCharacter: 'un caracter special',
      requireUppercase: 'o literă mare',
      sentencePrefix: 'Parola ta trebuie să conțină',
    },
    phone_number_exists: undefined,
    session_exists: undefined,
    web3_missing_identifier:
      'Nu am găsit o extensie pentru portofel Web3. Te rugăm instalează una pentru a continua.',
    zxcvbn: {
      couldBeStronger:
        'Parola ta funcționează, dar ar putea fi mai puternică. Încearcă să adaugi mai multe caractere.',
      goodPassword: 'Parola ta îndeplinește toate cerințele necesare.',
      notEnough: 'Parola ta nu este suficient de puternică.',
      suggestions: {
        allUppercase: 'Scrie cu majuscule unele, dar nu toate literele.',
        anotherWord: 'Adaugă mai multe cuvinte mai puțin comune.',
        associatedYears: 'Evită anii asociați cu tine.',
        capitalization: 'Folosește majuscule și în alte poziții decât prima literă.',
        dates: 'Evită datele și anii asociați cu tine.',
        l33t: "Evită substituțiile previzibile, precum '@' pentru 'a'.",
        longerKeyboardPattern: 'Folosește modele de tastă mai lungi și schimbă direcția.',
        noNeed:
          'Poți crea parole puternice fără simboluri, cifre sau litere mari.',
        pwned: 'Dacă folosești această parolă în altă parte, ar trebui să o schimbi.',
        recentYears: 'Evită anii recenți.',
        repeated: 'Evită cuvintele și caracterele repetate.',
        reverseWords: 'Evită inversarea ortografiei cuvintelor comune.',
        sequences: 'Evită secvențele comune de caractere.',
        useWords: 'Folosește mai multe cuvinte, dar evită expresiile comune.',
      },
      warnings: {
        common: 'Aceasta este o parolă des folosită.',
        commonNames: 'Numele și prenumele comune sunt ușor de ghicit.',
        dates: 'Datele sunt ușor de ghicit.',
        extendedRepeat:
          'Modelele repetate de caractere precum „abcabcabc” sunt ușor de ghicit.',
        keyPattern: 'Modelele scurte pe tastatură sunt ușor de ghicit.',
        namesByThemselves: 'Numele sau prenumele singure sunt ușor de ghicit.',
        pwned: 'Parola ta a fost expusă într-o breșă de date pe Internet.',
        recentYears: 'Anul recent este ușor de ghicit.',
        sequences: 'Secvențele comune (de ex. „abc”) sunt ușor de ghicit.',
        similarToCommon: 'Este similară cu o parolă des folosită.',
        simpleRepeat: 'Caracterele repetate (de ex. „aaa”) sunt ușor de ghicit.',
        straightRow: 'Șirurile drepte de taste sunt ușor de ghicit.',
        topHundred: 'Aceasta este o parolă frecvent folosită.',
        topTen: 'Aceasta este o parolă foarte des folosită.',
        userInputs: 'Nu trebuie să conțină date personale sau ale paginii.',
        wordByItself: 'Cuvintele singulare sunt ușor de ghicit.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Adaugă cont',
    action__manageAccount: 'Gestionează contul',
    action__signOut: 'Deconectează-te',
    action__signOutAll: 'Deconectează toate conturile',
  },
  userProfile: {
    apiKeysPage: {
      title: 'Chei API',
    },
    backupCodePage: {
      actionLabel__copied: 'Copiat!',
      actionLabel__copy: 'Copiază toate',
      actionLabel__download: 'Descarcă .txt',
      actionLabel__print: 'Printează',
      infoText1: 'Codurile de rezervă vor fi activate pentru acest cont.',
      infoText2:
        'Păstrează codurile de rezervă secrete și stochează-le în siguranță. Le poți regenera dacă suspectezi că au fost compromise.',
      subtitle__codelist: 'Stochează-le în siguranță și păstrează-le secrete.',
      successMessage:
        'Codurile de rezervă sunt acum activate. Poți folosi unul dintre ele pentru a te autentifica, dacă pierzi accesul la dispozitivul tău de autentificare. Fiecare cod poate fi folosit o singură dată.',
      successSubtitle:
        'Poți folosi unul dintre acestea pentru a te autentifica în cont dacă pierzi accesul la dispozitivul de autentificare.',
      title: 'Adaugă verificare cu cod de rezervă',
      title__codelist: 'Coduri de rezervă',
    },
    billingPage: {
      paymentHistorySection: {
        empty: 'Nu există istoric de plăți',
        notFound: 'Încercarea de plată nu a fost găsită',
        tableHeader__amount: 'Sumă',
        tableHeader__date: 'Dată',
        tableHeader__status: 'Stare',
      },
      paymentSourcesSection: {
        actionLabel__default: 'Setează ca implicită',
        actionLabel__remove: 'Elimină',
        add: 'Adaugă metodă de plată nouă',
        addSubtitle: 'Adaugă o nouă metodă de plată în contul tău.',
        cancelButton: 'Anulează',
        formButtonPrimary__add: 'Adaugă metoda de plată',
        formButtonPrimary__pay: 'Plătește {{amount}}',
        payWithTestCardButton: 'Plătește cu card de test',
        removeResource: {
          messageLine1: '{{identifier}} va fi eliminat(ă) din acest cont.',
          messageLine2:
            'Nu vei mai putea utiliza această sursă de plată, iar orice abonamente recurente care depind de ea nu vor mai funcționa.',
          successMessage: '{{paymentSource}} a fost eliminată din contul tău.',
          title: 'Elimină metoda de plată',
        },
        title: 'Metode de plată',
      },
      start: {
        headerTitle__payments: 'Plăți',
        headerTitle__plans: 'Planuri',
        headerTitle__statements: 'Extrase',
        headerTitle__subscriptions: 'Abonament',
      },
      statementsSection: {
        empty: 'Nu există extrase de afișat',
        itemCaption__paidForPlan: 'Plătit pentru planul {{plan}} {{period}}',
        itemCaption__proratedCredit: 'Credit proporțional pentru utilizarea parțială a abonamentului anterior',
        itemCaption__subscribedAndPaidForPlan: 'Abonat și plătit pentru planul {{plan}} {{period}}',
        notFound: 'Extrasul nu a fost găsit',
        tableHeader__amount: 'Sumă',
        tableHeader__date: 'Dată',
        title: 'Extrase',
        totalPaid: 'Total plătit',
      },
      subscriptionsListSection: {
        actionLabel__newSubscription: 'Abonează-te la un plan',
        actionLabel__switchPlan: 'Schimbă planurile',
        tableHeader__edit: 'Editează',
        tableHeader__plan: 'Plan',
        tableHeader__startDate: 'Data începerii',
        title: 'Abonament',
      },
      subscriptionsSection: {
        actionLabel__default: 'Gestionează',
      },
      switchPlansSection: {
        title: 'Schimbă planurile',
      },
      title: 'Facturare',
    },
    connectedAccountPage: {
      formHint: 'Selectează un furnizor pentru a-ți conecta contul.',
      formHint__noAccounts: 'Nu există furnizori externi disponibili.',
      removeResource: {
        messageLine1: '{{identifier}} va fi eliminat din acest cont.',
        messageLine2:
          'Nu vei mai putea folosi acest cont conectat, iar funcțiile dependente nu vor mai funcționa.',
        successMessage: '{{connectedAccount}} a fost eliminat din contul tău.',
        title: 'Elimină contul conectat',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'Furnizorul a fost adăugat la contul tău',
      title: 'Adaugă cont conectat',
    },
    deletePage: {
      actionDescription: 'Tastează „Șterge contul” mai jos pentru a continua.',
      confirm: 'Șterge contul',
      messageLine1: 'Sigur vrei să îți ștergi contul?',
      messageLine2: 'Această acțiune este permanentă și ireversibilă.',
      title: 'Șterge contul',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Un email cu un cod de verificare va fi trimis la această adresă.',
        formSubtitle: 'Introdu codul de verificare trimis la {{identifier}}',
        formTitle: 'Cod de verificare',
        resendButton: 'Nu ai primit un cod? Retrimite',
        successMessage: 'Adresa {{identifier}} a fost adăugată la contul tău.',
      },
      emailLink: {
        formHint: 'Un email cu un link de verificare va fi trimis la această adresă.',
        formSubtitle: 'Apasă pe linkul de verificare din emailul trimis la {{identifier}}',
        formTitle: 'Link de verificare',
        resendButton: 'Nu ai primit un link? Retrimite',
        successMessage: 'Adresa {{identifier}} a fost adăugată la contul tău.',
      },
      enterpriseSSOLink: {
        formButton: 'Apasă pentru autentificare',
        formSubtitle: 'Finalizează autentificarea cu {{identifier}}',
      },
      formHint: 'Va trebui să verifici această adresă de email înainte de a o adăuga la cont.',
      removeResource: {
        messageLine1: '{{identifier}} va fi eliminată din acest cont.',
        messageLine2: 'Nu te vei mai putea autentifica folosind această adresă de email.',
        successMessage: '{{emailAddress}} a fost eliminată din contul tău.',
        title: 'Elimină adresa de email',
      },
      title: 'Adaugă adresă de email',
      verifyTitle: 'Verifică adresa de email',
    },
    formButtonPrimary__add: 'Adaugă',
    formButtonPrimary__continue: 'Continuă',
    formButtonPrimary__finish: 'Finalizează',
    formButtonPrimary__remove: 'Elimină',
    formButtonPrimary__save: 'Salvează',
    formButtonReset: 'Anulează',
    mfaPage: {
      formHint: 'Selectează o metodă de adăugat.',
      title: 'Adaugă verificare în doi pași',
    },
    mfaPhoneCodePage: {
      backButton: 'Folosește numărul existent',
      primaryButton__addPhoneNumber: 'Adaugă număr de telefon',
      removeResource: {
        messageLine1: '{{identifier}} nu va mai primi coduri de verificare la autentificare.',
        messageLine2: 'Contul tău ar putea fi mai puțin sigur. Sigur vrei să continui?',
        successMessage: 'Verificarea în doi pași prin cod SMS a fost eliminată pentru {{mfaPhoneCode}}',
        title: 'Elimină verificarea în doi pași',
      },
      subtitle__availablePhoneNumbers:
        'Selectează un număr existent pentru verificare prin SMS sau adaugă unul nou.',
      subtitle__unavailablePhoneNumbers:
        'Nu există numere disponibile pentru verificare prin SMS; te rugăm adaugă unul nou.',
      successMessage1:
        'La autentificare, va trebui să introduci un cod trimis la acest număr de telefon ca pas suplimentar.',
      successMessage2:
        'Salvează aceste coduri de rezervă într-un loc sigur. Dacă pierzi accesul la dispozitivul de autentificare, le poți folosi pentru a te autentifica.',
      successTitle: 'Verificare prin SMS activată',
      title: 'Adaugă verificare prin SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Scanează codul QR în schimb',
        buttonUnableToScan__nonPrimary: 'Nu poți scana codul QR?',
        infoText__ableToScan:
          'Adaugă o metodă nouă de autentificare în aplicația ta și scanează codul QR de mai jos pentru a o lega de cont.',
        infoText__unableToScan:
          'Adaugă o metodă nouă în aplicația ta de autentificare și introdu Cheia furnizată mai jos.',
        inputLabel__unableToScan1:
          'Asigură-te că parolele „Time-based” sau „One-time” sunt activate, apoi finalizează conectarea contului.',
        inputLabel__unableToScan2:
          'Alternativ, dacă aplicația ta suportă URI TOTP, poți copia URI-ul complet.',
      },
      removeResource: {
        messageLine1: 'Codurile de verificare din această aplicație nu vor mai fi necesare la autentificare.',
        messageLine2: 'Contul tău ar putea fi mai puțin sigur. Sigur vrei să continui?',
        successMessage: 'Verificarea în doi pași prin aplicație de autentificare a fost eliminată.',
        title: 'Elimină verificarea în doi pași',
      },
      successMessage:
        'Verificarea în doi pași este acum activată. La autentificare va trebui să introduci un cod din această aplicație.',
      title: 'Adaugă aplicație de autentificare',
      verifySubtitle: 'Introdu codul generat de aplicația ta de autentificare',
      verifyTitle: 'Cod de verificare',
    },
    mobileButton__menu: 'Meniu',
    navbar: {
      account: 'Profil',
      apiKeys: 'Chei API',
      billing: 'Facturare',
      description: 'Gestionează informațiile contului.',
      security: 'Securitate',
      title: 'Cont',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} va fi eliminată din acest cont.',
        title: 'Elimină cheia de acces',
      },
      subtitle__rename: 'Poți schimba numele cheii de acces pentru a o găsi mai ușor.',
      title__rename: 'Redenumește cheia de acces',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Se recomandă să te deconectezi de pe celelalte dispozitive care ar fi putut folosi parola veche.',
      readonly:
        'Parola nu poate fi editată momentan deoarece te poți autentifica doar prin conexiunea enterprise.',
      successMessage__set: 'Parola a fost setată.',
      successMessage__signOutOfOtherSessions: 'Toate celelalte dispozitive au fost deconectate.',
      successMessage__update: 'Parola a fost actualizată.',
      title__set: 'Setează parola',
      title__update: 'Actualizează parola',
    },
    phoneNumberPage: {
      infoText:
        'Un mesaj text cu un cod de verificare va fi trimis la acest număr. Pot exista costuri pentru mesaje și date.',
      removeResource: {
        messageLine1: '{{identifier}} va fi eliminat din acest cont.',
        messageLine2: 'Nu te vei mai putea autentifica folosind acest număr de telefon.',
        successMessage: '{{phoneNumber}} a fost eliminat din contul tău.',
        title: 'Elimină numărul de telefon',
      },
      successMessage: '{{identifier}} a fost adăugat la contul tău.',
      title: 'Adaugă număr de telefon',
      verifySubtitle: 'Introdu codul trimis la {{identifier}}',
      verifyTitle: 'Verifică numărul de telefon',
    },
    plansPage: {
      title: 'Planuri',
    },
    profilePage: {
      fileDropAreaHint: 'Dimensiune recomandată 1:1, până la 10MB.',
      imageFormDestructiveActionSubtitle: 'Elimină',
      imageFormSubtitle: 'Încarcă',
      imageFormTitle: 'Imagine de profil',
      readonly:
        'Informațiile profilului sunt furnizate de conexiunea enterprise și nu pot fi editate.',
      successMessage: 'Profilul tău a fost actualizat.',
      title: 'Actualizează profilul',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Deconectează dispozitivul',
        title: 'Dispozitive active',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Reconectează',
        actionLabel__reauthorize: 'Autorizează acum',
        destructiveActionTitle: 'Elimină',
        primaryButton: 'Conectează cont',
        subtitle__disconnected: 'Acest cont a fost deconectat.',
        subtitle__reauthorize:
          'Permisiunile necesare au fost actualizate și poți întâmpina funcționalitate limitată. Te rugăm reautorizează aplicația pentru a evita problemele.',
        title: 'Conturi conectate',
      },
      dangerSection: {
        deleteAccountButton: 'Șterge contul',
        title: 'Șterge contul',
      },
      emailAddressesSection: {
        destructiveAction: 'Elimină emailul',
        detailsAction__nonPrimary: 'Setează ca principal',
        detailsAction__primary: 'Finalizează verificarea',
        detailsAction__unverified: 'Verifică',
        primaryButton: 'Adaugă adresă de email',
        title: 'Adrese de email',
      },
      enterpriseAccountsSection: {
        title: 'Conturi enterprise',
      },
      headerTitle__account: 'Detalii profil',
      headerTitle__security: 'Securitate',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Generează din nou',
          headerTitle: 'Coduri de rezervă',
          subtitle__regenerate:
            'Obține un set nou de coduri de rezervă. Codurile anterioare vor fi șterse și nu vor mai putea fi folosite.',
          title__regenerate: 'Generează din nou codurile de rezervă',
        },
        phoneCode: {
          actionLabel__setDefault: 'Setează ca implicit',
          destructiveActionLabel: 'Elimină',
        },
        primaryButton: 'Adaugă verificare în doi pași',
        title: 'Verificare în doi pași',
        totp: {
          destructiveActionTitle: 'Elimină',
          headerTitle: 'Aplicație de autentificare',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Elimină',
        menuAction__rename: 'Redenumește',
        primaryButton: 'Adaugă o cheie de acces',
        title: 'Chei de acces',
      },
      passwordSection: {
        primaryButton__setPassword: 'Setează parola',
        primaryButton__updatePassword: 'Actualizează parola',
        title: 'Parolă',
      },
      phoneNumbersSection: {
        destructiveAction: 'Elimină numărul de telefon',
        detailsAction__nonPrimary: 'Setează ca principal',
        detailsAction__primary: 'Finalizează verificarea',
        detailsAction__unverified: 'Verifică numărul de telefon',
        primaryButton: 'Adaugă număr de telefon',
        title: 'Numere de telefon',
      },
      profileSection: {
        primaryButton: 'Actualizează profilul',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Setează numele de utilizator',
        primaryButton__updateUsername: 'Actualizează numele de utilizator',
        title: 'Nume de utilizator',
      },
      web3WalletsSection: {
        destructiveAction: 'Elimină portofelul',
        detailsAction__nonPrimary: 'Setează ca principal',
        primaryButton: 'Conectează portofel',
        title: 'Portofele Web3',
      },
    },
    usernamePage: {
      successMessage: 'Numele de utilizator a fost actualizat.',
      title__set: 'Setează numele de utilizator',
      title__update: 'Actualizează numele de utilizator',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} va fi eliminat din acest cont.',
        messageLine2: 'Nu te vei mai putea autentifica folosind acest portofel web3.',
        successMessage: '{{web3Wallet}} a fost eliminat din contul tău.',
        title: 'Elimină portofelul web3',
      },
      subtitle__availableWallets: 'Selectează un portofel web3 pentru a-l conecta la cont.',
      subtitle__unavailableWallets: 'Nu există portofele web3 disponibile.',
      successMessage: 'Portofelul a fost adăugat la contul tău.',
      title: 'Adaugă portofel web3',
      web3WalletButtonsBlockButton: '{{provider|titleize}}',
    },
  },
  waitlist: {
    start: {
      actionLink: 'Autentifică-te',
      actionText: 'Ai deja acces?',
      formButton: 'Înscrie-te pe lista de așteptare',
      subtitle: 'Introdu adresa ta de email și te vom anunța când îți vine rândul',
      title: 'Înscrie-te pe lista de așteptare',
    },
    success: {
      message: 'Vei fi redirecționat în curând...',
      subtitle: 'Te vom contacta când îți vine rândul',
      title: 'Mulțumim pentru înscriere!',
    },
  },
} as const;  
