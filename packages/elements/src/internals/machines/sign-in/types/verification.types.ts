import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInFactor } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { TSignInRouterMachine } from '~/internals/machines/sign-in/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignInVerificationTags = 'state:pending' | 'state:preparing' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInVerificationSubmitEvent = { type: 'SUBMIT' };
export type SignInVerificationEvents = ErrorActorEvent | SignInVerificationSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export interface SignInVerificationInput {
  form: ActorRefFrom<typeof FormMachine>;
  parent: ActorRefFrom<TSignInRouterMachine>;
}

// ---------------------------------- Context ---------------------------------- //

export interface SignInVerificationContext {
  currentFactor: SignInFactor | null;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: ActorRefFrom<TSignInRouterMachine>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInVerificationSchema {
  context: SignInVerificationContext;
  input: SignInVerificationInput;
  events: SignInVerificationEvents;
  tags: SignInVerificationTags;
}
