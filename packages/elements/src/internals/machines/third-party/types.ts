import type { AuthenticateWithRedirectParams, LoadedClerk } from '@clerk/types';
import type { SetOptional } from 'type-fest';

import type { ClerkJSNavigationEvent } from '~/internals/machines/utils/clerkjs';
import type { EnabledThirdPartyProviders } from '~/utils/third-party-strategies';

type Flow = 'signIn' | 'signUp';

// ================= Schema ================= //

export interface ThirdPartyMachineSchema {
  context: ThirdPartyMachineContext;
  input: ThirdPartyMachineInput;
  events: ThirdPartyMachineEvent;
}

// ================= Context ================= //

export interface ThirdPartyMachineContext {
  /**
   * Currently active strategy
   * (Can be used for loading states)
   */
  activeStrategy: string | null; // TODO: Update type
  basePath: string;
  flow: Flow;
  clerk: LoadedClerk;
  thirdPartyProviders: EnabledThirdPartyProviders;
}

// ================= Input ================= //

export interface ThirdPartyMachineInput {
  basePath: string;
  flow: Flow;
  clerk: LoadedClerk;
}

// ================= Events ================= //

export type RedirectEvent = {
  type: 'REDIRECT';
  params: SetOptional<AuthenticateWithRedirectParams, 'redirectUrl' | 'redirectUrlComplete'>;
};
export type RedirectCallbackEvent = { type: 'CALLBACK' };
export type CallbackNavigationEvent = { type: ClerkJSNavigationEvent };

export type ThirdPartyMachineEvent = RedirectEvent | RedirectCallbackEvent | CallbackNavigationEvent;
