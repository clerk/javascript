type NameHelperParams = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  /**
   * If true, the name will be formatted as "lastName firstName"
   * @default false
   */
  reverse?: boolean;
};

export const getFullName = ({ firstName, lastName, name, reverse = false }: NameHelperParams) => {
  if (name) {
    return name;
  }

  if (reverse) {
    return [lastName, firstName].join(' ').trim() || '';
  }

  return [firstName, lastName].join(' ').trim() || '';
};

export const getInitials = ({ firstName, lastName, name }: NameHelperParams) =>
  [(firstName || '')[0], (lastName || '')[0]].join('').trim() || (name || '')[0];

import type { UserResource } from '@clerk/types';

export const getIdentifier = (user: Partial<UserResource>): string => {
  if (user.username) {
    return user.username;
  }

  if (user.primaryEmailAddress) {
    return user.primaryEmailAddress.emailAddress;
  }

  if (user.primaryPhoneNumber) {
    return user.primaryPhoneNumber.phoneNumber;
  }

  if (user.primaryWeb3Wallet) {
    return user.primaryWeb3Wallet.web3Wallet;
  }

  return '';
};
