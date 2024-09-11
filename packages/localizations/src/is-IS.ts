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

export const isIS: LocalizationResource = {
  locale: 'is-IS',
  backButton: 'Til baka',
  badge__default: 'Sjálfgefið',
  badge__otherImpersonatorDevice: 'Önnur tæki sem herma eftir',
  badge__primary: 'Aðal',
  badge__requiresAction: 'Krefst aðgerða',
  badge__thisDevice: 'Þetta tæki',
  badge__unverified: 'Óstaðfest',
  badge__userDevice: 'Notendatæki',
  badge__you: 'Þú',
  createOrganization: {
    formButtonSubmit: 'Stofna samtök',
    invitePage: {
      formButtonReset: 'Sleppa',
    },
    title: 'Stofna samtök',
  },
  dates: {
    lastDay: "Í gær kl {{ date | timeString('is-IS') }}",
    next6Days: "{{ date | weekday('is-IS','long') }} kl {{ date | timeString('is-IS') }}",
    nextDay: "Á morgun kl {{ date | timeString('is-IS') }}",
    numeric: "{{ date | numeric('is-IS') }}",
    previous6Days: "Síðasta {{ date | weekday('is-IS','long') }} kl {{ date | timeString('is-IS') }}",
    sameDay: "Í dag kl {{ date | timeString('is-IS') }}",
  },
  dividerText: 'eða',
  footerActionLink__useAnotherMethod: 'Nota aðra aðferð',
  footerPageLink__help: 'Hjálp',
  footerPageLink__privacy: 'Persónuvernd',
  footerPageLink__terms: 'Skilmálar',
  formButtonPrimary: 'Halda áfram',
  formButtonPrimary__verify: 'Staðfesta',
  formFieldAction__forgotPassword: 'Gleymt lykilorð?',
  formFieldError__matchingPasswords: 'Lykilorð passa saman.',
  formFieldError__notMatchingPasswords: 'Lykilorð passa ekki saman.',
  formFieldError__verificationLinkExpired: 'Staðfestingartengillinn er útrunninn. Vinsamlegast biðjið um nýjan tengil.',
  formFieldHintText__optional: 'Valfrjálst',
  formFieldHintText__slug:
    'Stubbur (e. slug) er auðlesanlegt auðkenni sem verður að vera einstakt. Það er oft notað í vefslóðum.',
  formFieldInputPlaceholder__backupCode: undefined,
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Eyða aðgangi',
  formFieldInputPlaceholder__emailAddress: undefined,
  formFieldInputPlaceholder__emailAddress_username: undefined,
  formFieldInputPlaceholder__emailAddresses: 'dæmi@netfang.is, dæmi2@netfang.is',
  formFieldInputPlaceholder__firstName: undefined,
  formFieldInputPlaceholder__lastName: undefined,
  formFieldInputPlaceholder__organizationDomain: undefined,
  formFieldInputPlaceholder__organizationDomainEmailAddress: undefined,
  formFieldInputPlaceholder__organizationName: undefined,
  formFieldInputPlaceholder__organizationSlug: 'min-samtok',
  formFieldInputPlaceholder__password: undefined,
  formFieldInputPlaceholder__phoneNumber: undefined,
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations: 'Virkja sjálfvirk boð fyrir þetta lén',
  formFieldLabel__backupCode: 'Öryggiskóði',
  formFieldLabel__confirmDeletion: 'Staðfesting',
  formFieldLabel__confirmPassword: 'Staðfesta lykilorð',
  formFieldLabel__currentPassword: 'Núverandi lykilorð',
  formFieldLabel__emailAddress: 'Netfang',
  formFieldLabel__emailAddress_username: 'Netfang eða notendanafn',
  formFieldLabel__emailAddresses: 'Netföng',
  formFieldLabel__firstName: 'Fornafn',
  formFieldLabel__lastName: 'Eftirnafn',
  formFieldLabel__newPassword: 'Nýtt lykilorð',
  formFieldLabel__organizationDomain: 'Lén',
  formFieldLabel__organizationDomainDeletePending: 'Eyða boðum í bið og tillögum',
  formFieldLabel__organizationDomainEmailAddress: 'Staðfestingarnetfang',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Sláðu inn netfang undir þessu léni til að fá kóða og staðfesta þetta lén.',
  formFieldLabel__organizationName: 'Nafn',
  formFieldLabel__organizationSlug: 'Stubbur (e. slug)',
  formFieldLabel__passkeyName: 'Nafn lykils',
  formFieldLabel__password: 'Lykilorð',
  formFieldLabel__phoneNumber: 'Símanúmer',
  formFieldLabel__role: 'Hlutverk',
  formFieldLabel__signOutOfOtherSessions: 'Skrá út af öllum öðrum tækjum',
  formFieldLabel__username: 'Notendanafn',
  impersonationFab: {
    action__signOut: 'Skrá út',
    title: 'Skráður inn sem {{identifier}}',
  },
  maintenanceMode: 'Við erum nú í viðhaldi, en ekki hafa áhyggjur, það ætti ekki að taka meira en nokkrar mínútur.',
  membershipRole__admin: 'Stjórnandi',
  membershipRole__basicMember: 'Meðlimur',
  membershipRole__guestMember: 'Gestur',
  organizationList: {
    action__createOrganization: 'Stofna samtök',
    action__invitationAccept: 'Ganga í',
    action__suggestionsAccept: 'Biðja um að ganga í',
    createOrganization: 'Stofna samtök',
    invitationAcceptedLabel: 'Gengið í',
    subtitle: 'til að halda áfram í {{applicationName}}',
    suggestionsAcceptedLabel: 'Bíður samþykkis',
    title: 'Veldu reikning',
    titleWithoutPersonal: 'Veldu samtök',
  },
  organizationProfile: {
    badge__automaticInvitation: 'Sjálfvirk boð',
    badge__automaticSuggestion: 'Sjálfvirkar tillögur',
    badge__manualInvitation: 'Engin sjálfvirk skráning',
    badge__unverified: 'Óstaðfest',
    createDomainPage: {
      subtitle:
        'Bættu við léni til að staðfesta. Notendur með netföng undir þessu léni geta gengið í samtökin sjálfkrafa eða beðið um að ganga í.',
      title: 'Bæta við léni',
    },
    invitePage: {
      detailsTitle__inviteFailed:
        'Ekki tókst að senda boðin. Það eru þegar biðboð fyrir eftirfarandi netföng: {{email_addresses}}.',
      formButtonPrimary__continue: 'Senda boð',
      selectDropdown__role: 'Veldu hlutverk',
      subtitle: 'Sláðu inn eða límdu eitt eða fleiri netföng, aðskilin með bilum eða kommum.',
      successMessage: 'Boð send með góðum árangri',
      title: 'Bjóða nýja meðlimi',
    },
    membersPage: {
      action__invite: 'Bjóða',
      activeMembersTab: {
        menuAction__remove: 'Fjarlægja meðlim',
        tableHeader__actions: undefined,
        tableHeader__joined: 'Gengið í',
        tableHeader__role: 'Hlutverk',
        tableHeader__user: 'Notandi',
      },
      detailsTitle__emptyRow: 'Engir meðlimir til að sýna',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Bjóða notendum með því að tengja netfangalén við samtökin þín. Allir sem skrá sig með samsvarandi netfangalén geta gengið í samtökin hvenær sem er.',
          headerTitle: 'Sjálfvirk boð',
          primaryButton: 'Stjórna staðfestum lénum',
        },
        table__emptyRow: 'Engin boð til að sýna',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Afturkalla boð',
        tableHeader__invited: 'Boðið',
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            'Notendur sem skrá sig með samsvarandi netfangalén, munu sjá tillögu um að biðja um að ganga í samtökin þín.',
          headerTitle: 'Sjálfvirkar tillögur',
          primaryButton: 'Stjórna staðfestum lénum',
        },
        menuAction__approve: 'Samþykkja',
        menuAction__reject: 'Hafna',
        tableHeader__requested: 'Beðið um aðgang',
        table__emptyRow: 'Engar beiðnir til að sýna',
      },
      start: {
        headerTitle__invitations: 'Boð',
        headerTitle__members: 'Meðlimir',
        headerTitle__requests: 'Beiðnir',
      },
    },
    navbar: {
      description: 'Stjórna samtökunum þínum.',
      general: 'Almennt',
      members: 'Meðlimir',
      title: 'Samtök',
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription: 'Sláðu inn "{{organizationName}}" hér að neðan til að halda áfram.',
          messageLine1: 'Ertu viss um að þú viljir eyða þessum samtökum?',
          messageLine2: 'Þessi aðgerð er varanleg og óafturkræf.',
          successMessage: 'Þú hefur eytt samtökunum.',
          title: 'Eyða samtökum',
        },
        leaveOrganization: {
          actionDescription: 'Sláðu inn "{{organizationName}}" hér að neðan til að halda áfram.',
          messageLine1:
            'Ertu viss um að þú viljir yfirgefa þessi samtök? Þú munt missa aðgang að þessum samtökum og forritum þeirra.',
          messageLine2: 'Þessi aðgerð er varanleg og óafturkræf.',
          successMessage: 'Þú hefur yfirgefið samtökin.',
          title: 'Yfirgefa samtök',
        },
        title: 'Hætta',
      },
      domainSection: {
        menuAction__manage: 'Stjórna',
        menuAction__remove: 'Eyða',
        menuAction__verify: 'Staðfesta',
        primaryButton: 'Bæta við léni',
        subtitle:
          'Leyfa notendum að ganga í samtökin sjálfkrafa eða biðja um að ganga í byggt á staðfestu netfangaléni.',
        title: 'Staðfest lén',
      },
      successMessage: 'Samtökin hafa verið uppfærð.',
      title: 'Uppfæra prófíl',
    },
    removeDomainPage: {
      messageLine1: 'Netfangalén {{domain}} verður fjarlægt.',
      messageLine2: 'Notendur munu ekki geta gengið í samtökin sjálfkrafa eftir þetta.',
      successMessage: '{{domain}} hefur verið fjarlægt.',
      title: 'Fjarlægja lén',
    },
    start: {
      headerTitle__general: 'Almennt',
      headerTitle__members: 'Meðlimir',
      profileSection: {
        primaryButton: 'Uppfæra prófíl',
        title: 'Prófíll samtaka',
        uploadAction__title: 'Merki',
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel: 'Að fjarlægja þetta lén mun hafa áhrif á boðna notendur.',
        removeDomainActionLabel__remove: 'Fjarlægja lén',
        removeDomainSubtitle: 'Fjarlægja þetta lén úr staðfestum lénum þínum',
        removeDomainTitle: 'Fjarlægja lén',
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          'Notendur eru sjálfkrafa boðnir að ganga í samtökin þegar þeir skrá sig og geta gengið í hvenær sem er.',
        automaticInvitationOption__label: 'Sjálfvirk boð',
        automaticSuggestionOption__description:
          'Notendur fá tillögu um að biðja um að ganga í, en verða að vera samþykktir af stjórnanda áður en þeir geta gengið í samtökin.',
        automaticSuggestionOption__label: 'Sjálfvirkar tillögur',
        calloutInfoLabel: 'Að breyta skráningaraðferð mun aðeins hafa áhrif á nýja notendur.',
        calloutInvitationCountLabel: 'Biðboð send til notenda: {{count}}',
        calloutSuggestionCountLabel: 'Biðtillögur sendar til notenda: {{count}}',
        manualInvitationOption__description: 'Notendur geta aðeins verið boðnir handvirkt í samtökin.',
        manualInvitationOption__label: 'Engin sjálfvirk skráning',
        subtitle: 'Veldu hvernig notendur frá þessu léni geta gengið í samtökin.',
      },
      start: {
        headerTitle__danger: 'Hætta',
        headerTitle__enrollment: 'Skráningarmöguleikar',
      },
      subtitle: 'Lénið {{domain}} er nú staðfest. Haltu áfram með því að velja skráningarmáta.',
      title: 'Uppfæra {{domain}}',
    },
    verifyDomainPage: {
      formSubtitle: 'Sláðu inn staðfestingarkóðann sem sendur var á netfangið þitt',
      formTitle: 'Staðfestingarkóði',
      resendButton: 'Fékkstu ekki kóða? Senda aftur',
      subtitle: 'Lénið {{domainName}} þarf að vera staðfest með tölvupósti.',
      subtitleVerificationCodeScreen:
        'Staðfestingarkóði var sendur á {{emailAddress}}. Sláðu inn kóðann til að halda áfram.',
      title: 'Staðfesta lén',
    },
  },
  organizationSwitcher: {
    action__createOrganization: 'Stofna samtök',
    action__invitationAccept: 'Ganga í',
    action__manageOrganization: 'Stjórna',
    action__suggestionsAccept: 'Biðja um að ganga í',
    notSelected: 'Engin samtök valin',
    personalWorkspace: 'Persónulegur reikningur',
    suggestionsAcceptedLabel: 'Bíður samþykkis',
  },
  paginationButton__next: 'Næsta',
  paginationButton__previous: 'Fyrri',
  paginationRowText__displaying: 'Sýnir',
  paginationRowText__of: 'af',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Bæta við reikningi',
      action__signOutAll: 'Skrá út af öllum reikningum',
      subtitle: 'Veldu reikninginn sem þú vilt halda áfram með.',
      title: 'Veldu reikning',
    },
    alternativeMethods: {
      actionLink: 'Fá hjálp',
      actionText: 'Ertu ekki með neitt af þessu?',
      blockButton__backupCode: 'Nota öryggiskóða',
      blockButton__emailCode: 'Senda kóða á {{identifier}}',
      blockButton__emailLink: 'Senda tengil á {{identifier}}',
      blockButton__passkey: 'Skrá inn með lykli',
      blockButton__password: 'Skrá inn með lykilorði',
      blockButton__phoneCode: 'Senda SMS kóða á {{identifier}}',
      blockButton__totp: 'Nota auðkennisforritið þitt',
      getHelp: {
        blockButton__emailSupport: 'Senda tölvupóst á stuðning',
        content:
          'Ef þú átt í erfiðleikum með að skrá þig inn á reikninginn þinn, sendu okkur tölvupóst og við munum vinna með þér til að endurheimta aðgang eins fljótt og auðið er.',
        title: 'Fá hjálp',
      },
      subtitle: 'Áttu í vandræðum? Þú getur notað einhverja af þessum aðferðum til að skrá þig inn.',
      title: 'Nota aðra aðferð',
    },
    backupCodeMfa: {
      subtitle: 'Öryggiskóðinn þinn er sá sem þú fékkst þegar þú stilltir tveggja þrepa auðkenningu.',
      title: 'Sláðu inn öryggiskóða',
    },
    emailCode: {
      formTitle: 'Staðfestingarkóði',
      resendButton: 'Fékkstu ekki kóða? Senda aftur',
      subtitle: 'til að halda áfram í {{applicationName}}',
      title: 'Athugaðu tölvupóstinn þinn',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Til að halda áfram, opnaðu staðfestingartengilinn á tækinu og vafranum sem þú byrjaðir innskráninguna með',
        title: 'Staðfestingartengill er ógildur fyrir þetta tæki',
      },
      expired: {
        subtitle: 'Farðu aftur í upprunalega flipann til að halda áfram.',
        title: 'Þessi staðfestingartengill er útrunninn',
      },
      failed: {
        subtitle: 'Farðu aftur í upprunalega flipann til að halda áfram.',
        title: 'Þessi staðfestingartengill er ógildur',
      },
      formSubtitle: 'Nota staðfestingartengilinn sem sendur var á tölvupóstinn þinn',
      formTitle: 'Staðfestingartengill',
      loading: {
        subtitle: 'Þú verður fljótlega vísað áfram',
        title: 'Skrá inn...',
      },
      resendButton: 'Fékkstu ekki tengil? Senda aftur',
      subtitle: 'til að halda áfram í {{applicationName}}',
      title: 'Athugaðu tölvupóstinn þinn',
      unusedTab: {
        title: 'Þú getur lokað þessum flipa',
      },
      verified: {
        subtitle: 'Þú verður fljótlega vísað áfram',
        title: 'Tókst að skrá inn',
      },
      verifiedSwitchTab: {
        subtitle: 'Farðu aftur í upprunalega flipann til að halda áfram',
        subtitleNewTab: 'Farðu aftur í nýopnaða flipann til að halda áfram',
        titleNewTab: 'Skráður inn á öðrum flipa',
      },
    },
    forgotPassword: {
      formTitle: 'Endurstilla lykilorð kóða',
      resendButton: 'Fékkstu ekki kóða? Senda aftur',
      subtitle: 'til að endurstilla lykilorðið þitt',
      subtitle_email: 'Fyrst, sláðu inn kóðann sem sendur var á netfangið þitt',
      subtitle_phone: 'Fyrst, sláðu inn kóðann sem sendur var á símann þinn',
      title: 'Endurstilla lykilorð',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Endurstilla lykilorðið þitt',
      label__alternativeMethods: 'Eða, skráðu þig inn með annarri aðferð',
      title: 'Gleymt lykilorð?',
    },
    noAvailableMethods: {
      message: 'Ekki er hægt að halda áfram með innskráningu. Engin tiltæk auðkenningaraðferð.',
      subtitle: 'Villa kom upp',
      title: 'Ekki hægt að skrá inn',
    },
    passkey: {
      subtitle:
        'Að nota lykilinn þinn staðfestir að þú ert það. Tækið þitt gæti beðið um fingrafar, andlit eða skjálás.',
      title: 'Nota lykilinn þinn',
    },
    password: {
      actionLink: 'Nota aðra aðferð',
      subtitle: 'Sláðu inn lykilorðið sem tengist reikningnum þínum',
      title: 'Sláðu inn lykilorðið þitt',
    },
    passwordPwned: {
      title: 'Lykilorð brotið',
    },
    phoneCode: {
      formTitle: 'Staðfestingarkóði',
      resendButton: 'Fékkstu ekki kóða? Senda aftur',
      subtitle: 'til að halda áfram í {{applicationName}}',
      title: 'Athugaðu símann þinn',
    },
    phoneCodeMfa: {
      formTitle: 'Staðfestingarkóði',
      resendButton: 'Fékkstu ekki kóða? Senda aftur',
      subtitle: 'Til að halda áfram, vinsamlegast sláðu inn staðfestingarkóðann sem sendur var á símann þinn',
      title: 'Athugaðu símann þinn',
    },
    resetPassword: {
      formButtonPrimary: 'Endurstilla lykilorð',
      requiredMessage: 'Af öryggisástæðum er nauðsynlegt að endurstilla lykilorðið þitt.',
      successMessage: 'Lykilorðið þitt var endurstillt með góðum árangri. Skrá þig inn, vinsamlegast bíddu augnablik.',
      title: 'Setja nýtt lykilorð',
    },
    resetPasswordMfa: {
      detailsLabel: 'Við þurfum að staðfesta auðkenni þitt áður en við endurstillum lykilorðið þitt.',
    },
    start: {
      actionLink: 'Skrá sig',
      actionLink__use_email: 'Nota netfang',
      actionLink__use_email_username: 'Nota netfang eða notendanafn',
      actionLink__use_passkey: 'Nota lykil í staðinn',
      actionLink__use_phone: 'Nota síma',
      actionLink__use_username: 'Nota notendanafn',
      actionText: 'Ertu ekki með reikning?',
      subtitle: 'Velkomin aftur! Vinsamlegast skráðu þig inn til að halda áfram',
      title: 'Skrá inn í {{applicationName}}',
    },
    totpMfa: {
      formTitle: 'Staðfestingarkóði',
      subtitle: 'Til að halda áfram, vinsamlegast sláðu inn staðfestingarkóðann sem auðkennisforritið þitt bjó til',
      title: 'Tveggja þrepa auðkenning',
    },
  },
  signInEnterPasswordTitle: 'Sláðu inn lykilorðið þitt',
  signUp: {
    continue: {
      actionLink: 'Skrá inn',
      actionText: 'Ertu með reikning?',
      subtitle: 'Vinsamlegast fylltu út eftirfarandi upplýsingar til að halda áfram.',
      title: 'Fylltu út vantar reiti',
    },
    emailCode: {
      formSubtitle: 'Sláðu inn staðfestingarkóðann sem sendur var á netfangið þitt',
      formTitle: 'Staðfestingarkóði',
      resendButton: 'Fékkstu ekki kóða? Senda aftur',
      subtitle: 'Sláðu inn staðfestingarkóðann sem sendur var á netfangið þitt',
      title: 'Staðfesta netfang',
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          'Til að halda áfram, opnaðu staðfestingartengilinn á tækinu og vafranum sem þú byrjaðir skráninguna með',
        title: 'Staðfestingartengill er ógildur fyrir þetta tæki',
      },
      formSubtitle: 'Nota staðfestingartengilinn sem sendur var á netfangið þitt',
      formTitle: 'Staðfestingartengill',
      loading: {
        title: 'Skrá sig...',
      },
      resendButton: 'Fékkstu ekki tengil? Senda aftur',
      subtitle: 'til að halda áfram í {{applicationName}}',
      title: 'Staðfesta netfang',
      verified: {
        title: 'Tókst að skrá sig',
      },
      verifiedSwitchTab: {
        subtitle: 'Farðu aftur í nýopnaða flipann til að halda áfram',
        subtitleNewTab: 'Farðu aftur í fyrri flipann til að halda áfram',
        title: 'Tókst að staðfesta netfang',
      },
    },
    phoneCode: {
      formSubtitle: 'Sláðu inn staðfestingarkóðann sem sendur var á símanúmerið þitt',
      formTitle: 'Staðfestingarkóði',
      resendButton: 'Fékkstu ekki kóða? Senda aftur',
      subtitle: 'Sláðu inn staðfestingarkóðann sem sendur var á símanúmerið þitt',
      title: 'Staðfesta símanúmer',
    },
    start: {
      actionLink: 'Skrá inn',
      actionLink__use_email: 'Nota netfang í staðinn',
      actionLink__use_phone: 'Nota síma í staðinn',
      actionText: 'Ertu með reikning?',
      subtitle: 'Velkomin! Vinsamlegast fylltu út upplýsingar til að byrja.',
      title: 'Stofna reikning',
    },
  },
  socialButtonsBlockButton: 'Halda áfram með {{provider|titleize}}',
  socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
  unstable__errors: {
    captcha_invalid:
      'Skráning mistókst vegna misheppnaðra öryggisstaðfestinga. Vinsamlegast endurhlaðið síðuna til að reyna aftur eða hafið samband við stuðning til að fá frekari aðstoð.',
    captcha_unavailable:
      'Skráning mistókst vegna misheppnaðrar vélmenna staðfestingar. Vinsamlegast endurhlaðið síðuna til að reyna aftur eða hafið samband við stuðning til að fá frekari aðstoð.',
    form_code_incorrect: undefined,
    form_identifier_exists: undefined,
    form_identifier_exists__email_address: 'Þetta netfang er þegar í notkun. Vinsamlegast reyndu annað.',
    form_identifier_exists__phone_number: 'Þetta símanúmer er þegar í notkun. Vinsamlegast reyndu annað.',
    form_identifier_exists__username: 'Þetta notendanafn er þegar í notkun. Vinsamlegast reyndu annað.',
    form_identifier_not_found: undefined,
    form_param_format_invalid: undefined,
    form_param_format_invalid__email_address: 'Netfang verður að vera gilt netfang.',
    form_param_format_invalid__phone_number: 'Símanúmer verður að vera á giltu alþjóðlegu formi',
    form_param_max_length_exceeded__first_name: 'Fornafn má ekki vera lengra en 256 stafir.',
    form_param_max_length_exceeded__last_name: 'Eftirnafn má ekki vera lengra en 256 stafir.',
    form_param_max_length_exceeded__name: 'Nafn má ekki vera lengra en 256 stafir.',
    form_param_nil: undefined,
    form_password_incorrect: undefined,
    form_password_length_too_short: undefined,
    form_password_not_strong_enough: 'Lykilorðið þitt er ekki nógu sterkt.',
    form_password_pwned:
      'Þetta lykilorð hefur fundist sem hluti af öryggisbresti og má ekki nota, vinsamlegast reyndu annað lykilorð.',
    form_password_pwned__sign_in:
      'Þetta lykilorð hefur fundist sem hluti af öryggisbresti og má ekki nota, vinsamlegast endurstilltu lykilorðið þitt.',
    form_password_size_in_bytes_exceeded:
      'Lykilorðið þitt hefur farið yfir hámarksfjölda bæta sem leyfðir eru, vinsamlegast styttu það eða fjarlægðu nokkra sérstafi.',
    form_password_validation_failed: 'Rangt lykilorð',
    form_username_invalid_character: undefined,
    form_username_invalid_length: undefined,
    identification_deletion_failed: 'Þú getur ekki eytt síðasta auðkenni þínu.',
    not_allowed_access: undefined,
    passkey_already_exists: 'Lykill er þegar skráður með þessu tæki.',
    passkey_not_supported: 'Lyklar eru ekki studdir á þessu tæki.',
    passkey_pa_not_supported: 'Skráning krefst vettvangs auðkennis en tækið styður það ekki.',
    passkey_registration_cancelled: 'Skráning lykils var hætt eða rann út.',
    passkey_retrieval_cancelled: 'Staðfesting lykils var hætt eða rann út.',
    passwordComplexity: {
      maximumLength: 'minna en {{length}} stafir',
      minimumLength: '{{length}} eða fleiri stafir',
      requireLowercase: 'lágstaf',
      requireNumbers: 'tölu',
      requireSpecialCharacter: 'sérstaf',
      requireUppercase: 'hástaf',
      sentencePrefix: 'Lykilorðið þitt verður að innihalda',
    },
    phone_number_exists: 'Þetta símanúmer er þegar í notkun. Vinsamlegast reyndu annað.',
    zxcvbn: {
      couldBeStronger: 'Lykilorðið þitt virkar, en gæti verið sterkara. Reyndu að bæta við fleiri stöfum.',
      goodPassword: 'Lykilorðið þitt uppfyllir allar nauðsynlegar kröfur.',
      notEnough: 'Lykilorðið þitt er ekki nógu sterkt.',
      suggestions: {
        allUppercase: 'Stórstafa sum, en ekki alla stafi.',
        anotherWord: 'Bættu við fleiri orðum sem eru minna algeng.',
        associatedYears: 'Forðastu ár sem tengjast þér.',
        capitalization: 'Stórstafa fleiri en fyrsta staf.',
        dates: 'Forðastu dagsetningar og ár sem tengjast þér.',
        l33t: "Forðastu fyrirsjáanlegar stafaskiptingar eins og '@' fyrir 'a'.",
        longerKeyboardPattern: 'Notaðu lengri lyklaborðsmynstur og breyttu sláttarstefnu nokkrum sinnum.',
        noNeed: 'Þú getur búið til sterk lykilorð án þess að nota tákn, tölur eða hástafi.',
        pwned: 'Ef þú notar þetta lykilorð annars staðar, ættir þú að breyta því.',
        recentYears: 'Forðastu nýleg ár.',
        repeated: 'Forðastu endurtekin orð og stafi.',
        reverseWords: 'Forðastu öfug stafsetning algengra orða.',
        sequences: 'Forðastu algengar stafaraðir.',
        useWords: 'Notaðu mörg orð, en forðastu algengar setningar.',
      },
      warnings: {
        common: 'Þetta er algengt lykilorð.',
        commonNames: 'Algeng nöfn og eftirnöfn eru auðvelt að giska á.',
        dates: 'Dagsetningar eru auðvelt að giska á.',
        extendedRepeat: 'Endurtekin stafamynstur eins og "abcabcabc" eru auðvelt að giska á.',
        keyPattern: 'Stutt lyklaborðsmynstur eru auðvelt að giska á.',
        namesByThemselves: 'Einstök nöfn eða eftirnöfn eru auðvelt að giska á.',
        pwned: 'Lykilorðið þitt var afhjúpað í öryggisbresti á netinu.',
        recentYears: 'Nýleg ár eru auðvelt að giska á.',
        sequences: 'Algengar stafaraðir eins og "abc" eru auðvelt að giska á.',
        similarToCommon: 'Þetta er svipað og algengt lykilorð.',
        simpleRepeat: 'Endurteknir stafir eins og "aaa" eru auðvelt að giska á.',
        straightRow: 'Beinar raðir af lyklum á lyklaborðinu eru auðvelt að giska á.',
        topHundred: 'Þetta er oft notað lykilorð.',
        topTen: 'Þetta er mjög oft notað lykilorð.',
        userInputs: 'Það ætti ekki að vera neinar persónulegar eða síðu tengdar upplýsingar.',
        wordByItself: 'Einstök orð eru auðvelt að giska á.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Bæta við reikningi',
    action__manageAccount: 'Stjórna reikningi',
    action__signOut: 'Skrá út',
    action__signOutAll: 'Skrá út af öllum reikningum',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Afritað!',
      actionLabel__copy: 'Afrita allt',
      actionLabel__download: 'Sækja .txt',
      actionLabel__print: 'Prenta',
      infoText1: 'Öryggiskóðar verða virkjaðir fyrir þennan reikning.',
      infoText2:
        'Geymdu öryggiskóðana leynilega og geymdu þá á öruggum stað. Þú getur endurmyndað öryggiskóða ef þú grunar að þeir hafi verið afhjúpaðir.',
      subtitle__codelist: 'Geymdu þá á öruggum stað og haltu þeim leynilegum.',
      successMessage:
        'Öryggiskóðar eru nú virkjaðir. Þú getur notað einn af þessum til að skrá þig inn á reikninginn þinn, ef þú missir aðgang að auðkennis tækinu þínu. Hver kóði getur aðeins verið notaður einu sinni.',
      successSubtitle:
        'Þú getur notað einn af þessum til að skrá þig inn á reikninginn þinn, ef þú missir aðgang að auðkennis tækinu þínu.',
      title: 'Bæta við öryggiskóða staðfestingu',
      title__codelist: 'Öryggiskóðar',
    },
    connectedAccountPage: {
      formHint: 'Veldu þjónustuaðila til að tengja reikninginn þinn.',
      formHint__noAccounts: 'Engir tiltækir ytri reikningsþjónustuaðilar.',
      removeResource: {
        messageLine1: '{{identifier}} verður fjarlægt úr þessum reikningi.',
        messageLine2:
          'Þú munt ekki lengur geta notað þennan tengda reikning og öll háð eiginleikar munu ekki lengur virka.',
        successMessage: '{{connectedAccount}} hefur verið fjarlægt úr reikningnum þínum.',
        title: 'Fjarlægja tengdan reikning',
      },
      socialButtonsBlockButton: '{{provider|titleize}}',
      successMessage: 'Þjónustuaðilinn hefur verið bætt við reikninginn þinn',
      title: 'Bæta við tengdum reikningi',
    },
    deletePage: {
      actionDescription: 'Sláðu inn "Eyða reikningi" hér að neðan til að halda áfram.',
      confirm: 'Eyða reikningi',
      messageLine1: 'Ertu viss um að þú viljir eyða reikningnum þínum?',
      messageLine2: 'Þessi aðgerð er varanleg og óafturkræf.',
      title: 'Eyða reikningi',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Tölvupóstur sem inniheldur staðfestingarkóða verður sendur á þetta netfang.',
        formSubtitle: 'Sláðu inn staðfestingarkóðann sem sendur var á {{identifier}}',
        formTitle: 'Staðfestingarkóði',
        resendButton: 'Fékkstu ekki kóða? Senda aftur',
        successMessage: 'Netfangið {{identifier}} hefur verið bætt við reikninginn þinn.',
      },
      emailLink: {
        formHint: 'Tölvupóstur sem inniheldur staðfestingartengil verður sendur á þetta netfang.',
        formSubtitle: 'Smelltu á staðfestingartengilinn í tölvupóstinum sem sendur var á {{identifier}}',
        formTitle: 'Staðfestingartengill',
        resendButton: 'Fékkstu ekki tengil? Senda aftur',
        successMessage: 'Netfangið {{identifier}} hefur verið bætt við reikninginn þinn.',
      },
      removeResource: {
        messageLine1: '{{identifier}} verður fjarlægt úr þessum reikningi.',
        messageLine2: 'Þú munt ekki lengur geta skráð þig inn með þessu netfangi.',
        successMessage: '{{emailAddress}} hefur verið fjarlægt úr reikningnum þínum.',
        title: 'Fjarlægja netfang',
      },
      title: 'Bæta við netfangi',
      verifyTitle: 'Staðfesta netfang',
    },
    formButtonPrimary__add: 'Bæta við',
    formButtonPrimary__continue: 'Halda áfram',
    formButtonPrimary__finish: 'Ljúka',
    formButtonPrimary__remove: 'Fjarlægja',
    formButtonPrimary__save: 'Vista',
    formButtonReset: 'Hætta við',
    mfaPage: {
      formHint: 'Veldu aðferð til að bæta við.',
      title: 'Bæta við tveggja þrepa auðkenningu',
    },
    mfaPhoneCodePage: {
      backButton: 'Nota núverandi númer',
      primaryButton__addPhoneNumber: 'Bæta við símanúmeri',
      removeResource: {
        messageLine1: '{{identifier}} mun ekki lengur fá staðfestingarkóða við innskráningu.',
        messageLine2: 'Reikningurinn þinn gæti ekki verið eins öruggur. Ertu viss um að þú viljir halda áfram?',
        successMessage: 'SMS kóða tveggja þrepa auðkenning hefur verið fjarlægð fyrir {{mfaPhoneCode}}',
        title: 'Fjarlægja tveggja þrepa auðkenningu',
      },
      subtitle__availablePhoneNumbers:
        'Veldu núverandi símanúmer til að skrá fyrir SMS kóða tveggja þrepa auðkenningu eða bættu við nýju.',
      subtitle__unavailablePhoneNumbers:
        'Engin tiltæk símanúmer til að skrá fyrir SMS kóða tveggja þrepa auðkenningu, vinsamlegast bættu við nýju.',
      successMessage1:
        'Við innskráningu þarftu að slá inn staðfestingarkóða sem sendur er á þetta símanúmer sem viðbótar skref.',
      successMessage2:
        'Vistaðu þessa öryggiskóða og geymdu þá á öruggum stað. Ef þú missir aðgang að auðkennis tækinu þínu, getur þú notað öryggiskóða til að skrá þig inn.',
      successTitle: 'SMS kóða staðfesting virkjað',
      title: 'Bæta við SMS kóða staðfestingu',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Skanna QR kóða í staðinn',
        buttonUnableToScan__nonPrimary: 'Getur ekki skannað QR kóða?',
        infoText__ableToScan:
          'Settu upp nýja innskráningaraðferð í auðkennisforritinu þínu og skannaðu eftirfarandi QR kóða til að tengja það við reikninginn þinn.',
        infoText__unableToScan:
          'Settu upp nýja innskráningaraðferð í auðkennisforritinu þínu og sláðu inn lykilinn hér að neðan.',
        inputLabel__unableToScan1:
          'Gakktu úr skugga um að Tímatengdir eða Einnota lykilorð séu virkjað, og ljúktu síðan við að tengja reikninginn þinn.',
        inputLabel__unableToScan2:
          'Að öðrum kosti, ef auðkennisforritið þitt styður TOTP URI, geturðu einnig afritað fullan URI.',
      },
      removeResource: {
        messageLine1: 'Staðfestingarkóðar frá þessu auðkennisforriti verða ekki lengur nauðsynlegir við innskráningu.',
        messageLine2: 'Reikningurinn þinn gæti ekki verið eins öruggur. Ertu viss um að þú viljir halda áfram?',
        successMessage: 'Tveggja þrepa auðkenning með auðkennisforriti hefur verið fjarlægð.',
        title: 'Fjarlægja tveggja þrepa auðkenningu',
      },
      successMessage:
        'Tveggja þrepa auðkenning er nú virkjað. Við innskráningu þarftu að slá inn staðfestingarkóða frá þessu auðkennisforriti sem viðbótar skref.',
      title: 'Bæta við auðkennisforriti',
      verifySubtitle: 'Sláðu inn staðfestingarkóðann sem auðkennisforritið þitt bjó til',
      verifyTitle: 'Staðfestingarkóði',
    },
    mobileButton__menu: 'Valmynd',
    navbar: {
      account: 'Prófíll',
      description: 'Stjórna reikningsupplýsingum þínum.',
      security: 'Öryggi',
      title: 'Reikningur',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: '{{name}} verður fjarlægt úr þessum reikningi.',
        title: 'Fjarlægja lykil',
      },
      subtitle__rename: 'Þú getur breytt nafni lykilsins til að auðvelda að finna hann.',
      title__rename: 'Endurnefna lykil',
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'Mælt er með að skrá þig út af öllum öðrum tækjum sem gætu hafa notað gamla lykilorðið þitt.',
      readonly:
        'Lykilorðið þitt er ekki hægt að breyta núna vegna þess að þú getur aðeins skráð þig inn í gegnum fyrirtækjatengingu.',
      successMessage__set: 'Lykilorðið þitt hefur verið sett.',
      successMessage__signOutOfOtherSessions: 'Öll önnur tæki hafa verið skráð út.',
      successMessage__update: 'Lykilorðið þitt hefur verið uppfært.',
      title__set: 'Setja lykilorð',
      title__update: 'Uppfæra lykilorð',
    },
    phoneNumberPage: {
      infoText:
        'SMS sem inniheldur staðfestingarkóða verður sent á þetta símanúmer. Skilaboð og gagnagjöld geta átt við.',
      removeResource: {
        messageLine1: '{{identifier}} verður fjarlægt úr þessum reikningi.',
        messageLine2: 'Þú munt ekki lengur geta skráð þig inn með þessu símanúmeri.',
        successMessage: '{{phoneNumber}} hefur verið fjarlægt úr reikningnum þínum.',
        title: 'Fjarlægja símanúmer',
      },
      successMessage: '{{identifier}} hefur verið bætt við reikninginn þinn.',
      title: 'Bæta við símanúmeri',
      verifySubtitle: 'Sláðu inn staðfestingarkóðann sem sendur var á {{identifier}}',
      verifyTitle: 'Staðfesta símanúmer',
    },
    profilePage: {
      fileDropAreaHint: 'Mælt stærð 1:1, allt að 10MB.',
      imageFormDestructiveActionSubtitle: 'Fjarlægja',
      imageFormSubtitle: 'Hlaða upp',
      imageFormTitle: 'Prófílmynd',
      readonly: 'Prófílupplýsingar þínar hafa verið veittar af fyrirtækjatengingu og er ekki hægt að breyta.',
      successMessage: 'Prófíllinn þinn hefur verið uppfærður.',
      title: 'Uppfæra prófíl',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Skrá út af tæki',
        title: 'Virk tæki',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Endurtengja',
        actionLabel__reauthorize: 'Heimila núna',
        destructiveActionTitle: 'Fjarlægja',
        primaryButton: 'Tengja reikning',
        subtitle__disconnected: 'Þessi reikningur hefur verið aftengdur.',
        subtitle__reauthorize:
          'Nauðsynlegar heimildir hafa verið uppfærðar, og þú gætir verið að upplifa takmarkaða virkni. Vinsamlegast endurheimilaðu þetta forrit til að forðast vandamál',
        title: 'Tengdir reikningar',
      },
      dangerSection: {
        deleteAccountButton: 'Eyða reikningi',
        title: 'Eyða reikningi',
      },
      emailAddressesSection: {
        destructiveAction: 'Fjarlægja netfang',
        detailsAction__nonPrimary: 'Setja sem aðal',
        detailsAction__primary: 'Ljúka staðfestingu',
        detailsAction__unverified: 'Staðfesta',
        primaryButton: 'Bæta við netfangi',
        title: 'Netföng',
      },
      enterpriseAccountsSection: {
        title: 'Fyrirtækjareikningar',
      },
      headerTitle__account: 'Prófílupplýsingar',
      headerTitle__security: 'Öryggi',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Endurmynda',
          headerTitle: 'Öryggiskóðar',
          subtitle__regenerate:
            'Fáðu nýtt sett af öruggum öryggiskóðum. Fyrri öryggiskóðar verða eyttir og ekki hægt að nota.',
          title__regenerate: 'Endurmynda öryggiskóða',
        },
        phoneCode: {
          actionLabel__setDefault: 'Setja sem sjálfgefið',
          destructiveActionLabel: 'Fjarlægja',
        },
        primaryButton: 'Bæta við tveggja þrepa auðkenningu',
        title: 'Tveggja þrepa auðkenning',
        totp: {
          destructiveActionTitle: 'Fjarlægja',
          headerTitle: 'Auðkennisforrit',
        },
      },
      passkeysSection: {
        menuAction__destructive: 'Fjarlægja',
        menuAction__rename: 'Endurnefna',
        title: 'Lyklar',
      },
      passwordSection: {
        primaryButton__setPassword: 'Setja lykilorð',
        primaryButton__updatePassword: 'Uppfæra lykilorð',
        title: 'Lykilorð',
      },
      phoneNumbersSection: {
        destructiveAction: 'Fjarlægja símanúmer',
        detailsAction__nonPrimary: 'Setja sem aðal',
        detailsAction__primary: 'Ljúka staðfestingu',
        detailsAction__unverified: 'Staðfesta símanúmer',
        primaryButton: 'Bæta við símanúmeri',
        title: 'Símanúmer',
      },
      profileSection: {
        primaryButton: 'Uppfæra prófíl',
        title: 'Prófíll',
      },
      usernameSection: {
        primaryButton__setUsername: 'Setja notendanafn',
        primaryButton__updateUsername: 'Uppfæra notendanafn',
        title: 'Notendanafn',
      },
      web3WalletsSection: {
        destructiveAction: 'Fjarlægja veski',
        primaryButton: 'Web3 veski',
        title: 'Web3 veski',
      },
    },
    usernamePage: {
      successMessage: 'Notendanafnið þitt hefur verið uppfært.',
      title__set: 'Setja notendanafn',
      title__update: 'Uppfæra notendanafn',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} verður fjarlægt úr þessum reikningi.',
        messageLine2: 'Þú munt ekki lengur geta skráð þig inn með þessu web3 veski.',
        successMessage: '{{web3Wallet}} hefur verið fjarlægt úr reikningnum þínum.',
        title: 'Fjarlægja web3 veski',
      },
      subtitle__availableWallets: 'Veldu web3 veski til að tengja við reikninginn þinn.',
      subtitle__unavailableWallets: 'Engin tiltæk web3 veski.',
      successMessage: 'Veskið hefur verið bætt við reikninginn þinn.',
      title: 'Bæta við web3 veski',
    },
  },
} as const;
