import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { SignUpRouterMachine } from '~/internals/machines/sign-up/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignUpContinueTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignUpContinueSubmitEvent = { type: 'SUBMIT' };

export type SignUpContinueEvents = ErrorActorEvent | SignUpContinueSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignUpContinueInput = {
  basePath?: string;
  clerk: LoadedClerk;
  form: ActorRefFrom<typeof FormMachine>;
  router: ActorRefFrom<typeof SignUpRouterMachine>;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignUpContinueContext {
  basePath: string;
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  routerRef: ActorRefFrom<typeof SignUpRouterMachine>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignUpContinueSchema {
  context: SignUpContinueContext;
  input: SignUpContinueInput;
  events: SignUpContinueEvents;
  tags: SignUpContinueTags;
}
