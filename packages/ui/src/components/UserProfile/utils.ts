import type { AttributeData, EmailAddressResource, PhoneNumberResource, Web3WalletResource } from '@clerk/shared/types';

/**
 * An attribute is "available" in the UserProfile if it's enabled for sign-up
 * OR used as a first/second factor for sign-in. This covers instances where
 * an attribute is disabled for sign-up but still used for authentication
 * (e.g. accounts provisioned exclusively by invitation).
 */
export function isAttributeAvailable(attr: AttributeData | undefined): boolean {
  return Boolean(attr?.enabled || attr?.used_for_first_factor || attr?.used_for_second_factor);
}

type IDable = { id: string };

export const primaryIdentificationFirst = (primaryId: string | null) => (val1: IDable, val2: IDable) => {
  return primaryId === val1.id ? -1 : primaryId === val2.id ? 1 : 0;
};

export const currentSessionFirst = (id: string) => (a: IDable) => (a.id === id ? -1 : 1);

export function sortIdentificationBasedOnVerification<
  T extends Array<EmailAddressResource | PhoneNumberResource | Web3WalletResource>,
>(array: T | null | undefined, primaryId: string | null | undefined): T {
  if (!array) {
    return [] as unknown as T;
  }
  const primaryItem = array.filter(item => item.id === primaryId);
  const itemsWithoutPrimary = array.filter(item => item.id !== primaryId);
  const verifiedItems = itemsWithoutPrimary.filter(item => item.verification?.status === 'verified');
  const unverifiedItems = itemsWithoutPrimary.filter(
    item => !!item.verification?.status && item.verification?.status !== 'verified',
  );
  const unverifiedItemsWithoutVerification = itemsWithoutPrimary.filter(item => !item.verification.status);

  // Sorting verified items alphabetically by name
  verifiedItems.sort((a, b) => a.id.localeCompare(b.id));

  // Sorting unverified items by expireAt, most recent last
  unverifiedItems.sort((a, b) => {
    if (!a.verification?.expireAt || !b.verification?.expireAt) {
      return 0;
    }
    return a.verification.expireAt.getTime() - b.verification.expireAt.getTime();
  });

  return [...primaryItem, ...verifiedItems, ...unverifiedItems, ...unverifiedItemsWithoutVerification] as T;
}
