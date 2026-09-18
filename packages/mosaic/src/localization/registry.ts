import { formMessages } from '../components/form/form.messages';
import { reverificationMessages } from '../features/reverification/reverification.messages';
import { userButtonMessages } from '../features/user-button/user-button.messages';
import { userProfileMessages } from '../features/user-profile/user-profile.messages';
import { userProfileAccountSectionMessages } from '../features/user-profile/user-profile-account-section/user-profile-account-section.messages';
import { userProfileAddEmailMessages } from '../features/user-profile/user-profile-account-section/user-profile-add-email.messages';
import { userProfileAddPhoneMessages } from '../features/user-profile/user-profile-account-section/user-profile-add-phone.messages';
import { userProfileVerifyEmailLinkMessages } from '../features/user-profile/user-profile-account-section/user-profile-verify-email-link.messages';
import { userProfileVerifyEmailSsoMessages } from '../features/user-profile/user-profile-account-section/user-profile-verify-email-sso.messages';
import { userProfileActiveDevicesMessages } from '../features/user-profile/user-profile-active-devices.messages';
import { userProfileConnectedAccountsMessages } from '../features/user-profile/user-profile-connected-accounts.messages';
import { userProfileDeleteSectionMessages } from '../features/user-profile/user-profile-delete-section/user-profile-delete-section.messages';
import { userProfileEnterpriseAccountsMessages } from '../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.messages';
import { userProfilePasswordSectionMessages } from '../features/user-profile/user-profile-password-section/user-profile-password-section.messages';
import { userProfileWeb3WalletsMessages } from '../features/user-profile/user-profile-web3-wallets.messages';

export const mosaicMessages = {
  form: formMessages,
  reverification: reverificationMessages,
  userButton: userButtonMessages,
  userProfile: userProfileMessages,
  userProfileAccountSection: userProfileAccountSectionMessages,
  userProfileActiveDevices: userProfileActiveDevicesMessages,
  userProfileAddEmail: userProfileAddEmailMessages,
  userProfileAddPhone: userProfileAddPhoneMessages,
  userProfileVerifyEmailLink: userProfileVerifyEmailLinkMessages,
  userProfileVerifyEmailSso: userProfileVerifyEmailSsoMessages,
  userProfileConnectedAccounts: userProfileConnectedAccountsMessages,
  userProfileDeleteSection: userProfileDeleteSectionMessages,
  userProfileEnterpriseAccountsSection: userProfileEnterpriseAccountsMessages,
  userProfilePasswordSection: userProfilePasswordSectionMessages,
  userProfileWeb3Wallets: userProfileWeb3WalletsMessages,
};

export type MosaicMessages = typeof mosaicMessages;
