import type { ClerkOptions } from '@clerk/backend';

export const ALLOWED_HOOKS = ['onRequest', 'preHandler'] as const;

export type ClerkFastifyOptions = ClerkOptions & {
  hookName?: (typeof ALLOWED_HOOKS)[number];
};
