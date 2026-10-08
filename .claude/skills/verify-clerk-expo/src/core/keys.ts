import { AGENT_CREDENTIAL_VARIABLES, PLATFORM_CREDENTIAL_VARIABLES } from './launch.mjs';
import type { Secret } from './secret.ts';
import type { PublishableKey } from './types.ts';

export interface InstanceKeys {
  readonly pk: PublishableKey;
  readonly sk: Secret<'clerk-secret-key'>;
}

export function withoutClerkKeys<T extends Readonly<Record<string, string | undefined>>>(env: T): T {
  return Object.fromEntries(Object.entries(env).filter(([name]) => !PLATFORM_CREDENTIAL_VARIABLES.includes(name) && !AGENT_CREDENTIAL_VARIABLES.includes(name))) as T;
}
