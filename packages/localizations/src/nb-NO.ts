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

export const nbNO: LocalizationResource = {
  locale: 'nb-NO',
  backButton: 'Tilbake',
  badge__default: 'Standard',
  badge__otherImpersonatorDevice: 'Annen imitators enhet',
  badge__primary: 'Primær',
  badge__requiresAction: 'Krever handling',
  badge__thisDevice: 'Denne enheten',
  badge__unverified: 'Ikke verifisert',
  badge__userDevice: 'Brukerens enhet',
  badge__you: 'Du',
  createOrganization: {
    formButtonSubmit: 'Opprett organisasjon',
    invitePage: {
      formButtonReset: 'Hopp over',
    },
    title: 'Opprett organisasjon',
  },
  dates: {
    lastDay: "I går kl. {{ date | timeString('nb-NO') }}",
    next6Days: "{{ date | weekday('nb-NO','long') }} kl. {{ date | timeString('nb-NO') }}",
    nextDay: "I morgen kl. {{ date | timeString('nb-NO') }}",
    numeric: "{{ date | numeric('nb-NO') }}",
    previous6Days: "Sist {{ date | weekday('nb-NO','long') }} kl. {{ date | timeString('nb-NO') }}",
    sameDay: "I dag kl. {{ date | timeString('nb-NO') }}",
  },
  dividerText: 'eller',
  footerActionLink__useAnotherMethod: 'Bruk en annen metode',
  footerPageLink__help: 'Hjelp',
  footerPageLink__privacy: 'Personvern',
  footerPageLink__terms: 'Vilkår',
  formButtonPrimary: 'Fortsett',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Glemt passord?',
  formFieldError__matchingPasswords: 'Passordene stemmer overens.',
  formFieldError__notMatchingPasswords: 'Passordene stemmer ikke overens.',
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'Valgfritt',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'Skriv inn eller lim inn én eller flere e-postadresser, separert med mellomrom eller komma',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__organizationDomain: '',
  formFieldInputPlaceholder__organizationDomainEmailAddress: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldInputPlaceholder__organizationSlug: '',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldLabel__automaticInvitations: 'Enable automatic invitations for this domain',
  formFieldLabel__backupCode: 'Sikkerhetskode',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Bekreft passord',
  formFieldLabel__currentPassword: 'Nåværende passord',
  formFieldLabel__emailAddress: 'E-postadresse',
  formFieldLabel__emailAddress_username: 'E-postadresse eller brukernavn',
  formFieldLabel__emailAddresses: 'E-postadresser',
  formFieldLabel__firstName: 'Fornavn',
  formFieldLabel__lastName: 'Etternavn',
  formFieldLabel__newPassword: 'Nytt passord',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Organisasjonsnavn',
  formFieldLabel__organizationSlug: 'Slug URL',
  formFieldLabel__password: 'Passord',
  formFieldLabel__phoneNumber: 'Telefonnummer',
  formFieldLabel__role: 'Rolle',
  formFieldLabel__signOutOfOtherSessions: 'Logg ut fra alle andre enheter',
  formFieldLabel__username: 'Brukernavn',
  impersonationFab: {
    action__signOut: 'Logg ut',
    title: 'Logget inn som {{identifier}}',
  },
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Medlem',
  membershipRole__guestMember: 'Gjest',
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
    badge__automaticInvitation: 'Automatic invitations',
    badge__automaticSuggestion: 'Automatic suggestions',
    badge__manualInvitation: 'No automatic enrollment',
    badge__unverified: 'Unverified',
    createDomainPage: {
      subtitle:
        'Add the domain to verify. Users with email addresses at this domain can join the organization automatically or request to join.',
      title: 'Add domain',
    },
    invitePage: {
      detailsTitle__inviteFailed: 'Invitasjonene kunne ikke sendes. Fiks følgende og prøv igjen:',
      formButtonPrimary__continue: 'Send invitasjoner',
      selectDropdown__role: 'Select role',
      subtitle: 'Inviter nye medlemmer til denne organisasjonen',
      successMessage: 'Invitasjoner er sendt',
      title: 'Inviter medlemmer',
    },
    membersPage: {
      action__invite: 'Inviter',
      activeMembersTab: {
        menuAction__remove: 'Fjern medlem',
        tableHeader__actions: '',
        tableHeader__joined: 'Ble med',
        tableHeader__role: 'Rolle',
        tableHeader__user: 'Bruker',
      },
      detailsTitle__emptyRow: 'Ingen medlemmer å vise',
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
        menuAction__revoke: 'Tilbakekall invitasjon',
        tableHeader__invited: 'Invitert',
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
      description: 'Manage your organization.',
      general: 'General',
      members: 'Members',
      title: 'Organization',
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
            'Er du sikker på at du vil forlate denne organisasjonen? Du vil miste tilgangen til denne organisasjonen og dens applikasjoner.',
          messageLine2: 'Handlingen er permanent og kan ikke reverseres.',
          successMessage: 'Du har forlatt organisasjonen.',
          title: 'Forlat organisasjonen',
        },
        title: 'Fare',
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
      successMessage: 'Organisasjonen er oppdatert.',
      title: 'Organisasjonsprofil',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Medlemmer',
      profileSection: {
        primaryButton: 'Edit profile',
        title: 'Organization Profile',
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
    action__createOrganization: 'Opprett organisasjon',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Administrer organisasjon',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Ingen organisasjon valgt',
    personalWorkspace: 'Personlig arbeidsområde',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Neste',
  paginationButton__previous: 'Forrige',
  paginationRowText__displaying: 'Viser',
  paginationRowText__of: 'av',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Få hjelp',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Bruk en sikkerhetskopi-kode',
      blockButton__emailCode: 'Send e-postkode til {{identifier}}',
      blockButton__emailLink: 'Send lenke til {{identifier}}',
      blockButton__password: 'Logg inn med passordet ditt',
      blockButton__phoneCode: 'Send SMS-kode til {{identifier}}',
      blockButton__totp: 'Bruk autentiseringsappen din',
      getHelp: {
        blockButton__emailSupport: 'Kontakt kundestøtte via e-post',
        content:
          'Hvis du har problemer med å logge inn på kontoen din, kan du sende oss en e-post, og vi vil jobbe med deg for å gjenopprette tilgangen så snart som mulig.',
        title: 'Få hjelp',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Bruk en annen metode',
    },
    backupCodeMfa: {
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Skriv inn en sikkerhetskopi-kode',
    },
    emailCode: {
      formTitle: 'Verifiseringskode',
      resendButton: 'Send kode på nytt',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Sjekk e-posten din',
    },
    emailLink: {
      expired: {
        subtitle: 'Gå tilbake til den opprinnelige fanen for å fortsette.',
        title: 'Denne verifiseringslenken er utløpt',
      },
      failed: {
        subtitle: 'Gå tilbake til den opprinnelige fanen for å fortsette.',
        title: 'Denne verifiseringslenken er ugyldig',
      },
      formSubtitle: 'Bruk verifiseringslenken som er sendt til e-postadressen din',
      formTitle: 'Verifiseringslenke',
      loading: {
        subtitle: 'Du blir omdirigert snart',
        title: 'Logger inn...',
      },
      resendButton: 'Send lenke på nytt',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Sjekk e-posten din',
      unusedTab: {
        title: 'Du kan lukke denne fanen',
      },
      verified: {
        subtitle: 'Du blir omdirigert snart',
        title: 'Innloggingen var vellykket',
      },
      verifiedSwitchTab: {
        subtitle: 'Gå tilbake til den opprinnelige fanen for å fortsette',
        subtitleNewTab: 'Gå tilbake til den nyåpnede fanen for å fortsette',
        titleNewTab: 'Logget inn på en annen fane',
      },
    },
    forgotPassword: {
      formTitle: 'Tilbakestill passord-kode',
      resendButton: 'Send kode på nytt',
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Tilbakestill passordet ditt',
      label__alternativeMethods: 'Eller logg inn med en annen metode.',
      title: 'Glemt passord?',
    },
    noAvailableMethods: {
      message: 'Kan ikke fortsette med innloggingen. Det er ingen tilgjengelige autentiseringsfaktorer.',
      subtitle: 'En feil oppstod',
      title: 'Kan ikke logge inn',
    },
    password: {
      actionLink: 'Bruk en annen metode',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Skriv inn passordet ditt',
    },
    phoneCode: {
      formTitle: 'Verifiseringskode',
      resendButton: 'Send kode på nytt',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Sjekk telefonen din',
    },
    phoneCodeMfa: {
      formTitle: 'Verifiseringskode',
      resendButton: 'Send kode på nytt',
      subtitle: '',
      title: 'Sjekk telefonen din',
    },
    resetPassword: {
      formButtonPrimary: 'Tilbakestill passordet',
      requiredMessage:
        'An account already exists with an unverified email address. Please reset your password for security.',
      successMessage: 'Passordet ditt er blitt tilbakestilt. Logger deg inn, vennligst vent et øyeblikk.',
      title: 'Tilbakestill passordet',
    },
    resetPasswordMfa: {
      detailsLabel: 'Vi må bekrefte identiteten din før vi tilbakestiller passordet ditt.',
    },
    start: {
      actionLink: 'Opprett konto',
      actionLink__use_email: 'Bruk e-post',
      actionLink__use_email_username: 'Bruk e-post eller brukernavn',
      actionLink__use_phone: 'Bruk telefon',
      actionLink__use_username: 'Bruk brukernavn',
      actionText: 'Ingen konto?',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Logg inn',
    },
    totpMfa: {
      formTitle: 'Verifiseringskode',
      subtitle: '',
      title: 'To-trinns verifisering',
    },
  },
  signInEnterPasswordTitle: 'Skriv inn passordet ditt',
  signUp: {
    continue: {
      actionLink: 'Logg inn',
      actionText: 'Har du allerede en konto?',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Fyll ut manglende felt',
    },
    emailCode: {
      formSubtitle: 'Skriv inn verifiseringskoden som er sendt til e-postadressen din',
      formTitle: 'Verifiseringskode',
      resendButton: 'Send kode på nytt',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Verifiser e-posten din',
    },
    emailLink: {
      formSubtitle: 'Bruk verifiseringslenken som er sendt til e-postadressen din',
      formTitle: 'Verifiseringslenke',
      loading: {
        title: 'Registrerer deg...',
      },
      resendButton: 'Send lenke på nytt',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Verifiser e-posten din',
      verified: {
        title: 'Registreringen var vellykket',
      },
      verifiedSwitchTab: {
        subtitle: 'Gå tilbake til den nylig åpnede fanen for å fortsette',
        subtitleNewTab: 'Gå tilbake til forrige fane for å fortsette',
        title: 'E-posten ble verifisert',
      },
    },
    phoneCode: {
      formSubtitle: 'Skriv inn verifiseringskoden som er sendt til telefonnummeret ditt',
      formTitle: 'Verifiseringskode',
      resendButton: 'Send kode på nytt',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Verifiser telefonen din',
    },
    start: {
      actionLink: 'Logg inn',
      actionText: 'Har du allerede en konto?',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Opprett kontoen din',
    },
  },
  socialButtonsBlockButton: 'Fortsett med {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Registreringen mislyktes på grunn av mislykkede sikkerhetsvalideringer. Vennligst oppdater siden og prøv igjen, eller ta kontakt med brukerstøtte for mer hjelp.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: '',
    form_identifier_exists: '',
    form_identifier_not_found: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'E-postadressen må være en gyldig e-postadresse',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'Passordet ditt er ikke sterkt nok.',
    form_password_pwned:
      'Dette passordet er funnet som en del av et datainnbrudd og kan ikke brukes. Vennligst prøv et annet passord.',
    form_password_size_in_bytes_exceeded:
      'Passordet ditt har overskredet maksimalt antall byte tillatt. Vennligst forkort det eller fjern noen spesialtegn.',
    form_password_validation_failed: 'Feil passord',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: 'You cannot delete your last identification.',
    not_allowed_access: '',
    passwordComplexity: {
      maximumLength: 'mindre enn {{length}} tegn',
      minimumLength: '{{length}} eller flere tegn',
      requireLowercase: 'en liten bokstav',
      requireNumbers: 'et tall',
      requireSpecialCharacter: 'et spesialtegn',
      requireUppercase: 'en stor bokstav',
      sentencePrefix: 'Passordet ditt må inneholde',
    },
    phone_number_exists: 'This phone number is taken. Please try another.',
    zxcvbn: {
      couldBeStronger: 'Passordet ditt fungerer, men det kan være sterkere. Prøv å legge til flere tegn.',
      goodPassword: 'Godt jobbet. Dette er et utmerket passord.',
      notEnough: 'Passordet ditt er ikke sterkt nok.',
      suggestions: {
        allUppercase: 'Stor bokstav på noen, men ikke alle bokstaver.',
        anotherWord: 'Legg til flere ord som er mindre vanlige.',
        associatedYears: 'Unngå år som er knyttet til deg.',
        capitalization: 'Sett stor bokstav på mer enn den første bokstaven.',
        dates: 'Unngå datoer og år som er knyttet til deg.',
        l33t: "Unngå forutsigbare bokstavbytter som '@' for 'a'.",
        longerKeyboardPattern: 'Bruk lengre tastaturmønstre og endre skrivretning flere ganger.',
        noNeed: 'Du kan lage sterke passord uten å bruke symboler, tall eller store bokstaver.',
        pwned: 'Hvis du bruker dette passordet andre steder, bør du endre det.',
        recentYears: 'Unngå nylige år.',
        repeated: 'Unngå gjentatte ord og tegn.',
        reverseWords: 'Unngå omvendte stavelser av vanlige ord.',
        sequences: 'Unngå vanlige tegnsekvenser.',
        useWords: 'Bruk flere ord, men unngå vanlige fraser.',
      },
      warnings: {
        common: 'Dette er et vanlig brukt passord.',
        commonNames: 'Vanlige navn og etternavn er lett å gjette.',
        dates: 'Datoer er lett å gjette.',
        extendedRepeat: 'Gjentatte tegnmønstre som "abcabcabc" er lett å gjette.',
        keyPattern: 'Korte tastaturmønstre er lett å gjette.',
        namesByThemselves: 'Enkelt navn eller etternavn er lett å gjette.',
        pwned: 'Passordet ditt ble eksponert i et datainnbrudd på internett.',
        recentYears: 'Nylige år er lett å gjette.',
        sequences: 'Vanlige tegnsekvenser som "abc" er lett å gjette.',
        similarToCommon: 'Dette ligner på et vanlig brukt passord.',
        simpleRepeat: 'Gjentatte tegn som "aaa" er lett å gjette.',
        straightRow: 'Rette rader med tastene på tastaturet ditt er lett å gjette.',
        topHundred: 'Dette er et ofte brukt passord.',
        topTen: 'Dette er et mye brukt passord.',
        userInputs: 'Det bør ikke være personlige eller sidetilknyttede data.',
        wordByItself: 'Enkeltord er lett å gjette.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Legg til konto',
    action__manageAccount: 'Administrer konto',
    action__signOut: 'Logg ut',
    action__signOutAll: 'Logg ut av alle kontoer',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Kopiert!',
      actionLabel__copy: 'Kopier alle',
      actionLabel__download: 'Last ned .txt',
      actionLabel__print: 'Skriv ut',
      infoText1: 'Sikkerhetskoder vil bli aktivert for denne kontoen.',
      infoText2:
        'Hold sikkerhetskodene hemmelige og oppbevar dem sikkert. Du kan generere nye sikkerhetskoder hvis du mistenker at de er kompromittert.',
      subtitle__codelist: 'Oppbevar dem sikkert og hold dem hemmelige.',
      successMessage:
        'Sikkerhetskoder er nå aktivert. Du kan bruke en av disse til å logge inn på kontoen din hvis du mister tilgangen til autentiseringsenheten. Hver kode kan bare brukes én gang.',
      successSubtitle:
        'Du kan bruke en av disse til å logge inn på kontoen din hvis du mister tilgangen til autentiseringsenheten.',
      title: 'Legg til sikkerhetskopieringskodeverifisering',
      title__codelist: 'Sikkerhetskoder',
    },
    connectedAccountPage: {
      formHint: 'Velg en tilbyder for å koble til kontoen din.',
      formHint__noAccounts: 'Det er ingen tilgjengelige eksterne konto-tilbydere.',
      removeResource: {
        messageLine1: '{{identifier}} vil bli fjernet fra denne kontoen.',
        messageLine2:
          'Du vil ikke lenger kunne bruke denne tilknyttede kontoen, og eventuelle avhengige funksjoner vil ikke lenger fungere.',
        successMessage: '{{connectedAccount}} har blitt fjernet fra kontoen din.',
        title: 'Fjern tilknyttet konto',
      },
      socialButtonsBlockButton: 'Koble til {{provider|titleize}}-konto',
      successMessage: 'Tilbyderen har blitt lagt til kontoen din.',
      title: 'Legg til tilknyttet konto',
    },
    deletePage: {
      actionDescription: 'Type "Delete account" below to continue.',
      confirm: 'Slett konto',
      messageLine1: 'Er du sikker på at du vil slette kontoen din?',
      messageLine2: 'Denne handlingen er permanent og kan ikke reverseres.',
      title: 'Slett konto',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'En e-post med en verifiseringskode vil bli sendt til denne e-postadressen.',
        formSubtitle: 'Skriv inn verifiseringskoden som er sendt til {{identifier}}',
        formTitle: 'Verifiseringskode',
        resendButton: 'Send kode på nytt',
        successMessage: 'E-posten {{identifier}} har blitt lagt til kontoen din.',
      },
      emailLink: {
        formHint: 'En e-post med en verifiseringslenke vil bli sendt til denne e-postadressen.',
        formSubtitle: 'Klikk på verifiseringslenken i e-posten sendt til {{identifier}}',
        formTitle: 'Verifiseringslenke',
        resendButton: 'Send lenke på nytt',
        successMessage: 'E-posten {{identifier}} har blitt lagt til kontoen din.',
      },
      removeResource: {
        messageLine1: '{{identifier}} vil bli fjernet fra denne kontoen.',
        messageLine2: 'Du vil ikke lenger kunne logge inn med denne e-postadressen.',
        successMessage: '{{emailAddress}} har blitt fjernet fra kontoen din.',
        title: 'Fjern e-postadresse',
      },
      title: 'Legg til e-postadresse',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Fortsett',
    formButtonPrimary__finish: 'Fullfør',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'Avbryt',
    mfaPage: {
      formHint: 'Velg en metode for å legge til.',
      title: 'Legg til to-trinns verifisering',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Legg til et telefonnummer',
      removeResource: {
        messageLine1: '{{identifier}} vil ikke lenger motta verifiseringskoder ved pålogging.',
        messageLine2: 'Kontoen din kan bli mindre sikker. Er du sikker på at du vil fortsette?',
        successMessage: 'SMS-kode to-trinns verifisering er fjernet for {{mfaPhoneCode}}',
        title: 'Fjern to-trinns verifisering',
      },
      subtitle__availablePhoneNumbers:
        'Velg et telefonnummer for å registrere deg for SMS-kode to-trinns verifisering.',
      subtitle__unavailablePhoneNumbers:
        'Det er ingen tilgjengelige telefonnummer å registrere seg for SMS-kode to-trinns verifisering.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'Legg til SMS-kodeverifisering',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Skan QR-kode i stedet',
        buttonUnableToScan__nonPrimary: 'Kan ikke skanne QR-kode?',
        infoText__ableToScan:
          'Sett opp en ny innloggingsmetode i autentiseringsappen din og skann følgende QR-kode for å koble den til kontoen din.',
        infoText__unableToScan:
          'Sett opp en ny innloggingsmetode i autentiseringsappen og skriv inn nøkkelen som er oppgitt nedenfor.',
        inputLabel__unableToScan1:
          'Sørg for at tidsbaserte eller engangspassord er aktivert, og fullfør deretter koblingen av kontoen din.',
        inputLabel__unableToScan2:
          'Alternativt, hvis autentiseringsappen din støtter TOTP URI-er, kan du også kopiere hele URI-en.',
      },
      removeResource: {
        messageLine1: 'Verifiseringskoder fra denne autentiseringsappen vil ikke lenger være påkrevd ved pålogging.',
        messageLine2: 'Kontoen din kan bli mindre sikker. Er du sikker på at du vil fortsette?',
        successMessage: 'To-trinns verifisering via autentiseringsappen er fjernet.',
        title: 'Fjern to-trinns verifisering',
      },
      successMessage:
        'To-trinns verifisering er nå aktivert. Når du logger inn, må du angi en verifiseringskode fra denne autentiseringsappen som et ekstra trinn.',
      title: 'Legg til autentiseringsapp',
      verifySubtitle: 'Skriv inn verifiseringskoden generert av autentiseringsappen din',
      verifyTitle: 'Verifiseringskode',
    },
    mobileButton__menu: 'Meny',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passwordPage: {
      changePasswordSuccessMessage: 'Passordet ditt har blitt oppdatert.',
      changePasswordTitle: 'Endre passord',
      checkboxInfoText__signOutOfOtherSessions:
        'It is recommended to sign out of all other devices which may have used your old password.',
      readonly: 'Passordet ditt kan for øyeblikket ikke endres fordi du kun kan logge inn via bedriftstilkoblingen.',
      sessionsSignedOutSuccessMessage: 'Alle andre enheter har blitt logget ut.',
      successMessage: 'Passordet ditt er satt.',
      title: 'Sett passord',
    },
    phoneNumberPage: {
      infoText: 'En tekstmelding med en verifiseringslenke vil bli sendt til dette telefonnummeret.',
      removeResource: {
        messageLine1: '{{identifier}} vil bli fjernet fra denne kontoen.',
        messageLine2: 'Du vil ikke lenger kunne logge inn med dette telefonnummeret.',
        successMessage: '{{phoneNumber}} har blitt fjernet fra kontoen din.',
        title: 'Fjern telefonnummer',
      },
      successMessage: '{{identifier}} har blitt lagt til kontoen din.',
      title: 'Legg til telefonnummer',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Last opp et JPG, PNG, GIF eller WEBP-bilde som er mindre enn 10 MB',
      imageFormDestructiveActionSubtitle: 'Fjern bilde',
      imageFormSubtitle: 'Last opp bilde',
      imageFormTitle: 'Profilbilde',
      readonly: 'Informasjonen om profilen din er levert av bedriftstilkoblingen og kan ikke redigeres.',
      successMessage: 'Profilen din har blitt oppdatert.',
      title: 'Oppdater profil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Logg ut fra enhet',
        title: 'Aktive enheter',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Prøv på nytt',
        actionLabel__reauthorize: 'Autoriser nå',
        destructiveActionTitle: 'Fjern',
        primaryButton: 'Koble til konto',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Tilkoblede kontoer',
      },
      dangerSection: {
        deleteAccountButton: 'Slett konto',
        title: 'Fare',
      },
      emailAddressesSection: {
        destructiveAction: 'Fjern e-postadresse',
        detailsAction__nonPrimary: 'Angi som primær',
        detailsAction__primary: 'Fullfør verifisering',
        detailsAction__unverified: 'Fullfør verifisering',
        primaryButton: 'Legg til en e-postadresse',
        title: 'E-postadresser',
      },
      enterpriseAccountsSection: {
        title: 'Bedriftskontoer',
      },
      headerTitle__account: 'Konto',
      headerTitle__security: 'Sikkerhet',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Generer koder på nytt',
          headerTitle: 'Sikkerhetskoder',
          subtitle__regenerate:
            'Få en ny serie med sikre sikkerhetskoder. Tidligere sikkerhetskoder vil bli slettet og kan ikke brukes.',
          title__regenerate: 'Generer nye sikkerhetskoder',
        },
        phoneCode: {
          actionLabel__setDefault: 'Angi som standard',
          destructiveActionLabel: 'Fjern telefonnummer',
        },
        primaryButton: 'Legg til to-trinns verifisering',
        title: 'To-trinns verifisering',
        totp: {
          destructiveActionTitle: 'Fjern',
          headerTitle: 'Autentiseringsapplikasjon',
        },
      },
      passwordSection: {
        primaryButton__changePassword: 'Endre passord',
        primaryButton__setPassword: 'Opprett passord',
        title: 'Passord',
      },
      phoneNumbersSection: {
        destructiveAction: 'Fjern telefonnummer',
        detailsAction__nonPrimary: 'Angi som primær',
        detailsAction__primary: 'Fullfør verifisering',
        detailsAction__unverified: 'Fullfør verifisering',
        primaryButton: 'Legg til et telefonnummer',
        title: 'Telefonnumre',
      },
      profileSection: {
        primaryButton: 'Edit Profile',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__changeUsername: 'Endre brukernavn',
        primaryButton__setUsername: 'Angi brukernavn',
        title: 'Brukernavn',
      },
      web3WalletsSection: {
        destructiveAction: 'Fjern lommebok',
        primaryButton: 'Web3-lommebøker',
        title: 'Web3-lommebøker',
      },
    },
    usernamePage: {
      successMessage: 'Brukernavnet ditt har blitt oppdatert.',
      title: 'Oppdater brukernavn',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} vil bli fjernet fra denne kontoen.',
        messageLine2: 'Du vil ikke lenger kunne logge inn med denne web3-lommeboken.',
        successMessage: '{{web3Wallet}} har blitt fjernet fra kontoen din.',
        title: 'Fjern web3-lommebok',
      },
      subtitle__availableWallets: 'Velg en web3-lommebok for å koble til kontoen din.',
      subtitle__unavailableWallets: 'Det er ingen tilgjengelige web3-lommebøker.',
      successMessage: 'Lommeboken har blitt lagt til kontoen din.',
      title: 'Legg til web3-lommebok',
    },
  },
} as const;
