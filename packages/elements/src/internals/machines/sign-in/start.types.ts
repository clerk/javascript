import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ActorRefFrom, DoneActorEvent, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form';

import type { SignInRouterMachineActorRef } from './router.types';

// ---------------------------------- Tags ---------------------------------- //

export type SignInStartTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInStartSubmitEvent = { type: 'SUBMIT' };
export type SignInStartPasskeyEvent = { type: 'AUTHENTICATE.PASSKEY' };
export type SignInStartPasskeyAutofillEvent = { type: 'AUTHENTICATE.PASSKEY.AUTOFILL' };

export type SignInStartEvents =
  | ErrorActorEvent
  | SignInStartSubmitEvent
  | SignInStartPasskeyEvent
  | SignInStartPasskeyAutofillEvent
  | DoneActorEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignInStartInput = {
  basePath?: string;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignInStartContext {
  basePath: string;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
  loadingStep: 'start';
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInStartSchema {
  context: SignInStartContext;
  input: SignInStartInput;
  events: SignInStartEvents;
  tags: SignInStartTags;
}
