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
  backButton: 'Înapoi',
  badge__default: 'Implicit',
  badge__otherImpersonatorDevice: 'Alt dispozitiv de imitație',
  badge__primary: 'Principală',
  badge__requiresAction: 'Necesită acțiune',
  badge__thisDevice: 'Acest dispozitiv',
  badge__unverified: 'Nedeclarat',
  badge__userDevice: 'Dispozitiv de utilizator',
  badge__you: 'Tu',
  createOrganization: {
    formButtonSubmit: 'Creați o organizație',
    invitePage: {
      formButtonReset: 'Skip',
    },
    title: 'Creați o organizație',
  },
  dates: {
    lastDay: "Ieri la {{ date | timeString('en-US') }}",
    next6Days: "{{ date | weekday('en-US','long') }} la {{ date | timeString('en-US') }}",
    nextDay: "Mâine la {{ date | timeString('en-US') }}",
    numeric: "{{ date | numeric('en-US') }}}",
    previous6Days: "Ultimul {{ date | weekday('en-US','long') }} la {{ date | timeString('en-US') }}",
    sameDay: "Astăzi la {{ date | timeString('en-US') }}",
  },
  dividerText: 'sau',
  footerActionLink__useAnotherMethod: 'Utilizați o altă metodă',
  footerPageLink__help: 'Ajutor',
  footerPageLink__privacy: 'Confidențialitate',
  footerPageLink__terms: 'Termeni',
  formButtonPrimary: 'Continuați',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Ați uitat parola?',
  formFieldError__matchingPasswords: 'Parolele se potrivesc.',
  formFieldError__notMatchingPasswords: 'Parolele nu se potrivesc.',
  formFieldError__verificationLinkExpired: 'Linkul de verificare a expirat. Vă rugăm să solicitați un nou link.',
  formFieldHintText__optional: 'Opțional',
  formFieldHintText__slug:
    'Un slug este un ID lizibil de către om, care trebuie să fie unic. Este adesea utilizat în URL-uri.',
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses:
    'Introduceți sau lipiți una sau mai multe adrese de e-mail, separate prin spații sau virgule',
  formFieldInputPlaceholder__firstName: undefined,
  formFieldInputPlaceholder__lastName: undefined,
  formFieldInputPlaceholder__organizationDomain: undefined,
  formFieldInputPlaceholder__organizationDomainEmailAddress: undefined,
  formFieldInputPlaceholder__organizationName: undefined,
  formFieldInputPlaceholder__organizationSlug: undefined,
  formFieldInputPlaceholder__password: undefined,
  formFieldInputPlaceholder__phoneNumber: undefined,
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations: 'Activați invitațiile automate pentru acest domeniu',
  formFieldLabel__backupCode: 'Cod de rezervă',
  formFieldLabel__confirmDeletion: 'Confirmare',
  formFieldLabel__confirmPassword: 'Confirmați parola',
  formFieldLabel__currentPassword: 'Parola curentă',
  formFieldLabel__emailAddress: 'Adresa de e-mail',
  formFieldLabel__emailAddress_username: 'Adresa de e-mail sau numele de utilizator',
  formFieldLabel__emailAddresses: 'Adrese de e-mail',
  formFieldLabel__firstName: 'Prenume',
  formFieldLabel__lastName: 'Nume',
  formFieldLabel__newPassword: 'Parolă nouă',
  formFieldLabel__organizationDomain: 'Domeniu',
  formFieldLabel__organizationDomainDeletePending: 'Ștergeți invitațiile și sugestiile în așteptare',
  formFieldLabel__organizationDomainEmailAddress: 'Adresa de e-mail de verificare',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Introduceți o adresă de e-mail sub acest domeniu pentru a primi un cod și pentru a verifica acest domeniu.',
  formFieldLabel__organizationName: 'Numele organizației',
  formFieldLabel__organizationSlug: 'Slug URL',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Parola',
  formFieldLabel__phoneNumber: 'Număr de telefon',
  formFieldLabel__role: 'Rol',
  formFieldLabel__signOutOfOtherSessions: 'Deconectați-vă de pe toate celelalte dispozitive',
  formFieldLabel__username: 'Nume utilizator',
  impersonationFab: {
    action__signOut: 'Deconectați-vă',
    title: 'Conectat ca {{identifier}}',
  },
  maintenanceMode: undefined,
  membershipRole__admin: 'Admin',
  membershipRole__basicMember: 'Membru',
  membershipRole__guestMember: 'Invitat',
  organizationList: {
    action__createOrganization: 'Creați o organizație',
    action__invitationAccept: 'Alăturați-vă',
    action__suggestionsAccept: 'Cerere de aderare',
    createOrganization: 'Creați o organizație',
    invitationAcceptedLabel: 'S-a alăturat',
    subtitle: 'pentru a continua la {{applicationName}}',
    suggestionsAcceptedLabel: 'În curs de aprobare',
    title: 'Selectați un cont',
    titleWithoutPersonal: 'Selectați o organizație',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Invitații automate',
    badge__automaticSuggestion: 'Sugestii automate',
    badge__manualInvitation: 'Fără înscriere automată',
    badge__unverified: 'Nedeclarat',
    createDomainPage: {
      subtitle:
        'Adăugați domeniul de verificat. Utilizatorii cu adrese de e-mail la acest domeniu se pot alătura organizației în mod automat sau pot solicita să se alăture.',
      title: 'Adăugați domeniul',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Invitațiile nu au putut fi trimise. Există deja invitații în așteptare pentru următoarele adrese de e-mail: {{email_addresses}}.',
      formButtonPrimary__continue: 'Trimiteți invitații',
      selectDropdown__role: 'Select role',
      subtitle: 'Invitați noi membri în această organizație',
      successMessage: 'Invitații trimise cu succes',
      title: 'Invitați membri',
    },
    membersPage: {
      action__invite: 'Invitați',
      activeMembersTab: {
        menuAction__remove: 'Îndepărtați membrul',
        tableHeader__actions: undefined,
        tableHeader__joined: 'S-a alăturat',
        tableHeader__role: 'Rol',
        tableHeader__user: 'Utilizator',
      },
      detailsTitle__emptyRow: 'Nu există membri de afișat',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invitați utilizatorii prin conectarea unui domeniu de e-mail cu organizația dvs. Oricine se înscrie cu un domeniu de e-mail corespunzător va putea să se alăture organizației oricând.',
          headerTitle: 'Invitații automate',
          primaryButton: 'Gestionați domeniile verificate',
        },
        table__emptyRow: 'Nu există invitații de afișare',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Revocarea invitației',
        tableHeader__invited: 'Invitat',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Utilizatorii care se înscriu cu un domeniu de e-mail corespunzător vor putea vedea o sugestie de a solicita să se alăture organizației dvs.',
          headerTitle: 'Sugestii automate',
          primaryButton: 'Gestionați domeniile verificate',
        },
        menuAction__approve: 'Aprobarea',
        menuAction__reject: 'Respingeți',
        tableHeader__requested: 'Accesul solicitat',
        table__emptyRow: 'Nu există cereri de afișare',
      },
      start: {
        headerTitle__invitations: 'Invitații',
        headerTitle__members: 'Membri',
        headerTitle__requests: 'Cereri',
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
          actionDescription: 'Introduceți {{organizationName}} mai jos pentru a continua.',
          messageLine1: 'Sunteți sigur că doriți să ștergeți această organizație?',
          messageLine2: 'Această acțiune este permanentă și ireversibilă.',
          successMessage: 'Ați șters organizația.',
          title: 'Ștergeți organizația',
        },
        leaveOrganization: {
          actionDescription: 'Introduceți {{organizationName}} mai jos pentru a continua.',
          messageLine1:
            'Ești sigur că vrei să părăsești această organizație? Veți pierde accesul la această organizație și la aplicațiile sale.',
          messageLine2: 'Această acțiune este permanentă și ireversibilă.',
          successMessage: 'Ați părăsit organizația.',
          title: 'Organizarea concediului',
        },
        title: 'Pericol',
      },
      domainSection: {
        menuAction__manage: 'Manage',
        menuAction__remove: 'Delete',
        menuAction__verify: 'Verify',
        primaryButton: 'Adăugați domeniul',
        subtitle:
          'Permiteți utilizatorilor să se alăture automat organizației sau să solicite aderarea pe baza unui domeniu de e-mail verificat.',
        title: 'Domenii verificate',
      },
      successMessage: 'Organizația a fost actualizată.',
      title: 'Profilul organizației',
    },
    removeDomainPage: {
      messageLine1: 'Domeniul de e-mail {{domain}} va fi eliminat.',
      messageLine2: 'După aceasta, utilizatorii nu vor mai putea să se alăture automat organizației.',
      successMessage: '{{domain}} a fost eliminat.',
      title: 'Înlăturați domeniul',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Membri',
      profileSection: {
        primaryButton: undefined,
        title: 'Organization Profile',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Eliminarea acestui domeniu va afecta utilizatorii invitați.',
        removeDomainActionLabel__remove: 'Înlăturați domeniul',
        removeDomainSubtitle: 'Eliminați acest domeniu din domeniile verificate',
        removeDomainTitle: 'Înlăturați domeniul',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Utilizatorii sunt invitați automat să se alăture organizației atunci când se înscriu și se pot alătura oricând.',
        automaticInvitationOption__label: 'Invitații automate',
        automaticSuggestionOption__description:
          'Utilizatorii primesc o sugestie de a solicita aderarea, dar trebuie să fie aprobați de un administrator înainte de a se putea alătura organizației.',
        automaticSuggestionOption__label: 'Sugestii automate',
        calloutInfoLabel: 'Schimbarea modului de înscriere va afecta doar utilizatorii noi.',
        calloutInvitationCountLabel: 'Invitații în așteptare trimise utilizatorilor: {{count}}',
        calloutSuggestionCountLabel: 'Sugestii în așteptare trimise utilizatorilor: {{count}}',
        manualInvitationOption__description: 'Utilizatorii pot fi invitați doar manual în organizație.',
        manualInvitationOption__label: 'Fără înscriere automată',
        subtitle: 'Alegeți modul în care utilizatorii din acest domeniu se pot alătura organizației.',
      },
      start: {
        headerTitle__danger: 'Pericol',
        headerTitle__enrollment: 'Opțiuni de înscriere',
      },
      subtitle: 'Domeniul {{domain}} este acum verificat. Continuați prin selectarea modului de înscriere.',
      title: 'Update {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Introduceți codul de verificare trimis la adresa dvs. de e-mail',
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ați primit un cod? Trimiteți din nou',
      subtitle: 'Domeniul {{domainName}} trebuie să fie verificat prin e-mail.',
      subtitleVerificationCodeScreen:
        'Un cod de verificare a fost trimis la {{emailAddress}}. Introduceți codul pentru a continua.',
      title: 'Verifică domeniul',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Creați o organizație',
    action__invitationAccept: 'Alăturați-vă',
    action__manageOrganization: 'Gestionați organizația',
    action__suggestionsAccept: 'Cerere de aderare',
    notSelected: 'Nici o organizație selectată',
    personalWorkspace: 'Cont personal',
    suggestionsAcceptedLabel: 'În curs de aprobare',
  },
  paginationButton__next: 'Următorul',
  paginationButton__previous: 'Anterior',
  paginationRowText__displaying: 'Afișarea',
  paginationRowText__of: 'de',
  reverification: {
    alternativeMethods: {
      actionLink: undefined,
      actionText: undefined,
      blockButton__backupCode: undefined,
      blockButton__emailCode: undefined,
      blockButton__password: undefined,
      blockButton__phoneCode: undefined,
      blockButton__totp: undefined,
      getHelp: {
        blockButton__emailSupport: undefined,
        content: undefined,
        title: undefined,
      },
      subtitle: undefined,
      title: undefined,
    },
    backupCodeMfa: {
      subtitle: undefined,
      title: undefined,
    },
    emailCode: {
      formTitle: undefined,
      resendButton: undefined,
      subtitle: undefined,
      title: undefined,
    },
    noAvailableMethods: {
      message: undefined,
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: undefined,
      subtitle: undefined,
      title: undefined,
    },
    phoneCode: {
      formTitle: undefined,
      resendButton: undefined,
      subtitle: undefined,
      title: undefined,
    },
    phoneCodeMfa: {
      formTitle: undefined,
      resendButton: undefined,
      subtitle: undefined,
      title: undefined,
    },
    totpMfa: {
      formTitle: undefined,
      subtitle: undefined,
      title: undefined,
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Obțineți ajutor',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Utilizați un cod de rezervă',
      blockButton__emailCode: 'Codul de e-mail către {{identifier}}',
      blockButton__emailLink: 'Trimiteți un link prin e-mail către {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Conectați-vă cu parola dvs',
      blockButton__phoneCode: 'Trimiteți codul SMS la {{identifier}}',
      blockButton__totp: 'Utilizați aplicația de autentificare',
      getHelp: {
        blockButton__emailSupport: 'Suport prin e-mail',
        content:
          'Dacă întâmpinați dificultăți la conectarea în contul dvs., trimiteți-ne un e-mail și vom lucra cu dvs. pentru a restabili accesul cât mai curând posibil.',
        title: 'Obțineți ajutor',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Utilizați o altă metodă',
    },
    backupCodeMfa: {
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Introduceți un cod de rezervă',
    },
    emailCode: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ați primit un cod? Trimiteți din nou',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verifică-ți e-mailul',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      expired: {
        subtitle: 'Reveniți la tab-ul inițial pentru a continua.',
        title: 'Acest link de verificare a expirat',
      },
      failed: {
        subtitle: 'Reveniți la tab-ul inițial pentru a continua.',
        title: 'Acest link de verificare nu este valid',
      },
      formSubtitle: 'Folosiți link-ul de verificare trimis pe e-mailul dvs',
      formTitle: 'Link de verificare',
      loading: {
        subtitle: 'Veți fi redirecționat în curând',
        title: 'Conectarea...',
      },
      resendButton: 'Nu ați primit un link? Trimiteți din nou',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verifică-ți e-mailul',
      unusedTab: {
        title: 'Puteți închide această filă',
      },
      verified: {
        subtitle: 'Veți fi redirecționat în curând',
        title: 'Conectat cu succes',
      },
      verifiedSwitchTab: {
        subtitle: 'Reveniți la tab-ul inițial pentru a continua',
        subtitleNewTab: 'Reveniți la tab-ul nou deschis pentru a continua',
        titleNewTab: 'Conectat pe altă filă',
      },
    },
    forgotPassword: {
      formTitle: 'Resetarea codului de parolă',
      resendButton: 'Nu ați primit un cod? Trimiteți din nou',
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Resetați-vă parola',
      label__alternativeMethods: 'Sau, conectați-vă cu o altă metodă.',
      title: 'Ați uitat parola?',
    },
    noAvailableMethods: {
      message: 'Nu se poate continua autentificarea. Nu există niciun factor de autentificare disponibil.',
      subtitle: 'S-a produs o eroare',
      title: 'Nu se poate autentifica',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Utilizați o altă metodă',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Introduceți parola dvs',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ați primit un cod? Trimiteți din nou',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verificarea telefonului dvs',
    },
    phoneCodeMfa: {
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ați primit un cod? Trimiteți din nou',
      subtitle: undefined,
      title: 'Verificarea telefonului dvs',
    },
    resetPassword: {
      formButtonPrimary: 'Resetare parolă',
      requiredMessage:
        'Există deja un cont cu o adresă de e-mail neverificată. Vă rugăm să vă resetați parola pentru securitate.',
      successMessage: 'Parola dvs. a fost schimbată cu succes. Vă rugăm să așteptați un moment.',
      title: 'Resetare parolă',
    },
    resetPasswordMfa: {
      detailsLabel: 'Trebuie să vă verificăm identitatea înainte de a vă reseta parola.',
    },
    start: {
      actionLink: 'Înscrieți-vă',
      actionLink__join_waitlist: undefined,
      actionLink__use_email: 'Utilizați e-mailul',
      actionLink__use_email_username: 'Utilizați e-mail sau nume de utilizator',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Utilizați telefonul',
      actionLink__use_username: 'Utilizați numele de utilizator',
      actionText: 'Nu aveți cont?',
      actionText__join_waitlist: undefined,
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Conectați-vă',
      __experimental_titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Cod de verificare',
      subtitle: undefined,
      title: 'Verificare în două etape',
    },
  },
  signInEnterPasswordTitle: 'Introduceți parola dvs',
  signUp: {
    continue: {
      actionLink: 'Conectați-vă',
      actionText: 'Aveți un cont?',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Completați câmpurile lipsă',
    },
    emailCode: {
      formSubtitle: 'Introduceți codul de verificare trimis la adresa dvs. de e-mail',
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ați primit un cod? Trimiteți din nou',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verificați-vă e-mailul',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      formSubtitle: 'Utilizați link-ul de verificare trimis la adresa dvs. de e-mail',
      formTitle: 'Link de verificare',
      loading: {
        title: 'Se crează contul...',
      },
      resendButton: 'Nu ați primit un link? Trimiteți din nou',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verificați-vă e-mailul',
      verified: {
        title: 'Înregistrat cu succes',
      },
      verifiedSwitchTab: {
        subtitle: 'Reveniți la tab-ul nou deschis pentru a continua',
        subtitleNewTab: 'Reveniți la tab-ul anterior pentru a continua',
        title: 'E-mail verificat cu succes',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: undefined,
        label__onlyTermsOfService: undefined,
        label__termsOfServiceAndPrivacyPolicy: undefined,
      },
      continue: {
        subtitle: undefined,
        title: undefined,
      },
    },
    phoneCode: {
      formSubtitle: 'Introduceți codul de verificare trimis la numărul dvs. de telefon',
      formTitle: 'Cod de verificare',
      resendButton: 'Nu ați primit un cod? Trimiteți din nou',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Verificarea telefonului dvs',
    },
    restrictedAccess: {
      actionLink: undefined,
      actionText: undefined,
      blockButton__emailSupport: undefined,
      blockButton__joinWaitlist: undefined,
      subtitle: undefined,
      subtitleWaitlist: undefined,
      title: undefined,
    },
    start: {
      actionLink: 'Conectați-vă',
      actionLink__use_email: undefined,
      actionLink__use_phone: undefined,
      actionText: 'Aveți un cont?',
      subtitle: 'pentru a continua la {{applicationName}}',
      title: 'Creați-vă un cont',
    },
  },
  socialButtonsBlockButton: 'Continuați cu {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: undefined,
  unstable__errors: {
    already_a_member_in_organization: undefined,
    captcha_invalid:
      'Înscrierea a eșuat din cauza unor validări de securitate nereușite. Vă rugăm să reîmprospătați pagina pentru a încerca din nou sau contactați serviciul de asistență pentru mai multă asistență.',
    captcha_unavailable:
      'Înscrierea a eșuat din cauza unei validări nereușite a robotului. Vă rugăm să reîmprospătați pagina pentru a încerca din nou sau contactați serviciul de asistență pentru mai multă asistență.',
    form_code_incorrect: undefined,
    form_identifier_exists: undefined,
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'Adresa de e-mail trebuie să fie o adresă de e-mail validă.',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'Prenumele nu trebuie să depășească 256 de caractere.',
    form_param_max_length_exceeded__last_name: 'Numele de familie nu trebuie să depășească 256 de caractere.',
    form_param_max_length_exceeded__name: 'Numele nu trebuie să depășească 256 de caractere.',
    form_param_nil: undefined,
    form_param_value_invalid: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: 'Parola dvs. nu este suficient de puternică.',
    form_password_pwned:
      'Această parolă a fost descoperită ca parte a unei încălcări și nu poate fi utilizată, vă rugăm să încercați o altă parolă.',
    form_password_pwned__sign_in: undefined,
    form_password_size_in_bytes_exceeded:
      'Parola dvs. a depășit numărul maxim de octeți permis, vă rugăm să o scurtați sau să eliminați unele caractere speciale.',
    form_password_validation_failed: 'Parolă incorectă',
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed: 'Nu vă puteți șterge ultima identificare.',
    not_allowed_access: undefined,
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded: undefined,
    organization_minimum_permissions_needed: undefined,
    passkey_already_exists: undefined,
    passkey_not_supported: undefined,
    passkey_pa_not_supported: undefined,
    passkey_registration_cancelled: undefined,
    passkey_retrieval_cancelled: undefined,
    passwordComplexity: {
      maximumLength: 'mai puțin de {{length}} caractere',
      minimumLength: '{{length}} sau mai multe caractere',
      requireLowercase: 'o literă minusculă',
      requireNumbers: 'un număr',
      requireSpecialCharacter: 'un caracter special',
      requireUppercase: 'o literă majusculă',
      sentencePrefix: 'Parola dvs. trebuie să conțină',
    },
    phone_number_exists: 'Acest număr de telefon este ocupat. Vă rugăm să încercați altul.',
    zxcvbn: {
      couldBeStronger:
        'Parola dvs. funcționează, dar ar putea fi mai puternică. Încercați să adăugați mai multe caractere.',
      goodPassword: 'Parola dvs. îndeplinește toate cerințele necesare.',
      notEnough: 'Parola dvs. nu este suficient de puternică.',
      suggestions: {
        allUppercase: 'Scrieți cu majuscule unele litere, dar nu toate literele.',
        anotherWord: 'Adăugați mai multe cuvinte care sunt mai puțin frecvente.',
        associatedYears: 'Evitați anii care vă sunt asociați.',
        capitalization: 'Scrieți cu majusculă mai mult decât prima literă.',
        dates: 'Evitați datele și anii care vă sunt asociate.',
        l33t: 'Evitați înlocuirile previzibile de litere, cum ar fi "@" pentru "a".',
        longerKeyboardPattern:
          'Utilizați modele de tastatură mai lungi și schimbați direcția de tastare de mai multe ori.',
        noNeed: 'Puteți crea parole puternice fără a folosi simboluri, numere sau litere majuscule.',
        pwned: 'Dacă folosiți această parolă în altă parte, ar trebui să o schimbați.',
        recentYears: 'Evitați ultimii ani.',
        repeated: 'Evitați cuvintele și caracterele repetate.',
        reverseWords: 'Evitați ortografia inversă a cuvintelor uzuale.',
        sequences: 'Evitați secvențele de caractere comune.',
        useWords: 'Folosiți mai multe cuvinte, dar evitați frazele comune.',
      },
      warnings: {
        common: 'Aceasta este o parolă folosită în mod obișnuit.',
        commonNames: 'Numele comune și numele de familie sunt ușor de ghicit.',
        dates: 'Datele sunt ușor de ghicit.',
        extendedRepeat: 'Modelele de caractere repetate, cum ar fi "abcabcabc", sunt ușor de ghicit.',
        keyPattern: 'Modelele scurte de tastatură sunt ușor de ghicit.',
        namesByThemselves: 'Numele sau prenumele simple sunt ușor de ghicit.',
        pwned: 'Parola dvs. a fost expusă în urma unei încălcări a securității datelor pe internet.',
        recentYears: 'Ultimii ani sunt ușor de ghicit.',
        sequences: 'Secvențele de caractere comune, cum ar fi "abc", sunt ușor de ghicit.',
        similarToCommon: 'Acest lucru este similar cu o parolă folosită în mod obișnuit.',
        simpleRepeat: 'Caracterele repetate, cum ar fi "aaa", sunt ușor de ghicit.',
        straightRow: 'Rândurile drepte de taste de pe tastatură sunt ușor de ghicit.',
        topHundred: 'Aceasta este o parolă utilizată frecvent.',
        topTen: 'Aceasta este o parolă foarte utilizată.',
        userInputs: 'Nu trebuie să existe date personale sau legate de pagini.',
        wordByItself: 'Cuvintele simple sunt ușor de ghicit.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Adăugați un cont',
    action__manageAccount: 'Gestionați contul',
    action__signOut: 'Deconectați-vă',
    action__signOutAll: 'Deconectați-vă din toate conturile',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Copiat!',
      actionLabel__copy: 'Copiați toate',
      actionLabel__download: 'Descarcă .txt',
      actionLabel__print: 'Imprimare',
      infoText1: 'Codurile de rezervă vor fi activate pentru acest cont.',
      infoText2:
        'Păstrați codurile de rezervă în secret și păstrați-le în siguranță. Puteți regenera codurile de rezervă dacă bănuiți că acestea au fost compromise.',
      subtitle__codelist: 'Păstrați-le în siguranță și păstrați-le în secret.',
      successMessage:
        'Codurile de rezervă sunt acum activate. Puteți utiliza unul dintre acestea pentru a vă conecta la contul dvs., dacă pierdeți accesul la dispozitivul de autentificare. Fiecare cod poate fi utilizat o singură dată.',
      successSubtitle:
        'Puteți utiliza unul dintre acestea pentru a vă conecta la contul dvs., dacă pierdeți accesul la dispozitivul de autentificare.',
      title: 'Adăugați verificarea codului de rezervă',
      title__codelist: 'Coduri de rezervă',
    },
    connectedAccountPage: {
      formHint: 'Selectați un furnizor pentru a vă conecta contul.',
      formHint__noAccounts: 'Nu există furnizori de conturi externe disponibili.',
      removeResource: {
        messageLine1: '{{identifier}} va fi eliminat din acest cont.',
        messageLine2:
          'Nu veți mai putea utiliza acest cont conectat, iar toate funcțiile dependente nu vor mai funcționa.',
        successMessage: '{{connectedAccount}} a fost eliminat din contul dumneavoastră.',
        title: 'Înlăturați contul conectat',
      },
      socialButtonsBlockButton: 'Conectează contul {{provider|titleize}}',
      successMessage: 'Furnizorul a fost adăugat în contul dvs',
      title: 'Adăugați un cont conectat',
    },
    deletePage: {
      actionDescription: 'Introduceți Delete account (Ștergeți contul) mai jos pentru a continua.',
      confirm: 'Ștergeți contul',
      messageLine1: 'Sunteți sigur că doriți să vă ștergeți contul?',
      messageLine2: 'Această acțiune este permanentă și ireversibilă.',
      title: 'Ștergeți contul',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Un e-mail conținând un cod de verificare va fi trimis la această adresă de e-mail.',
        formSubtitle: 'Introduceți codul de verificare trimis la {{identifier}}',
        formTitle: 'Cod de verificare',
        resendButton: 'Nu ați primit un cod? Trimiteți din nou',
        successMessage: 'E-mailul {{identifier}} a fost adăugat în contul dvs.',
      },
      emailLink: {
        formHint: 'La această adresă de e-mail va fi trimis un e-mail conținând un link de verificare.',
        formSubtitle: 'Faceți clic pe link-ul de verificare din e-mailul trimis către {{identifier}}',
        formTitle: 'Link de verificare',
        resendButton: 'Nu ați primit un link? Trimiteți din nou',
        successMessage: 'E-mailul {{identifier}} a fost adăugat în contul dvs.',
      },
      enterpriseSsoLink: {
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      removeResource: {
        messageLine1: '{{identifier}} va fi eliminat din acest cont.',
        messageLine2: 'Nu veți mai putea să vă conectați folosind această adresă de e-mail.',
        successMessage: '{{emailAddress}} a fost eliminat din contul dvs.',
        title: 'Eliminați adresa de e-mail',
      },
      title: 'Adăugați adresa de e-mail',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Continuați',
    formButtonPrimary__finish: 'Finalizare',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Anulează',
    mfaPage: {
      formHint: 'Selectați o metodă de adăugat.',
      title: 'Adăugați verificarea în doi pași',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Adăugați un număr de telefon',
      removeResource: {
        messageLine1: '{{identifier}} nu va mai primi coduri de verificare atunci când se conectează.',
        messageLine2:
          'Este posibil ca contul dumneavoastră să nu fie la fel de sigur. Sunteți sigur că doriți să continuați?',
        successMessage: 'Verificarea în doi pași a codului SMS a fost eliminată pentru {{mfaPhoneCode}}',
        title: 'Eliminarea verificării în două etape',
      },
      subtitle__availablePhoneNumbers:
        'Selectați un număr de telefon pentru a vă înregistra pentru verificarea în doi pași a codului SMS.',
      subtitle__unavailablePhoneNumbers:
        'Nu există numere de telefon disponibile pentru a vă înregistra pentru verificarea în doi pași prin cod SMS.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Adăugați verificarea codului SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Scanați în schimb codul QR',
        buttonUnableToScan__nonPrimary: 'Nu puteți scana codul QR?',
        infoText__ableToScan:
          'Configurați o nouă metodă de conectare în aplicația de autentificare și scanați următorul cod QR pentru a o lega de contul dvs.',
        infoText__unableToScan:
          'Configurați o nouă metodă de conectare în autentificatorul dvs. și introduceți cheia furnizată mai jos.',
        inputLabel__unableToScan1:
          'Asigurați-vă că este activată opțiunea Parole pe bază de timp sau Parole unice, apoi finalizați conectarea contului dvs.',
        inputLabel__unableToScan2:
          'Alternativ, dacă autentificatorul dvs. acceptă URI-urile TOTP, puteți copia și URI-ul complet.',
      },
      removeResource: {
        messageLine1: 'Codurile de verificare de la acest autentificator nu vor mai fi necesare la autentificare.',
        messageLine2:
          'Este posibil ca contul dumneavoastră să nu fie la fel de sigur. Sunteți sigur că doriți să continuați?',
        successMessage: 'Verificarea în doi pași prin intermediul aplicației Authenticator a fost eliminată.',
        title: 'Eliminarea verificării în două etape',
      },
      successMessage:
        'Verificarea în doi pași este acum activată. Când vă conectați, va trebui să introduceți un cod de verificare de la acest autentificator ca pas suplimentar.',
      title: 'Adăugați aplicația de autentificare',
      verifySubtitle: 'Introduceți codul de verificare generat de autentificatorul dvs',
      verifyTitle: 'Cod de verificare',
    },
    mobileButton__menu: 'Meniu',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: undefined,
        title: undefined,
      },
      subtitle__rename: undefined,
      title__rename: undefined,
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'It is recommended to sign out of all other devices which may have used your old password.',
      readonly:
        'În prezent, parola dvs. nu poate fi modificată, deoarece vă puteți conecta numai prin intermediul conexiunii întreprinderii.',
      successMessage__set: 'Parola dvs. a fost setată.',
      successMessage__signOutOfOtherSessions: 'Toate celelalte dispozitive au fost deconectate.',
      successMessage__update: 'Parola dvs. a fost actualizată.',
      title__set: 'Setați parola',
      title__update: 'Modificați parola',
    },
    phoneNumberPage: {
      infoText: 'La acest număr de telefon va fi trimis un mesaj text conținând un link de verificare.',
      removeResource: {
        messageLine1: '{{identifier}} va fi eliminat din acest cont.',
        messageLine2: 'Nu veți mai putea să vă conectați folosind acest număr de telefon.',
        successMessage: '{{phoneNumber}} a fost eliminat din contul dvs.',
        title: 'Eliminați numărul de telefon',
      },
      successMessage: '{{identifier}} a fost adăugat în contul dumneavoastră.',
      title: 'Adăugați numărul de telefon',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Încărcați o imagine JPG, PNG, GIF sau WEBP mai mică de 10 MB',
      imageFormDestructiveActionSubtitle: 'Eliminați imaginea',
      imageFormSubtitle: 'Încărcați imaginea',
      imageFormTitle: 'Imagine de profil',
      readonly:
        'Informațiile din profilul dvs. au fost furnizate de către conexiunea cu compania și nu pot fi modificate.',
      successMessage: 'Profilul dvs. a fost actualizat.',
      title: 'Actualizarea profilului',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Deconectați-vă de la dispozitiv',
        title: 'Dispozitive active',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Încearcă din nou',
        actionLabel__reauthorize: 'Autorizați acum',
        destructiveActionTitle: 'Eliminați',
        primaryButton: 'Conectați-vă contul',
        subtitle__disconnected: undefined,
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Conturi conectate',
      },
      dangerSection: {
        deleteAccountButton: 'Ștergeți contul',
        title: 'Pericol',
      },
      emailAddressesSection: {
        destructiveAction: 'Eliminați adresa de e-mail',
        detailsAction__nonPrimary: 'Setați ca principală',
        detailsAction__primary: 'Verificare completă',
        detailsAction__unverified: 'Verifică adresa de e-mail',
        primaryButton: 'Adăugați o adresă de e-mail',
        title: 'Adrese de e-mail',
      },
      enterpriseAccountsSection: {
        title: 'Conturi de companie',
      },
      headerTitle__account: 'Cont',
      headerTitle__security: 'Securitate',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Regenerarea codurilor',
          headerTitle: 'Coduri de rezervă',
          subtitle__regenerate:
            'Obțineți un set nou de coduri de rezervă securizate. Codurile de rezervă anterioare vor fi șterse și nu vor mai putea fi utilizate.',
          title__regenerate: 'Regenerarea codurilor de rezervă',
        },
        phoneCode: {
          actionLabel__setDefault: 'Setat ca implicit',
          destructiveActionLabel: 'Eliminați numărul de telefon',
        },
        primaryButton: 'Adăugați verificarea în doi pași',
        title: 'Verificare în două etape',
        totp: {
          destructiveActionTitle: 'Eliminați',
          headerTitle: 'Aplicația Authenticator',
        },
      },
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Setați parola',
        primaryButton__updatePassword: 'Modificați parola',
        title: 'Parola',
      },
      phoneNumbersSection: {
        destructiveAction: 'Eliminați numărul de telefon',
        detailsAction__nonPrimary: 'Setați ca principal',
        detailsAction__primary: 'Verificare completă',
        detailsAction__unverified: 'Verificați numărul de telefon',
        primaryButton: 'Adăugați un număr de telefon',
        title: 'Numere de telefon',
      },
      profileSection: {
        primaryButton: undefined,
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Setați numele de utilizator',
        primaryButton__updateUsername: 'Schimbă numele de utilizator',
        title: 'Nume utilizator',
      },
      web3WalletsSection: {
        destructiveAction: 'Scoateți portofelul',
        primaryButton: 'Portofele Web3',
        title: 'Portofele Web3',
      },
    },
    usernamePage: {
      successMessage: 'Numele dvs. de utilizator a fost actualizat.',
      title__set: 'Actualizați numele de utilizator',
      title__update: 'Actualizați numele de utilizator',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} va fi eliminat din acest cont.',
        messageLine2: 'Nu veți mai putea să vă conectați folosind acest portofel web3.',
        successMessage: '{{web3Wallet}} a fost eliminat din contul dumneavoastră.',
        title: 'Îndepărtați portofelul web3',
      },
      subtitle__availableWallets: 'Selectați un portofel web3 pentru a vă conecta la cont.',
      subtitle__unavailableWallets: 'Nu există portofele web3 disponibile.',
      successMessage: 'Portofelul a fost adăugat în contul dumneavoastră.',
      title: 'Adăugați portofelul web3',
      web3WalletButtonsBlockButton: undefined,
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
