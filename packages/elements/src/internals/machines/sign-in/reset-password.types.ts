import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form';

import type { TSignInRouterMachine } from './router.machine';

// ---------------------------------- Tags ---------------------------------- //

export type SignInResetPasswordTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInResetPasswordSubmitEvent = { type: 'SUBMIT' };

export type SignInResetPasswordEvents = ErrorActorEvent | SignInResetPasswordSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignInResetPasswordInput = {
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: ActorRefFrom<TSignInRouterMachine>;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignInResetPasswordContext {
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  loadingStep: 'reset-password';
  parent: ActorRefFrom<TSignInRouterMachine>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInResetPasswordSchema {
  context: SignInResetPasswordContext;
  input: SignInResetPasswordInput;
  events: SignInResetPasswordEvents;
  tags: SignInResetPasswordTags;
}
