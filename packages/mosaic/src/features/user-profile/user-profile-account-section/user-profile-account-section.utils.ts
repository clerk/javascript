import type { AttributeData, VerificationResource } from '@clerk/shared/types';

export function isAttributeAvailable(attribute: AttributeData | undefined): boolean {
  return Boolean(attribute?.enabled || attribute?.used_for_first_factor || attribute?.used_for_second_factor);
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
