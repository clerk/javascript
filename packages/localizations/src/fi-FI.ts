import type { LocalizationResource } from '@clerk/types';

export const fiFI: LocalizationResource = {
  locale: 'fi-FI',
  backButton: 'Takaisin',
  badge__default: 'Oletus',
  badge__otherImpersonatorDevice: 'Toinen jäljitelty laite',
  badge__primary: 'Ensisijainen',
  badge__requiresAction: 'Vaaditaan toimia',
  badge__thisDevice: 'Tämä laite',
  badge__unverified: 'Vahvistamaton',
  badge__userDevice: 'Käyttäjän laite',
  badge__you: 'Sinä',
  createOrganization: {
    formButtonSubmit: 'Luo organisaatio',
    invitePage: {
      formButtonReset: 'Ohita',
    },
    title: 'Luo organisaatio',
  },
  dates: {
    lastDay: "Eilen klo {{ date | timeString('fi-FI') }}",
    next6Days: "{{ date | weekday('fi-FI','long') }} klo {{ date | timeString('fi-FI') }}",
    nextDay: "Huomenna klo {{ date | timeString('fi-FI') }}",
    numeric: "{{ date | numeric('fi-FI') }}",
    previous6Days: "Viime {{ date | weekday('fi-FI','long') }} klo {{ date | timeString('fi-FI') }}",
    sameDay: "Tänään klo {{ date | timeString('fi-FI') }}",
  },
  dividerText: 'tai',
  footerActionLink__useAnotherMethod: 'Käytä toista tapaa',
  footerPageLink__help: 'Apua',
  footerPageLink__privacy: 'Yksityisyys',
  footerPageLink__terms: 'Ehdot',
  formButtonPrimary: 'Jatka',
  formButtonPrimary__verify: 'Vahvista',
  formFieldAction__forgotPassword: 'Unohditko salasanasi?',
  formFieldError__matchingPasswords: 'Salasanat täsmäävät.',
  formFieldError__notMatchingPasswords: 'Salasanat eivät täsmää.',
  formFieldError__verificationLinkExpired: 'Vahvistuslinkki on vanhentunut. Pyydä uusi linkki.',
  formFieldHintText__optional: 'Valinnainen',
  formFieldHintText__slug: 'Slug on luettava tunniste, joka on oltava yksilöllinen. Sitä käytetään usein URL-osoitteissa.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses: 'esimerkki@domain.fi, esimerkki2@domain.fi',
  formFieldInputPlaceholder__firstName: '',
  formFieldInputPlaceholder__lastName: '',
  formFieldInputPlaceholder__organizationDomain: '',
  formFieldInputPlaceholder__organizationDomainEmailAddress: '',
  formFieldInputPlaceholder__organizationName: '',
  formFieldInputPlaceholder__organizationSlug: 'minun-org',
  formFieldInputPlaceholder__password: '',
  formFieldInputPlaceholder__phoneNumber: '',
  formFieldInputPlaceholder__username: '',
  formFieldLabel__automaticInvitations: 'Ota automaattiset kutsut käyttöön tälle verkkotunnukselle',
  formFieldLabel__backupCode: 'Varakoodi',
  formFieldLabel__confirmDeletion: 'Vahvistus',
  formFieldLabel__confirmPassword: 'Vahvista salasana',
  formFieldLabel__currentPassword: 'Nykyinen salasana',
  formFieldLabel__emailAddress: 'Sähköpostiosoite',
  formFieldLabel__emailAddress_username: 'Sähköpostiosoite tai käyttäjänimi',
  formFieldLabel__emailAddresses: 'Sähköpostiosoitteet',
  formFieldLabel__firstName: 'Etunimi',
  formFieldLabel__lastName: 'Sukunimi',
  formFieldLabel__newPassword: 'Uusi salasana',
  formFieldLabel__organizationDomain: 'Verkkotunnus',
  formFieldLabel__organizationDomainDeletePending: 'Poista odottavat kutsut ja ehdotukset',
  formFieldLabel__organizationDomainEmailAddress: 'Vahvistussähköpostiosoite',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Syötä sähköpostiosoite tälle verkkotunnukselle saadaksesi koodin ja vahvistaaksesi tämän verkkotunnuksen.',
  formFieldLabel__organizationName: 'Nimi',
  formFieldLabel__organizationSlug: 'Slug',
  formFieldLabel__passkeyName: 'Pääsyavaimen nimi',
  formFieldLabel__password: 'Salasana',
  formFieldLabel__phoneNumber: 'Puhelinnumero',
  formFieldLabel__role: 'Rooli',
  formFieldLabel__signOutOfOtherSessions: 'Kirjaudu ulos kaikista muista laitteista',
  formFieldLabel__username: 'Käyttäjänimi',
  impersonationFab: {
    action__signOut: 'Kirjaudu ulos',
    title: 'Kirjautuneena käyttäjänä {{identifier}}',
  },
  maintenanceMode:
    "Olemme tällä hetkellä huoltotilassa, mutta älä huoli, se ei kestä kauempaa kuin muutama minuutti.",
  membershipRole__admin: 'Ylläpitäjä',
  membershipRole__basicMember: 'Jäsen',
  membershipRole__guestMember: 'Vieras',
  organizationList: {
    action__createOrganization: 'Luo organisaatio',
    action__invitationAccept: 'Liity',
    action__suggestionsAccept: 'Pyydä liittymistä',
    createOrganization: 'Luo organisaatio',
    invitationAcceptedLabel: 'Liittynyt',
    subtitle: 'jatkaaksesi kohteeseen {{applicationName}}',
    suggestionsAcceptedLabel: 'Odottaa hyväksyntää',
    title: 'Valitse tili',
    titleWithoutPersonal: 'Valitse organisaatio',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Automaattiset kutsut',
    badge__automaticSuggestion: 'Automaattiset ehdotukset',
    badge__manualInvitation: 'Ei automaattista liittymistä',
    badge__unverified: 'Vahvistamaton',
    createDomainPage: {
      subtitle:
        'Lisää verkkotunnus vahvistaaksesi. Tämän verkkotunnuksen sähköpostiosoitteilla varustetut käyttäjät voivat liittyä organisaatioon automaattisesti tai pyytää liittymistä.',
      title: 'Lisää verkkotunnus',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Kutsuja ei voitu lähettää. Seuraaville sähköpostiosoitteille on jo odottavia kutsuja: {{email_addresses}}.',
      formButtonPrimary__continue: 'Lähetä kutsuja',
      selectDropdown__role: 'Valitse rooli',
      subtitle: 'Kirjoita tai liitä yksi tai useampi sähköpostiosoite, erotettuna välilyönneillä tai pilkuilla.',
      successMessage: 'Kutsut lähetetty onnistuneesti',
      title: 'Kutsu uusia jäseniä',
    },
    membersPage: {
      action__invite: 'Kutsu',
      activeMembersTab: {
        menuAction__remove: 'Poista jäsen',
        tableHeader__actions: '',
        tableHeader__joined: 'Liittynyt',
        tableHeader__role: 'Rooli',
        tableHeader__user: 'Käyttäjä',
      },
      detailsTitle__emptyRow: 'Ei jäseniä näytettäväksi',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Kutsu käyttäjiä yhdistämällä sähköpostiverkkotunnus organisaatioosi. Kaikki, jotka rekisteröityvät vastaavalla sähköpostiverkkotunnuksella, voivat liittyä organisaatioon milloin tahansa.',
          headerTitle: 'Automaattiset kutsut',
          primaryButton: 'Hallitse vahvistettuja verkkotunnuksia',
        },
        table__emptyRow: 'Ei kutsuja näytettäväksi',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Peruuta kutsu',
        tableHeader__invited: 'Kutsuttu',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Käyttäjät, jotka rekisteröityvät vastaavalla sähköpostiverkkotunnuksella, voivat nähdä ehdotuksen liittymisestä organisaatioosi.',
          headerTitle: 'Automaattiset ehdotukset',
          primaryButton: 'Hallitse vahvistettuja verkkotunnuksia',
        },
        menuAction__approve: 'Hyväksy',
        menuAction__reject: 'Hylkää',
        tableHeader__requested: 'Pyydetty pääsy',
        table__emptyRow: 'Ei pyyntöjä näytettäväksi',
      },
      start: {
        headerTitle__invitations: 'Kutsut',
        headerTitle__members: 'Jäsenet',
        headerTitle__requests: 'Pyyntöjä',
      },
    },
    navbar: {
      description: 'Hallitse organisaatiotasi.',
      general: 'Yleinen',
      members: 'Jäsenet',
      title: 'Organisaatio',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Kirjoita "{{organizationName}}" jatkaaksesi.',
          messageLine1: 'Oletko varma, että haluat poistaa tämän organisaation?',
          messageLine2: 'Tämä toiminto on pysyvä ja peruuttamaton.',
          successMessage: 'Olet poistanut organisaation.',
          title: 'Poista organisaatio',
        },
        leaveOrganization: {
          actionDescription: 'Kirjoita "{{organizationName}}" jatkaaksesi.',
          messageLine1:
            'Oletko varma, että haluat poistua tästä organisaatiosta? Menetät pääsyn tähän organisaatioon ja sen sovelluksiin.',
          messageLine2: 'Tämä toiminto on pysyvä ja peruuttamaton.',
          successMessage: 'Olet poistunut organisaatiosta.',
          title: 'Poistu organisaatiosta',
        },
        title: 'Vaara',
      },
      domainSection: {
        menuAction__manage: 'Hallitse',
        menuAction__remove: 'Poista',
        menuAction__verify: 'Vahvista',
        primaryButton: 'Lisää verkkotunnus',
        subtitle:
          'Salli käyttäjien liittyä organisaatioon automaattisesti tai pyytää liittymistä vahvistetun sähköpostiverkkotunnuksen perusteella.',
        title: 'Vahvistetut verkkotunnukset',
      },
      successMessage: 'Organisaatiota on päivitetty.',
      title: 'Päivitä profiili',
    },
    removeDomainPage: {
      messageLine1: 'Sähköpostiverkkotunnus {{domain}} poistetaan.',
      messageLine2: 'Käyttäjät eivät voi liittyä organisaatioon automaattisesti tämän jälkeen.',
      successMessage: '{{domain}} on poistettu.',
      title: 'Poista verkkotunnus',
    },
    start: {
      headerTitle__general: 'Yleinen',
      headerTitle__members: 'Jäsenet',
      profileSection: {
        primaryButton: 'Päivitä profiili',
        title: 'Organisaation profiili',
        uploadAction__title: 'Logo',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Tämän verkkotunnuksen poistaminen vaikuttaa kutsuttuihin käyttäjiin.',
        removeDomainActionLabel__remove: 'Poista verkkotunnus',
        removeDomainSubtitle: 'Poista tämä verkkotunnus vahvistetuista verkkotunnuksistasi',
        removeDomainTitle: 'Poista verkkotunnus',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Käyttäjät kutsutaan automaattisesti liittymään organisaatioon rekisteröityessään ja voivat liittyä milloin tahansa.',
        automaticInvitationOption__label: 'Automaattiset kutsut',
        automaticSuggestionOption__description:
          'Käyttäjät saavat ehdotuksen liittymisestä, mutta heidän on saatava ylläpitäjän hyväksyntä ennen kuin he voivat liittyä organisaatioon.',
        automaticSuggestionOption__label: 'Automaattiset ehdotukset',
        calloutInfoLabel: 'Enrollment-tilan muuttaminen vaikuttaa vain uusiin käyttäjiin.',
        calloutInvitationCountLabel: 'Käyttäjille lähetetyt odottavat kutsut: {{count}}',
        calloutSuggestionCountLabel: 'Käyttäjille lähetetyt odottavat ehdotukset: {{count}}',
        manualInvitationOption__description: 'Käyttäjiä voidaan kutsua vain manuaalisesti organisaatioon.',
        manualInvitationOption__label: 'Ei automaattista liittymistä',
        subtitle: 'Valitse, miten tämän verkkotunnuksen käyttäjät voivat liittyä organisaatioon.',
      },
      start: {
        headerTitle__danger: 'Vaara',
        headerTitle__enrollment: 'Liittymisvaihtoehdot',
      },
      subtitle: 'Verkkotunnus {{domain}} on nyt vahvistettu. Jatka valitsemalla liittymistila.',
      title: 'Päivitä {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Syötä sähköpostiosoitteeseesi lähetetty vahvistuskoodi',
      formTitle: 'Vahvistuskoodi',
      resendButton: 'Etkö saanut koodia? Lähetä uudelleen',
      subtitle: 'Verkkotunnus {{domainName}} on vahvistettava sähköpostitse.',
      subtitleVerificationCodeScreen: 'Vahvistuskoodi lähetettiin osoitteeseen {{emailAddress}}. Syötä koodi jatkaaksesi.',
      title: 'Vahvista verkkotunnus',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Luo organisaatio',
    action__invitationAccept: 'Liity',
    action__manageOrganization: 'Hallitse',
    action__suggestionsAccept: 'Pyydä liittymistä',
    notSelected: 'Ei valittua organisaatiota',
    personalWorkspace: 'Henkilökohtainen tili',
    suggestionsAcceptedLabel: 'Odottaa hyväksyntää',
  },
  paginationButton__next: 'Seuraava',
  paginationButton__previous: 'Edellinen',
  paginationRowText__displaying: 'Näytetään',
  paginationRowText__of: 'yhteensä',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Lisää tili',
      action__signOutAll: 'Kirjaudu ulos kaikista tileistä',
      subtitle: 'Valitse tili, jolla haluat jatkaa.',
      title: 'Valitse tili',
    },
    alternativeMethods: {
      actionLink: 'Hanki apua',
      actionText: 'Eikö sinulla ole näitä?',
      blockButton__backupCode: 'Käytä varakoodia',
      blockButton__emailCode: 'Lähetä koodi sähköpostitse',
      blockButton__emailLink: 'Lähetä linkki sähköpostitse',
      blockButton__passkey: 'Kirjaudu sisään pääsyavaimellasi',
      blockButton__password: 'Kirjaudu sisään salasanallasi',
      blockButton__phoneCode: 'Lähetä SMS-koodi osoitteeseen {{identifier}}',
      blockButton__totp: 'Käytä todennussovellustasi',
      getHelp: {
        blockButton__emailSupport: 'Sähköpostituki',
        content:
          'Jos sinulla on vaikeuksia kirjautua tilillesi, lähetä meille sähköpostia, niin autamme sinua palauttamaan pääsyn tiliisi mahdollisimman pian.',
        title: 'Hanki apua',
      },
      subtitle: 'Ongelmia? Voit kirjautua sisään millä tahansa näistä tavoista.',
      title: 'Käytä toista tapaa',
    },
    backupCodeMfa: {
      subtitle: 'Varakoodi on se, jonka sait asettaessasi kaksivaiheisen todennuksen.',
      title: 'Syötä varakoodi',
    },
    emailCode: {
      formTitle: 'Vahvistuskoodi',
      resendButton: 'Etkö saanut koodia? Lähetä uudelleen',
      subtitle: 'jatkaaksesi kohteeseen {{applicationName}}',
      title: 'Tarkista sähköpostisi',
    },
    emailLink: {
      expired: {
        subtitle: 'Palaa alkuperäiseen välilehteen jatkaaksesi.',
        title: 'Tämä vahvistuslinkki on vanhentunut',
      },
      failed: {
        subtitle: 'Palaa alkuperäiseen välilehteen jatkaaksesi.',
        title: 'Tämä vahvistuslinkki on virheellinen',
      },
      formSubtitle: 'Käytä sähköpostiisi lähetettyä vahvistuslinkkiä',
      formTitle: 'Vahvistuslinkki',
      loading: {
        subtitle: 'Sinut ohjataan pian',
        title: 'Kirjaudutaan sisään...',
      },
      resendButton: 'Et saanut linkkiä? Lähetä uudelleen',
      subtitle: 'jatkaaksesi kohteeseen {{applicationName}}',
      title: 'Tarkista sähköpostisi',
      unusedTab: {
        title: 'Voit sulkea tämän välilehden',
      },
      verified: {
        subtitle: 'Sinut ohjataan pian',
        title: 'Kirjautuminen onnistui',
      },
      verifiedSwitchTab: {
        subtitle: 'Palaa alkuperäiseen välilehteen jatkaaksesi',
        subtitleNewTab: 'Palaa uuteen välilehteen jatkaaksesi',
        titleNewTab: 'Kirjautunut toiseen välilehteen',
      },
      clientMismatch: {
        subtitle:
          'Jatkaaksesi avaa vahvistuslinkki laitteella ja selaimella, josta aloitit kirjautumisen',
        title: 'Vahvistuslinkki on virheellinen tälle laitteelle',
      },
    },
    forgotPassword: {
      formTitle: 'Nollaa salasana',
      resendButton: 'Etkö saanut koodia? Lähetä uudelleen',
      subtitle: 'nollataksesi salasanasi',
      subtitle_email: 'Syötä ensin sähköpostiisi lähetetty koodi',
      subtitle_phone: 'Syötä ensin puhelimeesi lähetetty koodi',
      title: 'Nollaa salasana',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Nollaa salasanasi',
      label__alternativeMethods: 'tai kirjaudu sisään toisella tavalla',
      title: 'Unohditko salasanasi?',
    },
    noAvailableMethods: {
      message: 'Kirjautuminen ei onnistu. Käytettävissä ei ole yhtään todennusmenetelmää.',
      subtitle: 'Tapahtui virhe',
      title: 'Ei voi kirjautua',
    },
    passkey: {
      subtitle: 'Käyttämällä pääsyavaintasi vahvistat, että olet se joka väität olevasi. Laite voi pyytää sormenjälkeäsi, kasvojasi tai näytön lukitusta.',
      title: 'Käytä pääsyavaintasi',
    },
    password: {
      actionLink: 'Käytä toista tapaa',
      subtitle: 'Syötä tilisi salasana',
      title: 'Syötä salasanasi',
    },
    passwordPwned: {
      title: 'Salasana kompromisoitu',
    },
    phoneCode: {
      formTitle: 'Vahvistuskoodi',
      resendButton: 'Etkö saanut koodia? Lähetä uudelleen',
      subtitle: 'jatkaaksesi kohteeseen {{applicationName}}',
      title: 'Tarkista puhelimesi',
    },
    phoneCodeMfa: {
      formTitle: 'Vahvistuskoodi',
      resendButton: 'Etkö saanut koodia? Lähetä uudelleen',
      subtitle: 'Syötä jatkaaksesi puhelimeesi lähetetty vahvistuskoodi',
      title: 'Tarkista puhelimesi',
    },
    resetPassword: {
      formButtonPrimary: 'Nollaa salasana',
      requiredMessage: 'Turvallisuussyistä on tarpeen nollata salasanasi.',
      successMessage: 'Salasanasi on vaihdettu onnistuneesti. Kirjaudutaan sisään, odota hetki.',
      title: 'Aseta uusi salasana',
    },
    resetPasswordMfa: {
      detailsLabel: 'Ennen salasanan nollaamista on varmistettava henkilöllisyytesi.',
    },
    start: {
      actionLink: 'Rekisteröidy',
      actionLink__use_email: 'Käytä sähköpostia',
      actionLink__use_email_username: 'Käytä sähköpostia tai käyttäjänimeä',
      actionLink__use_passkey: 'Käytä pääsyavainta',
      actionLink__use_phone: 'Käytä puhelinta',
      actionLink__use_username: 'Käytä käyttäjänimeä',
      actionText: 'Eikö sinulla ole tiliä?',
      subtitle: 'jatkaaksesi kohteeseen {{applicationName}}',
      title: 'Kirjaudu sisään',
    },
    totpMfa: {
      formTitle: 'Todennuskoodi',
      subtitle: 'Syötä todennuskoodi autentikointisovelluksestasi',
      title: 'Kaksivaiheinen todennus',
    },
  },
  signInEnterPasswordTitle: 'Syötä salasanasi',
  signUp: {
    continue: {
      actionLink: 'Kirjaudu sisään',
      actionText: 'Onko sinulla jo tili?',
      subtitle: 'Täytä loput tiedot jatkaaksesi.',
      title: 'Täytä puuttuvat kentät.'
    },
    emailCode: {
      formSubtitle: 'Syötä sähköpostiisi lähetetty koodi',
      formTitle: 'Vahvistuskoodi',
      resendButton: 'Etkö saanut koodia? Lähetä uudelleen',
      subtitle: 'Syötä sähköpostiisi lähetetty koodi jatkaaksesi.',
      title: 'Tarkista sähköpostisi'
    },
    emailLink: {
      formSubtitle: 'Käytä sähköpostiisi lähetettyä vahvistuslinkkiä',
      formTitle: 'Vahvistuslinkki',
      loading: {
        title: 'Rekisteröidytään...',
      },
      resendButton: 'Etkö saanut linkkiä? Lähetä uudelleen',
      subtitle: 'jatkaaksesi kohteeseen {{applicationName}}',
      title: 'Vahvista sähköpostisi',
      verified: {
        title: 'Rekisteröityminen onnistui',
      },
      verifiedSwitchTab: {
        subtitle: 'Palaa alkuperäiseen välilehteen jatkaaksesi',
        subtitleNewTab: 'Palaa uuteen välilehteen jatkaaksesi',
        title: 'Rekisteröitynyt toiseen välilehteen',
      },
      clientMismatch: {
        subtitle: 'Jatkaaksesi avaa vahvistuslinkki laitteella ja selaimella, josta aloitit rekisteröitymisen',
        title: 'Vahvistuslinkki on virheellinen tälle laitteelle',
      },
    },
    phoneCode: {
      formSubtitle: 'Syötä puhelimeesi lähetetty koodi',
      formTitle: 'Vahvistuskoodi',
      resendButton: 'Etkö saanut koodia? Lähetä uudelleen',
      subtitle: 'Syötä puhelimeesi lähetetty koodi jatkaaksesi.',
      title: 'Tarkista puhelimesi',
    },
    start: {
      actionLink: 'Kirjaudu sisään',
      actionText: 'Onko sinulla jo tili?',
      subtitle: 'Tervetuloa! Luo tili jatkaaksesi.',
      title: 'Luo tili'
    },
  },
  socialButtonsBlockButton: 'Jatka palvelun {{provider|titleize}} avulla',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Rekisteröityminen epäonnistui epäonnistuneiden tietoturvatarkistusten vuoksi. Päivitä sivu ja yritä uudelleen tai ota yhteyttä tukeen.',
    captcha_unavailable:
      'Rekisteröityminen epäonnistui, koska botin vahvistus epäonnistui. Päivitä sivu ja yritä uudelleen tai ota yhteyttä tukeen.',
    form_code_incorrect: '',
    form_identifier_exists: '',
    form_identifier_exists__email_address: 'Tämä sähköpostiosoite on jo käytössä. Kokeile toista.',
    form_identifier_exists__phone_number: 'Tämä puhelinnumero on jo käytössä. Kokeile toista.',
    form_identifier_exists__username: 'Tämä käyttäjänimi on jo käytössä. Kokeile toista.',
    form_identifier_not_found: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'Sähköpostiosoiteen tulee olla kelvollinen.',
    form_param_format_invalid__phone_number: 'Puhelinnumeron on oltava kelvollisessa kansainvälisessä muodossa',
    form_param_max_length_exceeded__first_name: 'Etunimi saa olla enintään 256 merkkiä pitkä.',
    form_param_max_length_exceeded__last_name: 'Sukunimi saa olla enintään 256 merkkiä pitkä.',
    form_param_max_length_exceeded__name: 'Nimi saa olla enintään 256 merkkiä pitkä.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'Salasana ei ole riittävän vahva.',
    form_password_pwned: 'Salasana on ollut osallisena tietovuodossa. Valitse toinen salasana.',
    form_password_pwned__sign_in: 'Salasana on ollut osallisena tietovuodossa. Vaihdathan salasanasi.',
    form_password_size_in_bytes_exceeded: 'Salasanasi on ylittänyt sallitun tavumäärän, lyhennä sitä tai poista joitain erikoismerkkejä.',
    form_password_validation_failed: 'Väärä salasana.',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: 'Et voi poistaa viimeistä henkilöllisyyttäsi.',
    not_allowed_access: '',
    passkey_already_exists: 'Pääsyavain on jo rekisteröity tähän laitteeseen.',
    passkey_not_supported: 'Pääsyavain ei ole tuettu tällä laitteella.',
    passkey_pa_not_supported: 'Rekisteröinti vaatii alustan autentikaattorin, mutta laite ei tue sitä.',
    passkey_registration_cancelled: 'Pääsyavaimen lisääminen peruutettiin tai aikakatkaistiin.',
    passkey_retrieval_cancelled: 'Pääsyavaimella kirjautuminen peruutettiin tai aikakatkaistiin.',
    passwordComplexity: {
      maximumLength: 'enintään {{length}} merkkiä',
      minimumLength: 'vähintään {{length}} merkkiä',
      requireLowercase: 'pieni kirjain',
      requireNumbers: 'numero',
      requireSpecialCharacter: 'erikoismerkki',
      requireUppercase: 'iso kirjain',
      sentencePrefix: 'Salasanan on sisällettävä',
    },
    phone_number_exists: 'Tämä puhelinnumero on jo käytössä. Kokeile toista.',
    zxcvbn: {
      couldBeStronger: 'Salasanasi toimii, mutta se voisi olla vahvempi. Kokeile lisätä erikoismerkkejä tai numeroita.',
      goodPassword: 'Salasanasi täyttää kaikki tarvittavat vaatimukset.',
      notEnough: 'Salasanasi ei ole riittävän vahva.',
      suggestions: {
        allUppercase: 'Käytä isoja kirjaimia, mutta ei kaikkia kirjaimia.',
        anotherWord: 'Älä käytä yleisiä sanoja.',
        associatedYears: 'Älä käytä vuosilukuja, jotka liittyvät sinuun.',
        capitalization: 'Käytä isoja ja pieniä kirjaimia.',
        dates: 'Älä käytä päivämääriä.',
        l33t: 'Älä käytä l33t-kieltä.',
        longerKeyboardPattern: 'Vältä pitkiä näppäinkuvioita.',
        noNeed: 'Älä käytä tätä sanaa.',
        pwned: 'Älä käytä salasanaa, joka on ollut osallisena tietovuodossa.',
        recentYears: 'Älä käytä viimeaikaisia vuosilukuja.',
        repeated: 'Älä käytä toistuvia sanoja.',
        reverseWords: 'Älä käytä sanoja takaperin.',
        sequences: 'Vältä peräkkäisiä numeroita tai kirjaimia.',
        useWords: 'Älä käytä yleisiä sanoja.',
      },
      warnings: {
        common: 'Tämä on yleinen salasana.',
        commonNames: 'Yleiset nimet ja sukunimet ovat helppo arvata.',
        dates: 'Päivämäärät ovat helppo arvata.',
        extendedRepeat: 'Toistuvat merkit ovat helppo arvata.',
        keyPattern: 'Näppäinkuvioita on helppo arvata.',
        namesByThemselves: 'Nimet ovat helppo arvata.',
        pwned: 'Tämä salasana on ollut osallisena tietovuodossa.',
        recentYears: 'Viimeaikaiset vuodet ovat helppo arvata.',
        sequences: 'Peräkkäiset numerot ja kirjaimet ovat helppo arvata.',
        similarToCommon: 'Tämä on samanlainen kuin yleinen salasana.',
        simpleRepeat: 'Toistuvat merkit ovat helppo arvata.',
        straightRow: 'Peräkkäiset merkit ovat helppo arvata.',
        topHundred: 'Tämä on yleinen salasana.',
        topTen: 'Tämä on yleinen salasana.',
        userInputs: 'Salasana perustuu käyttäjän syötteisiin.',
        wordByItself: 'Yksittäinen sana on helppo arvata.',
      },
    }
  },
  userButton: {
    action__addAccount: 'Lisää tili',
    action__manageAccount: 'Hallitse tiliä',
    action__signOut: 'Kirjaudu ulos',
    action__signOutAll: 'Kirjaudu ulos kaikista tileistä',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Kopioitu',
      actionLabel__copy: 'Kopioi',
      actionLabel__download: 'Lataa .txt',
      actionLabel__print: 'Tulosta',
      infoText1: 'Varakoodit otetaan käyttöön tälle tilille.',
      infoText2: 'Pidä varakoodit salassa ja säilytä ne turvallisesti. Voit luoda uudelleen varakoodit, jos epäilet, että ne ovat vaarantuneet.',
      subtitle__codelist: 'Säilytä varakoodit turvallisessa paikassa ja pidä ne salassa.',
      successMessage: 'Varakoodit ovat nyt käytössä. Voit käyttää jotakin näistä kirjautuaksesi tilillesi, jos menetät käyttöoikeuden todennuslaitteeseesi. Jokaista koodia voi käyttää vain kerran.',
      successSubtitle: 'Voit käyttää jotakin näistä kirjautuaksesi tilillesi, jos menetät käyttöoikeuden todennuslaitteeseesi.',
      title: 'Lisää varakoodin vahvistus',
      title__codelist: 'Varakoodit',
    },
    connectedAccountPage: {
      formHint: 'Valitse palveluntarjoaja yhdistääksesi tilisi.',
      formHint__noAccounts: 'Ulkoisia tilintarjoajia ei ole saatavilla.',
      removeResource: {
        messageLine1: '{{identifier}} poistetaan tililtäsi.',
        messageLine2:
          'Tämä ei poista tiliäsi palveluntarjoajalta, mutta et voi enää käyttää sitä kirjautumiseen tai muihin toimintoihin tämän tilin kautta.',
        successMessage: '{{connectedAccount}} on poistettu tililtäsi.',
        title: 'Poista yhdistetty tili',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'Palveluntarjoaja on lisätty tilillesi',
      title: 'Lisää yhdistetty tili'
    },
    deletePage: {
      actionDescription: 'Kirjoita "Delete account" poistaaksesi tilisi.',
      confirm: 'Poista tili',
      messageLine1: 'Oletko varma, että haluat poistaa tilisi?',
      messageLine2: 'Tämä toiminto on pysyvä ja peruuttamaton.',
      title: 'Poista tili',
    },
    emailAddressPage: {
      emailCode: {
        formHint:
          'Vahvistuskoodin sisältävä sähköposti lähetetään tähän sähköpostiosoitteeseen.',
        formSubtitle: 'Syötä sähköpostiisi {{identifier}} lähetetty koodi',
        formTitle: 'Vahvistuskoodi',
        resendButton: 'Etkö saanut koodia? Lähetä uudelleen',
        successMessage: 'Sähköpostiosoitteesi {{identifier}} on nyt lisätty tilillesi.'
      },
      emailLink: {
        formHint:
          'Vahvistuslinkki lähetetään tähän sähköpostiosoitteeseen.',
        formSubtitle: 'Käytä sähköpostiisi lähetettyä vahvistuslinkkiä',
        formTitle: 'Vahvistuslinkki',
        resendButton: 'Et saanut linkkiä? Lähetä uudelleen',
        successMessage: 'Sähköpostiosoitteesi {{identifier}} on nyt lisätty tilillesi.'
      },
      removeResource: {
        messageLine1: '{{identifier}} poistetaan tililtäsi.',
        messageLine2:
          'Tämä ei poista sähköpostiosoitettasi, mutta et voi enää käyttää sitä kirjautumiseen tai muihin toimintoihin tämän tilin kautta.',
        successMessage: '{{emailAddress}} on poistettu tililtäsi.',
        title: 'Poista sähköpostiosoite',
      },
      title: 'Lisää sähköpostiosoite',
      verifyTitle: 'Vahvista sähköpostiosoite'
    },
    formButtonPrimary__add: 'Lisää',
    formButtonPrimary__continue: 'Jatka',
    formButtonPrimary__finish: 'Valmis',
    formButtonPrimary__remove: 'Poista',
    formButtonPrimary__save: 'Tallenna',
    formButtonReset: 'Peruuta',
    mfaPage: {
      formHint: 'Valitse todennusmenetelmä.',
      title: 'Lisää kaksivaiheinen todennus'
    },
    mfaPhoneCodePage: {
      backButton: 'Käytä olemassa olevaa numeroa',
      primaryButton__addPhoneNumber: 'Lisää puhelinnumero',
      removeResource: {
        messageLine1: '{{identifier}} ei enää vastaanota vahvistuskoodeja kirjautuessaan sisään.',
        messageLine2: 'Tilisi ei ehkä ole yhtä turvallinen. Haluatko varmasti jatkaa?',
        successMessage: 'SMS-koodin kaksivaiheinen todennus on poistettu {{mfaPhoneCode}}',
        title: 'Poista kaksivaiheinen todennus'
      },
      subtitle__availablePhoneNumbers:
        'Valitse olemassa oleva puhelinnumero rekisteröityäksesi SMS-koodin kaksivaiheiseen todennukseen tai lisää uusi.',
      subtitle__unavailablePhoneNumbers:
        'Ei ole käytettävissä olevia puhelinnumeroita rekisteröityäksesi SMS-koodin kaksivaiheiseen todennukseen, lisää uusi.',
      successMessage1:
        'Kirjautuessasi sinun on annettava vahvistuskoodi, joka on lähetetty tähän puhelinnumeroon lisävaiheena.',
      successMessage2:
        'Tallenna nämä varakoodit ja säilytä ne jossain turvallisessa paikassa. Jos menetät pääsyn todennuslaitteeseesi, voit käyttää varakoodeja kirjautuaksesi sisään.',
      successTitle: 'SMS-koodin todennus on otettu käyttöön',
      title: 'Lisää SMS-koodin todennus'
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Skannaa sen sijaan QR-koodi',
        buttonUnableToScan__nonPrimary: 'Et voi skannata QR-koodia?',
        infoText__ableToScan:
          'Aseta uusi kirjautumistapa todennussovellukseesi ja skannaa seuraava QR-koodi linkittääksesi se tilillesi.',
        infoText__unableToScan: 'Aseta uusi kirjautumistapa todennussovellukseesi ja syötä alla annettu avain.',
        inputLabel__unableToScan1:
          'Varmista, että Aikaperusteiset tai Yksittäiset salasanat on käytössä ja viimeistele tilin linkitys.',
        inputLabel__unableToScan2:
          'Vaihtoehtoisesti, jos todennussovelluksesi tukee TOTP-URI:ta, voit myös kopioida koko URI:n.',
      },
      removeResource: {
        messageLine1: 'Tämän todennussovelluksen avulla ei enää tarvita vahvistuskoodia kirjautuessasi sisään.',
        messageLine2: 'Tilisi ei ehkä ole yhtä turvallinen. Haluatko varmasti jatkaa?',
        successMessage: 'Kaksivaiheinen todennus todennussovelluksen avulla on poistettu.',
        title: 'Poista kaksivaiheinen todennus'
      },
      successMessage:
        'Kaksivaiheinen todennus on nyt otettu käyttöön. Kirjautuessasi sinun on annettava vahvistuskoodi tästä todennussovelluksesta lisävaiheena.',
      title: 'Lisää todennussovellus',
      verifySubtitle: 'Syötä todennuskoodi, jonka todennussovelluksesi on luonut',
      verifyTitle: 'Vahvistuskoodi'
    },
    mobileButton__menu: 'Valikko',
    navbar: {
      account: 'Profiili',
      description: 'Hallitse tilisi tietoja',
      security: 'Turvallisuus',
      title: 'Tili'
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} poistetaan tililtäsi.',
        title: 'Poista pääsyavain'
      },
      subtitle__rename: 'Voit muuttaa pääsyavaimen nimeä helpottaaksesi sen löytämistä.',
      title__rename: 'Nimeä pääsyavain uudelleen'
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Suositellaan kirjautumista ulos kaikista muista laitteista, jotka saattavat käyttää vanhaa salasanaasi.',
      readonly: 'Salasanaa ei voi muuttaa, koska kirjautuminen on mahdollista vain yrityksen yhteyden kautta.',
      successMessage__set: 'Salasanasi on asetettu.',
      successMessage__signOutOfOtherSessions: 'Kaikki muut laitteet on kirjattu ulos.',
      successMessage__update: 'Salasanasi on päivitetty.',
      title__set: 'Aseta salasana',
      title__update: 'Päivitä salasana'
    },
    phoneNumberPage: {
      infoText:
        'Vahvistuskoodin sisältävä tekstiviesti lähetetään tähän puhelinnumeroon. Viesti- ja tiedonsiirtomaksuja saatetaan periä.',
      removeResource: {
        messageLine1: '{{identifier}} poistetaan tililtäsi.',
        messageLine2:
          'Tämä ei poista puhelinnumeroasi, mutta et voi enää käyttää sitä kirjautumiseen tai muihin toimintoihin tämän tilin kautta.',
        successMessage: '{{phoneNumber}} on poistettu tililtäsi.',
        title: 'Poista puhelinnumero'
      },
      successMessage: 'Puhelinnumerosi {{identifier}} on nyt lisätty tilillesi.',
      title: 'Lisää puhelinnumero',
      verifySubtitle: 'Syötä puhelimeesi lähetetty vahvistuskoodi: {{identifier}}',
      verifyTitle: 'Vahvista puhelinnumero'
    },
    profilePage: {
      fileDropAreaHint: 'Suositeltu koko 1:1, enintään 10 Mt.',
      imageFormDestructiveActionSubtitle: 'Poista kuva',
      imageFormSubtitle: 'Lataa kuva',
      imageFormTitle: 'Profiilikuva',
      readonly: 'Profiilitietosi on annettu yrityksen yhteyden kautta eikä niitä voi muuttaa.',
      successMessage: 'Profiilisi on päivitetty.',
      title: 'Päivitä profiili'
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Kirjaudu ulos laitteesta',
        title: 'Aktiiviset laitteet'
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Yritä uudelleen',
        actionLabel__reauthorize: 'Valtuuta nyt',
        destructiveActionTitle: 'Poista',
        primaryButton: 'Yhdistä tili',
        subtitle__reauthorize:
          'Tarvittavat käyttöoikeudet on päivitetty, ja saatat kokea rajoitettua toiminnallisuutta. Valtuuta tämä sovellus välttääksesi mahdolliset ongelmat.',
        title: 'Yhdistetyt tilit'
      },
      dangerSection: {
        deleteAccountButton: 'Poista tili',
        title: 'Poista tili'
      },
      emailAddressesSection: {
        destructiveAction: 'Poista sähköpostiosoite',
        detailsAction__nonPrimary: 'Aseta ensisijaiseksi',
        detailsAction__primary: 'Viimeistele vahvistus',
        detailsAction__unverified: 'Vahvista sähköpostiosoite',
        primaryButton: 'Lisää sähköpostiosoite',
        title: 'Sähköpostiosoitteet'
      },
      enterpriseAccountsSection: {
        title: 'Yritystilit'
      },
      headerTitle__account: 'Tili',
      headerTitle__security: 'Turvallisuus',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Luo uudet',
          headerTitle: 'Varakoodit',
          subtitle__regenerate:
            'Hanki uusi sarja turvallisia varakoodeja. Aiemmat varakoodit poistetaan eivätkä ne ole enää käytettävissä.',
          title__regenerate: 'Luo uudet varakoodit'
        },
        phoneCode: {
          actionLabel__setDefault: 'Aseta oletukseksi',
          destructiveActionLabel: 'Poista',
        },
        primaryButton: 'Lisää kaksivaiheinen todennus',
        title: 'Kaksivaiheinen todennus',
        totp: {
          destructiveActionTitle: 'Poista',
          headerTitle: 'Todennussovellus',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Poista',
        menuAction__rename: 'Nimeä uudelleen',
        title: 'Pääsyavaimet',
      },
      passwordSection: {
        primaryButton__setPassword: 'Aseta salasana',
        primaryButton__updatePassword: 'Päivitä salasana',
        title: 'Salasana'
      },
      phoneNumbersSection: {
        destructiveAction: 'Poista puhelinnumero',
        detailsAction__nonPrimary: 'Aseta ensisijaiseksi',
        detailsAction__primary: 'Viimeistele vahvistus',
        detailsAction__unverified: 'Vahvista puhelinnumero',
        primaryButton: 'Lisää puhelinnumero',
        title: 'Puhelinnumerot'
      },
      profileSection: {
        primaryButton: 'Päivitä profiili',
        title: 'Profiili'
      },
      usernameSection: {
        primaryButton__setUsername: 'Aseta käyttäjänimi',
        primaryButton__updateUsername: 'Päivitä käyttäjänimi',
        title: 'Käyttäjänimi'
      },
      web3WalletsSection: {
        destructiveAction: 'Poista lompakko',
        primaryButton: 'Web3-lompakot',
        title: 'Web3-lompakot'
      },
    },
    usernamePage: {
      successMessage: 'Käyttäjänimesi on päivitetty.',
      title__set: 'Aseta käyttäjänimi',
      title__update: 'Päivitä käyttäjänimi'
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} poistetaan tililtäsi.',
        messageLine2: 'Et voi enää kirjautua sisään tällä web3-lompakolla.',
        successMessage: '{{web3Wallet}} on poistettu tililtäsi.',
        title: 'Poista web3-lompakko'
      },
      subtitle__availableWallets: 'Valitse web3-lompakko yhdistääksesi tilisi.',
      subtitle__unavailableWallets:
        'Ei ole käytettävissä olevia web3-lompakoita yhdistääksesi tilisi.',
      successMessage: 'Web3-lompakko on lisätty tilillesi.',
      title: 'Lisää web3-lompakko'
    }
  }
} as const