import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { TSignInRouterMachine } from '~/internals/machines/sign-in/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignInStartTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInStartSubmitEvent = { type: 'SUBMIT' };

export type SignInStartEvents = ErrorActorEvent | SignInStartSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignInStartInput = {
  basePath?: string;
  form: ActorRefFrom<typeof FormMachine>;
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
