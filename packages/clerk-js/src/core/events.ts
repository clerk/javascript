import { createEventBus } from '@clerk/shared/eventBus';
import type { TokenResource } from '@clerk/types';

import type { SignIn } from './resources';

export const events = {
  TokenUpdate: 'token:update',
  UserSignOut: 'user:signOut',
  EnvironmentUpdate: 'environment:update',
  SessionTokenResolved: 'session:tokenResolved',
  SignInUpdate: 'signin:update',
} as const;

type TokenUpdatePayload = { token: TokenResource | null };
export type SignInUpdatePayload = { resource: SignIn };

type InternalEvents = {
  [events.TokenUpdate]: TokenUpdatePayload;
  [events.UserSignOut]: null;
  [events.EnvironmentUpdate]: null;
  [events.SessionTokenResolved]: null;
  [events.SignInUpdate]: SignInUpdatePayload;
};

export const eventBus = createEventBus<InternalEvents>();
