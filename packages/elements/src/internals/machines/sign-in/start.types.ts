import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ActorRefFrom, DoneActorEvent, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form';

import type { TSignInRouterMachine } from './router.machine';

// ---------------------------------- Tags ---------------------------------- //

export type SignInStartTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInStartSubmitEvent = { type: 'SUBMIT' };

export type SignInStartEvents = ErrorActorEvent | SignInStartSubmitEvent | DoneActorEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignInStartInput = {
  basePath?: string;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: ActorRefFrom<TSignInRouterMachine>;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignInStartContext {
  basePath: string;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: ActorRefFrom<TSignInRouterMachine>;
  loadingStep: 'start';
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInStartSchema {
  context: SignInStartContext;
  input: SignInStartInput;
  events: SignInStartEvents;
  tags: SignInStartTags;
}
