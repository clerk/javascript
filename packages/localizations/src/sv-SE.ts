import type { LocalizationResource } from '@clerk/types';

const commonTexts = {
  signIn: {
    phoneCode: {
      title: 'Kolla din telefon',
      subtitle: 'för att fortsätta till {{applicationName}}',
      formTitle: 'Verifieringskod',
      formSubtitle: 'Ange verifieringskoden som skickades till ditt telefonnummer',
      resendButton: 'Skicka koden igen',
    },
  },
} as const;

export const svSE: LocalizationResource = {
  socialButtonsBlockButton: 'Fortsätt med {{provider|titleize}}',
  dividerText: 'eller',
  formFieldLabel__emailAddress: 'E-postadress',
  formFieldLabel__emailAddresses: 'E-postadresser',
  formFieldLabel__phoneNumber: 'Telefonnummer',
  formFieldLabel__username: 'Användarnamn',
  formFieldLabel__emailAddress_phoneNumber: 'E-postadress eller telefonnummer',
  formFieldLabel__emailAddress_username: 'E-postadress eller användarnamn',
  formFieldLabel__phoneNumber_username: 'Telefonnummer eller användarnamn',
  formFieldLabel__emailAddress_phoneNumber_username: 'E-postadress, telefonnummer eller användarnamn',
  formFieldLabel__password: 'Lösenord',
  formFieldLabel__currentPassword: 'Nuvarande lösenord',
  formFieldLabel__newPassword: 'Nytt lösenord',
  formFieldLabel__confirmPassword: 'Bekräfta lösenord',
  formFieldLabel__signOutOfOtherSessions: 'Logga ut från alla andra enheter',
  formFieldLabel__firstName: 'Förnamn',
  formFieldLabel__lastName: 'Efternamn',
  formFieldLabel__backupCode: 'Reserv-kod',
  formFieldLabel__organizationName: 'Organisationsnamn',
  formFieldLabel__role: 'Roll',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddresses:
    'Ange eller klistra in en eller flera e-postadresser, separerade med mellanslag eller kommatecken',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldInputPlaceholder__emailAddress_phoneNumber: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__phoneNumber_username: '',
  formFieldInputPlaceholder__emailAddress_phoneNumber_username: '',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldAction__forgotPassword: 'Glömt lösenord',
  formFieldHintText__optional: 'Valfritt',
  formButtonPrimary: 'Fortsätt',
  signInEnterPasswordTitle: 'Ange ditt lösenord',
  backButton: 'Tillbaka',
  footerActionLink__useAnotherMethod: 'Använd en annan metod',
  badge__primary: 'Primär',
  badge__thisDevice: 'Den här enheten',
  badge__userDevice: 'Användarens enhet',
  badge__otherImpersonatorDevice: 'Annans imitatörenhet',
  badge__default: 'Standard',
  badge__unverified: 'Overifierad',
  badge__requiresAction: 'Kräver åtgärd',
  badge__you: 'Du',
  footerPageLink__help: 'Hjälp',
  footerPageLink__privacy: 'Integritet',
  footerPageLink__terms: 'Villkor',
  paginationButton__previous: 'Föregående',
  paginationButton__next: 'Nästa',
  paginationRowText__displaying: 'Visar',
  paginationRowText__of: 'av',
  membershipRole__admin: 'Admin',
  membershipRole__basicMember: 'Medlem',
  membershipRole__guestMember: 'Gäst',
  signUp: {
    start: {
      title: 'Skapa ditt konto',
      subtitle: 'för att fortsätta till {{applicationName}}',
      actionText: 'Har du redan ett konto?',
      actionLink: 'Logga in',
    },
    emailLink: {
      title: 'Verifiera din e-post',
      subtitle: 'för att fortsätta till {{applicationName}}',
      formTitle: 'Verifieringslänk',
      formSubtitle: 'Använd verifieringslänken som skickades till din e-postadress',
      resendButton: 'Skicka länken igen',
      verified: {
        title: 'Registreringen lyckades',
      },
      loading: {
        title: 'Registrerar...',
      },
      verifiedSwitchTab: {
        title: 'E-posten har verifierats',
        subtitle: 'Återgå till den nyligen öppnade fliken för att fortsätta',
        subtitleNewTab: 'Återgå till föregående flik för att fortsätta',
      },
    },
    emailCode: {
      title: 'Verifiera din e-post',
      subtitle: 'för att fortsätta till {{applicationName}}',
      formTitle: 'Verifieringskod',
      formSubtitle: 'Ange verifieringskoden som skickades till din e-postadress',
      resendButton: 'Skicka koden igen',
    },
    phoneCode: {
      title: 'Verifiera din telefon',
      subtitle: 'för att fortsätta till {{applicationName}}',
      formTitle: 'Verifieringskod',
      formSubtitle: 'Ange verifieringskoden som skickades till ditt telefonnummer',
      resendButton: 'Skicka koden igen',
    },
    continue: {
      title: 'Fyll i nödvändiga fält',
      subtitle: 'för att fortsätta till {{applicationName}}',
      actionText: 'Har du redan ett konto?',
      actionLink: 'Logga in',
    },
  },
  signIn: {
    start: {
      title: 'Logga in',
      subtitle: 'för att fortsätta till {{applicationName}}',
      actionText: 'Har du inget konto?',
      actionLink: 'Skapa konto',
    },
    password: {
      title: 'Ange ditt lösenord',
      subtitle: 'för att fortsätta till {{applicationName}}',
      actionLink: 'Använd en annan metod',
    },
    emailCode: {
      title: 'Kontrollera din e-post',
      subtitle: 'för att fortsätta till {{applicationName}}',
      formTitle: 'Verifieringskod',
      formSubtitle: 'Ange verifieringskoden som skickades till din e-postadress',
      resendButton: 'Skicka koden igen',
    },
    emailLink: {
      title: 'Kontrollera din e-post',
      subtitle: 'för att fortsätta till {{applicationName}}',
      formTitle: 'Verifieringslänk',
      formSubtitle: 'Använd verifieringslänken som skickades till din e-postadress',
      resendButton: 'Skicka länken igen',
      unusedTab: {
        title: 'Du kan stänga den här fliken',
      },
      verified: {
        title: 'Inloggningen lyckades',
        subtitle: 'Du kommer att omdirigeras snart',
      },
      verifiedSwitchTab: {
        subtitle: 'Återgå till ursprungliga fliken för att fortsätta',
        titleNewTab: 'Loggade in på annan flik',
        subtitleNewTab: 'Återgå till den nyligen öppnade fliken för att fortsätta',
      },
      loading: {
        title: 'Loggar in...',
        subtitle: 'Du kommer att omdirigeras snart',
      },
      failed: {
        title: 'Denna verifieringslänk är ogiltig',
        subtitle: 'Återgå till ursprungliga fliken för att fortsätta.',
      },
      expired: {
        title: 'Denna verifieringslänk har upphört att gälla',
        subtitle: 'Återgå till ursprungliga fliken för att fortsätta.',
      },
    },
    phoneCode: { ...commonTexts.signIn.phoneCode },
    phoneCodeMfa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totpMfa: {
      title: 'Tvåstegsverifiering',
      subtitle: '',
      formTitle: 'Verifieringskod',
      formSubtitle: 'Ange verifieringskoden genererad av din autentiseringsapp',
    },
    backupCodeMfa: {
      title: 'Ange en reservkod',
      subtitle: 'för att fortsätta till {{applicationName}}',
      formTitle: '',
      formSubtitle: '',
    },
    alternativeMethods: {
      title: 'Använd en annan metod',
      actionLink: 'Få hjälp',
      blockButton__emailLink: 'Skicka länk till {{identifier}}',
      blockButton__emailCode: 'Skicka kod till {{identifier}}',
      blockButton__phoneCode: 'Skicka kod till {{identifier}}',
      blockButton__password: 'Logga in med ditt lösenord',
      blockButton__totp: 'Använd din autentiseringsapp',
      blockButton__backupCode: 'Använd en reservkod',
      getHelp: {
        title: 'Få hjälp',
        content:
          'Om du har problem med att logga in på ditt konto, kontakta oss via e-post så hjälper vi dig att återställa åtkomsten så snabbt som möjligt.',
        blockButton__emailSupport: 'E-post support',
      },
    },
    noAvailableMethods: {
      title: 'Kan inte logga in',
      subtitle: 'Ett fel inträffade',
      message: 'Kan inte fortsätta med inloggning. Det finns ingen tillgänglig autentiseringsfaktor.',
    },
  },
  userProfile: {
    mobileButton__menu: 'Meny',
    formButtonPrimary__continue: 'Fortsätt',
    formButtonPrimary__finish: 'Slutför',
    formButtonReset: 'Avbryt',
    start: {
      headerTitle__account: 'Konto',
      headerTitle__security: 'Säkerhet',
      headerSubtitle__account: 'Hantera din kontoinformation',
      headerSubtitle__security: 'Hantera dina säkerhetsinställningar',
      profileSection: {
        title: 'Profil',
      },
      usernameSection: {
        title: 'Användarnamn',
        primaryButton__changeUsername: 'Ändra användarnamn',
        primaryButton__setUsername: 'Sätt användarnamn',
      },
      emailAddressesSection: {
        title: 'E-postadresser',
        primaryButton: 'Lägg till en e-postadress',
        detailsTitle__primary: 'Primär e-postadress',
        detailsSubtitle__primary: 'Denna e-postadress är primär',
        detailsAction__primary: 'Fullborda verifiering',
        detailsTitle__nonPrimary: 'Sätt som primär e-postadress',
        detailsSubtitle__nonPrimary:
          'Sätt denna e-postadress som primär för att ta emot kommunikation rörande ditt konto.',
        detailsAction__nonPrimary: 'Sätt som primär',
        detailsTitle__unverified: 'Overifierad e-postadress',
        detailsSubtitle__unverified: 'Denna e-postadress har inte verifierats och kan vara begränsad i funktionalitet.',
        detailsAction__unverified: 'Fullborda verifiering',
        destructiveActionTitle: 'Ta bort',
        destructiveActionSubtitle: 'Radera denna e-postadress och ta bort den från ditt konto',
        destructiveAction: 'Ta bort e-postadress',
      },
      phoneNumbersSection: {
        title: 'Telefonnummer',
        primaryButton: 'Lägg till ett telefonnummer',
        detailsTitle__primary: 'Primärt telefonnummer',
        detailsSubtitle__primary: 'Detta telefonnummer är primärt',
        detailsAction__primary: 'Fullborda verifiering',
        detailsTitle__nonPrimary: 'Sätt som primärt telefonnummer',
        detailsSubtitle__nonPrimary:
          'Sätt detta telefonnummer som primärt för att ta emot kommunikation rörande ditt konto.',
        detailsAction__nonPrimary: 'Sätt som primär',
        detailsTitle__unverified: 'Overifierat telefonnummer',
        detailsSubtitle__unverified:
          'Detta telefonnummer har inte verifierats och kan vara begränsat i funktionalitet.',
        detailsAction__unverified: 'Fullborda verifiering',
        destructiveActionTitle: 'Ta bort',
        destructiveActionSubtitle: 'Radera detta telefonnummer och ta bort det från ditt konto',
        destructiveAction: 'Ta bort telefonnummer',
      },
      connectedAccountsSection: {
        title: 'Anslutna konton',
        primaryButton: 'Anslut konto',
        title__conectionFailed: 'Försök igen efter misslyckad anslutning',

        title__reauthorize: 'Nyautorisering krävs',
        subtitle__reauthorize:
          'De nödvändiga åtkomstbehörigheterna har uppdaterats och du kan uppleva begränsad funktionalitet. Vänligen nyautorisera den här applikationen för att undvika eventuella problem.',
        actionLabel__conectionFailed: 'Försök igen',
        actionLabel__reauthorize: 'Autorisera nu',
        destructiveActionTitle: 'Ta bort',
        destructiveActionSubtitle: 'Ta bort detta anslutna konto från dina konton',
        destructiveActionAccordionSubtitle: 'Ta bort anslutet konto',
      },
      passwordSection: {
        title: 'Lösenord',
        primaryButton__changePassword: 'Byt lösenord',
        primaryButton__setPassword: 'Ställ in lösenord',
      },
      mfaSection: {
        title: 'Tvåstegsverifiering',
        primaryButton: 'Lägg till tvåstegsverifiering',
        phoneCode: {
          destructiveActionTitle: 'Ta bort',
          destructiveActionSubtitle: 'Ta bort detta telefonnummer från tvåstegsverifieringsmetoderna',
          destructiveActionLabel: 'Ta bort telefonnummer',
          title__default: 'Standardfaktor',
          title__setDefault: 'Ange som standardfaktor',
          subtitle__default: 'Denna faktor används som standard tvåstegsverifieringsmetod vid inloggning.',
          subtitle__setDefault:
            'Ange denna faktor som standardfaktor för att använda den som standard tvåstegsverifieringsmetod vid inloggning.',
          actionLabel__setDefault: 'Ange som standard',
        },
        backupCodes: {
          headerTitle: 'Säkerhetskopieringskoder',
          title__regenerate: 'Återgenerera säkerhetskopieringskoder',
          subtitle__regenerate:
            'Få en ny uppsättning säkra säkerhetskopieringskoder. Tidigare koder kommer att raderas och kan inte användas.',
          actionLabel__regenerate: 'Återgenerera koder',
        },
        totp: {
          headerTitle: 'Autentiseringsapp',
          title: 'Standardfaktor',
          subtitle: 'Denna faktor används som standard tvåstegsverifieringsmetod vid inloggning.',
          destructiveActionTitle: 'Ta bort',
          destructiveActionSubtitle: 'Ta bort autentiseringsapp från tvåstegsverifieringsmetoderna',
          destructiveActionLabel: 'Ta bort autentiseringsapp',
        },
      },
      activeDevicesSection: {
        title: 'Aktiva enheter',
        primaryButton: 'Aktiva enheter',
        detailsTitle: 'Nuvarande enhet',
        detailsSubtitle: 'Detta är enheten du för närvarande använder',
        destructiveActionTitle: 'Logga ut',
        destructiveActionSubtitle: 'Logga ut från ditt konto på denna enhet',
        destructiveAction: 'Logga ut från enhet',
      },
      web3WalletsSection: {
        title: 'Web3 plånböcker',
        primaryButton: 'Web3 plånböcker',
        destructiveActionTitle: 'Ta bort',
        destructiveActionSubtitle: 'Ta bort denna web3 plånbok från ditt konto',
        destructiveAction: 'Ta bort plånbok',
      },
    },
    profilePage: {
      title: 'Uppdatera profil',
      imageFormTitle: 'Profilbild',
      imageFormSubtitle: 'Ladda upp bild',
      imageFormDestructiveActionSubtitle: 'Ta bort bild',
      fileDropAreaTitle: 'Dra filen hit, eller...',
      fileDropAreaAction: 'Välj fil',
      fileDropAreaHint: 'Ladda upp en JPG, PNG, GIF, eller WEBP bild som är mindre än 10 MB',
      successMessage: 'Din profil har uppdaterats.',
    },
    usernamePage: {
      title: 'Uppdatera användarnamn',
      successMessage: 'Ditt användarnamn har uppdaterats.',
    },
    emailAddressPage: {
      title: 'Lägg till e-postadress',
      emailCode: {
        formHint: 'Ett e-postmeddelande med en verifieringskod kommer att skickas till denna e-postadress.',
        formTitle: 'Verifieringskod',
        formSubtitle: 'Ange verifieringskoden som skickats till {{identifier}}',
        resendButton: 'Skicka kod igen',
        successMessage: 'E-postadressen {{identifier}} har lagts till i ditt konto.',
      },
      emailLink: {
        formHint: 'Ett e-postmeddelande med en verifieringslänk kommer att skickas till denna e-postadress.',
        formTitle: 'Verifieringslänk',
        formSubtitle: 'Klicka på verifieringslänken i e-postmeddelandet som skickats till {{identifier}}',
        resendButton: 'Skicka länken igen',
        successMessage: 'E-postadressen {{identifier}} har lagts till i ditt konto.',
      },
      removeResource: {
        title: 'Ta bort e-postadress',
        messageLine1: '{{identifier}} kommer att tas bort från detta konto.',
        messageLine2: 'Du kommer inte längre att kunna logga in med denna e-postadress.',
        successMessage: '{{emailAddress}} har tagits bort från ditt konto.',
      },
    },

    phoneNumberPage: {
      title: 'Lägg till telefonnummer',
      successMessage: '{{identifier}} har lagts till i ditt konto.',
      infoText: 'Ett textmeddelande med en verifieringslänk kommer att skickas till detta telefonnummer.',
      infoText__secondary: 'Avgifter för meddelanden och data kan tillkomma.',
      removeResource: {
        title: 'Ta bort telefonnummer',
        messageLine1: '{{identifier}} kommer att tas bort från detta konto.',
        messageLine2: 'Du kommer inte längre att kunna logga in med detta telefonnummer.',
        successMessage: '{{phoneNumber}} har tagits bort från ditt konto.',
      },
    },
    connectedAccountPage: {
      title: 'Lägg till anslutet konto',
      formHint: 'Välj en leverantör för att ansluta ditt konto.',
      formHint__noAccounts: 'Det finns inga tillgängliga externa kontoleverantörer.',
      socialButtonsBlockButton: 'Anslut {{provider|titleize}} konto',
      successMessage: 'Leverantören har lagts till i ditt konto.',
      removeResource: {
        title: 'Ta bort anslutet konto',
        messageLine1: '{{identifier}} kommer att tas bort från detta konto.',
        messageLine2:
          'Du kommer inte längre att kunna använda detta anslutna konto och alla beroende funktioner kommer att sluta fungera.',
        successMessage: '{{connectedAccount}} har tagits bort från ditt konto.',
      },
    },

    web3WalletPage: {
      title: 'Lägg till web3-plånbok',
      subtitle__availableWallets: 'Välj en web3-plånbok att ansluta till ditt konto.',
      subtitle__unavailableWallets: 'Det finns inga tillgängliga web3-plånböcker.',
      successMessage: 'Plånboken har lagts till i ditt konto.',
      removeResource: {
        title: 'Ta bort web3-plånbok',
        messageLine1: '{{identifier}} kommer att tas bort från detta konto.',
        messageLine2: 'Du kommer inte längre att kunna logga in med denna web3-plånbok.',
        successMessage: '{{web3Wallet}} har tagits bort från ditt konto.',
      },
    },
    passwordPage: {
      title: 'Ange lösenord',
      changePasswordTitle: 'Byt lösenord',
      successMessage: 'Ditt lösenord har angetts.',
      changePasswordSuccessMessage: 'Ditt lösenord har uppdaterats.',
      sessionsSignedOutSuccessMessage: 'Alla andra enheter har loggats ut.',
    },
    mfaPage: {
      title: 'Lägg till tvåstegsverifiering',
      formHint: 'Välj en metod att lägga till.',
    },

    mfaTOTPPage: {
      title: 'Lägg till autentiseringsapp',
      verifyTitle: 'Verifieringskod',
      verifySubtitle: 'Ange verifieringskoden genererad av din autentiseringsapp',
      successMessage:
        'Tvåstegsverifiering är nu aktiverat. Vid inloggning behöver du ange en verifieringskod från denna autentiseringsapp som ett extra steg.',
      authenticatorApp: {
        infoText__ableToScan:
          'Konfigurera en ny inloggningsmetod i din autentiseringsapp och skanna följande QR-kod för att länka den till ditt konto.',
        infoText__unableToScan: 'Konfigurera en ny inloggningsmetod i din autentiseringsapp och ange nyckeln nedan.',
        inputLabel__unableToScan1:
          'Se till att tidsbaserade eller engångslösenord är aktiverade och slutför sedan länkningen till ditt konto.',
        inputLabel__unableToScan2:
          'Alternativt, om din autentiseringsapp stödjer TOTP URI kan du också kopiera hela URI.',
        buttonAbleToScan__nonPrimary: 'Skanna QR-kod istället',
        buttonUnableToScan__nonPrimary: 'Kan inte skanna QR-kod?',
      },
      removeResource: {
        title: 'Ta bort tvåstegsverifiering',
        messageLine1: 'Verifieringskoder från denna autentiseringsapp kommer inte längre att krävas vid inloggning.',
        messageLine2: 'Ditt konto kan vara mindre säkert. Är du säker på att du vill fortsätta?',
        successMessage: 'Tvåstegsverifiering via autentiseringsapp har tagits bort.',
      },
    },

    mfaPhoneCodePage: {
      title: 'Lägg till SMS-kodverifiering',
      primaryButton__addPhoneNumber: 'Lägg till ett telefonnummer',
      subtitle__availablePhoneNumbers: 'Välj ett telefonnummer att registrera för SMS-kod tvåstegsverifiering.',
      subtitle__unavailablePhoneNumbers:
        'Det finns inga tillgängliga telefonnummer att registrera för SMS-kod tvåstegsverifiering.',
      successMessage:
        'SMS-kod tvåstegsverifiering är nu aktiverat för detta telefonnummer. Vid inloggning behöver du ange en verifieringskod skickad till detta telefonnummer som ett extra steg.',
      removeResource: {
        title: 'Ta bort tvåstegsverifiering',
        messageLine1: '{{identifier}} kommer inte längre att ta emot verifieringskoder vid inloggning.',
        messageLine2: 'Ditt konto kan vara mindre säkert. Är du säker på att du vill fortsätta?',
        successMessage: 'SMS-kod tvåstegsverifiering har tagits bort för {{mfaPhoneCode}}',
      },
    },

    backupCodePage: {
      title: 'Lägg till backupkodverifiering',
      title__codelist: 'Backupkoder',
      subtitle__codelist: 'Förvara dem säkert och håll dem hemliga.',
      infoText1: 'Backupkoder kommer att aktiveras för detta konto.',
      infoText2:
        'Håll backupkoderna hemliga och förvara dem säkert. Du kan generera nya backupkoder om du misstänker att de har komprometterats.',
      successSubtitle:
        'Du kan använda en av dessa för att logga in på ditt konto om du förlorar åtkomsten till din autentiseringsenhet.',
      successMessage:
        'Backupkoder är nu aktiverade. Du kan använda en av dessa för att logga in på ditt konto om du förlorar åtkomsten till din autentiseringsenhet. Varje kod kan endast användas en gång.',
      actionLabel__copy: 'Kopiera alla',
      actionLabel__copied: 'Kopierat!',
      actionLabel__download: 'Ladda ner .txt',
      actionLabel__print: 'Skriv ut',
    },
  },

  userButton: {
    action__manageAccount: 'Hantera konto',
    action__signOut: 'Logga ut',
    action__signOutAll: 'Logga ut från alla konton',
    action__addAccount: 'Lägg till konto',
  },
  organizationSwitcher: {
    personalWorkspace: 'Personligt Arbetsområde',
    notSelected: 'Ingen organisation vald',
    action__createOrganization: 'Skapa organisation',
    action__manageOrganization: 'Hantera organisation',
  },
  impersonationFab: {
    title: 'Inloggad som {{identifier}}',
    action__signOut: 'Logga ut',
  },

  organizationProfile: {
    start: {
      headerTitle__members: 'Medlemmar',
      headerTitle__settings: 'Inställningar',
      headerSubtitle__members: 'Visa och hantera organisationsmedlemmar',
      headerSubtitle__settings: 'Hantera organisationsinställningar',
    },
    profilePage: {
      title: 'Organisationsprofil',
      subtitle: 'Hantera organisationsprofilen',
      successMessage: 'Organisationen har uppdaterats.',
      dangerSection: {
        title: 'Farligt',
        leaveOrganization: {
          title: 'Lämna organisation',
          messageLine1:
            'Är du säker på att du vill lämna denna organisation? Du kommer att förlora åtkomst till organisationen och dess applikationer.',
          messageLine2: 'Denna åtgärd är permanent och oåterkallelig.',
          successMessage: 'Du har lämnat organisationen.',
        },
      },
    },
    invitePage: {
      title: 'Bjud in medlemmar',
      subtitle: 'Bjud in nya medlemmar till denna organisation',
      successMessage: 'Inbjudningar skickade',
      detailsTitle__inviteFailed: 'Inbjudningarna kunde inte skickas. Åtgärda följande och försök igen:',
      formButtonPrimary__continue: 'Skicka inbjudningar',
    },
    membersPage: {
      detailsTitle__emptyRow: 'Inga medlemmar att visa',
      action__invite: 'Bjud in',
      start: {
        headerTitle__active: 'Aktiva',
        headerTitle__invited: 'Inbjudna',
      },
      activeMembersTab: {
        tableHeader__user: 'Användare',
        tableHeader__joined: 'Gick med',
        tableHeader__role: 'Roll',
        tableHeader__actions: '',
        menuAction__remove: 'Ta bort medlem',
      },
      invitedMembersTab: {
        tableHeader__invited: 'Inbjudna',
        menuAction__revoke: 'Återkalla inbjudan',
      },
    },
  },

  createOrganization: {
    title: 'Skapa organisation',
    formButtonSubmit: 'Skapa organisation',
    subtitle: 'Ställ in organisationsprofilen',
    invitePage: {
      formButtonReset: 'Hoppa över',
    },
  },
  unstable__errors: {
    form_identifier_not_found: '',
    form_password_pwned: '',
    form_username_invalid_length: '',
    form_param_format_invalid: '',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
    form_password_incorrect: '',
    not_allowed_access: '',
    form_identifier_exists: '',
  },
  dates: {
    previous6Days: "Senaste {{ date | weekday('sv-SE','long') }} klockan {{ date | timeString('sv-SE') }}",
    lastDay: "Igår klockan {{ date | timeString('sv-SE') }}",
    sameDay: "Idag klockan {{ date | timeString('sv-SE') }}",
    nextDay: "Imorgon klockan {{ date | timeString('sv-SE') }}",
    next6Days: "{{ date | weekday('sv-SE','long') }} klockan {{ date | timeString('sv-SE') }}",
    numeric: "{{ date | numeric('sv-SE') }}",
  },
} as const;
