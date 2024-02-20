import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk, OAuthStrategy, SamlStrategy, Web3Strategy } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { SignUpRouterMachine } from '~/internals/machines/sign-up/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignUpStartTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignUpStartSubmitEvent = { type: 'SUBMIT' };

// TODO: Consolidate with SignInStartMachine
export type SignUpStartRedirectOauthEvent = { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy };
export type SignUpStartRedirectSamlEvent = { type: 'AUTHENTICATE.SAML'; strategy?: SamlStrategy };
export type SignUpStartRedirectWeb3Event = { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy };

export type SignUpStartRedirectEvent =
  | SignUpStartRedirectOauthEvent
  | SignUpStartRedirectSamlEvent
  | SignUpStartRedirectWeb3Event;

export type SignUpStartEvents = ErrorActorEvent | SignUpStartSubmitEvent | SignUpStartRedirectEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignUpStartInput = {
  basePath?: string;
  clerk: LoadedClerk;
  form: ActorRefFrom<typeof FormMachine>;
  router: ActorRefFrom<typeof SignUpRouterMachine>;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignUpStartContext {
  basePath: string;
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  routerRef: ActorRefFrom<typeof SignUpRouterMachine>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignUpStartSchema {
  context: SignUpStartContext;
  input: SignUpStartInput;
  events: SignUpStartEvents;
  tags: SignUpStartTags;
}
