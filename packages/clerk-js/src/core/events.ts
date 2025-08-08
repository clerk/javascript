import { createEventBus } from '@clerk/shared/eventBus';
import type { TokenResource } from '@clerk/types';

import type { BaseResource } from './resources/Base';

export const events = {
  TokenUpdate: 'token:update',
  UserSignOut: 'user:signOut',
  EnvironmentUpdate: 'environment:update',
  SessionTokenResolved: 'session:tokenResolved',
  ResourceUpdate: 'resource:update',
  ResourceError: 'resource:error',
} as const;

type TokenUpdatePayload = { token: TokenResource | null };
export type ResourceUpdatePayload = { resource: BaseResource };
export type ResourceErrorPayload = { resource: BaseResource; error: unknown };

type InternalEvents = {
  [events.TokenUpdate]: TokenUpdatePayload;
  [events.UserSignOut]: null;
  [events.EnvironmentUpdate]: null;
  [events.SessionTokenResolved]: null;
  [events.ResourceUpdate]: ResourceUpdatePayload;
  [events.ResourceError]: ResourceErrorPayload;
};

export const eventBus = createEventBus<InternalEvents>();
