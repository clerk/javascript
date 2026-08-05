import { expectTypeOf, test } from 'vitest';

import type { AuthenticateRequestOptions, RequestState, TokenType } from '../../internal';
import type { AuthenticatedState, HandshakeState, UnauthenticatedState } from '../authStatus';
import { authenticateRequest } from '../request';

test('returns the correct `authenticateRequest()` return type for each accepted token type', () => {
  const request = new Request('https://example.com');

  // Session token by default
  expectTypeOf(authenticateRequest(request)).toExtend<Promise<RequestState>>();

  // Individual token types
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'session_token' })).toExtend<
    Promise<RequestState<'session_token'>>
  >();
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'api_key' })).toExtend<Promise<RequestState<'api_key'>>>();
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'm2m_token' })).toExtend<
    Promise<RequestState<'m2m_token'>>
  >();
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'oauth_token' })).toExtend<
    Promise<RequestState<'oauth_token'>>
  >();

  // Array of token types
  expectTypeOf(authenticateRequest(request, { acceptsToken: ['session_token', 'api_key', 'm2m_token'] })).toExtend<
    Promise<RequestState<'session_token' | 'api_key' | 'm2m_token' | null>>
  >();

  // Any token type
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'any' })).toExtend<Promise<RequestState<TokenType>>>();
});

test('pins the exact resolved state union per accepted token type', () => {
  const request = new Request('https://example.com');

  // Session tokens (and the no-options default) include HandshakeState
  expectTypeOf(authenticateRequest(request)).resolves.toEqualTypeOf<
    AuthenticatedState<'session_token'> | UnauthenticatedState<'session_token'> | HandshakeState
  >();
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'session_token' })).resolves.toEqualTypeOf<
    AuthenticatedState<'session_token'> | UnauthenticatedState<'session_token'> | HandshakeState
  >();

  // Machine tokens never produce a HandshakeState or a null tokenType
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'api_key' })).resolves.toEqualTypeOf<
    AuthenticatedState<'api_key'> | UnauthenticatedState<'api_key'>
  >();
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'm2m_token' })).resolves.toEqualTypeOf<
    AuthenticatedState<'m2m_token'> | UnauthenticatedState<'m2m_token'>
  >();

  // Arrays add `null` to the unauthenticated side (invalid token) and keep
  // HandshakeState only when session_token is a member
  expectTypeOf(authenticateRequest(request, { acceptsToken: ['session_token', 'api_key'] })).resolves.toEqualTypeOf<
    | AuthenticatedState<'session_token' | 'api_key'>
    | UnauthenticatedState<'session_token' | 'api_key' | null>
    | HandshakeState
  >();
  expectTypeOf(authenticateRequest(request, { acceptsToken: ['m2m_token', 'oauth_token'] })).resolves.toEqualTypeOf<
    AuthenticatedState<'m2m_token' | 'oauth_token'> | UnauthenticatedState<'m2m_token' | 'oauth_token' | null>
  >();
});

test('accepts widened token type arrays but rejects readonly arrays', () => {
  const request = new Request('https://example.com');

  const readonlyTokens = ['session_token', 'api_key'] as const;
  // @ts-expect-error acceptsToken is typed as a mutable TokenType[], so `as const` arrays are rejected
  void authenticateRequest(request, { acceptsToken: readonlyTokens });

  const widenedTokens: TokenType[] = ['session_token', 'api_key'];
  expectTypeOf(authenticateRequest(request, { acceptsToken: widenedTokens })).toExtend<
    Promise<RequestState<TokenType | null>>
  >();
});

test('pins Parameters/ReturnType extraction to the last overload', () => {
  expectTypeOf<Parameters<typeof authenticateRequest>>().toEqualTypeOf<
    [request: Request, options?: AuthenticateRequestOptions]
  >();
  expectTypeOf<ReturnType<typeof authenticateRequest>>().toEqualTypeOf<Promise<RequestState<'session_token'>>>();
});
