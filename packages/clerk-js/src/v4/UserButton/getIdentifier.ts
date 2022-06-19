import { UserResource } from '@clerk/types';

export const getIdentifier = (user: UserResource): string => {
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
