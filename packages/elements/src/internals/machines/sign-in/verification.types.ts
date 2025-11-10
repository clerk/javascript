import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInFactor } from '@clerk/shared/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form';
import type { SignInStrategyName } from '~/internals/machines/shared';

import type { SignInRouterMachineActorRef } from './router.types';

// ---------------------------------- Tags ---------------------------------- //

export type SignInVerificationTags =
  | 'state:attempting'
  | 'state:choose-strategy'
  | 'state:forgot-password'
  | 'state:loading'
  | 'state:pending'
  | 'state:preparing';

// ---------------------------------- Events ---------------------------------- //

export type SignInVerificationSubmitEvent = { type: 'SUBMIT'; action: 'submit' };
export type SignInVerificationFactorUpdateEvent = { type: 'STRATEGY.UPDATE'; factor: SignInFactor | undefined };
export type SignInVerificationRetryEvent = { type: 'RETRY' };
export type SignInVerificationStrategyRegisterEvent = { type: 'STRATEGY.REGISTER'; factor: SignInStrategyName };
export type SignInVerificationStrategyUnregisterEvent = { type: 'STRATEGY.UNREGISTER'; factor: SignInStrategyName };

export type SignInVerificationEvents =
  | ErrorActorEvent
  | SignInVerificationSubmitEvent
  | SignInVerificationFactorUpdateEvent
  | SignInVerificationRetryEvent
  | SignInVerificationStrategyRegisterEvent
  | SignInVerificationStrategyUnregisterEvent;

// ---------------------------------- Input ---------------------------------- //

export interface SignInVerificationInput {
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
  basePath?: string;
}

// ---------------------------------- Context ---------------------------------- //

export interface SignInVerificationContext {
  currentFactor: SignInFactor | null;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
  loadingStep: 'verifications';
  registeredStrategies: Set<SignInStrategyName>;
  resendable: boolean;
  resendableAfter: number;
  basePath?: string;
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
