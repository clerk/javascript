import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { SignInRouterMachine } from '~/internals/machines/sign-in/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignInStartTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInStartSubmitEvent = { type: 'SUBMIT' };

export type SignInStartEvents = ErrorActorEvent | SignInStartSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignInStartInput = {
  form: ActorRefFrom<typeof FormMachine>;
  basePath?: string; // Standard
  clerk: LoadedClerk; // Standard
  router: ActorRefFrom<typeof SignInRouterMachine>; // Standard
};

// ---------------------------------- Context ---------------------------------- //

export interface SignInStartContext {
  basePath: string;
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  routerRef: ActorRefFrom<typeof SignInRouterMachine>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInStartSchema {
  context: SignInStartContext;
  input: SignInStartInput;
  events: SignInStartEvents;
  tags: SignInStartTags;
}
