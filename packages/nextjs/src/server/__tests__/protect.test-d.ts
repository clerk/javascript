import type { AuthenticatedMachineObject, SignedInAuthObject } from '@clerk/backend/internal';
import { describe, expectTypeOf, test } from 'vitest';

import type { AuthProtect } from '../protect';

describe('auth.protect() return types', () => {
  const protect = {} as AuthProtect;

  test('resolves to SignedInAuthObject for session usage', () => {
    expectTypeOf(protect()).resolves.toEqualTypeOf<SignedInAuthObject>();
    expectTypeOf(protect({ permission: 'org:admin:example' })).resolves.toEqualTypeOf<SignedInAuthObject>();
    expectTypeOf(protect(has => has({ permission: 'org:admin:example' }))).resolves.toEqualTypeOf<SignedInAuthObject>();
    expectTypeOf(protect({ token: 'session_token' })).resolves.toEqualTypeOf<SignedInAuthObject>();
  });

  test('resolves to the matching authenticated machine object for machine tokens', () => {
    expectTypeOf(protect({ token: 'api_key' })).resolves.toEqualTypeOf<AuthenticatedMachineObject<'api_key'>>();
    expectTypeOf(protect({ token: 'm2m_token' })).resolves.toEqualTypeOf<AuthenticatedMachineObject<'m2m_token'>>();
    expectTypeOf(protect({ token: 'oauth_token' })).resolves.toEqualTypeOf<AuthenticatedMachineObject<'oauth_token'>>();
  });

  test('resolves to the union of accepted token types for arrays', () => {
    const mixed = protect({ token: ['session_token', 'm2m_token'] });
    expectTypeOf(mixed).resolves.toExtend<SignedInAuthObject | AuthenticatedMachineObject<'m2m_token'>>();
    expectTypeOf<Promise<SignedInAuthObject | AuthenticatedMachineObject<'m2m_token'>>>().toExtend<typeof mixed>();

    const machineOnly = protect({ token: ['api_key', 'oauth_token'] });
    expectTypeOf(machineOnly).resolves.toExtend<AuthenticatedMachineObject<'api_key' | 'oauth_token'>>();
    expectTypeOf<Promise<AuthenticatedMachineObject<'api_key' | 'oauth_token'>>>().toExtend<typeof machineOnly>();
  });

  test('resolves to the full union for token: any', () => {
    expectTypeOf(protect({ token: 'any' })).resolves.toEqualTypeOf<SignedInAuthObject | AuthenticatedMachineObject>();
  });

  test('narrows machine results by tokenType', async () => {
    const auth = await protect({ token: ['session_token', 'api_key'] });
    if (auth.tokenType === 'api_key') {
      expectTypeOf(auth).toExtend<AuthenticatedMachineObject<'api_key'>>();
      expectTypeOf(auth.name).toBeString();
    }
    if (auth.tokenType === 'session_token') {
      expectTypeOf(auth).toExtend<SignedInAuthObject>();
    }
  });
});
