import type { AttributeData, UserResource, VerificationResource } from '@clerk/shared/types';

import { isAttributeAvailable } from './user-profile.utils';
import type { UserProfileContact } from './user-profile-contact.types';

export interface UserProfileContactAccess {
  show: boolean;
  canCreate: boolean;
  canRemove: boolean;
}

export function toContactAccess(
  attribute: AttributeData | undefined,
  count: number,
  canAddIdentifications: boolean,
): UserProfileContactAccess {
  const available = isAttributeAvailable(attribute);
  const mutable = available && !attribute?.immutable;
  const canCreate = mutable && canAddIdentifications;
  return { show: available && (canCreate || count > 0), canCreate, canRemove: mutable };
}

export function canAddIdentifications(user: UserResource, enterpriseSSOEnabled: boolean): boolean {
  return (
    !enterpriseSSOEnabled ||
    !user.enterpriseAccounts.some(
      account => account.active && account.enterpriseConnection?.disableAdditionalIdentifications,
    )
  );
}

export function byId<T extends { id: string }>(items: T[], id: string, kind: string): T {
  const item = items.find(item => item.id === id);
  if (!item) {
    throw new Error(`No ${kind} with id ${id}`);
  }
  return item;
}

type Identification = { id: string; verification: Pick<VerificationResource, 'status' | 'expireAt'> };

export function sortByVerification<T extends Identification>(items: T[], primaryId: string | null): T[] {
  const others = items.filter(item => item.id !== primaryId);
  const verified = others.filter(item => item.verification.status === 'verified');
  const pending = others.filter(item => item.verification.status && item.verification.status !== 'verified');
  const unstarted = others.filter(item => !item.verification.status);

  verified.sort((a, b) => a.id.localeCompare(b.id));
  pending.sort((a, b) => {
    const aExpireAt = a.verification.expireAt;
    const bExpireAt = b.verification.expireAt;
    return aExpireAt && bExpireAt ? aExpireAt.getTime() - bExpireAt.getTime() : 0;
  });

  return [...items.filter(item => item.id === primaryId), ...verified, ...pending, ...unstarted];
}

export function toContacts<T extends Identification>(
  items: T[],
  primaryId: string | null,
  value: (item: T) => string,
): UserProfileContact[] {
  return sortByVerification(items, primaryId).map(item => ({
    id: item.id,
    value: value(item),
    isDefault: item.id === primaryId,
    isVerified: item.verification.status === 'verified',
  }));
}
