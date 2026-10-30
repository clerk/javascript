import { formMessages } from '../components/form/form.messages';
import { profileMessages } from '../components/profile/profile.messages';
import { apiKeysTableMessages } from '../features/api-keys/api-keys-table.messages';
import { organizationProfileMessages } from '../features/organization-profile/organization-profile.messages';
import { organizationProfileDangerSectionMessages } from '../features/organization-profile/organization-profile-danger-section/organization-profile-danger-section.messages';
import { invitationsTableTabMessages } from '../features/organization-profile/organization-profile-members-panel/invitations-table-tab.messages';
import { membersTableTabMessages } from '../features/organization-profile/organization-profile-members-panel/members-table-tab.messages';
import { organizationProfileInviteMembersMessages } from '../features/organization-profile/organization-profile-members-panel/organization-profile-invite-members.messages';
import { requestsTableTabMessages } from '../features/organization-profile/organization-profile-members-panel/requests-table-tab.messages';
import { organizationProfileProfileSectionMessages } from '../features/organization-profile/organization-profile-profile-section/organization-profile-profile-section.messages';
import { organizationSwitcherMessages } from '../features/organization-switcher/organization-switcher.messages';
import { reverificationMessages } from '../features/reverification/reverification.messages';
import { userButtonMessages } from '../features/user-button/user-button.messages';
import { userProfileMessages } from '../features/user-profile/user-profile.messages';
import { userProfileActiveDevicesMessages } from '../features/user-profile/user-profile-active-devices-section/user-profile-active-devices.messages';
import { userProfileConnectedAccountsMessages } from '../features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.messages';
import { userProfileContactMessages } from '../features/user-profile/user-profile-contact.messages';
import { userProfileDangerSectionMessages } from '../features/user-profile/user-profile-danger-section/user-profile-danger-section.messages';
import { userProfileAddEmailMessages } from '../features/user-profile/user-profile-email-section/user-profile-add-email.messages';
import { userProfileEmailSectionMessages } from '../features/user-profile/user-profile-email-section/user-profile-email-section.messages';
import { userProfileEnterpriseAccountsMessages } from '../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.messages';
import { userProfileAddAuthenticatorMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-add-authenticator.messages';
import { userProfileAddSmsMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-add-sms.messages';
import { userProfileAuthenticatorSetupMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-authenticator-setup.messages';
import { userProfileBackupCodesMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-backup-codes.messages';
import { userProfileMfaMessages } from '../features/user-profile/user-profile-mfa-section/user-profile-mfa-section.messages';
import { userProfilePasskeysMessages } from '../features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.messages';
import { userProfilePasswordSectionMessages } from '../features/user-profile/user-profile-password-section/user-profile-password-section.messages';
import { userProfileAddPhoneMessages } from '../features/user-profile/user-profile-phone-section/user-profile-add-phone.messages';
import { userProfilePhoneSectionMessages } from '../features/user-profile/user-profile-phone-section/user-profile-phone-section.messages';
import { userProfileProfileSectionMessages } from '../features/user-profile/user-profile-profile-section/user-profile-profile-section.messages';
import { userProfileWeb3WalletsMessages } from '../features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets.messages';
import { errorMessages } from './errors.messages';
import { fillAll, plural } from './messages';
import { roleMessages } from './roles.messages';
import { termMessages } from './terms.messages';

export const messageTemplates = {
  terms: termMessages,
  userButton: userButtonMessages,
  organizationSwitcher: organizationSwitcherMessages,
  userProfile: {
    ...userProfileMessages,
    profile: userProfileProfileSectionMessages,
    contact: userProfileContactMessages,
    email: { ...userProfileEmailSectionMessages, addDialog: userProfileAddEmailMessages },
    phone: { ...userProfilePhoneSectionMessages, addDialog: userProfileAddPhoneMessages },
    connectedAccounts: userProfileConnectedAccountsMessages,
    enterpriseAccounts: userProfileEnterpriseAccountsMessages,
    web3Wallets: userProfileWeb3WalletsMessages,
    password: userProfilePasswordSectionMessages,
    passkeys: userProfilePasskeysMessages,
    mfa: {
      ...userProfileMfaMessages,
      addSms: userProfileAddSmsMessages,
      addAuthenticator: userProfileAddAuthenticatorMessages,
      authenticatorSetup: userProfileAuthenticatorSetupMessages,
      backupCodes: userProfileBackupCodesMessages,
    },
    activeDevices: userProfileActiveDevicesMessages,
    danger: userProfileDangerSectionMessages,
  },
  organizationProfile: {
    ...organizationProfileMessages,
    profile: organizationProfileProfileSectionMessages,
    members: {
      list: membersTableTabMessages,
      invitations: invitationsTableTabMessages,
      requests: requestsTableTabMessages,
      invite: organizationProfileInviteMembersMessages,
    },
    danger: organizationProfileDangerSectionMessages,
  },
  apiKeys: apiKeysTableMessages,
  reverification: reverificationMessages,
  profile: profileMessages,
  form: formMessages,
  errors: errorMessages,
  roles: roleMessages,
};

export type MosaicMessages = typeof messageTemplates;

export const mosaicMessages = applyTerms(messageTemplates, 'en');

export function applyTerms(templates: MosaicMessages, locale: string): MosaicMessages {
  const { organization } = templates.terms;
  const one = plural(organization, 1, locale);
  const values = {
    organization: one,
    Organization: capitalize(one, locale),
    organizations: organization.other,
    Organizations: capitalize(organization.other, locale),
  };
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- The walk only replaces string leaves, so the shape is unchanged.
  return fillAll(templates, values) as MosaicMessages;
}

function capitalize(word: string, locale: string): string {
  return word.charAt(0).toLocaleUpperCase(locale) + word.slice(1);
}
