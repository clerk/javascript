import { QueryClient } from '@tanstack/query-core';

import { Clerk } from './core/clerk';

// The default Clerk class lazily loads QueryClient via a dynamic import.
// In React Native, rspack's chunk loading doesn't work (Metro bundles into
// a single file), so the dynamic import never resolves and
// __internal_queryClient stays undefined — breaking hooks that depend on it.
// Override the getter to synchronously create a QueryClient on first access.
const originalDescriptor = Object.getOwnPropertyDescriptor(Clerk.prototype, '__internal_queryClient');
if (originalDescriptor) {
  const queryClientMap = new WeakMap<InstanceType<typeof Clerk>, QueryClient>();
  Object.defineProperty(Clerk.prototype, '__internal_queryClient', {
    get(this: InstanceType<typeof Clerk>) {
      let client = queryClientMap.get(this);
      if (!client) {
        client = new QueryClient();
        queryClientMap.set(this, client);
      }
      return { __tag: 'clerk-rq-client', client };
    },
    configurable: true,
  });
}

// Re-export everything from the base entry point to avoid duplicating exports.
export * from './index';
