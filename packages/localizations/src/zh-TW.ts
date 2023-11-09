import type { LocalizationResource } from '@clerk/types';

const commonTexts = {
  signIn: {
    phoneCode: {
      title: '檢查手機簡訊',
      subtitle: '繼續使用 {{applicationName}}',
      formTitle: '驗證碼',
      formSubtitle: '使用發送到您手機的驗證碼',
      resendButton: '重新發送驗證碼',
    },
  },
} as const;

export const zhTW: LocalizationResource = {
  locale: 'zh-TW',
  socialButtonsBlockButton: '使用 {{provider|titleize}} 登錄',
  dividerText: '或者',
  formFieldLabel__emailAddress: '電子郵件地址',
  formFieldLabel__emailAddresses: '電子郵件地址',
  formFieldLabel__phoneNumber: '電話號碼',
  formFieldLabel__username: '使用者名稱',
  formFieldLabel__emailAddress_phoneNumber: '電子郵件地址或電話號碼',
  formFieldLabel__emailAddress_username: '電子郵件地址或使用者名稱',
  formFieldLabel__phoneNumber_username: '電話號碼或使用者名稱',
  formFieldLabel__emailAddress_phoneNumber_username: '電子郵件地址、電話號碼或使用者名稱',
  formFieldLabel__password: '密碼',
  formFieldLabel__currentPassword: '當前密碼',
  formFieldLabel__newPassword: '新密碼',
  formFieldLabel__confirmPassword: '確認密碼',
  formFieldLabel__signOutOfOtherSessions: '登出所有其他設備',
  formFieldLabel__firstName: '名字',
  formFieldLabel__lastName: '姓氏',
  formFieldLabel__backupCode: '備用代碼',
  formFieldLabel__organizationName: '組織名稱',
  formFieldLabel__organizationSlug: 'URL 簡稱',
  formFieldLabel__confirmDeletion: '確定',
  formFieldLabel__role: '角色',
  formFieldInputPlaceholder__emailAddress: '',
  formFieldInputPlaceholder__emailAddresses: '輸入或黏貼一個或多個電子郵件地址，用空格或逗號分隔',
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
  formFieldError__notMatchingPasswords: `密碼不匹配。`,
  formFieldError__matchingPasswords: '密碼匹配。',
  formFieldAction__forgotPassword: '忘記密碼？',
  formFieldHintText__optional: '選填',
  formButtonPrimary: '繼續',
  signInEnterPasswordTitle: '輸入您的密碼',
  backButton: '返回',
  footerActionLink__useAnotherMethod: '使用另一種方法',
  badge__primary: '主要',
  badge__thisDevice: '此設備',
  badge__userDevice: '用戶設備',
  badge__otherImpersonatorDevice: '其他模擬器設備',
  badge__default: '默認',
  badge__unverified: '未驗證',
  badge__requiresAction: '需要操作',
  badge__you: '您',
  footerPageLink__help: '幫助',
  footerPageLink__privacy: '隱私',
  footerPageLink__terms: '條款',
  paginationButton__previous: '上一頁',
  paginationButton__next: '下一頁',
  paginationRowText__displaying: '顯示',
  paginationRowText__of: '的',
  membershipRole__admin: '管理員',
  membershipRole__basicMember: '成員',
  membershipRole__guestMember: '訪客',
  signUp: {
    start: {
      title: '創建您的帳戶',
      subtitle: '繼續使用 {{applicationName}}',
      actionText: '已經有帳戶了？',
      actionLink: '登錄',
    },
    emailLink: {
      title: '驗證您的電子郵件',
      subtitle: '繼續使用 {{applicationName}}',
      formTitle: '驗證連結',
      formSubtitle: '使用發送到您的電子郵件地址的驗證連結',
      resendButton: '重新發送連結',
      verified: {
        title: '成功註冊',
      },
      loading: {
        title: '正在註冊...',
      },
      verifiedSwitchTab: {
        title: '成功驗證電子郵件',
        subtitle: '返回新打開的標籤頁繼續',
        subtitleNewTab: '返回上一個標籤頁繼續',
      },
    },
    emailCode: {
      title: '驗證您的電子郵件',
      subtitle: '繼續使用 {{applicationName}}',
      formTitle: '驗證碼',
      formSubtitle: '輸入發送到您的電子郵件地址的驗證碼',
      resendButton: '重新發送驗證碼',
    },
    phoneCode: {
      title: '驗證您的電話',
      subtitle: '繼續使用 {{applicationName}}',
      formTitle: '驗證碼',
      formSubtitle: '輸入發送到您的電話號碼的驗證碼',
      resendButton: '重新發送驗證碼',
    },
    continue: {
      title: '填寫缺少的欄位',
      subtitle: '繼續使用 {{applicationName}}',
      actionText: '已經有帳戶了？',
      actionLink: '登錄',
    },
  },
  signIn: {
    start: {
      title: '登錄',
      subtitle: '繼續使用 {{applicationName}}',
      actionText: '還沒有帳戶？',
      actionLink: '註冊',
      actionLink__use_email: '使用電子郵件',
      actionLink__use_phone: '使用電話',
      actionLink__use_username: '使用使用者名稱',
      actionLink__use_email_username: '使用電子郵件或使用者名稱',
    },
    password: {
      title: '輸入您的密碼',
      subtitle: '繼續使用 {{applicationName}}',
      actionLink: '使用其他方法',
    },
    forgotPasswordAlternativeMethods: {
      title: '忘記密碼？',
      label__alternativeMethods: '或者，使用其他方式登錄。',
      blockButton__resetPassword: '重設密碼',
    },
    forgotPassword: {
      title_email: '查看您的電子郵件',
      title_phone: '查看您的手機',
      subtitle: '重設您的密碼',
      formTitle: '重設密碼代碼',
      formSubtitle_email: '輸入發送到您的電子郵件地址的代碼',
      formSubtitle_phone: '輸入發送到您的電話號碼的代碼',
      resendButton: '重新發送代碼',
    },
    resetPassword: {
      title: '重設密碼',
      formButtonPrimary: '重設密碼',
      successMessage: '您的密碼已成功更改。正在為您登錄，請稍等。',
    },
    resetPasswordMfa: {
      detailsLabel: '我們需要驗證您的身份才能重設您的密碼。',
    },
    emailCode: {
      title: '查看您的電子郵件',
      subtitle: '繼續使用 {{applicationName}}',
      formTitle: '驗證碼',
      formSubtitle: '輸入發送到您的電子郵件地址的驗證碼',
      resendButton: '重新發送驗證碼',
    },
    emailLink: {
      title: '查看您的電子郵件',
      subtitle: '繼續使用 {{applicationName}}',
      formTitle: '驗證連結',
      formSubtitle: '使用發送到您的電子郵件的驗證連結',
      resendButton: '重新發送連結',
      unusedTab: {
        title: '您可以關閉此標籤頁',
      },
      verified: {
        title: '成功登錄',
        subtitle: '即將為您重定向',
      },
      verifiedSwitchTab: {
        subtitle: '返回原始標籤頁繼續',
        titleNewTab: '在其他標籤頁上登入',
        subtitleNewTab: '返回新打開的標籤頁繼續',
      },
      loading: {
        title: '正在登錄...',
        subtitle: '即將為您重定向',
      },
      failed: {
        title: '此驗證連結無效',
        subtitle: '返回原始標籤頁繼續。',
      },
      expired: {
        title: '此驗證連結已過期',
        subtitle: '返回原始標籤頁繼續。',
      },
    },
    phoneCode: { ...commonTexts.signIn.phoneCode },
    phoneCodeMfa: { ...commonTexts.signIn.phoneCode, subtitle: '' },
    totpMfa: {
      title: '兩步驗證',
      subtitle: '',
      formTitle: '驗證碼',
      formSubtitle: '輸入您的驗證應用程式生成的驗證碼',
    },
    backupCodeMfa: {
      title: '輸入備用代碼',
      subtitle: '繼續使用 {{applicationName}}',
      formTitle: '',
      formSubtitle: '',
    },
    alternativeMethods: {
      title: '使用其他方法',
      actionLink: '獲取幫助',
      blockButton__emailLink: '電子郵件連結到 {{identifier}}',
      blockButton__emailCode: '電子郵件驗證碼到 {{identifier}}',
      blockButton__phoneCode: '發送簡訊代碼到 {{identifier}}',
      blockButton__password: '使用您的密碼登錄',
      blockButton__totp: '使用您的驗證應用程式',
      blockButton__backupCode: '使用備用代碼',
      getHelp: {
        title: '獲取幫助',
        content: `如果您在登入帳戶時遇到困難，請給我們發送電子郵件，我們將盡快讓您恢覆訪問。`,
        blockButton__emailSupport: '郵件支持',
      },
    },
    noAvailableMethods: {
      title: '無法登錄',
      subtitle: '出現錯誤',
      message: '無法繼續登錄。沒有可用的身份驗證因素。',
    },
  },
  userProfile: {
    mobileButton__menu: '菜單',
    formButtonPrimary__continue: '繼續',
    formButtonPrimary__finish: '完成',
    formButtonReset: '取消',
    start: {
      headerTitle__account: '帳戶',
      headerTitle__security: '安全',
      headerSubtitle__account: '管理您的帳戶資訊',
      headerSubtitle__security: '管理您的安全設定',
      profileSection: {
        title: '個人資料',
      },
      usernameSection: {
        title: '使用者名稱',
        primaryButton__changeUsername: '更改使用者名稱',
        primaryButton__setUsername: '設置使用者名稱',
      },
      emailAddressesSection: {
        title: '電子郵件地址',
        primaryButton: '添加電子郵件地址',
        detailsTitle__primary: '主要電子郵件地址',
        detailsSubtitle__primary: '此電子郵件地址是主要電子郵件地址',
        detailsAction__primary: '完成驗證',
        detailsTitle__nonPrimary: '設為主要電子郵件地址',
        detailsSubtitle__nonPrimary: '將此電子郵件地址設為主要的，以接收關於您帳戶的通信。',
        detailsAction__nonPrimary: '設為主要',
        detailsTitle__unverified: '未驗證的電子郵件地址',
        detailsSubtitle__unverified: '此電子郵件地址尚未驗證，功能可能受到限制',
        detailsAction__unverified: '完成驗證',
        destructiveActionTitle: '移除',
        destructiveActionSubtitle: '刪除此電子郵件地址，並將其從您的帳戶中移除',
        destructiveAction: '移除電子郵件地址',
      },
      phoneNumbersSection: {
        title: '電話號碼',
        primaryButton: '添加電話號碼',
        detailsTitle__primary: '主要電話號碼',
        detailsSubtitle__primary: '此電話號碼是主要電話號碼',
        detailsAction__primary: '完成驗證',
        detailsTitle__nonPrimary: '設為主要電話號碼',
        detailsSubtitle__nonPrimary: '將此電話號碼設為主要的，以接收關於您帳戶的通信。',
        detailsAction__nonPrimary: '設為主要',
        detailsTitle__unverified: '未驗證的電話號碼',
        detailsSubtitle__unverified: '此電話號碼尚未驗證，功能可能受到限制',
        detailsAction__unverified: '完成驗證',
        destructiveActionTitle: '移除',
        destructiveActionSubtitle: '刪除此電話號碼，並將其從您的帳戶中移除',
        destructiveAction: '移除電話號碼',
      },
      connectedAccountsSection: {
        title: '已連接的帳戶',
        primaryButton: '連接帳戶',
        title__conectionFailed: '重試失敗的連接',
        title__connectionFailed: '重試失敗的連接',
        title__reauthorize: '需要重新授權',
        subtitle__reauthorize: '所需的權限已更新，您可能會遇到功能限制。請重新授權此應用程式，以避免任何問題',
        actionLabel__conectionFailed: '再試一次',
        actionLabel__connectionFailed: '再試一次',
        actionLabel__reauthorize: '立即授權',
        destructiveActionTitle: '移除',
        destructiveActionSubtitle: '從您的帳戶中移除此已連接的帳戶',
        destructiveActionAccordionSubtitle: '移除已連接的帳戶',
      },
      enterpriseAccountsSection: {
        title: '企業帳戶',
      },
      passwordSection: {
        title: '密碼',
        primaryButton__changePassword: '更改密碼',
        primaryButton__setPassword: '設置密碼',
      },
      mfaSection: {
        title: '兩步驗證',
        primaryButton: '添加兩步驗證',
        phoneCode: {
          destructiveActionTitle: '移除',
          destructiveActionSubtitle: '從兩步驗證方法中移除此電話號碼',
          destructiveActionLabel: '移除電話號碼',
          title__default: '默認因素',
          title__setDefault: '設為默認因素',
          subtitle__default: '登錄時，此因素將被用作預設的兩步驗證方法。',
          subtitle__setDefault: '將此因素設為默認因素，登錄時將使用它作為預設的兩步驗證方法。',
          actionLabel__setDefault: '設為默認',
        },
        backupCodes: {
          headerTitle: '備份代碼',
          title__regenerate: '重新生成備份代碼',
          subtitle__regenerate: '獲取一套新的安全備份代碼。之前的備份代碼將被刪除，無法使用。',
          actionLabel__regenerate: '重新生成代碼',
        },
        totp: {
          headerTitle: '驗證器應用程式',
          title: '默認因素',
          subtitle: '登錄時，此因素將被用作預設的兩步驗證方法。',
          destructiveActionTitle: '移除',
          destructiveActionSubtitle: '從兩步驗證方法中移除驗證器應用程式',
          destructiveActionLabel: '移除驗證器應用程式',
        },
      },

      activeDevicesSection: {
        title: '活動設備',
        primaryButton: '活動設備',
        detailsTitle: '當前設備',
        detailsSubtitle: '這是你目前正在使用的設備',
        destructiveActionTitle: '登出',
        destructiveActionSubtitle: '從此設備上退出您的帳戶',
        destructiveAction: '退出設備',
      },
      web3WalletsSection: {
        title: 'Web3 錢包',
        primaryButton: 'Web3 錢包',
        destructiveActionTitle: '移除',
        destructiveActionSubtitle: '從您的帳戶中移除這個 Web3 錢包',
        destructiveAction: '移除錢包',
      },
      dangerSection: {
        title: '危險',
        deleteAccountButton: '移除帳戶',
        deleteAccountTitle: '移除帳戶',
        deleteAccountDescription: '此操作是永久性的且無法撤銷。',
      },
    },
    profilePage: {
      title: '更新個人資料',
      imageFormTitle: '個人資料圖片',
      imageFormSubtitle: '上傳圖片',
      imageFormDestructiveActionSubtitle: '移除圖片',
      fileDropAreaTitle: '拖拽文件到這裡，或者...',
      fileDropAreaAction: '選擇文件',
      fileDropAreaHint: '上傳小於10MB的JPG, PNG, GIF, 或WEBP格式的圖片',
      successMessage: '您的個人資料已更新。',
    },
    usernamePage: {
      title: '更新使用者名稱',
      successMessage: '您的使用者名稱已更新。',
    },
    emailAddressPage: {
      title: '添加電子郵件地址',
      emailCode: {
        formHint: '一封含有驗證碼的郵件將會被發送到這個電子郵件地址。',
        formTitle: '驗證碼',
        formSubtitle: '輸入發送到 {{identifier}} 的驗證碼',
        resendButton: '重發驗證碼',
        successMessage: '電子郵件 {{identifier}} 已被添加到您的帳戶。',
      },
      emailLink: {
        formHint: '一封含有驗證連結的郵件將會被發送到這個電子郵件地址。',
        formTitle: '驗證連結',
        formSubtitle: '點擊發送到 {{identifier}} 的郵件中的驗證連結',
        resendButton: '重發連結',
        successMessage: '電子郵件 {{identifier}} 已被添加到您的帳戶。',
      },
      removeResource: {
        title: '移除電子郵件地址',
        messageLine1: '{{identifier}} 將從此帳戶中被移除。',
        messageLine2: '您將無法使用這個電子郵件地址登錄。',
        successMessage: '電子郵件 {{emailAddress}} 已從您的帳戶中移除。',
      },
    },
    phoneNumberPage: {
      title: '添加電話號碼',
      successMessage: '{{identifier}} 已被添加到您的帳戶。',
      infoText: '一條包含驗證連結的簡訊將會發送到這個電話號碼。',
      infoText__secondary: '可能會產生資訊和數據費用。',
      removeResource: {
        title: '移除電話號碼',
        messageLine1: '{{identifier}} 將從此帳戶中被移除。',
        messageLine2: '您將無法使用這個電話號碼登錄。',
        successMessage: '電話號碼 {{phoneNumber}} 已從您的帳戶中移除。',
      },
    },
    connectedAccountPage: {
      title: '添加已連接的帳戶',
      formHint: '選擇一個供應商來連接您的帳戶。',
      formHint__noAccounts: '沒有可用的外部帳戶供應商。',
      socialButtonsBlockButton: '連接 {{provider|titleize}} 帳戶',
      successMessage: '供應商已被添加到您的帳戶',
      removeResource: {
        title: '移除已連接的帳戶',
        messageLine1: '{{identifier}} 將從此帳戶中被移除。',
        messageLine2: '您將無法再使用這個已連接的帳戶，任何依賴的功能將不再工作。',
        successMessage: '{{connectedAccount}} 已從您的帳戶中移除。',
      },
    },
    web3WalletPage: {
      title: '添加web3錢包',
      subtitle__availableWallets: '選擇一個 web3 錢包連接到您的帳戶。',
      subtitle__unavailableWallets: '沒有可用的 web3 錢包。',
      successMessage: '錢包已被添加到您的帳戶。',
      removeResource: {
        title: '移除 web3 錢包',
        messageLine1: '{{identifier}} 將從此帳戶中被移除。',
        messageLine2: '您將無法使用這個 web3 錢包登錄。',
        successMessage: '{{web3Wallet}} 已從您的帳戶中移除。',
      },
    },
    passwordPage: {
      title: '設置密碼',
      changePasswordTitle: '更改密碼',
      successMessage: '您的密碼已設置。',
      changePasswordSuccessMessage: '您的密碼已更新。',
      sessionsSignedOutSuccessMessage: '所有其他設備已退出。',
    },
    mfaPage: {
      title: '添加兩步驗證',
      formHint: '選擇一個添加的方法。',
    },
    mfaTOTPPage: {
      title: '添加驗證器應用程式',
      verifyTitle: '驗證代碼',
      verifySubtitle: '輸入您的驗證器生成的驗證碼',
      successMessage: '現在已啟用兩步驗證。在登錄時，您需要輸入來自此驗證器的驗證碼作為額外步驟。',
      authenticatorApp: {
        infoText__ableToScan: '在您的驗證器應用中設置一個新的登錄方法，並掃描下面的二維碼將其連結到您的帳戶。',
        infoText__unableToScan: '在驗證器中設置一個新的登錄方法，並輸入下面提供的 Key。',
        inputLabel__unableToScan1: '確保啟用了基於時間或一次性密碼，然後完成連結您的帳戶。',
        inputLabel__unableToScan2: '或者，如果您的驗證器支持 TOTP URIs，您也可以複製完整的 URI。',
        buttonAbleToScan__nonPrimary: '掃描二維碼',
        buttonUnableToScan__nonPrimary: '不能掃描二維碼？',
      },
      removeResource: {
        title: '移除兩步驗證',
        messageLine1: '登錄時，將不再需要來自此驗證器的驗證碼。',
        messageLine2: '您的帳戶可能不再安全。您確定要繼續嗎？',
        successMessage: '已移除通過驗證器應用程式的兩步驗證。',
      },
    },
    mfaPhoneCodePage: {
      title: '添加簡訊驗證碼驗證',
      primaryButton__addPhoneNumber: '添加電話號碼',
      subtitle__availablePhoneNumbers: '選擇一個電話號碼來註冊簡訊驗證碼兩步驗證。',
      subtitle__unavailablePhoneNumbers: '沒有可用的電話號碼來註冊簡訊驗證碼兩步驗證。',
      successMessage:
        '現在已啟用此電話號碼的簡訊驗證碼兩步驗證。在登錄時，您需要輸入發送到這個電話號碼的驗證碼作為額外步驟。',
      removeResource: {
        title: '移除兩步驗證',
        messageLine1: '{{identifier}} 將不再在登錄時接收驗證代碼。',
        messageLine2: '您的帳戶可能不再安全。您確定要繼續嗎？',
        successMessage: '已移除{{mfaPhoneCode}}的簡訊驗證碼兩步驗證',
      },
    },
    backupCodePage: {
      title: '添加備份代碼驗證',
      title__codelist: '備份代碼',
      subtitle__codelist: '安全儲存並保守秘密。',
      infoText1: '將為此帳戶啟用備份代碼。',
      infoText2: '保密並安全儲存備份代碼。如果您懷疑它們已經洩露，您可以重新生成備份代碼。',
      successSubtitle: '如果您失去了驗證設備的訪問權限，您可以使用其中之一登入您的帳戶。',
      successMessage:
        '現在已啟用備份代碼。如果您失去了驗證設備的訪問權限，您可以使用其中之一登入您的帳戶。每個代碼只能使用一次。',
      actionLabel__copy: '複製全部',
      actionLabel__copied: '已複製！',
      actionLabel__download: '下載 .txt',
      actionLabel__print: '列印',
    },
    deletePage: {
      title: '移除帳戶',
      messageLine1: '您確定要刪除您的帳戶嗎？',
      messageLine2: '這個動作是永久性且無法還原的。',
      actionDescription: '請在下方輸入“Delete account”以繼續。',
      confirm: '移除帳戶',
    },
  },
  userButton: {
    action__manageAccount: '管理帳戶',
    action__signOut: '退出登錄',
    action__signOutAll: '退出所有帳戶',
    action__addAccount: '添加帳戶',
  },
  organizationSwitcher: {
    personalWorkspace: '個人工作區',
    notSelected: '未選擇組織',
    action__createOrganization: '創建組織',
    action__manageOrganization: '管理組織',
  },
  impersonationFab: {
    title: '以 {{identifier}} 登錄',
    action__signOut: '退出登錄',
  },
  organizationProfile: {
    start: {
      headerTitle__members: '成員',
      headerTitle__settings: '設置',
      headerSubtitle__members: '查看並管理組織成員',
      headerSubtitle__settings: '管理組織設置',
    },
    profilePage: {
      title: '組織簡介',
      subtitle: '管理組織簡介',
      successMessage: '組織已更新。',
      dangerSection: {
        title: '危險',
        leaveOrganization: {
          title: '離開組織',
          messageLine1: '您確定要離開此組織嗎？您將失去對此組織及其應用程式的訪問權限。',
          messageLine2: '此操作是永久性的且無法撤銷。',
          successMessage: '您已離開了組織。',
        },
      },
    },
    invitePage: {
      title: '邀請成員',
      subtitle: '邀請新成員加入此組織',
      successMessage: '邀請成功發送',
      detailsTitle__inviteFailed: '邀請無法發送。修覆以下問題然後重試：',
      formButtonPrimary__continue: '發送邀請',
    },
    membersPage: {
      detailsTitle__emptyRow: '沒有可顯示的成員',
      action__invite: '邀請',
      start: {},
      activeMembersTab: {
        tableHeader__user: '用戶',
        tableHeader__joined: '加入',
        tableHeader__role: '角色',
        tableHeader__actions: '',
        menuAction__remove: '移除成員',
      },
      invitedMembersTab: {
        tableHeader__invited: '已邀請',
        menuAction__revoke: '撤銷邀請',
      },
    },
  },
  createOrganization: {
    title: '創建組織',
    formButtonSubmit: '創建組織',
    invitePage: {
      formButtonReset: '跳過',
    },
  },
  unstable__errors: {
    form_identifier_not_found: '',
    captcha_invalid: '由於安全驗證失敗，註冊未成功。請刷新頁面重試或聯絡支持獲取更多幫助。',
    form_password_pwned: '這個密碼在數據洩露中被發現，不能使用，請換一個密碼試試。',
    form_username_invalid_length: '',
    form_username_invalid_character: '',
    form_param_format_invalid: '',
    form_password_length_too_short: '',
    form_param_nil: '',
    form_code_incorrect: '',
    form_password_incorrect: '',
    not_allowed_access: '',
    form_identifier_exists: '',
    form_password_validation_failed: '密碼錯誤',
    form_password_not_strong_enough: '您的密碼強度不夠。',
    form_password_size_in_bytes_exceeded: '您的密碼超過了允許的最大位元組數，請縮短它或去掉一些特殊字元。',
    passwordComplexity: {
      sentencePrefix: '您的密碼必須包含',
      minimumLength: '{{length}}個或更多字元',
      maximumLength: '少於{{length}}個字元',
      requireNumbers: '一個數字',
      requireLowercase: '一個小寫字母',
      requireUppercase: '一個大寫字母',
      requireSpecialCharacter: '一個特殊字元',
    },
    zxcvbn: {
      notEnough: '您的密碼強度不夠。',
      couldBeStronger: '您的密碼可以用，但可以更強。試著添加更多字元。',
      goodPassword: '做得好。這是一個優秀的密碼。',
      warnings: {
        straightRow: '鍵盤上的直行鍵易被猜到。',
        keyPattern: '短鍵盤模式易被猜到。',
        simpleRepeat: '像"aaa"這樣的重複字元易被猜到。',
        extendedRepeat: '像"abcabcabc"這樣的重複字元模式易被猜到。',
        sequences: '像"abc"這樣的常見字元序列易被猜到。',
        recentYears: '近年來易被猜到。',
        dates: '日期易被猜到。',
        topTen: '這是一個大量使用的密碼。',
        topHundred: '這是一個頻繁使用的密碼。',
        common: '這是一個常用的密碼。',
        similarToCommon: '這個密碼和常用密碼相似。',
        wordByItself: '單個單字易被猜到。',
        namesByThemselves: '單個名字或姓氏易被猜到。',
        commonNames: '常見的名字和姓氏易被猜到。',
        userInputs: '不應該有任何個人或頁面相關的數據。',
        pwned: '您的密碼在網路上的數據洩露中被暴露。',
      },
      suggestions: {
        l33t: '避免預測的字母替換，如"@"代替"a"。',
        reverseWords: '避免常用詞的反向拼寫。',
        allUppercase: '大寫一些，但不是所有的字母。',
        capitalization: '大寫不僅僅是第一個字母。',
        dates: '避免與你有關的日期和年份。',
        recentYears: '避免近年來。',
        associatedYears: '避免與你有關的年份。',
        sequences: '避免常見字元序列。',
        repeated: '避免重複的單字和字元。',
        longerKeyboardPattern: '使用更長的鍵盤模式，並多次改變打字方向。',
        anotherWord: '添加更不常見的更多單字。',
        useWords: '使用多個單字，但避免常見短語。',
        noNeed: '你可以創建強密碼，而無需使用符號，數字或大寫字母。',
        pwned: '如果您在其他地方使用此密碼，您應該更改它。',
      },
    },
  },
  dates: {
    previous6Days: "上週{{ date | weekday('zh-TW','long') }} {{ date | timeString('zh-TW') }}",
    lastDay: "昨天{{ date | timeString('zh-TW') }}",
    sameDay: "今天{{ date | timeString('zh-TW') }}",
    nextDay: "明天{{ date | timeString('zh-TW') }}",
    next6Days: "{{ date | weekday('zh-TW','long') }} {{ date | timeString('zh-TW') }}",
    numeric: "{{ date | numeric('zh-TW') }}",
  },
} as const;
