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

export const deDE: LocalizationResource = {
  locale: 'de-DE',
  backButton: 'Zurück',
  badge__default: 'Standard',
  badge__otherImpersonatorDevice: 'Anderes Imitationsgerät',
  badge__primary: 'Primär',
  badge__requiresAction: 'Erfordert Handeln',
  badge__thisDevice: 'Dieses Gerät',
  badge__unverified: 'Unbestätigt',
  badge__userDevice: 'Benutzergerät',
  badge__you: 'Du',
  createOrganization: {
    formButtonSubmit: 'Organisation erstellen',
    invitePage: {
      formButtonReset: 'Überspringen',
    },
    title: 'Organisation erstellen',
  },
  dates: {
    lastDay: "Gestern um {{ date | timeString('de-DE') }}",
    next6Days: "{{ date | weekday('de-DE','long') }} bei {{ date | timeString('de-DE') }}",
    nextDay: "Morgen um {{ date | timeString('de-DE') }}",
    numeric: "{{ date | numeric('de-DE') }}",
    previous6Days: "Letzte {{ date | weekday('de-DE','long') }} um {{ date | timeString('de-DE') }}",
    sameDay: "Heute um {{ date | timeString('de-DE') }}",
  },
  dividerText: 'oder',
  footerActionLink__useAnotherMethod: 'Verwenden Sie eine andere Methode',
  footerPageLink__help: 'Hilfe',
  footerPageLink__privacy: 'Privatsphäre',
  footerPageLink__terms: 'Bedingungen',
  formButtonPrimary: 'Fortsetzen',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Passwort vergessen?',
  formFieldError__matchingPasswords: 'Passwörter stimmen überein.',
  formFieldError__notMatchingPasswords: 'Passwörter stimmen nicht überein.',
  formFieldError__verificationLinkExpired:
    'Der Bestätigungslink ist abgelaufen. Bitte fordern Sie einen neuen Link an.',
  formFieldHintText__optional: 'Optional',
  formFieldHintText__slug:
    'Der Slug ist eine für Menschen lesbare ID. Sie muss einzigartig sein und wird oft in URLs verwendet.',
  formFieldInputPlaceholder__backupCode: 'Sicherheitscode eingeben',
  formFieldInputPlaceholder__emailAddress: 'E-Mail-Adresse eingeben',
  formFieldInputPlaceholder__emailAddress_username: 'E-Mail-Adresse oder Benutzername eingeben',
  formFieldInputPlaceholder__firstName: 'Vorname eingeben',
  formFieldInputPlaceholder__lastName: 'Nachname eingeben',
  formFieldInputPlaceholder__organizationDomain: 'Organisations-Domain eingeben',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'E-Mail-Adresse der Organisations-Domain eingeben',
  formFieldInputPlaceholder__organizationName: 'Name der Organisation eingeben',
  formFieldInputPlaceholder__password: 'Passwort eingeben',
  formFieldInputPlaceholder__phoneNumber: 'Telefonnummer eingeben',
  formFieldInputPlaceholder__username: 'Benutzername eingeben',
  formFieldLabel__automaticInvitations: 'Aktivieren Sie automatische Einladungen für diese Domain',
  formFieldLabel__backupCode: 'Sicherungscode',
  formFieldLabel__confirmDeletion: 'Bestätigung',
  formFieldLabel__confirmPassword: 'Passwort bestätigen',
  formFieldLabel__currentPassword: 'Aktuelles Passwort',
  formFieldLabel__emailAddress: 'E-Mail-Adresse',
  formFieldLabel__emailAddress_username: 'E-Mail-Adresse oder Benutzername',
  formFieldLabel__emailAddresses: 'E-Mail-Adressen',
  formFieldLabel__firstName: 'Vorname',
  formFieldLabel__lastName: 'Nachname',
  formFieldLabel__newPassword: 'Neues Passwort',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Ausstehende Einladungen und Vorschläge löschen',
  formFieldLabel__organizationDomainEmailAddress: 'E-Mail-Adresse für die Verifizierung',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Geben Sie eine E-Mail-Adresse dieser Domain ein, um einen Code zu erhalten und diese Domain zu verifizieren.',
  formFieldLabel__organizationName: 'Organisationsname',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Name des Passkeys',
  formFieldLabel__password: 'Passwort',
  formFieldLabel__phoneNumber: 'Telefonnummer',
  formFieldLabel__role: 'Rolle',
  formFieldLabel__signOutOfOtherSessions: 'Alle anderen Geräte abmelden',
  formFieldLabel__username: 'Nutzername',
  impersonationFab: {
    action__signOut: 'Ausloggen',
    title: 'Angemeldet als {{identifier}}',
  },
  maintenanceMode:
    'Wir führen derzeit Wartungsarbeiten durch, aber keine Sorge, es sollte nicht länger als ein paar Minuten dauern.',
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Mitglied',
  membershipRole__guestMember: 'Gast',
  organizationList: {
    action__createOrganization: 'Organisation erstellen',
    action__invitationAccept: 'Beitreten',
    action__suggestionsAccept: 'Beitritt anfragen',
    createOrganization: 'Organisation erstellen',
    invitationAcceptedLabel: 'Beitreten',
    subtitle: 'um fortzufahren zu {{applicationName}}',
    suggestionsAcceptedLabel: 'Genehmigung ausstehend',
    title: 'Konto auswählen',
    titleWithoutPersonal: 'Organisation auswählen',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Automatische Einladungen',
    badge__automaticSuggestion: 'Automatische Vorschläge',
    badge__manualInvitation: 'Keine automatische Aufnahme',
    badge__unverified: 'Nicht verifiziert',
    createDomainPage: {
      subtitle:
        'Fügen Sie die zu überprüfende Domain hinzu. Benutzer mit E-Mail-Adressen von dieser Domain können der Organisation automatisch beitreten oder einen Antrag auf Beitritt stellen.',
      title: 'Domain hinzufügen',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Die Einladungen konnten nicht versendet werden. Beheben Sie Folgendes und versuchen Sie es erneut:',
      formButtonPrimary__continue: 'Einladungen verschicken',
      selectDropdown__role: 'Rolle wählen',
      subtitle: 'Laden Sie neue Mitglieder zu dieser Organisation ein',
      successMessage: 'Einladungen erfolgreich versendet',
      title: 'Mitglieder einladen',
    },
    membersPage: {
      action__invite: 'Einladen',
      activeMembersTab: {
        menuAction__remove: 'Mitglied entfernen',
        tableHeader__actions: 'Aktionen',
        tableHeader__joined: 'Trat bei',
        tableHeader__role: 'Rolle',
        tableHeader__user: 'Benutzer',
      },
      detailsTitle__emptyRow: 'Keine Mitglieder zum Anzeigen',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Laden Sie Benutzer ein, indem Sie eine E-Mail-Domain mit Ihrer Organisation verbinden. Jeder, der sich mit dieser passenden E-Mail-Domain anmeldet, kann der Organisation jederzeit beitreten.',
          headerTitle: 'Automatische Einladungen',
          primaryButton: 'Verwalten Sie verifizierte Domains',
        },
        table__emptyRow: 'Keine Einladungen verfügbar',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Einladung widerrufen',
        tableHeader__invited: 'Eingeladen',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Benutzer, die sich mit einer passenden E-Mail-Domain anmelden, können einen Vorschlag für eine Beitrittsanfrage zu Ihrer Organisation sehen.',
          headerTitle: 'Automatische Vorschläge',
          primaryButton: 'Verifizierte Domains verwalten',
        },
        menuAction__approve: 'Bestätigen',
        menuAction__reject: 'Ablehnen',
        tableHeader__requested: 'Angefragte Zugänge',
        table__emptyRow: 'Keine Anfragen verfügbar',
      },
      start: {
        headerTitle__invitations: 'Einladungen',
        headerTitle__members: 'Mitglieder',
        headerTitle__requests: 'Anfragen',
      },
    },
    navbar: {
      description: 'Verwalten Sie ihre Organisation.',
      general: 'Allgemein',
      members: 'Mitglieder',
      title: 'Organisation',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Geben Sie "{{organizationName}}" unten ein, um fortzufahren.',
          messageLine1: 'Sind Sie sicher, dass Sie diese Organisation löschen wollen?',
          messageLine2: 'Diese Aktion ist dauerhaft und irreversibel.',
          successMessage: 'Sie haben die Organisation gelöscht.',
          title: 'Organisation löschen',
        },
        leaveOrganization: {
          actionDescription: 'Geben Sie "{{organizationName}}" unten ein, um fortzufahren.',
          messageLine1:
            'Möchten Sie diese Organisation wirklich verlassen? Sie verlieren den Zugriff auf diese Organisation und Ihre Anwendungen.',
          messageLine2: 'Diese Aktion ist dauerhaft und irreversibel.',
          successMessage: 'Sie haben die Organisation verlassen.',
          title: 'Organisation verlassen',
        },
        title: 'Achtung',
      },
      domainSection: {
        menuAction__manage: 'Verwalten',
        menuAction__remove: 'Löschen',
        menuAction__verify: 'Verifizieren',
        primaryButton: 'Domain hinzufügen',
        subtitle:
          'Erlauben Sie Benutzern, der Organisation automatisch beizutreten oder den Beitritt auf der Grundlage einer verifizierten E-Mail-Domain anzufragen.',
        title: 'Verifizierte Domains',
      },
      successMessage: 'Die Organisation wurde aktualisiert.',
      title: 'Organisationsprofil',
    },
    removeDomainPage: {
      messageLine1: 'Die E-mail-Domain {{domain}} wird entfernt.',
      messageLine2: 'Benutzer können der Organisation danach nicht mehr automatisch beitreten.',
      successMessage: '{{domain}} wurde entfernt.',
      title: 'Domain entfernen',
    },
    start: {
      headerTitle__general: 'Allgemein',
      headerTitle__members: 'Mitglieder',
      profileSection: {
        primaryButton: 'Profil bearbeiten',
        title: 'Organisationsprofil',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Das Entfernen dieser Domain betrifft die eingeladenen Benutzer.',
        removeDomainActionLabel__remove: 'Domain entfernen',
        removeDomainSubtitle: 'Sie können diese Domain von den verifizierten Domains entfernen',
        removeDomainTitle: 'Domain entfernen',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Benutzer werden bei der Anmeldung automatisch eingeladen, der Organisation beizutreten, und können jederzeit beitreten.',
        automaticInvitationOption__label: 'Automatische Einladungen',
        automaticSuggestionOption__description:
          'Benutzer erhalten einen Vorschlag für eine Beitrittsanfrage, müssen aber von einem Administrator genehmigt werden, bevor sie der Organisation beitreten können.',
        automaticSuggestionOption__label: 'Automatische Vorschläge',
        calloutInfoLabel: 'Änderungen des Anmeldemodus wirkt sich nur auf neue Benutzer aus.',
        calloutInvitationCountLabel: 'Ausstehende Einladungen gesendet an Benutzer: {{count}}',
        calloutSuggestionCountLabel: 'Ausstehende Vorschläge gesendet an Benutzer: {{count}}',
        manualInvitationOption__description: 'Benutzer können nur manuell in die Organisation eingeladen werden.',
        manualInvitationOption__label: 'Keine automatische Aufnahme',
        subtitle: 'Wählen Sie, wie Benutzer mit dieser Domain der Organisation beitreten können.',
      },
      start: {
        headerTitle__danger: 'Gefahr',
        headerTitle__enrollment: 'Optionen für die Aufnahme',
      },
      subtitle: 'Die Domain {{domain}} ist nun verifiziert. Bitte wählen Sie einen Aufnahmemodus aus.',
      title: '{{domain}} aktualisieren',
    },
    verifyDomainPage: {
      formSubtitle: 'Geben Sie den an Ihre E-Mail-Adresse gesendeten Verifizierungscode ein',
      formTitle: 'Verifizierungscode',
      resendButton: 'Sie haben keinen Code erhalten? Erneut senden',
      subtitle: 'Die Domain {{domainName}} muss per E-mail verifiziert werden.',
      subtitleVerificationCodeScreen:
        'Ein Verifizierungscode wurde an {{emailAddress}} gesendet. Geben Sie den Code ein, um fortzufahren.',
      title: 'Domain verifizieren',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Organisation erstellen',
    action__invitationAccept: 'Beitreten',
    action__manageOrganization: 'Organisation verwalten',
    action__suggestionsAccept: 'Beitritt anfragen',
    notSelected: 'Keine Organisation ausgewählt',
    personalWorkspace: 'Persönlicher Arbeitsbereich',
    suggestionsAcceptedLabel: 'Annahme ausstehend',
  },
  paginationButton__next: 'Nächste',
  paginationButton__previous: 'Vorherige',
  paginationRowText__displaying: 'Anzeigen',
  paginationRowText__of: 'von',
  reverification: {
    alternativeMethods: {
      actionLink: 'Klicken Sie hier, um eine alternative Methode zu verwenden',
      actionText: 'Verwenden Sie eine alternative Verifizierungsmethode',
      blockButton__backupCode: 'Mit Backup-Code verifizieren',
      blockButton__emailCode: 'Mit E-Mail-Code verifizieren',
      blockButton__password: 'Mit Passwort verifizieren',
      blockButton__phoneCode: 'Mit SMS-Code verifizieren',
      blockButton__totp: 'Mit TOTP verifizieren',
      getHelp: {
        blockButton__emailSupport: 'E-Mail-Support kontaktieren',
        content: 'Wenn Sie Hilfe benötigen, wenden Sie sich bitte an unseren Support.',
        title: 'Hilfe erhalten',
      },
      subtitle: 'Wählen Sie eine Methode, um sich zu verifizieren',
      title: 'Verifizierung erforderlich',
    },
    backupCodeMfa: {
      subtitle: 'Verwenden Sie den Backup-Code, der Ihnen bei der Registrierung zur Verfügung gestellt wurde.',
      title: 'Backup-Code Verifizierung',
    },
    emailCode: {
      formTitle: 'Geben Sie den Code ein, den wir an Ihre E-Mail-Adresse gesendet haben.',
      resendButton: 'Code erneut senden',
      subtitle: 'Überprüfen Sie Ihre E-Mail auf den Verifizierungscode.',
      title: 'E-Mail-Code Verifizierung',
    },
    noAvailableMethods: {
      message: 'Es sind keine Verifizierungsmethoden mehr verfügbar.',
      subtitle: 'Bitte kontaktieren Sie den Support, um Hilfe zu erhalten.',
      title: 'Keine verfügbaren Methoden',
    },
    password: {
      actionLink: 'Passwort zurücksetzen',
      subtitle: 'Geben Sie Ihr Passwort ein, um fortzufahren.',
      title: 'Passwort-Verifizierung',
    },
    phoneCode: {
      formTitle: 'Geben Sie den Code ein, den wir an Ihre Telefonnummer gesendet haben.',
      resendButton: 'Code erneut senden',
      subtitle: 'Überprüfen Sie Ihre SMS-Nachricht auf den Verifizierungscode.',
      title: 'SMS-Code Verifizierung',
    },
    phoneCodeMfa: {
      formTitle: 'Geben Sie den Code ein, den wir Ihnen per SMS gesendet haben.',
      resendButton: 'Code erneut senden',
      subtitle: 'Überprüfen Sie Ihre SMS auf den Verifizierungscode.',
      title: 'SMS-Code (MFA) Verifizierung',
    },
    totpMfa: {
      formTitle: 'Geben Sie den Code aus Ihrer Authentifikator-App ein.',
      subtitle: 'Verwenden Sie die Authentifikator-App, die Sie eingerichtet haben.',
      title: 'TOTP-Verifizierung (MFA)',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Konto hinzufügen',
      action__signOutAll: 'Von allen Konten abmelden',
      subtitle: 'Wählen Sie das Konto, mit dem Sie fortfahren möchten.',
      title: 'Wählen Sie ein Konto',
    },
    alternativeMethods: {
      actionLink: 'Hilfe',
      actionText: 'Haben Sie keine davon?',
      blockButton__backupCode: 'Verwenden Sie einen Backup-Code',
      blockButton__emailCode: 'Code an {{identifier}} senden',
      blockButton__emailLink: 'Link senden an {{identifier}}',
      blockButton__passkey: 'Melden Sie sich mit Ihrem Passkey an',
      blockButton__password: 'Melden Sie sich mit Ihrem Passwort an',
      blockButton__phoneCode: 'Code an {{identifier}} senden',
      blockButton__totp: 'Verwenden Sie Ihre Authentifizierungs-App',
      getHelp: {
        blockButton__emailSupport: 'Unterstützung per E-Mail',
        content:
          'Wenn Sie Schwierigkeiten haben, sich mit Ihrem Konto anzumelden, senden Sie uns eine E-Mail und wir werden mit Ihnen zusammenarbeiten, um den Zugriff so schnell wie möglich wiederherzustellen.',
        title: 'Hilfe',
      },
      subtitle: 'Haben Sie Probleme? Sie können eine der folgenden Methoden zur Anmeldung verwenden.',
      title: 'Verwenden Sie eine andere Methode',
    },
    backupCodeMfa: {
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Geben Sie einen Backup-Code ein',
    },
    emailCode: {
      formTitle: 'Bestätigungscode',
      resendButton: 'Code erneut senden',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Überprüfen Sie Ihren Posteingang',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'Die Anfrage stammt von einem nicht kompatiblen Client.',
        title: 'Client-Kompatibilitätsfehler',
      },
      expired: {
        subtitle: 'Kehren Sie zum ursprünglichen Tab zurück, um fortzufahren.',
        title: 'Dieser Bestätigungslink ist abgelaufen',
      },
      failed: {
        subtitle: 'Kehren Sie zum ursprünglichen Tab zurück, um fortzufahren.',
        title: 'Dieser Bestätigungslink ist ungültig',
      },
      formSubtitle: 'Verwenden Sie den an Ihre E-Mail gesendeten Bestätigungslink',
      formTitle: 'Bestätigungslink',
      loading: {
        subtitle: 'Sie werden in Kürze weitergeleitet',
        title: 'Einloggen...',
      },
      resendButton: 'Link erneut senden',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Überprüfen Sie Ihren Posteingang',
      unusedTab: {
        title: 'Sie können diesen Tab schließen',
      },
      verified: {
        subtitle: 'Sie werden in Kürze weitergeleitet',
        title: 'Erfolgreich angemeldet',
      },
      verifiedSwitchTab: {
        subtitle: 'Kehren Sie zum ursprünglichem Tab zurück, um fortzufahren',
        subtitleNewTab: 'Kehren Sie zum neu geöffneten Tab zurück, um fortzufahren',
        titleNewTab: 'In einem anderen Tab angemeldet',
      },
    },
    forgotPassword: {
      formTitle: 'Passwort-Code zurücksetzen',
      resendButton: 'Sie haben keinen Code erhalten? Erneut senden',
      subtitle: 'um Passwort zurückzusetzen',
      subtitle_email: 'Geben Sie zunächst den an Ihre E-Mail gesendeten Code ein',
      subtitle_phone: 'Geben Sie zunächst den auf Ihr Mobiltelefon geschickten Code ein',
      title: 'Passwort zurücksetzen',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Passwort zurücksetzen',
      label__alternativeMethods: 'Oder melden Sie sich mit einer anderen Methode an',
      title: 'Passwort vergessen?',
    },
    noAvailableMethods: {
      message: 'Die Anmeldung kann nicht fortgesetzt werden. Es ist kein Authentifizierungsfaktor verfügbar.',
      subtitle: 'Ein Fehler ist aufgetreten',
      title: 'Anmeldung nicht möglich',
    },
    passkey: {
      subtitle:
        'Die Verwendung Ihres Passkeys bestätigt, dass Sie es sind. Ihr Gerät kann nach Ihrem Fingerabdruck, Ihrem Gesicht oder der Bildschirmsperre fragen.',
      title: 'Verwenden Sie Ihren Passkey',
    },
    password: {
      actionLink: 'Verwenden Sie eine andere Methode',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Geben Sie Ihr Passwort ein',
    },
    passwordPwned: {
      title: 'Passwort kompromittiert',
    },
    phoneCode: {
      formTitle: 'Bestätigungscode',
      resendButton: 'Code erneut senden',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Schau auf dein Telefon',
    },
    phoneCodeMfa: {
      formTitle: 'Bestätigungscode',
      resendButton: 'Code erneut senden',
      subtitle: 'Um fortzufahren, geben Sie bitte den Bestätigungscode ein, der an Ihre Telefonnummer gesendet wurde',
      title: 'Schau auf dein Telefon',
    },
    resetPassword: {
      formButtonPrimary: 'Passwort zurücksetzen',
      requiredMessage:
        'Es existiert bereits ein Konto mit einer nicht verifizierten E-Mail Adresse. Bitte setzen Sie Ihr Passwort zur Sicherheit zurück.',
      successMessage: 'Ihr Passwort wurde erfolgreich geändert. Bitte warten Sie einen Moment, um Sie anzumelden.',
      title: 'Neues Passwort setzen',
    },
    resetPasswordMfa: {
      detailsLabel: 'Bevor wir Ihr Passwort zurücksetzen können, müssen wir Ihre Identität überprüfen.',
    },
    start: {
      actionLink: 'Anmelden',
      actionLink__join_waitlist: 'Warteliste beitreten',
      actionLink__use_email: 'E-mail nutzen',
      actionLink__use_email_username: 'E-mail oder Benutzernamen nutzen',
      actionLink__use_passkey: 'Passkey nutzen',
      actionLink__use_phone: 'Mobiltelefon nutzen',
      actionLink__use_username: 'Benutzername nutzen',
      actionText: 'Kein Account?',
      actionText__join_waitlist: 'Warteliste beitreten',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Einloggen',
      __experimental_titleCombined: undefined,
    },
    totpMfa: {
      formTitle: 'Bestätigungscode',
      subtitle:
        'Um fortzufahren, geben Sie bitte den Verifizierungscode ein, der von Ihrer Authenticator-App generiert wurde.',
      title: 'Bestätigung in zwei Schritten',
    },
  },
  signInEnterPasswordTitle: 'Geben Sie Ihr Passwort ein',
  signUp: {
    continue: {
      actionLink: 'Einloggen',
      actionText: 'Haben Sie ein Konto?',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Füllen Sie fehlende Felder aus',
    },
    emailCode: {
      formSubtitle: 'Geben Sie den Bestätigungscode ein, der an Ihre E-Mail-Adresse gesendet wurde',
      formTitle: 'Bestätigungscode',
      resendButton: 'Code erneut senden',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Bestätigen Sie Ihre E-Mail',
    },
    emailLink: {
      clientMismatch: {
        subtitle: 'Die Anfrage konnte nicht verarbeitet werden, da der Client nicht kompatibel ist.',
        title: 'Fehler: Inkompatibler Client',
      },
      formSubtitle: 'Verwenden Sie den an Ihre E-Mail-Adresse gesendeten Bestätigungslink',
      formTitle: 'Bestätigungslink',
      loading: {
        title: 'Anmeldung...',
      },
      resendButton: 'Link erneut senden',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Bestätigen Sie Ihre E-Mail',
      verified: {
        title: 'Erfolgreich angemeldet',
      },
      verifiedSwitchTab: {
        subtitle: 'Kehren Sie zum neu geöffneten Tab zurück, um fortzufahren',
        subtitleNewTab: 'Kehren Sie zum vorherigen Tab zurück, um fortzufahren',
        title: 'E-Mail erfolgreich verifiziert',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Ich stimme der {{ privacyPolicyLink || link("Datenschutzerklärung") }} zu',
        label__onlyTermsOfService: 'Ich stimme den {{ termsOfServiceLink || link("Nutzungsbedingungen") }} zu',
        label__termsOfServiceAndPrivacyPolicy:
          'Ich stimme den {{ termsOfServiceLink || link("Nutzungsbedingungen") }} und der {{ privacyPolicyLink || link("Datenschutzerklärung") }} zu',
      },
      continue: {
        subtitle: 'Bitte lesen und akzeptieren Sie die Bedingungen, um fortzufahren',
        title: 'Rechtliche Einwilligung',
      },
    },
    phoneCode: {
      formSubtitle: 'Geben Sie den Bestätigungscode ein, der an Ihre Telefonnummer gesendet wurde',
      formTitle: 'Bestätigungscode',
      resendButton: 'Code erneut senden',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Verifizieren Sie Ihre Telefonnummer',
    },
    restrictedAccess: {
      actionLink: 'Mehr erfahren',
      actionText: 'Zugang verweigert?',
      blockButton__emailSupport: 'E-Mail-Support kontaktieren',
      blockButton__joinWaitlist: 'Warteliste beitreten',
      subtitle: 'Ihr Zugang ist momentan eingeschränkt.',
      subtitleWaitlist: 'Treten Sie der Warteliste bei, um Benachrichtigungen zu erhalten.',
      title: 'Zugang verweigert',
    },

    start: {
      actionLink: 'Einloggen',
      actionLink__use_email: 'Mit E-Mail einloggen',
      actionLink__use_phone: 'Mit Telefonnummer einloggen',
      actionText: 'Haben Sie ein Konto?',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Erstelle deinen Account',
    },
  },
  socialButtonsBlockButton: 'Weiter mit {{provider|titleize}}',
  socialButtonsBlockButtonManyInView:
    'Zu viele Buttons angezeigt. Reduzieren Sie die Anzahl der Buttons, um fortzufahren.',
  unstable__errors: {
    already_a_member_in_organization: 'Sie sind bereits Mitglied in dieser Organisation.',
    captcha_invalid:
      'Anmeldung aufgrund fehlgeschlagener Sicherheitsüberprüfung nicht erfolgreich. Bitte versuchen Sie es erneut oder kontaktieren Sie uns für weitere Unterstützung.',
    captcha_unavailable:
      'Die Anmeldung ist aufgrund einer fehlgeschlagenen Bot-Validierung fehlgeschlagen. Bitte aktualisieren Sie die Seite, um es erneut zu versuchen, oder wenden Sie sich an den Support, um weitere Unterstützung zu erhalten.',
    form_code_incorrect: 'Der eingegebene Code ist falsch. Bitte überprüfen Sie ihn und versuchen Sie es erneut.',
    form_identifier_exists: 'Diese E-Mail-Adresse ist bereits vergeben. Bitte wählen Sie eine andere.',
    form_identifier_exists__email_address: 'Diese E-Mail-Adresse ist bereits vergeben. Bitte wählen Sie eine andere.',
    form_identifier_exists__phone_number: 'Diese Telefonnummer ist bereits vergeben. Bitte wählen Sie eine andere.',
    form_identifier_exists__username: 'Dieser Benutzername ist bereits vergeben. Bitte wählen Sie einen anderen.',
    form_identifier_not_found: 'Die eingegebene Kennung wurde nicht gefunden. Bitte überprüfen Sie Ihre Eingabe.',
    form_param_format_invalid: 'Das Format des eingegebenen Parameters ist ungültig.',
    form_param_format_invalid__email_address: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    form_param_format_invalid__phone_number: 'Die Telefonnummer muss ein gültiges internationales Format haben.',
    form_param_max_length_exceeded__first_name: 'Der Vorname sollte nicht mehr als 256 Zeichen umfassen.',
    form_param_max_length_exceeded__last_name: 'Der Nachname sollte nicht mehr als 256 Zeichen umfassen.',
    form_param_max_length_exceeded__name: 'Der Name sollte nicht länger als 256 Zeichen sein.',
    form_param_nil: 'Ein erforderliches Feld wurde nicht ausgefüllt. Bitte überprüfen Sie Ihre Eingaben.',
    form_param_value_invalid: 'Der eingegebene Wert ist ungültig.',
    form_password_incorrect: 'Das eingegebene Passwort ist falsch.',
    form_password_length_too_short: 'Das Passwort ist zu kurz. Es muss mindestens 8 Zeichen lang sein.',
    form_password_not_strong_enough: 'Passwort nicht stark genug.',
    form_password_pwned:
      'Das gewählte Passwort wurde bei einem Datenleck im Internet gefunden. Wählen Sie aus Sicherheitsgründen bitte ein anderes Passwort.',
    form_password_pwned__sign_in:
      'Dieses Passwort wurde in einem Datenleck gefunden und kann nicht verwendet werden. Bitte setzen Sie Ihr Passwort zurück.',
    form_password_size_in_bytes_exceeded:
      'Das Passwort hat die maximale Anzahl an Bytes überschritten. Bitte kürzen oder Sonderzeichen entfernen.',
    form_password_validation_failed: 'Falsches Passwort.',
    form_username_invalid_character:
      'Der Benutzername enthält ungültige Zeichen. Bitte verwenden Sie nur alphanumerische Zeichen und Unterstriche.',
    form_username_invalid_length: 'Der Benutzername muss zwischen 3 und 30 Zeichen lang sein.',
    identification_deletion_failed: 'Sie können Ihre letzte Kennung nicht löschen.',
    not_allowed_access: undefined,
    organization_domain_blocked: undefined,
    organization_domain_common: undefined,
    organization_domain_exists_for_enterprise_connection: undefined,
    organization_membership_quota_exceeded: undefined,
    organization_minimum_permissions_needed: undefined,
    passkey_already_exists: 'Auf diesem Gerät ist bereits ein Passkey registriert.',
    passkey_not_supported: 'Passkeys werden auf diesem Gerät nicht unterstützt.',
    passkey_pa_not_supported:
      'Die Registrierung erfordert einen Plattformauthentifikator, der vom Gerät nicht unterstützt wird.',
    passkey_registration_cancelled:
      'Die Passkey-Registrierung wurde abgebrochen oder das Zeitlimit wurde überschritten.',
    passkey_retrieval_cancelled: 'Die Passkey-Registrierung wurde abgebrochen oder das Zeitlimit wurde überschritten.',
    passwordComplexity: {
      maximumLength: 'weniger als {{length}} Zeichen lang sein',
      minimumLength: 'mindestens {{length}} Zeichen lang sein',
      requireLowercase: 'einen Kleinbuchstaben enthalten',
      requireNumbers: 'eine Zahl enthalten',
      requireSpecialCharacter: 'ein Sonderzeichen enthalten',
      requireUppercase: 'einen Großbuchstaben enthalten',
      sentencePrefix: 'Das Passwort muss',
    },
    phone_number_exists: 'Diese Telefonnummer ist bereits vergeben. Bitte wählen Sie eine Andere.',
    zxcvbn: {
      couldBeStronger: 'Ihr Passwort funktioniert, könnte aber besser sein. Versuchen Sie, mehr Zeichen hinzuzufügen.',
      goodPassword: 'Ihr Passwort erfüllt alle notwendigen Anforderungen.',
      notEnough: 'Ihr Passwort ist nicht stark genug.',
      suggestions: {
        allUppercase: 'Einige, aber nicht alle Buchstaben groß schreiben.',
        anotherWord: 'Weitere Wörter, die weniger häufig vorkommen, hinzufügen.',
        associatedYears: 'Jahre, die mit persönlichen Daten in Verbindung gebracht werden können, vermeiden.',
        capitalization: 'Nicht nur den ersten Buchstaben groß schreiben.',
        dates: 'Daten, die mit persönlichen Daten in Verbindung gebracht werden können, vermeiden.',
        l33t: "Vorhersehbare Buchstabenersetzungen wie '@' für 'a' vermeiden.",
        longerKeyboardPattern: 'Längere Tastaturmuster in unterschiedlicher Tipprichtung verwenden.',
        noNeed:
          'Es ist möglich, starke Passwörter zu erstellen, ohne Symbole, Zahlen oder Großbuchstaben zu verwenden.',
        pwned: 'Wenn Sie dieses Passwort an anderer Stelle verwenden, sollten Sie es ändern.',
        recentYears: 'Die jüngsten Jahreszahlen vermeiden.',
        repeated: 'Wort- und Zeichenwiederholungen vermeiden.',
        reverseWords: 'Umgekehrte Schreibweise von gebräuchlichen Wörtern vermeiden.',
        sequences: 'Häufige Zeichenfolgen vermeiden.',
        useWords: 'Mehrere Wörter verwenden, aber allgemeine Phrasen vermeiden.',
      },
      warnings: {
        common: 'Dies ist ein oft verwendetes Passwort.',
        commonNames: 'Vornamen und Nachnamen sind leicht zu erraten.',
        dates: 'Ein Datum ist leicht zu erraten.',
        extendedRepeat: 'Sich wiederholende Zeichenmuster wie "abcabcabc" sind leicht zu erraten.',
        keyPattern: 'Kurze Tastaturmuster sind leicht zu erraten.',
        namesByThemselves: 'Einzelne Namen oder Nachnamen sind leicht zu erraten.',
        pwned: 'Ihr Passwort wurde durch eine Datenpanne im Internet offengelegt.',
        recentYears: 'Die jüngsten Jahreszahlen sind leicht zu erraten.',
        sequences: 'Häufige Zeichenfolgen wie "abc" sind leicht zu erraten.',
        similarToCommon: 'Dies weist Ähnlichkeit zu anderen oft verwendeten Passwörtern auf.',
        simpleRepeat: 'Sich wiederholende Zeichen wie "aaa" sind leicht zu erraten.',
        straightRow: 'Gerade Linien von Tasten auf der Tastatur sind leicht zu erraten.',
        topHundred: 'Dies ist ein häufig verwendetes Passwort.',
        topTen: 'Dies ist ein sehr häufig verwendetes Passwort.',
        userInputs: 'Es sollten keine persönlichen oder Seiten relevanten Daten vorkommen.',
        wordByItself: 'Einzelne Wörter sind leicht zu erraten.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Konto hinzufügen',
    action__manageAccount: 'Konto verwalten',
    action__signOut: 'Ausloggen',
    action__signOutAll: 'Melden Sie sich von allen Konten ab',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Kopiert!',
      actionLabel__copy: 'Kopiere alle',
      actionLabel__download: 'Laden Sie .txt herunter',
      actionLabel__print: 'Drucken',
      infoText1: 'Backup-Codes werden für dieses Konto aktiviert.',
      infoText2:
        'Halten Sie die Backup-Codes geheim und bewahren Sie sie sicher auf. Sie können Sicherungscodes neu generieren, wenn Sie vermuten, dass sie kompromittiert wurden.',
      subtitle__codelist: 'Bewahren Sie die Codes sicher auf und halten Sie sie geheim.',
      successMessage:
        'Sicherungscodes sind jetzt aktiviert. Sie können eines davon verwenden, um sich bei Ihrem Konto anzumelden, wenn Sie den Zugriff auf Ihr Authentifizierungsgerät verlieren. Jeder Code kann nur einmal verwendet werden.',
      successSubtitle:
        'Sie können diese Codes verwenden, um sich bei Ihrem Konto anzumelden, wenn Sie den Zugriff auf Ihr Authentifizierungsgerät verlieren.',
      title: 'Backup-Code-Verifizierung hinzufügen',
      title__codelist: 'Sicherungscodes',
    },
    connectedAccountPage: {
      formHint: 'Wählen Sie einen Anbieter aus, um Ihr Konto zu verbinden.',
      formHint__noAccounts: 'Es sind keine externen Kontoanbieter verfügbar.',
      removeResource: {
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2:
          'Sie können dieses verbundene Konto nicht mehr verwenden und alle abhängigen Funktionen funktionieren nicht mehr.',
        successMessage: '{{connectedAccount}} wurde aus Ihrem Konto entfernt.',
        title: 'Verbundenes Konto entfernen',
      },
      socialButtonsBlockButton: '{{provider|titleize}}-Konto verbinden',
      successMessage: 'Der Anbieter wurde Ihrem Konto hinzugefügt',
      title: 'Verbundenes Konto hinzufügen',
    },
    deletePage: {
      actionDescription: 'Geben Sie "Konto löschen" ein, um fortzufahren.',
      confirm: 'Konto löschen',
      messageLine1: 'Sind Sie sicher, dass Sie ihr Konto löschen möchten?',
      messageLine2: 'Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden.',
      title: 'Konto löschen',
    },
    emailAddressPage: {
      emailCode: {
        formSubtitle: 'Geben Sie den Bestätigungscode ein, der an {{identifier}} gesendet wird',
        formTitle: 'Verifizierungs-Schlüssel',
        resendButton: 'Code erneut senden',
        successMessage: 'Die E-Mail-Adresse {{identifier}} wurde Ihrem Konto hinzugefügt.',
      },
      emailLink: {
        formSubtitle: 'Klicken Sie auf den Bestätigungslink in der an {{identifier}} gesendeten E-Mail',
        formTitle: 'Bestätigungslink',
        resendButton: 'Link erneut senden',
        successMessage: 'Die E-Mail-Adresse {{identifier}} wurde Ihrem Konto hinzugefügt.',
      },
      enterpriseSsoLink: {
        formSubtitle: undefined,
        resendButton: undefined,
        successMessage: undefined,
      },
      formHint: undefined,
      removeResource: {
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2: 'Sie können sich nicht mehr mit dieser E-Mail-Adresse anmelden.',
        successMessage: '{{emailAddress}} wurde aus Ihrem Konto entfernt.',
        title: 'E-Mail-Adresse entfernen',
      },
      title: 'E-Mail-Adresse hinzufügen',
      verifyTitle: 'E-Mail Adresse verifizieren',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'Fortsetzen',
    formButtonPrimary__finish: 'Fertig',
    formButtonPrimary__remove: 'Entfernen',
    formButtonPrimary__save: 'Speichern',
    formButtonReset: 'Zurücksetzen',
    mfaPage: {
      formHint: 'Wählen Sie eine Methode aus.',
      title: 'Aktivieren Sie Zweifaktor-Authentifizierung',
    },
    mfaPhoneCodePage: {
      backButton: 'Vorhandene Nummer verwenden',
      primaryButton__addPhoneNumber: 'Fügen Sie eine Telefonnummer hinzu',
      removeResource: {
        messageLine1: '{{identifier}} erhält bei der Anmeldung keine Bestätigungscodes mehr.',
        messageLine2: 'Ihr Konto ist möglicherweise nicht so sicher. Bist du dir sicher, dass du weitermachen willst?',
        successMessage: 'SMS-Code-Bestätigung in zwei Schritten wurde für {{mfaPhoneCode}} entfernt',
        title: 'Entfernen Sie die Bestätigung in zwei Schritten',
      },
      subtitle__availablePhoneNumbers:
        'Wählen Sie eine Telefonnummer aus, um sich für die Bestätigung in zwei Schritten per SMS-Code zu registrieren.',
      subtitle__unavailablePhoneNumbers:
        'Es sind keine Telefonnummern verfügbar, um sich für die SMS-Code-Bestätigung in zwei Schritten zu registrieren.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'SMS-Code-Bestätigung hinzufügen',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Scannen Sie stattdessen den QR-Code',
        buttonUnableToScan__nonPrimary: 'QR-Code kann nicht gescannt werden?',
        infoText__ableToScan:
          'Richten Sie eine neue Anmeldemethode in Ihrer Authentifizierungs-App ein und scannen Sie den folgenden QR-Code, um ihn mit Ihrem Konto zu verknüpfen.',
        infoText__unableToScan:
          'Richten Sie eine neue Anmeldemethode in Ihrem Authentifikator ein und geben Sie den unten angegebenen Schlüssel ein.',
        inputLabel__unableToScan1:
          'Stellen Sie sicher, dass zeitbasierte oder einmalige Passwörter aktiviert sind, und schließen Sie dann die Verknüpfung Ihres Kontos ab.',
        inputLabel__unableToScan2:
          'Wenn Ihr Authentifikator TOTP-URIs unterstützt, können Sie alternativ auch die vollständige URI kopieren.',
      },
      removeResource: {
        messageLine1: 'Bei der Anmeldung sind keine Bestätigungscodes von diesem Authentifikator mehr erforderlich.',
        messageLine2:
          'Ihr Konto ist möglicherweise nicht mehr so sicher. Sind Sie sich sicher, dass Sie fortfahren wollen?',
        successMessage: 'Die zweistufige Verifizierung über die Authentifizierungs-App wurde entfernt.',
        title: 'Entfernen Sie die Bestätigung in zwei Schritten',
      },
      successMessage:
        'Die Bestätigung in zwei Schritten ist jetzt aktiviert. Bei der Anmeldung müssen Sie als zusätzlichen Schritt einen Bestätigungscode von diesem Authentifikator eingeben.',
      title: 'Authentifizierungs-App hinzufügen',
      verifySubtitle: 'Geben Sie den von Ihrem Authentifikator generierten Bestätigungscode ein',
      verifyTitle: 'Verifizierungs-Schlüssel',
    },
    mobileButton__menu: 'Menü',
    navbar: {
      account: 'Profil',
      description: 'Verwalten Sie Ihre Kontoinformationen.',
      security: 'Sicherheit',
      title: 'Benutzerkonto',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} wird von diesem Konto entfernt.',
        title: 'Passkey entfernen',
      },
      subtitle__rename: 'Sie können den Namen des Passkeys ändern, um ihn leichter zu finden.',
      title__rename: 'Passkey umbenennen',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Es wird empfohlen, sich von allen anderen Geräten abzumelden, die möglicherweise Ihr altes Passwort verwendet haben.',
      readonly:
        'Ihr Passwort kann derzeit nicht geändert werden, da Sie sich nur über die Enterprise-Verbindung anmelden können.',
      successMessage__set: 'Ihr Passwort wurde festgelegt.',
      successMessage__signOutOfOtherSessions: 'Alle anderen Geräte wurden abgemeldet.',
      successMessage__update: 'Dein Passwort wurde aktualisiert.',
      title__set: 'Passwort festlegen',
      title__update: 'Passwort ändern',
    },
    phoneNumberPage: {
      infoText: 'An diese Telefonnummer wird eine SMS mit einem Bestätigungslink gesendet.',
      removeResource: {
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2: 'Sie können sich nicht mehr mit dieser Telefonnummer anmelden.',
        successMessage: '{{phoneNumber}} wurde aus Ihrem Konto entfernt.',
        title: 'Telefonnummer entfernen',
      },
      successMessage: '{{identifier}} wurde Ihrem Konto hinzugefügt.',
      title: 'Telefonnummer hinzufügen',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: 'Laden Sie ein JPG-, PNG-, GIF- oder WEBP-Bild hoch, welches kleiner als 10 MB ist',
      imageFormDestructiveActionSubtitle: 'Bild entfernen',
      imageFormSubtitle: 'Bild hochladen',
      imageFormTitle: 'Profilbild',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Ihr Profil wurde aktualisiert.',
      title: 'Profil aktualisieren',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Vom Gerät abmelden',
        title: 'Aktive Geräte',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Versuchen Sie es nochmal',
        actionLabel__reauthorize: 'Jetzt autorisieren',
        destructiveActionTitle: 'Entfernen',
        primaryButton: 'Konto verbinden',
        subtitle__disconnected: 'Ihr Konto ist derzeit getrennt. Bitte verbinden Sie es erneut.',
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Verbundene Konten',
      },
      dangerSection: {
        deleteAccountButton: 'Konto löschen',
        title: 'Achtung',
      },
      emailAddressesSection: {
        destructiveAction: 'E-Mail-Adresse entfernen',
        detailsAction__nonPrimary: 'Als primär festlegen',
        detailsAction__primary: 'Verifizierung abschließen',
        detailsAction__unverified: 'Verifizierung abschließen',
        primaryButton: 'Fügen Sie eine E-Mail-Adresse hinzu',
        title: 'E-Mail-Adressen',
      },
      enterpriseAccountsSection: {
        title: 'Unternehmens-Konten',
      },
      headerTitle__account: 'Konto',
      headerTitle__security: 'Sicherheit',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Codes neu generieren',
          headerTitle: 'Backup-Codes',
          subtitle__regenerate:
            'Generieren Sie einen neuen Satz sicherer Backup-Codes. Alte Backup-Code werden gelöscht und können nicht mehr verwendet werden.',
          title__regenerate: 'Backup-Codes neu generieren',
        },
        phoneCode: {
          actionLabel__setDefault: 'Als Standard einstellen',
          destructiveActionLabel: 'Telefonnummer entfernen',
        },
        primaryButton: 'Aktivieren Sie die Zweifaktor-Authentifizierung',
        title: 'Zweifaktor-Authentifizierung',
        totp: {
          destructiveActionTitle: 'Entfernen',
          headerTitle: 'Authentifizierungs-App',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Entfernen',
        menuAction__rename: 'Umbenennen',
        title: 'Passkeys',
      },
      passwordSection: {
        primaryButton__setPassword: 'Passwort festlegen',
        primaryButton__updatePassword: 'Passwort ändern',
        title: 'Passwort',
      },
      phoneNumbersSection: {
        destructiveAction: 'Telefonnummer entfernen',
        detailsAction__nonPrimary: 'Als primär festlegen',
        detailsAction__primary: 'Verifizierung abschließen',
        detailsAction__unverified: 'Verifizierung abschließen',
        primaryButton: 'Fügen Sie eine Telefonnummer hinzu',
        title: 'Telefonnummern',
      },
      profileSection: {
        primaryButton: 'Profil bearbeiten',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Benutzernamen festlegen',
        primaryButton__updateUsername: 'Benutzernamen ändern',
        title: 'Nutzername',
      },
      web3WalletsSection: {
        destructiveAction: 'Wallet entfernen',
        primaryButton: 'Web3-Wallets',
        title: 'Web3-Wallets',
      },
    },
    usernamePage: {
      successMessage: 'Ihr Benutzername wurde aktualisiert.',
      title__set: 'Benutzernamen aktualisieren',
      title__update: 'Benutzernamen aktualisieren',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2: 'Sie können sich nicht mehr mit diesem Web3-Wallet anmelden.',
        successMessage: '{{web3Wallet}} wurde aus Ihrem Konto entfernt.',
        title: 'Entfernen Sie das Web3-Wallet',
      },
      subtitle__availableWallets: 'Wählen Sie ein Web3-Wallet aus, um sich mit Ihrem Konto zu verbinden.',
      subtitle__unavailableWallets: 'Es sind keine Web3-Wallets verfügbar.',
      successMessage: 'Die Brieftasche wurde Ihrem Konto hinzugefügt.',
      title: 'Web3-Wallet hinzufügen',
      web3WalletButtonsBlockButton: undefined,
    },
  },
  waitlist: {
    start: {
      actionLink: 'Jetzt anmelden',
      actionText: 'Kein Zugang? Auf die Warteliste setzen!',
      formButton: 'Zur Warteliste hinzufügen',
      subtitle: 'Es tut uns leid, aber derzeit sind keine Plätze verfügbar.',
      title: 'Warteliste beitreten',
    },
    success: {
      message:
        'Sie wurden erfolgreich auf die Warteliste gesetzt. Wir benachrichtigen Sie, sobald Plätze verfügbar sind.',
      subtitle: 'Vielen Dank für Ihre Geduld. Sie erhalten eine Benachrichtigung, sobald der Zugang freigegeben wird.',
      title: 'Erfolgreich auf die Warteliste gesetzt',
    },
  },
} as const;
