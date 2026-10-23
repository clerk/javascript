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
    });
  }

  override queryOptions() {
    return { ...super.queryOptions(), staleTime: Infinity, gcTime: Infinity };
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
