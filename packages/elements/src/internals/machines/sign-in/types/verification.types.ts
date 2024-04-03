import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInFactor } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { TSignInRouterMachine } from '~/internals/machines/sign-in/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignInVerificationTags =
  | 'state:attempting'
  | 'state:choose-strategy'
  | 'state:loading'
  | 'state:pending'
  | 'state:preparing';

// ---------------------------------- Events ---------------------------------- //

export type SignInVerificationSubmitEvent = { type: 'SUBMIT' };
export type SignInVerificationFactorUpdateEvent = { type: 'STRATEGY.UPDATE'; factor: SignInFactor | undefined };
export type SignInVerificationRetryEvent = { type: 'RETRY' };

export type SignInVerificationEvents =
  | ErrorActorEvent
  | SignInVerificationSubmitEvent
  | SignInVerificationFactorUpdateEvent
  | SignInVerificationRetryEvent;

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
  loadingStep: 'verifications';
  resendable: boolean;
  resendableAfter: number;
}

// ---------------------------------- Delays ---------------------------------- //

export const SignInVerificationDelays = {
  resendableTimeout: 1_000, // 1 second
} as const;

export type SignInVerificationDelays = keyof typeof SignInVerificationDelays;

// ---------------------------------- Schema ---------------------------------- //

export interface SignInVerificationSchema {
  context: SignInVerificationContext;
  input: SignInVerificationInput;
  delays: SignInVerificationDelays;
  events: SignInVerificationEvents;
  tags: SignInVerificationTags;
}
