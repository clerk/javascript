import type { ClerkOptions } from '@clerk/backend';

export type ClerkFastifyOptions = Omit<ClerkOptions, 'apiKey'>;
