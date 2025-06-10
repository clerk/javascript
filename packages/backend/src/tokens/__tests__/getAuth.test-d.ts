import { assertType, expectTypeOf, test } from 'vitest';

import type { AuthObject } from '../authObjects';
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
  expectTypeOf(getAuth(request, { acceptsToken: 'machine_token' })).toMatchTypeOf<MachineAuthObject<'machine_token'>>();
  expectTypeOf(getAuth(request, { acceptsToken: 'oauth_token' })).toMatchTypeOf<MachineAuthObject<'oauth_token'>>();

  // Array of token types
  expectTypeOf(getAuth(request, { acceptsToken: ['session_token', 'machine_token'] })).toMatchTypeOf<
    SessionAuthObject | MachineAuthObject<'machine_token'>
  >();
  expectTypeOf(getAuth(request, { acceptsToken: ['machine_token', 'oauth_token'] })).toMatchTypeOf<
    MachineAuthObject<'machine_token' | 'oauth_token'>
  >();

  // Any token type
  expectTypeOf(getAuth(request, { acceptsToken: 'any' })).toMatchTypeOf<AuthObject>();
});

test('verifies correct properties exist for each token type', () => {
  const request = new Request('https://example.com');

  // Session token should have userId
  const sessionAuth = getAuth(request, { acceptsToken: 'session_token' });
  expectTypeOf(sessionAuth.userId).toMatchTypeOf<string | null>();

  // All machine tokens should have id and subject
  const apiKeyAuth = getAuth(request, { acceptsToken: 'api_key' });
  const machineTokenAuth = getAuth(request, { acceptsToken: 'machine_token' });
  const oauthTokenAuth = getAuth(request, { acceptsToken: 'oauth_token' });

  expectTypeOf(apiKeyAuth.id).toMatchTypeOf<string | null>();
  expectTypeOf(machineTokenAuth.id).toMatchTypeOf<string | null>();
  expectTypeOf(oauthTokenAuth.id).toMatchTypeOf<string | null>();
  expectTypeOf(apiKeyAuth.subject).toMatchTypeOf<string | null>();
  expectTypeOf(machineTokenAuth.subject).toMatchTypeOf<string | null>();
  expectTypeOf(oauthTokenAuth.subject).toMatchTypeOf<string | null>();

  // Only api_key and machine_token should have name and claims
  expectTypeOf(apiKeyAuth.name).toMatchTypeOf<string | null>();
  expectTypeOf(apiKeyAuth.claims).toMatchTypeOf<Record<string, any> | null>();

  expectTypeOf(machineTokenAuth.name).toMatchTypeOf<string | null>();
  expectTypeOf(machineTokenAuth.claims).toMatchTypeOf<Record<string, any> | null>();

  // oauth_token should NOT have name and claims
  // @ts-expect-error oauth_token does not have name property
  assertType<string | null>(oauthTokenAuth.name);
  // @ts-expect-error oauth_token does not have claims property
  assertType<Record<string, any> | null>(oauthTokenAuth.claims);
});

test('verifies discriminated union works correctly with acceptsToken: any', () => {
  const request = new Request('https://example.com');

  const auth = getAuth(request, { acceptsToken: 'any' });

  if (auth.tokenType === 'session_token') {
    // Should be SessionAuthObject - has userId
    expectTypeOf(auth.userId).toMatchTypeOf<string | null>();
    // Should NOT have machine token properties
    // @ts-expect-error session_token does not have id property
    assertType<string | null>(auth.id);
  } else if (auth.tokenType === 'api_key') {
    // Should be AuthenticatedMachineObject<'api_key'> - has id, name, claims
    expectTypeOf(auth.id).toMatchTypeOf<string | null>();
    expectTypeOf(auth.name).toMatchTypeOf<string | null>();
    expectTypeOf(auth.claims).toMatchTypeOf<Record<string, any> | null>();
    // Should NOT have session token properties
    // @ts-expect-error api_key does not have userId property
    assertType<string | null>(auth.userId);
  } else if (auth.tokenType === 'machine_token') {
    // Should be AuthenticatedMachineObject<'machine_token'> - has id, name, claims
    expectTypeOf(auth.id).toMatchTypeOf<string | null>();
    expectTypeOf(auth.name).toMatchTypeOf<string | null>();
    expectTypeOf(auth.claims).toMatchTypeOf<Record<string, any> | null>();
    // Should NOT have session token properties
    // @ts-expect-error machine_token does not have userId property
    assertType<string | null>(auth.userId);
  } else if (auth.tokenType === 'oauth_token') {
    // Should be AuthenticatedMachineObject<'oauth_token'> - has id but NOT name/claims
    expectTypeOf(auth.id).toMatchTypeOf<string | null>();
    // Should NOT have name or claims
    // @ts-expect-error oauth_token does not have name property
    assertType<string | null>(auth.name);
    // @ts-expect-error oauth_token does not have claims property
    assertType<Record<string, any> | null>(auth.claims);
    // Should NOT have session token properties
    // @ts-expect-error oauth_token does not have userId property
    assertType<string | null>(auth.userId);
  }
});
