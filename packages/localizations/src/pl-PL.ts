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

export const plPL: LocalizationResource = {
  locale: 'pl-PL',
  __experimental_commerce: {
    billedAnnually: undefined,
    free: undefined,
    getStarted: undefined,
    manageMembership: undefined,
    month: undefined,
    switchPlan: undefined,
  },
  backButton: 'Powrót',
  badge__currentPlan: undefined,
  badge__default: 'Domyślny',
  badge__otherImpersonatorDevice: 'Inne urządzenie osobiste',
  badge__primary: 'Podstawowy',
  badge__requiresAction: 'Wymaga działania',
  badge__thisDevice: 'To urządzenie',
  badge__unverified: 'Niezweryfikowany',
  badge__userDevice: 'Urządzenie użytkownika',
  badge__you: 'Ty',
  createOrganization: {
    formButtonSubmit: 'Utwórz organizację',
    invitePage: {
      formButtonReset: 'Pomiń',
    },
    title: 'Utwórz organizację',
  },
  dates: {
    lastDay: "Wczoraj o godzinie {{ date | timeString('pl-PL') }}",
    next6Days: "{{ date | weekday('pl-PL','long') }} o godzinie {{ date | timeString('pl-PL') }}",
    nextDay: "Jutro o godzinie {{ date | timeString('pl-PL') }}",
    numeric: "{{ date | numeric('pl-PL') }}",
    previous6Days: "Ostatni(a) {{ date | weekday('pl-PL','long') }} o godzinie {{ date | timeString('pl-PL') }}",
    sameDay: "Dzisiaj o godzinie {{ date | timeString('pl-PL') }}",
  },
  dividerText: 'lub',
  footerActionLink__useAnotherMethod: 'Użyj innej metody',
  footerPageLink__help: 'Pomoc',
  footerPageLink__privacy: 'Prywatność',
  footerPageLink__terms: 'Warunki',
  formButtonPrimary: 'Kontynuuj',
  formButtonPrimary__verify: 'Zweryfikuj',
  formFieldAction__forgotPassword: 'Zapomniałem/am hasła',
  formFieldError__matchingPasswords: 'Hasła się zgadzają.',
  formFieldError__notMatchingPasswords: 'Hasła się nie zgadzają.',
  formFieldError__verificationLinkExpired: 'Link weryfikacyjny wygasł. Spróbuj ponownie.',
  formFieldHintText__optional: 'Opcjonalne',
  formFieldHintText__slug: 'Jest to unikalne ID, które jest czytelne dla człowieka, często używane w adresach URL.',
  formFieldInputPlaceholder__backupCode: 'Wprowadź kod zapasowy',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Usuń konto',
  formFieldInputPlaceholder__emailAddress: 'Wprowadź adres email',
  formFieldInputPlaceholder__emailAddress_username: 'Adres e-mail lub nazwa użytkownika',
  formFieldInputPlaceholder__emailAddresses:
    'Wprowadź lub wklej jeden lub więcej adresów e-mail, oddzielonych spacjami lub przecinkami',
  formFieldInputPlaceholder__firstName: 'Imię',
  formFieldInputPlaceholder__lastName: 'Nazwisko',
  formFieldInputPlaceholder__organizationDomain: 'example.com',
  formFieldInputPlaceholder__organizationDomainEmailAddress: 'jan.kowalski@example.com',
  formFieldInputPlaceholder__organizationName: 'Nazwa organizacji',
  formFieldInputPlaceholder__organizationSlug: 'moja-organizacja',
  formFieldInputPlaceholder__password: 'Wprowadź swoje hasło',
  formFieldInputPlaceholder__phoneNumber: 'Wprowadź numer telefonu',
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations: 'Włącz automatyczne zaproszenia dla tej domeny',
  formFieldLabel__backupCode: 'Kod zapasowy',
  formFieldLabel__confirmDeletion: 'Potwierdzenie',
  formFieldLabel__confirmPassword: 'Potwierdź hasło',
  formFieldLabel__currentPassword: 'Obecne hasło',
  formFieldLabel__emailAddress: 'Adres e-mail',
  formFieldLabel__emailAddress_username: 'Adres e-mail lub nazwa użytkownika',
  formFieldLabel__emailAddresses: 'Adresy e-mail',
  formFieldLabel__firstName: 'Imię',
  formFieldLabel__lastName: 'Nazwisko',
  formFieldLabel__newPassword: 'Nowe hasło',
  formFieldLabel__organizationDomain: 'Domena',
  formFieldLabel__organizationDomainDeletePending: 'Usuń oczekujące zaproszenia i propozycje',
  formFieldLabel__organizationDomainEmailAddress: 'Weryfikacyjny adres e-mail',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Wprowadź adres e-mail w tej domenie, aby otrzymać kod i zweryfikować tę domenę.',
  formFieldLabel__organizationName: 'Nazwa organizacji',
  formFieldLabel__organizationSlug: 'Slug URL',
  formFieldLabel__passkeyName: 'Nazwa klucza dostępu',
  formFieldLabel__password: 'Hasło',
  formFieldLabel__phoneNumber: 'Numer telefonu',
  formFieldLabel__role: 'Rola',
  formFieldLabel__signOutOfOtherSessions: 'Wyloguj się ze wszystkich innych urządzeń',
  formFieldLabel__username: 'Nazwa użytkownika',
  impersonationFab: {
    action__signOut: 'Wyloguj',
    title: 'Zalogowano jako {{identifier}}',
  },
  maintenanceMode: 'Aktualnie trwają prace konserwacyjne, ale nie powinno to zająć dłużej niż kilka minut.',
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Użytkownik',
  membershipRole__guestMember: 'Gość',
  organizationList: {
    action__createOrganization: 'Stwórz organizację',
    action__invitationAccept: 'Dołącz',
    action__suggestionsAccept: 'Poproś o dołączenie',
    createOrganization: 'Stwórz organizację',
    invitationAcceptedLabel: 'Dołączono',
    subtitle: 'to continue to {{applicationName}}',
    suggestionsAcceptedLabel: 'Pending approval',
    title: 'Wybierz konto',
    titleWithoutPersonal: 'Wybierz organizację',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Automatyczne zaproszenia',
    badge__automaticSuggestion: 'Automatyczne sugestie',
    badge__manualInvitation: 'Brak automatycznej rejestracji',
    badge__unverified: 'Niezweryfikowany',
    createDomainPage: {
      subtitle:
        'Dodaj domenę do weryfikacji. Użytkownicy z adresami e-mail w tej domenie mogą dołączyć do organizacji automatycznie lub poprosić o dołączenie.',
      title: 'Dodaj domenę',
    },
    invitePage: {
      detailsTitle__inviteFailed: 'Nie udało się wysłać zaproszeń. Napraw poniższe problemy i spróbuj ponownie:',
      formButtonPrimary__continue: 'Wyślij zaproszenia',
      selectDropdown__role: 'Wybierz rolę',
      subtitle: 'Zaproś nowych użytkowników do tej organizacji',
      successMessage: 'Zaproszenia zostały pomyślnie wysłane',
      title: 'Zaproś użytkowników',
    },
    membersPage: {
      action__invite: 'Zaproś',
      action__search: 'Wyszukaj',
      activeMembersTab: {
        menuAction__remove: 'Usuń użytkownika',
        tableHeader__actions: 'Akcje',
        tableHeader__joined: 'Dołączył',
        tableHeader__role: 'Rola',
        tableHeader__user: 'Użytkownik',
      },
      detailsTitle__emptyRow: 'Brak użytkowników do wyświetlenia',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Zaproś użytkowników, łącząc domenę e-mail ze swoją organizacją. Każdy, kto zarejestruje się za pomocą pasującej domeny e-mail, będzie mógł dołączyć do organizacji w dowolnym momencie.',
          headerTitle: 'Automatyczne zaproszenia',
          primaryButton: 'Zarządzanie zweryfikowanymi domenami',
        },
        table__emptyRow: 'Brak zaproszeń do wyświetlenia',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Anuluj zaproszenie',
        tableHeader__invited: 'Zaproszony',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Użytkownicy, którzy zarejestrują się za pomocą pasującej domeny e-mail, będą mogli zobaczyć propozycję, aby poprosić o dołączenie do Twojej organizacji.',
          headerTitle: 'Automatyczne propozycje',
          primaryButton: 'Zarządzanie zweryfikowanymi domenami',
        },
        menuAction__approve: 'Zatwierdź',
        menuAction__reject: 'Odrzuć',
        tableHeader__requested: 'Prośby o dostęp',
        table__emptyRow: 'Brak próśb do wyświetlenia',
      },
      start: {
        headerTitle__invitations: 'Zaproszenia',
        headerTitle__members: 'Członkowie',
        headerTitle__requests: 'Prośby',
      },
    },
    navbar: {
      description: 'Zarządzaj organizacją.',
      general: 'Główne',
      members: 'Członkowie',
      title: 'Organizacja',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Wpisz "{{organizationName}}" poniżej aby kontynuować.',
          messageLine1: 'Czy na pewno chcesz usunąć tę organizację?',
          messageLine2: 'To działanie jest trwałe i nieodwracalne.',
          successMessage: 'Organizacja została usunięta.',
          title: 'Usuń organizację',
        },
        leaveOrganization: {
          actionDescription: 'Wpisz "{{organizationName}}" poniżej aby kontynuować.',
          messageLine1:
            'Czy na pewno chcesz opuścić tę organizację? Stracisz dostęp do tej organizacji i jej aplikacji.',
          messageLine2: 'Ta akcja jest trwała i nieodwracalna.',
          successMessage: 'Opuściłeś organizację.',
          title: 'Opuść organizację',
        },
        title: 'Zagrożenie',
      },
      domainSection: {
        menuAction__manage: 'Zarządzaj',
        menuAction__remove: 'Usuń',
        menuAction__verify: 'Zweryfikuj',
        primaryButton: 'Dodaj domenę',
        subtitle:
          'Zezwalaj użytkownikom na automatyczne dołączanie do organizacji lub żądaj dołączenia na podstawie zweryfikowanej domeny e-mail.',
        title: 'Zweryfikowane domeny',
      },
      successMessage: 'Organizacja została zaktualizowana.',
      title: 'Profil organizacji',
    },
    removeDomainPage: {
      messageLine1: 'Domena e-mail {{domain}} zostanie usunięta.',
      messageLine2: 'Po wykonaniu tej czynności użytkownicy nie będą mogli automatycznie dołączyć do organizacji.',
      successMessage: 'Domena {{domain}} została usunięta.',
      title: 'Usuń domenę',
    },
    start: {
      headerTitle__general: 'Ogólne',
      headerTitle__members: 'Członkowie',
      profileSection: {
        primaryButton: undefined,
        title: 'Profil organizacji',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Usunięcie tej domeny wpłynie na zaproszonych użytkowników.',
        removeDomainActionLabel__remove: 'Usuń domenę',
        removeDomainSubtitle: 'Usuń tą domenę ze zweryfikowanych domen',
        removeDomainTitle: 'Usuń domenę',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Użytkownicy są automatycznie zapraszani do dołączenia do organizacji podczas rejestracji i mogą dołączyć w dowolnym momencie.',
        automaticInvitationOption__label: 'Automatyczne zaproszenia',
        automaticSuggestionOption__description:
          'Użytkownicy otrzymują propozycję, aby poprosić o dołączenie, ale muszą zostać zatwierdzeni przez administratora, zanim będą mogli dołączyć do organizacji.',
        automaticSuggestionOption__label: 'Automatyczne propozycje',
        calloutInfoLabel: 'Zmiana trybu rejestracji będzie miała wpływ tylko na nowych użytkowników.',
        calloutInvitationCountLabel: 'Oczekujące zaproszenia wysłane do użytkowników: {{count}}',
        calloutSuggestionCountLabel: 'Oczekujące propozycje wysłane do użytkowników: {{count}}',
        manualInvitationOption__description: 'Użytkowników można zapraszać do organizacji wyłącznie ręcznie.',
        manualInvitationOption__label: 'Brak automatycznej rejestracji',
        subtitle: 'Wybierz sposób, w jaki użytkownicy z tej domeny mogą dołączyć do organizacji.',
      },
      start: {
        headerTitle__danger: 'Zagrożenie',
        headerTitle__enrollment: 'Opcje rejestracji',
      },
      subtitle: 'Domena {{domain}} została zweryfikowana. Kontynuuj, wybierając opcje rejestracji',
      title: 'Zaktualizuj {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Wprowadź kod weryfikacyjny wysłany na Twój adres e-mail',
      formTitle: 'Kod weryfikacyjny',
      resendButton: 'Nie otrzymałeś kodu? Wyślij ponownie',
      subtitle: 'Domena {{domainName}} musi zostać zweryfikowana przez e-mail.',
      subtitleVerificationCodeScreen:
        'Kod weryfikacyjny został wysłany na adres {{emailAddress}}. Wprowadź kod, aby kontynuować.',
      title: 'Zweryfikuj domenę',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Utwórz organizację',
    action__invitationAccept: 'Dołącz',
    action__manageOrganization: 'Zarządzaj organizacją',
    action__suggestionsAccept: 'Prośba o dołączenie',
    notSelected: 'Nie wybrano organizacji',
    personalWorkspace: 'Przestrzeń osobista',
    suggestionsAcceptedLabel: 'Oczekiwanie na zatwierdzenie',
  },
  paginationButton__next: 'Następny',
  paginationButton__previous: 'Poprzedni',
  paginationRowText__displaying: 'Wyświetlanie',
  paginationRowText__of: 'z',
  reverification: {
    alternativeMethods: {
      actionLink: 'Uzyskaj pomoc',
      actionText: 'Nie używasz żadnej z tych metod?',
      blockButton__backupCode: 'Użyj kodu zapasowego',
      blockButton__emailCode: 'Wyślij kod e-mailem do {{identifier}}',
      blockButton__passkey: undefined,
      blockButton__password: 'Zaloguj się za pomocą hasła',
      blockButton__phoneCode: 'Wyślij kod SMS-em do {{identifier}}',
      blockButton__totp: 'Użyj aplikacji uwierzytelniającej',
      getHelp: {
        blockButton__emailSupport: 'Skontaktuj się z pomocą',
        content:
          'Jeśli masz problem z weryfikacją konta, wyślij do nas e-mail, a postaramy się jak najszybciej przywrócić dostęp.',
        title: 'Uzyskaj wsparcie',
      },
      subtitle: 'Masz problem? Możesz użyć dowolnej z tych metod weryfikacji.',
      title: 'Użyj innej metody',
    },
    backupCodeMfa: {
      subtitle: 'Twój kod zapasowy to ten, który otrzymałeś podczas konfigurowania uwierzytelniania dwuetapowego.',
      title: 'Wprowadź kod zapasowy',
    },
    emailCode: {
      formTitle: 'Kod weryfikacyjny',
      resendButton: 'Nie otrzymałeś kodu? Wyślij ponownie',
      subtitle: 'Wprowadź kod wysłany na Twój adres e-mail, aby kontynuować',
      title: 'Wymagana weryfikacja',
    },
    noAvailableMethods: {
      message: 'Nie można kontynuować weryfikacji. Brak dostępnych czynników uwierzytelniania.',
      subtitle: 'Wystąpił błąd',
      title: 'Nie możemy zweryfikować twojego konta',
    },
    passkey: {
      blockButton__passkey: undefined,
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Użyj innej metody',
      subtitle: 'Wprowadź hasło, aby kontynuować',
      title: 'Wymagana weryfikacja',
    },
    phoneCode: {
      formTitle: 'Kod weryfikacyjny',
      resendButton: 'Nie otrzymałeś kodu? Wyślij ponownie',
      subtitle: 'Wprowadź kod wysłany na Twój telefon, aby kontynuować',
      title: 'Wymagana weryfikacja',
    },
    phoneCodeMfa: {
      formTitle: 'Kod weryfikacyjny',
      resendButton: 'Nie otrzymałeś kodu? Wyślij ponownie',
      subtitle: 'Aby kontynuować, wprowadź kod weryfikacyjny wysłany na twój telefon',
      title: 'Wymagana weryfikacja',
    },
    totpMfa: {
      formTitle: 'Kod weryfikacyjny',
      subtitle: 'Aby kontynuować, wprowadź kod weryfikacyjny wygenerowany przez swoją aplikację uwierzytelniającą',
      title: 'Wymagana weryfikacja',
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Dodaj konto',
      action__signOutAll: 'Wyloguj się ze wszystkich kont',
      subtitle: 'Wybierz konto, na którym chcesz kontynuować.',
      title: 'Wybierz konto',
    },
    alternativeMethods: {
      actionLink: 'Uzyskaj pomoc',
      actionText: 'Nie używasz żadnej z tych metod?',
      blockButton__backupCode: 'Użyj kodu zapasowego',
      blockButton__emailCode: 'Wyślij kod do {{identifier}}',
      blockButton__emailLink: 'Wyślij link do {{identifier}}',
      blockButton__passkey: 'Zaloguj się za pomocą klucza dostępowego',
      blockButton__password: 'Zaloguj się za pomocą hasła',
      blockButton__phoneCode: 'Wyślij kod do {{identifier}}',
      blockButton__totp: 'Użyj aplikacji uwierzytelniającej',
      getHelp: {
        blockButton__emailSupport: 'Wyślij e-mail do pomocy technicznej',
        content:
          'Jeśli masz problem z zalogowaniem się do swojego konta, wyślij do nas e-mail, a postaramy się jak najszybciej przywrócić dostęp.',
        title: 'Uzyskaj pomoc',
      },
      subtitle: 'Masz problem? Możesz użyć dowolnej z tych metod weryfikacji.',
      title: 'Użyj innego sposobu',
    },
    backupCodeMfa: {
      subtitle: 'aby przejść do {{applicationName}}',
      title: 'Wprowadź kod zapasowy',
    },
    emailCode: {
      formTitle: 'Kod weryfikacyjny',
      resendButton: 'Wyślij kod ponownie',
      subtitle: 'aby kontynuować w {{applicationName}}',
      title: 'Sprawdź swoją pocztę e-mail',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Aby kontynuować, otwórz link weryfikacyjny na urządzeniu i w przeglądarce, w której rozpocząłeś logowanie',
        title: 'Link weryfikacyjny jest nieprawidłowy dla tego urządzenia',
      },
      expired: {
        subtitle: 'Powróć do oryginalnej karty, aby kontynuować.',
        title: 'Ten link weryfikacyjny wygasł',
      },
      failed: {
        subtitle: 'Powróć do oryginalnej karty, aby kontynuować.',
        title: 'Ten link weryfikacyjny jest nieprawidłowy',
      },
      formSubtitle: 'Użyj linku weryfikacyjnego wysłanego na Twój adres e-mail',
      formTitle: 'Link weryfikacyjny',
      loading: {
        subtitle: 'Zostaniesz przekierowany wkrótce',
        title: 'Logowanie...',
      },
      resendButton: 'Wyślij link ponownie',
      subtitle: 'aby kontynuować w {{applicationName}}',
      title: 'Sprawdź swoją pocztę e-mail',
      unusedTab: {
        title: 'Możesz zamknąć tę kartę',
      },
      verified: {
        subtitle: 'Zostaniesz przekierowany wkrótce',
        title: 'Pomyślnie zalogowano',
      },
      verifiedSwitchTab: {
        subtitle: 'Powróć do oryginalnej karty, aby kontynuować',
        subtitleNewTab: 'Powróć do nowo otwartej karty, aby kontynuować',
        titleNewTab: 'Zalogowano na innej karcie',
      },
    },
    forgotPassword: {
      formTitle: 'Kod werfikacyjny resetowania hasła',
      resendButton: 'Nie otrzymałeś kodu? Wyślij ponownie',
      subtitle: 'aby zresetować hasło',
      subtitle_email: 'Najpierw wprowadź kod wysłany na Twój adres e-mail',
      subtitle_phone: 'Najpierw wprowadź kod wysłany na Twój numer telefonu',
      title: 'Zmień hasło',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Zresetuj hasło',
      label__alternativeMethods: 'Lub zaloguj się za pomocą innej metody',
      title: 'Zapomniałeś hasła?',
    },
    noAvailableMethods: {
      message: 'Nie można kontynuować logowania. Brak dostępnych czynników uwierzytelniających.',
      subtitle: 'Wystąpił błąd',
      title: 'Nie można się zalogować',
    },
    passkey: {
      subtitle:
        'Użycie klucza dostępu potwierdza, że to Ty. Urządzenie może poprosić o twój odcisk palca, twarz lub blokadę ekranu.',
      title: 'Użyj swojego klucza dostępowego',
    },
    password: {
      actionLink: 'Użyj innego sposobu',
      subtitle: 'aby kontynuować w {{applicationName}}',
      title: 'Wprowadź swoje hasło',
    },
    passwordPwned: {
      title: 'Hasło skompromitowane',
    },
    phoneCode: {
      formTitle: 'Kod weryfikacyjny',
      resendButton: 'Wyślij kod ponownie',
      subtitle: 'aby przejść do {{applicationName}}',
      title: 'Sprawdź swój telefon',
    },
    phoneCodeMfa: {
      formTitle: 'Kod weryfikacyjny',
      resendButton: 'Wyślij kod ponownie',
      subtitle: 'Aby kontynuować, wprowadź kod weryfikacyjny wysłany na Twój telefon',
      title: 'Sprawdź swój telefon',
    },
    resetPassword: {
      formButtonPrimary: 'Zmień hasło',
      requiredMessage: 'Z powodów bezpieczeństwa konieczne jest zresetowanie hasła.',
      successMessage: 'Twoje hasło zostało pomyślnie zresetowane. Logujemy Cię, proszę czekać...',
      title: 'Ustaw nowe hasło',
    },
    resetPasswordMfa: {
      detailsLabel: 'Przed zresetowaniem hasła musimy zweryfikować tożsamość użytkownika.',
    },
    start: {
      actionLink: 'Zarejestruj się',
      actionLink__join_waitlist: 'Dołącz do listy oczekujących',
      actionLink__use_email: 'Użyj adresu e-mail',
      actionLink__use_email_username: 'Użyj adresu e-mail lub nazwy użytkownika',
      actionLink__use_passkey: 'Użyj klucza dostępowego',
      actionLink__use_phone: 'Użyj numeru telefonu',
      actionLink__use_username: 'Użyj nazwy użytkownika',
      actionText: 'Nie masz konta?',
      actionText__join_waitlist: 'Chcesz otrzymać wczesny dostęp?',
      subtitle: 'by przejść do aplikacji {{applicationName}}',
      subtitleCombined: undefined,
      title: 'Zaloguj się',
      titleCombined: 'Kontynuuj do {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Kod weryfikacyjny',
      subtitle: 'Aby kontynuować, wprowadź kod weryfikacyjny wygenerowany przez aplikację uwierzytelniającą',
      title: 'Weryfikacja dwustopniowa',
    },
  },
  signInEnterPasswordTitle: 'Wprowadź swoje hasło',
  signUp: {
    continue: {
      actionLink: 'Zaloguj się',
      actionText: 'Masz już konto?',
      subtitle: 'by przejść do aplikacji {{applicationName}}',
      title: 'Uzupełnij brakujące pola',
    },
    emailCode: {
      formSubtitle: 'Wprowadź kod weryfikacyjny wysłany na Twój adres e-mail',
      formTitle: 'Kod weryfikacyjny',
      resendButton: 'Nie otrzymałeś kodu? Wyślij ponownie',
      subtitle: 'by przejść do aplikacji {{applicationName}}',
      title: 'Zweryfikuj swój adres e-mail',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Aby kontynuować, otwórz link weryfikacyjny na urządzeniu i w przeglądarce, w której rozpocząłeś rejestrację',
        title: 'Link weryfikacyjny jest nieprawidłowy dla tego urządzenia',
      },
      formSubtitle: 'Użyj linku weryfikacyjnego wysłanego na Twój adres e-mail',
      formTitle: 'Link weryfikacyjny',
      loading: {
        title: 'Rejestrowanie...',
      },
      resendButton: 'Nie otrzymałeś linku? Wyślij ponownie',
      subtitle: 'by przejść do aplikacji {{applicationName}}',
      title: 'Zweryfikuj swój adres e-mail',
      verified: {
        title: 'Pomyślnie zarejestrowano',
      },
      verifiedSwitchTab: {
        subtitle: 'Powróć do nowo otwartej karty, aby kontynuować',
        subtitleNewTab: 'Powróć do poprzedniej karty, aby kontynuować',
        title: 'Adres e-mail został pomyślnie zweryfikowany',
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy: 'Akceptuję {{ privacyPolicyLink || link("Politykę prywatności") }}',
        label__onlyTermsOfService: 'Akceptuję {{ termsOfServiceLink || link("Warunki świadczenia usługi") }}"',
        label__termsOfServiceAndPrivacyPolicy:
          'Akceptuję {{ termsOfServiceLink || link("Warunki świadczenia usługi") }} i {{ privacyPolicyLink || link("Politykę prywatności") }}',
      },
      continue: {
        subtitle: 'Przeczytaj i zaakceptuj warunki, aby kontynuować',
        title: 'Zgoda prawna',
      },
    },
    phoneCode: {
      formSubtitle: 'Wprowadź kod weryfikacyjny wysłany na Twój numer telefonu',
      formTitle: 'Kod weryfikacyjny',
      resendButton: 'Nie otrzymałeś kodu? Wyślij ponownie',
      subtitle: 'by przejść do aplikacji {{applicationName}}',
      title: 'Zweryfikuj swój numer telefonu',
    },
    restrictedAccess: {
      actionLink: 'Zaloguj się',
      actionText: 'Masz już konto?',
      blockButton__emailSupport: 'Skontaktuj się z pomocą',
      blockButton__joinWaitlist: 'Dołącz do listy oczekujących',
      subtitle:
        'Rejestracja jest obecnie wyłączona. Jeśli uważasz, że powinieneś mieć dostęp, skontaktuj się z pomocą.',
      subtitleWaitlist:
        'Rejestracja jest obecnie wyłączona. Aby dowiedzieć się jako pierwszy o naszym starcie, dołącz do listy oczekujących.',
      title: 'Dostęp ograniczony',
    },
    start: {
      actionLink: 'Zaloguj się',
      actionLink__use_email: 'Użyj adresu e-mail',
      actionLink__use_phone: 'Użyj numeru telefonu',
      actionText: 'Masz już konto?',
      subtitle: 'by przejść do aplikacji {{applicationName}}',
      subtitleCombined: 'by przejść do aplikacji {{applicationName}}',
      title: 'Utwórz swoje konto',
      titleCombined: 'Utwórz swoje konto',
    },
  },
  socialButtonsBlockButton: 'Kontynuuj z {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  unstable__errors: {
    already_a_member_in_organization: '{{email}} jest już członkiem organizacji.',
    captcha_invalid:
      'Rejestracja nie powiodła się z powodu niepowodzenia weryfikacji zabezpieczeń. Odśwież stronę, aby spróbować ponownie lub skontaktuj się z pomocą, aby uzyskać wsparcie.',
    captcha_unavailable:
      'Rejestracja nie powiodła się z powodu niedostępności weryfikacji botów. Odśwież stronę, aby spróbować ponownie lub skontaktuj się z pomocą, aby uzyskać wsparcie.',
    form_code_incorrect: undefined,
    form_identifier_exists__email_address: 'Adres e-mail jest już zajęty. Proszę spróbować innego.',
    form_identifier_exists__phone_number: 'Ten numer telefonu jest zajęty. Spróbuj użyć innego.',
    form_identifier_exists__username: 'Ta nazwa użytkownika jest zajęta. Spróbuj użyć innej.',
    form_identifier_not_found: 'Nie znaleziono konta o tym identyfikatorze. Sprawdź i spróbuj ponownie.',
    form_param_format_invalid: 'Wprowadzona wartość ma nieprawidłowy format. Sprawdź i popraw ją.',
    form_param_format_invalid__email_address: 'Adres e-mail powinien być poprawnym adresem e-mail.',
    form_param_format_invalid__phone_number: 'Numer telefonu powinien mieć prawidłowy format międzynarodowy',
    form_param_max_length_exceeded__first_name: 'Imię nie powinno przekraczać 256 znaków.',
    form_param_max_length_exceeded__last_name: 'Nazwisko nie powinno przekraczać 256 znaków.',
    form_param_max_length_exceeded__name: 'Nazwa nie powinna przekraczać 256 znaków.',
    form_param_nil: 'To pole jest wymagane i nie może być puste.',
    form_param_value_invalid: 'Wprowadzona wartość jest nieprawidłowa. Popraw ją.',
    form_password_incorrect: 'Wprowadzone hasło jest nieprawidłowe. Spróbuj ponownie.',
    form_password_length_too_short: 'Twoje hasło jest zbyt krótkie. Musi mieć co najmniej 8 znaków.',
    form_password_not_strong_enough: 'Twoje hasło nie jest wystarczająco silne',
    form_password_pwned:
      'To hasło zostało znalezione w wyniku włamania i nie można go użyć. Zamiast tego spróbuj użyć innego hasła.',
    form_password_pwned__sign_in: 'To hasło zostało znalezione w wyniku włamania i nie można go użyć. Zresetuj hasło.',
    form_password_size_in_bytes_exceeded:
      'Twoje hasło przekroczyło maksymalną dozwoloną liczbę bajtów, skróć je lub usuń niektóre znaki specjalne.',
    form_password_validation_failed: 'Podane hasło jest nieprawidłowe',
    form_username_invalid_character:
      'Twoja nazwa użytkownika zawiera nieprawidłowe znaki. Prosimy o używanie wyłącznie liter, cyfr i podkreśleń.',
    form_username_invalid_length: 'Nazwa użytkownika musi zawierać od {{min_length}} do {{max_length}} znaków.',
    identification_deletion_failed: 'Nie można usunąć ostatniego identyfikatora.',
    not_allowed_access:
      'Nie masz uprawnień dostępu do tej strony. Jeśli uważasz, że jest to błąd, skontaktuj się z pomocą.',
    organization_domain_blocked: 'To jest zablokowana domena dostawcy poczty e-mail. Użyj innej domeny.',
    organization_domain_common: 'To jest popularna domena dostawcy poczty e-mail. Użyj innej domeny.',
    organization_domain_exists_for_enterprise_connection:
      'Ta domena jest już używana do logowania jednokrotnego w organizacji.',
    organization_membership_quota_exceeded: 'Osiągnięto limit członkostwa w organizacji, w tym zaległych zaproszeń.',
    organization_minimum_permissions_needed:
      'Musi istnieć co najmniej jeden członek organizacji z minimalnymi wymaganymi uprawnieniami.',
    passkey_already_exists: 'Klucz dostępu jest już zarejestrowany w tym urządzeniu.',
    passkey_not_supported: 'Klucze dostępu nie są obsługiwane przez to urządzenie.',
    passkey_pa_not_supported: 'Rejestracja wymaga platformy uwierzytelniającej, ale urządzenie jej nie obsługuje.',
    passkey_registration_cancelled: 'Rejestracja klucza dostępu została anulowana lub upłynął jej limit czasu.',
    passkey_retrieval_cancelled: 'Weryfikacja klucza dostępu została anulowana lub upłynął limit czasu.',
    passwordComplexity: {
      maximumLength: 'mniej niż {{length}} znaków',
      minimumLength: '{{length}} lub więcej znaków',
      requireLowercase: 'małą literę',
      requireNumbers: 'cyfrę',
      requireSpecialCharacter: 'znak specjalny',
      requireUppercase: 'wielką literę',
      sentencePrefix: 'Twoje hasło musi zawierać',
    },
    phone_number_exists: 'Numer telefonu jest już zajęty. Proszę spróbować innego.',
    web3_missing_identifier: 'Nie można znaleźć rozszerzenia Web3 Wallet. Zainstaluj je, aby kontynuować.',
    zxcvbn: {
      couldBeStronger: 'Twoje hasło jest odpowiednie, ale mogłoby być silniejsze. Spróbuj dodać więcej znaków.',
      goodPassword: 'Twoje hasło jest wystarczająco silne.',
      notEnough: 'Twoje hasło jest zbyt słabe. Spróbuj dodać więcej znaków.',
      suggestions: {
        allUppercase: 'Unikaj używania samych wielkich liter.',
        anotherWord: 'Dodaj więcej słów, które są rzadsze.',
        associatedYears: 'Unikaj lat związanych z Tobą.',
        capitalization: 'Używaj wielkich liter częsciej.',
        dates: 'Unikaj dat związanych z Tobą.',
        l33t: "Unikaj przewidywalnego zamieniania liter, takich jak '@' za 'a'.",
        longerKeyboardPattern: 'Używaj długich wzorów na klawiaturze, zmieniając kierunek pisania wielokrotnie.',
        noNeed: 'Możesz tworzyć silne hasła bez używania symboli, cyfr lub wielkich liter.',
        pwned: 'Jeżeli używasz tego hasła gdzie indziej, zmień je jak najszybciej.',
        recentYears: 'Unikaj ostatnich lat.',
        repeated: 'Unikaj powtarzanych słów i znaków.',
        reverseWords: 'Unikaj wpisywania popularnych słów od tyłu.',
        sequences: 'Unikaj popularnych kombinacji znaków.',
        useWords: 'Używaj wielu słów, ale unikaj popularnych fraz.',
      },
      warnings: {
        common: 'Jest to często używane hasło.',
        commonNames: 'Imiona i nazwiska są łatwe do odgadnięcia.',
        dates: 'Daty są łatwe do odgadnięcia.',
        extendedRepeat: 'Powtarzające się wzorce znaków, takie jak "abcabcabc", są łatwe do odgadnięcia.',
        keyPattern: 'Krótkie wzory klawiatury są łatwe do odgadnięcia.',
        namesByThemselves: 'Pojedyncze imiona lub nazwiska są łatwe do odgadnięcia.',
        pwned: 'Twoje hasło zostało ujawnione w wyniku wycieku danych w Internecie.',
        recentYears: 'Ostatnie lata są łatwe do odgadnięcia.',
        sequences: 'Typowe sekwencje znaków, takie jak "abc", są łatwe do odgadnięcia.',
        similarToCommon: 'Jest to podobne do powszechnie używanego hasła.',
        simpleRepeat: 'Powtarzające się znaki, takie jak "aaa", są łatwe do odgadnięcia.',
        straightRow: 'Proste rzędy klawiszy na klawiaturze są łatwe do odgadnięcia.',
        topHundred: 'To jest często używane hasło.',
        topTen: 'To jest bardzo często używane hasło.',
        userInputs: 'Nie powinno być żadnych danych osobowych ani danych związanych ze stroną.',
        wordByItself: 'Pojedyncze słowa są łatwe do odgadnięcia.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Dodaj konto',
    action__manageAccount: 'Zarządzaj kontem',
    action__signOut: 'Wyloguj',
    action__signOutAll: 'Wyloguj ze wszystkich kont',
  },
  userProfile: {
    __experimental_billingPage: {
      start: {
        headerTitle__invoices: undefined,
        headerTitle__paymentSources: undefined,
        headerTitle__plans: undefined,
      },
      title: undefined,
    },
    backupCodePage: {
      actionLabel__copied: 'Skopiowane!',
      actionLabel__copy: 'Skopiuj wszystkie',
      actionLabel__download: 'Pobierz .txt',
      actionLabel__print: 'Drukuj',
      infoText1: 'Kody zapasowe zostaną włączone dla tego konta.',
      infoText2:
        'Przechowuj kody zapasowe w tajemnicy i bezpiecznie. Możesz wygenerować nowe kody, jeśli podejrzewasz, że zostały skompromitowane.',
      subtitle__codelist: 'Przechowuj je bezpiecznie i zachowaj w tajemnicy.',
      successMessage:
        'Kody zapasowe są teraz włączone. Możesz użyć jednego z tych kodów do zalogowania się na swoje konto, jeśli utracisz dostęp do urządzenia uwierzytelniającego. Każdy kod można użyć tylko raz.',
      successSubtitle:
        'Możesz użyć jednego z tych kodów do zalogowania się na swoje konto, jeśli utracisz dostęp do urządzenia uwierzytelniającego.',
      title: 'Dodaj weryfikację kodem zapasowym',
      title__codelist: 'Kody zapasowe',
    },
    connectedAccountPage: {
      formHint: 'Wybierz dostawcę, aby połączyć konto.',
      formHint__noAccounts: 'Nie ma dostępnych zewnętrznych dostawców kont.',
      removeResource: {
        messageLine1: '{{identifier}} zostanie usunięte z tego konta.',
        messageLine2:
          'Nie będziesz już mógł korzystać z tego połączonego konta i wszystkie zależne funkcje przestaną działać.',
        successMessage: '{{connectedAccount}} zostało usunięte z Twojego konta.',
        title: 'Usuń połączone konto',
      },
      socialButtonsBlockButton: 'Połącz konto {{provider|titleize}}',
      successMessage: 'Dostawca został dodany do Twojego konta.',
      title: 'Dodaj połączone konto',
    },
    deletePage: {
      actionDescription: 'Wpisz "Usuń konto" poniżej aby kontynuować.',
      confirm: 'Usuń konto',
      messageLine1: 'Czy na pewno chcesz usunąć to konto?',
      messageLine2: 'Ta operacja jest nieodwracalna i nie można jej cofnąć.',
      title: 'Usuń konto',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'E-mail zawierający kod weryfikacyjny zostanie wysłany na ten adres e-mail.',
        formSubtitle: 'Wprowadź kod weryfikacyjny wysłany na adres {{identifier}}',
        formTitle: 'Kod weryfikacyjny',
        resendButton: 'Wyślij ponownie kod',
        successMessage: 'Adres e-mail {{identifier}} został dodany do twojego konta.',
      },
      emailLink: {
        formHint: 'E-mail zawierający link weryfikacyjny zostanie wysłany na ten adres e-mail.',
        formSubtitle: 'Kliknij w link weryfikacyjny w e-mailu wysłanym na adres {{identifier}}',
        formTitle: 'Link weryfikacyjny',
        resendButton: 'Wyślij ponownie link',
        successMessage: 'Adres e-mail {{identifier}} został dodany do twojego konta.',
      },
      enterpriseSSOLink: {
        formButton: 'Kliknij, aby się zalogować',
        formSubtitle: 'Ukończ logowanie za pomocą {{identifier}}',
      },
      formHint: 'Przed dodaniem adresu e-mail do konta należy go zweryfikować.',
      removeResource: {
        messageLine1: '{{identifier}} zostanie usunięty z tego konta.',
        messageLine2: 'Nie będzie już możliwe zalogowanie się za pomocą tego adresu e-mail.',
        successMessage: '{{emailAddress}} został usunięty z twojego konta.',
        title: 'Usuń adres e-mail',
      },
      title: 'Dodaj adres e-mail',
      verifyTitle: 'Zweryfikuj adres e-mail',
    },
    formButtonPrimary__add: 'Dodaj',
    formButtonPrimary__continue: 'Kontynuuj',
    formButtonPrimary__finish: 'Zakończ',
    formButtonPrimary__remove: 'Usuń',
    formButtonPrimary__save: 'Zapisz',
    formButtonReset: 'Anuluj',
    mfaPage: {
      formHint: 'Wybierz metodę dodania.',
      title: 'Dodaj weryfikację dwuetapową',
    },
    mfaPhoneCodePage: {
      backButton: 'Użyj istniejącego numeru',
      primaryButton__addPhoneNumber: 'Dodaj numer telefonu',
      removeResource: {
        messageLine1: '{{identifier}} nie będzie już otrzymywał kodów weryfikacyjnych podczas logowania.',
        messageLine2: 'Twoje konto może być mniej bezpieczne. Czy na pewno chcesz kontynuować?',
        successMessage:
          'Weryfikacja kodem SMS w dwustopniowym procesie uwierzytelniania została usunięta dla {{mfaPhoneCode}}',
        title: 'Usuń dwustopniową weryfikację',
      },
      subtitle__availablePhoneNumbers:
        'Wybierz numer telefonu, aby zarejestrować weryfikację kodem SMS w dwustopniowym procesie uwierzytelniania.',
      subtitle__unavailablePhoneNumbers:
        'Brak dostępnych numerów telefonów do zarejestrowania weryfikacji kodem SMS w dwustopniowym procesie uwierzytelniania.',
      successMessage1: 'Podczas logowania należy dodatkowo wprowadzić kod weryfikacyjny wysłany na ten numer telefonu.',
      successMessage2:
        'Zapisz te kody zapasowe i przechowuj je w bezpiecznym miejscu. Jeśli utracisz dostęp do urządzenia uwierzytelniającego, możesz użyć kodów zapasowych, aby się zalogować.',
      successTitle: 'Weryfikacja kodem SMS włączona',
      title: 'Dodaj weryfikację kodem SMS',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Zamiast tego zeskanuj kod QR',
        buttonUnableToScan__nonPrimary: 'Nie można zeskanować kodu QR?',
        infoText__ableToScan:
          'Ustaw nową metodę logowania w swojej aplikacji autentykacyjnej i zeskanuj następujący kod QR, aby połączyć go z Twoim kontem.',
        infoText__unableToScan:
          'Ustaw nową metodę logowania w swojej aplikacji autentykacyjnej i wprowadź poniższy klucz.',
        inputLabel__unableToScan1:
          'Upewnij się, że włączona jest opcja jednorazowe hasła lub hasła oparte na czasie, a następnie zakończ łączenie konta.',
        inputLabel__unableToScan2:
          'Alternatywnie, jeśli Twoja aplikacja autentykacyjna obsługuje URI TOTP, możesz również skopiować pełny URI.',
      },
      removeResource: {
        messageLine1: 'Kody weryfikacyjne z tej aplikacji autentykacyjnej nie będą już wymagane podczas logowania.',
        messageLine2: 'Twoje konto może być mniej bezpieczne. Czy na pewno chcesz kontynuować?',
        successMessage: 'Weryfikacja dwuetapowa za pomocą aplikacji autentykacyjnej została usunięta.',
        title: 'Usuń weryfikację dwuetapową',
      },
      successMessage:
        'Weryfikacja dwuetapowa jest teraz włączona. Przy logowaniu będziesz musiał wprowadzić kod weryfikacyjny z tej aplikacji jako dodatkowy krok.',
      title: 'Dodaj aplikację autentykacyjną',
      verifySubtitle: 'Wprowadź kod weryfikacyjny wygenerowany przez Twoją aplikację autentykacyjną',
      verifyTitle: 'Kod weryfikacyjny',
    },
    mobileButton__menu: 'Menu',
    navbar: {
      account: 'Profil',
      billing: undefined,
      description: 'Zarządzaj danymi konta.',
      security: 'Bezpieczeństwo',
      title: 'Konto',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} zostanie usunięty z tego konta.',
        title: 'Usuń klucz dostępu',
      },
      subtitle__rename: 'Możesz zmienić nazwę klucza dostępu aby go łatwiej znaleźć.',
      title__rename: 'Zmień nazwę klucza dostępu',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Zaleca się wylogowanie z innych urządzeń, które mogły używać starego hasła.',
      readonly:
        'Obecnie nie można edytować hasła, ponieważ możesz zalogować się tylko za pośrednictwem połączenia firmowego.',
      successMessage__set: 'Twoje hasło zostało ustawione.',
      successMessage__signOutOfOtherSessions: 'Wylogowano z wszystkich innych urządzeń.',
      successMessage__update: 'Twoje hasło zostało zaktualizowane.',
      title__set: 'Ustaw hasło',
      title__update: 'Zmień hasło',
    },
    phoneNumberPage: {
      infoText: 'Wiadomość tekstowa zawierająca link weryfikacyjny zostanie wysłana na ten numer telefonu.',
      removeResource: {
        messageLine1: '{{identifier}} zostanie usunięty z tego konta.',
        messageLine2: 'Nie będzie już możliwe zalogowanie się za pomocą tego numeru telefonu.',
        successMessage: '{{phoneNumber}} został usunięty z twojego konta.',
        title: 'Usuń numer telefonu',
      },
      successMessage: '{{identifier}} został dodany do twojego konta.',
      title: 'Dodaj numer telefonu',
      verifySubtitle: 'Wpisz kod weryfikacyjny wysłany na {{identifier}}',
      verifyTitle: 'Zweryfikuj numer telefonu',
    },
    profilePage: {
      fileDropAreaHint: 'Prześlij zdjęcie w formacie JPG, PNG, GIF lub WEBP mniejsze niż 10 MB',
      imageFormDestructiveActionSubtitle: 'Usuń zdjęcie',
      imageFormSubtitle: 'Prześlij zdjęcie',
      imageFormTitle: 'Zdjęcie profilowe',
      readonly: 'Informacje o Twoim profilu zostały udostępnione przez połączenie firmowe i nie można ich edytować.',
      successMessage: 'Twój profil został zaktualizowany.',
      title: 'Edytuj profil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Wyloguj z urządzenia',
        title: 'Aktywne urządzenia',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Spróbuj ponownie',
        actionLabel__reauthorize: 'Autoryzuj teraz',
        destructiveActionTitle: 'Odłącz',
        primaryButton: 'Połącz konto',
        subtitle__disconnected: 'To konto zostało odłączone',
        subtitle__reauthorize:
          'Wymagane zakresy zostały zaktualizowane i funkcjonalność aplikacji może być ograniczona. Aby uniknąć problemów, należy ponownie autoryzować aplikację',
        title: 'Połączone konta',
      },
      dangerSection: {
        deleteAccountButton: 'Usuń konto',
        title: 'Niebezpieczeństwo',
      },
      emailAddressesSection: {
        destructiveAction: 'Usuń adres email',
        detailsAction__nonPrimary: 'Ustaw jako główny',
        detailsAction__primary: 'Zakończ weryfikację',
        detailsAction__unverified: 'Zakończ weryfikację',
        primaryButton: 'Dodaj adres email',
        title: 'Adresy email',
      },
      enterpriseAccountsSection: {
        title: 'Konta firmowe',
      },
      headerTitle__account: 'Konto',
      headerTitle__security: 'Bezpieczeństwo',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Wygeneruj kody',
          headerTitle: 'Kody zapasowe',
          subtitle__regenerate:
            'Otrzymaj nowy zestaw bezpiecznych kodów zapasowych. Poprzednie kody zapasowe zostaną usunięte i nie będą działać.',
          title__regenerate: 'Wygeneruj nowe kody zapasowe',
        },
        phoneCode: {
          actionLabel__setDefault: 'Ustaw jako domyślny',
          destructiveActionLabel: 'Usuń numer telefonu',
        },
        primaryButton: 'Dodaj weryfikację dwuetapową',
        title: 'Weryfikacja dwuetapowa',
        totp: {
          destructiveActionTitle: 'Usuń',
          headerTitle: 'Aplikacja autoryzacyjna',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Usuń',
        menuAction__rename: 'Zmień nazwę',
        primaryButton: undefined,
        title: 'Klucze dostępu',
      },
      passwordSection: {
        primaryButton__setPassword: 'Ustaw hasło',
        primaryButton__updatePassword: 'Zmień hasło',
        title: 'Hasło',
      },
      phoneNumbersSection: {
        destructiveAction: 'Usuń numer telefonu',
        detailsAction__nonPrimary: 'Ustaw jako główny',
        detailsAction__primary: 'Zakończ weryfikację',
        detailsAction__unverified: 'Zakończ weryfikację',
        primaryButton: 'Dodaj numer telefonu',
        title: 'Numery telefonów',
      },
      profileSection: {
        primaryButton: 'Zaaktualizuj profil',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Ustaw nazwę użytkownika',
        primaryButton__updateUsername: 'Zmień nazwę użytkownika',
        title: 'Nazwa użytkownika',
      },
      web3WalletsSection: {
        destructiveAction: 'Usuń portfel',
        detailsAction__nonPrimary: undefined,
        primaryButton: 'Portfele Web3',
        title: 'Portfele Web3',
      },
    },
    usernamePage: {
      successMessage: 'Twoja nazwa użytkownika została zaktualizowana.',
      title__set: 'Zmień nazwę użytkownika',
      title__update: 'Zmień nazwę użytkownika',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} zostanie usunięty z tego konta.',
        messageLine2: 'Nie będziesz już mógł się zalogować za pomocą tego portfela web3.',
        successMessage: '{{web3Wallet}} został usunięty z Twojego konta.',
        title: 'Usuń portfel web3',
      },
      subtitle__availableWallets: 'Wybierz portfel web3 do połączenia z Twoim kontem.',
      subtitle__unavailableWallets: 'Nie ma dostępnych portfeli web3.',
      successMessage: 'Portfel został dodany do Twojego konta.',
      title: 'Dodaj portfel web3',
      web3WalletButtonsBlockButton: undefined,
    },
  },
  waitlist: {
    start: {
      actionLink: 'Zaloguj się',
      actionText: 'Masz już konto?',
      formButton: 'Dołącz do listy oczekujących',
      subtitle: 'Wpisz swój adres e-mail, a my powiadomimy Cię, gdy miejsce dla Ciebie będzie gotowe.',
      title: 'Dołącz do listy oczekujących',
    },
    success: {
      message: 'Wkrótce nastąpi przekierowanie...',
      subtitle: 'Skontaktujemy się z Tobą, gdy miejsce dla Ciebie będzie gotowe',
      title: 'Dziękujemy za dołączenie do listy oczekujących!',
    },
  },
} as const;
