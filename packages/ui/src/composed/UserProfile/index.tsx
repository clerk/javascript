import { Account } from './Account';
import { APIKeys } from './APIKeys';
import { Billing } from './Billing';
import { Security } from './Security';
import { UserProfileProvider } from './UserProfileProvider';

export const UserProfile = {
  Provider: UserProfileProvider,
  Account,
  Security,
  Billing,
  APIKeys,
};
