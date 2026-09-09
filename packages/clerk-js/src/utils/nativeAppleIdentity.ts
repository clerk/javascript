import { ClerkRuntimeError } from '@clerk/shared/error';

import type { Clerk } from '../core/clerk';

export async function getNativeAppleIdentity(clerk: Clerk) {
  const provider = clerk.__internal_getAppleIdentity;
  if (!provider)
    throw new ClerkRuntimeError('Apple identity credentials are unavailable.', { code: 'capability_unavailable' });
  const attributes = clerk.__internal_environment?.userSettings.attributes;
  const fullName = attributes?.first_name?.enabled !== false || attributes?.last_name?.enabled !== false;
  const credential = await provider({ fullName });
  if (!credential || typeof credential.token !== 'string' || !credential.token.trim())
    throw new ClerkRuntimeError('Apple did not return an identity token.', { code: 'invalid_credential_result' });
  return {
    token: credential.token,
    firstName:
      attributes?.first_name?.enabled !== false && typeof credential.firstName === 'string'
        ? credential.firstName
        : undefined,
    lastName:
      attributes?.last_name?.enabled !== false && typeof credential.lastName === 'string'
        ? credential.lastName
        : undefined,
  };
}
