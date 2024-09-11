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
  __experimental_userVerification: {
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
  formButtonPrimary__verify: 'Verifiser',
  formFieldAction__forgotPassword: 'Glemt passord?',
  formFieldError__matchingPasswords: 'Passordene stemmer overens.',
  formFieldError__notMatchingPasswords: 'Passordene stemmer ikke overens.',
  formFieldError__verificationLinkExpired: 'Verifikasjonslenken har utløpt. Vennligst be om en ny lenke.',
  formFieldHintText__optional: 'Valgfritt',
  formFieldHintText__slug: 'En slug er en menneskelesbar ID som må være unik. Den brukes ofte i URL-er.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Slett bruker',
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
  formFieldLabel__automaticInvitations: 'Skru på automatiske invitasjoner for dette domenet',
  formFieldLabel__backupCode: 'Sikkerhetskode',
  formFieldLabel__confirmDeletion: 'Bekreftelse',
  formFieldLabel__confirmPassword: 'Bekreft passord',
  formFieldLabel__currentPassword: 'Nåværende passord',
  formFieldLabel__emailAddress: 'E-postadresse',
  formFieldLabel__emailAddress_username: 'E-postadresse eller brukernavn',
  formFieldLabel__emailAddresses: 'E-postadresser',
  formFieldLabel__firstName: 'Fornavn',
  formFieldLabel__lastName: 'Etternavn',
  formFieldLabel__newPassword: 'Nytt passord',
  formFieldLabel__organizationDomain: 'Domene',
  formFieldLabel__organizationDomainDeletePending: 'Slett ventende invitasjoner og forslag',
  formFieldLabel__organizationDomainEmailAddress: 'Verifikasjon e-postadresse',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Oppgi en e-postadresse under dette domenet for å motta en kode og verifisere domenet.',
  formFieldLabel__organizationName: 'Organisasjonsnavn',
  formFieldLabel__organizationSlug: 'Slug URL',
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Passord',
  formFieldLabel__phoneNumber: 'Telefonnummer',
  formFieldLabel__role: 'Rolle',
  formFieldLabel__signOutOfOtherSessions: 'Logg ut fra alle andre enheter',
  formFieldLabel__username: 'Brukernavn',
  impersonationFab: {
    action__signOut: 'Logg ut',
    title: 'Logget inn som {{identifier}}',
  },
  maintenanceMode: undefined,
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Medlem',
  membershipRole__guestMember: 'Gjest',
  organizationList: {
    action__createOrganization: 'Lag organisasjon',
    action__invitationAccept: 'Bli med',
    action__suggestionsAccept: 'Spør om å bli med',
    createOrganization: 'Lag Organisasjon',
    invitationAcceptedLabel: 'Blitt med',
    subtitle: 'for å fortsette til {{applicationName}}',
    suggestionsAcceptedLabel: 'Venter på godkjenning',
    title: 'Velg en bruker',
    titleWithoutPersonal: 'Velg en organiasjon',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Automatisk invitasjon',
    badge__automaticSuggestion: 'Automatisk forslag',
    badge__manualInvitation: 'Ingen automatisk registrering',
    badge__unverified: 'Uverifisert',
    createDomainPage: {
      subtitle:
        'Legg til domenet som skal verifiseres. Brukere med e-postadresser på dette domenet kan automatisk bli med i organisasjonen eller be om å få bli med.',
      title: 'Legg til domene',
    },
    invitePage: {
      detailsTitle__inviteFailed: 'Invitasjonene kunne ikke sendes. Fiks følgende og prøv igjen:',
      formButtonPrimary__continue: 'Send invitasjoner',
      selectDropdown__role: 'Velg rolle',
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
            'Inviter brukere ved å koble et e-postdomene til organisasjonen din. Alle som registrerer seg med et matchende e-postdomene vil kunne bli med i organisasjonen når som helst.',
          headerTitle: 'Automatiske invitasjoner',
          primaryButton: 'Administrer verifiserte domener',
        },
        table__emptyRow: 'Ingen invitasjoner å vise',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Tilbakekall invitasjon',
        tableHeader__invited: 'Invitert',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Brukere som registrerer seg med et matchende e-postdomene, vil kunne se et forslag om å be om å bli med i organisasjonen din.',
          headerTitle: 'Automatiske forslag',
          primaryButton: 'Administrer verifiserte domener',
        },
        menuAction__approve: 'Godta',
        menuAction__reject: 'Avslå',
        tableHeader__requested: 'Tilgangsforespøsler',
        table__emptyRow: 'Ingen forsespørsler å vise',
      },
      start: {
        headerTitle__invitations: 'Invitasjoner',
        headerTitle__members: 'Medlemmer',
        headerTitle__requests: 'Forespørsler',
      },
    },
    navbar: {
      description: 'Administrer organisasjonen din.',
      general: 'Generelt',
      members: 'Medlemmer',
      title: 'Organisasjon',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Skriv "{{organizationName}}" under for å bekrefte.',
          messageLine1: 'Er du sikker på at du vil slette denne organisasjonen?',
          messageLine2: 'Denne handlingen er permanent og kan ikke reverseres.',
          successMessage: 'Du har slettet organisasjonen.',
          title: 'Slett organisasjonen',
        },
        leaveOrganization: {
          actionDescription: 'Skriv "{{organizationName}}" under for å fortsette.',
          messageLine1:
            'Er du sikker på at du vil forlate denne organisasjonen? Du vil miste tilgangen til denne organisasjonen og dens applikasjoner.',
          messageLine2: 'Denne handlingen er permanent og kan ikke reverseres.',
          successMessage: 'Du har forlatt organisasjonen.',
          title: 'Forlat organisasjonen',
        },
        title: 'Fare',
      },
      domainSection: {
        menuAction__manage: 'Administrer',
        menuAction__remove: 'Slett',
        menuAction__verify: 'Verifiser',
        primaryButton: 'Legg til domene',
        subtitle:
          'Tillat brukere å bli med i organisasjonen automatisk eller be om å bli med basert på et verifisert e-postdomene.',
        title: 'Verifiserte domener',
      },
      successMessage: 'Organisasjonen er oppdatert.',
      title: 'Organisasjonsprofil',
    },
    removeDomainPage: {
      messageLine1: 'E-postdomenet {{domain}} vil bli fjernet.',
      messageLine2: 'Brukere vil ikke kunne bli med i organisasjonen automatisk etter dette.',
      successMessage: '{{domain}} har blitt fjernet.',
      title: 'Fjern domene',
    },
    start: {
      headerTitle__general: 'Generelt',
      headerTitle__members: 'Medlemmer',
      profileSection: {
        primaryButton: '',
        title: 'Organisasjonsprofil',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Å fjerne dette domenet vil påvirke inviterte brukere.',
        removeDomainActionLabel__remove: 'Fjern domene',
        removeDomainSubtitle: 'Fjern domenet fra dine verifiserte domener',
        removeDomainTitle: 'Fjern domene',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Brukere blir automatisk invitert til å bli med i organisasjonen når de registrerer seg og kan bli med når som helst.',
        automaticInvitationOption__label: 'Automatiske invitasjoner',
        automaticSuggestionOption__description:
          'Brukere mottar et forslag om å be om å bli med, men må godkjennes av en administrator før de kan bli med i organisasjonen.',
        automaticSuggestionOption__label: 'Automatiske forslag',
        calloutInfoLabel: 'Å endre påmeldingsmodus vil kun påvirke nye brukere.',
        calloutInvitationCountLabel: 'Ventende invitasjoner sendt til brukere: {{count}}',
        calloutSuggestionCountLabel: 'Ventende forslag sendt til brukere: {{count}}',
        manualInvitationOption__description: 'Brukere kan kun bli invitert manuelt til organisasjonen.',
        manualInvitationOption__label: 'Ingen automatisk registrering',
        subtitle: 'Velg hvordan brukere fra dette domenet kan bli med i organisasjonen.',
      },
      start: {
        headerTitle__danger: 'Fare',
        headerTitle__enrollment: 'Registreringsalternativer',
      },
      subtitle: 'Domenet {{domain}} har blitt verifisert. Fortsett ved å velge registreringsmodus.',
      title: 'Oppdater {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Skriv inn verifiseringskoden som ble sendt til e-postadressen din',
      formTitle: 'Verifiseringskode',
      resendButton: 'Ikke mottatt kode? Send på nytt',
      subtitle: 'Domenet {{domainName}} må verifiseres gjennom e-post.',
      subtitleVerificationCodeScreen:
        'En verifiseringskode har blitt sendt til {{emailAddress}}. Skriv inn koden for å fortsette.',
      title: 'Verifiser domene',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Opprett organisasjon',
    action__invitationAccept: 'Bli med',
    action__manageOrganization: 'Administrer organisasjon',
    action__suggestionsAccept: 'Spør om å bli med',
    notSelected: 'Ingen organisasjon valgt',
    personalWorkspace: 'Personlig arbeidsområde',
    suggestionsAcceptedLabel: 'Venter på godkjenning',
  },
  paginationButton__next: 'Neste',
  paginationButton__previous: 'Forrige',
  paginationRowText__displaying: 'Viser',
  paginationRowText__of: 'av',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Legg til konto',
      action__signOutAll: 'Logg ut av alle kontoer',
      subtitle: 'Velg kontoen du ønsker å fortsette med.',
      title: 'Velg konto',
    },
    alternativeMethods: {
      actionLink: 'Få hjelp',
      actionText: 'Har du ingen av disse?',
      blockButton__backupCode: 'Bruk en sikkerhetskopi-kode',
      blockButton__emailCode: 'Send e-postkode til {{identifier}}',
      blockButton__emailLink: 'Send lenke til {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Logg inn med passordet ditt',
      blockButton__phoneCode: 'Send SMS-kode til {{identifier}}',
      blockButton__totp: 'Bruk autentiseringsappen din',
      getHelp: {
        blockButton__emailSupport: 'Kontakt kundestøtte via e-post',
        content:
          'Hvis du har problemer med å logge inn på kontoen din, kan du sende oss en e-post, og vi vil jobbe med deg for å gjenopprette tilgangen så snart som mulig.',
        title: 'Få hjelp',
      },
      subtitle: 'Opplever du problemer? Du kan bruke hvilken som helst av disse metodene for å logge inn.',
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
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
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
      subtitle: 'for å tilbakestille passordet ditt',
      subtitle_email: 'Først, skriv inn koden som ble sendt til e-posten din',
      subtitle_phone: 'Først, skriv inn koden som ble sendt til telefonen din',
      title: 'Tilbakestill passord',
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
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Bruk en annen metode',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Skriv inn passordet ditt',
    },
    passwordPwned: {
      title: undefined,
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
        'En konto eksisterer allerede med en uverifisert e-postadresse. Vennligst tilbakestill passordet ditt av sikkerhetshensyn.',
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
      actionLink__use_passkey: undefined,
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
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
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
      actionLink__use_email: undefined,
      actionLink__use_phone: undefined,
      actionText: 'Har du allerede en konto?',
      subtitle: 'for å fortsette til {{applicationName}}',
      title: 'Opprett kontoen din',
    },
  },
  socialButtonsBlockButton: 'Fortsett med {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: undefined,
  unstable__errors: {
    already_a_member_in_organization: undefined,
    captcha_invalid:
      'Registreringen mislyktes på grunn av mislykkede sikkerhetsvalideringer. Vennligst oppdater siden og prøv igjen, eller ta kontakt med brukerstøtte for mer hjelp.',
    captcha_unavailable:
      'Registreringen mislyktes på grunn av mislykkede bot-valideringer. Vennligst oppdater siden og prøv igjen, eller ta kontakt med brukerstøtte for mer hjelp.',
    form_code_incorrect: '',
    form_identifier_exists: '',
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'E-postadressen må være en gyldig e-postadresse',
    form_param_format_invalid__phone_number: 'Telefonnummeret må være i et gyldig internasjonalt format',
    form_param_max_length_exceeded__first_name: 'Fornavn kan ikke være lengre enn 256 bokstaver.',
    form_param_max_length_exceeded__last_name: 'Etternavn kan ikke være lengre enn 256 bokstaver.',
    form_param_max_length_exceeded__name: 'Navn kan ikke være lengre enn 256 bokstaver.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'Passordet ditt er ikke sterkt nok.',
    form_password_pwned:
      'Dette passordet er funnet som en del av et datainnbrudd og kan ikke brukes. Vennligst prøv et annet passord.',
    form_password_pwned__sign_in: undefined,
    form_password_size_in_bytes_exceeded:
      'Passordet ditt har overskredet maksimalt antall byte tillatt. Vennligst forkort det eller fjern noen spesialtegn.',
    form_password_validation_failed: 'Feil passord',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: 'You cannot delete your last identification.',
    not_allowed_access: '',
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_membership_quota_exceeded: undefined,
    organization_minimum_permissions_needed: undefined,
    passkey_already_exists: undefined,
    passkey_not_supported: undefined,
    passkey_pa_not_supported: undefined,
    passkey_registration_cancelled: undefined,
    passkey_retrieval_cancelled: undefined,
    passwordComplexity: {
      maximumLength: 'mindre enn {{length}} tegn',
      minimumLength: '{{length}} eller flere tegn',
      requireLowercase: 'en liten bokstav',
      requireNumbers: 'et tall',
      requireSpecialCharacter: 'et spesialtegn',
      requireUppercase: 'en stor bokstav',
      sentencePrefix: 'Passordet ditt må inneholde',
    },
    phone_number_exists: 'Dette telefonnummeret er allerede i bruk. Vennligst bruk et annet telefonnummer.',
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
      actionDescription: 'Skriv inn "Delete account" under for å fortsette.',
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
      verifyTitle: 'Verifiser e-postadresse',
    },
    formButtonPrimary__add: 'Legg til',
    formButtonPrimary__continue: 'Fortsett',
    formButtonPrimary__finish: 'Fullfør',
    formButtonPrimary__remove: 'Fjern',
    formButtonPrimary__save: 'Lagre',
    formButtonReset: 'Avbryt',
    mfaPage: {
      formHint: 'Velg en metode for å legge til.',
      title: 'Legg til to-trinns verifisering',
    },
    mfaPhoneCodePage: {
      backButton: 'Bruk eksisterende nummer',
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
        'Ved innlogging vil du måtte skrive inn en verifiseringskode sendt til dette telfonnummeret som et tilleggssteg.',
      successMessage2:
        'Ta vare på disse reservekodene og oppbevar dem på et trygt sted. Hvis du mister tilgang til autentiseringsenheten din kan du bruke reservekodene for å logge inn.',
      successTitle: 'SMS-kodeverifisering lagt til',
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
      account: 'Profil',
      description: 'Administrer kontoinformasjonen din.',
      security: 'Sikkerhet',
      title: 'Konto',
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
        'Det er anbefalt å logge ut av alle de andre enhetene dine som kan ha brukt ditt gamle passord.',
      readonly: 'Passordet ditt kan for øyeblikket ikke endres fordi du kun kan logge inn via bedriftstilkoblingen.',
      successMessage__set: 'Passordet ditt er satt.',
      successMessage__signOutOfOtherSessions: 'Alle andre enheter har blitt logget ut.',
      successMessage__update: 'Passordet ditt har blitt oppdatert.',
      title__set: 'Sett passord',
      title__update: 'Endre passord',
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
      verifySubtitle: 'Skriv inn verifiseringskoden som ble sendt til {{identifier}}',
      verifyTitle: 'Verifiser telefonnummer',
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
        subtitle__disconnected: undefined,
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
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Opprett passord',
        primaryButton__updatePassword: 'Endre passord',
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
        primaryButton: '',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Angi brukernavn',
        primaryButton__updateUsername: 'Endre brukernavn',
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
      title__set: 'Oppdater brukernavn',
      title__update: 'Oppdater brukernavn',
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
      web3WalletButtonsBlockButton: undefined,
    },
  },
} as const;
