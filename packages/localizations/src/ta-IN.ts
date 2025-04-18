import type { LocalizationResource } from "@clerk/types";

export const taIN: LocalizationResource = {
  locale: "ta-IN",
  __experimental_commerce: {
    billedAnnually: "வருடாந்திர கட்டணம்",
    free: "இலவசம்",
    getStarted: "தொடங்குங்கள்",
    manageMembership: "உறுப்பினர் நிர்வாகம்",
    month: "மாதம்",
    switchPlan: "இந்த திட்டத்திற்கு மாறவும்",
  },
  backButton: "பின்செல்",
  badge__currentPlan: "தற்போதைய திட்டம்",
  badge__default: "இயல்புநிலை",
  badge__expired: "காலாவதியானது",
  badge__otherImpersonatorDevice: "மற்ற மாறுவேட சாதனம்",
  badge__primary: "முதன்மை",
  badge__requiresAction: "செயல் தேவை",
  badge__thisDevice: "இந்த சாதனம்",
  badge__unverified: "சரிபார்க்கப்படாதது",
  badge__userDevice: "பயனர் சாதனம்",
  badge__you: "நீங்கள்",
  createOrganization: {
    formButtonSubmit: "நிறுவனத்தை உருவாக்கு",
    invitePage: {
      formButtonReset: "தவிர்",
    },
    title: "நிறுவனத்தை உருவாக்கு",
  },
  dates: {
    lastDay: "நேற்று {{ date | timeString('ta-IN') }} மணிக்கு",
    next6Days:
      "{{ date | weekday('ta-IN','long') }} அன்று {{ date | timeString('ta-IN') }} மணிக்கு",
    nextDay: "நாளை {{ date | timeString('ta-IN') }} மணிக்கு",
    numeric: "{{ date | numeric('ta-IN') }}",
    previous6Days:
      "கடந்த {{ date | weekday('ta-IN','long') }} அன்று {{ date | timeString('ta-IN') }} மணிக்கு",
    sameDay: "இன்று {{ date | timeString('ta-IN') }} மணிக்கு",
  },
  dividerText: "அல்லது",
  footerActionLink__useAnotherMethod: "வேறு முறையைப் பயன்படுத்துங்கள்",
  footerPageLink__help: "உதவி",
  footerPageLink__privacy: "தனியுரிமை",
  footerPageLink__terms: "விதிமுறைகள்",
  formButtonPrimary: "தொடரவும்",
  formButtonPrimary__verify: "சரிபார்க்கவும்",
  formFieldAction__forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
  formFieldError__matchingPasswords: "கடவுச்சொற்கள் பொருந்துகின்றன.",
  formFieldError__notMatchingPasswords: "கடவுச்சொற்கள் பொருந்தவில்லை.",
  formFieldError__verificationLinkExpired:
    "சரிபார்ப்பு இணைப்பு காலாவதியானது. புதிய இணைப்பைக் கோருங்கள்.",
  formFieldHintText__optional: "விருப்பமானது",
  formFieldHintText__slug:
    "சிறப்புக்குறி என்பது மனிதர்கள் படிக்கக்கூடிய தனித்துவமான ID ஆகும். இது பெரும்பாலும் URL-களில் பயன்படுத்தப்படுகிறது.",
  formFieldInputPlaceholder__backupCode: "காப்புக் குறியீட்டை உள்ளிடவும்",
  formFieldInputPlaceholder__confirmDeletionUserAccount: "கணக்கை நீக்கு",
  formFieldInputPlaceholder__emailAddress:
    "உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்",
  formFieldInputPlaceholder__emailAddress_username:
    "மின்னஞ்சல் அல்லது பயனர்பெயரை உள்ளிடவும்",
  formFieldInputPlaceholder__emailAddresses:
    "example@email.com, example2@email.com",
  formFieldInputPlaceholder__firstName: "முதல் பெயர்",
  formFieldInputPlaceholder__lastName: "கடைசி பெயர்",
  formFieldInputPlaceholder__organizationDomain: "example.com",
  formFieldInputPlaceholder__organizationDomainEmailAddress: "you@example.com",
  formFieldInputPlaceholder__organizationName: "நிறுவன பெயர்",
  formFieldInputPlaceholder__organizationSlug: "எனது-நிறுவனம்",
  formFieldInputPlaceholder__password: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
  formFieldInputPlaceholder__phoneNumber: "உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்",
  formFieldInputPlaceholder__username: undefined,
  formFieldLabel__automaticInvitations:
    "இந்த டொமைனுக்கு தானியங்கி அழைப்புகளை இயக்கவும்",
  formFieldLabel__backupCode: "காப்புக் குறியீடு",
  formFieldLabel__confirmDeletion: "உறுதிப்படுத்தல்",
  formFieldLabel__confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
  formFieldLabel__currentPassword: "தற்போதைய கடவுச்சொல்",
  formFieldLabel__emailAddress: "மின்னஞ்சல் முகவரி",
  formFieldLabel__emailAddress_username: "மின்னஞ்சல் முகவரி அல்லது பயனர்பெயர்",
  formFieldLabel__emailAddresses: "மின்னஞ்சல் முகவரிகள்",
  formFieldLabel__firstName: "முதல் பெயர்",
  formFieldLabel__lastName: "கடைசி பெயர்",
  formFieldLabel__newPassword: "புதிய கடவுச்சொல்",
  formFieldLabel__organizationDomain: "டொமைன்",
  formFieldLabel__organizationDomainDeletePending:
    "நிலுவையில் உள்ள அழைப்புகள் மற்றும் பரிந்துரைகளை நீக்கவும்",
  formFieldLabel__organizationDomainEmailAddress:
    "சரிபார்ப்பு மின்னஞ்சல் முகவரி",
  formFieldLabel__organizationDomainEmailAddressDescription:
    "இந்த டொமைனில் ஒரு குறியீட்டைப் பெற்று இந்த டொமைனைச் சரிபார்க்க ஒரு மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
  formFieldLabel__organizationName: "பெயர்",
  formFieldLabel__organizationSlug: "சிறப்புக்குறி",
  formFieldLabel__passkeyName: "பாஸ்கீயின் பெயர்",
  formFieldLabel__password: "கடவுச்சொல்",
  formFieldLabel__phoneNumber: "தொலைபேசி எண்",
  formFieldLabel__role: "பங்கு",
  formFieldLabel__signOutOfOtherSessions:
    "மற்ற அனைத்து சாதனங்களிலிருந்தும் வெளியேறவும்",
  formFieldLabel__username: "பயனர்பெயர்",
  impersonationFab: {
    action__signOut: "வெளியேறு",
    title: "{{identifier}} ஆக உள்நுழைந்துள்ளீர்கள்",
  },
  maintenanceMode:
    "தற்போது நாங்கள் பராமரிப்பில் உள்ளோம், ஆனால் கவலைப்பட வேண்டாம், இது சில நிமிடங்களுக்கு மேல் ஆகாது.",
  membershipRole__admin: "நிர்வாகி",
  membershipRole__basicMember: "உறுப்பினர்",
  membershipRole__guestMember: "விருந்தினர்",
  organizationList: {
    action__createOrganization: "நிறுவனத்தை உருவாக்கு",
    action__invitationAccept: "சேரவும்",
    action__suggestionsAccept: "சேர கோரிக்கை",
    createOrganization: "நிறுவனத்தை உருவாக்கு",
    invitationAcceptedLabel: "சேர்ந்தது",
    subtitle: "{{applicationName}}-க்கு தொடர",
    suggestionsAcceptedLabel: "ஒப்புதல் நிலுவையில் உள்ளது",
    title: "ஒரு கணக்கைத் தேர்ந்தெடுக்கவும்",
    titleWithoutPersonal: "ஒரு நிறுவனத்தைத் தேர்ந்தெடுக்கவும்",
  },
  organizationProfile: {
    badge__automaticInvitation: "தானியங்கி அழைப்புகள்",
    badge__automaticSuggestion: "தானியங்கி பரிந்துரைகள்",
    badge__manualInvitation: "தானியங்கி சேர்க்கை இல்லை",
    badge__unverified: "சரிபார்க்கப்படாதது",
    createDomainPage: {
      subtitle:
        "சரிபார்க்க டொமைனைச் சேர்க்கவும். இந்த டொமைனில் மின்னஞ்சல் முகவரிகளைக் கொண்ட பயனர்கள் தானாகவே நிறுவனத்தில் சேரலாம் அல்லது சேர கோரலாம்.",
      title: "டொமைன் சேர்",
    },
    invitePage: {
      detailsTitle__inviteFailed:
        "அழைப்புகளை அனுப்ப முடியவில்லை. பின்வரும் மின்னஞ்சல் முகவரிகளுக்கு ஏற்கனவே நிலுவையில் உள்ள அழைப்புகள் உள்ளன: {{email_addresses}}.",
      formButtonPrimary__continue: "அழைப்புகளை அனுப்பு",
      selectDropdown__role: "பங்கைத் தேர்ந்தெடுக்கவும்",
      subtitle:
        "ஒன்று அல்லது அதற்கு மேற்பட்ட மின்னஞ்சல் முகவரிகளை இடைவெளிகள் அல்லது காற்புள்ளிகளால் பிரிக்கப்பட்டு உள்ளிடவும் அல்லது ஒட்டவும்.",
      successMessage: "அழைப்புகள் வெற்றிகரமாக அனுப்பப்பட்டன",
      title: "புதிய உறுப்பினர்களை அழைக்கவும்",
    },
    membersPage: {
      action__invite: "அழைக்கவும்",
      action__search: "தேடல்",
      activeMembersTab: {
        menuAction__remove: "உறுப்பினரை நீக்கு",
        tableHeader__actions: "செயல்கள்",
        tableHeader__joined: "சேர்ந்தது",
        tableHeader__role: "பங்கு",
        tableHeader__user: "பயனர்",
      },
      detailsTitle__emptyRow: "காட்ட உறுப்பினர்கள் இல்லை",
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            "ஒரு மின்னஞ்சல் டொமைனை உங்கள் நிறுவனத்துடன் இணைப்பதன் மூலம் பயனர்களை அழைக்கவும். பொருந்தும் மின்னஞ்சல் டொமைனுடன் பதிவு செய்யும் எவரும் எந்த நேரத்திலும் நிறுவனத்தில் சேர முடியும்.",
          headerTitle: "தானியங்கி அழைப்புகள்",
          primaryButton: "சரிபார்க்கப்பட்ட டொமைன்களை நிர்வகிக்கவும்",
        },
        table__emptyRow: "காட்ட அழைப்புகள் இல்லை",
      },
      invitedMembersTab: {
        menuAction__revoke: "அழைப்பை ரத்து செய்",
        tableHeader__invited: "அழைக்கப்பட்டது",
      },
      requestsTab: {
        autoSuggestions: {
          headerSubtitle:
            "பொருந்தும் மின்னஞ்சல் டொமைனுடன் பதிவு செய்யும் பயனர்கள், உங்கள் நிறுவனத்தில் சேர ஒரு கோரிக்கையைக் காண முடியும்.",
          headerTitle: "தானியங்கி பரிந்துரைகள்",
          primaryButton: "சரிபார்க்கப்பட்ட டொமைன்களை நிர்வகிக்கவும்",
        },
        menuAction__approve: "ஒப்புதல்",
        menuAction__reject: "நிராகரி",
        tableHeader__requested: "அணுகல் கோரப்பட்டது",
        table__emptyRow: "காட்ட கோரிக்கைகள் இல்லை",
      },
      start: {
        headerTitle__invitations: "அழைப்புகள்",
        headerTitle__members: "உறுப்பினர்கள்",
        headerTitle__requests: "கோரிக்கைகள்",
      },
    },
    navbar: {
      description: "உங்கள் நிறுவனத்தை நிர்வகிக்கவும்.",
      general: "பொது",
      members: "உறுப்பினர்கள்",
      title: "நிறுவனம்",
      billing: "கட்டணம்",
    },
    profilePage: {
      dangerSection: {
        deleteOrganization: {
          actionDescription:
            'தொடர "{{organizationName}}" என்பதை கீழே உள்ளிடவும்.',
          messageLine1: "இந்த நிறுவனத்தை நீக்க விரும்புகிறீர்களா?",
          messageLine2: "இந்த செயல் நிரந்தரமானது மற்றும் மாற்ற முடியாதது.",
          successMessage: "நீங்கள் நிறுவனத்தை நீக்கிவிட்டீர்கள்.",
          title: "நிறுவனத்தை நீக்கு",
        },
        leaveOrganization: {
          actionDescription:
            'தொடர "{{organizationName}}" என்பதை கீழே உள்ளிடவும்.',
          messageLine1:
            "இந்த நிறுவனத்தை விட்டு வெளியேற விரும்புகிறீர்களா? இந்த நிறுவனம் மற்றும் அதன் பயன்பாடுகளுக்கான அணுகலை இழப்பீர்கள்.",
          messageLine2: "இந்த செயல் நிரந்தரமானது மற்றும் மாற்ற முடியாதது.",
          successMessage: "நீங்கள் நிறுவனத்தை விட்டு வெளியேறிவிட்டீர்கள்.",
          title: "நிறுவனத்தை விட்டு வெளியேறு",
        },
        title: "ஆபத்து",
      },
      domainSection: {
        menuAction__manage: "நிர்வகி",
        menuAction__remove: "நீக்கு",
        menuAction__verify: "சரிபார்க்கவும்",
        primaryButton: "டொமைன் சேர்",
        subtitle:
          "சரிபார்க்கப்பட்ட மின்னஞ்சல் டொமைனின் அடிப்படையில் பயனர்கள் தானாகவே நிறுவனத்தில் சேர அல்லது சேர கோரிக்கை அனுப்ப அனுமதிக்கவும்.",
        title: "சரிபார்க்கப்பட்ட டொமைன்கள்",
      },
      successMessage: "நிறுவனம் புதுப்பிக்கப்பட்டுள்ளது.",
      title: "சுயவிவரத்தைப் புதுப்பிக்கவும்",
    },
    removeDomainPage: {
      messageLine1: "{{domain}} மின்னஞ்சல் டொமைன் நீக்கப்படும்.",
      messageLine2:
        "இதற்குப் பிறகு பயனர்கள் தானாகவே நிறுவனத்தில் சேர முடியாது.",
      successMessage: "{{domain}} நீக்கப்பட்டுள்ளது.",
      title: "டொமைன் நீக்கு",
    },
    start: {
      headerTitle__general: "பொது",
      headerTitle__members: "உறுப்பினர்கள்",
      profileSection: {
        primaryButton: "சுயவிவரத்தைப் புதுப்பிக்கவும்",
        title: "நிறுவன சுயவிவரம்",
        uploadAction__title: "லோகோ",
      },
    },
    verifiedDomainPage: {
      dangerTab: {
        calloutInfoLabel:
          "இந்த டொமைனை நீக்குவது அழைக்கப்பட்ட பயனர்களைப் பாதிக்கும்.",
        removeDomainActionLabel__remove: "டொமைனை நீக்கு",
        removeDomainSubtitle:
          "இந்த டொமைனை உங்கள் சரிபார்க்கப்பட்ட டொமைன்களிலிருந்து நீக்கவும்",
        removeDomainTitle: "டொமைனை நீக்கு",
      },
      enrollmentTab: {
        automaticInvitationOption__description:
          "பயனர்கள் பதிவு செய்யும் போது தானாகவே நிறுவனத்தில் சேர அழைக்கப்படுகிறார்கள் மற்றும் எந்த நேரத்திலும் சேரலாம்.",
        automaticInvitationOption__label: "தானியங்கி அழைப்புகள்",
        automaticSuggestionOption__description:
          "பயனர்கள் சேர கோரிக்கை விடுக்க ஒரு பரிந்துரையைப் பெறுகிறார்கள், ஆனால் நிறுவனத்தில் சேர முடியும் முன் நிர்வாகியால் ஒப்புதல் பெற வேண்டும்.",
        automaticSuggestionOption__label: "தானியங்கி பரிந்துரைகள்",
        calloutInfoLabel:
          "சேர்க்கை முறையை மாற்றுவது புதிய பயனர்களை மட்டுமே பாதிக்கும்.",
        calloutInvitationCountLabel:
          "பயனர்களுக்கு அனுப்பப்பட்ட நிலுவையில் உள்ள அழைப்புகள்: {{count}}",
        calloutSuggestionCountLabel:
          "பயனர்களுக்கு அனுப்பப்பட்ட நிலுவையில் உள்ள பரிந்துரைகள்: {{count}}",
        manualInvitationOption__description:
          "பயனர்கள் நிறுவனத்திற்கு கைமுறையாக மட்டுமே அழைக்கப்படலாம்.",
        manualInvitationOption__label: "தானியங்கி சேர்க்கை இல்லை",
        subtitle:
          "இந்த டொமைனிலிருந்து பயனர்கள் நிறுவனத்தில் எவ்வாறு சேரலாம் என்பதைத் தேர்வு செய்யவும்.",
      },
      start: {
        headerTitle__danger: "ஆபத்து",
        headerTitle__enrollment: "சேர்க்கை விருப்பங்கள்",
      },
      subtitle:
        "{{domain}} டொமைன் இப்போது சரிபார்க்கப்பட்டது. பதிவு முறையைத் தேர்ந்தெடுப்பதன் மூலம் தொடரவும்.",
      title: "{{domain}} புதுப்பிக்கவும்",
    },
    verifyDomainPage: {
      formSubtitle:
        "உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
      formTitle: "சரிபார்ப்புக் குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle:
        "{{domainName}} டொமைன் மின்னஞ்சல் மூலம் சரிபார்க்கப்பட வேண்டும்.",
      subtitleVerificationCodeScreen:
        "ஒரு சரிபார்ப்புக் குறியீடு {{emailAddress}} க்கு அனுப்பப்பட்டது. தொடர குறியீட்டை உள்ளிடவும்.",
      title: "டொமைனைச் சரிபார்க்கவும்",
    },
  },
  organizationSwitcher: {
    action__createOrganization: "நிறுவனத்தை உருவாக்கு",
    action__invitationAccept: "சேரவும்",
    action__manageOrganization: "நிர்வகி",
    action__suggestionsAccept: "சேர கோரிக்கை",
    notSelected: "நிறுவனம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை",
    personalWorkspace: "தனிப்பட்ட கணக்கு",
    suggestionsAcceptedLabel: "ஒப்புதல் நிலுவையில் உள்ளது",
  },
  paginationButton__next: "அடுத்து",
  paginationButton__previous: "முந்தைய",
  paginationRowText__displaying: "காட்டப்படுகிறது",
  paginationRowText__of: "இல்",
  reverification: {
    alternativeMethods: {
      actionLink: "உதவி பெறுக",
      actionText: "இவற்றில் எதுவும் இல்லையா?",
      blockButton__backupCode: "காப்புக் குறியீட்டைப் பயன்படுத்தவும்",
      blockButton__emailCode: "{{identifier}} க்கு மின்னஞ்சல் குறியீடு",
      blockButton__passkey: "உங்கள் பாஸ்கீயைப் பயன்படுத்தவும்",
      blockButton__password: "உங்கள் கடவுச்சொல்லுடன் தொடரவும்",
      blockButton__phoneCode: "{{identifier}} க்கு SMS குறியீடு அனுப்பவும்",
      blockButton__totp: "உங்கள் அங்கீகாரி பயன்பாட்டைப் பயன்படுத்தவும்",
      getHelp: {
        blockButton__emailSupport: "மின்னஞ்சல் ஆதரவு",
        content:
          "உங்கள் கணக்கைச் சரிபார்ப்பதில் சிக்கல் இருந்தால், எங்களுக்கு மின்னஞ்சல் அனுப்பவும், நாங்கள் உங்களுடன் இணைந்து அணுகலை மீட்டெடுக்க முடிந்தவரை விரைவாக உதவுவோம்.",
        title: "உதவி பெறுக",
      },
      subtitle:
        "சிக்கல்கள் உள்ளதா? சரிபார்ப்புக்கு இந்த முறைகளில் எதையும் பயன்படுத்தலாம்.",
      title: "வேறு முறையைப் பயன்படுத்தவும்",
    },
    backupCodeMfa: {
      subtitle:
        "இரண்டு-படி அங்கீகாரத்தை அமைக்கும் போது நீங்கள் பெற்ற காப்புக் குறியீட்டை உள்ளிடவும்",
      title: "காப்புக் குறியீட்டை உள்ளிடவும்",
    },
    emailCode: {
      formTitle: "சரிபார்ப்புக் குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle: "தொடர உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட குறியீட்டை உள்ளிடவும்",
      title: "சரிபார்ப்பு தேவை",
    },
    noAvailableMethods: {
      message:
        "சரிபார்ப்பைத் தொடர முடியாது. பொருத்தமான அங்கீகார காரணி எதுவும் கட்டமைக்கப்படவில்லை",
      subtitle: "பிழை ஏற்பட்டது",
      title: "உங்கள் கணக்கைச் சரிபார்க்க முடியாது",
    },
    passkey: {
      blockButton__passkey: "உங்கள் பாஸ்கீயைப் பயன்படுத்தவும்",
      subtitle:
        "உங்கள் பாஸ்கீயைப் பயன்படுத்துவது உங்கள் அடையாளத்தை உறுதிப்படுத்துகிறது. உங்கள் சாதனம் உங்கள் கைரேகை, முகம் அல்லது திரை பூட்டைக் கேட்கலாம்.",
      title: "உங்கள் பாஸ்கீயைப் பயன்படுத்தவும்",
    },
    password: {
      actionLink: "வேறு முறையைப் பயன்படுத்துங்கள்",
      subtitle: "தொடர உங்கள் தற்போதைய கடவுச்சொல்லை உள்ளிடவும்",
      title: "சரிபார்ப்பு தேவை",
    },
    phoneCode: {
      formTitle: "சரிபார்ப்புக் குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle: "தொடர உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட குறியீட்டை உள்ளிடவும்",
      title: "சரிபார்ப்பு தேவை",
    },
    phoneCodeMfa: {
      formTitle: "சரிபார்ப்புக் குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle: "தொடர உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட குறியீட்டை உள்ளிடவும்",
      title: "சரிபார்ப்பு தேவை",
    },
    totpMfa: {
      formTitle: "சரிபார்ப்புக் குறியீடு",
      subtitle:
        "தொடர உங்கள் அங்கீகாரி பயன்பாட்டால் உருவாக்கப்பட்ட குறியீட்டை உள்ளிடவும்",
      title: "சரிபார்ப்பு தேவை",
    },
  },
  signIn: {
    accountSwitcher: {
      action__addAccount: "கணக்கைச் சேர்",
      action__signOutAll: "அனைத்து கணக்குகளிலிருந்தும் வெளியேறு",
      subtitle: "நீங்கள் தொடர விரும்பும் கணக்கைத் தேர்ந்தெடுக்கவும்.",
      title: "ஒரு கணக்கைத் தேர்ந்தெடுக்கவும்",
    },
    alternativeMethods: {
      actionLink: "உதவி பெறுக",
      actionText: "இவற்றில் எதுவும் இல்லையா?",
      blockButton__backupCode: "காப்புக் குறியீட்டைப் பயன்படுத்தவும்",
      blockButton__emailCode: "{{identifier}} க்கு மின்னஞ்சல் குறியீடு",
      blockButton__emailLink: "{{identifier}} க்கு மின்னஞ்சல் இணைப்பு",
      blockButton__passkey: "உங்கள் பாஸ்கீயுடன் உள்நுழையவும்",
      blockButton__password: "உங்கள் கடவுச்சொல்லுடன் உள்நுழையவும்",
      blockButton__phoneCode: "{{identifier}} க்கு SMS குறியீடு அனுப்பவும்",
      blockButton__totp: "உங்கள் அங்கீகாரி பயன்பாட்டைப் பயன்படுத்தவும்",
      getHelp: {
        blockButton__emailSupport: "மின்னஞ்சல் ஆதரவு",
        content:
          "உங்கள் கணக்கில் உள்நுழைவதில் சிக்கல் இருந்தால், எங்களுக்கு மின்னஞ்சல் அனுப்பவும், நாங்கள் உங்களுடன் இணைந்து அணுகலை மீட்டெடுக்க முடிந்தவரை விரைவாக உதவுவோம்.",
        title: "உதவி பெறுக",
      },
      subtitle:
        "சிக்கல்கள் உள்ளதா? உள்நுழைய இந்த முறைகளில் எதையும் பயன்படுத்தலாம்.",
      title: "வேறு முறையைப் பயன்படுத்தவும்",
    },
    backupCodeMfa: {
      subtitle:
        "உங்கள் காப்புக் குறியீடு இரண்டு-படி அங்கீகாரத்தை அமைக்கும்போது நீங்கள் பெற்றதாகும்.",
      title: "காப்புக் குறியீட்டை உள்ளிடவும்",
    },
    emailCode: {
      formTitle: "சரிபார்ப்புக் குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle: "{{applicationName}} க்கு தொடர",
      title: "உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்",
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          "தொடர, நீங்கள் உள்நுழைவைத் தொடங்கிய சாதனத்திலும் உலாவியிலும் சரிபார்ப்பு இணைப்பைத் திறக்கவும்",
        title: "இந்த சாதனத்திற்கு சரிபார்ப்பு இணைப்பு செல்லாது",
      },
      expired: {
        subtitle: "தொடர அசல் தாவலுக்குத் திரும்பவும்.",
        title: "இந்த சரிபார்ப்பு இணைப்பு காலாவதியானது",
      },
      failed: {
        subtitle: "தொடர அசல் தாவலுக்குத் திரும்பவும்.",
        title: "இந்த சரிபார்ப்பு இணைப்பு தவறானது",
      },
      formSubtitle:
        "உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட சரிபார்ப்பு இணைப்பைப் பயன்படுத்தவும்",
      formTitle: "சரிபார்ப்பு இணைப்பு",
      loading: {
        subtitle: "விரைவில் திருப்பி விடப்படுவீர்கள்",
        title: "உள்நுழைகிறது...",
      },
      resendButton: "இணைப்பு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle: "{{applicationName}} க்கு தொடர",
      title: "உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்",
      unusedTab: {
        title: "இந்த தாவலை மூடலாம்",
      },
      verified: {
        subtitle: "விரைவில் திருப்பி விடப்படுவீர்கள்",
        title: "வெற்றிகரமாக உள்நுழைந்தது",
      },
      verifiedSwitchTab: {
        subtitle: "தொடர அசல் தாவலுக்குத் திரும்பவும்",
        subtitleNewTab: "தொடர புதிதாகத் திறக்கப்பட்ட தாவலுக்குத் திரும்பவும்",
        titleNewTab: "மற்ற தாவலில் உள்நுழைந்தது",
      },
    },
    forgotPassword: {
      formTitle: "கடவுச்சொல் மீட்டமைப்பு குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle: "உங்கள் கடவுச்சொல்லை மீட்டமைக்க",
      subtitle_email:
        "முதலில், உங்கள் மின்னஞ்சல் முகவரிக்கு அனுப்பப்பட்ட குறியீட்டை உள்ளிடவும்",
      subtitle_phone:
        "முதலில், உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட குறியீட்டை உள்ளிடவும்",
      title: "கடவுச்சொல்லை மீட்டமைக்க",
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: "உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்",
      label__alternativeMethods: "அல்லது, வேறு முறையில் உள்நுழையவும்",
      title: "கடவுச்சொல் மறந்துவிட்டதா?",
    },
    noAvailableMethods: {
      message:
        "உள்நுழைவைத் தொடர முடியாது. எந்த அங்கீகார காரணியும் கிடைக்கவில்லை.",
      subtitle: "பிழை ஏற்பட்டது",
      title: "உள்நுழைய முடியாது",
    },
    passkey: {
      subtitle:
        "உங்கள் பாஸ்கீயைப் பயன்படுத்துவது நீங்கள் தான் என்பதை உறுதிப்படுத்துகிறது. உங்கள் சாதனம் உங்கள் கைரேகை, முகம் அல்லது திரை பூட்டைக் கேட்கலாம்.",
      title: "உங்கள் பாஸ்கீயைப் பயன்படுத்தவும்",
    },
    password: {
      actionLink: "வேறு முறையைப் பயன்படுத்துங்கள்",
      subtitle: "உங்கள் கணக்குடன் தொடர்புடைய கடவுச்சொல்லை உள்ளிடவும்",
      title: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
    },
    passwordPwned: {
      title: "கடவுச்சொல் அபாயத்தில் உள்ளது",
    },
    phoneCode: {
      formTitle: "சரிபார்ப்புக் குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle: "{{applicationName}} க்கு தொடர",
      title: "உங்கள் தொலைபேசியைச் சரிபார்க்கவும்",
    },
    phoneCodeMfa: {
      formTitle: "சரிபார்ப்புக் குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle:
        "தொடர, உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
      title: "உங்கள் தொலைபேசியைச் சரிபார்க்கவும்",
    },
    resetPassword: {
      formButtonPrimary: "கடவுச்சொல்லை மீட்டமைக்க",
      requiredMessage:
        "பாதுகாப்பு காரணங்களுக்காக, உங்கள் கடவுச்சொல்லை மீட்டமைக்க வேண்டியது அவசியம்.",
      successMessage:
        "உங்கள் கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது. உங்களை உள்நுழைகிறது, சிறிது நேரம் காத்திருக்கவும்.",
      title: "புதிய கடவுச்சொல்லை அமைக்கவும்",
    },
    resetPasswordMfa: {
      detailsLabel:
        "உங்கள் கடவுச்சொல்லை மீட்டமைப்பதற்கு முன் உங்கள் அடையாளத்தை சரிபார்க்க வேண்டும்.",
    },
    start: {
      actionLink: "பதிவு செய்",
      actionLink__join_waitlist: "காத்திருப்பில் சேரவும்",
      actionLink__use_email: "மின்னஞ்சலைப் பயன்படுத்து",
      actionLink__use_email_username:
        "மின்னஞ்சல் அல்லது பயனர்பெயரைப் பயன்படுத்து",
      actionLink__use_passkey: "பதிலாக பாஸ்கீயைப் பயன்படுத்து",
      actionLink__use_phone: "தொலைபேசியைப் பயன்படுத்து",
      actionLink__use_username: "பயனர்பெயரைப் பயன்படுத்து",
      actionText: "கணக்கு இல்லையா?",
      actionText__join_waitlist: "முன்கூட்டியே அணுகல் வேண்டுமா?",
      subtitle: "மீண்டும் வரவேற்கிறோம்! தொடர உள்நுழையவும்",
      subtitleCombined: undefined,
      title: "{{applicationName}} இல் உள்நுழையவும்",
      titleCombined: "{{applicationName}} க்கு தொடரவும்",
    },
    totpMfa: {
      formTitle: "சரிபார்ப்புக் குறியீடு",
      subtitle:
        "தொடர, உங்கள் அங்கீகாரி பயன்பாட்டால் உருவாக்கப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
      title: "இரண்டு-படி சரிபார்ப்பு",
    },
  },
  signInEnterPasswordTitle: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
  signUp: {
    continue: {
      actionLink: "உள்நுழை",
      actionText: "ஏற்கனவே கணக்கு உள்ளதா?",
      subtitle: "தொடர மீதமுள்ள விவரங்களை நிரப்பவும்.",
      title: "விடுபட்ட புலங்களை நிரப்பவும்",
    },
    emailCode: {
      formSubtitle:
        "உங்கள் மின்னஞ்சல் முகவரிக்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
      formTitle: "சரிபார்ப்புக் குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle:
        "உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
      title: "உங்கள் மின்னஞ்சலை சரிபார்க்கவும்",
    },
    emailLink: {
      clientMismatch: {
        subtitle:
          "தொடர, நீங்கள் பதிவு செய்வதைத் தொடங்கிய சாதனத்திலும் உலாவியிலும் சரிபார்ப்பு இணைப்பைத் திறக்கவும்",
        title: "இந்த சாதனத்திற்கு சரிபார்ப்பு இணைப்பு செல்லாது",
      },
      formSubtitle:
        "உங்கள் மின்னஞ்சல் முகவரிக்கு அனுப்பப்பட்ட சரிபார்ப்பு இணைப்பைப் பயன்படுத்தவும்",
      formTitle: "சரிபார்ப்பு இணைப்பு",
      loading: {
        title: "பதிவு செய்கிறது...",
      },
      resendButton: "இணைப்பு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle: "{{applicationName}} க்கு தொடர",
      title: "உங்கள் மின்னஞ்சலை சரிபார்க்கவும்",
      verified: {
        title: "வெற்றிகரமாக பதிவு செய்யப்பட்டது",
      },
      verifiedSwitchTab: {
        subtitle: "தொடர புதிதாகத் திறக்கப்பட்ட தாவலுக்குத் திரும்பவும்",
        subtitleNewTab: "தொடர முந்தைய தாவலுக்குத் திரும்பவும்",
        title: "மின்னஞ்சல் வெற்றிகரமாக சரிபார்க்கப்பட்டது",
      },
    },
    legalConsent: {
      checkbox: {
        label__onlyPrivacyPolicy:
          'நான் {{ privacyPolicyLink || link("தனியுரிமைக் கொள்கை") }} ஐ ஒப்புக்கொள்கிறேன்',
        label__onlyTermsOfService:
          'நான் {{ termsOfServiceLink || link("சேவை விதிமுறைகள்") }} ஐ ஒப்புக்கொள்கிறேன்',
        label__termsOfServiceAndPrivacyPolicy:
          'நான் {{ termsOfServiceLink || link("சேவை விதிமுறைகள்") }} மற்றும் {{ privacyPolicyLink || link("தனியுரிமைக் கொள்கை") }} ஐ ஒப்புக்கொள்கிறேன்',
      },
      continue: {
        subtitle: "தொடர விதிமுறைகளைப் படித்து ஏற்றுக்கொள்ளவும்",
        title: "சட்ட ஒப்புதல்",
      },
    },
    phoneCode: {
      formSubtitle:
        "உங்கள் தொலைபேசி எண்ணுக்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
      formTitle: "சரிபார்ப்புக் குறியீடு",
      resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
      subtitle:
        "உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
      title: "உங்கள் தொலைபேசியை சரிபார்க்கவும்",
    },
    restrictedAccess: {
      actionLink: "உள்நுழை",
      actionText: "ஏற்கனவே கணக்கு உள்ளதா?",
      blockButton__emailSupport: "மின்னஞ்சல் ஆதரவு",
      blockButton__joinWaitlist: "காத்திருப்பில் சேரவும்",
      subtitle:
        "தற்போது பதிவுகள் முடக்கப்பட்டுள்ளன. உங்களுக்கு அணுகல் இருக்க வேண்டும் என்று நினைத்தால், ஆதரவைத் தொடர்பு கொள்ளவும்.",
      subtitleWaitlist:
        "தற்போது பதிவுகள் முடக்கப்பட்டுள்ளன. நாங்கள் தொடங்கும் போது முதலில் அறிய, காத்திருப்பில் சேரவும்.",
      title: "அணுகல் கட்டுப்படுத்தப்பட்டுள்ளது",
    },
    start: {
      actionLink: "உள்நுழை",
      actionLink__use_email: "பதிலாக மின்னஞ்சலைப் பயன்படுத்து",
      actionLink__use_phone: "பதிலாக தொலைபேசியைப் பயன்படுத்து",
      actionText: "ஏற்கனவே கணக்கு உள்ளதா?",
      subtitle: "வரவேற்கிறோம்! தொடங்க விவரங்களை நிரப்பவும்.",
      subtitleCombined: "வரவேற்கிறோம்! தொடங்க விவரங்களை நிரப்பவும்.",
      title: "உங்கள் கணக்கை உருவாக்கவும்",
      titleCombined: "உங்கள் கணக்கை உருவாக்கவும்",
    },
  },
  socialButtonsBlockButton: "{{provider|titleize}} மூலம் தொடரவும்",
  socialButtonsBlockButtonManyInView: "{{provider|titleize}}",
  unstable__errors: {
    already_a_member_in_organization:
      "{{email}} ஏற்கனவே நிறுவனத்தின் உறுப்பினராக உள்ளார்.",
    captcha_invalid:
      "பாதுகாப்பு சரிபார்ப்புகள் தோல்வியடைந்ததால் பதிவு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்க பக்கத்தை புதுப்பிக்கவும் அல்லது மேலும் உதவிக்கு ஆதரவை தொடர்பு கொள்ளவும்.",
    captcha_unavailable:
      "போட் சரிபார்ப்பு தோல்வியடைந்ததால் பதிவு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்க பக்கத்தை புதுப்பிக்கவும் அல்லது மேலும் உதவிக்கு ஆதரவை தொடர்பு கொள்ளவும்.",
    form_code_incorrect: undefined,
    form_identifier_exists__email_address:
      "இந்த மின்னஞ்சல் முகவரி எடுக்கப்பட்டுள்ளது. வேறொன்றை முயற்சிக்கவும்.",
    form_identifier_exists__phone_number:
      "இந்த தொலைபேசி எண் எடுக்கப்பட்டுள்ளது. வேறொன்றை முயற்சிக்கவும்.",
    form_identifier_exists__username:
      "இந்த பயனர்பெயர் எடுக்கப்பட்டுள்ளது. வேறொன்றை முயற்சிக்கவும்.",
    form_identifier_not_found:
      "இந்த அடையாளத்துடன் கணக்கு எதுவும் இல்லை. சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    form_param_format_invalid:
      "உள்ளிடப்பட்ட மதிப்பு தவறான வடிவத்தில் உள்ளது. சரிபார்த்து திருத்தவும்.",
    form_param_format_invalid__email_address:
      "மின்னஞ்சல் முகவரி சரியான மின்னஞ்சல் முகவரியாக இருக்க வேண்டும்.",
    form_param_format_invalid__phone_number:
      "தொலைபேசி எண் சரியான சர்வதேச வடிவமைப்பில் இருக்க வேண்டும்.",
    form_param_max_length_exceeded__first_name:
      "முதல் பெயர் 256 எழுத்துகளை மீறக்கூடாது.",
    form_param_max_length_exceeded__last_name:
      "கடைசி பெயர் 256 எழுத்துகளை மீறக்கூடாது.",
    form_param_max_length_exceeded__name: "பெயர் 256 எழுத்துகளை மீறக்கூடாது.",
    form_param_nil: "இந்த புலம் தேவை மற்றும் காலியாக இருக்க முடியாது.",
    form_param_value_invalid: "உள்ளிடப்பட்ட மதிப்பு தவறானது. அதை திருத்தவும்.",
    form_password_incorrect:
      "நீங்கள் உள்ளிட்ட கடவுச்சொல் தவறானது. மீண்டும் முயற்சிக்கவும்.",
    form_password_length_too_short:
      "உங்கள் கடவுச்சொல் மிகவும் குறுகியது. இது குறைந்தது 8 எழுத்துகள் நீளமாக இருக்க வேண்டும்.",
    form_password_not_strong_enough: "உங்கள் கடவுச்சொல் போதுமான வலிமை இல்லை.",
    form_password_pwned:
      "இந்த கடவுச்சொல் தரவு மீறலின் ஒரு பகுதியாக காணப்பட்டது மற்றும் பயன்படுத்த முடியாது, தயவுசெய்து வேறு கடவுச்சொல்லை முயற்சிக்கவும்.",
    form_password_pwned__sign_in:
      "இந்த கடவுச்சொல் தரவு மீறலின் ஒரு பகுதியாக காணப்பட்டது மற்றும் பயன்படுத்த முடியாது, தயவுசெய்து உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்.",
    form_password_size_in_bytes_exceeded:
      "உங்கள் கடவுச்சொல் அனுமதிக்கப்பட்ட அதிகபட்ச பைட்டுகளை மீறிவிட்டது, தயவுசெய்து அதை குறைக்கவும் அல்லது சில சிறப்பு எழுத்துக்களை நீக்கவும்.",
    form_password_validation_failed: "தவறான கடவுச்சொல்",
    form_username_invalid_character:
      "உங்கள் பயனர்பெயரில் தவறான எழுத்துக்கள் உள்ளன. எழுத்துக்கள், எண்கள் மற்றும் அடிக்கோடுகளை மட்டும் பயன்படுத்தவும்.",
    form_username_invalid_length:
      "உங்கள் பயனர்பெயர் {{min_length}} மற்றும் {{max_length}} எழுத்துகளுக்கு இடையில் இருக்க வேண்டும்.",
    identification_deletion_failed:
      "உங்கள் கடைசி அடையாளத்தை நீங்கள் நீக்க முடியாது.",
    not_allowed_access:
      "இந்த பக்கத்தை அணுக உங்களுக்கு அனுமதி இல்லை. இது பிழை என்று நீங்கள் நம்பினால், ஆதரவைத் தொடர்பு கொள்ளவும்.",
    organization_domain_blocked:
      "இது தடுக்கப்பட்ட மின்னஞ்சல் வழங்குநர் டொமைன். வேறொன்றைப் பயன்படுத்தவும்.",
    organization_domain_common:
      "இது பொதுவான மின்னஞ்சல் வழங்குநர் டொமைன். வேறொன்றைப் பயன்படுத்தவும்.",
    organization_domain_exists_for_enterprise_connection:
      "இந்த டொமைன் ஏற்கனவே உங்கள் நிறுவனத்தின் SSO க்காக பயன்படுத்தப்படுகிறது",
    organization_membership_quota_exceeded:
      "நிலுவையிலுள்ள அழைப்புகள் உட்பட, நீங்கள் நிறுவன உறுப்பினர் எண்ணிக்கை வரம்பை அடைந்துவிட்டீர்கள்.",
    organization_minimum_permissions_needed:
      "குறைந்தபட்ச தேவையான அனுமதிகளுடன் குறைந்தது ஒரு நிறுவன உறுப்பினர் இருக்க வேண்டும்.",
    passkey_already_exists:
      "இந்த சாதனத்துடன் ஒரு பாஸ்கீ ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.",
    passkey_not_supported: "இந்த சாதனத்தில் பாஸ்கீகள் ஆதரிக்கப்படவில்லை.",
    passkey_pa_not_supported:
      "பதிவுக்கு ஒரு தளம் அங்கீகரிப்பாளர் தேவைப்படுகிறது, ஆனால் சாதனம் அதை ஆதரிக்கவில்லை.",
    passkey_registration_cancelled:
      "பாஸ்கீ பதிவு ரத்து செய்யப்பட்டது அல்லது நேரம் முடிந்தது.",
    passkey_retrieval_cancelled:
      "பாஸ்கீ சரிபார்ப்பு ரத்து செய்யப்பட்டது அல்லது நேரம் முடிந்தது.",
    passwordComplexity: {
      maximumLength: "{{length}} எழுத்துகளுக்கும் குறைவாக",
      minimumLength: "{{length}} அல்லது அதற்கு மேற்பட்ட எழுத்துகள்",
      requireLowercase: "ஒரு சிறிய எழுத்து",
      requireNumbers: "ஒரு எண்",
      requireSpecialCharacter: "ஒரு சிறப்பு எழுத்து",
      requireUppercase: "ஒரு பெரிய எழுத்து",
      sentencePrefix: "உங்கள் கடவுச்சொல்லில் இருக்க வேண்டும்",
    },
    phone_number_exists:
      "இந்த தொலைபேசி எண் எடுக்கப்பட்டுள்ளது. வேறொன்றை முயற்சிக்கவும்.",
    web3_missing_identifier:
      "Web3 வாலட் நீட்டிப்பு காணப்படவில்லை. தொடர ஒன்றை நிறுவவும்.",
    zxcvbn: {
      couldBeStronger:
        "உங்கள் கடவுச்சொல் செயல்படுகிறது, ஆனால் மேலும் வலுவாக இருக்கலாம். மேலும் எழுத்துகளைச் சேர்க்க முயற்சிக்கவும்.",
      goodPassword:
        "உங்கள் கடவுச்சொல் அனைத்து தேவையான தேவைகளையும் பூர்த்தி செய்கிறது.",
      notEnough: "உங்கள் கடவுச்சொல் போதுமான வலிமை இல்லை.",
      suggestions: {
        allUppercase:
          "சில எழுத்துக்களை மட்டுமே பெரிய எழுத்தாக்கவும், அனைத்தையும் அல்ல.",
        anotherWord: "அரிதாக பயன்படுத்தப்படும் மேலும் சொற்களைச் சேர்க்கவும்.",
        associatedYears: "உங்களுடன் தொடர்புடைய ஆண்டுகளைத் தவிர்க்கவும்.",
        capitalization: "முதல் எழுத்தை விட அதிகமாக பெரிய எழுத்தாக்கவும்.",
        dates: "உங்களுடன் தொடர்புடைய தேதிகள் மற்றும் ஆண்டுகளைத் தவிர்க்கவும்.",
        l33t: "'a' க்கு பதிலாக '@' போன்ற கணிக்கக்கூடிய எழுத்து மாற்றங்களைத் தவிர்க்கவும்.",
        longerKeyboardPattern:
          "நீளமான விசைப்பலகை முறைகளைப் பயன்படுத்தி தட்டச்சு திசையை பல முறை மாற்றவும்.",
        noNeed:
          "சின்னங்கள், எண்கள் அல்லது பெரிய எழுத்துக்களைப் பயன்படுத்தாமல் வலுவான கடவுச்சொற்களை உருவாக்கலாம்.",
        pwned:
          "இந்த கடவுச்சொல்லை வேறு எங்காவது பயன்படுத்தினால், அதை மாற்ற வேண்டும்.",
        recentYears: "சமீபத்திய ஆண்டுகளைத் தவிர்க்கவும்.",
        repeated:
          "தொடர்ந்து வரும் சொற்கள் மற்றும் எழுத்துக்களைத் தவிர்க்கவும்.",
        reverseWords: "பொதுவான சொற்களின் எதிர் எழுத்துக்களைத் தவிர்க்கவும்.",
        sequences: "பொதுவான எழுத்து வரிசைகளைத் தவிர்க்கவும்.",
        useWords:
          "பல சொற்களைப் பயன்படுத்தவும், ஆனால் பொதுவான சொற்றொடர்களைத் தவிர்க்கவும்.",
      },
      warnings: {
        common: "இது ஒரு பொதுவாகப் பயன்படுத்தப்படும் கடவுச்சொல்.",
        commonNames:
          "பொதுவான பெயர்கள் மற்றும் குடும்பப் பெயர்களை எளிதில் கண்டுபிடிக்க முடியும்.",
        dates: "தேதிகளை எளிதில் கண்டுபிடிக்க முடியும்.",
        extendedRepeat:
          '"abcabcabc" போன்ற மீண்டும் மீண்டும் வரும் எழுத்து முறைகளை எளிதில் கண்டுபிடிக்க முடியும்.',
        keyPattern: "குறுகிய விசைப்பலகை முறைகளை எளிதில் கண்டுபிடிக்க முடியும்.",
        namesByThemselves:
          "ஒற்றை பெயர்கள் அல்லது குடும்பப் பெயர்களை எளிதில் கண்டுபிடிக்க முடியும்.",
        pwned:
          "உங்கள் கடவுச்சொல் இணையத்தில் தரவு மீறல் மூலம் வெளிப்பட்டுள்ளது.",
        recentYears: "சமீபத்திய ஆண்டுகளை எளிதில் கண்டுபிடிக்க முடியும்.",
        sequences:
          '"abc" போன்ற பொதுவான எழுத்து வரிசைகளை எளிதில் கண்டுபிடிக்க முடியும்.',
        similarToCommon:
          "இது பொதுவாகப் பயன்படுத்தப்படும் கடவுச்சொல்லை ஒத்துள்ளது.",
        simpleRepeat:
          '"aaa" போன்ற மீண்டும் மீண்டும் வரும் எழுத்துக்களை எளிதில் கண்டுபிடிக்க முடியும்.',
        straightRow:
          "உங்கள் விசைப்பலகையில் நேர்கோட்டில் உள்ள விசைகளை எளிதில் கண்டுபிடிக்க முடியும்.",
        topHundred: "இது அடிக்கடி பயன்படுத்தப்படும் கடவுச்சொல்.",
        topTen: "இது மிகவும் அதிகமாக பயன்படுத்தப்படும் கடவுச்சொல்.",
        userInputs: "தனிப்பட்ட அல்லது பக்கம் தொடர்பான தரவுகள் இருக்கக்கூடாது.",
        wordByItself: "ஒற்றை சொற்களை எளிதில் கண்டுபிடிக்க முடியும்.",
      },
    },
  },
  userButton: {
    action__addAccount: "கணக்கைச் சேர்",
    action__manageAccount: "கணக்கை நிர்வகி",
    action__signOut: "வெளியேறு",
    action__signOutAll: "அனைத்து கணக்குகளிலிருந்தும் வெளியேறு",
  },
  userProfile: {
    __experimental_billingPage: {
      start: {
        headerTitle__invoices: "இன்வாய்ஸ்கள்",
        headerTitle__paymentSources: "கட்டண மூலங்கள்",
        headerTitle__plans: "திட்டங்கள்",
      },
      title: "கட்டணம் & செலுத்துதல்கள்",
      paymentSourcesSection: {
        title: "கிடைக்கும் விருப்பங்கள்",
        add: "புதிய கட்டண மூலத்தைச் சேர்க்கவும்",
        addSubtitle: "உங்கள் கணக்கில் புதிய கட்டண மூலத்தைச் சேர்க்கவும்.",
        cancelButton: "ரத்து செய்",
        actionLabel__default: "இயல்புநிலையாக்கு",
        actionLabel__remove: "நீக்கு",
        formButtonPrimary__add: "கட்டண முறையைச் சேர்",
        formButtonPrimary__pay: "{{amount}} செலுத்து",
        removeResource: {
          title: "கட்டண மூலத்தை நீக்கு",
          messageLine1: "{{identifier}} இந்த கணக்கிலிருந்து நீக்கப்படும்.",
          messageLine2:
            "இந்த கட்டண மூலத்தை இனி பயன்படுத்த முடியாது மற்றும் அதைச் சார்ந்த எந்த தொடர் சந்தாக்களும் இனி செயல்படாது.",
          successMessage:
            "{{paymentSource}} உங்கள் கணக்கிலிருந்து நீக்கப்பட்டது.",
        },
      },
    },
    backupCodePage: {
      actionLabel__copied: "நகலெடுக்கப்பட்டது!",
      actionLabel__copy: "அனைத்தையும் நகலெடு",
      actionLabel__download: ".txt பதிவிறக்கு",
      actionLabel__print: "அச்சிடு",
      infoText1: "காப்புக் குறியீடுகள் இந்த கணக்கில் இயக்கப்படும்.",
      infoText2:
        "காப்புக் குறியீடுகளை ரகசியமாக வைத்து பாதுகாப்பாக சேமிக்கவும். அவை சமரசம் செய்யப்பட்டிருக்கலாம் என்று நீங்கள் சந்தேகித்தால் காப்புக் குறியீடுகளை மீண்டும் உருவாக்கலாம்.",
      subtitle__codelist:
        "அவற்றை பாதுகாப்பாக சேமித்து ரகசியமாக வைத்திருக்கவும்.",
      successMessage:
        "காப்புக் குறியீடுகள் இப்போது இயக்கப்பட்டுள்ளன. உங்கள் அங்கீகார சாதனத்திற்கான அணுகலை இழந்தால், உங்கள் கணக்கில் உள்நுழைய இவற்றில் ஒன்றைப் பயன்படுத்தலாம். ஒவ்வொரு குறியீடும் ஒரு முறை மட்டுமே பயன்படுத்தப்படலாம்.",
      successSubtitle:
        "உங்கள் அங்கீகார சாதனத்திற்கான அணுகலை இழந்தால், உங்கள் கணக்கில் உள்நுழைய இவற்றில் ஒன்றைப் பயன்படுத்தலாம்.",
      title: "காப்புக் குறியீடு சரிபார்ப்பைச் சேர்",
      title__codelist: "காப்புக் குறியீடுகள்",
    },
    connectedAccountPage: {
      formHint: "உங்கள் கணக்கை இணைக்க ஒரு வழங்குநரைத் தேர்ந்தெடுக்கவும்.",
      formHint__noAccounts:
        "கிடைக்கக்கூடிய வெளிப்புற கணக்கு வழங்குநர்கள் எதுவும் இல்லை.",
      removeResource: {
        messageLine1: "{{identifier}} இந்த கணக்கிலிருந்து நீக்கப்படும்.",
        messageLine2:
          "இந்த இணைக்கப்பட்ட கணக்கைப் இனி பயன்படுத்த முடியாது மற்றும் எந்த சார்ந்த அம்சங்களும் இனி செயல்படாது.",
        successMessage:
          "{{connectedAccount}} உங்கள் கணக்கிலிருந்து நீக்கப்பட்டது.",
        title: "இணைக்கப்பட்ட கணக்கை நீக்கு",
      },
      socialButtonsBlockButton: "{{provider|titleize}}",
      successMessage: "வழங்குநர் உங்கள் கணக்கில் சேர்க்கப்பட்டுள்ளது",
      title: "இணைக்கப்பட்ட கணக்கைச் சேர்",
    },
    deletePage: {
      actionDescription: 'தொடர கீழே "Delete account" என்று உள்ளிடவும்.',
      confirm: "கணக்கை நீக்கு",
      messageLine1: "உங்கள் கணக்கை நீக்க விரும்புகிறீர்களா?",
      messageLine2: "இந்த செயல் நிரந்தரமானது மற்றும் மாற்ற முடியாதது.",
      title: "கணக்கை நீக்கு",
    },
    emailAddressPage: {
      emailCode: {
        formHint:
          "இந்த மின்னஞ்சல் முகவரிக்கு ஒரு சரிபார்ப்புக் குறியீடு கொண்ட மின்னஞ்சல் அனுப்பப்படும்.",
        formSubtitle:
          "{{identifier}} க்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
        formTitle: "சரிபார்ப்புக் குறியீடு",
        resendButton: "குறியீடு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
        successMessage:
          "மின்னஞ்சல் {{identifier}} உங்கள் கணக்கில் சேர்க்கப்பட்டது.",
      },
      emailLink: {
        formHint:
          "இந்த மின்னஞ்சல் முகவரிக்கு ஒரு சரிபார்ப்பு இணைப்பு கொண்ட மின்னஞ்சல் அனுப்பப்படும்.",
        formSubtitle:
          "{{identifier}} க்கு அனுப்பப்பட்ட மின்னஞ்சலில் உள்ள சரிபார்ப்பு இணைப்பைக் கிளிக் செய்யவும்",
        formTitle: "சரிபார்ப்பு இணைப்பு",
        resendButton: "இணைப்பு கிடைக்கவில்லையா? மீண்டும் அனுப்பு",
        successMessage:
          "மின்னஞ்சல் {{identifier}} உங்கள் கணக்கில் சேர்க்கப்பட்டது.",
      },
      enterpriseSSOLink: {
        formButton: "உள்நுழைய கிளிக் செய்யவும்",
        formSubtitle: "{{identifier}} உடன் உள்நுழைவை முடிக்கவும்",
      },
      formHint:
        "இந்த மின்னஞ்சல் முகவரியை உங்கள் கணக்கில் சேர்க்கும் முன் அதை சரிபார்க்க வேண்டும்.",
      removeResource: {
        messageLine1: "{{identifier}} இந்த கணக்கிலிருந்து நீக்கப்படும்.",
        messageLine2:
          "இந்த மின்னஞ்சல் முகவரியைப் பயன்படுத்தி இனி உள்நுழைய முடியாது.",
        successMessage: "{{emailAddress}} உங்கள் கணக்கிலிருந்து நீக்கப்பட்டது.",
        title: "மின்னஞ்சல் முகவரியை நீக்கு",
      },
      title: "மின்னஞ்சல் முகவரியைச் சேர்",
      verifyTitle: "மின்னஞ்சல் முகவரியை சரிபார்க்கவும்",
    },
    formButtonPrimary__add: "சேர்",
    formButtonPrimary__continue: "தொடரவும்",
    formButtonPrimary__finish: "முடிக்கவும்",
    formButtonPrimary__remove: "நீக்கு",
    formButtonPrimary__save: "சேமி",
    formButtonReset: "ரத்து செய்",
    mfaPage: {
      formHint: "சேர்க்க ஒரு முறையைத் தேர்ந்தெடுக்கவும்.",
      title: "இரண்டு-படி சரிபார்ப்பைச் சேர்",
    },
    mfaPhoneCodePage: {
      backButton: "இருக்கும் எண்ணைப் பயன்படுத்து",
      primaryButton__addPhoneNumber: "தொலைபேசி எண்ணைச் சேர்",
      removeResource: {
        messageLine1:
          "{{identifier}} இனி உள்நுழையும் போது சரிபார்ப்புக் குறியீடுகளைப் பெறாது.",
        messageLine2:
          "உங்கள் கணக்கு பாதுகாப்பாக இல்லாமல் இருக்கலாம். தொடர விரும்புகிறீர்களா?",
        successMessage:
          "{{mfaPhoneCode}} க்கான SMS குறியீடு இரண்டு-படி சரிபார்ப்பு நீக்கப்பட்டது",
        title: "இரண்டு-படி சரிபார்ப்பை நீக்கு",
      },
      subtitle__availablePhoneNumbers:
        "SMS குறியீடு இரண்டு-படி சரிபார்ப்புக்காக ஏற்கனவே உள்ள தொலைபேசி எண்ணைத் தேர்ந்தெடுக்கவும் அல்லது புதியதைச் சேர்க்கவும்.",
      subtitle__unavailablePhoneNumbers:
        "SMS குறியீடு இரண்டு-படி சரிபார்ப்புக்காக பதிவு செய்ய கிடைக்கக்கூடிய தொலைபேசி எண்கள் எதுவும் இல்லை, தயவுசெய்து புதியதைச் சேர்க்கவும்.",
      successMessage1:
        "உள்நுழையும் போது, கூடுதல் படியாக இந்த தொலைபேசி எண்ணுக்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிட வேண்டும்.",
      successMessage2:
        "இந்த காப்புக் குறியீடுகளைச் சேமித்து அவற்றை பாதுகாப்பான இடத்தில் வைக்கவும். உங்கள் அங்கீகார சாதனத்திற்கான அணுகலை இழந்தால், உள்நுழைய காப்புக் குறியீடுகளைப் பயன்படுத்தலாம்.",
      successTitle: "SMS குறியீடு சரிபார்ப்பு இயக்கப்பட்டது",
      title: "SMS குறியீடு சரிபார்ப்பைச் சேர்",
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: "QR குறியீட்டை ஸ்கேன் செய்",
        buttonUnableToScan__nonPrimary:
          "QR குறியீட்டை ஸ்கேன் செய்ய முடியவில்லையா?",
        infoText__ableToScan:
          "உங்கள் அங்கீகாரி பயன்பாட்டில் ஒரு புதிய உள்நுழைவு முறையை அமைத்து, பின்வரும் QR குறியீட்டை ஸ்கேன் செய்து உங்கள் கணக்குடன் இணைக்கவும்.",
        infoText__unableToScan:
          "உங்கள் அங்கீகாரியில் ஒரு புதிய உள்நுழைவு முறையை அமைத்து, கீழே வழங்கப்பட்ட விசையை உள்ளிடவும்.",
        inputLabel__unableToScan1:
          "நேரம் அடிப்படையிலான அல்லது ஒருமுறை கடவுச்சொற்கள் இயக்கப்பட்டுள்ளதா என்பதை உறுதிப்படுத்தி, பின்னர் உங்கள் கணக்கை இணைத்தல் முடிக்கவும்.",
        inputLabel__unableToScan2:
          "மாற்றாக, உங்கள் அங்கீகாரி TOTP URI களை ஆதரித்தால், முழு URI ஐ நகலெடுக்கலாம்.",
      },
      removeResource: {
        messageLine1:
          "இந்த அங்கீகாரியிலிருந்து சரிபார்ப்புக் குறியீடுகள் இனி உள்நுழையும் போது தேவைப்படாது.",
        messageLine2:
          "உங்கள் கணக்கு பாதுகாப்பாக இல்லாமல் இருக்கலாம். தொடர விரும்புகிறீர்களா?",
        successMessage:
          "அங்கீகாரி பயன்பாடு மூலம் இரண்டு-படி சரிபார்ப்பு நீக்கப்பட்டது.",
        title: "இரண்டு-படி சரிபார்ப்பை நீக்கு",
      },
      successMessage:
        "இரண்டு-படி சரிபார்ப்பு இப்போது இயக்கப்பட்டுள்ளது. உள்நுழையும் போது, கூடுதல் படியாக இந்த அங்கீகாரியிலிருந்து ஒரு சரிபார்ப்புக் குறியீட்டை உள்ளிட வேண்டும்.",
      title: "அங்கீகாரி பயன்பாட்டைச் சேர்",
      verifySubtitle:
        "உங்கள் அங்கீகாரியால் உருவாக்கப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
      verifyTitle: "சரிபார்ப்புக் குறியீடு",
    },
    mobileButton__menu: "மெனு",
    navbar: {
      account: "சுயவிவரம்",
      billing: "கட்டணம்",
      description: "உங்கள் கணக்கு தகவலை நிர்வகிக்கவும்.",
      security: "பாதுகாப்பு",
      title: "கணக்கு",
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: "{{name}} இந்த கணக்கிலிருந்து நீக்கப்படும்.",
        title: "பாஸ்கீயை நீக்கு",
      },
      subtitle__rename: "எளிதாக கண்டுபிடிக்க பாஸ்கீ பெயரை மாற்றலாம்.",
      title__rename: "பாஸ்கீயை மறுபெயரிடு",
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        "உங்கள் பழைய கடவுச்சொல்லைப் பயன்படுத்தியிருக்கக்கூடிய மற்ற அனைத்து சாதனங்களிலிருந்தும் வெளியேறுவது பரிந்துரைக்கப்படுகிறது.",
      readonly:
        "நிறுவன இணைப்பு மூலம் மட்டுமே உள்நுழைய முடியும் என்பதால் உங்கள் கடவுச்சொல்லை தற்போது திருத்த முடியாது.",
      successMessage__set: "உங்கள் கடவுச்சொல் அமைக்கப்பட்டுள்ளது.",
      successMessage__signOutOfOtherSessions:
        "மற்ற அனைத்து சாதனங்களும் வெளியேற்றப்பட்டுள்ளன.",
      successMessage__update: "உங்கள் கடவுச்சொல் புதுப்பிக்கப்பட்டுள்ளது.",
      title__set: "கடவுச்சொல்லை அமைக்கவும்",
      title__update: "கடவுச்சொல்லைப் புதுப்பிக்கவும்",
    },
    phoneNumberPage: {
      infoText:
        "இந்த தொலைபேசி எண்ணுக்கு ஒரு சரிபார்ப்புக் குறியீடு கொண்ட உரைச் செய்தி அனுப்பப்படும். செய்தி மற்றும் தரவு கட்டணங்கள் பொருந்தலாம்.",
      removeResource: {
        messageLine1: "{{identifier}} இந்த கணக்கிலிருந்து நீக்கப்படும்.",
        messageLine2:
          "இந்த தொலைபேசி எண்ணைப் பயன்படுத்தி இனி உள்நுழைய முடியாது.",
        successMessage: "{{phoneNumber}} உங்கள் கணக்கிலிருந்து நீக்கப்பட்டது.",
        title: "தொலைபேசி எண்ணை நீக்கு",
      },
      successMessage: "{{identifier}} உங்கள் கணக்கில் சேர்க்கப்பட்டது.",
      title: "தொலைபேசி எண்ணைச் சேர்",
      verifySubtitle:
        "{{identifier}} க்கு அனுப்பப்பட்ட சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்",
      verifyTitle: "தொலைபேசி எண்ணை சரிபார்க்கவும்",
    },
    profilePage: {
      fileDropAreaHint: "பரிந்துரைக்கப்பட்ட அளவு 1:1, 10MB வரை.",
      imageFormDestructiveActionSubtitle: "நீக்கு",
      imageFormSubtitle: "பதிவேற்று",
      imageFormTitle: "சுயவிவர படம்",
      readonly:
        "உங்கள் சுயவிவர தகவல் நிறுவன இணைப்பால் வழங்கப்பட்டுள்ளது மற்றும் திருத்த முடியாது.",
      successMessage: "உங்கள் சுயவிவரம் புதுப்பிக்கப்பட்டுள்ளது.",
      title: "சுயவிவரத்தைப் புதுப்பிக்கவும்",
    },
    start: {
      activeDevicesSection: {
        destructiveAction: "சாதனத்திலிருந்து வெளியேறு",
        title: "செயலில் உள்ள சாதனங்கள்",
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: "மீண்டும் இணைக்கவும்",
        actionLabel__reauthorize: "இப்போது அங்கீகரிக்கவும்",
        destructiveActionTitle: "நீக்கு",
        primaryButton: "கணக்கை இணைக்கவும்",
        subtitle__disconnected: "இந்த கணக்கு துண்டிக்கப்பட்டுள்ளது.",
        subtitle__reauthorize:
          "தேவையான நோக்கங்கள் புதுப்பிக்கப்பட்டுள்ளன, மற்றும் நீங்கள் வரம்பிற்குட்பட்ட செயல்பாட்டை அனுபவிக்கலாம். சிக்கல்களைத் தவிர்க்க இந்த பயன்பாட்டை மீண்டும் அங்கீகரிக்கவும்",
        title: "இணைக்கப்பட்ட கணக்குகள்",
      },
      dangerSection: {
        deleteAccountButton: "கணக்கை நீக்கு",
        title: "கணக்கை நீக்கு",
      },
      emailAddressesSection: {
        destructiveAction: "மின்னஞ்சலை நீக்கு",
        detailsAction__nonPrimary: "முதன்மையாக அமைக்கவும்",
        detailsAction__primary: "சரிபார்ப்பை முடிக்கவும்",
        detailsAction__unverified: "சரிபார்க்கவும்",
        primaryButton: "மின்னஞ்சல் முகவரியைச் சேர்",
        title: "மின்னஞ்சல் முகவரிகள்",
      },
      enterpriseAccountsSection: {
        title: "நிறுவன கணக்குகள்",
      },
      headerTitle__account: "சுயவிவர விவரங்கள்",
      headerTitle__security: "பாதுகாப்பு",
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: "மீண்டும் உருவாக்கு",
          headerTitle: "காப்புக் குறியீடுகள்",
          subtitle__regenerate:
            "புதிய பாதுகாப்பான காப்புக் குறியீடுகளைப் பெறுங்கள். முந்தைய காப்புக் குறியீடுகள் நீக்கப்பட்டு பயன்படுத்த முடியாது.",
          title__regenerate: "காப்புக் குறியீடுகளை மீண்டும் உருவாக்கு",
        },
        phoneCode: {
          actionLabel__setDefault: "இயல்புநிலையாக அமைக்கவும்",
          destructiveActionLabel: "நீக்கு",
        },
        primaryButton: "இரண்டு-படி சரிபார்ப்பைச் சேர்",
        title: "இரண்டு-படி சரிபார்ப்பு",
        totp: {
          destructiveActionTitle: "நீக்கு",
          headerTitle: "அங்கீகாரி பயன்பாடு",
        },
      },
      passkeysSection: {
        menuAction__destructive: "நீக்கு",
        menuAction__rename: "மறுபெயரிடு",
        primaryButton: "பாஸ்கீயைச் சேர்",
        title: "பாஸ்கீகள்",
      },
      passwordSection: {
        primaryButton__setPassword: "கடவுச்சொல்லை அமைக்கவும்",
        primaryButton__updatePassword: "கடவுச்சொல்லைப் புதுப்பிக்கவும்",
        title: "கடவுச்சொல்",
      },
      phoneNumbersSection: {
        destructiveAction: "தொலைபேசி எண்ணை நீக்கு",
        detailsAction__nonPrimary: "முதன்மையாக அமைக்கவும்",
        detailsAction__primary: "சரிபார்ப்பை முடிக்கவும்",
        detailsAction__unverified: "தொலைபேசி எண்ணை சரிபார்க்கவும்",
        primaryButton: "தொலைபேசி எண்ணைச் சேர்",
        title: "தொலைபேசி எண்கள்",
      },
      profileSection: {
        primaryButton: "சுயவிவரத்தைப் புதுப்பிக்கவும்",
        title: "சுயவிவரம்",
      },
      usernameSection: {
        primaryButton__setUsername: "பயனர்பெயரை அமைக்கவும்",
        primaryButton__updateUsername: "பயனர்பெயரைப் புதுப்பிக்கவும்",
        title: "பயனர்பெயர்",
      },
      web3WalletsSection: {
        destructiveAction: "வாலட்டை நீக்கு",
        detailsAction__nonPrimary: "முதன்மையாக அமைக்கவும்",
        primaryButton: "வாலட்டை இணைக்கவும்",
        title: "Web3 வாலட்டுகள்",
      },
    },
    usernamePage: {
      successMessage: "உங்கள் பயனர்பெயர் புதுப்பிக்கப்பட்டுள்ளது.",
      title__set: "பயனர்பெயரை அமைக்கவும்",
      title__update: "பயனர்பெயரைப் புதுப்பிக்கவும்",
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: "{{identifier}} இந்த கணக்கிலிருந்து நீக்கப்படும்.",
        messageLine2: "இந்த web3 வாலட்டைப் பயன்படுத்தி இனி உள்நுழைய முடியாது.",
        successMessage: "{{web3Wallet}} உங்கள் கணக்கிலிருந்து நீக்கப்பட்டது.",
        title: "web3 வாலட்டை நீக்கு",
      },
      subtitle__availableWallets:
        "உங்கள் கணக்குடன் இணைக்க ஒரு web3 வாலட்டைத் தேர்ந்தெடுக்கவும்.",
      subtitle__unavailableWallets: "கிடைக்கக்கூடிய web3 வாலட்டுகள் இல்லை.",
      successMessage: "வாலட் உங்கள் கணக்கில் சேர்க்கப்பட்டுள்ளது.",
      title: "web3 வாலட்டைச் சேர்",
      web3WalletButtonsBlockButton: "{{provider|titleize}}",
    },
  },
  waitlist: {
    start: {
      actionLink: "உள்நுழை",
      actionText: "ஏற்கனவே அணுகல் உள்ளதா?",
      formButton: "காத்திருப்பில் சேரவும்",
      subtitle:
        "உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும், உங்கள் இடம் தயாராகும் போது உங்களுக்குத் தெரிவிப்போம்",
      title: "காத்திருப்பில் சேரவும்",
    },
    success: {
      message: "விரைவில் திருப்பி விடப்படுவீர்கள்...",
      subtitle: "உங்கள் இடம் தயாராகும் போது உங்களுடன் தொடர்பில் இருப்போம்",
      title: "காத்திருப்பில் சேர்ந்ததற்கு நன்றி!",
    },
  },
} as const;
