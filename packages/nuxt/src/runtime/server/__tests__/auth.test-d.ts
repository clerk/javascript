import type { AuthObject, InvalidTokenAuthObject, MachineAuthObject, SessionAuthObject } from '@clerk/backend';
import { expectTypeOf, test } from 'vitest';

import type { AuthFn } from '../types';

test('infers the correct AuthObject type for each accepted token type', () => {
  // Mock event object
  const event = {
    locals: {
      auth: (() => {}) as AuthFn,
    },
  };

  // Session token by default
  expectTypeOf(event.locals.auth()).toMatchTypeOf<SessionAuthObject>();

  // Individual token types
  expectTypeOf(event.locals.auth({ acceptsToken: 'session_token' })).toMatchTypeOf<SessionAuthObject>();
  expectTypeOf(event.locals.auth({ acceptsToken: 'api_key' })).toMatchTypeOf<MachineAuthObject<'api_key'>>();
  expectTypeOf(event.locals.auth({ acceptsToken: 'm2m_token' })).toMatchTypeOf<MachineAuthObject<'m2m_token'>>();
  expectTypeOf(event.locals.auth({ acceptsToken: 'oauth_token' })).toMatchTypeOf<MachineAuthObject<'oauth_token'>>();

  // Array of token types
  expectTypeOf(event.locals.auth({ acceptsToken: ['session_token', 'm2m_token'] })).toMatchTypeOf<
    SessionAuthObject | MachineAuthObject<'m2m_token'> | InvalidTokenAuthObject
  >();
  expectTypeOf(event.locals.auth({ acceptsToken: ['m2m_token', 'oauth_token'] })).toMatchTypeOf<
    MachineAuthObject<'m2m_token' | 'oauth_token'> | InvalidTokenAuthObject
  >();

  // Any token type
  expectTypeOf(event.locals.auth({ acceptsToken: 'any' })).toMatchTypeOf<AuthObject>();
});

test('verifies discriminated union works correctly with acceptsToken: any', () => {
  // Mock event object
  const event = {
    locals: {
      auth: (() => {}) as AuthFn,
    },
  };

  const auth = event.locals.auth({ acceptsToken: 'any' });

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
