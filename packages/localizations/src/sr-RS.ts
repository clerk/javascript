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

const commonTexts = {
  signIn: {
    phoneCode: {
      title: 'Proverite svoj telefon',
      subtitle: 'da biste nastavili do {{applicationName}}',
      formTitle: 'Verifikacioni kod',
      formSubtitle: 'Unesite verifikacioni kod poslat na vaš broj telefona',
      resendButton: 'Niste dobili kod? Pošaljite ponovo',
    },
  },
};

export const srRS: LocalizationResource = {
  locale: 'sr-RS',
  socialButtonsBlockButton: 'Nastavi sa {{provider|titleize}}',
  dividerText: 'ili',
  formFieldLabel__emailAddress: 'Email adresa',
  formFieldLabel__emailAddresses: 'Email adrese',
  formFieldLabel__phoneNumber: 'Broj telefona',
  formFieldLabel__username: 'Korisničko ime',
  formFieldLabel__emailAddress_phoneNumber: 'Email adresa ili broj telefona',
  formFieldLabel__emailAddress_username: 'Email adresa ili korisničko ime',
  formFieldLabel__phoneNumber_username: 'Broj telefona ili korisničko ime',
  formFieldLabel__emailAddress_phoneNumber_username:
    'Email adresa, broj telefona ili korisničko ime',
  formFieldLabel__password: 'Lozinka',
  formFieldLabel__currentPassword: 'Trenutna lozinka',
  formFieldLabel__newPassword: 'Nova lozinka',
  formFieldLabel__confirmPassword: 'Potvrdi lozinku',
  formFieldLabel__signOutOfOtherSessions: 'Odjavi se sa svih drugih uređaja',
  formFieldLabel__automaticInvitations:
    'Omogući automatske pozivnice za ovaj domen',
  formFieldLabel__firstName: 'Ime',
  formFieldLabel__lastName: 'Prezime',
  formFieldLabel__backupCode: 'Kod za rezervnu autentifikaciju',
  formFieldLabel__organizationName: 'Naziv organizacije',
  formFieldLabel__organizationSlug: 'Slug URL',
  formFieldLabel__organizationDomain: 'Domen',
  formFieldLabel__organizationDomainEmailAddress:
    'Email adresa za verifikaciju',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Unesite email adresu pod ovim domenom da primite kod i verifikujete domen.',
  formFieldLabel__organizationDomainDeletePending:
    'Obriši čekajuće pozivnice i predloge',
  formFieldLabel__confirmDeletion: 'Potvrda',
  formFieldLabel__role: 'Uloga',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddresses:
    'Unesite ili nalepite jednu ili više email adresa, odvojenih razmacima ili zarezima',
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
  formFieldInputPlaceholder__organizationDomain: '',
  formFieldInputPlaceholder__organizationDomainEmailAddress: '',
  formFieldError__notMatchingPasswords: 'Lozinke se ne podudaraju.',
  formFieldError__matchingPasswords: 'Lozinke se podudaraju.',
  formFieldError__verificationLinkExpired:
    'Link za verifikaciju je istekao. Molimo zatražite novi link.',
  formFieldAction__forgotPassword: 'Zaboravili ste lozinku?',
  formFieldHintText__optional: 'Opciono',
  formFieldHintText__slug:
    'Slug je lako čitljiv ID koji mora biti jedinstven. Često se koristi u URL-ovima.',
  formButtonPrimary: 'Nastavi',
  signInEnterPasswordTitle: 'Unesite svoju lozinku',
  backButton: 'Nazad',
  footerActionLink__useAnotherMethod: 'Koristite drugi metod',
  badge__primary: 'Primarno',
  badge__thisDevice: 'Ovaj uređaj',
  badge__userDevice: 'Korisnički uređaj',
  badge__otherImpersonatorDevice: 'Uređaj drugog korisnika',
  badge__default: 'Podrazumevano',
  badge__unverified: 'Nepotvrđeno',
  badge__requiresAction: 'Zahteva akciju',
  badge__you: 'Vi',
  footerPageLink__help: 'Pomoć',
  footerPageLink__privacy: 'Privatnost',
  footerPageLink__terms: 'Uslovi',
  paginationButton__previous: 'Prethodno',
  paginationButton__next: 'Sledeće',
  paginationRowText__displaying: 'Prikazivanje',
  paginationRowText__of: 'od',
  membershipRole__admin: 'Admin',
  membershipRole__basicMember: 'Član',
  membershipRole__guestMember: 'Gost',
  signUp: {
    start: {
      title: 'Kreirajte svoj nalog',
      subtitle: 'da biste nastavili do {{applicationName}}',
      actionText: 'Imate nalog?',
      actionLink: 'Prijavite se',
    },
    emailLink: {
      title: 'Verifikujte svoj email',
      subtitle: 'da biste nastavili do {{applicationName}}',
      formTitle: 'Link za verifikaciju',
      formSubtitle:
        'Koristite link za verifikaciju poslat na vašu email adresu',
      resendButton: 'Niste dobili link? Pošaljite ponovo',
      verified: {
        title: 'Uspešno ste se registrovali',
      },
      loading: {
        title: 'Registracija u toku...',
      },
      verifiedSwitchTab: {
        title: 'Uspešno verifikovan email',
        subtitle: 'Vratite se na novootvorenu karticu da nastavite',
        subtitleNewTab: 'Vratite se na prethodnu karticu da nastavite',
      },
    },
    emailCode: {
      title: 'Verifikujte svoj email',
      subtitle: 'da biste nastavili do {{applicationName}}',
      formTitle: 'Verifikacioni kod',
      formSubtitle: 'Unesite verifikacioni kod poslat na vašu email adresu',
      resendButton: 'Niste dobili kod? Pošaljite ponovo',
    },
    phoneCode: {
      title: 'Verifikujte svoj telefon',
      subtitle: 'da biste nastavili do {{applicationName}}',
      formTitle: 'Verifikacioni kod',
      formSubtitle: 'Unesite verifikacioni kod poslat na vaš broj telefona',
      resendButton: 'Niste dobili kod? Pošaljite ponovo',
    },
    continue: {
      title: 'Popunite nedostajuća polja',
      subtitle: 'da biste nastavili do {{applicationName}}',
      actionText: 'Imate nalog?',
      actionLink: 'Prijavite se',
    },
  },
  signIn: {
    start: {
      title: 'Prijavite se',
      subtitle: 'da biste nastavili do {{applicationName}}',
      actionText: 'Nemate nalog?',
      actionLink: 'Registrujte se',
      actionLink__use_email: 'Koristite email',
      actionLink__use_phone: 'Koristite telefon',
      actionLink__use_username: 'Koristite korisničko ime',
      actionLink__use_email_username: 'Koristite email ili korisničko ime',
    },
    password: {
      title: 'Unesite svoju lozinku',
      subtitle: 'da biste nastavili do {{applicationName}}',
      actionLink: 'Koristite drugi metod',
    },
    forgotPasswordAlternativeMethods: {
      title: 'Zaboravili ste lozinku?',
      label__alternativeMethods: 'Ili, prijavite se drugim metodom.',
      blockButton__resetPassword: 'Resetujte svoju lozinku',
    },
    forgotPassword: {
      title_email: 'Proverite svoj email',
      title_phone: 'Proverite svoj telefon',
      subtitle: 'da resetujete svoju lozinku',
      formTitle: 'Kod za resetovanje lozinke',
      formSubtitle_email: 'Unesite kod poslat na vašu email adresu',
      formSubtitle_phone: 'Unesite kod poslat na vaš broj telefona',
      resendButton: 'Niste dobili kod? Pošaljite ponovo',
    },
    resetPassword: {
      title: 'Resetujte lozinku',
      formButtonPrimary: 'Resetujte lozinku',
      successMessage:
        'Vaša lozinka je uspešno promenjena. Molimo sačekajte, bićete prijavljeni.',
      requiredMessage:
        'Iz bezbednosnih razloga, neophodno je resetovati vašu lozinku.',
    },
    resetPasswordMfa: {
      detailsLabel:
        'Potrebno je da verifikujemo vaš identitet pre resetovanja lozinke.',
    },
    emailCode: {
      title: 'Proverite svoj email',
      subtitle: 'da biste nastavili do {{applicationName}}',
      formTitle: 'Verifikacioni kod',
      formSubtitle: 'Unesite verifikacioni kod poslat na vašu email adresu',
      resendButton: 'Niste dobili kod? Pošaljite ponovo',
    },
    emailLink: {
      title: 'Proverite svoj email',
      subtitle: 'da biste nastavili do {{applicationName}}',
      formTitle: 'Link za verifikaciju',
      formSubtitle: 'Koristite link za verifikaciju poslat na vaš email',
      resendButton: 'Niste dobili link? Pošaljite ponovo',
      unusedTab: {
        title: 'Možete zatvoriti ovu karticu',
      },
      verified: {
        title: 'Uspešno ste se prijavili',
        subtitle: 'Uskoro ćete biti preusmereni',
      },
      verifiedSwitchTab: {
        subtitle: 'Vratite se na originalnu karticu da nastavite',
        titleNewTab: 'Prijavljeni ste na drugoj kartici',
        subtitleNewTab: 'Vratite se na novootvorenu karticu da nastavite',
      },
      loading: {
        title: 'Prijavljivanje u toku...',
        subtitle: 'Uskoro ćete biti preusmereni',
      },
      failed: {
        title: 'Ovaj link za verifikaciju nije važeći',
        subtitle: 'Vratite se na originalnu karticu da nastavite.',
      },
      expired: {
        title: 'Ovaj link za verifikaciju je istekao',
        subtitle: 'Vratite se na originalnu karticu da nastavite.',
      },
    },
    phoneCode: { ...commonTexts.signIn.phoneCode },
    phoneCodeMfa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totpMfa: {
      title: 'Dvostepena verifikacija',
      subtitle: '',
      formTitle: 'Verifikacioni kod',
      formSubtitle:
        'Unesite verifikacioni kod generisan vašom aplikacijom za autentifikaciju',
    },
    backupCodeMfa: {
      title: 'Unesite kod za rezervnu autentifikaciju',
      subtitle: 'da biste nastavili do {{applicationName}}',
      formTitle: '',
      formSubtitle: '',
    },
    alternativeMethods: {
      title: 'Koristite drugi metod',
      actionLink: 'Potražite pomoć',
      blockButton__emailLink: 'Pošaljite email link na {{identifier}}',
      blockButton__emailCode: 'Pošaljite email kod na {{identifier}}',
      blockButton__phoneCode: 'Pošaljite SMS kod na {{identifier}}',
      blockButton__password: 'Prijavite se svojom lozinkom',
      blockButton__totp: 'Koristite svoju aplikaciju za autentifikaciju',
      blockButton__backupCode: 'Koristite kod za rezervnu autentifikaciju',
      getHelp: {
        title: 'Potražite pomoć',
        content: `Ako imate problema sa prijavljivanjem na svoj nalog, pošaljite nam email i pomoći ćemo vam da povratite pristup što pre.`,
        blockButton__emailSupport: 'Email podrška',
      },
    },
    noAvailableMethods: {
      title: 'Nije moguće prijaviti se',
      subtitle: 'Došlo je do greške',
      message:
        'Nije moguće nastaviti sa prijavom. Nema dostupnih faktora autentifikacije.',
    },
  },
  userProfile: {
    mobileButton__menu: 'Meni',
    formButtonPrimary__continue: 'Nastavi',
    formButtonPrimary__finish: 'Završi',
    formButtonReset: 'Otkaži',
    start: {
      headerTitle__account: 'Nalog',
      headerTitle__security: 'Sigurnost',
      headerSubtitle__account: 'Upravljajte informacijama svog naloga',
      headerSubtitle__security: 'Upravljajte svojim sigurnosnim preferencijama',
      profileSection: {
        title: 'Profil',
      },
      usernameSection: {
        title: 'Korisničko ime',
        primaryButton__changeUsername: 'Promenite korisničko ime',
        primaryButton__setUsername: 'Postavite korisničko ime',
      },
      emailAddressesSection: {
        title: 'Email adrese',
        primaryButton: 'Dodajte email adresu',
        detailsTitle__primary: 'Primarna email adresa',
        detailsSubtitle__primary: 'Ova email adresa je primarna email adresa',
        detailsAction__primary: 'Završite verifikaciju',
        detailsTitle__nonPrimary: 'Postavite kao primarnu email adresu',
        detailsSubtitle__nonPrimary:
          'Postavite ovu email adresu kao primarnu da biste primili komunikacije vezane za vaš nalog.',
        detailsAction__nonPrimary: 'Postavite kao primarnu',
        detailsTitle__unverified: 'Verifikujte email adresu',
        detailsSubtitle__unverified:
          'Završite verifikaciju da biste imali pristup svim funkcijama sa ovom email adresom',
        detailsAction__unverified: 'Verifikujte email adresu',
        destructiveActionTitle: 'Uklonite',
        destructiveActionSubtitle:
          'Obrišite ovu email adresu i uklonite je iz svog naloga',
        destructiveAction: 'Uklonite email adresu',
      },
      phoneNumbersSection: {
        title: 'Brojevi telefona',
        primaryButton: 'Dodajte broj telefona',
        detailsTitle__primary: 'Primarni broj telefona',
        detailsSubtitle__primary:
          'Ovaj broj telefona je primarni broj telefona',
        detailsAction__primary: 'Završite verifikaciju',
        detailsTitle__nonPrimary: 'Postavite kao primarni broj telefona',
        detailsSubtitle__nonPrimary:
          'Postavite ovaj broj telefona kao primarni da biste primili komunikacije vezane za vaš nalog.',
        detailsAction__nonPrimary: 'Postavite kao primarni',
        detailsTitle__unverified: 'Verifikujte broj telefona',
        detailsSubtitle__unverified:
          'Završite verifikaciju da biste imali pristup svim funkcijama sa ovim brojem telefona',
        detailsAction__unverified: 'Verifikujte broj telefona',
        destructiveActionTitle: 'Uklonite',
        destructiveActionSubtitle:
          'Obrišite ovaj broj telefona i uklonite ga iz svog naloga',
        destructiveAction: 'Uklonite broj telefona',
      },
      connectedAccountsSection: {
        title: 'Povezani nalozi',
        primaryButton: 'Povežite nalog',
        title__conectionFailed: 'Ponovo pokušajte neuspešnu konekciju',
        title__connectionFailed: 'Ponovo pokušajte neuspešnu konekciju',
        title__reauthorize: 'Potrebna je ponovna autorizacija',
        subtitle__reauthorize:
          'Potrebna su ažurirana ovlašćenja, i možda ćete imati ograničene funkcionalnosti. Molimo vas da ponovo autorizujete ovu aplikaciju da biste izbegli bilo kakve probleme',
        actionLabel__conectionFailed: 'Pokušajte ponovo',
        actionLabel__connectionFailed: 'Pokušajte ponovo',
        actionLabel__reauthorize: 'Autorizujte odmah',
        destructiveActionTitle: 'Uklonite',
        destructiveActionSubtitle:
          'Uklonite ovaj povezani nalog iz svog naloga',
        destructiveActionAccordionSubtitle: 'Uklonite povezani nalog',
      },
      enterpriseAccountsSection: {
        title: 'Preduzetnički nalozi',
      },
      passwordSection: {
        title: 'Lozinka',
        primaryButton__changePassword: 'Promenite lozinku',
        primaryButton__setPassword: 'Postavite lozinku',
      },
      mfaSection: {
        title: 'Dvostepena verifikacija',
        primaryButton: 'Dodajte dvostepenu verifikaciju',
        phoneCode: {
          destructiveActionTitle: 'Uklonite',
          destructiveActionSubtitle:
            'Uklonite ovaj broj telefona iz metoda dvostepene verifikacije',
          destructiveActionLabel: 'Uklonite broj telefona',
          title__default: 'Podrazumevani faktor',
          title__setDefault: 'Postavite kao podrazumevani faktor',
          subtitle__default:
            'Ovaj faktor će se koristiti kao podrazumevani metod dvostepene verifikacije prilikom prijavljivanja.',
          subtitle__setDefault:
            'Postavite ovaj faktor kao podrazumevani faktor da biste ga koristili kao podrazumevani metod dvostepene verifikacije prilikom prijavljivanja.',
          actionLabel__setDefault: 'Postavite kao podrazumevani',
        },
        backupCodes: {
          headerTitle: 'Rezervni kodovi',
          title__regenerate: 'Regenerišite rezervne kodove',
          subtitle__regenerate:
            'Dobijte novi set sigurnih rezervnih kodova. Prethodni rezervni kodovi će biti obrisani i neće moći da se koriste.',
          actionLabel__regenerate: 'Regenerišite kodove',
        },
        totp: {
          headerTitle: 'Aplikacija za autentifikaciju',
          title: 'Podrazumevani faktor',
          subtitle:
            'Ovaj faktor će se koristiti kao podrazumevani metod dvostepene verifikacije prilikom prijavljivanja.',
          destructiveActionTitle: 'Uklonite',
          destructiveActionSubtitle:
            'Uklonite aplikaciju za autentifikaciju iz metoda dvostepene verifikacije',
          destructiveActionLabel: 'Uklonite aplikaciju za autentifikaciju',
        },
      },
      activeDevicesSection: {
        title: 'Aktivni uređaji',
        primaryButton: 'Aktivni uređaji',
        detailsTitle: 'Trenutni uređaj',
        detailsSubtitle: 'Ovo je uređaj koji trenutno koristite',
        destructiveActionTitle: 'Odjavite se',
        destructiveActionSubtitle: 'Odjavite se sa svog naloga na ovom uređaju',
        destructiveAction: 'Odjavite se sa uređaja',
      },
      web3WalletsSection: {
        title: 'Web3 novčanici',
        primaryButton: 'Web3 novčanici',
        destructiveActionTitle: 'Uklonite',
        destructiveActionSubtitle: 'Uklonite ovaj web3 novčanik iz svog naloga',
        destructiveAction: 'Uklonite novčanik',
      },
      dangerSection: {
        title: 'Opasnost',
        deleteAccountButton: 'Obrišite nalog',
        deleteAccountTitle: 'Obrišite nalog',
        deleteAccountDescription:
          'Obrišite svoj nalog i sve podatke povezane sa njim',
      },
    },
    profilePage: {
      title: 'Ažurirajte profil',
      imageFormTitle: 'Profilna slika',
      imageFormSubtitle: 'Otpremite sliku',
      imageFormDestructiveActionSubtitle: 'Uklonite sliku',
      fileDropAreaTitle: 'Prevucite fajl ovde, ili...',
      fileDropAreaAction: 'Odaberite fajl',
      fileDropAreaHint:
        'Otpremite sliku u JPG, PNG, GIF, ili WEBP formatu manju od 10 MB',
      readonly:
        'Vaše informacije o profilu su dostavljene preko preduzetničke konekcije i ne mogu biti izmenjene.',
      successMessage: 'Vaš profil je ažuriran.',
    },
    usernamePage: {
      title: 'Ažurirajte korisničko ime',
      successMessage: 'Vaše korisničko ime je ažurirano.',
    },
    emailAddressPage: {
      title: 'Dodajte email adresu',
      emailCode: {
        formHint:
          'Email koji sadrži verifikacioni kod će biti poslat na ovu email adresu.',
        formTitle: 'Verifikacioni kod',
        formSubtitle: 'Unesite verifikacioni kod poslat na {{identifier}}',
        resendButton: 'Niste dobili kod? Pošaljite ponovo',
        successMessage: 'Email {{identifier}} je dodat na vaš nalog.',
      },
      emailLink: {
        formHint:
          'Email koji sadrži verifikacioni link će biti poslat na ovu email adresu.',
        formTitle: 'Verifikacioni link',
        formSubtitle:
          'Kliknite na verifikacioni link u emailu poslatom na {{identifier}}',
        resendButton: 'Niste dobili link? Pošaljite ponovo',
        successMessage: 'Email {{identifier}} je dodat na vaš nalog.',
      },
      removeResource: {
        title: 'Uklonite email adresu',
        messageLine1: '{{identifier}} će biti uklonjen iz ovog naloga.',
        messageLine2:
          'Više nećete moći da se prijavite koristeći ovu email adresu.',
        successMessage: '{{emailAddress}} je uklonjen iz vašeg naloga.',
      },
    },
    phoneNumberPage: {
      title: 'Dodajte broj telefona',
      successMessage: '{{identifier}} je dodat na vaš nalog.',
      infoText:
        'SMS poruka koja sadrži verifikacioni link će biti poslata na ovaj broj telefona.',
      infoText__secondary: 'Mogu se primeniti tarife za poruke i podatke.',
      removeResource: {
        title: 'Uklonite broj telefona',
        messageLine1: '{{identifier}} će biti uklonjen iz ovog naloga.',
        messageLine2:
          'Više nećete moći da se prijavite koristeći ovaj broj telefona.',
        successMessage: '{{phoneNumber}} je uklonjen iz vašeg naloga.',
      },
    },
    connectedAccountPage: {
      title: 'Dodajte povezani nalog',
      formHint: 'Odaberite pružaoca usluga da povežete svoj nalog.',
      formHint__noAccounts: 'Nema dostupnih spoljnih pružalaca naloga.',
      socialButtonsBlockButton: 'Povežite {{provider|titleize}} nalog',
      successMessage: 'Pružalac usluga je dodat na vaš nalog',
      removeResource: {
        title: 'Uklonite povezani nalog',
        messageLine1: '{{identifier}} će biti uklonjen iz ovog naloga.',
        messageLine2:
          'Više nećete moći da koristite ovaj povezani nalog i sve zavisne funkcije više neće raditi.',
        successMessage: '{{connectedAccount}} je uklonjen iz vašeg naloga.',
      },
    },
    web3WalletPage: {
      title: 'Dodajte web3 novčanik',
      subtitle__availableWallets:
        'Odaberite web3 novčanik koji će biti povezan sa vašim nalogom.',
      subtitle__unavailableWallets: 'Nema dostupnih web3 novčanika.',
      successMessage: 'Novčanik je dodat na vaš nalog.',
      removeResource: {
        title: 'Uklonite web3 novčanik',
        messageLine1: '{{identifier}} će biti uklonjen iz ovog naloga.',
        messageLine2:
          'Više nećete moći da se prijavite koristeći ovaj web3 novčanik.',
        successMessage: '{{web3Wallet}} je uklonjen iz vašeg naloga.',
      },
    },
    passwordPage: {
      title: 'Postavite lozinku',
      changePasswordTitle: 'Promenite lozinku',
      readonly:
        'Vaša lozinka trenutno ne može biti izmenjena jer se možete prijaviti samo preko preduzetničke konekcije.',
      successMessage: 'Vaša lozinka je postavljena.',
      changePasswordSuccessMessage: 'Vaša lozinka je ažurirana.',
      sessionsSignedOutSuccessMessage: 'Svi drugi uređaji su odjavljeni.',
    },
    mfaPage: {
      title: 'Dodajte dvostepenu verifikaciju',
      formHint: 'Odaberite metodu za dodavanje.',
    },
    mfaTOTPPage: {
      title: 'Dodajte aplikaciju za autentifikaciju',

      verifyTitle: 'Verifikacioni kod',
      verifySubtitle:
        'Unesite verifikacioni kod generisan vašom aplikacijom za autentifikaciju',
      successMessage:
        'Dvostepena verifikacija je sada omogućena. Prilikom prijavljivanja, moraćete uneti verifikacioni kod iz ove aplikacije kao dodatni korak.',
      authenticatorApp: {
        infoText__ableToScan:
          'Podesite novi metod prijave u svojoj aplikaciji za autentifikaciju i skenirajte sledeći QR kod da ga povežete sa svojim nalogom.',
        infoText__unableToScan:
          'Podesite novi metod prijave u svojoj aplikaciji za autentifikaciju i unesite ključ naveden ispod.',
        inputLabel__unableToScan1:
          'Uverite se da je omogućena opcija za vremenski ograničene ili jednokratne lozinke, a zatim završite povezivanje svog naloga.',
        inputLabel__unableToScan2:
          'Alternativno, ako vaša aplikacija za autentifikaciju podržava TOTP URIje, takođe možete kopirati ceo URI.',
        buttonAbleToScan__nonPrimary: 'Skenirajte QR kod umesto toga',
        buttonUnableToScan__nonPrimary: 'Ne možete skenirati QR kod?',
      },
      removeResource: {
        title: 'Uklonite dvostepenu verifikaciju',
        messageLine1:
          'Verifikacioni kodovi iz ove aplikacije više neće biti potrebni prilikom prijavljivanja.',
        messageLine2:
          'Vaš nalog možda neće biti siguran. Da li ste sigurni da želite da nastavite?',
        successMessage:
          'Dvostepena verifikacija putem aplikacije za autentifikaciju je uklonjena.',
      },
    },
    mfaPhoneCodePage: {
      title: 'Dodajte SMS kod verifikaciju',
      primaryButton__addPhoneNumber: 'Dodajte broj telefona',
      subtitle__availablePhoneNumbers:
        'Odaberite broj telefona koji će biti registrovan za SMS kod dvostepene verifikacije.',
      subtitle__unavailablePhoneNumbers:
        'Nema dostupnih brojeva telefona za registraciju SMS kod dvostepene verifikacije.',
      successMessage:
        'SMS kod dvostepene verifikacije je sada omogućen za ovaj broj telefona. Prilikom prijavljivanja, moraćete uneti verifikacioni kod poslat na ovaj broj telefona kao dodatni korak.',
      removeResource: {
        title: 'Uklonite dvostepenu verifikaciju',
        messageLine1:
          '{{identifier}} više neće primati verifikacione kodove prilikom prijavljivanja.',
        messageLine2:
          'Vaš nalog možda neće biti siguran. Da li ste sigurni da želite da nastavite?',
        successMessage:
          'SMS kod dvostepene verifikacije je uklonjen za {{mfaPhoneCode}}',
      },
    },
    backupCodePage: {
      title: 'Dodajte verifikaciju rezervnim kodom',
      title__codelist: 'Rezervni kodovi',
      subtitle__codelist: 'Čuvajte ih sigurno i tajno.',
      infoText1: 'Rezervni kodovi će biti omogućeni za ovaj nalog.',
      infoText2:
        'Čuvajte rezervne kodove tajno i čuvajte ih sigurno. Možete regenerisati rezervne kodove ako sumnjate da su kompromitovani.',
      successSubtitle:
        'Možete koristiti jedan od ovih kodova za prijavu na svoj nalog, ako izgubite pristup svom uređaju za autentifikaciju.',
      successMessage:
        'Rezervni kodovi su sada omogućeni. Možete koristiti jedan od ovih kodova za prijavu na svoj nalog, ako izgubite pristup svom uređaju za autentifikaciju. Svaki kod može biti korišćen samo jednom.',
      actionLabel__copy: 'Kopiraj sve',
      actionLabel__copied: 'Kopirano!',
      actionLabel__download: 'Preuzmite .txt',
      actionLabel__print: 'Odštampajte',
    },
    deletePage: {
      title: 'Obrišite nalog',
      messageLine1: 'Da li ste sigurni da želite da obrišete svoj nalog?',
      messageLine2: 'Ova akcija je trajna i nepovratna.',
      actionDescription: 'Upišite "Delete account" ispod da biste nastavili.',
      confirm: 'Obrišite nalog',
    },
  },
  userButton: {
    action__manageAccount: 'Upravljajte nalogom',
    action__signOut: 'Odjavite se',
    action__signOutAll: 'Odjavite se sa svih naloga',
    action__addAccount: 'Dodajte nalog',
  },
  organizationSwitcher: {
    personalWorkspace: 'Lični nalog',
    notSelected: 'Organizacija nije izabrana',
    action__createOrganization: 'Kreirajte organizaciju',
    action__manageOrganization: 'Upravljajte organizacijom',
    action__invitationAccept: 'Pridružite se',
    action__suggestionsAccept: 'Zatražite pridruživanje',
    suggestionsAcceptedLabel: 'Čeka se odobrenje',
  },
  impersonationFab: {
    title: 'Prijavljeni ste kao {{identifier}}',
    action__signOut: 'Odjavite se',
  },
  organizationProfile: {
    badge__unverified: 'Nepotvrđeno',
    badge__automaticInvitation: 'Automatske pozivnice',
    badge__automaticSuggestion: 'Automatski predlozi',
    badge__manualInvitation: 'Bez automatskog upisa',
    start: {
      headerTitle__members: 'Članovi',
      headerTitle__settings: 'Podešavanja',
      headerSubtitle__members:
        'Pregledajte i upravljajte članovima organizacije',
      headerSubtitle__settings: 'Upravljajte podešavanjima organizacije',
    },
    profilePage: {
      title: 'Profil organizacije',
      subtitle: 'Upravljajte profilom organizacije',
      successMessage: 'Organizacija je ažurirana.',
      dangerSection: {
        title: 'Opasnost',
        leaveOrganization: {
          title: 'Napustite organizaciju',
          messageLine1:
            'Da li ste sigurni da želite da napustite ovu organizaciju? Izgubićete pristup ovoj organizaciji i njenim aplikacijama.',
          messageLine2: 'Ova akcija je trajna i nepovratna.',
          successMessage: 'Napustili ste organizaciju.',
          actionDescription:
            'Upišite {{organizationName}} ispod da biste nastavili.',
        },
        deleteOrganization: {
          title: 'Obrišite organizaciju',
          messageLine1:
            'Da li ste sigurni da želite da obrišete ovu organizaciju?',
          messageLine2: 'Ova akcija je trajna i nepovratna.',
          actionDescription:
            'Upišite {{organizationName}} ispod da biste nastavili.',
          successMessage: 'Obbrisali ste organizaciju.',
        },
      },
      domainSection: {
        title: 'Potvrđeni domeni',
        subtitle:
          'Dozvolite korisnicima da se automatski pridruže organizaciji ili zatraže pridruživanje na osnovu potvrđenog email domena.',
        primaryButton: 'Dodajte domen',
        unverifiedDomain_menuAction__verify: 'Potvrdite domen',
        unverifiedDomain_menuAction__remove: 'Obrišite domen',
      },
    },
    createDomainPage: {
      title: 'Dodajte domen',
      subtitle:
        'Dodajte domen za potvrdu. Korisnici sa email adresama na ovom domenu mogu se automatski pridružiti organizaciji ili zatražiti pridruživanje.',
    },
    verifyDomainPage: {
      title: 'Potvrdite domen',

      subtitle: 'Domen {{domainName}} treba da bude potvrđen putem emaila.',
      subtitleVerificationCodeScreen:
        'Verifikacioni kod je poslat na {{emailAddress}}. Unesite kod da nastavite.',
      formTitle: 'Verifikacioni kod',
      formSubtitle: 'Unesite verifikacioni kod poslat na vašu email adresu',
      resendButton: 'Niste dobili kod? Pošaljite ponovo',
    },
    verifiedDomainPage: {
      subtitle:
        'Domen {{domain}} je sada potvrđen. Nastavite izborom načina upisa.',
      start: {
        headerTitle__enrollment: 'Opcije upisa',
        headerTitle__danger: 'Opasnost',
      },
      enrollmentTab: {
        subtitle:
          'Izaberite kako korisnici iz ovog domena mogu da se pridruže organizaciji.',
        manualInvitationOption__label: 'Bez automatskog upisa',
        manualInvitationOption__description:
          'Korisnici mogu biti pozvani samo ručno u organizaciju.',
        automaticInvitationOption__label: 'Automatske pozivnice',
        automaticInvitationOption__description:
          'Korisnici se automatski pozivaju da se pridruže organizaciji kada se registruju i mogu se pridružiti bilo kada.',
        automaticSuggestionOption__label: 'Automatski predlozi',
        automaticSuggestionOption__description:
          'Korisnici dobijaju predlog da zatraže pridruživanje, ali moraju biti odobreni od strane administratora pre nego što se mogu pridružiti organizaciji.',
        formButton__save: 'Sačuvajte',
        calloutInfoLabel:
          'Promena načina upisa će uticati samo na nove korisnike.',
        calloutInvitationCountLabel:
          'Poslate pozivnice koje čekaju korisnike: {{count}}',
        calloutSuggestionCountLabel:
          'Poslati predlozi koji čekaju korisnike: {{count}}',
      },
      dangerTab: {
        removeDomainTitle: 'Uklonite domen',
        removeDomainSubtitle: 'Uklonite ovaj domen iz vaših potvrđenih domena',
        removeDomainActionLabel__remove: 'Uklonite domen',
        calloutInfoLabel:
          'Uklanjanje ovog domena će uticati na pozvane korisnike.',
      },
    },
    invitePage: {
      title: 'Pozovite članove',
      subtitle: 'Pozovite nove članove u ovu organizaciju',
      successMessage: 'Pozivnice su uspešno poslate',
      detailsTitle__inviteFailed:
        'Pozivnice nisu mogle biti poslate. Već postoje čekajuće pozivnice za sledeće email adrese: {{email_addresses}}.',
      formButtonPrimary__continue: 'Pošaljite pozivnice',
    },
    removeDomainPage: {
      title: 'Uklonite domen',
      messageLine1: 'Email domen {{domain}} će biti uklonjen.',
      messageLine2:
        'Korisnici neće moći automatski da se pridruže organizaciji nakon ovoga.',
      successMessage: '{{domain}} je uklonjen.',
    },
    membersPage: {
      detailsTitle__emptyRow: 'Nema članova za prikaz',
      action__invite: 'Pozovite',
      start: {
        headerTitle__active: 'Aktivni',
        headerTitle__members: 'Članovi',
        headerTitle__invited: 'Pozvani',
        headerTitle__invitations: 'Pozivnice',
        headerTitle__requests: 'Zahtevi',
      },
      activeMembersTab: {
        tableHeader__user: 'Korisnik',
        tableHeader__joined: 'Pridružio se',
        tableHeader__role: 'Uloga',
        tableHeader__actions: '',
        menuAction__remove: 'Uklonite člana',
      },
      invitedMembersTab: {
        tableHeader__invited: 'Pozvani',
        menuAction__revoke: 'Poništite pozivnicu',
      },
      invitationsTab: {
        table__emptyRow: 'Nema pozivnica za prikaz',
        manualInvitations: {
          headerTitle: 'Pojedinačne pozivnice',
          headerSubtitle:
            'Ručno pozovite članove i upravljajte postojećim pozivnicama.',
        },
        autoInvitations: {
          headerTitle: 'Automatske pozivnice',
          headerSubtitle:
            'Pozovite korisnike povezivanjem email domena sa vašom organizacijom. Svi koji se registruju sa odgovarajućom email adresom moći će se pridružiti organizaciji bilo kada.',
          primaryButton: 'Upravljajte potvrđenim domenima',
        },
      },
      requestsTab: {
        tableHeader__requested: 'Zahtevano pridruživanje',
        menuAction__approve: 'Odobrite',
        menuAction__reject: 'Odbijte',
        table__emptyRow: 'Nema zahteva za prikaz',
        requests: {
          headerTitle: 'Zahtevi',
          headerSubtitle:
            'Pregledajte i upravljajte korisnicima koji su zatražili da se pridruže organizaciji.',
        },
        autoSuggestions: {
          headerTitle: 'Automatski predlozi',
          headerSubtitle:
            'Korisnici koji se registruju sa odgovarajućim email domenom, moći će da vide predlog da zatraže pridruživanje vašoj organizaciji.',
          primaryButton: 'Upravljajte potvrđenim domenima',
        },
      },
    },
  },
  createOrganization: {
    title: 'Kreirajte organizaciju',
    formButtonSubmit: 'Kreirajte organizaciju',
    subtitle: 'Postavite profil organizacije',
    invitePage: {
      formButtonReset: 'Preskočite',
    },
  },
  organizationList: {
    createOrganization: 'Kreirajte organizaciju',
    title: 'Izaberite nalog',
    titleWithoutPersonal: 'Izaberite organizaciju',
    subtitle: 'da biste nastavili do {{applicationName}}',
    action__invitationAccept: 'Pridružite se',
    invitationAcceptedLabel: 'Pridružili ste se',
    action__suggestionsAccept: 'Zatražite pridruživanje',
    suggestionsAcceptedLabel: 'Čeka se odobrenje',
    action__createOrganization: 'Kreirajte organizaciju',
  },
  unstable__errors: {
    identification_deletion_failed:
      'Ne možete obrisati svoj poslednji identifikator.',
    phone_number_exists:
      'Ovaj broj telefona je zauzet. Molimo pokušajte sa drugim.',
    form_identifier_not_found: '',
    captcha_unavailable:
      'Registracija nije uspela zbog neuspešne provere robota. Osvežite stranicu da pokušate ponovo ili kontaktirajte podršku za dodatnu pomoć.',
    captcha_invalid:
      'Registracija nije uspela zbog neuspešnih sigurnosnih provera. Osvežite stranicu da pokušate ponovo ili kontaktirajte podršku za dodatnu pomoć.',
    form_password_pwned:
      'Ova lozinka je pronađena kao deo kompromitovanog podatka i ne može se koristiti, molimo probajte sa drugom lozinkom.',
    form_username_invalid_length: '',
    form_username_invalid_character: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address:
      'Email adresa mora biti važeća email adresa.',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
    form_password_incorrect: '',
    not_allowed_access: '',
    form_identifier_exists: '',
    form_password_validation_failed: 'Netačna lozinka',
    form_password_not_strong_enough: 'Vaša lozinka nije dovoljno jaka.',
    form_password_size_in_bytes_exceeded:
      'Vaša lozinka je premašila maksimalni broj bajtova koji su dozvoljeni, molimo skratite je ili uklonite neke specijalne karaktere.',
    passwordComplexity: {
      sentencePrefix: 'Vaša lozinka mora sadržati',
      minimumLength: '{{length}} ili više karaktera',
      maximumLength: 'manje od {{length}} karaktera',
      requireNumbers: 'broj',
      requireLowercase: 'malo slovo',
      requireUppercase: 'veliko slovo',
      requireSpecialCharacter: 'specijalni karakter',
    },
    zxcvbn: {
      notEnough: 'Vaša lozinka nije dovoljno jaka.',
      couldBeStronger:
        'Vaša lozinka funkcioniše, ali može biti jača. Probajte dodati više karaktera.',
      goodPassword: 'Vaša lozinka ispunjava sve neophodne zahteve.',
      warnings: {
        straightRow: 'Pravi redovi tastera na tastaturi su lako predvidivi.',
        keyPattern: 'Kratki šabloni na tastaturi su lako predvidivi.',
        simpleRepeat: 'Ponavljani karakteri poput "aaa" su lako predvidivi.',
        extendedRepeat:
          'Ponavljani šabloni karaktera poput "abcabcabc" su lako predvidivi.',
        sequences:
          'Uobičajeni nizovi karaktera poput "abc" su lako predvidivi.',
        recentYears: 'Nedavne godine su lako predvidive.',
        dates: 'Datumi su lako predvidivi.',
        topTen: 'Ovo je veoma korišćena lozinka.',
        topHundred: 'Ovo je često korišćena lozinka.',
        common: 'Ovo je uobičajena lozinka.',
        similarToCommon: 'Ovo je slično uobičajenoj lozinki.',
        wordByItself: 'Pojedinačne reči su lako predvidive.',
        namesByThemselves:
          'Pojedinačna imena ili prezimena su lako predvidiva.',
        commonNames: 'Uobičajena imena i prezimena su lako predvidiva.',
        userInputs: 'Ne bi trebalo da postoji lični ili stranični podatak.',
        pwned:
          'Vaša lozinka je bila izložena na internetu zbog curenja podataka.',
      },
      suggestions: {
        l33t: "Izbegavajte predvidljive zamene slova poput '@' za 'a'.",
        reverseWords: 'Izbegavajte obrnuto pravopisne oblike uobičajenih reči.',
        allUppercase: 'Koristite velika slova, ali ne sva.',
        capitalization: 'Koristite velika slova više od prvog slova.',
        dates: 'Izbegavajte datume i godine koje su povezane sa vama.',
        recentYears: 'Izbegavajte nedavne godine.',
        associatedYears: 'Izbegavajte godine koje su povezane sa vama.',
        sequences: 'Izbegavajte uobičajene nizove karaktera.',
        repeated: 'Izbegavajte ponovljene reči i karaktere.',
        longerKeyboardPattern:
          'Koristite duže šablone na tastaturi i promenite smer kucanja više puta.',
        anotherWord: 'Dodajte više reči koje su manje uobičajene.',
        useWords: 'Koristite više reči, ali izbegavajte uobičajene fraze.',
        noNeed:
          'Možete kreirati jake lozinke bez korišćenja simbola, brojeva ili velikih slova.',
        pwned:
          'Ako koristite ovu lozinku negde drugde, trebalo bi da je promenite.',
      },
    },
    form_param_max_length_exceeded__name:
      'Ime ne bi trebalo da premašuje 256 karaktera.',
    form_param_max_length_exceeded__first_name:
      'Ime ne bi trebalo da premašuje 256 karaktera.',
    form_param_max_length_exceeded__last_name:
      'Prezime ne bi trebalo da premašuje 256 karaktera.',
  },
  dates: {
    previous6Days:
      "Prošlog {{ date | weekday('sr-RS','long') }} u {{ date | timeString('sr-RS') }}",

    lastDay: "Juče u {{ date | timeString('sr-RS') }}",
    sameDay: "Danas u {{ date | timeString('sr-RS') }}",
    nextDay: "Sutra u {{ date | timeString('sr-RS') }}",
    next6Days:
      "{{ date | weekday('sr-RS','long') }} u {{ date | timeString('sr-RS') }}",
    numeric: "{{ date | numeric('sr-RS') }}",
  },
};

