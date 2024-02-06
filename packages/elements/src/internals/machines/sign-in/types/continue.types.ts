import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk, SignInFactor } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { SignInRouterMachine } from '~/internals/machines/sign-in/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignInContinueTags = 'state:pending' | 'state:preparing' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInContinueSubmitEvent = { type: 'SUBMIT' };
export type SignInContinueEvents = ErrorActorEvent | SignInContinueSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export interface SignInContinueInput {
  clerk: LoadedClerk;
  form: ActorRefFrom<typeof FormMachine>;
  router: ActorRefFrom<typeof SignInRouterMachine>;
}

// ---------------------------------- Context ---------------------------------- //

export interface SignInContinueContext {
  currentFactor: SignInFactor | null;
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  routerRef: ActorRefFrom<typeof SignInRouterMachine>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInContinueSchema {
  context: SignInContinueContext;
  input: SignInContinueInput;
  events: SignInContinueEvents;
  tags: SignInContinueTags;
}
