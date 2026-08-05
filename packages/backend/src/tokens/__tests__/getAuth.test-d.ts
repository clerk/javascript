import type { PendingSessionOptions } from '@clerk/shared/types';
import { describe, expectTypeOf, test } from 'vitest';

import type { RedirectFun } from '../../createRedirect';
import type {
  AuthenticatedMachineObject,
  AuthObject,
  InvalidTokenAuthObject,
  SignedInAuthObject,
} from '../authObjects';
import type { TokenType } from '../tokenTypes';
import type {
  GetAuthFn,
  GetAuthFnNoRequest,
  InferAuthObjectFromToken,
  InferAuthObjectFromTokenArray,
  MachineAuthObject,
  SessionAuthObject,
} from '../types';

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

describe('contract pins: mutual assignability of every return type', () => {
  const getAuth: GetAuthFn<Request> = (_request: any, _options: any) => {
    return {} as any;
  };
  const request = new Request('https://example.com');

  test('single token types resolve to exactly the clean unions', () => {
    const def = getAuth(request);
    expectTypeOf(def).toEqualTypeOf<SessionAuthObject>();

    const session = getAuth(request, { acceptsToken: 'session_token' });
    expectTypeOf(session).toEqualTypeOf<SessionAuthObject>();

    const apiKey = getAuth(request, { acceptsToken: 'api_key' });
    expectTypeOf(apiKey).toExtend<MachineAuthObject<'api_key'>>();
    expectTypeOf<MachineAuthObject<'api_key'>>().toExtend<typeof apiKey>();

    const m2m = getAuth(request, { acceptsToken: 'm2m_token' });
    expectTypeOf(m2m).toExtend<MachineAuthObject<'m2m_token'>>();
    expectTypeOf<MachineAuthObject<'m2m_token'>>().toExtend<typeof m2m>();

    const oauth = getAuth(request, { acceptsToken: 'oauth_token' });
    expectTypeOf(oauth).toExtend<MachineAuthObject<'oauth_token'>>();
    expectTypeOf<MachineAuthObject<'oauth_token'>>().toExtend<typeof oauth>();
  });

  test('array token types include InvalidTokenAuthObject and the clean per-token unions', () => {
    const sessionOnly = getAuth(request, { acceptsToken: ['session_token'] });
    expectTypeOf(sessionOnly).toExtend<SessionAuthObject | InvalidTokenAuthObject>();
    expectTypeOf<SessionAuthObject | InvalidTokenAuthObject>().toExtend<typeof sessionOnly>();

    const mixed = getAuth(request, { acceptsToken: ['session_token', 'm2m_token'] });
    expectTypeOf(mixed).toExtend<SessionAuthObject | MachineAuthObject<'m2m_token'> | InvalidTokenAuthObject>();
    expectTypeOf<SessionAuthObject | MachineAuthObject<'m2m_token'> | InvalidTokenAuthObject>().toExtend<
      typeof mixed
    >();

    const machineOnly = getAuth(request, { acceptsToken: ['m2m_token', 'oauth_token'] });
    expectTypeOf(machineOnly).toExtend<MachineAuthObject<'m2m_token' | 'oauth_token'> | InvalidTokenAuthObject>();
    expectTypeOf<MachineAuthObject<'m2m_token' | 'oauth_token'> | InvalidTokenAuthObject>().toExtend<
      typeof machineOnly
    >();
  });

  test('widened TokenType[] arrays resolve to the full union', () => {
    const widenedTokens: TokenType[] = ['session_token', 'api_key'];
    const widened = getAuth(request, { acceptsToken: widenedTokens });
    expectTypeOf(widened).toExtend<
      SessionAuthObject | MachineAuthObject<'api_key' | 'm2m_token' | 'oauth_token'> | InvalidTokenAuthObject
    >();
    expectTypeOf<
      SessionAuthObject | MachineAuthObject<'api_key' | 'm2m_token' | 'oauth_token'> | InvalidTokenAuthObject
    >().toExtend<typeof widened>();
  });

  test('acceptsToken: any resolves to exactly AuthObject', () => {
    const any = getAuth(request, { acceptsToken: 'any' });
    expectTypeOf(any).toEqualTypeOf<AuthObject>();
  });

  test('narrowing on tokenType is exhaustive for array token types', () => {
    const auth = getAuth(request, { acceptsToken: ['session_token', 'api_key'] });
    switch (auth.tokenType) {
      case 'session_token':
        expectTypeOf(auth).toExtend<SessionAuthObject>();
        break;
      case 'api_key':
        expectTypeOf(auth).toExtend<MachineAuthObject<'api_key'>>();
        break;
      case null:
        expectTypeOf(auth).toEqualTypeOf<InvalidTokenAuthObject>();
        break;
      default:
        expectTypeOf(auth).toBeNever();
    }
  });

  test('pins Parameters/ReturnType extraction to the last overload', () => {
    expectTypeOf<Parameters<typeof getAuth>>().toEqualTypeOf<[req: Request, options?: PendingSessionOptions]>();
    expectTypeOf<ReturnType<typeof getAuth>>().toEqualTypeOf<SessionAuthObject>();
  });
});

