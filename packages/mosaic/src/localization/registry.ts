import { organizationProfileApiKeysPanelMessages } from '../features/organization-profile/organization-profile-api-keys-panel.messages';
import { reverificationMessages } from '../features/reverification/reverification.messages';
import { userButtonMessages } from '../features/user-button/user-button.messages';
import { userProfileMessages } from '../features/user-profile/user-profile.messages';
import { userProfileAccountSectionMessages } from '../features/user-profile/user-profile-account-section/user-profile-account-section.messages';
import { userProfileAddEmailMessages } from '../features/user-profile/user-profile-account-section/user-profile-add-email.messages';
import { userProfileAddPhoneMessages } from '../features/user-profile/user-profile-account-section/user-profile-add-phone.messages';
import { userProfileVerifyEmailLinkMessages } from '../features/user-profile/user-profile-account-section/user-profile-verify-email-link.messages';
import { userProfileVerifyEmailSsoMessages } from '../features/user-profile/user-profile-account-section/user-profile-verify-email-sso.messages';
import { userProfileActiveDevicesMessages } from '../features/user-profile/user-profile-active-devices.messages';
import { userProfileAddAuthenticatorMessages } from '../features/user-profile/user-profile-add-authenticator.messages';
import { userProfileAddSmsMessages } from '../features/user-profile/user-profile-add-sms.messages';
import { userProfileApiKeysPanelMessages } from '../features/user-profile/user-profile-api-keys-panel.messages';
import { userProfileAuthenticatorSetupMessages } from '../features/user-profile/user-profile-authenticator-setup.messages';
import { userProfileBackupCodesMessages } from '../features/user-profile/user-profile-backup-codes.messages';
import { userProfileConnectedAccountsMessages } from '../features/user-profile/user-profile-connected-accounts.messages';
import { userProfileDeleteSectionMessages } from '../features/user-profile/user-profile-delete-section/user-profile-delete-section.messages';
import { userProfileEnterpriseAccountsMessages } from '../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.messages';
import { userProfileMfaMessages } from '../features/user-profile/user-profile-mfa-section.messages';
import { userProfilePasswordSectionMessages } from '../features/user-profile/user-profile-password-section/user-profile-password-section.messages';
import { userProfileWeb3WalletsMessages } from '../features/user-profile/user-profile-web3-wallets.messages';

export const mosaicMessages = {
  organizationProfileApiKeysPanel: organizationProfileApiKeysPanelMessages,
  userProfileApiKeysPanel: userProfileApiKeysPanelMessages,
  reverification: reverificationMessages,
  userButton: userButtonMessages,
  userProfile: userProfileMessages,
  userProfileAccountSection: userProfileAccountSectionMessages,
  userProfileActiveDevices: userProfileActiveDevicesMessages,
  userProfileAddEmail: userProfileAddEmailMessages,
  userProfileAddPhone: userProfileAddPhoneMessages,
  userProfileVerifyEmailLink: userProfileVerifyEmailLinkMessages,
  userProfileVerifyEmailSso: userProfileVerifyEmailSsoMessages,
  userProfileAddAuthenticator: userProfileAddAuthenticatorMessages,
  userProfileAddSms: userProfileAddSmsMessages,
  userProfileAuthenticatorSetup: userProfileAuthenticatorSetupMessages,
  userProfileBackupCodes: userProfileBackupCodesMessages,
  userProfileConnectedAccounts: userProfileConnectedAccountsMessages,
  userProfileDeleteSection: userProfileDeleteSectionMessages,
  userProfileEnterpriseAccountsSection: userProfileEnterpriseAccountsMessages,
  userProfileMfa: userProfileMfaMessages,
  userProfilePasswordSection: userProfilePasswordSectionMessages,
  userProfileWeb3Wallets: userProfileWeb3WalletsMessages,
};

export type MosaicMessages = typeof mosaicMessages;
