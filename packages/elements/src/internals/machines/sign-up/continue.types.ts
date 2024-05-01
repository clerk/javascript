import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form';

import type { TSignUpRouterMachine } from './router.machine';

// ---------------------------------- Tags ---------------------------------- //

export type SignUpContinueTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignUpContinueSubmitEvent = { type: 'SUBMIT' };

export type SignUpContinueEvents = ErrorActorEvent | SignUpContinueSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignUpContinueInput = {
  basePath?: string;
  formRef: ActorRefFrom<typeof FormMachine>;
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
