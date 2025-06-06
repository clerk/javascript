import { expectTypeOf, test } from 'vitest';

import type { AuthObject } from '../authObjects';
import type { GetAuthFn, MachineAuthObject, SessionAuthObject } from '../types';

test('infers the correct AuthObject type for each accepted token type', () => {
  const request = new Request('https://example.com');

  // Across our SDKs, we have a getAuth() function
  const getAuth: GetAuthFn<Request> = (_request: any, _options: any) => {
    return {} as any;
  };

  // Session token by default
  expectTypeOf(getAuth(request)).toEqualTypeOf<SessionAuthObject>();

  // Individual token types
  expectTypeOf(getAuth(request, { acceptsToken: 'session_token' })).toEqualTypeOf<SessionAuthObject>();
  expectTypeOf(getAuth(request, { acceptsToken: 'api_key' })).toEqualTypeOf<MachineAuthObject<'api_key'>>();
  expectTypeOf(getAuth(request, { acceptsToken: 'machine_token' })).toEqualTypeOf<MachineAuthObject<'machine_token'>>();
  expectTypeOf(getAuth(request, { acceptsToken: 'oauth_token' })).toEqualTypeOf<MachineAuthObject<'oauth_token'>>();

  // Array of token types
  expectTypeOf(getAuth(request, { acceptsToken: ['session_token', 'oauth_token'] })).toEqualTypeOf<
    SessionAuthObject | MachineAuthObject<'oauth_token'>
  >();

  // Any token type
  expectTypeOf(getAuth(request, { acceptsToken: 'any' })).toEqualTypeOf<AuthObject>();
});
