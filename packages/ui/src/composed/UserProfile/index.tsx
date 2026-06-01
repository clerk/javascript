import { Account } from './Account';
import { APIKeys } from './APIKeys';
import { Billing } from './Billing';
import { Security } from './Security';
import {
  AccountConnectedAccounts,
  AccountEmails,
  AccountEnterpriseAccounts,
  AccountPhone,
  AccountProfile,
  AccountUsername,
  AccountWeb3,
  SecurityActiveDevices,
  SecurityDelete,
  SecurityMfa,
  SecurityPasskeys,
  SecurityPassword,
} from './sectionWrappers';
import { UserProfileProvider } from './UserProfileProvider';

export const UserProfile = Object.assign(UserProfileProvider, {
  Account,
  Security,
  Billing,
  APIKeys,
  AccountProfile,
  AccountUsername,
  AccountEmails,
  AccountPhone,
  AccountConnectedAccounts,
  AccountEnterpriseAccounts,
  AccountWeb3,
  SecurityPassword,
  SecurityPasskeys,
  SecurityMfa,
  SecurityActiveDevices,
  SecurityDelete,
});
