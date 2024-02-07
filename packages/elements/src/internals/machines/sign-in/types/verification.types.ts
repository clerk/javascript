import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk, SignInFactor } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { SignInRouterMachine } from '~/internals/machines/sign-in/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignInVerificationTags = 'state:pending' | 'state:preparing' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInVerificationSubmitEvent = { type: 'SUBMIT' };
export type SignInVerificationEvents = ErrorActorEvent | SignInVerificationSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export interface SignInVerificationInput {
  clerk: LoadedClerk;
  form: ActorRefFrom<typeof FormMachine>;
  router: ActorRefFrom<typeof SignInRouterMachine>;
}

// ---------------------------------- Context ---------------------------------- //

export interface SignInVerificationContext {
  currentFactor: SignInFactor | null;
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  routerRef: ActorRefFrom<typeof SignInRouterMachine>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInVerificationSchema {
  context: SignInVerificationContext;
  input: SignInVerificationInput;
  events: SignInVerificationEvents;
  tags: SignInVerificationTags;
}
