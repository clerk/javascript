import type { AuthenticateWithRedirectParams, LoadedClerk } from '@clerk/types';

import type { ClerkJSNavigationEvent } from '~/internals/machines/utils/clerkjs';
import type { EnabledThirdPartyProviders } from '~/utils/third-party-strategies';

// ================= Schema ================= //

export interface ThirdPartyMachineSchema {
  context: ThirdPartyMachineContext;
  input: ThirdPartyMachineInput;
  events: ThirdPartyMachineEvent;
}

// ================= Context ================= //

export interface ThirdPartyMachineContext {
  clerk: LoadedClerk;
  thirdPartyProviders: EnabledThirdPartyProviders;
}

// ================= Input ================= //

export interface ThirdPartyMachineInput {
  clerk: LoadedClerk;
}

// ================= Events ================= //

export type RedirectEventType = 'REDIRECT.SIGN_IN' | 'REDIRECT.SIGN_UP';

export type RedirectEvent = { type: RedirectEventType; params: AuthenticateWithRedirectParams };
export type RedirectCallbackEvent = { type: 'REDIRECT.CALLBACK' };
export type CallbackNavigationEvent = { type: ClerkJSNavigationEvent };

export type ThirdPartyMachineEvent = RedirectEvent | RedirectCallbackEvent | CallbackNavigationEvent;
