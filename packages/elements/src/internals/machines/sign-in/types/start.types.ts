import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk, OAuthStrategy, SamlStrategy, Web3Strategy } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { SignInRouterMachine } from '~/internals/machines/sign-in/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignInStartTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignInStartSubmitEvent = { type: 'SUBMIT' };

export type SignInStartRedirectOauthEvent = { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy };
export type SignInStartRedirectSamlEvent = { type: 'AUTHENTICATE.SAML'; strategy?: SamlStrategy };
export type SignInStartRedirectWeb3Event = { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy };

export type SignInStartRedirectEvent =
  | SignInStartRedirectOauthEvent
  | SignInStartRedirectSamlEvent
  | SignInStartRedirectWeb3Event;

export type SignInStartEvents = ErrorActorEvent | SignInStartSubmitEvent | SignInStartRedirectEvent;

// ---------------------------------- Input ---------------------------------- //

export interface SignInStartInput {
  basePath?: string;
  clerk: LoadedClerk;
  form: ActorRefFrom<typeof FormMachine>;
  router: ActorRefFrom<typeof SignInRouterMachine>;
}

// ---------------------------------- Context ---------------------------------- //

export interface SignInStartContext {
  basePath: string;
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  routerRef: ActorRefFrom<typeof SignInRouterMachine>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignInStartSchema {
  context: SignInStartContext;
  input: SignInStartInput;
  events: SignInStartEvents;
  tags: SignInStartTags;
}