describe('contract pins: InferAuthObjectFromToken(Array) support protect()-style usage', () => {
  // Mimic @clerk/nextjs protect(), which passes a bare AuthenticatedMachineObject
  // union as MachineType. Published nextjs dists import these helpers by name from
  // @clerk/backend/internal, so their signatures are frozen for the 3.x line.
  test('single token helper accepts every clean machine member', () => {
    type Session = InferAuthObjectFromToken<'session_token', SignedInAuthObject, AuthenticatedMachineObject>;
    expectTypeOf<Session>().toEqualTypeOf<SignedInAuthObject>();

    type ApiKey = InferAuthObjectFromToken<'api_key', SignedInAuthObject, AuthenticatedMachineObject>;
    expectTypeOf<AuthenticatedMachineObject<'api_key'>>().toExtend<ApiKey>();
  });

  test('array helper accepts every clean member per token type', () => {
    type Mixed = InferAuthObjectFromTokenArray<
      ('session_token' | 'm2m_token')[],
      SignedInAuthObject,
      AuthenticatedMachineObject
    >;
    expectTypeOf<SignedInAuthObject | AuthenticatedMachineObject<'m2m_token'>>().toExtend<Mixed>();

    type MachineOnly = InferAuthObjectFromTokenArray<
      ('m2m_token' | 'oauth_token')[],
      SignedInAuthObject,
      AuthenticatedMachineObject
    >;
    expectTypeOf<AuthenticatedMachineObject<'m2m_token' | 'oauth_token'>>().toExtend<MachineOnly>();
  });
});

describe('contract pins: GetAuthFnNoRequest mutual assignability', () => {
  type SessionAuthWithRedirect = SessionAuthObject & {
    redirectToSignIn: RedirectFun<Response>;
    redirectToSignUp: RedirectFun<Response>;
  };

  const auth: GetAuthFnNoRequest<SessionAuthWithRedirect, true> = (_options: any) => {
    return {} as any;
  };

  test('machine and mixed return types accept every clean member', async () => {
    const apiKey = await auth({ acceptsToken: 'api_key' });
    expectTypeOf<MachineAuthObject<'api_key'>>().toExtend<typeof apiKey>();

    const mixed = await auth({ acceptsToken: ['session_token', 'm2m_token'] });
    expectTypeOf<SessionAuthWithRedirect | MachineAuthObject<'m2m_token'> | InvalidTokenAuthObject>().toExtend<
      typeof mixed
    >();

    const any = await auth({ acceptsToken: 'any' });
    expectTypeOf<Exclude<AuthObject, SessionAuthObject> | SessionAuthWithRedirect>().toExtend<typeof any>();
    expectTypeOf(any).toExtend<Exclude<AuthObject, SessionAuthObject> | SessionAuthWithRedirect>();
  });

  test('pins Parameters/ReturnType extraction to the last overload', () => {
    expectTypeOf<Parameters<typeof auth>>().toEqualTypeOf<[options?: PendingSessionOptions]>();
    expectTypeOf<ReturnType<typeof auth>>().toEqualTypeOf<Promise<SessionAuthWithRedirect>>();
  });
});

describe('contract pins: any-typed acceptsToken collapses to any', () => {
  // nextjs auth.protect() passes an untyped (any) token and accesses
  // redirect helpers on the result unconditionally; the signatures must keep
  // resolving to `any` for `any` inputs.
  const getAuth: GetAuthFn<Request> = (_request: any, _options: any) => {
    return {} as any;
  };

  test('any input keeps resolving to any', () => {
    const anyToken = undefined as any;
    const auth = getAuth(new Request('https://example.com'), { acceptsToken: anyToken });
    expectTypeOf(auth).toBeAny();
  });
});
