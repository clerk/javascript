import type { VerificationResource } from '../types';

type Identification = {
  id: string;
  verification: Pick<VerificationResource, 'status' | 'expireAt'>;
};

export function sortIdentificationBasedOnVerification<T extends Identification>(
  identifications: readonly T[] | null | undefined,
  primaryId: string | null | undefined,
): T[] {
  if (!identifications) {
    return [];
  }

  const primary = identifications.filter(item => item.id === primaryId);
  const remaining = identifications.filter(item => item.id !== primaryId);
  const verified = remaining.filter(item => item.verification.status === 'verified');
  const unverified = remaining.filter(item => item.verification.status && item.verification.status !== 'verified');
  const withoutStatus = remaining.filter(item => !item.verification.status);

  verified.sort((first, second) => first.id.localeCompare(second.id));
  unverified.sort((first, second) => {
    const firstExpiry = first.verification.expireAt;
    const secondExpiry = second.verification.expireAt;
    return firstExpiry && secondExpiry ? firstExpiry.getTime() - secondExpiry.getTime() : 0;
  });

  return [...primary, ...verified, ...unverified, ...withoutStatus];
}
