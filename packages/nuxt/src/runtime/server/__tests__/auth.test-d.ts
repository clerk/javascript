import type { AuthObject, InvalidTokenAuthObject, MachineAuthObject, SessionAuthObject } from '@clerk/backend';
import { expectTypeOf, test } from 'vitest';

import type { AuthFn } from '../types';

test('infers the correct AuthObject type for each accepted token type', () => {
  // Mock event object
  const event = {
    context: {
      auth: (() => {}) as AuthFn,
    },
  };

  // Session token by default
  expectTypeOf(event.context.auth()).toExtend<SessionAuthObject>();

  // Individual token types
  expectTypeOf(event.context.auth({ acceptsToken: 'session_token' })).toExtend<SessionAuthObject>();
  expectTypeOf(event.context.auth({ acceptsToken: 'api_key' })).toExtend<MachineAuthObject<'api_key'>>();
  expectTypeOf(event.context.auth({ acceptsToken: 'm2m_token' })).toExtend<MachineAuthObject<'m2m_token'>>();
  expectTypeOf(event.context.auth({ acceptsToken: 'oauth_token' })).toExtend<MachineAuthObject<'oauth_token'>>();

  // Array of token types
  expectTypeOf(event.context.auth({ acceptsToken: ['session_token', 'm2m_token'] })).toExtend<
    SessionAuthObject | MachineAuthObject<'m2m_token'> | InvalidTokenAuthObject
  >();
  expectTypeOf(event.context.auth({ acceptsToken: ['m2m_token', 'oauth_token'] })).toExtend<
    MachineAuthObject<'m2m_token' | 'oauth_token'> | InvalidTokenAuthObject
  >();

  // Any token type
  expectTypeOf(event.context.auth({ acceptsToken: 'any' })).toExtend<AuthObject>();
});

test('verifies discriminated union works correctly with acceptsToken: any', () => {
  // Mock event object
  const event = {
    context: {
      auth: (() => {}) as AuthFn,
    },
  };

  const auth = event.context.auth({ acceptsToken: 'any' });

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
