import type { LocalizationResource } from '@clerk/types';

const commonTexts = {
  signIn: {
    phoneCode: {
      title: 'Check je telefoon',
      subtitle: 'om verder te gaan naar {{applicationName}}',
      formTitle: 'Verificatie code',
      formSubtitle: 'Voer de verificatiecode in die naar je telefoonnummer is gestuurd',
      resendButton: 'Verstuur code opnieuw',
    },
  },
} as const;

export const nlNL: LocalizationResource = {
  locale: 'nl-NL',
  socialButtonsBlockButton: 'Ga verder met {{provider|titleize}}',
  dividerText: 'or',
  formFieldLabel__emailAddress: 'E-mailadres',
  formFieldLabel__emailAddresses: 'E-mailadressen',
  formFieldLabel__phoneNumber: 'Telefoonnummer',
  formFieldLabel__username: 'Gebruikersnaam',
  formFieldLabel__emailAddress_username: 'E-mailadres of gebruikersnaam',
  formFieldLabel__password: 'Wachtwoord',
  formFieldLabel__newPassword: 'Nieuw wachtwoord',
  formFieldLabel__confirmPassword: 'Wachtwoord bevestigen',
  formFieldLabel__firstName: 'Voornaam',
  formFieldLabel__lastName: 'Achternaam',
  formFieldLabel__backupCode: 'Backupcode',
  formFieldLabel__organizationName: 'Organisatienaam',
  formFieldLabel__role: 'Rol',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddresses:
    "Typ of plak één of meerdere emailadressen, gescheiden door spaties of komma's.",
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldAction__forgotPassword: 'Wachtwoord vergeten?',
  formFieldHintText__optional: 'Optioneel',
  formButtonPrimary: 'Doorgaan',
  signInEnterPasswordTitle: 'Vul je wachtwoord in',
  backButton: 'Terug',
  footerActionLink__useAnotherMethod: 'Een andere methode gebruiken',
  badge__primary: 'Hoofd',
  badge__thisDevice: 'Dit apparaat',
  badge__userDevice: 'Gebruikersapparaat',
  badge__otherImpersonatorDevice: 'Ander immitatie apparaat',
  badge__default: 'Standaard',
  badge__unverified: 'Ongeverifieerd',
  badge__requiresAction: 'Actie nodig',
  badge__you: 'Jij',
  footerPageLink__help: 'Help',
  footerPageLink__privacy: 'Privacy',
  footerPageLink__terms: 'Voorwaarden',
  paginationButton__previous: 'Vorige',
  paginationButton__next: 'Volgende',
  paginationRowText__displaying: 'Weergeven',
  paginationRowText__of: 'van',
  membershipRole__admin: 'Admin',
  membershipRole__basicMember: 'Lid',
  membershipRole__guestMember: 'Gast',
  signUp: {
    start: {
      title: 'Maak je account aan',
      subtitle: 'om door te gaan naar {{applicationName}}',
      actionText: 'Heb je al een account?',
      actionLink: 'Inloggen',
    },
    emailLink: {
      title: 'Bevestig je e-mailadres',
      subtitle: 'om door te gaan naar {{applicationName}}',
      formTitle: 'Verificatielink',
      formSubtitle: 'Gebruik de verificatielink die verzonden is naar je e-mailadres',
      resendButton: 'Verstuur link opnieuw',
      verified: {
        title: 'Succesvol geregistreerd',
      },
      loading: {
        title: 'Registreren ...',
      },
      verifiedSwitchTab: {
        title: 'E-mail bevestigd',
        subtitle: 'Ga naar de pas geopende tab om verder te gaan',
        subtitleNewTab: 'Ga naar de vorige tab om verder te gaan',
      },
    },
    emailCode: {
      title: 'Bevestig je e-mailadres',
      subtitle: 'om door te gaan naar {{applicationName}}',
      formTitle: 'Verificatiecode',
      formSubtitle: 'Voer de verificatiecode in die verzonden is naar je e-mailadres',
      resendButton: 'Verstuur code opnieuw',
    },
    phoneCode: {
      title: 'Bevestig je telefoonnummer',
      subtitle: 'om door te gaan naar {{applicationName}}',
      formTitle: 'Verificatiecode',
      formSubtitle: 'Voer de verificatiecode in die verzonden is naar je telefoonnummer',
      resendButton: 'Verstuur code opnieuw',
    },
    continue: {
      title: 'Vul de ontbrekende velden in',
      subtitle: 'om door te gaan naar {{applicationName}}',
      actionText: 'Heb je een account?',
      actionLink: 'Inloggen',
    },
  },
  signIn: {
    start: {
      title: 'Log in',
      subtitle: 'om door te gaan naar {{applicationName}}',
      actionText: 'Geen account?',
      actionLink: 'Registreren',
    },
    password: {
      title: 'Vul je wachtwoord in',
      subtitle: 'om door te gaan naar {{applicationName}}',
      actionLink: 'Gebruik een andere methode',
    },
    emailCode: {
      title: 'Check je e-mail',
      subtitle: 'om door te gaan naar {{applicationName}}',
      formTitle: 'Verificatiecode',
      formSubtitle: 'Voer de verificatiecode in die verzonden is naar je e-mailadres',
      resendButton: 'Verstuur code opnieuw',
    },
    emailLink: {
      title: 'Check je e-mail',
      subtitle: 'om door te gaan naar {{applicationName}}',
      formTitle: 'Verificatielink',
      formSubtitle: 'Gebruik de verificatielink die verzonden is naar je e-mailadres',
      resendButton: 'Verstuur link opnieuw',
      unusedTab: {
        title: 'Je kan deze tab sluiten.',
      },
      verified: {
        title: 'Successvol ingelogd',
        subtitle: 'Je zal weldra doorgestuurd worden',
      },
      verifiedSwitchTab: {
        subtitle: 'Ga naar de oorspronkelijke tab om verder te gaan',
        titleNewTab: 'Ingelogd in andere tab',
        subtitleNewTab: 'Ga naar de pasgeopende tab om verder te gaan',
      },
      loading: {
        title: 'Inloggen ...',
        subtitle: 'Je zal weldra doorgestuurd worden',
      },
      failed: {
        title: 'Deze verificatielink is niet geldig',
        subtitle: 'Ga naar de oorspronkelijke tab om verder te gaan.',
      },
      expired: {
        title: 'Deze verificatielink is verlopen',
        subtitle: 'Ga naar de oorspronkelijke tab om verder te gaan.',
      },
    },
    phoneCode: { ...commonTexts.signIn.phoneCode },
    phoneCodeMfa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totpMfa: {
      title: 'Tweestapsverificatie',
      subtitle: '',
      formTitle: 'Verificatiecode',
      formSubtitle: 'Voer de verificatiecode in die is gegenereerd door je authenticator app',
    },
    backupCodeMfa: {
      title: 'Voer een backupcode in',
      subtitle: 'om door te gaan naar {{applicationName}}',
      formTitle: '',
      formSubtitle: '',
    },
    alternativeMethods: {
      title: 'Gebruik een andere methode',
      actionLink: 'Help',
      blockButton__emailLink: 'Verzend link naar {{identifier}}',
      blockButton__emailCode: 'Verzend code naar {{identifier}}',
      blockButton__phoneCode: 'Verzend code naar {{identifier}}',
      blockButton__password: 'Inloggen met je wachtwoord',
      blockButton__totp: 'Gebruik je authenticator app',
      blockButton__backupCode: 'Gebruik een backupcode',
      getHelp: {
        title: 'Help',
        content: `Als je geen toegang hebt neem dan contact op met de klantenservice en we helpen je verder.`,
        blockButton__emailSupport: 'E-mail klantenservice',
      },
    },
    noAvailableMethods: {
      title: 'Inloggen onmogelijk',
      subtitle: 'Er heeft zich een fout voorgedaan',
      message: 'Het is niet mogelijk om door te gaan met inloggen. Er is geen beschikbare authenticatiefactor.',
    },
  },
  userProfile: {
    mobileButton__menu: 'Menu',
    formButtonPrimary__continue: 'Doorgaan',
    formButtonPrimary__finish: 'Afronden',
    formButtonReset: 'Annuleren',
    start: {
      headerTitle__account: 'Account',
      headerTitle__security: 'Beveiliging',
      profileSection: {
        title: 'Profiel',
      },
      usernameSection: {
        title: 'Gebruikersnaam',
        primaryButton__changeUsername: 'Wijzig gebruikersnaam',
        primaryButton__setUsername: 'Stel gebruikersnaam in',
      },
      emailAddressesSection: {
        title: 'E-mailadressen',
        primaryButton: 'Voeg een e-mailadres toe',
        detailsTitle__primary: 'Hoofd e-mailadres',
        detailsSubtitle__primary: 'Dit e-mailadres is het hoofd e-mailadres',
        detailsAction__primary: 'Rond verificatie af',
        detailsTitle__nonPrimary: 'Stel in als hoofd e-mailadres',
        detailsSubtitle__nonPrimary:
          'Stel dit e-mailadres in als het voornaamste om communicatie over uw account te ontvangen',
        detailsAction__nonPrimary: 'Stel in als hoofd',
        detailsTitle__unverified: 'Niet-geverifieerd e-mailadres',
        detailsSubtitle__unverified: 'Dit e-mailadres is niet geverifieerd en kan beperkte functionaliteit hebben',
        detailsAction__unverified: 'Rond verificatie af',
        destructiveActionTitle: 'Verwijderen',
        destructiveActionSubtitle: 'Verwijder dit e-mailadres en verwijder het uit uw account',
        destructiveAction: 'Verwijder e-mailadres',
      },
      phoneNumbersSection: {
        title: 'Telefoonnummers',
        primaryButton: 'Voeg een telefoonnummer toe',
        detailsTitle__primary: 'Hoofdtelefoonnummer',
        detailsSubtitle__primary: 'Dit telefoonnummer is het hoofdtelefoonnummer',
        detailsAction__primary: 'Rond verificatie af',
        detailsTitle__nonPrimary: 'Stel in als hoofdtelefoonnummer',
        detailsSubtitle__nonPrimary:
          'Stel dit telefoonnummer in als het voornaamste om communicatie over uw account te ontvangen',
        detailsAction__nonPrimary: 'Stel in als hoofd',
        detailsTitle__unverified: 'Niet-geverifieerd telefoonnummer',
        detailsSubtitle__unverified: 'Dit telefoonnummer is niet geverifieerd en kan beperkte functionaliteit hebben',
        detailsAction__unverified: 'Rond verificatie af',
        destructiveActionTitle: 'Verwijderen',
        destructiveActionSubtitle: 'Verwijder dit telefoonnummer en verwijder het uit uw account',
        destructiveAction: 'Verwijder telefoonnummer',
      },
      connectedAccountsSection: {
        title: 'Aangesloten accounts',
        primaryButton: 'Verbind een account',
        title__connectionFailed: 'Probeer mislukte connectie opnieuw',
        title__reauthorize: 'Herautorisering nodig',
        subtitle__reauthorize:
          'De vereiste scopes zijn bijgewerkt, en je ondervindt mogelijk beperkte functionaliteit. Autoriseer deze applicatie opnieuw om problemen te voorkomen',
        actionLabel__connectionFailed: 'Probeer opnieuw',
        actionLabel__reauthorize: 'Authoriseer nu',
        destructiveActionTitle: 'Verwijderen',
        destructiveActionSubtitle: 'Verwijder dit aangesloten account en verwijder het uit uw account',
        destructiveActionAccordionSubtitle: 'Verwijder aangesloten account',
      },
      passwordSection: {
        title: 'Wachtwoord',
        primaryButton__changePassword: 'Wachtwoord wijzigen',
        primaryButton__setPassword: 'Wachtwoord instellen',
      },
      mfaSection: {
        title: 'Tweestapsverificatie',
        primaryButton: 'Tweestapsverificatie instellen',
        phoneCode: {
          destructiveActionTitle: 'Verwijderen',
          destructiveActionSubtitle: 'Verwijder dit telefoonnummer van de tweestapsverificatiemethodes',
          destructiveActionLabel: 'Verwijder telefoonnummer',
          title__default: 'Standaardfactor',
          title__setDefault: 'Stel in als standaardfactor',
          subtitle__default:
            'Deze factor wordt gebruikt als de standaard tweestapsverificatiemethode bij het inloggen.',
          subtitle__setDefault: 'Stel deze factor in als de standaard tweestapsverificatiemethode bij het inloggen.',
          actionLabel__setDefault: 'Stel in als standaard',
        },
        backupCodes: {
          headerTitle: 'Backupcodes',
          title__regenerate: 'Hergenereer backupcodes',
          subtitle__regenerate: 'Genereer een nieuwe set backupcodes. De vorige kunnen niet meer gebruikt worden.',
          actionLabel__regenerate: 'Hergenereer codes',
        },
        totp: {
          headerTitle: 'Authenticatorapplicatie',
          title: 'Standaardfactor',
          subtitle: 'Deze factor wordt gebruikt als de standaard tweestapsverificatiemethode bij het inloggen.',
          destructiveActionTitle: 'Verwijderen',
          destructiveActionSubtitle: 'Verwijder deze authenticatorapplicatie van de tweestapsverificatiemethodes',
          destructiveActionLabel: 'Verwijder authenticatorapplicatie',
        },
      },
      activeDevicesSection: {
        title: 'Actieve apparaten',
        primaryButton: 'Actieve apparaten',
        detailsTitle: 'Huidig apparaat',
        detailsSubtitle: 'Dit is het apparaat dat u momenteel gebruikt',
        destructiveActionTitle: 'Uitloggen',
        destructiveActionSubtitle: 'Log uit op dit apparaat',
        destructiveAction: 'Log uit op apparaat',
      },
      web3WalletsSection: {
        title: 'Web3 portefeuilles',
        primaryButton: 'Web3 portefeuilles',
        destructiveActionTitle: 'Verwijderen',
        destructiveActionSubtitle: 'Verwijder deze portefeuille van uw account',
        destructiveAction: 'Verwijder portefeuille',
      },
    },
    profilePage: {
      title: 'Profiel bijwerken',
      imageFormTitle: 'Profielfoto',
      imageFormSubtitle: 'Afbeelding uploaden',
      imageFormDestructiveActionSubtitle: 'Verwijder afbeelding',
      fileDropAreaTitle: 'Sleep afbeelding hier, of ...',
      fileDropAreaAction: 'Selecteer bestand',
      fileDropAreaHint: 'Upload een JPG, PNG, GIF, of WEBP afbeelding kleiner dan 10 MB',
      successMessage: 'Je profiel is bijgewerkt.',
    },
    usernamePage: {
      title: 'Gebruikersnaam bijwerken',
      successMessage: 'Je gebruikersnaam is bijgewerkt.',
    },
    emailAddressPage: {
      title: 'E-mailadres toevoegen',
      emailCode: {
        formHint: 'Een mail met daarin een verificatiecode is verstuurd naar dit adres.',
        formTitle: 'Verificatiecode',
        formSubtitle: 'Voer de verificatiecode in die verstuurd is naar {{identifier}}',
        resendButton: 'Verstuur code opnieuw',
        successMessage: 'Het e-mailadres {{identifier}} is toegevoegd aan je account.',
      },
      emailLink: {
        formHint: 'Een mail met daarin een verificatielink is verstuurd naar dit adres.',
        formTitle: 'Verificatielink',
        formSubtitle: 'Klik op de verificatielink die verstuurd is naar {{identifier}}',
        resendButton: 'Verstuur link opnieuw',
        successMessage: 'Het e-mailadres {{identifier}} is toegevoegd aan je account.',
      },
      removeResource: {
        title: 'Verwijder e-mailadres',
        messageLine1: '{{identifier}} zal verwijderd worden uit dit account.',
        messageLine2: 'Je zal niet meer kunnen inloggen met dit e-mailadres.',
        successMessage: '{{emailAddress}} is verwijderd uit je account.',
      },
    },
    phoneNumberPage: {
      title: 'Telefoonnummer toevoegen',
      successMessage: '{{identifier}} is toegevoegd aan je account.',
      infoText: 'Een SMS met daarin een verificatiecode is verstuurd naar dit nummer.',
      infoText__secondary: 'Bericht- en datakosten kunnen van toepassing zijn.',
      removeResource: {
        title: 'Verwijder telefoonnummer',
        messageLine1: '{{identifier}} zal van deze account verwijderd worden.',
        messageLine2: 'Je zal niet meer kunnen inloggen met dit telefoonnummer.',
        successMessage: '{{phoneNumber}} is verwijderd uit je account.',
      },
    },
    connectedAccountPage: {
      title: 'Verbind externe account',
      formHint: 'Kies een provider om je account te verbinden.',
      formHint__noAccounts: 'Er zijn geen beschikbare externe accountproviders.',
      socialButtonsBlockButton: 'Verbind {{provider|titleize}} account',
      successMessage: 'Deze provider is toegevoegd aan je account.',
      removeResource: {
        title: 'Verwijder externe account',
        messageLine1: '{{identifier}} zal verwijderd worden uit dit account.',
        messageLine2:
          'Je kunt deze verbonden account niet meer gebruiken en afhankelijke functies zullen niet meer werken.',
        successMessage: '{{connectedAccount}} is verwijderd uit je account.',
      },
    },
    web3WalletPage: {
      title: 'Web3 portefeuille toevoegen.',
      subtitle__availableWallets: 'Selecteer een web3 portefeuille om toe te voegen.',
      subtitle__unavailableWallets: 'Er zijn geen beschikbare web3 portefeuilles.',
      successMessage: 'De portefeuille is toegevoegd aan dit account.',
      removeResource: {
        title: 'Verwijder web3 portefeuille',
        messageLine1: '{{identifier}} zal verwijderd worden uit dit account.',
        messageLine2: 'Je zal niet meer kunnen inloggen met deze web3 portefeuille.',
        successMessage: '{{web3Wallet}} is verwijderd uit je account.',
      },
    },
    passwordPage: {
      title: 'Stel wachtwoord in',
      successMessage: 'Je wachtwoord is ingesteld.',
    },
    mfaPage: {
      title: 'Tweestapsverificatie toevoegen',
      formHint: 'Kies een methode om toe te voegen.',
    },
    mfaTOTPPage: {
      title: 'Voeg authenticator toe',
      verifyTitle: 'Verificatiecode',
      verifySubtitle: 'Voer de verificatiecode in die je authenticator app heeft gegenereerd.',
      successMessage:
        'Tweestapsverificatie is nu ingesteld. Bij het inloggen zal je een verificatiecode van je authenticator app moeten invoeren.',
      authenticatorApp: {
        infoText__ableToScan: 'Scan de QR code met je authenticator app om de authenticator toe te voegen.',
        infoText__unableToScan:
          'Stel een nieuwe aanmeldmethode in op je authenticator en voer de onderstaande sleutel in.',
        inputLabel__unableToScan1:
          'Zorg ervoor dat tijdsgebaseerde of eenmalige wachtwoorden zijn ingeschakeld, en voltooi vervolgens het koppelen van uw account.',
        inputLabel__unableToScan2: "Als je authenticator TOTP-URI's ondersteunt, kun je ook de volledige URI kopiëren.",
        buttonAbleToScan__nonPrimary: 'Alternatief, scan een QR code',
        buttonUnableToScan__nonPrimary: 'Kan je de code niet scannen?',
      },
      removeResource: {
        title: 'Verwijder tweestapsverificatie',
        messageLine1: 'Verificatiecodes van deze authenticator zullen niet langer vereist zijn bij het inloggen.',
        messageLine2: 'Uw account is mogelijk niet zo veilig. Weet je zeker dat je door wilt gaan?',
        successMessage: 'Tweestapsverificatie via authenticator-applicatie is verwijderd.',
      },
    },
    mfaPhoneCodePage: {
      title: 'Voeg SMS-code verificatie toe',
      primaryButton__addPhoneNumber: 'Telefoonnummer toevoegen',
      subtitle__availablePhoneNumbers:
        'Selecteer een telefoonnummer om je te registreren voor SMS-code twee-stapsverificatie.',
      subtitle__unavailablePhoneNumbers:
        'Er zijn geen beschikbare telefoonnummers om te registreren voor SMS-code tweestapsverificatie.',
      successMessage:
        'De tweestapsverificatie met SMS-code is nu ingeschakeld voor dit telefoonnummer. Bij het aanmelden moet je een verificatiecode invoeren die naar dit telefoonnummer is verzonden als extra stap.',
      removeResource: {
        title: 'Verwijder tweestapsverificatie',
        messageLine1: '{{identifier}} zal niet langer verificatiecodes ontvangen bij het inloggen.',
        messageLine2: 'Uw account is mogelijk niet zo veilig. Weet je zeker dat je door wilt gaan?',
        successMessage: 'SMS-code tweestapsverificatie is verwijderd voor {{mfaPhoneCode}}',
      },
    },
    backupCodePage: {
      title: 'Voeg backup code verificatie toe',
      title__codelist: 'Backup codes',
      subtitle__codelist: 'Sla ze veilig op en hou ze geheim.',
      infoText1: 'Backupcodes zullen voor dit account ingeschakeld zijn.',
      infoText2:
        'Houd de backupcodes geheim en bewaar ze veilig. U kunt backupcodes opnieuw genereren als u vermoedt dat ze zijn aangetast.',
      successSubtitle:
        'Je kunt één van deze gebruiken om in te loggen op je account als je geen toegang meer hebt tot je authenticatieapparaat.',
      successMessage:
        'Backupcodes zijn nu ingeschakeld. U kunt er een van gebruiken om in te loggen op uw account als u geen toegang meer heeft tot uw authenticatieapparaat. Elke code kan maar één keer gebruikt worden.',
      actionLabel__copy: 'Kopieer',
      actionLabel__copied: 'Gekopieerd!',
      actionLabel__download: 'Download .txt',
      actionLabel__print: 'Print',
    },
  },
  userButton: {
    action__manageAccount: 'Account beheren',
    action__signOut: 'Uitloggen',
    action__signOutAll: 'Uitloggen uit alle accounts',
    action__addAccount: 'Account toevoegen',
  },
  organizationSwitcher: {
    personalWorkspace: 'Persoonlijke werkruimte',
    notSelected: 'Geen organisatie geselecteerd',
    action__createOrganization: 'Maak organisatie aan',
    action__manageOrganization: 'Beheer organisatie',
  },
  impersonationFab: {
    title: 'Ingelogd als {{identifier}}',
    action__signOut: 'Uitloggen',
  },
  organizationProfile: {
    start: {
      headerTitle__members: 'Leden',
      headerTitle__settings: 'Instellingen',
    },
    profilePage: {
      title: 'Organisatieprofiel',
      subtitle: 'Beheer Organisatieprofiel',
      successMessage: 'De organisatie is bijgewerkt.',
      dangerSection: {
        title: 'Gevaar',
        leaveOrganization: {
          title: 'Verlaat organisatie',
          messageLine1:
            'Weet je zeker dat je deze organisatie wilt verlaten? Je zult toegang verliezen tot deze organisatie en haar applicaties.',
          messageLine2: 'Deze actie is permanent en onomkeerbaar.',
          successMessage: 'Je hebt deze organisatie verlaten.',
        },
      },
    },
    invitePage: {
      title: 'Leden uitnodigen',
      subtitle: 'Nodig nieuwe leden uit voor deze organisatie',
      successMessage: 'Uitnodigingen succesvol verzonden',
      detailsTitle__inviteFailed:
        'De uitnodigingen konden niet verzonden worden. Los het volgende op en probeer het opnieuw:',
      formButtonPrimary__continue: 'Uitnodigingen verzenden',
    },
    membersPage: {
      detailsTitle__emptyRow: 'Geen leden gevonden',
      action__invite: 'Uitnodigen',
      start: {},
      activeMembersTab: {
        tableHeader__user: 'Gebruiker',
        tableHeader__joined: 'Toegetreden',
        tableHeader__role: 'Rol',
        tableHeader__actions: '',
        menuAction__remove: 'Verwijder lid',
      },
      invitedMembersTab: {
        tableHeader__invited: 'Uitgenodigd',
        menuAction__revoke: 'Uitnodiging intrekken',
      },
    },
  },
  createOrganization: {
    title: 'Organisatie aanmaken',
    formButtonSubmit: 'Maak organisatie aan',
    invitePage: {
      formButtonReset: 'Overslaan',
    },
  },
  unstable__errors: {
    form_identifier_not_found: '',
    form_password_pwned: '',
    form_username_invalid_length: '',
    form_username_invalid_character: '',
    form_param_format_invalid: '',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
    form_password_incorrect: '',
    not_allowed_access: '',
    form_identifier_exists: '',
    passwordComplexity: {
      sentencePrefix: '',
      minimumLength: '',
      maximumLength: '',
      requireNumbers: '',
      requireLowercase: '',
      requireUppercase: '',
      requireSpecialCharacter: '',
    },
    zxcvbn: {
      notEnough: 'Je wachtwoord is niet sterk genoeg.',
      warnings: {
        straightRow: 'Opeenvolgende toetsen op jouw toetsenbord zijn makkelijk te raden.',
        keyPattern: 'Korte toetsenbord patronen zijn makkelijk te raden.',
        simpleRepeat: 'Herhalende letters zoals "aaa" zijn makkelijk te raden.',
        extendedRepeat: 'Herhalende patronen zoals "abcabcabc" zijn makkelijk te raden.',
        sequences: 'Veelvoorkomende tekstreeksen zoals "abc" zijn makkelijk te raden.',
        recentYears: 'Recente jaartallen zijn makkelijk te raden.',
        dates: 'Datums zijn makkelijk te raden.',
        topTen: 'Dit wachtwoord wordt heel erg veel gebruikt.',
        topHundred: 'Dit wachtwoord wordt erg veel gebruikt.',
        common: 'Dit wachtwoord wordt veel gebruikt.',
        similarToCommon: 'Dit lijkt op een veelvoorkomend wachtwoord.',
        wordByItself: 'Woorden op zich zijn makkelijk te raden.',
        namesByThemselves: 'Voor- en achternamen op zich zijn makkelijk te raden.',
        commonNames: 'Veelvoorkomende voor- en achternamen zijn makkelijk te raden.',
        userInputs: 'Vermijd persoonlijke of website gerelateerde woorden.',
        pwned: 'Dit wachtwoord is in een datalek gevonden.',
      },
      suggestions: {
        l33t: "Vermijd voorspelbare vervangingen, zoals '@' voor 'a'.",
        reverseWords: 'Vermijd het omdraaien van veelvoorkomende woorden.',
        allUppercase: 'Zet een deel in hoofdletters, maar niet alle letters.',
        capitalization: 'Zet meer dan de eerste letter in hoofdletter.',
        dates: 'Vermijd data en jaartallen die met jou geassocieerd zijn.',
        recentYears: 'Vermijd recente jaartallen.',
        associatedYears: 'Vermijd jaartallen die met jou geassocieerd zijn.',
        sequences: 'Vermijd veelvoorkomende tekstreeksen.',
        repeated: 'Vermijd herhalende woorden en letters.',
        longerKeyboardPattern: 'Gebruik langere toetsenbord patronen, en wissel meerdere keren van richting.',
        anotherWord: 'Voeg meer woorden toe die minder vaak voorkomen.',
        useWords: 'Gebruik meerdere woorden, maar vermijd veelvoorkomende zinnen.',
        noNeed: 'Je kan ook een sterk wachtwoord maken zonder speciale tekens, hoofdletters of nummers.',
        pwned: 'Als u dit wachtwoord elders gebruikt, moet u het veranderen.',
      },
    },
  },
  dates: {
    previous6Days: "Vorige {{ date | weekday('nl-NL','long') }} om {{ date | timeString('nl-NL') }}",
    lastDay: "Gisteren om {{ date | timeString('nl-NL') }}",
    sameDay: "Vandaag om {{ date | timeString('nl-NL') }}",
    nextDay: "Morgen om {{ date | timeString('nl-NL') }}",
    next6Days: "{{ date | weekday('nl-NL','long') }} om {{ date | timeString('nl-NL') }}",
    numeric: "{{ date | numeric('nl-NL') }}",
  },
} as const;

export const nlBE: LocalizationResource = {
  locale: 'nl-BE',
  ...nlNL,
};
