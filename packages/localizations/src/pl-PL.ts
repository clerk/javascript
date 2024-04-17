import type { LocalizationResource } from '@clerk/types';

const commonTexts = {
  signIn: {
    phoneCode: {
      title: 'Sprawdź swój telefon', //"Check your phone"
      subtitle: 'aby przejść do {{applicationName}}', //"to continue to {{applicationName}}"
      formTitle: 'Kod weryfikacyjny', //"Verification code"
      formSubtitle: 'Enter the verification code sent to your phone number',
      resendButton: 'Resend code',
    },
  },
} as const;

export const plPL: LocalizationResource = {
  socialButtonsBlockButton: 'Kontynuuj z {{provider|titleize}}',
  dividerText: 'lub',
  formFieldLabel__emailAddress: 'Adres e-mail',
  formFieldLabel__emailAddresses: 'Adresy e-mail',
  formFieldLabel__phoneNumber: 'Numer telefonu',
  formFieldLabel__username: 'Nazwa użytkownika',
  formFieldLabel__emailAddress_phoneNumber: 'Adres e-mail lub numer telefonu',
  formFieldLabel__emailAddress_username: 'Adres e-mail lub nazwa użytkownika',
  formFieldLabel__phoneNumber_username: 'Numer telefonu lub nazwa użytkownika',
  formFieldLabel__emailAddress_phoneNumber_username: 'Adres e-mail, numer telefonu lub nazwa użytkownika',
  formFieldLabel__password: 'Hasło',
  formFieldLabel__currentPassword: 'Obecne hasło',
  formFieldLabel__newPassword: 'Nowe hasło',
  formFieldLabel__confirmPassword: 'Potwierdź hasło',
  formFieldLabel__signOutOfOtherSessions: 'Wyloguj się ze wszystkich innych urządzeń',
  formFieldLabel__firstName: 'Imię',
  formFieldLabel__lastName: 'Nazwisko',
  formFieldLabel__backupCode: 'Kod zapasowy',
  formFieldLabel__organizationName: 'Nazwa organizacji',
  formFieldLabel__organizationSlug: 'Slug URL',
  formFieldLabel__role: 'Rola',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddresses:
    'Wprowadź lub wklej jeden lub więcej adresów e-mail, oddzielonych spacjami lub przecinkami',
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
  formFieldInputPlaceholder__organizationSlug: '',
  formFieldAction__forgotPassword: 'Zapomniałem/am hasła',
  formFieldHintText__optional: 'Opcjonalne',
  formButtonPrimary: 'Kontynuuj',
  signInEnterPasswordTitle: 'Wprowadź swoje hasło',
  backButton: 'Powrót',
  footerActionLink__useAnotherMethod: 'Użyj innej metody',
  badge__primary: 'Podstawowy',
  badge__thisDevice: 'To urządzenie',
  badge__userDevice: 'Urządzenie użytkownika',
  badge__otherImpersonatorDevice: 'Inne urządzenie osobiste',
  badge__default: 'Domyślny',
  badge__unverified: 'Niezweryfikowany',
  badge__requiresAction: 'Wymaga działania',
  badge__you: 'Ty',
  footerPageLink__help: 'Pomoc',
  footerPageLink__privacy: 'Prywatność',
  footerPageLink__terms: 'Warunki',
  paginationButton__previous: 'Poprzedni',
  paginationButton__next: 'Następny',
  paginationRowText__displaying: 'Wyświetlanie',
  paginationRowText__of: 'z',
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Użytkownik',
  membershipRole__guestMember: 'Gość',
  signUp: {
    start: {
      title: 'Utwórz swoje konto',
      subtitle: 'aby kontynuować w {{applicationName}}',
      actionText: 'Masz już konto?',
      actionLink: 'Zaloguj się',
    },
    emailLink: {
      title: 'Zweryfikuj swój adres e-mail',
      subtitle: 'aby kontynuować w {{applicationName}}',
      formTitle: 'Link weryfikacyjny',
      formSubtitle: 'Użyj linku weryfikacyjnego wysłanego na Twój adres e-mail',
      resendButton: 'Wyślij ponownie',
      verified: {
        title: 'Pomyślnie zarejestrowano',
      },
      loading: {
        title: 'Rejestrowanie...',
      },
      verifiedSwitchTab: {
        title: 'Adres e-mail został pomyślnie zweryfikowany',
        subtitle: 'Powróć do nowo otwartej karty, aby kontynuować',
        subtitleNewTab: 'Powróć do poprzedniej karty, aby kontynuować',
      },
    },
    emailCode: {
      title: 'Zweryfikuj swój adres e-mail',
      subtitle: 'aby kontynuować w {{applicationName}}',
      formTitle: 'Kod weryfikacyjny',
      formSubtitle: 'Wprowadź kod weryfikacyjny wysłany na Twój adres e-mail',
      resendButton: 'Wyślij ponownie',
    },
    phoneCode: {
      title: 'Zweryfikuj swój numer telefonu',
      subtitle: 'aby kontynuować w {{applicationName}}',
      formTitle: 'Kod weryfikacyjny',
      formSubtitle: 'Wprowadź kod weryfikacyjny wysłany na Twój numer telefonu',
      resendButton: 'Wyślij ponownie',
    },
    continue: {
      title: 'Uzupełnij brakujące pola',
      subtitle: 'aby kontynuować w {{applicationName}}',
      actionText: 'Masz już konto?',
      actionLink: 'Zaloguj się',
    },
  },
  signIn: {
    start: {
      title: 'Zaloguj się',
      subtitle: 'aby przejść do {{applicationName}}',
      actionText: 'Nie masz konta?',
      actionLink: 'Zarejestruj się',
      actionLink__use_email: 'Użyj adresu e-mail',
      actionLink__use_phone: 'Użyj numeru telefonu',
      actionLink__use_username: 'Użyj nazwy użytkownika',
      actionLink__use_email_username: 'Użyj adresu e-mail lub nazwy użytkownika',
    },
    password: {
      title: 'Wprowadź swoje hasło',
      subtitle: 'aby kontynuować w {{applicationName}}',
      actionLink: 'Użyj innego sposobu',
    },
    emailCode: {
      title: 'Sprawdź swoją pocztę e-mail',
      subtitle: 'aby kontynuować w {{applicationName}}',
      formTitle: 'Kod weryfikacyjny',
      formSubtitle: 'Wprowadź kod weryfikacyjny wysłany na Twój adres e-mail',
      resendButton: 'Wyślij kod ponownie',
    },
    emailLink: {
      title: 'Sprawdź swoją pocztę e-mail',
      subtitle: 'aby kontynuować w {{applicationName}}',
      formTitle: 'Link weryfikacyjny',
      formSubtitle: 'Użyj linku weryfikacyjnego wysłanego na Twój adres e-mail',
      resendButton: 'Wyślij link ponownie',
      unusedTab: {
        title: 'Możesz zamknąć tę kartę',
      },
      verified: {
        title: 'Pomyślnie zalogowano',
        subtitle: 'Zostaniesz przekierowany wkrótce',
      },
      verifiedSwitchTab: {
        subtitle: 'Powróć do oryginalnej karty, aby kontynuować',
        titleNewTab: 'Zalogowano na innej karcie',
        subtitleNewTab: 'Powróć do nowo otwartej karty, aby kontynuować',
      },
      loading: {
        title: 'Logowanie...',
        subtitle: 'Zostaniesz przekierowany wkrótce',
      },
      failed: {
        title: 'Ten link weryfikacyjny jest nieprawidłowy',
        subtitle: 'Powróć do oryginalnej karty, aby kontynuować.',
      },
      expired: {
        title: 'Ten link weryfikacyjny wygasł',
        subtitle: 'Powróć do oryginalnej karty, aby kontynuować.',
      },
    },
    phoneCode: { ...commonTexts.signIn.phoneCode },
    phoneCodeMfa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totpMfa: {
      title: 'Weryfikacja dwustopniowa',
      subtitle: '',
      formTitle: 'Kod weryfikacyjny',
      formSubtitle: 'Wprowadź kod weryfikacyjny wygenerowany przez Twoją aplikację uwierzytelniającą',
    },
    backupCodeMfa: {
      title: 'Wprowadź kod zapasowy',
      subtitle: 'aby przejść do {{applicationName}}',
      formTitle: '',
      formSubtitle: '',
    },
    alternativeMethods: {
      title: 'Użyj innego sposobu',
      actionLink: 'Uzyskaj pomoc',
      blockButton__emailLink: 'Wyślij link do {{identifier}}',
      blockButton__emailCode: 'Wyślij kod do {{identifier}}',
      blockButton__phoneCode: 'Wyślij kod do {{identifier}}',
      blockButton__password: 'Zaloguj się za pomocą hasła',
      blockButton__totp: 'Użyj aplikacji uwierzytelniającej',
      blockButton__backupCode: 'Użyj kodu zapasowego',
      getHelp: {
        title: 'Uzyskaj pomoc',
        content:
          'Jeśli masz problem z zalogowaniem się do swojego konta, wyślij do nas e-mail, a postaramy się jak najszybciej przywrócić dostęp.',
        blockButton__emailSupport: 'Wyślij e-mail do pomocy technicznej',
      },
    },
    noAvailableMethods: {
      title: 'Nie można się zalogować',
      subtitle: 'Wystąpił błąd',
      message: 'Nie można kontynuować logowania. Brak dostępnych czynników uwierzytelniających.',
    },
  },
  userProfile: {
    mobileButton__menu: 'Menu',
    formButtonPrimary__continue: 'Kontynuuj',
    formButtonPrimary__finish: 'Zakończ',
    formButtonReset: 'Anuluj',
    start: {
      headerTitle__account: 'Konto',
      headerTitle__security: 'Bezpieczeństwo',
      headerSubtitle__account: 'Zarządzaj swoimi informacjami o koncie',
      headerSubtitle__security: 'Zarządzaj swoimi preferencjami dotyczącymi bezpieczeństwa',
      profileSection: {
        title: 'Profil',
      },
      usernameSection: {
        title: 'Nazwa użytkownika',
        primaryButton__changeUsername: 'Zmień nazwę użytkownika',
        primaryButton__setUsername: 'Ustaw nazwę użytkownika',
      },
      emailAddressesSection: {
        title: 'Adresy email',
        primaryButton: 'Dodaj adres email',
        detailsTitle__primary: 'Główny adres email',
        detailsSubtitle__primary: 'Ten adres email jest głównym adresem email',
        detailsAction__primary: 'Zakończ weryfikację',
        detailsTitle__nonPrimary: 'Ustaw jako główny adres email',
        detailsSubtitle__nonPrimary:
          'Ustaw ten adres email jako główny, aby otrzymywać komunikaty dotyczące Twojego konta.',
        detailsAction__nonPrimary: 'Ustaw jako główny',
        detailsTitle__unverified: 'Niezweryfikowany adres email',
        detailsSubtitle__unverified: 'Ten adres email nie został zweryfikowany i może mieć ograniczoną funkcjonalność.',
        detailsAction__unverified: 'Zakończ weryfikację',
        destructiveActionTitle: 'Usuń',
        destructiveActionSubtitle: 'Usuń ten adres email i usuń go z Twojego konta',
        destructiveAction: 'Usuń adres email',
      },
      phoneNumbersSection: {
        title: 'Numery telefonów',
        primaryButton: 'Dodaj numer telefonu',
        detailsTitle__primary: 'Główny numer telefonu',
        detailsSubtitle__primary: 'Ten numer telefonu jest głównym numerem telefonu',
        detailsAction__primary: 'Zakończ weryfikację',
        detailsTitle__nonPrimary: 'Ustaw jako główny numer telefonu',
        detailsSubtitle__nonPrimary:
          'Ustaw ten numer telefonu jako główny, aby otrzymywać komunikaty dotyczące Twojego konta.',
        detailsAction__nonPrimary: 'Ustaw jako główny',
        detailsTitle__unverified: 'Niezweryfikowany numer telefonu',
        detailsSubtitle__unverified:
          'Ten numer telefonu nie został zweryfikowany i może mieć ograniczoną funkcjonalność.',
        detailsAction__unverified: 'Zakończ weryfikację',
        destructiveActionTitle: 'Usuń',
        destructiveActionSubtitle: 'Usuń ten numer telefonu i usuń go z Twojego konta',
        destructiveAction: 'Usuń numer telefonu',
      },
      connectedAccountsSection: {
        title: 'Połączone konta',
        primaryButton: 'Połącz konto',
        title__conectionFailed: 'Ponów próbę nieudanego połączenia',
        title__connectionFailed: 'Ponów próbę nieudanego połączenia',
        title__reauthorize: 'Wymagana ponowna autoryzacja',
        subtitle__reauthorize:
          'Wymagane zakresy zostały zaktualizowane i możesz mieć ograniczoną funkcjonalność. Proszę ponownie autoryzuj tę aplikację, aby uniknąć problemów',
        actionLabel__conectionFailed: 'Spróbuj ponownie',
        actionLabel__connectionFailed: 'Spróbuj ponownie',
        actionLabel__reauthorize: 'Autoryzuj teraz',
        destructiveActionTitle: 'Odłącz',
        destructiveActionSubtitle: 'Po odłączeniu konta nie będzie można zalogować się z jego pomocą.',
        destructiveActionAccordionSubtitle: 'Odłącz to konto',
      },
      passwordSection: {
        title: 'Hasło',
        primaryButton__changePassword: 'Zmień hasło',
        primaryButton__setPassword: 'Ustaw hasło',
      },
      mfaSection: {
        title: 'Weryfikacja dwuetapowa',
        primaryButton: 'Dodaj weryfikację dwuetapową',
        phoneCode: {
          destructiveActionTitle: 'Usuń',
          destructiveActionSubtitle: 'Usuń ten numer telefonu z metod weryfikacji dwuetapowej',
          destructiveActionLabel: 'Usuń numer telefonu',
          title__default: 'Domyślny czynnik',
          title__setDefault: 'Ustaw jako domyślny czynnik',
          subtitle__default:
            'Ten czynnik będzie używany jako domyślna metoda weryfikacji dwuetapowej podczas logowania.',
          subtitle__setDefault:
            'Ustaw ten czynnik jako domyślny, aby używać go jako domyślnej metody weryfikacji dwuetapowej podczas logowania.',
          actionLabel__setDefault: 'Ustaw jako domyślny',
        },
        backupCodes: {
          headerTitle: 'Kody zapasowe',
          title__regenerate: 'Wygeneruj nowe kody zapasowe',
          subtitle__regenerate:
            'Otrzymaj nowy zestaw bezpiecznych kodów zapasowych. Poprzednie kody zapasowe zostaną usunięte i nie będą działać.',
          actionLabel__regenerate: 'Wygeneruj kody',
        },
        totp: {
          headerTitle: 'Aplikacja autoryzacyjna',
          title: 'Domyślny czynnik',
          subtitle: 'Ten czynnik będzie używany jako domyślna metoda weryfikacji dwuetapowej podczas logowania.',
          destructiveActionTitle: 'Usuń',
          destructiveActionSubtitle: 'Usuń aplikację autoryzacyjną z metod weryfikacji dwuetapowej',
          destructiveActionLabel: 'Usuń aplikację autoryzacyjną',
        },
      },
      activeDevicesSection: {
        title: 'Aktywne urządzenia',
        primaryButton: 'Aktywne urządzenia',
        detailsTitle: 'Bieżące urządzenie',
        detailsSubtitle: 'To jest urządzenie, którego aktualnie używasz',
        destructiveActionTitle: 'Wyloguj',
        destructiveActionSubtitle: 'Wyloguj się z konta na tym urządzeniu',
        destructiveAction: 'Wyloguj z urządzenia',
      },
      web3WalletsSection: {
        title: 'Portfele Web3',
        primaryButton: 'Portfele Web3',
        destructiveActionTitle: 'Usuń',
        destructiveActionSubtitle: 'Usuń ten portfel Web3 z twojego konta',
        destructiveAction: 'Usuń portfel',
      },
      dangerSection: {
        title: 'Niebezpieczeństwo',
        deleteAccountButton: 'Usuń konto',
        deleteAccountTitle: 'Usuń konto',
        deleteAccountDescription: 'Usuń konto i wszystkie dane z nim związane',
      },
    },

    profilePage: {
      title: 'Edytuj profil',
      imageFormTitle: 'Zdjęcie profilowe',
      imageFormSubtitle: 'Prześlij zdjęcie',
      imageFormDestructiveActionSubtitle: 'Usuń zdjęcie',
      fileDropAreaTitle: 'Przeciągnij plik tutaj lub...',
      fileDropAreaAction: 'Wybierz plik',
      fileDropAreaHint: 'Prześlij zdjęcie w formacie JPG, PNG, GIF lub WEBP mniejsze niż 10 MB',
      successMessage: 'Twój profil został zaktualizowany.',
    },
    usernamePage: {
      title: 'Zmień nazwę użytkownika',
      successMessage: 'Twoja nazwa użytkownika została zaktualizowana.',
    },
    emailAddressPage: {
      title: 'Dodaj adres e-mail',
      emailCode: {
        formHint: 'E-mail zawierający kod weryfikacyjny zostanie wysłany na ten adres e-mail.',
        formTitle: 'Kod weryfikacyjny',
        formSubtitle: 'Wprowadź kod weryfikacyjny wysłany na adres {{identifier}}',
        resendButton: 'Wyślij ponownie kod',
        successMessage: 'Adres e-mail {{identifier}} został dodany do twojego konta.',
      },
      emailLink: {
        formHint: 'E-mail zawierający link weryfikacyjny zostanie wysłany na ten adres e-mail.',
        formTitle: 'Link weryfikacyjny',
        formSubtitle: 'Kliknij w link weryfikacyjny w e-mailu wysłanym na adres {{identifier}}',
        resendButton: 'Wyślij ponownie link',
        successMessage: 'Adres e-mail {{identifier}} został dodany do twojego konta.',
      },
      removeResource: {
        title: 'Usuń adres e-mail',
        messageLine1: '{{identifier}} zostanie usunięty z tego konta.',
        messageLine2: 'Nie będzie już możliwe zalogowanie się za pomocą tego adresu e-mail.',
        successMessage: '{{emailAddress}} został usunięty z twojego konta.',
      },
    },
    phoneNumberPage: {
      title: 'Dodaj numer telefonu',
      successMessage: '{{identifier}} został dodany do twojego konta.',
      infoText: 'Wiadomość tekstowa zawierająca link weryfikacyjny zostanie wysłana na ten numer telefonu.',
      infoText__secondary: 'Mogą obowiązywać opłaty za wiadomości i transfer danych.',
      removeResource: {
        title: 'Usuń numer telefonu',
        messageLine1: '{{identifier}} zostanie usunięty z tego konta.',
        messageLine2: 'Nie będzie już możliwe zalogowanie się za pomocą tego numeru telefonu.',
        successMessage: '{{phoneNumber}} został usunięty z twojego konta.',
      },
    },

    connectedAccountPage: {
      title: 'Dodaj połączone konto',
      formHint: 'Wybierz dostawcę, aby połączyć konto.',
      formHint__noAccounts: 'Nie ma dostępnych zewnętrznych dostawców kont.',
      socialButtonsBlockButton: 'Połącz konto {{provider|titleize}}',
      successMessage: 'Dostawca został dodany do Twojego konta.',
      removeResource: {
        title: 'Usuń połączone konto',
        messageLine1: '{{identifier}} zostanie usunięte z tego konta.',
        messageLine2:
          'Nie będziesz już mógł korzystać z tego połączonego konta i wszystkie zależne funkcje przestaną działać.',
        successMessage: '{{connectedAccount}} został usunięty z Twojego konta.',
      },
    },
    web3WalletPage: {
      title: 'Dodaj portfel web3',
      subtitle__availableWallets: 'Wybierz portfel web3 do połączenia z Twoim kontem.',
      subtitle__unavailableWallets: 'Nie ma dostępnych portfeli web3.',
      successMessage: 'Portfel został dodany do Twojego konta.',
      removeResource: {
        title: 'Usuń portfel web3',
        messageLine1: '{{identifier}} zostanie usunięty z tego konta.',
        messageLine2: 'Nie będziesz już mógł się zalogować za pomocą tego portfela web3.',
        successMessage: '{{web3Wallet}} został usunięty z Twojego konta.',
      },
    },

    passwordPage: {
      title: 'Ustaw hasło',
      changePasswordTitle: 'Zmień hasło',
      successMessage: 'Twoje hasło zostało ustawione.',
      changePasswordSuccessMessage: 'Twoje hasło zostało zaktualizowane.',
      sessionsSignedOutSuccessMessage: 'Wylogowano z wszystkich innych urządzeń.',
    },
    mfaPage: {
      title: 'Dodaj weryfikację dwuetapową',
      formHint: 'Wybierz metodę dodania.',
    },
    mfaTOTPPage: {
      title: 'Dodaj aplikację autentykacyjną',
      verifyTitle: 'Kod weryfikacyjny',
      verifySubtitle: 'Wprowadź kod weryfikacyjny wygenerowany przez Twoją aplikację autentykacyjną',
      successMessage:
        'Weryfikacja dwuetapowa jest teraz włączona. Przy logowaniu będziesz musiał wprowadzić kod weryfikacyjny z tej aplikacji jako dodatkowy krok.',
      authenticatorApp: {
        infoText__ableToScan:
          'Ustaw nową metodę logowania w swojej aplikacji autentykacyjnej i zeskanuj następujący kod QR, aby połączyć go z Twoim kontem.',
        infoText__unableToScan:
          'Ustaw nową metodę logowania w swojej aplikacji autentykacyjnej i wprowadź poniższy klucz.',
        inputLabel__unableToScan1:
          'Upewnij się, że włączona jest opcja jednorazowe hasła lub hasła oparte na czasie, a następnie zakończ łączenie konta.',
        inputLabel__unableToScan2:
          'Alternatywnie, jeśli Twoja aplikacja autentykacyjna obsługuje URI TOTP, możesz również skopiować pełny URI.',
        buttonAbleToScan__nonPrimary: 'Zamiast tego zeskanuj kod QR',
        buttonUnableToScan__nonPrimary: 'Nie można zeskanować kodu QR?',
      },
      removeResource: {
        title: 'Usuń weryfikację dwuetapową',
        messageLine1: 'Kody weryfikacyjne z tej aplikacji autentykacyjnej nie będą już wymagane podczas logowania.',
        messageLine2: 'Twoje konto może być mniej bezpieczne. Czy na pewno chcesz kontynuować?',
        successMessage: 'Weryfikacja dwuetapowa za pomocą aplikacji autentykacyjnej została usunięta.',
      },
    },

    mfaPhoneCodePage: {
      title: 'Dodaj weryfikację kodem SMS',
      primaryButton__addPhoneNumber: 'Dodaj numer telefonu',
      subtitle__availablePhoneNumbers:
        'Wybierz numer telefonu, aby zarejestrować weryfikację kodem SMS w dwustopniowym procesie uwierzytelniania.',
      subtitle__unavailablePhoneNumbers:
        'Brak dostępnych numerów telefonów do zarejestrowania weryfikacji kodem SMS w dwustopniowym procesie uwierzytelniania.',
      successMessage:
        'Weryfikacja kodem SMS w dwustopniowym procesie uwierzytelniania jest teraz włączona dla tego numeru telefonu. Podczas logowania będziesz musiał podać kod weryfikacyjny wysłany na ten numer telefonu jako dodatkowy krok.',
      removeResource: {
        title: 'Usuń dwustopniową weryfikację',
        messageLine1: '{{identifier}} nie będzie już otrzymywał kodów weryfikacyjnych podczas logowania.',
        messageLine2: 'Twoje konto może być mniej bezpieczne. Czy na pewno chcesz kontynuować?',
        successMessage:
          'Weryfikacja kodem SMS w dwustopniowym procesie uwierzytelniania została usunięta dla {{mfaPhoneCode}}',
      },
    },
    backupCodePage: {
      title: 'Dodaj weryfikację kodem zapasowym',
      title__codelist: 'Kody zapasowe',
      subtitle__codelist: 'Przechowuj je bezpiecznie i zachowaj w tajemnicy.',
      infoText1: 'Kody zapasowe zostaną włączone dla tego konta.',
      infoText2:
        'Przechowuj kody zapasowe w tajemnicy i bezpiecznie. Możesz wygenerować nowe kody, jeśli podejrzewasz, że zostały skompromitowane.',
      successSubtitle:
        'Możesz użyć jednego z tych kodów do zalogowania się na swoje konto, jeśli utracisz dostęp do urządzenia uwierzytelniającego.',
      successMessage:
        'Kody zapasowe są teraz włączone. Możesz użyć jednego z tych kodów do zalogowania się na swoje konto, jeśli utracisz dostęp do urządzenia uwierzytelniającego. Każdy kod można użyć tylko raz.',
      actionLabel__copy: 'Skopiuj wszystkie',
      actionLabel__copied: 'Skopiowane!',
      actionLabel__download: 'Pobierz .txt',
      actionLabel__print: 'Drukuj',
    },
  },

  userButton: {
    action__manageAccount: 'Zarządzaj kontem',
    action__signOut: 'Wyloguj',
    action__signOutAll: 'Wyloguj ze wszystkich kont',
    action__addAccount: 'Dodaj konto',
  },
  organizationSwitcher: {
    personalWorkspace: 'Przestrzeń osobista',
    notSelected: 'Nie wybrano organizacji',
    action__createOrganization: 'Utwórz organizację',
    action__manageOrganization: 'Zarządzaj organizacją',
  },
  impersonationFab: {
    title: 'Zalogowano jako {{identifier}}',
    action__signOut: 'Wyloguj',
  },
  organizationProfile: {
    start: {
      headerTitle__members: 'Członkowie',
      headerTitle__settings: 'Ustawienia',
      headerSubtitle__members: 'Wyświetl i zarządzaj członkami organizacji',
      headerSubtitle__settings: 'Zarządzaj ustawieniami organizacji',
    },
    profilePage: {
      title: 'Profil organizacji',
      subtitle: 'Zarządzaj profilem organizacji',
      successMessage: 'Organizacja została zaktualizowana.',
      dangerSection: {
        title: 'Zagrożenie',
        leaveOrganization: {
          title: 'Opuść organizację',
          messageLine1:
            'Czy na pewno chcesz opuścić tę organizację? Stracisz dostęp do tej organizacji i jej aplikacji.',
          messageLine2: 'Ta akcja jest trwała i nieodwracalna.',
          successMessage: 'Opuściłeś organizację.',
        },
      },
    },

    invitePage: {
      title: 'Zaproś użytkowników',
      subtitle: 'Zaproś nowych użytkowników do tej organizacji',
      successMessage: 'Zaproszenia zostały pomyślnie wysłane',
      detailsTitle__inviteFailed: 'Nie udało się wysłać zaproszeń. Napraw poniższe problemy i spróbuj ponownie:',
      formButtonPrimary__continue: 'Wyślij zaproszenia',
    },
    membersPage: {
      detailsTitle__emptyRow: 'Brak użytkowników do wyświetlenia',
      action__invite: 'Zaproś',
      start: {
        headerTitle__active: 'Aktywni',
        headerTitle__invited: 'Zaproszeni',
      },
      activeMembersTab: {
        tableHeader__user: 'Użytkownik',
        tableHeader__joined: 'Dołączył',
        tableHeader__role: 'Rola',
        tableHeader__actions: '',
        menuAction__remove: 'Usuń użytkownika',
      },
      invitedMembersTab: {
        tableHeader__invited: 'Zaproszony',
        menuAction__revoke: 'Anuluj zaproszenie',
      },
    },
  },
  createOrganization: {
    title: 'Utwórz organizację',
    formButtonSubmit: 'Utwórz organizację',
    subtitle: 'Ustaw profil organizacji',
    invitePage: {
      formButtonReset: 'Pomiń',
    },
  },
  unstable__errors: {
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
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
    form_password_validation_failed: 'Podane hasło jest nieprawidłowe',

    passwordComplexity: {
      sentencePrefix: 'Twoje hasło musi zawierać',
      minimumLength: '{{length}} lub więcej znaków',
      maximumLength: 'mniej niż {{length}} znaków',
      requireNumbers: 'cyfrę',
      requireLowercase: 'małą literę',
      requireUppercase: 'wielką literę',
      requireSpecialCharacter: 'znak specjalny',
    },
  },
  dates: {
    previous6Days: "Ostatni(a) {{ date | weekday('pl-PL','long') }} o godzinie {{ date | timeString('pl-PL') }}",
    lastDay: "Wczoraj o godzinie {{ date | timeString('pl-PL') }}",
    sameDay: "Dzisiaj o godzinie {{ date | timeString('pl-PL') }}",
    nextDay: "Jutro o godzinie {{ date | timeString('pl-PL') }}",
    next6Days: "{{ date | weekday('pl-PL','long') }} o godzinie {{ date | timeString('pl-PL') }}",
    numeric: "{{ date | numeric('pl-PL') }}",
  },
} as const;
