import { expectTypeOf, test } from 'vitest';

import type { RedirectFun } from '../../createRedirect';
import type { AuthObject, InvalidTokenAuthObject } from '../authObjects';
import type { GetAuthFn, GetAuthFnNoRequest, MachineAuthObject, SessionAuthObject } from '../types';

describe('getAuth() or auth() with request parameter', () => {
  const getAuth: GetAuthFn<Request> = (_request: any, _options: any) => {
    return {} as any;
  };

  test('infers the correct AuthObject type for each accepted token type', () => {
    const request = new Request('https://example.com');

    // Session token by default
    expectTypeOf(getAuth(request)).toExtend<SessionAuthObject>();

    // Individual token types
    expectTypeOf(getAuth(request, { acceptsToken: 'session_token' })).toExtend<SessionAuthObject>();
    expectTypeOf(getAuth(request, { acceptsToken: 'api_key' })).toExtend<MachineAuthObject<'api_key'>>();
    expectTypeOf(getAuth(request, { acceptsToken: 'm2m_token' })).toExtend<MachineAuthObject<'m2m_token'>>();
    expectTypeOf(getAuth(request, { acceptsToken: 'oauth_token' })).toExtend<MachineAuthObject<'oauth_token'>>();

    // Array of token types
    expectTypeOf(getAuth(request, { acceptsToken: ['session_token', 'm2m_token'] })).toExtend<
      SessionAuthObject | MachineAuthObject<'m2m_token'> | InvalidTokenAuthObject
    >();
    expectTypeOf(getAuth(request, { acceptsToken: ['m2m_token', 'oauth_token'] })).toExtend<
      MachineAuthObject<'m2m_token' | 'oauth_token'> | InvalidTokenAuthObject
    >();

    // Any token type
    expectTypeOf(getAuth(request, { acceptsToken: 'any' })).toExtend<AuthObject>();
  });

  test('verifies discriminated union works correctly with acceptsToken: any', () => {
    const request = new Request('https://example.com');

    const auth = getAuth(request, { acceptsToken: 'any' });

    if (auth.tokenType === 'session_token') {
      expectTypeOf(auth).toExtend<SessionAuthObject>();
    } else if (auth.tokenType === 'api_key') {
      expectTypeOf(auth).toExtend<MachineAuthObject<'api_key'>>();
    } else if (auth.tokenType === 'm2m_token') {
      expectTypeOf(auth).toExtend<MachineAuthObject<'m2m_token'>>();
    } else if (auth.tokenType === 'oauth_token') {
      expectTypeOf(auth).toExtend<MachineAuthObject<'oauth_token'>>();
    }
  });
});

describe('getAuth() or auth() without request parameter', () => {
  type SessionAuthWithRedirect = SessionAuthObject & {
    redirectToSignIn: RedirectFun<Response>;
    redirectToSignUp: RedirectFun<Response>;
  };

  // Mimic Next.js auth() helper
  const auth: GetAuthFnNoRequest<SessionAuthWithRedirect, true> = (_options: any) => {
    return {} as any;
  };

  test('infers the correct AuthObject type for each accepted token type', async () => {
    // Session token by default
    expectTypeOf(await auth()).toExtend<SessionAuthWithRedirect>();

    // Individual token types
    expectTypeOf(await auth({ acceptsToken: 'session_token' })).toExtend<SessionAuthWithRedirect>();
    expectTypeOf(await auth({ acceptsToken: 'api_key' })).toExtend<MachineAuthObject<'api_key'>>();
    expectTypeOf(await auth({ acceptsToken: 'm2m_token' })).toExtend<MachineAuthObject<'m2m_token'>>();
    expectTypeOf(await auth({ acceptsToken: 'oauth_token' })).toExtend<MachineAuthObject<'oauth_token'>>();

    // Array of token types
    expectTypeOf(await auth({ acceptsToken: ['session_token', 'm2m_token'] })).toExtend<
      SessionAuthWithRedirect | MachineAuthObject<'m2m_token'> | InvalidTokenAuthObject
    >();
    expectTypeOf(await auth({ acceptsToken: ['m2m_token', 'oauth_token'] })).toExtend<
      MachineAuthObject<'m2m_token' | 'oauth_token'> | InvalidTokenAuthObject
    >();

    // Any token type
    expectTypeOf(await auth({ acceptsToken: 'any' })).toExtend<AuthObject>();
  });

  test('verifies discriminated union works correctly with acceptsToken: any', async () => {
    const authObject = await auth({ acceptsToken: 'any' });

    if (authObject.tokenType === 'session_token') {
      expectTypeOf(authObject).toExtend<SessionAuthWithRedirect>();
    } else if (authObject.tokenType === 'api_key') {
      expectTypeOf(authObject).toExtend<MachineAuthObject<'api_key'>>();
    } else if (authObject.tokenType === 'm2m_token') {
      expectTypeOf(authObject).toExtend<MachineAuthObject<'m2m_token'>>();
    } else if (authObject.tokenType === 'oauth_token') {
      expectTypeOf(authObject).toExtend<MachineAuthObject<'oauth_token'>>();
    }
  });
});
