import type { ClerkOptions } from '@clerk/backend';

export const ALLOWED_HOOKS = ['onRequest', 'preHandler'] as const;

export type ClerkFastifyOptions = Omit<ClerkOptions, 'apiKey'> & {
  hookName?: (typeof ALLOWED_HOOKS)[number];
};
