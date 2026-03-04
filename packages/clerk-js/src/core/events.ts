import type { ClerkError } from '@clerk/shared/error';
import { createEventBus } from '@clerk/shared/eventBus';
import type { TokenResource } from '@clerk/shared/types';

import type { BaseResource } from './resources/Base';

export const events = {
  TokenUpdate: 'token:update',
  UserSignOut: 'user:signOut',
  EnvironmentUpdate: 'environment:update',
  SessionTokenResolved: 'session:tokenResolved',
  ResourceStateChange: 'resource:state-change',
} as const;

type TokenUpdatePayload = { token: TokenResource | null };
export type ResourceStateChangePayload = {
  resource: BaseResource;
  error?: ClerkError | null;
  fetchStatus?: 'idle' | 'fetching';
};

type InternalEvents = {
  [events.TokenUpdate]: TokenUpdatePayload;
  [events.UserSignOut]: null;
  [events.EnvironmentUpdate]: null;
  [events.SessionTokenResolved]: null;
  [events.ResourceStateChange]: ResourceStateChangePayload;
};

export const eventBus = createEventBus<InternalEvents>();
