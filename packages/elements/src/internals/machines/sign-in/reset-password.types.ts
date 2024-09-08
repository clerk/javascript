import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form';

import type { SignInRouterMachineActorRef } from './router.types';

// ---------------------------------- Tags ---------------------------------- //

export type SignInResetPasswordTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInResetPasswordSubmitEvent = { type: 'SUBMIT'; action: 'submit' };

export type SignInResetPasswordEvents = ErrorActorEvent | SignInResetPasswordSubmitEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignInResetPasswordInput = {
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignInResetPasswordContext {
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  loadingStep: 'reset-password';
  parent: SignInRouterMachineActorRef;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInResetPasswordSchema {
  context: SignInResetPasswordContext;
  input: SignInResetPasswordInput;
  events: SignInResetPasswordEvents;
  tags: SignInResetPasswordTags;
}
