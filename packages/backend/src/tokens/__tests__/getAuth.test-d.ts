import { assertType, test } from 'vitest';

import type { AuthObject } from '../authObjects';
import type { GetAuthFn, MachineAuthObject, SessionAuthObject } from '../types';

// Across our SDKs, we have a getAuth() function
const getAuth: GetAuthFn<Request> = (_request: any, _options: any) => {
  return {} as any;
};

test('infers the correct AuthObject type for each accepted token type', () => {
  const request = new Request('https://example.com');

  // Session token by default
  assertType<SessionAuthObject>(getAuth(request));

  // Individual token types
  assertType<SessionAuthObject>(getAuth(request, { acceptsToken: 'session_token' }));
  assertType<MachineAuthObject<'api_key'>>(getAuth(request, { acceptsToken: 'api_key' }));
  assertType<MachineAuthObject<'machine_token'>>(getAuth(request, { acceptsToken: 'machine_token' }));
  assertType<MachineAuthObject<'oauth_token'>>(getAuth(request, { acceptsToken: 'oauth_token' }));

  // Array of token types
  assertType<SessionAuthObject | MachineAuthObject<'machine_token'>>(
    getAuth(request, { acceptsToken: ['session_token', 'machine_token'] }),
  );
  assertType<MachineAuthObject<'machine_token' | 'oauth_token'>>(
    getAuth(request, { acceptsToken: ['machine_token', 'oauth_token'] }),
  );

  // Any token type
  assertType<AuthObject>(getAuth(request, { acceptsToken: 'any' }));
});

test('verifies correct properties exist for each token type', () => {
  const request = new Request('https://example.com');

  // Session token should have userId
  const sessionAuth = getAuth(request, { acceptsToken: 'session_token' });
  assertType<string | null>(sessionAuth.userId);

  // All machine tokens should have id and subject
  const apiKeyAuth = getAuth(request, { acceptsToken: 'api_key' });
  const machineTokenAuth = getAuth(request, { acceptsToken: 'machine_token' });
  const oauthTokenAuth = getAuth(request, { acceptsToken: 'oauth_token' });

  assertType<string | null>(apiKeyAuth.id);
  assertType<string | null>(machineTokenAuth.id);
  assertType<string | null>(oauthTokenAuth.id);
  assertType<string | null>(apiKeyAuth.subject);
  assertType<string | null>(machineTokenAuth.subject);
  assertType<string | null>(oauthTokenAuth.subject);

  // Only api_key and machine_token should have name and claims
  assertType<string | null>(apiKeyAuth.name);
  assertType<Record<string, any> | null>(apiKeyAuth.claims);

  assertType<string | null>(machineTokenAuth.name);
  assertType<Record<string, any> | null>(machineTokenAuth.claims);

  // oauth_token should NOT have name and claims
  // @ts-expect-error oauth_token does not have name property
  void oauthTokenAuth.name;
  // @ts-expect-error oauth_token does not have claims property
  void oauthTokenAuth.claims;
});

test('verifies discriminated union works correctly with acceptsToken: any', () => {
  const request = new Request('https://example.com');

  const auth = getAuth(request, { acceptsToken: 'any' });

  if (auth.tokenType === 'session_token') {
    // Should be SessionAuthObject - has userId
    assertType<string | null>(auth.userId);
    // Should NOT have machine token properties
    // @ts-expect-error session_token does not have id property
    void auth.id;
  } else if (auth.tokenType === 'api_key') {
    // Should be AuthenticatedMachineObject<'api_key'> - has id, name, claims
    assertType<string | null>(auth.id);
    assertType<string | null>(auth.name);
    assertType<Record<string, any> | null>(auth.claims);
    // Should NOT have session token properties
    // @ts-expect-error api_key does not have userId property
    void auth.userId;
  } else if (auth.tokenType === 'machine_token') {
    // Should be AuthenticatedMachineObject<'machine_token'> - has id, name, claims
    assertType<string | null>(auth.id);
    assertType<string | null>(auth.name);
    assertType<Record<string, any> | null>(auth.claims);
    // Should NOT have session token properties
    // @ts-expect-error machine_token does not have userId property
    void auth.userId;
  } else if (auth.tokenType === 'oauth_token') {
    // Should be AuthenticatedMachineObject<'oauth_token'> - has id but NOT name/claims
    assertType<string | null>(auth.id);
    // Should NOT have name or claims
    // @ts-expect-error oauth_token does not have name property
    void auth.name;
    // @ts-expect-error oauth_token does not have claims property
    void auth.claims;
    // Should NOT have session token properties
    // @ts-expect-error oauth_token does not have userId property
    void auth.userId;
  }
});
