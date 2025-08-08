import { expectTypeOf, test } from 'vitest';

import type { AuthObject, InvalidTokenAuthObject } from '../authObjects';
import type { GetAuthFn, MachineAuthObject, SessionAuthObject } from '../types';

// Across our SDKs, we have a getAuth() function
const getAuth: GetAuthFn<Request> = (_request: any, _options: any) => {
  return {} as any;
};

test('infers the correct AuthObject type for each accepted token type', () => {
  const request = new Request('https://example.com');

  // Session token by default
  expectTypeOf(getAuth(request)).toMatchTypeOf<SessionAuthObject>();

  // Individual token types
  expectTypeOf(getAuth(request, { acceptsToken: 'session_token' })).toMatchTypeOf<SessionAuthObject>();
  expectTypeOf(getAuth(request, { acceptsToken: 'api_key' })).toMatchTypeOf<MachineAuthObject<'api_key'>>();
  expectTypeOf(getAuth(request, { acceptsToken: 'm2m_token' })).toMatchTypeOf<MachineAuthObject<'m2m_token'>>();
  expectTypeOf(getAuth(request, { acceptsToken: 'oauth_token' })).toMatchTypeOf<MachineAuthObject<'oauth_token'>>();

  // Array of token types
  expectTypeOf(getAuth(request, { acceptsToken: ['session_token', 'm2m_token'] })).toMatchTypeOf<
    SessionAuthObject | MachineAuthObject<'m2m_token'> | InvalidTokenAuthObject
  >();
  expectTypeOf(getAuth(request, { acceptsToken: ['m2m_token', 'oauth_token'] })).toMatchTypeOf<
    MachineAuthObject<'m2m_token' | 'oauth_token'> | InvalidTokenAuthObject
  >();

  // Any token type
  expectTypeOf(getAuth(request, { acceptsToken: 'any' })).toMatchTypeOf<AuthObject>();
});

test('verifies discriminated union works correctly with acceptsToken: any', () => {
  const request = new Request('https://example.com');

  const auth = getAuth(request, { acceptsToken: 'any' });

  if (auth.tokenType === 'session_token') {
    expectTypeOf(auth).toMatchTypeOf<SessionAuthObject>();
  } else if (auth.tokenType === 'api_key') {
    expectTypeOf(auth).toMatchTypeOf<MachineAuthObject<'api_key'>>();
  } else if (auth.tokenType === 'm2m_token') {
    expectTypeOf(auth).toMatchTypeOf<MachineAuthObject<'m2m_token'>>();
  } else if (auth.tokenType === 'oauth_token') {
    expectTypeOf(auth).toMatchTypeOf<MachineAuthObject<'oauth_token'>>();
  }
});
