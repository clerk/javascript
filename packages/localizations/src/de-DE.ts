import type { LocalizationResource } from '@clerk/types';

export const deDE: LocalizationResource = {
  locale: 'de-DE',
  socialButtonsBlockButton: 'Weiter mit {{provider|titleize}}',
  dividerText: 'oder',
  formFieldLabel__emailAddress: 'E-Mail-Adresse',
  formFieldLabel__emailAddresses: 'E-Mail-Adressen',
  formFieldLabel__phoneNumber: 'Telefonnummer',
  formFieldLabel__username: 'Nutzername',
  formFieldLabel__emailAddress_phoneNumber: 'E-Mail-Adresse oder Telefonnummer',
  formFieldLabel__emailAddress_username: 'E-Mail-Adresse oder Benutzername',
  formFieldLabel__phoneNumber_username: 'Telefonnummer oder Benutzername',
  formFieldLabel__emailAddress_phoneNumber_username: 'E-Mail-Adresse, Telefonnummer oder Benutzername',
  formFieldLabel__password: 'Passwort',
  formFieldLabel__currentPassword: 'Aktuelles Passwort',
  formFieldLabel__newPassword: 'Neues Passwort',
  formFieldLabel__confirmPassword: 'Passwort bestätigen',
  formFieldLabel__signOutOfOtherSessions: 'Alle anderen Geräte abmelden',
  formFieldLabel__firstName: 'Vorname',
  formFieldLabel__lastName: 'Nachname',
  formFieldLabel__backupCode: 'Sicherungscode',
  formFieldLabel__organizationName: 'Organisationsname',
  formFieldLabel__role: 'Rolle',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddresses:
    'Geben oder fügen Sie eine oder mehrere E-Mail-Adressen ein, getrennt durch Leerzeichen oder Kommas',
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
  formFieldError__notMatchingPasswords: `Passwörter stimmen nicht überein.`,
  formFieldError__matchingPasswords: 'Passwörter stimmen überein.',
  formFieldError__verificationLinkExpired:
    'Der Bestätigungslink ist abgelaufen. Bitte fordern Sie einen neuen Link an.',
  formFieldAction__forgotPassword: 'Passwort vergessen?',
  formFieldHintText__optional: 'Optional',
  formButtonPrimary: 'Fortsetzen',
  signInEnterPasswordTitle: 'Geben Sie Ihr Passwort ein',
  backButton: 'Zurück',
  footerActionLink__useAnotherMethod: 'Verwenden Sie eine andere Methode',
  badge__primary: 'Primär',
  badge__thisDevice: 'Dieses Gerät',
  badge__userDevice: 'Benutzergerät',
  badge__otherImpersonatorDevice: 'Anderes Imitationsgerät',
  badge__default: 'Standard',
  badge__unverified: 'Unbestätigt',
  badge__requiresAction: 'Erfordert Handeln',
  badge__you: 'Du',
  footerPageLink__help: 'Hilfe',
  footerPageLink__privacy: 'Privatsphäre',
  footerPageLink__terms: 'Bedingungen',
  paginationButton__previous: 'Vorherige',
  paginationButton__next: 'Nächste',
  paginationRowText__displaying: 'Anzeigen',
  paginationRowText__of: 'von',
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Mitglied',
  membershipRole__guestMember: 'Gast',
  signUp: {
    start: {
      title: 'Erstelle deinen Account',
      subtitle: 'weiter zu {{applicationName}}',
      actionText: 'Haben Sie ein Konto?',
      actionLink: 'Einloggen',
    },
    emailLink: {
      title: 'Bestätigen Sie Ihre E-Mail',
      subtitle: 'weiter zu {{applicationName}}',
      formTitle: 'Bestätigungslink',
      formSubtitle: 'Verwenden Sie den an Ihre E-Mail-Adresse gesendeten Bestätigungslink',
      resendButton: 'Link erneut senden',
      verified: {
        title: 'Erfolgreich angemeldet',
      },
      loading: {
        title: 'Anmeldung...',
      },
      verifiedSwitchTab: {
        title: 'E-Mail erfolgreich verifiziert',
        subtitle: 'Kehren Sie zum neu geöffneten Tab zurück, um fortzufahren',
        subtitleNewTab: 'Kehren Sie zum vorherigen Tab zurück, um fortzufahren',
      },
    },
    emailCode: {
      title: 'Bestätigen Sie Ihre E-Mail',
      subtitle: 'weiter zu {{applicationName}}',
      formTitle: 'Bestätigungscode',
      formSubtitle: 'Geben Sie den Bestätigungscode ein, der an Ihre E-Mail-Adresse gesendet wurde',
      resendButton: 'Code erneut senden',
    },
    phoneCode: {
      title: 'Verifizieren Sie Ihre Telefonnummer',
      subtitle: 'weiter zu {{applicationName}}',
      formTitle: 'Bestätigungscode',
      formSubtitle: 'Geben Sie den Bestätigungscode ein, der an Ihre Telefonnummer gesendet wurde',
      resendButton: 'Code erneut senden',
    },
    continue: {
      title: 'Füllen Sie fehlende Felder aus',
      subtitle: 'weiter zu {{applicationName}}',
      actionText: 'Haben Sie ein Konto?',
      actionLink: 'Einloggen',
    },
  },
  signIn: {
    start: {
      title: 'Einloggen',
      subtitle: 'weiter zu {{applicationName}}',
      actionText: 'Kein Account?',
      actionLink: 'Anmelden',
    },
    password: {
      title: 'Geben Sie Ihr Passwort ein',
      subtitle: 'weiter zu {{applicationName}}',
      actionLink: 'Verwenden Sie eine andere Methode',
    },
    emailCode: {
      title: 'Überprüfen Sie Ihren Posteingang',
      subtitle: 'weiter zu {{applicationName}}',
      formTitle: 'Bestätigungscode',
      formSubtitle: 'Geben Sie den Bestätigungscode ein, der an Ihre E-Mail-Adresse gesendet wurde',
      resendButton: 'Code erneut senden',
    },
    emailLink: {
      title: 'Überprüfen Sie Ihren Posteingang',
      subtitle: 'weiter zu {{applicationName}}',
      formTitle: 'Bestätigungslink',
      formSubtitle: 'Verwenden Sie den an Ihre E-Mail gesendeten Bestätigungslink',
      resendButton: 'Link erneut senden',
      unusedTab: {
        title: 'Sie können diesen Tab schließen',
      },
      verified: {
        title: 'Erfolgreich angemeldet',
        subtitle: 'Sie werden in Kürze weitergeleitet',
      },
      verifiedSwitchTab: {
        subtitle: 'Kehren Sie zum ursprünglichem Tab zurück, um fortzufahren',
        titleNewTab: 'In einem anderen Tab angemeldet',
        subtitleNewTab: 'Kehren Sie zum neu geöffneten Tab zurück, um fortzufahren',
      },
      loading: {
        title: 'Einloggen...',
        subtitle: 'Sie werden in Kürze weitergeleitet',
      },
      failed: {
        title: 'Dieser Bestätigungslink ist ungültig',
        subtitle: 'Kehren Sie zum ursprünglichen Tab zurück, um fortzufahren.',
      },
      expired: {
        title: 'Dieser Bestätigungslink ist abgelaufen',
        subtitle: 'Kehren Sie zum ursprünglichen Tab zurück, um fortzufahren.',
      },
    },
    phoneCode: {
      title: 'Schau auf dein Telefon',
      subtitle: 'weiter zu {{applicationName}}',
      formTitle: 'Bestätigungscode',
      formSubtitle: 'Geben Sie den Bestätigungscode ein, der an Ihre Telefonnummer gesendet wurde',
      resendButton: 'Code erneut senden',
    },
    phoneCodeMfa: {
      title: 'Schau auf dein Telefon',
      formTitle: 'Bestätigungscode',
      formSubtitle: 'Geben Sie den Bestätigungscode ein, der an Ihre Telefonnummer gesendet wurde',
      resendButton: 'Code erneut senden',
      subtitle: '',
    },
    totpMfa: {
      title: 'Bestätigung in zwei Schritten',
      subtitle: '',
      formTitle: 'Bestätigungscode',
      formSubtitle: 'Geben Sie den von Ihrer Authentifizierungs-App generierten Bestätigungscode ein',
    },
    backupCodeMfa: {
      title: 'Geben Sie einen Backup-Code ein',
      subtitle: 'weiter zu {{applicationName}}',
      formTitle: '-',
      formSubtitle: '-',
    },
    alternativeMethods: {
      title: 'Verwenden Sie eine andere Methode',
      actionLink: 'Hilfe',
      blockButton__emailLink: 'Link senden an {{identifier}}',
      blockButton__emailCode: 'Code an {{identifier}} senden',
      blockButton__phoneCode: 'Code an {{identifier}} senden',
      blockButton__password: 'Melden Sie sich mit Ihrem Passwort an',
      blockButton__totp: 'Verwenden Sie Ihre Authentifizierungs-App',
      blockButton__backupCode: 'Verwenden Sie einen Backup-Code',
      getHelp: {
        title: 'Hilfe',
        content:
          'Wenn Sie Schwierigkeiten haben, sich mit Ihrem Konto anzumelden, senden Sie uns eine E-Mail und wir werden mit Ihnen zusammenarbeiten, um den Zugriff so schnell wie möglich wiederherzustellen.',
        blockButton__emailSupport: 'Unterstützung per E-Mail',
      },
    },
    noAvailableMethods: {
      title: 'Anmeldung nicht möglich',
      subtitle: 'Ein Fehler ist aufgetreten',
      message: 'Die Anmeldung kann nicht fortgesetzt werden. Es ist kein Authentifizierungsfaktor verfügbar.',
    },
  },
  userProfile: {
    mobileButton__menu: 'Menü',
    formButtonPrimary__continue: 'Fortsetzen',
    formButtonPrimary__finish: 'Fertig',
    formButtonReset: 'Zurücksetzen',
    start: {
      headerTitle__account: 'Konto',
      headerTitle__security: 'Sicherheit',
      headerSubtitle__account: 'Verwalten Sie Ihre Kontoinformationen',
      headerSubtitle__security: 'Verwalten Sie Ihre Sicherheitseinstellungen',
      profileSection: {
        title: 'Profil',
      },
      usernameSection: {
        title: 'Nutzername',
        primaryButton__changeUsername: 'Benutzernamen ändern',
        primaryButton__setUsername: 'Benutzernamen festlegen',
      },
      emailAddressesSection: {
        title: 'E-Mail-Adressen',
        primaryButton: 'Fügen Sie eine E-Mail-Adresse hinzu',
        detailsTitle__primary: 'Haupt-Email-Adresse',
        detailsSubtitle__primary: 'Diese E-Mail-Adresse ist die primäre E-Mail-Adresse',
        detailsAction__primary: 'Verifizierung abschließen',
        detailsTitle__nonPrimary: 'Als primäre E-Mail-Adresse festlegen',
        detailsSubtitle__nonPrimary:
          'Legen Sie diese E-Mail-Adresse als primäre E-Mail-Adresse fest, um Mitteilungen zu Ihrem Konto zu erhalten.',
        detailsAction__nonPrimary: 'Als primär festlegen',
        detailsTitle__unverified: 'Unbestätigte E-Mail-Adresse',
        detailsSubtitle__unverified:
          'Diese E-Mail-Adresse wurde nicht verifiziert und kann in Ihrer Funktionalität eingeschränkt sein',
        detailsAction__unverified: 'Verifizierung abschließen',
        destructiveActionTitle: 'Entfernen',
        destructiveActionSubtitle: 'Löschen Sie diese E-Mail-Adresse und entfernen Sie sie aus Ihrem Konto',
        destructiveAction: 'E-Mail-Adresse entfernen',
      },
      phoneNumbersSection: {
        title: 'Telefonnummern',
        primaryButton: 'Fügen Sie eine Telefonnummer hinzu',
        detailsTitle__primary: 'Haupt-Telefonnummer',
        detailsSubtitle__primary: 'Diese Telefonnummer ist die primäre Telefonnummer',
        detailsAction__primary: 'Verifizierung abschließen',
        detailsTitle__nonPrimary: 'Als primäre Telefonnummer festlegen',
        detailsSubtitle__nonPrimary:
          'Legen Sie diese Telefonnummer als primäre Telefonnummer fest, um Mitteilungen zu Ihrem Konto zu erhalten.',
        detailsAction__nonPrimary: 'Als primär festlegen',
        detailsTitle__unverified: 'Unbestätigte Telefonnummer',
        detailsSubtitle__unverified:
          'Diese Telefonnummer wurde nicht verifiziert und kann in Ihrer Funktionalität eingeschränkt sein',
        detailsAction__unverified: 'Verifizierung abschließen',
        destructiveActionTitle: 'Entfernen',
        destructiveActionSubtitle: 'Löschen Sie diese Telefonnummer und entfernen Sie sie aus Ihrem Konto',
        destructiveAction: 'Telefonnummer entfernen',
      },
      connectedAccountsSection: {
        title: 'Verbundene Konten',
        primaryButton: 'Konto verbinden',
        title__conectionFailed: 'Fehlgeschlagene Verbindung erneut versuchen',
        title__connectionFailed: 'Fehlgeschlagene Verbindung erneut versuchen',
        actionLabel__conectionFailed: 'Versuchen Sie es nochmal',
        actionLabel__connectionFailed: 'Versuchen Sie es nochmal',
        destructiveActionTitle: 'Entfernen',
        destructiveActionSubtitle: 'Entfernen Sie dieses Konto aus Ihrem Konto',
        destructiveActionAccordionSubtitle: 'Verbundenes Konto entfernen',
      },
      passwordSection: {
        title: 'Passwort',
        primaryButton__changePassword: 'Passwort ändern',
        primaryButton__setPassword: 'Passwort festlegen',
      },
      mfaSection: {
        title: 'Zweifaktor-Authentifizierung',
        primaryButton: 'Aktivieren Sie die Zweifaktor-Authentifizierung',
        phoneCode: {
          destructiveActionTitle: 'Entfernen',
          destructiveActionSubtitle: 'Entfernen Sie diese Telefonnummer aus der Zweifaktor-Authentifizierung',
          destructiveActionLabel: 'Telefonnummer entfernen',
          title__default: 'Standard',
          title__setDefault: 'Als Standard festlegen',
          subtitle__default: 'Dieser Methode wird bei der Anmeldung als zweiter Faktor verwendet.',
          subtitle__setDefault:
            'Legen Sie diese Methode als Standardmethode fest, um sie als standardmäßigen zweiten Faktor bei der Anmeldung zu verwenden.',
          actionLabel__setDefault: 'Als Standard einstellen',
        },
        backupCodes: {
          headerTitle: 'Backup-Codes',
          title__regenerate: 'Backup-Codes neu generieren',
          subtitle__regenerate:
            'Generieren Sie einen neuen Satz sicherer Backup-Codes. Alte Backup-Code werden gelöscht und können nicht mehr verwendet werden.',
          actionLabel__regenerate: 'Codes neu generieren',
        },
        totp: {
          headerTitle: 'Authentifizierungs-App',
          title: 'Standardfaktor',
          subtitle: 'Dieser Faktor wird bei der Anmeldung als standardmäßiger zweiter Faktor verwendet.',
          destructiveActionTitle: 'Entfernen',
          destructiveActionSubtitle:
            'Entfernen Sie die Authentifizierungs-App aus den zweistufigen Überprüfungsmethoden',
          destructiveActionLabel: 'Entfernen Sie die Authentifizierungs-App',
        },
      },
      activeDevicesSection: {
        title: 'Aktive Geräte',
        primaryButton: 'Aktive Geräte',
        detailsTitle: 'Aktuelles Gerät',
        detailsSubtitle: 'Dies ist das Gerät, welches Sie derzeit verwenden',
        destructiveActionTitle: 'Ausloggen',
        destructiveActionSubtitle: 'Melden Sie sich auf diesem Gerät von Ihrem Konto ab',
        destructiveAction: 'Vom Gerät abmelden',
      },
      web3WalletsSection: {
        title: 'Web3-Wallets',
        primaryButton: 'Web3-Wallets',
        destructiveActionTitle: 'Entfernen',
        destructiveActionSubtitle: 'Entfernen Sie dieses Web3-Wallet aus Ihrem Konto',
        destructiveAction: 'Wallet entfernen',
      },
      dangerSection: {
        title: 'Achtung',
        deleteAccountButton: 'Konto löschen',
        deleteAccountTitle: 'Konto löschen',
        deleteAccountDescription: 'Löschen Sie ihr Konto und alle damit verknüpften Daten',
      },
    },
    profilePage: {
      title: 'Profil aktualisieren',
      imageFormTitle: 'Profilbild',
      imageFormSubtitle: 'Bild hochladen',
      imageFormDestructiveActionSubtitle: 'Bild entfernen',
      fileDropAreaTitle: 'Datei hierher ziehen, oder...',
      fileDropAreaAction: 'Datei auswählen',
      fileDropAreaHint: 'Laden Sie ein JPG-, PNG-, GIF- oder WEBP-Bild hoch, welches kleiner als 10 MB ist',
      successMessage: 'Ihr Profil wurde aktualisiert.',
    },
    usernamePage: {
      title: 'Benutzernamen aktualisieren',
      successMessage: 'Ihr Benutzername wurde aktualisiert.',
    },
    emailAddressPage: {
      title: 'E-Mail-Adresse hinzufügen',
      emailCode: {
        formHint: 'An diese E-Mail-Adresse wird eine E-Mail mit einem Bestätigungscode gesendet.',
        formTitle: 'Verifizierungs-Schlüssel',
        formSubtitle: 'Geben Sie den Bestätigungscode ein, der an {{identifier}} gesendet wird',
        resendButton: 'Code erneut senden',
        successMessage: 'Die E-Mail-Adresse {{identifier}} wurde Ihrem Konto hinzugefügt.',
      },
      emailLink: {
        formHint: 'An diese E-Mail-Adresse wird eine E-Mail mit einem Bestätigungslink gesendet.',
        formTitle: 'Bestätigungslink',
        formSubtitle: 'Klicken Sie auf den Bestätigungslink in der an {{identifier}} gesendeten E-Mail',
        resendButton: 'Link erneut senden',
        successMessage: 'Die E-Mail-Adresse {{identifier}} wurde Ihrem Konto hinzugefügt.',
      },
      removeResource: {
        title: 'E-Mail-Adresse entfernen',
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2: 'Sie können sich nicht mehr mit dieser E-Mail-Adresse anmelden.',
        successMessage: '{{emailAddress}} wurde aus Ihrem Konto entfernt.',
      },
    },
    phoneNumberPage: {
      title: 'Telefonnummer hinzufügen',
      successMessage: '{{identifier}} wurde Ihrem Konto hinzugefügt.',
      infoText: 'An diese Telefonnummer wird eine SMS mit einem Bestätigungslink gesendet.',
      infoText__secondary: 'Nachrichten- und Datengebühren können anfallen.',
      removeResource: {
        title: 'Telefonnummer entfernen',
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2: 'Sie können sich nicht mehr mit dieser Telefonnummer anmelden.',
        successMessage: '{{phoneNumber}} wurde aus Ihrem Konto entfernt.',
      },
    },
    connectedAccountPage: {
      title: 'Verbundenes Konto hinzufügen',
      formHint: 'Wählen Sie einen Anbieter aus, um Ihr Konto zu verbinden.',
      formHint__noAccounts: 'Es sind keine externen Kontoanbieter verfügbar.',
      socialButtonsBlockButton: '{{provider|titleize}}-Konto verbinden',
      successMessage: 'Der Anbieter wurde Ihrem Konto hinzugefügt',
      removeResource: {
        title: 'Verbundenes Konto entfernen',
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2:
          'Sie können dieses verbundene Konto nicht mehr verwenden und alle abhängigen Funktionen funktionieren nicht mehr.',
        successMessage: '{{connectedAccount}} wurde aus Ihrem Konto entfernt.',
      },
    },
    web3WalletPage: {
      title: 'Web3-Wallet hinzufügen',
      subtitle__availableWallets: 'Wählen Sie ein Web3-Wallet aus, um sich mit Ihrem Konto zu verbinden.',
      subtitle__unavailableWallets: 'Es sind keine Web3-Wallets verfügbar.',
      successMessage: 'Die Brieftasche wurde Ihrem Konto hinzugefügt.',
      removeResource: {
        title: 'Entfernen Sie das Web3-Wallet',
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2: 'Sie können sich nicht mehr mit diesem Web3-Wallet anmelden.',
        successMessage: '{{web3Wallet}} wurde aus Ihrem Konto entfernt.',
      },
    },
    passwordPage: {
      title: 'Passwort festlegen',
      changePasswordTitle: 'Passwort ändern',
      successMessage: 'Ihr Passwort wurde festgelegt.',
      changePasswordSuccessMessage: 'Dein Passwort wurde aktualisiert.',
      sessionsSignedOutSuccessMessage: 'Alle anderen Geräte wurden abgemeldet.',
    },
    mfaPage: {
      title: 'Aktivieren Sie Zweifaktor-Authentifizierung',
      formHint: 'Wählen Sie eine Methode aus.',
    },
    mfaTOTPPage: {
      title: 'Authentifizierungs-App hinzufügen',
      verifyTitle: 'Verifizierungs-Schlüssel',
      verifySubtitle: 'Geben Sie den von Ihrem Authentifikator generierten Bestätigungscode ein',
      successMessage:
        'Die Bestätigung in zwei Schritten ist jetzt aktiviert. Bei der Anmeldung müssen Sie als zusätzlichen Schritt einen Bestätigungscode von diesem Authentifikator eingeben.',
      authenticatorApp: {
        infoText__ableToScan:
          'Richten Sie eine neue Anmeldemethode in Ihrer Authentifizierungs-App ein und scannen Sie den folgenden QR-Code, um ihn mit Ihrem Konto zu verknüpfen.',
        infoText__unableToScan:
          'Richten Sie eine neue Anmeldemethode in Ihrem Authentifikator ein und geben Sie den unten angegebenen Schlüssel ein.',
        inputLabel__unableToScan1:
          'Stellen Sie sicher, dass zeitbasierte oder einmalige Passwörter aktiviert sind, und schließen Sie dann die Verknüpfung Ihres Kontos ab.',
        inputLabel__unableToScan2:
          'Wenn Ihr Authentifikator TOTP-URIs unterstützt, können Sie alternativ auch die vollständige URI kopieren.',
        buttonAbleToScan__nonPrimary: 'Scannen Sie stattdessen den QR-Code',
        buttonUnableToScan__nonPrimary: 'QR-Code kann nicht gescannt werden?',
      },
      removeResource: {
        title: 'Entfernen Sie die Bestätigung in zwei Schritten',
        messageLine1: 'Bei der Anmeldung sind keine Bestätigungscodes von diesem Authentifikator mehr erforderlich.',
        messageLine2:
          'Ihr Konto ist möglicherweise nicht mehr so sicher. Sind Sie sich sicher, dass Sie fortfahren wollen?',
        successMessage: 'Die zweistufige Verifizierung über die Authentifizierungs-App wurde entfernt.',
      },
    },
    mfaPhoneCodePage: {
      title: 'SMS-Code-Bestätigung hinzufügen',
      primaryButton__addPhoneNumber: 'Fügen Sie eine Telefonnummer hinzu',
      subtitle__availablePhoneNumbers:
        'Wählen Sie eine Telefonnummer aus, um sich für die Bestätigung in zwei Schritten per SMS-Code zu registrieren.',
      subtitle__unavailablePhoneNumbers:
        'Es sind keine Telefonnummern verfügbar, um sich für die SMS-Code-Bestätigung in zwei Schritten zu registrieren.',
      successMessage:
        'Die SMS-Code-Bestätigung in zwei Schritten ist jetzt für diese Telefonnummer aktiviert. Bei der Anmeldung müssen Sie als zusätzlichen Schritt einen Bestätigungscode eingeben, der an diese Telefonnummer gesendet wird.',
      removeResource: {
        title: 'Entfernen Sie die Bestätigung in zwei Schritten',
        messageLine1: '{{identifier}} erhält bei der Anmeldung keine Bestätigungscodes mehr.',
        messageLine2: 'Ihr Konto ist möglicherweise nicht so sicher. Bist du dir sicher, dass du weitermachen willst?',
        successMessage: 'SMS-Code-Bestätigung in zwei Schritten wurde für {{mfaPhoneCode}} entfernt',
      },
    },
    backupCodePage: {
      title: 'Backup-Code-Verifizierung hinzufügen',
      title__codelist: 'Sicherungscodes',
      subtitle__codelist: 'Bewahren Sie die Codes sicher auf und halten Sie sie geheim.',
      infoText1: 'Backup-Codes werden für dieses Konto aktiviert.',
      infoText2:
        'Halten Sie die Backup-Codes geheim und bewahren Sie sie sicher auf. Sie können Sicherungscodes neu generieren, wenn Sie vermuten, dass sie kompromittiert wurden.',
      successSubtitle:
        'Sie können diese Codes verwenden, um sich bei Ihrem Konto anzumelden, wenn Sie den Zugriff auf Ihr Authentifizierungsgerät verlieren.',
      successMessage:
        'Sicherungscodes sind jetzt aktiviert. Sie können eines davon verwenden, um sich bei Ihrem Konto anzumelden, wenn Sie den Zugriff auf Ihr Authentifizierungsgerät verlieren. Jeder Code kann nur einmal verwendet werden.',
      actionLabel__copy: 'Kopiere alle',
      actionLabel__copied: 'Kopiert!',
      actionLabel__download: 'Laden Sie .txt herunter',
      actionLabel__print: 'Drucken',
    },
    deletePage: {
      title: 'Konto löschen',
      messageLine1: 'Sind Sie sicher, dass Sie ihr Konto löschen möchten?',
      messageLine2: 'Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden.',
      actionDescription: 'Geben Sie "Konto löschen" ein, um fortzufahren.',
      confirm: 'Konto löschen',
    },
  },
  userButton: {
    action__manageAccount: 'Konto verwalten',
    action__signOut: 'Ausloggen',
    action__signOutAll: 'Melden Sie sich von allen Konten ab',
    action__addAccount: 'Konto hinzufügen',
  },
  organizationSwitcher: {
    personalWorkspace: 'Persönlicher Arbeitsbereich',
    notSelected: 'Keine Organisation ausgewählt',
    action__createOrganization: 'Organisation erstellen',
    action__manageOrganization: 'Organisation verwalten',
  },
  impersonationFab: {
    title: 'Angemeldet als {{identifier}}',
    action__signOut: 'Ausloggen',
  },
  organizationProfile: {
    start: {
      headerTitle__members: 'Mitglieder',
      headerTitle__settings: 'Einstellungen',
      headerSubtitle__members: 'Anzeigen und Verwalten von Organisationsmitgliedern',
      headerSubtitle__settings: 'Organisationseinstellungen verwalten',
    },
    profilePage: {
      title: 'Organisationsprofil',
      subtitle: 'Organisationsprofil verwalten',
      successMessage: 'Die Organisation wurde aktualisiert.',
      dangerSection: {
        title: 'Achtung',
        leaveOrganization: {
          title: 'Organisation verlassen',
          messageLine1:
            'Möchten Sie diese Organisation wirklich verlassen? Sie verlieren den Zugriff auf diese Organisation und Ihre Anwendungen.',
          messageLine2: 'Diese Aktion ist dauerhaft und irreversibel.',
          successMessage: 'Sie haben die Organisation verlassen.',
        },
      },
    },
    invitePage: {
      title: 'Mitglieder einladen',
      subtitle: 'Laden Sie neue Mitglieder zu dieser Organisation ein',
      successMessage: 'Einladungen erfolgreich versendet',
      detailsTitle__inviteFailed:
        'Die Einladungen konnten nicht versendet werden. Beheben Sie Folgendes und versuchen Sie es erneut:',
      formButtonPrimary__continue: 'Einladungen verschicken',
    },
    membersPage: {
      detailsTitle__emptyRow: 'Keine Mitglieder zum Anzeigen',
      action__invite: 'Einladen',
      start: {
        headerTitle__active: 'Aktiv',
        headerTitle__invited: 'Eingeladen',
      },
      activeMembersTab: {
        tableHeader__user: 'Benutzer',
        tableHeader__joined: 'Trat bei',
        tableHeader__role: 'Rolle',
        tableHeader__actions: '',
        menuAction__remove: 'Mitglied entfernen',
      },
      invitedMembersTab: {
        tableHeader__invited: 'Eingeladen',
        menuAction__revoke: 'Einladung widerrufen',
      },
    },
  },
  createOrganization: {
    title: 'Organisation erstellen',
    formButtonSubmit: 'Organisation erstellen',
    subtitle: 'Legen Sie das Organisationsprofil fest',
    invitePage: {
      formButtonReset: 'Überspringen',
    },
  },
  unstable__errors: {
    identification_deletion_failed: '',
    phone_number_exists: 'Diese Telefonnummer ist bereits vergeben. Bitte wählen Sie eine Andere.',
    form_identifier_not_found: '',
    captcha_invalid:
      'Anmeldung aufgrund fehlgeschlagener Sicherheitsüberprüfung nicht erfolgreich. Bitte versuchen Sie es erneut oder kontaktieren Sie uns für weitere Unterstützung.',
    form_password_pwned:
      'Das gewählte Passwort wurde durch eine Datenpanne im Internet offengelegt. Wählen Sie aus Sicherheitsgründen bitte ein anderes Passwort',
    form_username_invalid_length: '',
    form_username_invalid_character: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
    form_password_incorrect: '',
    not_allowed_access: '',
    form_identifier_exists: 'Diese E-Mail-Adresse ist bereits vergeben. Bitte wählen Sie eine Andere.',
    form_password_validation_failed: 'Falsches Passwort',
    form_password_not_strong_enough: 'Passwort nicht stark genug',
    form_password_size_in_bytes_exceeded:
      'Das Passwort hat die maximale Anzahl an Bytes überschritten. Bitte kürzen oder Sonderzeichen entfernen.',
    passwordComplexity: {
      sentencePrefix: 'Das Passwort muss',
      minimumLength: 'mindestens {{length}} Zeichen lang sein',
      maximumLength: 'weniger als {{length}} Zeichen lang sein',
      requireNumbers: 'eine Zahl enthalten',
      requireLowercase: 'einen Kleinbuchstaben enthalten',
      requireUppercase: 'einen Großbuchstaben enthalten',
      requireSpecialCharacter: 'ein Sonderzeichen enthalten',
    },
    zxcvbn: {
      notEnough: 'Ihr Passwort ist nicht stark genug.',
      warnings: {
        straightRow: 'Gerade Linien von Tasten auf der Tastatur sind leicht zu erraten.',
        keyPattern: 'Kurze Tastaturmuster sind leicht zu erraten.',
        simpleRepeat: 'Sich wiederholende Zeichen wie "aaa" sind leicht zu erraten.',
        extendedRepeat: 'Sich wiederholende Zeichenmuster wie "abcabcabc" sind leicht zu erraten.',
        sequences: 'Häufige Zeichenfolgen wie "abc" sind leicht zu erraten.',
        recentYears: 'Die jüngsten Jahreszahlen sind leicht zu erraten.',
        dates: 'Ein Datum ist leicht zu erraten.',
        topTen: 'Dies ist ein sehr häufig verwendetes Passwort.',
        topHundred: 'Dies ist ein häufig verwendetes Passwort.',
        common: 'Dies ist ein oft verwendetes Passwort.',
        similarToCommon: 'Dies weist Ähnlichkeit zu anderen oft verwendeten Passwörtern auf.',
        wordByItself: 'Einzelne Wörter sind leicht zu erraten.',
        namesByThemselves: 'Einzelne Namen oder Nachnamen sind leicht zu erraten.',
        commonNames: 'Vornamen und Nachnamen sind leicht zu erraten.',
        userInputs: 'Es sollten keine persönlichen oder Seiten relevanten Daten vorkommen.',
        pwned: 'Ihr Passwort wurde durch eine Datenpanne im Internet offengelegt.',
      },
      suggestions: {
        l33t: "Vorhersehbare Buchstabenersetzungen wie '@' für 'a' vermeiden.",
        reverseWords: 'Umgekehrte Schreibweise von gebräuchlichen Wörtern vermeiden.',
        allUppercase: 'Einige, aber nicht alle Buchstaben groß schreiben.',
        capitalization: 'Nicht nur den ersten Buchstaben groß schreiben.',
        dates: 'Daten, die mit persönlichen Daten in Verbindung gebracht werden können, vermeiden.',
        recentYears: 'Die jüngsten Jahreszahlen vermeiden.',
        associatedYears: 'Jahre, die mit persönlichen Daten in Verbindung gebracht werden können, vermeiden.',
        sequences: 'Häufige Zeichenfolgen vermeiden.',
        repeated: 'Wort- und Zeichenwiederholungen vermeiden.',
        longerKeyboardPattern: 'Längere Tastaturmuster in unterschiedlicher Tipprichtung verwenden.',
        anotherWord: 'Weitere Wörter, die weniger häufig vorkommen, hinzufügen.',
        useWords: 'Mehrere Wörter verwenden, aber allgemeine Phrasen vermeiden.',
        noNeed:
          'Es ist möglich, starke Passwörter zu erstellen, ohne Symbole, Zahlen oder Großbuchstaben zu verwenden.',
        pwned: 'Wenn Sie dieses Passwort an anderer Stelle verwenden, sollten Sie es ändern.',
      },
    },
  },
  dates: {
    previous6Days: "Letzte {{ date | weekday('de-DE','long') }} um {{ date | timeString('de-DE') }}",
    lastDay: "Gestern um {{ date | timeString('de-DE') }}",
    sameDay: "Heute um {{ date | timeString('de-DE') }}",
    nextDay: "Morgen um {{ date | timeString('de-DE') }}",
    next6Days: "{{ date | weekday('de-DE','long') }} bei {{ date | timeString('de-DE') }}",
    numeric: "{{ date | numeric('de-DE') }}",
  },
} as const;
