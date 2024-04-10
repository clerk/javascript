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
export type SignInVerificationStrategyRegisterEvent = { type: 'STRATEGY.REGISTER'; factor: SignInFactor };
export type SignInVerificationStrategyUnregisterEvent = { type: 'STRATEGY.UNREGISTER'; factor: SignInFactor };

export type SignInVerificationEvents =
  | ErrorActorEvent
  | SignInVerificationSubmitEvent
  | SignInVerificationFactorUpdateEvent
  | SignInVerificationStrategyRegisterEvent
  | SignInVerificationStrategyUnregisterEvent;

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
  registeredStrategies: Set<SignInFactor>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInVerificationSchema {
  context: SignInVerificationContext;
  input: SignInVerificationInput;
  events: SignInVerificationEvents;
  tags: SignInVerificationTags;
}
