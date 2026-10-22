import { LoomClient } from './client';
import type { LoomHydration } from './types';

function unavailable(): never {
  throw new Error('Loom is waiting for Clerk.');
}

export class BootstrapClient extends LoomClient {
  constructor(hydration: LoomHydration) {
    super({
      scope: hydration.scope,
      hydration,
      transport: { read: unavailable, revoke: unavailable },
      readUser: unavailable,
      readProfileSettings: unavailable,
    });
  }

  override queryOptions() {
    return { ...super.queryOptions(), staleTime: Infinity, gcTime: Infinity };
  }

  override userQueryOptions() {
    return { ...super.userQueryOptions(), staleTime: Infinity, gcTime: Infinity };
  }

  override profileSettingsQueryOptions() {
    return { ...super.profileSettingsQueryOptions(), staleTime: Infinity, gcTime: Infinity };
  }

  override fetchUser(): Promise<never> {
    return Promise.reject(new Error('Loom is waiting for Clerk.'));
  }
  override prefetchUser(): Promise<never> {
    return Promise.reject(new Error('Loom is waiting for Clerk.'));
  }
  override refreshUser(): Promise<never> {
    return Promise.reject(new Error('Loom is waiting for Clerk.'));
  }
  override invalidateUser(): Promise<never> {
    return Promise.reject(new Error('Loom is waiting for Clerk.'));
  }

  override fetch(): Promise<never> {
    return Promise.reject(new Error('Loom is waiting for Clerk.'));
  }

  override prefetch(): Promise<never> {
    return Promise.reject(new Error('Loom is waiting for Clerk.'));
  }

  override refresh(): Promise<never> {
    return Promise.reject(new Error('Loom is waiting for Clerk.'));
  }

  override revoke(): Promise<never> {
    return Promise.reject(new Error('Loom is waiting for Clerk.'));
  }

  override subscribe(): never {
    return unavailable();
  }
}
