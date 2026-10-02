import type { AttributeData } from '@clerk/shared/types';

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
