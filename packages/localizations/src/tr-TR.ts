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

export const trTR: LocalizationResource = {
  locale: 'tr-TR',
  backButton: 'Geri',
  badge__default: 'Varsayılan',
  badge__otherImpersonatorDevice: 'Farklı bir kılıkçı cihazı',
  badge__primary: 'Birincil',
  badge__requiresAction: 'Eylem gerekli',
  badge__thisDevice: 'Bu cihaz',
  badge__unverified: 'Doğrulanmamış',
  badge__userDevice: 'Kullanıcı cihazı',
  badge__you: 'Siz',
  createOrganization: {
    formButtonSubmit: 'Oluştur',
    invitePage: {
      formButtonReset: 'Atla',
    },
    title: 'Organizasyon oluştur',
  },
  dates: {
    lastDay: "Dün saat {{ date | timeString('tr-TR') }}",
    next6Days: "{{ date | weekday('tr-TR','long') }} saat {{ date | timeString('tr-TR') }}",
    nextDay: "Yarın saat {{ date | timeString('tr-TR') }}",
    numeric: "{{ date | numeric('tr-TR') }}",
    previous6Days: "Geçen hafta {{ date | weekday('tr-TR','long') }} saat {{ date | timeString('tr-TR') }}",
    sameDay: "Bugün saat {{ date | timeString('tr-TR') }}",
  },
  dividerText: 'veya',
  footerActionLink__useAnotherMethod: 'Başka bir yöntem kullan',
  footerPageLink__help: 'Yardım',
  footerPageLink__privacy: 'Gizlilik',
  footerPageLink__terms: 'Şartlar',
  formButtonPrimary: 'İleri',
  formButtonPrimary__verify: 'Verify',
  formFieldAction__forgotPassword: 'Şifremi unuttum',
  formFieldError__matchingPasswords: 'Şifreler eşleşiyor.',
  formFieldError__notMatchingPasswords: 'Şifreler eşleşmiyor.',
  formFieldError__verificationLinkExpired: 'The verification link expired. Please request a new link.',
  formFieldHintText__optional: 'İsteğe bağlı',
  formFieldHintText__slug: 'A slug is a human-readable ID that must be unique. It’s often used in URLs.',
  formFieldInputPlaceholder__backupCode: '',
  formFieldInputPlaceholder__confirmDeletionUserAccount: 'Delete account',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddress_username: '',
  formFieldInputPlaceholder__emailAddresses:
    'Boşluklar veya virgüllerle ayırarak bir veya daha fazla e-posta adresi girin veya yapıştırın',
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
  formFieldLabel__backupCode: 'Yedekleme kodu',
  formFieldLabel__confirmDeletion: 'Confirmation',
  formFieldLabel__confirmPassword: 'Şifreyi onayla',
  formFieldLabel__currentPassword: 'Mevcut şifre',
  formFieldLabel__emailAddress: 'E-posta adresi',
  formFieldLabel__emailAddress_username: 'E-posta adresi veya kullanıcı adı',
  formFieldLabel__emailAddresses: 'E-posta adresleri',
  formFieldLabel__firstName: 'Ad',
  formFieldLabel__lastName: 'Soyad',
  formFieldLabel__newPassword: 'Yeni şifre',
  formFieldLabel__organizationDomain: 'Domain',
  formFieldLabel__organizationDomainDeletePending: 'Delete pending invitations and suggestions',
  formFieldLabel__organizationDomainEmailAddress: 'Verification email address',
  formFieldLabel__organizationDomainEmailAddressDescription:
    'Enter an email address under this domain to receive a code and verify this domain.',
  formFieldLabel__organizationName: 'Organizasyon adı',
  formFieldLabel__organizationSlug: "Organizasyon slug'ı",
  formFieldLabel__passkeyName: undefined,
  formFieldLabel__password: 'Şifre',
  formFieldLabel__phoneNumber: 'Telefon numarası',
  formFieldLabel__role: 'Rol',
  formFieldLabel__signOutOfOtherSessions: 'Diğer cihazlardaki oturumlardan çık',
  formFieldLabel__username: 'Kullanıcı adı',
  impersonationFab: {
    action__signOut: 'Çıkış yap',
    title: '{{identifier}} olarak giriş yapıldı',
  },
  maintenanceMode: undefined,
  membershipRole__admin: 'Admin',
  membershipRole__basicMember: 'Üye',
  membershipRole__guestMember: 'Misafir',
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
      detailsTitle__inviteFailed: 'Daveiyeler gönderilemedi. Aşağıda belirtilen sorunları giderip tekrar deneyin:',
      formButtonPrimary__continue: 'Davetiye gönder',
      selectDropdown__role: 'Select role',
      subtitle: 'Bu organizasyona yeni üyeler davet edin',
      successMessage: 'Davetiyeler başarıyla gönderildi',
      title: 'Davetiye gönder',
    },
    membersPage: {
      action__invite: 'Davet et',
      activeMembersTab: {
        menuAction__remove: 'Üyeyi kaldır',
        tableHeader__actions: '',
        tableHeader__joined: 'Katılma tarihi',
        tableHeader__role: 'Rolü',
        tableHeader__user: 'Kullanıcı',
      },
      detailsTitle__emptyRow: 'Gösterilecek üye yok',
      invitationsTab: {
        autoInvitations: {
          headerSubtitle:
            'Invite users by connecting an email domain with your organization. Anyone who signs up with a matching email domain will be able to join the organization anytime.',
          headerTitle: 'Automatic invitations',
          primaryButton: 'Manage verified domains',
        },
        table__emptyRow: 'No invitations to display',
      },
      invitedMembersTab: {
        menuAction__revoke: 'Davetiyeyi iptal et',
        tableHeader__invited: 'Davetliler',
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
            'Bu organizasyondan ayrılmak istediğinizden emin misiniz? Bu organizasyona ve uygulamalarına erişiminizi kaybedeceksiniz.',
          messageLine2: 'bu eylem kalıcıdır ve geri alınamaz.',
          successMessage: 'Organizasyondan ayrıldınız.',
          title: 'Organizasyondan ayrıl',
        },
        title: 'Tehlike',
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
      successMessage: 'Organizasyon güncellendi.',
      title: 'Organizasyon profili',
    },
    removeDomainPage: {
      messageLine1: 'The email domain {{domain}} will be removed.',
      messageLine2: 'Users won’t be able to join the organization automatically after this.',
      successMessage: '{{domain}} has been removed.',
      title: 'Remove domain',
    },
    start: {
      headerTitle__general: 'General',
      headerTitle__members: 'Üyeler',
      profileSection: {
        primaryButton: '',
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
    action__createOrganization: 'Organizasyon oluştur',
    action__invitationAccept: 'Join',
    action__manageOrganization: 'Organizasyonu yönet',
    action__suggestionsAccept: 'Request to join',
    notSelected: 'Organizasyon seçilmedi',
    personalWorkspace: 'Kişisel Çalışma Alanı',
    suggestionsAcceptedLabel: 'Pending approval',
  },
  paginationButton__next: 'İleri',
  paginationButton__previous: 'Geri',
  paginationRowText__displaying: 'Sayfa bilgisi:',
  paginationRowText__of: '-',
  signIn: {
    accountSwitcher: {
      action__addAccount: 'Add account',
      action__signOutAll: 'Sign out of all accounts',
      subtitle: 'Select the account with which you wish to continue.',
      title: 'Choose an account',
    },
    alternativeMethods: {
      actionLink: 'Yardım al',
      actionText: 'Don’t have any of these?',
      blockButton__backupCode: 'Yedekleme kodu kullan',
      blockButton__emailCode: '{{identifier}} adresine doğrulama kodu gönder',
      blockButton__emailLink: '{{identifier}} adresine doğrulama bağlantısı gönder',
      blockButton__passkey: undefined,
      blockButton__password: 'Şifreyle giriş yap',
      blockButton__phoneCode: '{{identifier}} numarasına doğrulama kodu gönder',
      blockButton__totp: 'Authenticator uygulaması kullan',
      getHelp: {
        blockButton__emailSupport: 'E-posta desteği',
        content:
          'Eğer hesabınıza giriş yapmakta zorluk yaşıyorsanız, hesabınıza erişiminizi sağlayabilmemiz için bize bir e-posta gönderin ve size yardımcı olalım.',
        title: 'Yardım al',
      },
      subtitle: 'Facing issues? You can use any of these methods to sign in.',
      title: 'Farklı bir yöntem kullan',
    },
    backupCodeMfa: {
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'Yedekleme kodu girişi',
    },
    emailCode: {
      formTitle: 'Doğrulama kodu',
      resendButton: 'Kodu tekrar gönder',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'E-posta kutunuzu kontrol edin',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      expired: {
        subtitle: 'Devam etmek için en baştaki sekmeye dönün',
        title: 'Bu doğruşlama bağlantısının süresi dolmuş',
      },
      failed: {
        subtitle: 'Devam etmek için en baştaki sekmeye dönün',
        title: 'Bu doğrulama bağlantısı geçersiz',
      },
      formSubtitle: 'E-posta adresinize gönderdiğimiz doğrulama bağlantısına tıklayın',
      formTitle: 'Doğrulama bağlantısı',
      loading: {
        subtitle: 'Yönlediriliyorsunuz...',
        title: 'Giriş yapılıyor...',
      },
      resendButton: 'Tekrar gönder',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'E-posta kutunuzu kontrol edin',
      unusedTab: {
        title: 'Bu sekmeyi kapatabilirsiniz',
      },
      verified: {
        subtitle: 'Yönlediriliyorsunuz...',
        title: 'Başarıyla giriş yapıldı',
      },
      verifiedSwitchTab: {
        subtitle: 'Devam etmek için en baştaki sekmeye dönün',
        subtitleNewTab: 'Devam etmek için yeni açılmış sekmeye dönün',
        titleNewTab: 'Farklı bir sekmede giriş yapıldı',
      },
    },
    forgotPassword: {
      formTitle: 'Şifre sıfırlama kodu',
      resendButton: 'Tekrar gönder',
      subtitle: 'to reset your password',
      subtitle_email: 'First, enter the code sent to your email ID',
      subtitle_phone: 'First, enter the code sent to your phone',
      title: 'Reset password',
    },
    forgotPasswordAlternativeMethods: {
      blockButton__resetPassword: 'Şifremi sıfırla',
      label__alternativeMethods: 'Veya başka bir yöntem kullanın:',
      title: 'Şifremi unuttum',
    },
    noAvailableMethods: {
      message: 'Hesabınızda giriş yapmak için kullanabileceğiniz bir yöntem bulunmuyor.',
      subtitle: 'Bir hata oluştu',
      title: 'Giriş yapılamıyor',
    },
    passkey: {
      subtitle: undefined,
      title: undefined,
    },
    password: {
      actionLink: 'Başka bir yöntem kullan',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'Şifrenizi girin',
    },
    passwordPwned: {
      title: undefined,
    },
    phoneCode: {
      formTitle: 'Doğrulama kodu',
      resendButton: 'Tekrar gönder',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'Telefonunuza göz atın',
    },
    phoneCodeMfa: {
      formTitle: 'Doğrulama kodu',
      resendButton: 'Tekrar gönder',
      subtitle: '',
      title: 'Telefonunuza göz atın',
    },
    resetPassword: {
      formButtonPrimary: 'Şifremi sıfırla',
      requiredMessage: 'For security reasons, it is required to reset your password.',
      successMessage: 'Şifreniz başarıyla sıfırlandı. Oturumunuz açılıyor...',
      title: 'Şifre sıfırlama',
    },
    resetPasswordMfa: {
      detailsLabel: 'Şifrenizi sıfırlamadan önce kimliğinizi doğrulamamız gerekiyor.',
    },
    start: {
      actionLink: 'Kayıt ol',
      actionLink__use_email: 'E-posta kullan',
      actionLink__use_email_username: 'E-posta veya kullanıcı adı kullan',
      actionLink__use_passkey: undefined,
      actionLink__use_phone: 'Telefon kullan',
      actionLink__use_username: 'Kullanıcı adı kullan',
      actionText: 'Hesabınız yok mu?',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'Giriş yap',
    },
    totpMfa: {
      formTitle: 'Doğrulama kodu',
      subtitle: '',
      title: 'İki aşamalı doğrulama',
    },
  },
  signInEnterPasswordTitle: 'Şifrenizi girin',
  signUp: {
    continue: {
      actionLink: 'Giriş yap',
      actionText: 'Hesabınız var mı?',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'Eksik bilgileri tamamlayın',
    },
    emailCode: {
      formSubtitle: 'E-posta adresinize gönderdiğimiz doğrulama kodunu giriniz',
      formTitle: 'Doğrulama kodu',
      resendButton: 'Kodu tekrar gönder',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'E-posta adresinizi doğrulayın',
    },
    emailLink: {
      clientMismatch: {
        subtitle: undefined,
        title: undefined,
      },
      formSubtitle: 'E-posta adresinize gönderdiğimiz doğrulama bağlantısına tıklayın',
      formTitle: 'Doğrulama bağlantısı',
      loading: {
        title: 'Giriş yapılıyor...',
      },
      resendButton: 'Tekrar gönder',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'E-posta adresinizi doğrulayın',
      verified: {
        title: 'Başarıyla doğrulandı',
      },
      verifiedSwitchTab: {
        subtitle: 'Devam etmek için yeni açılmış sekmeye dönün',
        subtitleNewTab: 'Devam etmek için önceki sekmeye dönün',
        title: 'E-posta adresiniz başarıyla doğrulandı',
      },
    },
    phoneCode: {
      formSubtitle: 'Telefon numaranıza gönderdiğimiz doğrulama kodunu giriniz',
      formTitle: 'Doğrulama kodu',
      resendButton: 'Kodu tekrar gönder',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'Telefon numaranızı doğrulayın',
    },
    start: {
      actionLink: 'Giriş yap',
      actionText: 'Hesabınız var mı?',
      subtitle: '{{applicationName}} ile devam etmek için',
      title: 'Hesap oluştur',
    },
  },
  socialButtonsBlockButton: '{{provider|titleize}} ile giriş yapın',
  socialButtonsBlockButtonManyInView: undefined,
  unstable__errors: {
    captcha_invalid:
      'Sign up unsuccessful due to failed security validations. Please refresh the page to try again or reach out to support for more assistance.',
    captcha_unavailable:
      'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
    form_code_incorrect: 'Hatalı kod',
    form_identifier_exists: '',
    form_identifier_exists__email_address: undefined,
    form_identifier_exists__phone_number: undefined,
    form_identifier_exists__username: undefined,
    form_identifier_not_found: '',
    form_param_format_invalid: '',
    form_param_format_invalid__email_address: 'Email address must be a valid email address.',
    form_param_format_invalid__phone_number: 'Phone number must be in a valid international format',
    form_param_max_length_exceeded__first_name: 'First name should not exceed 256 characters.',
    form_param_max_length_exceeded__last_name: 'Last name should not exceed 256 characters.',
    form_param_max_length_exceeded__name: 'Name should not exceed 256 characters.',
    form_param_nil: '',
    form_password_incorrect: '',
    form_password_length_too_short: '',
    form_password_not_strong_enough: 'Şifreniz fazla zayıf',
    form_password_pwned:
      'Bu şifre bir veri saldırısında ele geçirildiği için kullanılamaz. Lütfen başka bir şifre deneyin.',
    form_password_pwned__sign_in: undefined,
    form_password_size_in_bytes_exceeded:
      'Şifrenize ayrılan depolama alanını aştınız. Lütfen daha kısa bir şifre deneyin.',
    form_password_validation_failed: 'Geçersiz şifre',
    form_username_invalid_character: '',
    form_username_invalid_length: '',
    identification_deletion_failed: 'You cannot delete your last identification.',
    not_allowed_access: '',
    passkey_already_exists: undefined,
    passkey_not_supported: undefined,
    passkey_pa_not_supported: undefined,
    passkey_registration_cancelled: undefined,
    passkey_retrieval_cancelled: undefined,
    passwordComplexity: {
      maximumLength: '{{length}} karakterden kısa olmalı',
      minimumLength: '{{length}} veya daha fazla karakter içermeli',
      requireLowercase: 'bir küçük harf içermeli',
      requireNumbers: 'bir sayı içermeli',
      requireSpecialCharacter: 'bir özel karakter içermeli',
      requireUppercase: 'bir büyük harf içermeli',
      sentencePrefix: 'Şifreniz;',
    },
    phone_number_exists: 'This phone number is taken. Please try another.',
    zxcvbn: {
      couldBeStronger: 'Şifreniz kriterleri sağlıyor, birkaç karakter daha eklerseniz daha güçlü olacaktır.',
      goodPassword: 'Harika! Şifreniz güçlü.',
      notEnough: 'Şifreniz fazla zayıf',
      suggestions: {
        allUppercase: 'Tüm harfleri büyük yazmak yerine rastgele büyük harfler kullanın.',
        anotherWord: 'Şifreniz nadir görülen sözcüklerden daha fazla içersin.',
        associatedYears: 'Kendinizle alakası olan yılları kullanmayın.',
        capitalization: 'Sadece ilk harfi büyük yazmak yerine rastgele büyük harfler kullanın.',
        dates: 'Kendinizle alakası olan tarihleri kullanmayın.',
        l33t: '"a" yerine "@" kullanmak gibi tahmin edilebilir harf ikamelerinden kaçının.',
        longerKeyboardPattern: 'Elinizin yönünü birden çok değiştirerek yazdığınız uzun klavye desenleri kullanın.',
        noNeed: 'Özel karakter, sayı veya büyük harf kullanmadan da güçlü bir şifre oluşturabilirsiniz.',
        pwned: 'Bu şifreyi başka bir yerde kullanıyorsanız, değiştirseniz iyi olur.',
        recentYears: 'Günümüze yakın yılları kullanmayın.',
        repeated: 'Kelime veya karakterleri tekrarlamayın.',
        reverseWords: 'Yaygın kelimelerin tersini kullanmaktan kaçının.',
        sequences: 'Yaygın desenleri kullanmayın.',
        useWords: 'Birden çok sözcük kullanın ama yaygın deyişlerden kaçının.',
      },
      warnings: {
        common: 'Bu yaygın bir şifre.',
        commonNames: 'Yaygın adlar ve soyadlar kolay tahmin edilir.',
        dates: 'Tarihleri tahmin etmek kolaydır.',
        extendedRepeat: '"abcabcabc" gibi tekrarlanan desenler kolay tahmin edilir.',
        keyPattern: 'Kısa klavye desenleri kolay tahmin edilir.',
        namesByThemselves: 'Adlar ya da soyadlar kolay tahmin edilir.',
        pwned: 'Bu şifre bir veri saldırısında ele geçirilmiş.',
        recentYears: 'Yakın yıllar kolay tahmin edilir.',
        sequences: '"abc" gibi yaygın desenlerin tahmini kolaydır.',
        similarToCommon: 'Bu yaygın kullanılan şifrelere çok benziyor.',
        simpleRepeat: 'Tekrarlanan karakterler kolay tahmin edilir.',
        straightRow: 'Klavyede ardışık karakterler kolay tahmin edilir.',
        topHundred: 'Bu çok yaygın bir şifre.',
        topTen: 'Bu epey yaygın bir şifre.',
        userInputs: 'Şifreniz kişisel bilgiler içermemeli.',
        wordByItself: 'Tek sözcükler kolay tahmin edilir.',
      },
    },
  },
  userButton: {
    action__addAccount: 'Hesap ekle',
    action__manageAccount: 'Hesabı yönet',
    action__signOut: 'Çıkış yap',
    action__signOutAll: 'Tüm hesaplardan çıkış yap',
  },
  userProfile: {
    backupCodePage: {
      actionLabel__copied: 'Kopyalandı!',
      actionLabel__copy: 'Hepsini kopayala',
      actionLabel__download: '.txt olarak indir',
      actionLabel__print: 'Yazdır',
      infoText1: 'Yedekleme kodları bu hesap için etkinleştirilecektir.',
      infoText2:
        'Yedekleme kodlarınızı güvenli bir yerde saklayın. Eğer bu kodlarınızın başkasının eline geçtiğini düşünürseniz, yenilerini oluşturabilirsiniz.',
      subtitle__codelist: 'Yedekleme kodlarınızı güvenli bir yerde saklayın.',
      successMessage:
        'Yedekleme kodları başarıyla eklendi. Eğer Authenticator uygulamanızın olduğu cihaza erişiminizi kaybettiyseniz, oturum açarken bu kodlardan birini girebilirsiniz. Her kod en fazla bir kez kullanılabilir.',
      successSubtitle:
        'Eğer Authenticator uygulamanızın olduğu cihazınıza erişiminizi kaybederseniz, bu kodlardan birini kullanarak hesabınıza giriş yapabilirsiniz.',
      title: 'Yedekleme kodu doğrulaması ekle',
      title__codelist: 'Yedekleme kodları',
    },
    connectedAccountPage: {
      formHint: 'Yeni bir hesap bağlamak için bir sağlayıcı seçiniz.',
      formHint__noAccounts: 'Kullanılabilir bir sağlayıcı yok.',
      removeResource: {
        messageLine1: '{{identifier}} hesabınızdan kaldırılacaktır.',
        messageLine2:
          'Artık bu bağlı hesabı kullanarak oturum açmanız mümkün olmayacaktır ve buna bağlı özellikler çalışmayacaktır.',
        successMessage: '{{connectedAccount}} hesabınızdan kaldırıldı.',
        title: 'Bağlı hesabı kaldır',
      },
      socialButtonsBlockButton: '{{provider|titleize}} hesabı bağla',
      successMessage: 'Sağlayıcı hesabınıza bağlandı.',
      title: 'Hesap bağla',
    },
    deletePage: {
      actionDescription: 'Type "Delete account" below to continue.',
      confirm: 'Delete account',
      messageLine1: 'Are you sure you want to delete your account?',
      messageLine2: 'This action is permanent and irreversible.',
      title: 'Delete account',
    },
    emailAddressPage: {
      emailCode: {
        formHint: 'Doğrulama kodunu içeren bir e-posta belirttiğiniz adrese gönderilecektir.',
        formSubtitle: '{{identifier}} adresine gönderilen doğrulama kodunu giriniz',
        formTitle: 'Doğrulama kodu',
        resendButton: 'Yeniden gönder',
        successMessage: '{{identifier}} adresi hesabınıza eklendi.',
      },
      emailLink: {
        formHint: 'Doğrulama bağlantısını içeren bir e-posta belirttiğiniz adrese gönderilecektir.',
        formSubtitle: '{{identifier}} adresine gönderilen doğrulama bağlantısını tıklayınız',
        formTitle: 'Doğrulama bağlantısı',
        resendButton: 'Yeniden gönder',
        successMessage: '{{identifier}} adresi hesabınıza eklendi.',
      },
      removeResource: {
        messageLine1: '{{identifier}} adresi hesabınızdan kaldırılacaktır.',
        messageLine2: 'Artık bu e-posta adresini kullanarak oturum açmanız mümkün olmayacaktır.',
        successMessage: '{{emailAddress}} adresi hesabınızdan kaldırıldı.',
        title: 'E-posta adresini kaldır',
      },
      title: 'E-posta adresi ekle',
      verifyTitle: 'Verify email address',
    },
    formButtonPrimary__add: 'Add',
    formButtonPrimary__continue: 'İlerle',
    formButtonPrimary__finish: 'Bitir',
    formButtonPrimary__remove: 'Remove',
    formButtonPrimary__save: 'Save',
    formButtonReset: 'İptal',
    mfaPage: {
      formHint: 'Eklemek için bir yöntem seçiniz.',
      title: 'İki aşamalı doğrulama yöntemi ekle',
    },
    mfaPhoneCodePage: {
      backButton: 'Use existing number',
      primaryButton__addPhoneNumber: 'Telefon numarası ekle',
      removeResource: {
        messageLine1: 'Giriş yaparken artık {{identifier}} numarasına SMS kodu gönderilmeyecektir.',
        messageLine2: 'Hesabınızın güvenliği azalabilir. Devam etmek istediğinizden emin misiniz?',
        successMessage: 'İki aşamalı SMS kodu doğrulaması {{mfaPhoneCode}} numarasından kaldırıldı.',
        title: 'İki aşamalı doğrulamayı kaldır',
      },
      subtitle__availablePhoneNumbers: 'İki aşamalı SMS kodu doğrulaması için bir telefon numarası seçin.',
      subtitle__unavailablePhoneNumbers:
        'İki aşamalı SMS kodu doğrulaması için kullanılabilir bir telefon numarası yok.',
      successMessage1:
        'When signing in, you will need to enter a verification code sent to this phone number as an additional step.',
      successMessage2:
        'Save these backup codes and store them somewhere safe. If you lose access to your authentication device, you can use backup codes to sign in.',
      successTitle: 'SMS code verification enabled',
      title: 'SMS kodu doğrulaması ekle',
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: 'Veya QR kodunu tarat',
        buttonUnableToScan__nonPrimary: 'QR kodunu tarayamıyorum',
        infoText__ableToScan:
          'Authenticator uygulamanızda yeni bir giriş yöntemi ayarlayın ve hesabınızla bağlamak için aşağıdaki QR kodunu tarayın.',
        infoText__unableToScan:
          'Authenticator uygulamanızda yeni bir giriş yöntemi ekleme seçeneğini bulun ve aşağıda verilen değeri girin:',
        inputLabel__unableToScan1:
          'Zaman bazlı veya tek seferlik şifrelerin etkinleştirildiğinden emin olun, ardından hesabınızı bağlamayı tamamlayın.',
        inputLabel__unableToScan2:
          'Alternatif olarak doğrulayıcınız TOTP URI’leri destekliyorsa, tam URI’yi de kopyalayabilirsiniz.',
      },
      removeResource: {
        messageLine1: "Artık giriş yaparken authenticator'dan gelecek doğrulama kodları gerekmeyecektir.",
        messageLine2: 'Hesabınızın güvenliği azalabilir. Devam etmek istediğinizden emin misiniz?',
        successMessage: 'İki aşamalı doğrulama yöntemi kaldırıldı.',
        title: 'İki aşamalı doğrulamayı kaldır',
      },
      successMessage:
        'İki aşamalı doğrulama yöntemi başarıyla eklendi. Oturum açarken, ek bir adım olarak bu doğrulayıcıdan bir doğrulama kodu girmeniz gerekecektir.',
      title: 'Authenticator uygulaması ekle',
      verifySubtitle: 'Authenticator uygulamanızda oluşturulan doğrulama kodunu giriniz',
      verifyTitle: 'Doğrulama kodu',
    },
    mobileButton__menu: 'Menü',
    navbar: {
      account: 'Profile',
      description: 'Manage your account info.',
      security: 'Security',
      title: 'Account',
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: undefined,
        title: undefined,
      },
      subtitle__rename: undefined,
      title__rename: undefined,
    },
    passwordPage: {
      checkboxInfoText__signOutOfOtherSessions:
        'It is recommended to sign out of all other devices which may have used your old password.',
      readonly: 'Your password can currently not be edited because you can sign in only via the enterprise connection.',
      successMessage__set: 'Şifreniz başarıyla değiştirildi.',
      successMessage__signOutOfOtherSessions: 'Diğer tüm cihazlardaki oturumlarınız sonlandırıldı.',
      successMessage__update: 'Şifreniz günceellendi.',
      title__set: 'Şifreyi değiştir',
      title__update: 'Yeni şifre girin',
    },
    phoneNumberPage: {
      infoText: 'Belirtilen numaraya doğrulama kodunu içeren bir SMS gönderilecektir.',
      removeResource: {
        messageLine1: '{{identifier}} numarası hesabınızdan kaldırılacaktır.',
        messageLine2: 'Artık bu telefon numarasını kullanarak oturum açmanız mümkün olmayacaktır.',
        successMessage: '{{phoneNumber}} numarası hesabınızdan kaldırıldı.',
        title: 'Telefon numarasını kaldır',
      },
      successMessage: '{{identifier}} numarası hesabınıza eklendi.',
      title: 'Telefon numarası ekle',
      verifySubtitle: 'Enter the verification code sent to {{identifier}}',
      verifyTitle: 'Verify phone number',
    },
    profilePage: {
      fileDropAreaHint: "10 MB'tan küçük boyutta bir JPG, PNG, GIF, veya WEBP dosyası yükle",
      imageFormDestructiveActionSubtitle: 'Görseli kaldır',
      imageFormSubtitle: 'Görsel yükle',
      imageFormTitle: 'Profil görseli',
      readonly: 'Your profile information has been provided by the enterprise connection and cannot be edited.',
      successMessage: 'Profiliniz güncellendi.',
      title: 'Profili güncelle',
    },
    start: {
      activeDevicesSection: {
        destructiveAction: 'Cihaz oturumunu sonlandır',
        title: 'Aktif cihazlar',
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: 'Yeniden dene',
        actionLabel__reauthorize: 'Yetkilendir',
        destructiveActionTitle: 'Kaldır',
        primaryButton: 'Hesap bağla',
        subtitle__disconnected: undefined,
        subtitle__reauthorize:
          'The required scopes have been updated, and you may be experiencing limited functionality. Please re-authorize this application to avoid any issues',
        title: 'Bağlı hesaplar',
      },
      dangerSection: {
        deleteAccountButton: 'Hesabı sil',
        title: 'Tehlike',
      },
      emailAddressesSection: {
        destructiveAction: 'E-posta adresini kaldır',
        detailsAction__nonPrimary: 'Birincil e-posta adresi yap',
        detailsAction__primary: 'Doğrulamayı tamamla',
        detailsAction__unverified: 'Doğrulamayı tamamla',
        primaryButton: 'E-posta adresi ekle',
        title: 'E-posta adresleri',
      },
      enterpriseAccountsSection: {
        title: 'Enterprise accounts',
      },
      headerTitle__account: 'Hesap',
      headerTitle__security: 'Güvenlik',
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: 'Kodları yenile',
          headerTitle: 'Yedekleme kodları',
          subtitle__regenerate:
            'Yeni bir dizi güvenli yedekleme kodu alın. Önceki yedekleme kodları silinecek ve kullanılamayacaktır.',
          title__regenerate: 'Yedekleme kodlarını yenile',
        },
        phoneCode: {
          actionLabel__setDefault: 'Varsayılan olarak ayarla',
          destructiveActionLabel: 'Telefon numarasını kaldır',
        },
        primaryButton: 'İki aşamalı doğrulama ekle',
        title: 'İki aşamalı doğrulama',
        totp: {
          destructiveActionTitle: 'Kaldır',
          headerTitle: 'Authenticator uygulaması',
        },
      },
      passkeysSection: {
        menuAction__destructive: undefined,
        menuAction__rename: undefined,
        title: undefined,
      },
      passwordSection: {
        primaryButton__setPassword: 'Şifreyi güncelle',
        primaryButton__updatePassword: 'Şifreyi değiştir',
        title: 'Şifre',
      },
      phoneNumbersSection: {
        destructiveAction: 'Telefon numarasını kaldır',
        detailsAction__nonPrimary: 'Birincil yap',
        detailsAction__primary: 'Doğrulamayı tamamla',
        detailsAction__unverified: 'Doğrulamayı tamamla',
        primaryButton: 'Telefon numarası ekle',
        title: 'Telefon numaraları',
      },
      profileSection: {
        primaryButton: '',
        title: 'Profil',
      },
      usernameSection: {
        primaryButton__setUsername: 'Güncelle',
        primaryButton__updateUsername: 'Kullanıcı adını değiştir',
        title: 'Kullanıcı adı',
      },
      web3WalletsSection: {
        destructiveAction: 'Cüzdanı kaldır',
        primaryButton: 'Web3 cüzdanları',
        title: 'Web3 cüzdanları',
      },
    },
    usernamePage: {
      successMessage: 'Kullanıcı adınız güncellendi.',
      title__set: 'Kullanıcı adını güncelle',
      title__update: 'Kullanıcı adını güncelle',
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: '{{identifier}} cüzdanı hesabınızdan kaldırılacaktır.',
        messageLine2: 'Artık bu cüzdanı kullanarak oturum açmanız mümkün olmayacaktır.',
        successMessage: '{{web3Wallet}} cüzdanı hesabınızdan kaldırıldı.',
        title: 'Web3 cüzdanını kaldır',
      },
      subtitle__availableWallets: 'Hesabınıza eklemek için bir web3 cüzdanı seçiniz.',
      subtitle__unavailableWallets: 'Kullanılabilir bir web3 cüzdanı yok.',
      successMessage: 'Web3 cüzdanınız hesabınıza eklendi.',
      title: 'Web3 cüzdanı ekle',
    },
  },
} as const;
