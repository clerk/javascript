import { formMessages } from '../components/form/form.messages';
import { apiKeysTableMessages } from '../features/api-keys/api-keys-table.messages';
import { invitationsTableTabMessages } from '../features/organization-profile/invitations-table-tab.messages';
import { membersTableTabMessages } from '../features/organization-profile/members-table-tab.messages';
import { organizationProfileMessages } from '../features/organization-profile/organization-profile.messages';
import { organizationProfileDangerSectionMessages } from '../features/organization-profile/organization-profile-danger-section/organization-profile-danger-section.messages';
import { organizationProfileInviteMembersMessages } from '../features/organization-profile/organization-profile-invite-members.messages';
import { organizationProfileProfileSectionMessages } from '../features/organization-profile/organization-profile-profile-section/organization-profile-profile-section.messages';
import { requestsTableTabMessages } from '../features/organization-profile/requests-table-tab.messages';
import { reverificationMessages } from '../features/reverification/reverification.messages';
import { userButtonMessages } from '../features/user-button/user-button.messages';
import { userProfileMessages } from '../features/user-profile/user-profile.messages';
import { userProfileAccountSectionMessages } from '../features/user-profile/user-profile-account-section/user-profile-account-section.messages';
import { userProfileAddEmailMessages } from '../features/user-profile/user-profile-account-section/user-profile-add-email.messages';
import { userProfileAddPhoneMessages } from '../features/user-profile/user-profile-account-section/user-profile-add-phone.messages';
import { userProfileActiveDevicesMessages } from '../features/user-profile/user-profile-active-devices-section/user-profile-active-devices.messages';
import { userProfileConnectedAccountsMessages } from '../features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.messages';
import { userProfileDangerSectionMessages } from '../features/user-profile/user-profile-danger-section/user-profile-danger-section.messages';
import { userProfileEnterpriseAccountsMessages } from '../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.messages';
import { userProfileAddAuthenticatorMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-add-authenticator.messages';
import { userProfileAddSmsMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-add-sms.messages';
import { userProfileAuthenticatorSetupMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-authenticator-setup.messages';
import { userProfileBackupCodesMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-backup-codes.messages';
import { userProfileMfaMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-mfa-section.messages';
import { userProfilePasskeysMessages } from '../features/user-profile/user-profile-passkeys-section.messages';
import { userProfilePasswordSectionMessages } from '../features/user-profile/user-profile-password-section/user-profile-password-section.messages';
import { userProfileWeb3WalletsMessages } from '../features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets.messages';
import { errorMessages } from './errors.messages';
import { roleMessages } from './roles.messages';

export const mosaicMessages = {
  apiKeysTable: apiKeysTableMessages,
  errors: errorMessages,
  roles: roleMessages,
  form: formMessages,
  membersTableTab: membersTableTabMessages,
  invitationsTableTab: invitationsTableTabMessages,
  requestsTableTab: requestsTableTabMessages,
  organizationProfile: organizationProfileMessages,
  organizationProfileDangerSection: organizationProfileDangerSectionMessages,
  organizationProfileProfileSection: organizationProfileProfileSectionMessages,
  organizationProfileInviteMembers: organizationProfileInviteMembersMessages,
  reverification: reverificationMessages,
  userButton: userButtonMessages,
  userProfile: userProfileMessages,
  userProfileAccountSection: userProfileAccountSectionMessages,
  userProfileActiveDevices: userProfileActiveDevicesMessages,
  userProfileAddEmail: userProfileAddEmailMessages,
  userProfileAddPhone: userProfileAddPhoneMessages,
  userProfileAddAuthenticator: userProfileAddAuthenticatorMessages,
  userProfileAddSms: userProfileAddSmsMessages,
  userProfileAuthenticatorSetup: userProfileAuthenticatorSetupMessages,
  userProfileBackupCodes: userProfileBackupCodesMessages,
  userProfileConnectedAccounts: userProfileConnectedAccountsMessages,
  userProfileDangerSection: userProfileDangerSectionMessages,
  userProfileEnterpriseAccountsSection: userProfileEnterpriseAccountsMessages,
  userProfileMfa: userProfileMfaMessages,
  userProfilePasskeys: userProfilePasskeysMessages,
  userProfilePasswordSection: userProfilePasswordSectionMessages,
  userProfileWeb3Wallets: userProfileWeb3WalletsMessages,
};

export type MosaicMessages = typeof mosaicMessages;
