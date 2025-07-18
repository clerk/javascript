import { createEventBus } from '@clerk/shared/eventBus';
import type { TokenResource } from '@clerk/types';

export const events = {
  TokenUpdate: 'token:update',
  UserSignOut: 'user:signOut',
  EnvironmentUpdate: 'environment:update',
  SessionTokenResolved: 'session:tokenResolved',
  ErrorUserLocked: 'error:user_locked',
} as const;

type TokenUpdatePayload = { token: TokenResource | null };

type InternalEvents = {
  [events.TokenUpdate]: TokenUpdatePayload;
  [events.UserSignOut]: null;
  [events.EnvironmentUpdate]: null;
  [events.SessionTokenResolved]: null;
  [events.ErrorUserLocked]: null;
};

export const eventBus = createEventBus<InternalEvents>();
