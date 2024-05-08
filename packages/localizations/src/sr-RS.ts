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

export const srRS: LocalizationResource ={
  locale: 'sr-RS',
  backButton: 'Nazad',
  badge__default: 'Podrazumevano',
  badge__otherImpersonatorDevice: 'Drugi uređaj koji se predstavlja',
  badge__primary: 'Primarni',
  badge__requiresAction: 'Zahteva akciju',
  badge__thisDevice: 'Ovaj uređaj',
  badge__unverified: 'Nepotvrđen',
  badge__userDevice: 'Korisnički uređaj',
  badge__you: 'Vi',
  createOrganization: {
    formButtonSubmit: 'Kreiraj organizaciju',
    invitePage: {
      formButtonReset: 'Preskoči',
    },
    title: 'Kreiraj organizaciju',
  },
  dates: {
    lastDay: "Juče u {{ date | timeString('sr-RS') }}",
    next6Days:
      "{{ date | weekday('sr-RS','long') }} u {{ date | timeString('sr-RS') }}",
    nextDay: "Sutra u {{ date | timeString('sr-RS') }}",
    numeric: "{{ date | numeric('sr-RS') }}",
    previous6Days:
      "Prošli {{ date | weekday('sr-RS','long') }} u {{ date | timeString('sr-RS') }}",
    sameDay: "Danas u {{ date | timeString('sr-RS') }}",
  },
  dividerText: 'ili',
  footerActionLink__useAnotherMethod: 'Koristi drugu metodu',
  footerPageLink__help: 'Pomoć',
  footerPageLink__privacy: 'Privatnost',
  footerPageLink__terms: 'Uslovi',
  formButtonPrimary: 'Nastavi',
  formButtonPrimary__verify: 'Verifikuj',
  formFieldAction__forgotPassword: 'Zaboravljena lozinka?',
  formFieldError__matchingPasswords: 'Lozinke se poklapaju.',
  formFieldError__notMatchingPasswords: 'Lozinke se ne poklapaju.',
  formFieldError__verificationLinkExpired:
    'Link za verifikaciju je istekao. Molimo zatražite novi link.',
  formFieldHintText__optional: 'Opciono',
  formFieldHintText__slug:
    'Slug je lako čitljivi ID koji mora biti jedinstven. Često se koristi u URL-ovima.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Obriši nalog',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'primer@email.com, primer2@email.com',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__organizationDomain: '',
  formFieldInputPlaceholder__organizationDomainEmailAddress: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldInputPlaceholder__organizationSlug: 'moja-org',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldLabel__automaticInvitations:
    'Omogući automatske pozivnice za ovaj domen',
  formFieldLabel__backupCode: 'Rezervni kod',
  formFieldLabel__confirmDeletion: 'Potvrda',
  formFieldLabel__confirmPassword: 'Potvrdi lozinku',
  formFieldLabel__currentPassword: 'Trenutna lozinka',
  formFieldLabel__emailAddress: 'E-mail adresa',
  formFieldLabel__emailAddress_username: 'E-mail adresa ili korisničko ime',
  formFieldLabel__emailAddresses: 'E-mail adrese',
  formFieldLabel__firstName: 'Ime',
  formFieldLabel__lastName: 'Prezime',
  formFieldLabel__newPassword: 'Nova lozinka',
  formFieldLabel__organizationDomain: 'Domen',
  formFieldLabel__organizationDomainDeletePending:
    'Obriši čekajuće pozivnice i predloge',
  formFieldLabel__organizationDomainEmailAddress:
    'E-mail adresa za verifikaciju',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Unesite e-mail adresu pod ovim domenom da biste primili kod i verifikovali ovaj domen.',
  formFieldLabel__organizationName: 'Naziv',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Naziv ključa za prolaz',
  formFieldLabel__password: 'Lozinka',
  formFieldLabel__phoneNumber: 'Telefonski broj',
  formFieldLabel__role: 'Uloga',
  formFieldLabel__signOutOfOtherSessions: 'Odjavi se sa svih drugih uređaja',
  formFieldLabel__username: 'Korisničko ime',
  impersonationFab: {
    action__signOut: 'Odjavi se',
    title: 'Prijavljeni ste kao {{identifier}}',
  },
  maintenanceMode:
    'Trenutno smo u modu održavanja, ali ne brinite, neće trajati duže od nekoliko minuta.',
  membershipRole__admin: 'Administrator',
  membershipRole__basicMember: 'Član',
  membershipRole__guestMember: 'Gost',
  organizationList: {
    action__createOrganization: 'Kreiraj organizaciju',
    action__invitationAccept: 'Pridruži se',
    action__suggestionsAccept: 'Zatraži pridruživanje',
    createOrganization: 'Kreiraj organizaciju',
    invitationAcceptedLabel: 'Pridružen',
    subtitle: 'da nastavite na {{applicationName}}',
    suggestionsAcceptedLabel: 'Čeka odobrenje',
    title: 'Izaberi nalog',
    titleWithoutPersonal: 'Izaberi organizaciju',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Automatske pozivnice',
    badge__automaticSuggestion: 'Automatski predlozi',
    badge__manualInvitation: 'Bez automatskog uključivanja',
    badge__unverified: 'Nepotvrđen',
    createDomainPage: {
      subtitle:
        'Dodajte domen za verifikaciju. Korisnici sa e-mail adresama na ovom domenu mogu se automatski pridružiti organizaciji ili zatražiti pridruživanje.',
      title: 'Dodaj domen',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Pozivnice nisu poslate. Već postoje čekajuće pozivnice za sledeće e-mail adrese: {{email_addresses}}.',
      formButtonPrimary__continue: 'Pošalji pozivnice',
      selectDropdown__role: 'Izaberi ulogu',
      subtitle:
        'Unesi ili nalepi jednu ili više e-mail adresa, razdvojene razmacima ili zarezima.',
      successMessage: 'Pozivnice su uspešno poslate',
      title: 'Pozovi nove članove',
    },
    membersPage: {
      action__invite: 'Pozovi',
      activeMembersTab: {
        menuAction__remove: 'Ukloni člana',
        tableHeader__actions: '',
        tableHeader__joined: 'Pridružio se',
        tableHeader__role: 'Uloga',
        tableHeader__user: 'Korisnik',
      },
      detailsTitle__emptyRow: 'Nema članova za prikaz',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Pozovi korisnike povezivanjem e-mail domena sa vašom organizacijom. Svako ko se registruje sa odgovarajućim e-mail domenom može se pridružiti organizaciji u bilo koje vreme.',
          headerTitle: 'Automatske pozivnice',
          primaryButton: 'Upravljaj potvrđenim domenima',
        },
        table__emptyRow: 'Nema pozivnica za prikaz',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Poništi pozivnicu',
        tableHeader__invited: 'Pozvan',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Korisnici koji se registruju sa odgovarajućim e-mail domenom, moći će da vide predlog da zatraže pridruživanje vašoj organizaciji.',
          headerTitle: 'Automatski predlozi',
          primaryButton: 'Upravljaj potvrđenim domenima',
        },
        menuAction__approve: 'Odobri',
        menuAction__reject: 'Odbaci',
        tableHeader__requested: 'Zatražen pristup',
        table__emptyRow: 'Nema zahteva za prikaz',
      },
      start: {
        headerTitle__invitations: 'Pozivnice',
        headerTitle__members: 'Članovi',
        headerTitle__requests: 'Zahtevi',
      },
    },
    navbar: {
      description: 'Upravljaj svojom organizacijom.',
      general: 'Opšte',
      members: 'Članovi',
      title: 'Organizacija',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Upiši "{{organizationName}}" ispod da nastaviš.',
          messageLine1:
            'Da li ste sigurni da želite da obrišete ovu organizaciju?',
          messageLine2: 'Ova akcija je trajna i nepovratna.',
          successMessage: 'Organizacija je obrisana.',
          title: 'Obriši organizaciju',
        },
        leaveOrganization: {
          actionDescription: 'Upiši "{{organizationName}}" ispod da nastaviš.',
          messageLine1:
            'Da li ste sigurni da želite da napustite ovu organizaciju? Izgubićete pristup ovoj organizaciji i njenim aplikacijama.',
          messageLine2: 'Ova akcija je trajna i nepovratna.',
          successMessage: 'Napustili ste organizaciju.',
          title: 'Napusti organizaciju',
        },
        title: 'Opasnost',
      },
      domainSection: {
        menuAction__manage: 'Upravljaj',
        menuAction__remove: 'Obriši',
        menuAction__verify: 'Verifikuj',
        primaryButton: 'Dodaj domen',
        subtitle:
          'Dozvoli korisnicima da se automatski pridruže organizaciji ili zatraže pridruživanje na osnovu potvrđenog e-mail domena.',
        title: 'Potvrđeni domeni',
      },
      successMessage: 'Organizacija je ažurirana.',
      title: 'Ažuriraj profil',
    },
    removeDomainPage: {
      messageLine1: 'E-mail domen {{domain}} će biti uklonjen.',
      messageLine2:
        'Korisnici više neće moći automatski da se pridruže organizaciji nakon ovoga.',
      successMessage: '{{domain}} je uklonjen.',
      title: 'Ukloni domen',
    },
    start: {
      headerTitle__general: 'Opšte',
      headerTitle__members: 'Članovi',
      profileSection: {
        primaryButton: 'Ažuriraj profil',
        title: 'Profil organizacije',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel:
          'Uklanjanje ovog domena će uticati na pozvane korisnike.',
        removeDomainActionLabel__remove: 'Ukloni domen',
        removeDomainSubtitle: 'Ukloni ovaj domen iz tvojih potvrđenih domena',
        removeDomainTitle: 'Ukloni domen',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Korisnici se automatski pozivaju da se pridruže organizaciji kada se registruju i mogu se pridružiti u bilo koje vreme.',
        automaticInvitationOption__label: 'Automatske pozivnice',
        automaticSuggestionOption__description:
          'Korisnici dobijaju predlog da zatraže pridruživanje, ali moraju biti odobreni od strane administratora pre nego što mogu da se pridruže organizaciji.',
        automaticSuggestionOption__label: 'Automatski predlozi',
        calloutInfoLabel:
          'Promena načina upisa će uticati samo na nove korisnike.',
        calloutInvitationCountLabel:
          'Čekajuće pozivnice poslate korisnicima: {{count}}',
        calloutSuggestionCountLabel:
          'Čekajući predlozi poslati korisnicima: {{count}}',
        manualInvitationOption__description:
          'Korisnici mogu biti pozvani samo ručno u organizaciju.',
        manualInvitationOption__label: 'Bez automatskog uključivanja',
        subtitle:
          'Izaberi kako korisnici iz ovog domena mogu da se pridruže organizaciji.',
      },
      start: {
        headerTitle__danger: 'Opasnost',
        headerTitle__enrollment: 'Opcije upisa',
      },
      subtitle:
        'Domen {{domain}} je sada verifikovan. Nastavi biranjem načina upisa.',
      title: 'Ažuriraj {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Unesi verifikacioni kod poslat na tvoju e-mail adresu',
      formTitle: 'Verifikacioni kod',
      resendButton: 'Nisi primio kod? Pošalji ponovo',
      subtitle: 'Domen {{domainName}} mora biti verifikovan putem e-maila.',
      subtitleVerificationCodeScreen:
        'Verifikacioni kod je poslat na {{emailAddress}}. Unesi kod da nastaviš.',
      title: 'Verifikuj domen',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Kreiraj organizaciju',
    action__invitationAccept: 'Pridruži se',
    action__manageOrganization: 'Upravljaj',
    action__suggestionsAccept: 'Zatraži pridruživanje',
    notSelected: 'Organizacija nije izabrana',
    personalWorkspace: 'Lični nalog',
    suggestionsAcceptedLabel: 'Čeka odobrenje',
  },
  paginationButton__next: 'Sledeći',
  paginationButton__previous: 'Prethodni',
  paginationRowText__displaying: 'Prikazujem',
  paginationRowText__of: 'od',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Dodaj nalog',
      action__signOutAll: 'Odjavi se sa svih naloga',
      subtitle: 'Izaberi nalog s kojim želiš da nastaviš.',
      title: 'Izaberi nalog',
    },
    alternativeMethods: {
      actionLink: 'Zatraži pomoć',
      actionText: 'Nemaš ni jednu od ovih opcija?',
      blockButton__backupCode: 'Koristi rezervni kod',
      blockButton__emailCode: 'Pošalji kod na e-mail {{identifier}}',
      blockButton__emailLink: 'Pošalji link na e-mail {{identifier}}',
      blockButton__passkey: 'Prijavi se sa svojim ključem za prolaz',
      blockButton__password: 'Prijavi se sa svojom lozinkom',
      blockButton__phoneCode: 'Pošalji SMS kod na {{identifier}}',
      blockButton__totp: 'Koristi svoju aplikaciju za autentifikaciju',
      getHelp: {
        blockButton__emailSupport: 'Pošalji e-mail podršci',
        content:
          'Ako imaš problema sa prijavljivanjem na svoj nalog, pošalji nam e-mail i pomoći ćemo ti da što pre povratiš pristup.',
        title: 'Zatraži pomoć',
      },
      subtitle:
        'Imaš problema? Možeš koristiti bilo koju od ovih metoda za prijavljivanje.',
      title: 'Koristi drugu metodu',
    },
    backupCodeMfa: {
      subtitle:
        'Tvoj rezervni kod je onaj koji si dobio kada si postavio dvostepenu autentifikaciju.',
      title: 'Unesi rezervni kod',
    },
    emailCode: {
      formTitle: 'Verifikacioni kod',
      resendButton: 'Nisi primio kod? Pošalji ponovo',
      subtitle: 'da nastaviš na {{applicationName}}',
      title: 'Proveri svoj e-mail',
    },
    emailLink: {
      expired: {
        subtitle: 'Vrati se na originalni tab da nastaviš.',
        title: 'Ovaj verifikacioni link je istekao',
      },
      failed: {
        subtitle: 'Vrati se na originalni tab da nastaviš.',
        title: 'Ovaj verifikacioni link je nevažeći',
      },
      formSubtitle: 'Koristi verifikacioni link poslat na tvoj e-mail',
      formTitle: 'Verifikacioni link',
      loading: {
        subtitle: 'Uskoro ćeš biti preusmeren',
        title: 'Prijavljujem se...',
      },
      resendButton: 'Nisi primio link? Pošalji ponovo',
      subtitle: 'da nastaviš na {{applicationName}}',
      title: 'Proveri svoj e-mail',
      unusedTab: {
        title: 'Možeš zatvoriti ovaj tab',
      },
      verified: {
        subtitle: 'Uskoro ćeš biti preusmeren',
        title: 'Uspešno si prijavljen',
      },
      verifiedSwitchTab: {
        subtitle: 'Vrati se na originalni tab da nastaviš',
        subtitleNewTab: 'Vrati se na novootvoreni tab da nastaviš',
        titleNewTab: 'Prijavljen na drugom tabu',
      },
    },
    forgotPassword: {
      formTitle: 'Kod za resetovanje lozinke',
      resendButton: 'Nisi primio kod? Pošalji ponovo',
      subtitle: 'da resetuješ svoju lozinku',
      subtitle_email: 'Prvo, unesi kod poslat na tvoju e-mail adresu',
      subtitle_phone: 'Prvo, unesi kod poslat na tvoj telefon',
      title: 'Resetuj lozinku',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Resetuj svoju lozinku',
      label__alternativeMethods: 'Ili, prijavi se drugom metodom',
      title: 'Zaboravljena lozinka?',
    },
    noAvailableMethods: {
      message:
        'Nije moguće nastaviti sa prijavom. Nema dostupnih metoda autentifikacije.',
      subtitle: 'Došlo je do greške',
      title: 'Nije moguće prijaviti se',
    },
    passkey: {
      subtitle:
        'Korišćenje tvojeg ključa za prolaz potvrđuje da si to ti. Tvoj uređaj može zatražiti otisak prsta, lice ili ekran zaključavanja.',
      title: 'Koristi svoj ključ za prolaz',
    },
    password: {
      actionLink: 'Koristi drugu metodu',
      subtitle: 'Unesi lozinku koja je povezana sa tvojim nalogom',
      title: 'Unesi svoju lozinku',
    },
    passwordPwned: {
      title: 'Lozinka kompromitovana',
    },
    phoneCode: {
      formTitle: 'Verifikacioni kod',
      resendButton: 'Nisi primio kod? Pošalji ponovo',
      subtitle: 'da nastaviš na {{applicationName}}',
      title: 'Proveri svoj telefon',
    },
    phoneCodeMfa: {
      formTitle: 'Verifikacioni kod',
      resendButton: 'Nisi primio kod? Pošalji ponovo',
      subtitle:
        'Da nastaviš, molimo unesi verifikacioni kod poslat na tvoj telefon',
      title: 'Proveri svoj telefon',
    },
    resetPassword: {
      formButtonPrimary: 'Resetuj lozinku',
      requiredMessage:
        'Iz sigurnosnih razloga, potrebno je da resetuješ svoju lozinku.',
      successMessage:
        'Tvoja lozinka je uspešno promenjena. Prijavljujem te, sačekaj trenutak.',
      title: 'Postavi novu lozinku',
    },
    resetPasswordMfa: {
      detailsLabel:
        'Potrebno je da potvrdimo tvoj identitet pre resetovanja lozinke.',
    },
    start: {
      actionLink: 'Registruj se',
      actionLink__use_email: 'Koristi e-mail',
      actionLink__use_email_username: 'Koristi e-mail ili korisničko ime',
      actionLink__use_passkey: 'Koristi ključ za prolaz umesto toga',
      actionLink__use_phone: 'Koristi telefon',
      actionLink__use_username: 'Koristi korisničko ime',
      actionText: 'Nemaš nalog?',
      subtitle: 'Dobro došao nazad! Molimo prijavi se da nastaviš',
      title: 'Prijavi se na {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Verifikacioni kod',
      subtitle:
        'Da nastaviš, molimo unesi verifikacioni kod generisan tvojom aplikacijom za autentifikaciju',
      title: 'Dvostepena verifikacija',
    },
  },
  signInEnterPasswordTitle: 'Unesi svoju lozinku',
  signUp: {
    continue: {
      actionLink: 'Prijavi se',
      actionText: 'Već imaš nalog?',
      subtitle: 'Molimo popuni preostale detalje da nastaviš.',
      title: 'Popuni nedostajuća polja',
    },
    emailCode: {
      formSubtitle: 'Unesi verifikacioni kod poslat na tvoju e-mail adresu',
      formTitle: 'Verifikacioni kod',
      resendButton: 'Nisi primio kod? Pošalji ponovo',
      subtitle: 'Unesi verifikacioni kod poslat na tvoj e-mail',
      title: 'Verifikuj svoj e-mail',
    },
    emailLink: {
      formSubtitle: 'Koristi verifikacioni link poslat na tvoju e-mail adresu',
      formTitle: 'Verifikacioni link',
      loading: {
        title: 'Registrujem se...',
      },
      resendButton: 'Nisi primio link? Pošalji ponovo',
      subtitle: 'da nastaviš na {{applicationName}}',
      title: 'Verifikuj svoj e-mail',
      verified: {
        title: 'Uspešno registrovan',
      },
      verifiedSwitchTab: {
        subtitle: 'Vrati se na novootvoreni tab da nastaviš',
        subtitleNewTab: 'Vrati se na prethodni tab da nastaviš',
        title: 'Uspešno verifikovan e-mail',
      },
    },
    phoneCode: {
      formSubtitle: 'Unesi verifikacioni kod poslat na tvoj telefonski broj',
      formTitle: 'Verifikacioni kod',
      resendButton: 'Nisi primio kod? Pošalji ponovo',
      subtitle: 'Unesi verifikacioni kod poslat na tvoj telefon',
      title: 'Verifikuj svoj telefon',
    },
    start: {
      actionLink: 'Prijavi se',
      actionText: 'Već imaš nalog?',
      subtitle: 'Dobrodošao! Molimo popuni detalje da započneš.',
      title: 'Kreiraj svoj nalog',
    },
  },
  socialButtonsBlockButton: 'Nastavi sa {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  unstable__errors: {
    form_code_incorrect: 'Uneti kod je netačan.',
    form_identifier_exists: 'Ovaj identifikator je već u upotrebi.',
    form_identifier_not_found: 'Identifikator nije pronađen.',
    form_param_format_invalid: 'Format parametra je nevažeći.',
    form_password_incorrect: 'Lozinka je netačna.',
    form_password_length_too_short: 'Lozinka je prekratka.',
    form_username_invalid_character:
      'Korisničko ime sadrži nevažeće karaktere.',
    form_username_invalid_length: 'Dužina korisničkog imena nije validna.',
    not_allowed_access: 'Pristup nije dozvoljen.',
    form_param_nil: 'Parametar ne može biti prazan.',
    captcha_invalid:
      'Registracija neuspešna zbog neuspelog sigurnosnog proveravanja. Osveži stranicu da pokušaš ponovo ili se obrati podršci za više pomoći.',
    captcha_unavailable:
      'Registracija neuspešna zbog neuspelog proveravanja bota. Osveži stranicu da pokušaš ponovo ili se obrati podršci za više pomoći.',
    form_identifier_exists__email_address:
      'Ova e-mail adresa je zauzeta. Molimo pokušaj sa drugom.',
    form_identifier_exists__phone_number:
      'Ovaj telefonski broj je zauzet. Molimo pokušaj sa drugim.',
    form_identifier_exists__username:
      'Ovo korisničko ime je zauzeto. Molimo pokušaj sa drugim.',
    form_param_format_invalid__email_address:
      'E-mail adresa mora biti važeća e-mail adresa.',
    form_param_format_invalid__phone_number:
      'Telefonski broj mora biti u važećem međunarodnom formatu',
    form_param_max_length_exceeded__first_name:
      'Ime ne sme premašiti 256 karaktera.',
    form_param_max_length_exceeded__last_name:
      'Prezime ne sme premašiti 256 karaktera.',
    form_param_max_length_exceeded__name:
      'Naziv ne sme premašiti 256 karaktera.',
    form_password_not_strong_enough: 'Tvoja lozinka nije dovoljno jaka.',
    form_password_pwned:
      'Ova lozinka je pronađena kao deo kompromitovanih podataka i ne može se koristiti, molimo pokušaj sa drugom lozinkom.',
    form_password_pwned__sign_in:
      'Ova lozinka je pronađena kao deo kompromitovanih podataka i ne može se koristiti, molimo resetuj svoju lozinku.',
    form_password_size_in_bytes_exceeded:
      'Tvoja lozinka je premašila maksimalni dozvoljeni broj bajtova, molimo skrati je ili ukloni neke specijalne znakove.',
    form_password_validation_failed: 'Neispravna lozinka',
    identification_deletion_failed:
      'Ne možeš obrisati svoju poslednju identifikaciju.',
    passkey_already_exists:
      'Ključ za prolaz je već registrovan sa ovim uređajem.',
    passkey_not_supported: 'Ključevi za prolaz nisu podržani na ovom uređaju.',
    passkey_pa_not_supported:
      'Registracija zahteva platformski autentifikator, ali uređaj to ne podržava.',
    passkey_registration_cancelled:
      'Registracija ključa za prolaz je otkazana ili je isteklo vreme.',
    passkey_retrieval_cancelled:
      'Verifikacija ključa za prolaz je otkazana ili je isteklo vreme.',
    passwordComplexity: {
      maximumLength: 'manje od {{length}} karaktera',
      minimumLength: '{{length}} ili više karaktera',
      requireLowercase: 'malo slovo',
      requireNumbers: 'broj',
      requireSpecialCharacter: 'specijalni znak',
      requireUppercase: 'veliko slovo',
      sentencePrefix: 'Tvoja lozinka mora sadržati',
    },
    phone_number_exists:
      'Ovaj telefonski broj je zauzet. Molimo pokušaj sa drugim.',
    zxcvbn: {
      couldBeStronger:
        'Tvoja lozinka funkcioniše, ali može biti jača. Pokušaj dodati više karaktera.',
      goodPassword: 'Tvoja lozinka ispunjava sve potrebne zahteve.',
      notEnough: 'Tvoja lozinka nije dovoljno jaka.',
      suggestions: {
        allUppercase: 'Kapitalizuj neka, ali ne sva slova.',
        anotherWord: 'Dodaj više reči koje su manje uobičajene.',
        associatedYears: 'Izbegavaj godine koje su povezane sa tobom.',
        capitalization: 'Kapitalizuj više od prvog slova.',
        dates: 'Izbegavaj datume i godine koje su povezane sa tobom.',
        l33t: "Izbegavaj predvidljive zamene slova kao što su '@' za 'a'.",
        longerKeyboardPattern:
          'Koristi duže šablone na tastaturi i promeni smer kucanja više puta.',
        noNeed:
          'Možeš kreirati jake lozinke bez korišćenja simbola, brojeva ili velikih slova.',
        pwned:
          'Ako koristiš ovu lozinku negde drugde, trebalo bi da je promeniš.',
        recentYears: 'Izbegavaj skorašnje godine.',
        repeated: 'Izbegavaj ponavljane reči i karaktere.',
        reverseWords: 'Izbegavaj obrnuto napisane uobičajene reči.',
        sequences: 'Izbegavaj uobičajene sekvence karaktera.',
        useWords: 'Koristi više reči, ali izbegavaj uobičajene fraze.',
      },
      warnings: {
        common: 'Ovo je često korišćena lozinka.',
        commonNames: 'Uobičajena imena i prezimena su lako za pogoditi.',
        dates: 'Datumi su lako za pogoditi.',
        extendedRepeat:
          'Ponavljani obrasci karaktera kao što su "abcabcabc" su lako za pogoditi.',
        keyPattern: 'Kratki šabloni na tastaturi su lako za pogoditi.',
        namesByThemselves:
          'Pojedinačna imena ili prezimena su lako za pogoditi.',
        pwned: 'Tvoja lozinka je otkrivena u kršenju podataka na internetu.',
        recentYears: 'Skorašnje godine su lako za pogoditi.',
        sequences:
          'Uobičajene sekvence karaktera kao što su "abc" su lako za pogoditi.',
        similarToCommon: 'Ovo je slično često korišćenoj lozinki.',
        simpleRepeat:
          'Ponavljani karakteri kao što su "aaa" su lako za pogoditi.',
        straightRow:
          'Direktne linije tastera na tvojoj tastaturi su lako za pogoditi.',
        topHundred: 'Ovo je često korišćena lozinka.',
        topTen: 'Ovo je veoma često korišćena lozinka.',
        userInputs:
          'Ne sme biti ličnih podataka ili podataka vezanih za stranicu.',
        wordByItself: 'Pojedinačne reči su lako za pogoditi.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Dodaj nalog',
    action__manageAccount: 'Upravljaj nalogom',
    action__signOut: 'Odjavi se',
    action__signOutAll: 'Odjavi se sa svih naloga',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Kopirano!',
      actionLabel__copy: 'Kopiraj sve',
      actionLabel__download: 'Preuzmi .txt',
      actionLabel__print: 'Štampaj',
      infoText1: 'Rezervni kodovi će biti omogućeni za ovaj nalog.',
      infoText2:
        'Čuvaj rezervne kodove u tajnosti i čuvaj ih na sigurnom mestu. Možeš regenerisati rezervne kodove ako sumnjaš da su kompromitovani.',
      subtitle__codelist: 'Čuvaj ih na sigurnom i drži ih u tajnosti.',
      successMessage:
        'Rezervni kodovi su sada omogućeni. Možeš koristiti jedan od ovih kodova za prijavu na svoj nalog, ako izgubiš pristup svom uređaju za autentifikaciju. Svaki kod može biti korišćen samo jednom.',
      successSubtitle:
        'Možeš koristiti jedan od ovih kodova za prijavu na svoj nalog, ako izgubiš pristup svom uređaju za autentifikaciju.',
      title: 'Dodaj verifikaciju rezervnim kodom',
      title__codelist: 'Rezervni kodovi',
    },
    connectedAccountPage: {
      formHint: 'Izaberi provajdera da povežeš svoj nalog.',
      formHint__noAccounts: 'Nema dostupnih spoljnih provajdera naloga.',
      removeResource: {
        messageLine1: '{{identifier}} će biti uklonjen iz ovog naloga.',
        messageLine2:
          'Više nećeš moći da koristiš ovaj povezani nalog i bilo koje zavisne funkcije više neće raditi.',
        successMessage: '{{connectedAccount}} je uklonjen iz tvog naloga.',
        title: 'Ukloni povezani nalog',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'Provajder je dodat na tvoj nalog',
      title: 'Dodaj povezani nalog',
    },
    deletePage: {
      actionDescription: 'Upiši "Delete account" ispod da nastaviš.',
      confirm: 'Obriši nalog',
      messageLine1: 'Da li si siguran da želiš da obrišeš svoj nalog?',
      messageLine2: 'Ova akcija je trajna i nepovratna.',
      title: 'Obriši nalog',
    },
    emailAddressPage: {
      emailCode: {
        formHint:
          'E-mail sadrži verifikacioni kod koji će biti poslat na ovu e-mail adresu.',
        formSubtitle: 'Unesi verifikacioni kod poslat na {{identifier}}',
        formTitle: 'Verifikacioni kod',
        resendButton: 'Nisi primio kod? Pošalji ponovo',
        successMessage: 'E-mail {{identifier}} je dodat na tvoj nalog.',
      },
      emailLink: {
        formHint:
          'E-mail sadrži verifikacioni link koji će biti poslat na ovu e-mail adresu.',
        formSubtitle:
          'Klikni na verifikacioni link u e-mailu poslatom na {{identifier}}',
        formTitle: 'Verifikacioni link',
        resendButton: 'Nisi primio link? Pošalji ponovo',
        successMessage: 'E-mail {{identifier}} je dodat na tvoj nalog.',
      },
      removeResource: {
        messageLine1: '{{identifier}} će biti uklonjen iz ovog naloga.',
        messageLine2:
          'Više nećeš moći da se prijaviš koristeći ovu e-mail adresu.',
        successMessage: '{{emailAddress}} je uklonjen iz tvog naloga.',
        title: 'Ukloni e-mail adresu',
      },
      title: 'Dodaj e-mail adresu',
      verifyTitle: 'Verifikuj e-mail adresu',
    },
    formButtonPrimary__add: 'Dodaj',
    formButtonPrimary__continue: 'Nastavi',
    formButtonPrimary__finish: 'Završi',
    formButtonPrimary__remove: 'Ukloni',
    formButtonPrimary__save: 'Sačuvaj',
    formButtonReset: 'Otkaži',
    mfaPage: {
      formHint: 'Izaberi metodu za dodavanje.',
      title: 'Dodaj dvostepenu verifikaciju',
    },
    mfaPhoneCodePage: {
      backButton: 'Koristi postojeći broj',
      primaryButton__addPhoneNumber: 'Dodaj telefonski broj',
      removeResource: {
        messageLine1:
          '{{identifier}} više neće primati verifikacione kodove prilikom prijavljivanja.',
        messageLine2:
          'Tvoj nalog možda neće biti toliko siguran. Da li si siguran da želiš da nastaviš?',
        successMessage:
          'SMS kod dvostepene verifikacije je uklonjen za {{mfaPhoneCode}}',
        title: 'Ukloni dvostepenu verifikaciju',
      },
      subtitle__availablePhoneNumbers:
        'Izaberi postojeći telefonski broj za registraciju SMS kod dvostepene verifikacije ili dodaj novi.',
      subtitle__unavailablePhoneNumbers:
        'Nema dostupnih telefonskih brojeva za registraciju SMS kod dvostepene verifikacije, molimo dodaj novi.',
      successMessage1:
        'Kada se prijaviš, moraćeš uneti verifikacioni kod poslat na ovaj telefonski broj kao dodatni korak.',
      successMessage2:
        'Sačuvaj ove rezervne kodove i čuvaj ih na sigurnom mestu. Ako izgubiš pristup svom uređaju za autentifikaciju, možeš koristiti rezervne kodove za prijavu.',
      successTitle: 'SMS kod verifikacija je omogućena',
      title: 'Dodaj SMS kod verifikaciju',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Umesto toga, skeniraj QR kod',
        buttonUnableToScan__nonPrimary: 'Ne možeš skenirati QR kod?',
        infoText__ableToScan:
          'Podesi novi način prijave u svojoj aplikaciji za autentifikaciju i skeniraj sledeći QR kod da ga povežeš sa svojim nalogom.',
        infoText__unableToScan:
          'Podesi novi način prijave u svojoj autentifikaciji i unesi ključ naveden ispod.',
        inputLabel__unableToScan1:
          'Uveri se da su vremenski bazirane ili jednokratne lozinke omogućene, zatim završi povezivanje svog naloga.',
        inputLabel__unableToScan2:
          'Alternativno, ako tvoja autentifikacija podržava TOTP URI, možeš takođe kopirati celu URI adresu.',
      },
      removeResource: {
        messageLine1:
          'Verifikacioni kodovi iz ove autentifikacije više neće biti potrebni prilikom prijavljivanja.',
        messageLine2:
          'Tvoj nalog možda neće biti toliko siguran. Da li si siguran da želiš da nastaviš?',
        successMessage:
          'Dvostepena verifikacija preko autentifikacione aplikacije je uklonjena.',
        title: 'Ukloni dvostepenu verifikaciju',
      },
      successMessage:
        'Dvostepena verifikacija je sada omogućena. Kada se prijaviš, moraćeš uneti verifikacioni kod iz ove autentifikacije kao dodatni korak.',
      title: 'Dodaj autentifikacionu aplikaciju',
      verifySubtitle:
        'Unesi verifikacioni kod generisan tvojom autentifikacijom',
      verifyTitle: 'Verifikacioni kod',
    },
    mobileButton__menu: 'Meni',
    navbar: {
      account: 'Profil',
      description: 'Upravljaj informacijama svog naloga.',
      security: 'Sigurnost',
      title: 'Nalog',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} će biti uklonjen iz ovog naloga.',
        title: 'Ukloni ključ za prolaz',
      },
      subtitle__rename:
        'Možeš promeniti ime ključa za prolaz kako bi ga lakše pronašao.',
      title__rename: 'Preimenuj ključ za prolaz',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Preporučuje se da se odjaviš sa svih drugih uređaja koji su možda koristili tvoju staru lozinku.',
      readonly:
        'Tvoja lozinka trenutno ne može biti uređivana jer se možeš prijaviti samo preko korporativne veze.',
      successMessage__set: 'Tvoja lozinka je postavljena.',
      successMessage__signOutOfOtherSessions:
        'Svi drugi uređaji su odjavljeni.',
      successMessage__update: 'Tvoja lozinka je ažurirana.',
      title__set: 'Postavi lozinku',
      title__update: 'Ažuriraj lozinku',
    },
    phoneNumberPage: {
      infoText:
        'Tekstualna poruka sa verifikacionim kodom će biti poslata na ovaj telefonski broj. Moguće su naknade za poruke i podatke.',
      removeResource: {
        messageLine1: '{{identifier}} će biti uklonjen iz ovog naloga.',
        messageLine2:
          'Više nećeš moći da se prijaviš koristeći ovaj telefonski broj.',
        successMessage: '{{phoneNumber}} je uklonjen iz tvog naloga.',
        title: 'Ukloni telefonski broj',
      },
      successMessage: '{{identifier}} je dodat na tvoj nalog.',
      title: 'Dodaj telefonski broj',
      verifySubtitle: 'Unesi verifikacioni kod poslat na {{identifier}}',
      verifyTitle: 'Verifikuj telefonski broj',
    },
    profilePage: {
      fileDropAreaHint: 'Preporučena veličina 1:1, do 10MB.',
      imageFormDestructiveActionSubtitle: 'Ukloni',
      imageFormSubtitle: 'Otpremi',
      imageFormTitle: 'Profilna slika',
      readonly:
        'Tvoje profilne informacije su obezbeđene preko korporativne veze i ne mogu biti uređivane.',
      successMessage: 'Tvoj profil je ažuriran.',
      title: 'Ažuriraj profil',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Odjavi uređaj',
        title: 'Aktivni uređaji',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Pokušaj ponovo',
        actionLabel__reauthorize: 'Autorizuj sada',
        destructiveActionTitle: 'Ukloni',
        primaryButton: 'Poveži nalog',
        subtitle__reauthorize:
          'Potrebna ovlašćenja su ažurirana, i možda doživljavaš ograničenu funkcionalnost. Molimo re-autorizuj ovu aplikaciju da izbegneš bilo kakve probleme',
        title: 'Povezani nalozi',
      },
      dangerSection: {
        deleteAccountButton: 'Obriši nalog',
        title: 'Obriši nalog',
      },
      emailAddressesSection: {
        destructiveAction: 'Ukloni e-mail',
        detailsAction__nonPrimary: 'Postavi kao primarni',
        detailsAction__primary: 'Završi verifikaciju',
        detailsAction__unverified: 'Verifikuj',
        primaryButton: 'Dodaj e-mail adresu',
        title: 'E-mail adrese',
      },
      enterpriseAccountsSection: {
        title: 'Korporativni nalozi',
      },
      headerTitle__account: 'Detalji profila',
      headerTitle__security: 'Sigurnost',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Regeneriši',
          headerTitle: 'Rezervni kodovi',
          subtitle__regenerate:
            'Dobij novi set sigurnih rezervnih kodova. Prethodni rezervni kodovi će biti obrisani i neće moći biti korišćeni.',
          title__regenerate: 'Regeneriši rezervne kodove',
        },
        phoneCode: {
          actionLabel__setDefault: 'Postavi kao podrazumevani',
          destructiveActionLabel: 'Ukloni',
        },
        primaryButton: 'Dodaj dvostepenu verifikaciju',
        title: 'Dvostepena verifikacija',
        totp: {
          destructiveActionTitle: 'Ukloni',
          headerTitle: 'Autentifikaciona aplikacija',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Ukloni',
        menuAction__rename: 'Preimenuj',
        title: 'Ključevi za prolaz',
      },
      passwordSection: {
        primaryButton__setPassword: 'Postavi lozinku',
        primaryButton__updatePassword: 'Ažuriraj lozinku',
        title: 'Lozinka',
      },
      phoneNumbersSection: {
        destructiveAction: 'Ukloni telefonski broj',
        detailsAction__nonPrimary: 'Postavi kao podrazumevani',
        detailsAction__primary: 'Završi verifikaciju',
        detailsAction__unverified: 'Verifikuj telefonski broj',
        primaryButton: 'Dodaj telefonski broj',
        title: 'Telefonski brojevi',
      },
      profileSection: {
        primaryButton: 'Ažuriraj profil',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Postavi korisničko ime',
        primaryButton__updateUsername: 'Ažuriraj korisničko ime',
        title: 'Korisničko ime',
      },
      web3WalletsSection: {
        destructiveAction: 'Ukloni novčanik',
        primaryButton: 'Web3 novčanici',
        title: 'Web3 novčanici',
      },
    },
    usernamePage: {
      successMessage: 'Tvoje korisničko ime je ažurirano.',
      title__set: 'Postavi korisničko ime',
      title__update: 'Ažuriraj korisničko ime',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} će biti uklonjen iz ovog naloga.',
        messageLine2:
          'Više nećeš moći da se prijaviš koristeći ovaj web3 novčanik.',
        successMessage: '{{web3Wallet}} je uklonjen iz tvog naloga.',
        title: 'Ukloni web3 novčanik',
      },
      subtitle__availableWallets:
        'Izaberi web3 novčanik da ga povežeš sa svojim nalogom.',
      subtitle__unavailableWallets: 'Nema dostupnih web3 novčanika.',
      successMessage: 'Novčanik je dodat na tvoj nalog.',
      title: 'Dodaj web3 novčanik',
    },
  },
} as const;
