import { expectTypeOf, test } from 'vitest';

import type { RequestState, TokenType } from '../../internal';
import { authenticateRequest } from '../../tokens/request';

test('returns the correct `authenticateRequest()` return type for each accepted token type', () => {
  const request = new Request('https://example.com');

  // Session token by default
  expectTypeOf(authenticateRequest(request)).toMatchTypeOf<Promise<RequestState>>();

  // Individual token types
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'session_token' })).toMatchTypeOf<
    Promise<RequestState<'session_token'>>
  >();
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'api_key' })).toMatchTypeOf<
    Promise<RequestState<'api_key'>>
  >();
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'm2m_token' })).toMatchTypeOf<
    Promise<RequestState<'m2m_token'>>
  >();
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'oauth_token' })).toMatchTypeOf<
    Promise<RequestState<'oauth_token'>>
  >();

  // Array of token types
  expectTypeOf(authenticateRequest(request, { acceptsToken: ['session_token', 'api_key', 'm2m_token'] })).toMatchTypeOf<
    Promise<RequestState<'session_token' | 'api_key' | 'm2m_token' | null>>
  >();

  // Any token type
  expectTypeOf(authenticateRequest(request, { acceptsToken: 'any' })).toMatchTypeOf<Promise<RequestState<TokenType>>>();
});
