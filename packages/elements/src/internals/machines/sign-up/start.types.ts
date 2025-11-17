import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { EnterpriseSSOStrategy, OAuthStrategy, SamlStrategy, Web3Strategy } from '@clerk/shared/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form';

import type { SetFormEvent } from '../shared';
import type { SignInRouterMachineActorRef } from './router.types';

// ---------------------------------- Tags ---------------------------------- //

export type SignUpStartTags = 'state:pending' | 'state:attempting' | 'state:loading';

// ---------------------------------- Events ---------------------------------- //

export type SignUpStartSubmitEvent = { type: 'SUBMIT'; action: 'submit' };

// TODO: Consolidate with SignInStartMachine
export type SignUpStartRedirectOauthEvent = { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy };
export type SignUpStartRedirectSamlEvent = { type: 'AUTHENTICATE.SAML'; strategy?: SamlStrategy };
export type SignUpStartRedirectEnterpriseSSOEvent = {
  type: 'AUTHENTICATE.ENTERPRISE_SSO';
  strategy?: EnterpriseSSOStrategy;
};
export type SignUpStartRedirectWeb3Event = { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy };

export type SignUpStartRedirectEvent =
  | SignUpStartRedirectOauthEvent
  | SignUpStartRedirectSamlEvent
  | SignUpStartRedirectWeb3Event
  | SignUpStartRedirectEnterpriseSSOEvent;

export type SignUpStartEvents = ErrorActorEvent | SignUpStartSubmitEvent | SignUpStartRedirectEvent | SetFormEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignUpStartInput = {
  basePath?: string;
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
  ticket?: string | undefined;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignUpStartContext {
  basePath: string;
  error?: Error | ClerkAPIResponseError;
  loadingStep: 'start';
  formRef: ActorRefFrom<typeof FormMachine>;
  parent: SignInRouterMachineActorRef;
  ticket?: string | undefined;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignUpStartSchema {
  context: SignUpStartContext;
  input: SignUpStartInput;
  events: SignUpStartEvents;
  tags: SignUpStartTags;
}
