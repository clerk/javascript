type NameHelperParams = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
};

export const getFullName = ({ firstName, lastName, name }: NameHelperParams) =>
  name || [firstName, lastName].join(' ').trim() || '';

export const getInitials = ({ firstName, lastName, name }: NameHelperParams) =>
  [(firstName || '')[0], (lastName || '')[0]].join('').trim() || (name || '')[0];

import type { UserResource } from '@clerk/types';

import { decodeBase16 } from '../utils';

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

export const isDefaultProfileImage = (url: string) => {
  let encoded: string;
  try {
    encoded = new URL(url).pathname.replace('/', '');
  } catch {
    return false;
  }
  const decoded = decodeBase16(encoded);
  return decoded.includes('default');
};
