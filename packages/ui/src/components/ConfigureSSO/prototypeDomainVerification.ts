import type { OrganizationDomainResource } from '@clerk/shared/types';
import { useSyncExternalStore } from 'react';

/**
 * PROTOTYPE ONLY — client-side domain-verification override for demoing
 * without touching DNS. "Mark verified" stores the domain id here and the
 * umbrella hook overlays a verified `ownershipVerification` onto the fetched
 * resource, so every guard, badge, and gate downstream reacts as if FAPI had
 * verified it. Purely in-memory; a reload resets it. Delete with the branch.
 */

const verifiedIds = new Set<string>();
let version = 0;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getVersion = (): number => version;

export const markDomainVerifiedForPrototype = (domainId: string): void => {
  verifiedIds.add(domainId);
  version++;
  listeners.forEach(listener => listener());
};

/** Re-renders subscribers whenever a domain is fake-verified. */
export const usePrototypeDomainVerification = (): number => useSyncExternalStore(subscribe, getVersion, getVersion);

export const applyPrototypeDomainVerification = (
  domains: OrganizationDomainResource[] | undefined,
): OrganizationDomainResource[] | undefined =>
  domains?.map(domain => {
    if (!verifiedIds.has(domain.id) || domain.ownershipVerification?.status === 'verified') {
      return domain;
    }

    // Clone onto the same prototype so resource methods survive; only the
    // verification snapshot is overridden.
    const overridden = Object.assign(Object.create(Object.getPrototypeOf(domain)), domain);
    overridden.ownershipVerification = {
      status: 'verified',
      strategy: 'manual_override',
      attempts: domain.ownershipVerification?.attempts ?? null,
      expiresAt: null,
      verifiedAt: new Date(),
      txtRecordName: domain.ownershipVerification?.txtRecordName ?? null,
      txtRecordValue: domain.ownershipVerification?.txtRecordValue ?? null,
    };
    return overridden as OrganizationDomainResource;
  });
