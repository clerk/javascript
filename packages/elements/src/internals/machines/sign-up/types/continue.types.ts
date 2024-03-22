import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { TSignUpRouterMachine } from '~/internals/machines/sign-up/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignUpContinueTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignUpContinueSubmitEvent = { type: 'SUBMIT' };

export type SignUpContinueEvents = ErrorActorEvent | SignUpContinueSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignUpContinueInput = {
  basePath?: string;
  form: ActorRefFrom<typeof FormMachine>;
  parent: ActorRefFrom<TSignUpRouterMachine>;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignUpContinueContext {
  basePath: string;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: ActorRefFrom<TSignUpRouterMachine>;
  loadingStep: 'continue';
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignUpContinueSchema {
  context: SignUpContinueContext;
  input: SignUpContinueInput;
  events: SignUpContinueEvents;
  tags: SignUpContinueTags;
}
