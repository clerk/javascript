import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { Web3Strategy } from '@clerk/shared/types';
import type { ActorRefFrom, DoneActorEvent, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form';

import type { SignInRouterMachineActorRef } from './router.types';

// ---------------------------------- Tags ---------------------------------- //

export type SignInStartTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInStartSubmitEvent = { type: 'SUBMIT'; action: 'submit' };
export type SignInStartPasskeyEvent = { type: 'AUTHENTICATE.PASSKEY'; action: 'passkey' };
export type SignInStartPasskeyAutofillEvent = { type: 'AUTHENTICATE.PASSKEY.AUTOFILL' };
export type SignInStartWeb3Event = { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy };

export type SignInStartEvents =
  | ErrorActorEvent
  | SignInStartSubmitEvent
  | SignInStartPasskeyEvent
  | SignInStartPasskeyAutofillEvent
  | SignInStartWeb3Event
  | DoneActorEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignInStartInput = {
  basePath?: string;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
  ticket?: string | undefined;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignInStartContext {
  basePath: string;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
  loadingStep: 'start';
  ticket?: string | undefined;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInStartSchema {
  context: SignInStartContext;
  input: SignInStartInput;
  events: SignInStartEvents;
  tags: SignInStartTags;
}
