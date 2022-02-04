import { titleize } from '@clerk/shared/utils/string';
import { UserResource } from '@clerk/types';

export function determineIdentifier(user: UserResource): string {
  if (user.firstName || user.lastName) {
    return [titleize(user.firstName), titleize(user.lastName)].join(' ').trim();
  }

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
}
