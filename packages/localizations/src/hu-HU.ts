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

export const huHU: LocalizationResource = {
  locale: 'hu-HU',
  backButton: 'Vissza',
  badge__default: 'Alapértelmezett',
  badge__otherImpersonatorDevice: 'Másik megszemélyesítő eszköz',
  badge__primary: 'Elsődleges',
  badge__requiresAction: 'Beavatkozás szükséges',
  badge__thisDevice: 'Ez az eszköz',
  badge__unverified: 'Nem ellenőrzött',
  badge__userDevice: 'Felhasználói eszköz',
  badge__you: 'Te',
  createOrganization: {
    formButtonSubmit: 'Szervezet létrehozása',
    invitePage: {
      formButtonReset: 'Kihagyás',
    },
    title: 'Szervezet létrehozása',
  },
  dates: {
    lastDay: "Tegnap {{ date | timeString('hu-HU') }}-kor",
    next6Days: "{{ date | weekday('hu-HU','long') }} {{ date | timeString('hu-HU') }}-kor",
    nextDay: "Holnap {{ date | timeString('hu-HU') }}-kor",
    numeric: "{{ date | timeString('hu-HU') }}",
    previous6Days: "Elmúlt {{ date | weekday('hu-HU','long') }} {{ date | timeString('hu-HU') }}-kor",
    sameDay: "Ma {{ date | timeString('hu-HU') }}-kor",
  },
  dividerText: 'vagy',
  footerActionLink__useAnotherMethod: 'Másik módszer használata',
  footerPageLink__help: 'Súgó',
  footerPageLink__privacy: 'Adatvédelem',
  footerPageLink__terms: 'Felhasználási feltételek',
  formButtonPrimary: 'Tovább',
  formButtonPrimary__verify: 'Ellenőrzés',
  formFieldAction__forgotPassword: 'Elfelejtetted a jelszavad?',
  formFieldError__matchingPasswords: 'A jelszavak megegyeznek',
  formFieldError__notMatchingPasswords: 'A jelszavak nem egyeznek',
  formFieldError__verificationLinkExpired: 'A megerősítő link lejárt. Kérlek kérj egy újat.',
  formFieldHintText__optional: 'Nem kötelező',
  formFieldHintText__slug: 'A slug egy egyedi azonosító, amelyet általában URL-ben használunk.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Fiók törlése',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses: 'pelda@email.hu, pelda2@email.hu',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__organizationDomain: '',
  formFieldInputPlaceholder__organizationDomainEmailAddress: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldInputPlaceholder__organizationSlug: 'my-org',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldLabel__automaticInvitations: 'Automatikus meghívások engedélyezése ezen a domainen',
  formFieldLabel__backupCode: 'Tartalék kód',
  formFieldLabel__confirmDeletion: 'Megerősítés',
  formFieldLabel__confirmPassword: 'Jelszó megerősítése',
  formFieldLabel__currentPassword: 'Jelenlegi jelszó',
  formFieldLabel__emailAddress: 'Email cím',
  formFieldLabel__emailAddress_username: 'Email cím vagy felhasználónév',
  formFieldLabel__emailAddresses: 'Email címek',
  formFieldLabel__firstName: 'Keresztnév',
  formFieldLabel__lastName: 'Vezetéknév',
  formFieldLabel__newPassword: 'Új jelszó',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Függőben lévő meghívások és javaslatok törlése',
  formFieldLabel__organizationDomainEmailAddress: 'Visszaigazoló email cím',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Írj be egy email címet ez alatt a domain alatt, hogy visszaigazold a domaint.',
  formFieldLabel__organizationName: 'Szervezet neve',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Passkey neve',
  formFieldLabel__password: 'Jelszó',
  formFieldLabel__phoneNumber: 'Telefonszám',
  formFieldLabel__role: 'Beosztás',
  formFieldLabel__signOutOfOtherSessions: 'Kijelentkeztetés minden más eszközökről',
  formFieldLabel__username: 'Felhasználónév',
  impersonationFab: {
    action__signOut: 'Kijelentkezés',
    title: 'Bejelntkezve mint {{identifier}}',
  },
  maintenanceMode: 'Jelenleg karbantartás alatt állunk, de ne aggódj, ez nem tart tovább pár percnél!',
  membershipRole__admin: 'Adminisztrátor',
  membershipRole__basicMember: 'Tag',
  membershipRole__guestMember: 'Vendég',
  organizationList: {
    action__createOrganization: 'Szervezet létrehozása',
    action__invitationAccept: 'Csatlakozás',
    action__suggestionsAccept: 'Csatlakozás kérése',
    createOrganization: 'Szervezet létrehozása',
    invitationAcceptedLabel: 'Meghívás elfogadva',
    subtitle: 'Amivel folytathatod a(z) {{applicationName}}',
    suggestionsAcceptedLabel: 'Elfogadásra vár',
    title: 'Válassz egy fiókot',
    titleWithoutPersonal: 'Válassz egy szervezetet',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Automatikus meghívások',
    badge__automaticSuggestion: 'Automatikus javaslatok',
    badge__manualInvitation: 'Nincs automatikus felvétel',
    badge__unverified: 'Nincs visszaigazolva',
    createDomainPage: {
      subtitle:
        'Add meg a visszaigazolandó domain nevét. Minden email cím erről a tartományjól automatikusan tud csatlakozni a szervezethez.',
      title: 'Domain hozzáadása',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'A meghívok küldése sikertelen. Már vannak függőben lévő meghívók a következő címekre: {{email_addresses}}',
      formButtonPrimary__continue: 'Meghívók küldése',
      selectDropdown__role: 'Válassz beosztást',
      subtitle: 'Írj be vagy illessz be egy vagy több email címet, vesszővel, vagy szóközzel elválasztva.',
      successMessage: 'A meghívók sikeresen elküldve',
      title: 'Új tagok meghívása',
    },
    membersPage: {
      action__invite: 'Meghívás',
      activeMembersTab: {
        menuAction__remove: 'Tag eltávolítása',
        tableHeader__actions: '',
        tableHeader__joined: 'Csatlakozott',
        tableHeader__role: 'Beosztás',
        tableHeader__user: 'Felhasználó',
      },
      detailsTitle__emptyRow: 'Nincsenek listázható tagok',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Adj meg egy email domaint, hogy meghívhass tagokat. Bárki aki erről a tartományról regisztrál, bármikor, csatlakozhat a szervezethez bármikor',
          headerTitle: 'Automatikus meghívások',
          primaryButton: 'Visszaigazolt domainek kezelése',
        },
        table__emptyRow: 'Nincsenek listázható meghívások',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Meghívó visszavonása',
        tableHeader__invited: 'Meghívva',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Azok a felhasználók, akik, egyező email domainnel regisztrálnak, látni fognak egy javaslatot, hogy csatlakozzanak a szervezetedhez.',
          headerTitle: 'Automatikus javaslat',
          primaryButton: 'Visszaigazolt domainek kezelése',
        },
        menuAction__approve: 'Elfogadás',
        menuAction__reject: 'Elutasítás',
        tableHeader__requested: 'Hozzáférés kérése',
        table__emptyRow: 'Nincsenek listázható kérések',
      },
      start: {
        headerTitle__invitations: 'Meghívók',
        headerTitle__members: 'Tagok',
        headerTitle__requests: 'Kérések',
      },
    },
    navbar: {
      description: 'A szervezeted kezelése',
      general: 'Általános',
      members: 'Tagok',
      title: 'Szervezet',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Írd be, hogy: "{{organizationName}}" a folytatáshoz',
          messageLine1: 'Biztosan törölni szeretnéd ez a szervezetet?',
          messageLine2: 'Ez a művelet végleges és visszafordíthatatlan.',
          successMessage: 'Kitörölted a szervezetet.',
          title: 'Szervezet törlése',
        },
        leaveOrganization: {
          actionDescription: 'Írd be, hogy: "{{organizationName}}" a folytatáshoz',
          messageLine1:
            'Biztos vagy benne, hogy el szeretnéd hagyni a szervezetet? Elveszíted a hozzáférést a szervezethez, és alkamazásaihoz.',
          messageLine2: 'Ez a művelet végleges és visszafordíthatatlan.',
          successMessage: 'Elhagytad a szervezetet.',
          title: 'Szervezet elhagyása',
        },
        title: 'Veszély',
      },
      domainSection: {
        menuAction__manage: 'Kezelés',
        menuAction__remove: 'Törlés',
        menuAction__verify: 'Visszaigazolás',
        primaryButton: 'Domain hozzáadása',
        subtitle:
          'Endegélyezd, hogy a felhasználók automatikusan csatlakozhassanak a szervezetedhez, vagy hozzáférést kérjenek, az email domainjük alapján.',
        title: 'Visszaigazolt domainek',
      },
      successMessage: 'A szervezet frissítve',
      title: 'Profil frissítése',
    },
    removeDomainPage: {
      messageLine1: 'Az email domain {{domain}} el lesz távolítva',
      messageLine2: 'Ez után a felhasználók nem tudnak automatikusan csatlakozni',
      successMessage: '{{domain}} törölve lett',
      title: 'Domain törlése',
    },
    start: {
      headerTitle__general: 'Általános',
      headerTitle__members: 'Tagok',
      profileSection: {
        primaryButton: 'Profil frissítése',
        title: 'Szervezet Profil',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'A domain törlése befolyásolja a meghívott felhasználókat',
        removeDomainActionLabel__remove: 'Domain törlése',
        removeDomainSubtitle: 'Domain törlése a visszaigazolt domainek listájáról',
        removeDomainTitle: 'Domain törlése',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'A felhasználók automatikusan meg lesznek hívva a szervezetbe, amikor regisztrálnak, és bármikor csatlakozhatnak.',
        automaticInvitationOption__label: 'Automatikus meghívások',
        automaticSuggestionOption__description:
          'A felasználók kapnak egy javaslatot, hogy kérjenek hozzáférést, de előbb egy adminisztrátornak jóvá kell hagynia, mielőtt csatlakozhatnak.',
        automaticSuggestionOption__label: 'Automatikus javaslatok',
        calloutInfoLabel: 'A felvételi mód megváltoztatása csak az új felhasználókra lesz hatással',
        calloutInvitationCountLabel: 'Függőben lévő meghívók: {{count}}',
        calloutSuggestionCountLabel: 'Függőben lévő javaslatok: {{count}}',
        manualInvitationOption__description: 'Felhasználókat csak manuálisan lehet meghívni a szervezetbe.',
        manualInvitationOption__label: 'Nincs automatikus felvétel',
        subtitle: 'Válaszd ki, hogy a felhasználók, hogyan csatlakozhatnak szervezethez.',
      },
      start: {
        headerTitle__danger: 'Veszély',
        headerTitle__enrollment: 'Felvételi opciók',
      },
      subtitle: 'A domain {{domain}} visszaigazolva. A folytatáshoz válassz felvételi módot',
      title: '{{domain}} frissítése',
    },
    verifyDomainPage: {
      formSubtitle: 'Írd be a megerősítő kódot, amit elküldtünk az email címedre',
      formTitle: 'Megerősítő kód',
      resendButton: 'Nem kaptál kódot? Újraküldés',
      subtitle: 'A domain {{domainName}}-t emaillel jóvá kell hagyni.',
      subtitleVerificationCodeScreen:
        'Elküldtük a megerősítő kódot a(z) {{emailAddress}} címre. A folytatáshoz írd be a kódot',
      title: 'Domain visszaigazolása',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Szervezet létrehozása',
    action__invitationAccept: 'Csatlakozás',
    action__manageOrganization: 'Kezelés',
    action__suggestionsAccept: 'Csatlakozás kérése',
    notSelected: 'Nincs szervezet kiválasztva',
    personalWorkspace: 'Személyes fiók',
    suggestionsAcceptedLabel: 'Elfogadásra vár',
  },
  paginationButton__next: 'Következő',
  paginationButton__previous: 'Előző',
  paginationRowText__displaying: 'Mutat',
  paginationRowText__of: '-ból/-ből',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Fiók hozzáadása',
      action__signOutAll: 'Kijelentkezés minden fiókból',
      subtitle: 'Válaszd ki a fiókot amivel folytatni szeretnéd',
      title: 'Válassz egy fiókot',
    },
    alternativeMethods: {
      actionLink: 'Segítség kérése',
      actionText: 'Nincs ezekből egyik sem ?',
      blockButton__backupCode: 'Tartalék kód használata',
      blockButton__emailCode: 'Email kód a {{identifier}}-nak/nek',
      blockButton__emailLink: 'Email link a {{identifier}}-nak/nek',
      blockButton__passkey: 'Bejelentkezés passkey-vel',
      blockButton__password: 'Bejelentkezés jelszóval',
      blockButton__phoneCode: 'SMS kód {{identifier}}-nak/nek',
      blockButton__totp: 'Hitelesítő app használata',
      getHelp: {
        blockButton__emailSupport: 'Segítség kérése emailben',
        content:
          'Ha bármilyen problémád van a bejelentkezéssel a fiókodba, küldj nekünk egy emailt, és visszaállítjuk a fiókodat, amint lehetséges.',
        title: 'Segítség kérés',
      },
      subtitle: 'Problémád akadt? Ezek közül bármelyik bejelentkezési módot választhatod.',
      title: 'Bejelentkezés más módon',
    },
    backupCodeMfa: {
      subtitle: 'A tartalék kód az, amit akkor kaptál, amikor beállítottad a kétlépcsős azonosítást',
      title: 'Írd be a tartalék kódot',
    },
    emailCode: {
      formTitle: 'Visszaigazoló kód',
      resendButton: 'Nem kaptad meg a kódot? Újraküldés',
      subtitle: 'hogy folytathasd a(z) {{applicationName}}',
      title: 'Ellenőrizd az emailed',
    },
    emailLink: {
      expired: {
        subtitle: 'Menj vissza az eredeti lapra a folytatáshoz.',
        title: 'Ez a megerősítő link lejárt',
      },
      failed: {
        subtitle: 'Menj vissza az eredeti lapra a folytatáshoz.',
        title: 'Ez a megerősítő link érvénytelen',
      },
      formSubtitle: 'Használd a megerősítő linket, amit a emailben kaptál',
      formTitle: 'Megerősítő link',
      loading: {
        subtitle: 'Hamarosan átirányítunk',
        title: 'Bejelentkezés folyamatban...',
      },
      resendButton: 'Nem kaptál linket? Újraküldés',
      subtitle: 'hogy folytathasd a(z) {{applicationName}}',
      title: 'Ellenőrizd az emailed',
      unusedTab: {
        title: 'Ezt a lapot bezárhatod',
      },
      verified: {
        subtitle: 'Hamarosan átirányítunk',
        title: 'Sikeres bejelentkezés',
      },
      verifiedSwitchTab: {
        subtitle: 'Menj vissza az eredeti lapra a folyatáshoz',
        subtitleNewTab: 'Menj át az újonan megnyitott lapra a folytatáshoz',
        titleNewTab: 'Egy másik lapon bejelezkeztél be',
      },
    },
    forgotPassword: {
      formTitle: 'Jelszó visszaállító kód',
      resendButton: 'Nem kaptad meg a kódot? Újraküldés',
      subtitle: 'hogy visszaállíthasd a jelszavad',
      subtitle_email: 'Először, írd be a kódot amit emailben kaptál',
      subtitle_phone: 'Először, írd be a kódot amit a telefonodra kaptál',
      title: 'Jelszó visszaállítás',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Állítsd vissza a jelszavad',
      label__alternativeMethods: 'Vagy jelentkezz be más módon',
      title: 'Efelejtetted a jelszavad?',
    },
    noAvailableMethods: {
      message: 'Nem lehet bejelentkezni. Nincs elérhető hitelesítő tényező.',
      subtitle: 'Hiba történt',
      title: 'Nem lehetett bejelentkezni',
    },
    passkey: {
      subtitle:
        'A Passkey-d használata megerősíti, hogy te vagy az. Az eszközöd kérheti az ujjlenyomatod, arcod vagy a képernyőzárad.',
      title: 'Használd a passkeydet',
    },
    password: {
      actionLink: 'Másik mód használata',
      subtitle: 'Írd be a fiókhoz tartozó jelszavad',
      title: 'Írd be a jelszavad',
    },
    passwordPwned: {
      title: 'Jelszó kompromitálódott',
    },
    phoneCode: {
      formTitle: 'Visszaigazoló kód',
      resendButton: 'Nem kaptad meg a kódot? Újraküldés',
      subtitle: 'hogy folytathasd a(z) {{applicationName}}',
      title: 'Ellenőrizd a telefonod',
    },
    phoneCodeMfa: {
      formTitle: 'Visszaigazoló kód',
      resendButton: 'Nem kaptad meg a kódot? Újraküldés',
      subtitle: 'A folytatáshoz, kérlek írd be a visszaigazoló kódot, amit a telefonodra küldtünk.',
      title: 'Ellenőrizd a telefonod',
    },
    resetPassword: {
      formButtonPrimary: 'Jelszó visszaállítása',
      requiredMessage: 'Biztonsági okokból, muszáj megváltoztatnod a jelszavadat.',
      successMessage: 'A jelszavad sikeresen megváltozott. A bejelentkezés folyamatban, kérlek várj.',
      title: 'Új jelszó beállítása',
    },
    resetPasswordMfa: {
      detailsLabel: 'Vissza kell igazolnod az identitásod, mielőtt visszaállítod a jelszavad',
    },
    start: {
      actionLink: 'Regisztráció',
      actionLink__use_email: 'Email használata',
      actionLink__use_email_username: 'Használd az emailded vagy a felhasználóneved',
      actionLink__use_passkey: 'Passkey használata',
      actionLink__use_phone: 'Telefon használata',
      actionLink__use_username: 'Felhasználónév használata',
      actionText: 'Nincs fiókod?',
      subtitle: 'Üdv újra! A folytatáshoz kérlek jelentkezz be.',
      title: 'Bejelentkezés a(z) {{applicationName}} fiókba',
    },
    totpMfa: {
      formTitle: 'Visszaigazoló kód',
      subtitle: 'A folytatáshoz, kérlek írd be a visszaigazoló kódot, amit a hitelesítő app készített.',
      title: 'Két lépécsős azonosítás',
    },
  },
  signInEnterPasswordTitle: 'Írd be a jelszavad',
  signUp: {
    continue: {
      actionLink: 'Bejelentkezés',
      actionText: 'Van már fiókod?',
      subtitle: 'Kérlek töltsd ki a hátralévő mezőket a folytatáshoz',
      title: 'Töltsd ki a hiányzó mezőket',
    },
    emailCode: {
      formSubtitle: 'Írd be a visszaigazoló kódot, amit emailben kaptál',
      formTitle: 'Viszaigazoló kód',
      resendButton: 'Nem kaptad meg a kódot? Újraküldés',
      subtitle: 'Írd be a visszaigazoló kódot, amit emailben kaptál',
      title: 'Email megerősítése',
    },
    emailLink: {
      formSubtitle: 'Használd a  visszaigazoló linket, amit a emailben kaptál',
      formTitle: 'Visszaigazoló link',
      loading: {
        title: 'Regisztrálás...',
      },
      resendButton: 'Nem kaptad meg a kódot? Újraküldés',
      subtitle: 'hogy folytasd a(z) {{applicationName}}',
      title: 'Erősítsd meg az email címed',
      verified: {
        title: 'Sikeres regisztráció',
      },
      verifiedSwitchTab: {
        subtitle: 'Menj az újonan nyitott lapra, a folytatáshoz',
        subtitleNewTab: 'Menj vissza az előző lapra a folytatáshoz',
        title: 'Sikeresen megerősítetted az email címed',
      },
    },
    phoneCode: {
      formSubtitle: 'Írd be a visszaigazoló kódot, amit a telefondra kaptál',
      formTitle: 'Visszaigazoló kód',
      resendButton: 'Nem kaptad meg a kódot? Újraküldés',
      subtitle: 'Írd be a visszaigazoló kódot, amit a telefonodra kaptál',
      title: 'Erősítsd meg a telefonszámod',
    },
    start: {
      actionLink: 'Bejelentkezés',
      actionText: 'Van már fiókod?',
      subtitle: 'Üdv! Kérlek add meg az adatokat, hogy elkezdhesd.',
      title: 'Fiók létrehozása',
    },
  },
  socialButtonsBlockButton: 'Folytatás {{provider|titleize}} segítségével',
  unstable__errors: {
    captcha_invalid:
      'Biztonsági okokból a regisztráció sikertelen volt. Kérlek frissítsd az oldalt, hogy újra próbálhasd, vagy kérj támogatást.',
    captcha_unavailable:
      'Bot érvényesítése miatt, a regisztráció sikertelen volt. Kérlek frissítsd az oldalt, hogy újra próbálhasd, vagy kérj támogatást.',
    form_code_incorrect: '',
    form_identifier_exists: '',
    form_identifier_exists__email_address: 'Ez az email cím már foglalt. Kérlek próbálj egy másikat.',
    form_identifier_exists__phone_number: 'Ez a telefonszám már foglalt. Kérlek próbálj egy másikat.',
    form_identifier_exists__username: 'Ez a felhasználónév már foglalt. Kérlek próbálj egy másikat.',
    form_identifier_not_found: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'Az email címnek érvényes email címnek kell lennie.',
    form_param_format_invalid__phone_number: 'A telefonszámnak érvényes telefonszámnak kell lennie.',
    form_param_max_length_exceeded__first_name: 'A keresztnév nem lehet hosszabb, mint 256 karakter.',
    form_param_max_length_exceeded__last_name: 'A vezetéknév nem lehet hosszabb, mint 256 karakter.',
    form_param_max_length_exceeded__name: 'A név nem lehet hosszabb mint 256 karakter.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'A jelszó nem elég erős',
    form_password_pwned:
      'Úgy látjuk, hogy ez a jelszó kiszivárgott, ezért ezt nem használhatod, kérlek próbálj egy másik jelszót.',
    form_password_pwned__sign_in:
      'Úgy látjuk, hogy ez a jelszó kiszivárgott, ezért ezt nem használhatod, kérlek állítsd át a jelszavad.',
    form_password_size_in_bytes_exceeded:
      'A jelszavad több bájtot tartalmaz mint a megadott maximum, kérlek rövidítsd vagy törölj ki néhány speciális karaktert.',
    form_password_validation_failed: 'Helytelen jelszó',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: 'Nem törölheted ki az utolsó azonosítód.',
    not_allowed_access: '',
    passkey_already_exists: 'Egy passkey már regisztrálva van ehhez az eszközhöz.',
    passkey_not_supported: 'Passkeyk nem támogatottak ezen az eszközön.',
    passkey_pa_not_supported: 'A regisztrációhoz egy platform hitelesítő kell, de ez az eszköz ezt nem támogatja.',
    passkey_registration_cancelled: 'Passkey regisztráció megszakadt vagy lejárt.',
    passkey_retrieval_cancelled: 'Passkey visszaigazolás megszakadt vagy lejárt.',
    passwordComplexity: {
      maximumLength: 'kevesebb mint {{length}} karaktert',
      minimumLength: '{{length}} vagy több karaktert',
      requireLowercase: 'egy kisbetűt',
      requireNumbers: 'egy számot',
      requireSpecialCharacter: 'egy speciális karaktert',
      requireUppercase: 'egy nagybetű',
      sentencePrefix: 'A jelszavadnak tartalmaznia kell',
    },
    phone_number_exists: 'Ez a telefonszám már foglalt. Kérlek próbálj meg egy másikat.',
    zxcvbn: {
      couldBeStronger: 'A jelszavad, jó, de lehetne erősebb. Adj hozzá több karaktert.',
      goodPassword: 'A jelszavad megfelel az elvárásoknak.',
      notEnough: 'Nem elég erős a jelszavad.',
      suggestions: {
        allUppercase: 'Változtass meg néhány betűt nagybetűre, de ne mindet.',
        anotherWord: 'Adj hozzá kevésbé gyakori szavakat.',
        associatedYears: 'Kerüld el a hozzád kapcsolható évek használatát',
        capitalization: 'Ne csak az első betű legyen nagy betű.',
        dates: 'Kerüld el a hozzád köthető dátumok és évek használatát.',
        l33t: "Kerüld el a kiszámítható betű behelyettesítéseket, mint a '@' az 'a' helyett.",
        longerKeyboardPattern: 'Használj hosszabb billentyűzet mintákat, és változtasd meg a gépelés irányát többször.',
        noNeed:
          'Úgy is létrehozhatsz erős jelszót, hogy nem használsz speciális karaktereket, számokat, vagy nagybetűket.',
        pwned: 'Ha máshol is használod ezt a jelszót, akkor változtasd meg.',
        recentYears: 'Kerüld el a közelmúlt évek használatát.',
        repeated: 'Kerüld el a szó- vagy karakterismétlést',
        reverseWords: 'Kerüld el a szavak visszafelé írását.',
        sequences: 'Kerüld el a gyakori karakter sorozatokat.',
        useWords: 'Használj több szót, de kerüld el a gyakori kifejezéseket.',
      },
      warnings: {
        common: 'Ez egy gyakran használt jelszó',
        commonNames: 'A gyakori nevek könnyen kitalálhatóak.',
        dates: 'A dátumokat könnyű kitalálni.',
        extendedRepeat: 'Ismétlődő karakter sorozatok, mint "abcabcabc" könnyen kitalálhatóak.',
        keyPattern: 'A rövid billentyűzetminták könnyen kitalálhatóak.',
        namesByThemselves: 'A nevek könnyen kitalálhatóak.',
        pwned: 'A jelszavad kiszivárgott egy adatszivárgás során az Interneten. Válassz egy másikat.',
        recentYears: 'Az elmúlt évek könnyen kitalálhatóak.',
        sequences: 'Gyakori karakter sorozatok, mint "abc" könnyen kitalálhatóak.',
        similarToCommon: 'Ez hasonlít egy gyakran használt jelszóhoz.',
        simpleRepeat: 'Ismétlődő karakterek, mint az "aaa" könnyen kitalálhatóak.',
        straightRow: 'Egyenes sor a billentyűzeten, mint az "asdf" könnyen kitalálhatóak.',
        topHundred: 'Ez egy gyakran használt jelszó',
        topTen: 'Ez egy nagyon gyakori jelszó',
        userInputs: 'Ne tartalmazzon, személyes, vagy az oldalhoz köthető információt.',
        wordByItself: 'Egyszavas jelszavak könnyen kitalálhatóak.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Fiók hozzáadása',
    action__manageAccount: 'Fiók kezelése',
    action__signOut: 'Kijelentkezés',
    action__signOutAll: 'Kijelentkezés minden fiókból',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Kimásolva!',
      actionLabel__copy: 'Az összes kimásolása',
      actionLabel__download: '.txt letöltése',
      actionLabel__print: 'Nyomtatás',
      infoText1: 'A tartalék kódok be lesznek kapcsolva ehhez a fiókhoz.',
      infoText2:
        'A tartalék kódokat tartsd titokban, és tárold biztonságos helyen. Újragenerálhatod a tartalék kódokat, ha azt gondolod, hogy kiszivárogtak.',
      subtitle__codelist: 'Tárold őket biztonságos helyen, és tartsd titokban.',
      successMessage:
        'A tartalék kódok bekapcsolva. Használhatod ezeket, hogy belépj a fiókodba, ha nem férsz hozzá a hitelesítő eszközhöz. Mindegyik kódot egyszer tudod használni.',
      successSubtitle: 'Használhatod ezeket is, hogy belépj a fiókodba, ha nem férsz hozzá a hitelesítő eszközödhöz.',
      title: 'Tartalék kód megerősítés hozzáadása',
      title__codelist: 'Tartalék kódok',
    },
    connectedAccountPage: {
      formHint: 'Válassz egy szolgáltatót, amit összekötsz a fiókoddal.',
      formHint__noAccounts: 'Nincs elérhető külső fiók szolgáltató.',
      removeResource: {
        messageLine1: '{{identifier}} el lesz távolítva ebből a fiókból.',
        messageLine2:
          'Nem fogod tudni használni ezt a kapcsolt fiókot. Bármilyen ettől függő szolgáltatás nem fog működni.',
        successMessage: '{{connectedAccount}} eltávolítva a fiókdból.',
        title: 'Kapcsolt fiók eltávolítása',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'A szolgátató hozzá lett adva a fiókodhoz.',
      title: 'Kapcsolt fiók hozzáadása',
    },
    deletePage: {
      actionDescription: 'Írd be, hogy "Delete account" a folytatáshoz.',
      confirm: 'Fiók törlése',
      messageLine1: 'Biztos vagy benne, hogy törölni szeretnéd a fiókod?',
      messageLine2: 'Ez a művelet végleges és visszafordíthatatlan.',
      title: 'Fiók törlése',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Egy visszaigazoló kódot tartalmazó emailt fogunk küldeni erre az email címre.',
        formSubtitle: 'Írd be a visszaigazoló kódot, amit a(z) {{identifier}} címre küldtünk.',
        formTitle: 'Visszaigazoló kód',
        resendButton: 'Nem kaptad meg a kódot? Újraküldés',
        successMessage: 'Az email: {{identifier}} hozzá lett adva a fiókodhoz.',
      },
      emailLink: {
        formHint: 'Egy visszaigazoló linket tartalmazó emailt fogunk küldeni erre az email címre.',
        formSubtitle: 'Kattints a visszaigazoló linkre az emailben, amit ide küldtünk: {{identifier}}',
        formTitle: 'Visszaigazoló link',
        resendButton: 'Nem kaptad meg a linket? Újraküldés',
        successMessage: 'Az email: {{identifier}} hozzá lett adva a fiókodhoz.',
      },
      removeResource: {
        messageLine1: '{{identifier}} el lesz távolítva ebből a fiókból.',
        messageLine2: 'Nem fogsz tudni többet bejelentkezni ezzel az email címmel.',
        successMessage: '{{emailAddress}} el lett távolítva a fiókodból.',
        title: 'Email cím törlése',
      },
      title: 'Email cím hozzáadása',
      verifyTitle: 'Email cím visszaigazolása',
    },
    formButtonPrimary__add: 'Hozzáadás',
    formButtonPrimary__continue: 'Folytatás',
    formButtonPrimary__finish: 'Befejezés',
    formButtonPrimary__remove: 'Eltávolítás',
    formButtonPrimary__save: 'Mentés',
    formButtonReset: 'Mégsem',
    mfaPage: {
      formHint: 'Válassz egy hitelesítő módszert, amit hozzá szeretnél adni.',
      title: 'Kétlépcsős azonosítás bekapcsolása',
    },
    mfaPhoneCodePage: {
      backButton: 'Létező szám használata',
      primaryButton__addPhoneNumber: 'Telefonszám hozzáadása',
      removeResource: {
        messageLine1: '{{identifier}} nem fog többet visszaigazoló kódot kapni, amikor belépsz.',
        messageLine2: 'A fiókód nem biztos, hogy olyan biztonságos lesz. Biztosan folytatod?',
        successMessage: 'Kétlépcsős SMS kód eltávolítva a {{mfaPhoneCode}} számhoz',
        title: 'Kétlépcsős azonosítás eltávolítása',
      },
      subtitle__availablePhoneNumbers:
        'Válassz egy telefonszámot, hogy regisztráld az SMS kód kétlépcsős azonosítást, vagy adj hozzá egy újat.',
      subtitle__unavailablePhoneNumbers:
        'Nincs elérhető telefonszám, az SMS kód kétlépcsős azonosításhoz. Kérlek adj hozzá egyet.',
      successMessage1:
        'Amikor belépsz, extra lépésként meg kell adnod a visszaigazoló kódot, amit elküldünk erre a telefonszámra.',
      successMessage2:
        'Tárold ezeket a tartalék kódokat, egy biztonságos helyen. Ha nem férsz hozzá a hitelesítő eszközödhöz, ezekkel tudsz belépni.',
      successTitle: 'SMS visszaigazoló kód hozzáadva',
      title: 'SMS visszaigazoló kód hozzáadása',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Inkább olvasd be a QR kódot',
        buttonUnableToScan__nonPrimary: 'Nem tudod beolvasni a QR kódot?',
        infoText__ableToScan:
          'Állíts be egy új belépési módot, a hitelesítő alkalmazásodban és olvasd a QR kódot, hogy összekösd a fiókoddal.',
        infoText__unableToScan:
          'Állíts be egy új bejelentkezés módot a hitelesítő alkalmazásodban, írd be a kulcsot, amit lejjebb találsz.',
        inputLabel__unableToScan1:
          'Bizonyosodj meg, hogy a Time-based vagy a One-time passwords be van kapcsolva, majd fejezd be a fiók összekötését a következő kulccsal:',
        inputLabel__unableToScan2:
          'Alternatívaként, ha az hitelesítő alkalmazásod támogatja a TOTP URI-kat, a teljes URI-t is be lehet másolni.',
      },
      removeResource: {
        messageLine1:
          'Visszaigazoló kódok ebből a hitelesítő alkalmazásból, már nem fognak kelleni a bejelenetkezéshez.',
        messageLine2: 'Előfordulhat, hogy a fiókod nem lesz olyan biztonságos. Biztonsan folytatni szeretnéd?',
        successMessage: 'Kétlépcsős azonosítás hitelesítő alkalmazással eltávolítva.',
        title: 'Kétlépcsős azonosítás eltávolítása',
      },
      successMessage:
        'Kétlépcsős azonosítást bekapcsolva. Extra lépésként, amikor belépsz, meg kell adnod a visszaigazoló kódot a hitelesítő alkalmazásodból.',
      title: 'Hitelesítő alkalmazás hozzáadása',
      verifySubtitle: 'Írd be a visszaigazoló kódot, amit a hitelesítő alkalmazásodból.',
      verifyTitle: 'Visszaigazoló kód',
    },
    mobileButton__menu: 'Menü',
    navbar: {
      account: 'Profil',
      description: 'Fiók információk kezelése',
      security: 'Biztonság',
      title: 'Fiók',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} el lesz távolítva ebből a fiókból.',
        title: 'Passkey törlése',
      },
      subtitle__rename: 'Megváltoztathatod a passkey nevét, hogy könnyebb legyen megtalálni.',
      title__rename: 'Passkey átnevezése',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Ajánlott kijelentkeztetni az összes olyan eszközt, ami a régi jelszavadat használja.',
      readonly: 'A jelszavad jelenleg nem módosítható, mert csak vállalati kapcsolattal tudsz belépni.',
      successMessage__set: 'A jelszavad beállítottuk.',
      successMessage__signOutOfOtherSessions: 'Minden más eszköz kijelentkeztetve.',
      successMessage__update: 'A jelszavad frissítésre került.',
      title__set: 'Jelszó beállítása',
      title__update: 'Jelszó frissítése',
    },
    phoneNumberPage: {
      infoText:
        'Egy szöveges üzenetet küldünk a visszaigazoló kóddal erre a számra. Az üzenet és az adatforgalom díjai érvényesek lehetnek.',
      removeResource: {
        messageLine1: '{{identifier}} el lesz távolítva ebből a fiókból.',
        messageLine2: 'Nem fogsz tudni többet bejelentkezni ezzel a telefonszámmal.',
        successMessage: '{{phoneNumber}} el lett távolítva a fiókodból.',
        title: 'Telefonszám eltávolítása',
      },
      successMessage: '{{identifier}} hozzá lett adva a fiókodhoz.',
      title: 'Telefonszám hozzáadása',
      verifySubtitle: 'Írd be a visszaigazóló kódot, amit a(z) {{identifier}} számra küldtünk.',
      verifyTitle: 'Telefonszám visszaigazolása',
    },
    profilePage: {
      fileDropAreaHint: 'Ajánlott méret 1:1, 10MB-ig.',
      imageFormDestructiveActionSubtitle: 'Eltávolítás',
      imageFormSubtitle: 'Feltöltés',
      imageFormTitle: 'Profil kép',
      readonly: 'A profilod adatai, vállalati kapcsolatból származnak, így nem módosíthatóak.',
      successMessage: 'A profilod frissítve.',
      title: 'Profil frissítése',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Kijelentkezés az eszközről',
        title: 'Aktív eszközök',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Próbáld újra',
        actionLabel__reauthorize: 'Engedélyezd most',
        destructiveActionTitle: 'Eltávolítás',
        primaryButton: 'Fiók összekötése',
        subtitle__reauthorize:
          'A szükséges hatáskörök megváltozták, előfordulhat, hogy limitált funkcionalitást tapasztalhatsz. Kérlek, újra engedélyezd az alkalmazást, hogy elkerüld a hibákat.',
        title: 'Kapcsolt fiókok',
      },
      dangerSection: {
        deleteAccountButton: 'Fiók törlése',
        title: 'Fiók törlése',
      },
      emailAddressesSection: {
        destructiveAction: 'Email eltávolítása',
        detailsAction__nonPrimary: 'Beállítás elsődlegesként',
        detailsAction__primary: 'Visszaigazolás befejezése',
        detailsAction__unverified: 'Visszaigazolás',
        primaryButton: 'Email cím hozzáadása',
        title: 'Email címek',
      },
      enterpriseAccountsSection: {
        title: 'Vállalati fiókok',
      },
      headerTitle__account: 'Profil adatok',
      headerTitle__security: 'Biztonság',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Újra generálás',
          headerTitle: 'Tartalék kódok',
          subtitle__regenerate:
            'Kérj egy új biztonságos tartalék kódokat. Az előző kódok törlésre kerülnek, és nem lesznek használhatók.',
          title__regenerate: 'Tartalék kódok újragenerálása',
        },
        phoneCode: {
          actionLabel__setDefault: 'Beállítás alapértelmezettként',
          destructiveActionLabel: 'Eltávolítás',
        },
        primaryButton: 'Kétlépcsős azonosítás hozzáadása',
        title: 'Két lépcsős azonosítás',
        totp: {
          destructiveActionTitle: 'Eltávolítás',
          headerTitle: 'Hitelesítő alkalmazás',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Eltávolítás',
        menuAction__rename: 'Átnevezés',
        title: 'Passkey-k',
      },
      passwordSection: {
        primaryButton__setPassword: 'Jelszó beállítása',
        primaryButton__updatePassword: 'Jelszó frissítése',
        title: 'Jelszó',
      },
      phoneNumbersSection: {
        destructiveAction: 'Teleofnszám eltávolítása',
        detailsAction__nonPrimary: 'Beállítás elsődlegesként',
        detailsAction__primary: 'Visszaigazolás befejezése',
        detailsAction__unverified: 'Teleofnszám visszaigazolása',
        primaryButton: 'Telefonszám hozzáadása',
        title: 'Telefonszámok',
      },
      profileSection: {
        primaryButton: 'Profil frissítése',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Felhasználónév beállítása',
        primaryButton__updateUsername: 'Felhasználónév frissítése',
        title: 'Felhasználónév',
      },
      web3WalletsSection: {
        destructiveAction: 'Tárca eltávolítása',
        primaryButton: 'Web3 tárcák',
        title: 'Web3 tárcák',
      },
    },
    usernamePage: {
      successMessage: 'A felhasználóneved frissítve.',
      title__set: 'Felhasználónév beállítása',
      title__update: 'Felasználónév frissítése',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} el lesz távolítva ebből a fiókból.',
        messageLine2: 'Nem fogod tudni használni a bejelentkezéshez, ezt a web3 tárcát.',
        successMessage: '{{web3Wallet}} eltávolítva a fiókodból.',
        title: 'Web3 tárca eltávolítása',
      },
      subtitle__availableWallets: 'Válaszd ki a web3 tárcát, amit hozzá szeretnél adni a fiókodhoz.',
      subtitle__unavailableWallets: 'Nincs elérhető web3 tárca.',
      successMessage: 'A tárca sikeresen hozzáadva a fiókodhoz.',
      title: 'Web3 tárca hozzáadása',
    },
  },
} as const;
