import type { Secret } from './secret.ts';
import type { PublishableKey } from './types.ts';

export const PLATFORM_CREDENTIAL_VARIABLES: readonly string[] = ['CLERK_PLATFORM_API_KEY', 'CLERK_PLATFORM_API_KEY_FILE', 'VERIFY_PLATFORM_KEY_REFERENCE'];

export interface InstanceKeys {
  readonly pk: PublishableKey;
  readonly sk: Secret<'clerk-secret-key'>;
}

export function withoutClerkKeys<T extends Readonly<Record<string, string | undefined>>>(env: T): T {
  return Object.fromEntries(Object.entries(env).filter(([name]) => !PLATFORM_CREDENTIAL_VARIABLES.includes(name))) as T;
}
