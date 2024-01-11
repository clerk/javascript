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
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'Geben oder fügen Sie eine oder mehrere E-Mail-Adressen ein, getrennt durch Leerzeichen oder Kommas',
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
  formFieldLabel__backupCode: 'Sicherungscode',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Passwort bestätigen',
  formFieldLabel__currentPassword: 'Aktuelles Passwort',
  formFieldLabel__emailAddress: 'E-Mail-Adresse',
  formFieldLabel__emailAddress_username: 'E-Mail-Adresse oder Benutzername',
  formFieldLabel__emailAddresses: 'E-Mail-Adressen',
  formFieldLabel__firstName: 'Vorname',
  formFieldLabel__lastName: 'Nachname',
  formFieldLabel__newPassword: 'Neues Passwort',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Organisationsname',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__password: 'Passwort',
  formFieldLabel__phoneNumber: 'Telefonnummer',
  formFieldLabel__role: 'Rolle',
  formFieldLabel__signOutOfOtherSessions: 'Alle anderen Geräte abmelden',
  formFieldLabel__username: 'Nutzername',
  impersonationFab: {
    action__signOut: 'Ausloggen',
    title: 'Angemeldet als {{identifier}}',
  },
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Mitglied',
  membershipRole__guestMember: 'Gast',
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
      detailsTitle__inviteFailed:
        'Die Einladungen konnten nicht versendet werden. Beheben Sie Folgendes und versuchen Sie es erneut:',
      formButtonPrimary__continue: 'Einladungen verschicken',
      subtitle: 'Laden Sie neue Mitglieder zu dieser Organisation ein',
      successMessage: 'Einladungen erfolgreich versendet',
      title: 'Mitglieder einladen',
    },
    membersPage: {
      action__invite: 'Einladen',
      activeMembersTab: {
        menuAction__remove: 'Mitglied entfernen',
        tableHeader__actions: '',
        tableHeader__joined: 'Trat bei',
        tableHeader__role: 'Rolle',
        tableHeader__user: 'Benutzer',
      },
      detailsTitle__emptyRow: 'Keine Mitglieder zum Anzeigen',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invite users by connecting an email domain with your organization. Anyone who signs up with a matching email domain will be able to join the organization anytime.',
          headerTitle: 'Automatic invitations',
          primaryButton: 'Manage verified domains',
        },
        manualInvitations: {
          headerSubtitle: 'Manually invite members and manage existing invitations.',
          headerTitle: 'Individual invitations',
        },
        table__emptyRow: 'No invitations to display',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Einladung widerrufen',
        tableHeader__invited: 'Eingeladen',
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
        requests: {
          headerSubtitle: 'Browse and manage users who requested to join the organization.',
          headerTitle: 'Requests',
        },
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
            'Möchten Sie diese Organisation wirklich verlassen? Sie verlieren den Zugriff auf diese Organisation und Ihre Anwendungen.',
          messageLine2: 'Diese Aktion ist dauerhaft und irreversibel.',
          successMessage: 'Sie haben die Organisation verlassen.',
          title: 'Organisation verlassen',
        },
        title: 'Achtung',
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
      successMessage: 'Die Organisation wurde aktualisiert.',
      title: 'Organisationsprofil',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Mitglieder',
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
        formButton__save: 'Save',
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
    action__createOrganization: 'Organisation erstellen',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Organisation verwalten',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Keine Organisation ausgewählt',
    personalWorkspace: 'Persönlicher Arbeitsbereich',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'Nächste',
  paginationButton__previous: 'Vorherige',
  paginationRowText__displaying: 'Anzeigen',
  paginationRowText__of: 'von',
  signIn: {
    alternativeMethods: {
      actionLink: 'Hilfe',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Verwenden Sie einen Backup-Code',
      blockButton__emailCode: 'Code an {{identifier}} senden',
      blockButton__emailLink: 'Link senden an {{identifier}}',
      blockButton__password: 'Melden Sie sich mit Ihrem Passwort an',
      blockButton__phoneCode: 'Code an {{identifier}} senden',
      blockButton__totp: 'Verwenden Sie Ihre Authentifizierungs-App',
      getHelp: {
        blockButton__emailSupport: 'Unterstützung per E-Mail',
        content:
          'Wenn Sie Schwierigkeiten haben, sich mit Ihrem Konto anzumelden, senden Sie uns eine E-Mail und wir werden mit Ihnen zusammenarbeiten, um den Zugriff so schnell wie möglich wiederherzustellen.',
        title: 'Hilfe',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
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
      formTitle: 'Reset password code',
      resendButton: "Didn't receive a code? Resend",
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Reset your password',
      label__alternativeMethods: 'Or, sign in with another method',
      title: 'Forgot Password?',
    },
    noAvailableMethods: {
      message: 'Die Anmeldung kann nicht fortgesetzt werden. Es ist kein Authentifizierungsfaktor verfügbar.',
      subtitle: 'Ein Fehler ist aufgetreten',
      title: 'Anmeldung nicht möglich',
    },
    password: {
      actionLink: 'Verwenden Sie eine andere Methode',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Geben Sie Ihr Passwort ein',
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
      subtitle: '',
      title: 'Schau auf dein Telefon',
    },
    resetPassword: {
      formButtonPrimary: 'Reset Password',
      requiredMessage:
        'An account already exists with an unverified email address. Please reset your password for security.',
      successMessage: 'Your password was successfully changed. Signing you in, please wait a moment.',
      title: 'Set new password',
    },
    resetPasswordMfa: {
      detailsLabel: 'We need to verify your identity before resetting your password.',
    },
    start: {
      actionLink: 'Anmelden',
      actionLink__use_email: 'Use email',
      actionLink__use_email_username: 'Use email or username',
      actionLink__use_phone: 'Use phone',
      actionLink__use_username: 'Use username',
      actionText: 'Kein Account?',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Einloggen',
    },
    totpMfa: {
      formTitle: 'Bestätigungscode',
      subtitle: '',
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
    phoneCode: {
      formSubtitle: 'Geben Sie den Bestätigungscode ein, der an Ihre Telefonnummer gesendet wurde',
      formTitle: 'Bestätigungscode',
      resendButton: 'Code erneut senden',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Verifizieren Sie Ihre Telefonnummer',
    },
    start: {
      actionLink: 'Einloggen',
      actionText: 'Haben Sie ein Konto?',
      subtitle: 'weiter zu {{applicationName}}',
      title: 'Erstelle deinen Account',
    },
  },
  socialButtonsBlockButton: 'Weiter mit {{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Anmeldung aufgrund fehlgeschlagener Sicherheitsüberprüfung nicht erfolgreich. Bitte versuchen Sie es erneut oder kontaktieren Sie uns für weitere Unterstützung.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: '',
    form_identifier_exists: 'Diese E-Mail-Adresse ist bereits vergeben. Bitte wählen Sie eine Andere.',
    form_identifier_not_found: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'Passwort nicht stark genug',
    form_password_pwned:
      'Das gewählte Passwort wurde durch eine Datenpanne im Internet offengelegt. Wählen Sie aus Sicherheitsgründen bitte ein anderes Passwort',
    form_password_size_in_bytes_exceeded:
      'Das Passwort hat die maximale Anzahl an Bytes überschritten. Bitte kürzen oder Sonderzeichen entfernen.',
    form_password_validation_failed: 'Falsches Passwort',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: '',
    not_allowed_access: '',
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
      couldBeStronger: 'Your password works, but could be stronger. Try adding more characters.',
      goodPassword: 'Your password meets all the necessary requirements.',
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
        formHint: 'An diese E-Mail-Adresse wird eine E-Mail mit einem Bestätigungscode gesendet.',
        formSubtitle: 'Geben Sie den Bestätigungscode ein, der an {{identifier}} gesendet wird',
        formTitle: 'Verifizierungs-Schlüssel',
        resendButton: 'Code erneut senden',
        successMessage: 'Die E-Mail-Adresse {{identifier}} wurde Ihrem Konto hinzugefügt.',
      },
      emailLink: {
        formHint: 'An diese E-Mail-Adresse wird eine E-Mail mit einem Bestätigungslink gesendet.',
        formSubtitle: 'Klicken Sie auf den Bestätigungslink in der an {{identifier}} gesendeten E-Mail',
        formTitle: 'Bestätigungslink',
        resendButton: 'Link erneut senden',
        successMessage: 'Die E-Mail-Adresse {{identifier}} wurde Ihrem Konto hinzugefügt.',
      },
      removeResource: {
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2: 'Sie können sich nicht mehr mit dieser E-Mail-Adresse anmelden.',
        successMessage: '{{emailAddress}} wurde aus Ihrem Konto entfernt.',
        title: 'E-Mail-Adresse entfernen',
      },
      title: 'E-Mail-Adresse hinzufügen',
    },
    formButtonPrimary__continue: 'Fortsetzen',
    formButtonPrimary__finish: 'Fertig',
    formButtonReset: 'Zurücksetzen',
    mfaPage: {
      formHint: 'Wählen Sie eine Methode aus.',
      title: 'Aktivieren Sie Zweifaktor-Authentifizierung',
    },
    mfaPhoneCodePage: {
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
      successMessage:
        'Die SMS-Code-Bestätigung in zwei Schritten ist jetzt für diese Telefonnummer aktiviert. Bei der Anmeldung müssen Sie als zusätzlichen Schritt einen Bestätigungscode eingeben, der an diese Telefonnummer gesendet wird.',
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
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passwordPage: {
      changePasswordSuccessMessage: 'Dein Passwort wurde aktualisiert.',
      changePasswordTitle: 'Passwort ändern',
      readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      sessionsSignedOutSuccessMessage: 'Alle anderen Geräte wurden abgemeldet.',
      successMessage: 'Ihr Passwort wurde festgelegt.',
      title: 'Passwort festlegen',
    },
    phoneNumberPage: {
      infoText: 'An diese Telefonnummer wird eine SMS mit einem Bestätigungslink gesendet.',
      infoText__secondary: 'Nachrichten- und Datengebühren können anfallen.',
      removeResource: {
        messageLine1: '{{identifier}} wird aus diesem Konto entfernt.',
        messageLine2: 'Sie können sich nicht mehr mit dieser Telefonnummer anmelden.',
        successMessage: '{{phoneNumber}} wurde aus Ihrem Konto entfernt.',
        title: 'Telefonnummer entfernen',
      },
      successMessage: '{{identifier}} wurde Ihrem Konto hinzugefügt.',
      title: 'Telefonnummer hinzufügen',
    },
    profilePage: {
      fileDropAreaAction: 'Datei auswählen',
      fileDropAreaHint: 'Laden Sie ein JPG-, PNG-, GIF- oder WEBP-Bild hoch, welches kleiner als 10 MB ist',
      fileDropAreaTitle: 'Datei hierher ziehen, oder...',
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
        actionLabel__reauthorize: 'Authorize now',
        destructiveActionTitle: 'Entfernen',
        primaryButton: 'Konto verbinden',
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
        title: 'Enterprise accounts',
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
      passwordSection: {
        primaryButton__changePassword: 'Passwort ändern',
        primaryButton__setPassword: 'Passwort festlegen',
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
        primaryButton: 'Edit Profile',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__changeUsername: 'Benutzernamen ändern',
        primaryButton__setUsername: 'Benutzernamen festlegen',
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
      title: 'Benutzernamen aktualisieren',
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
    },
  },
} as const;
