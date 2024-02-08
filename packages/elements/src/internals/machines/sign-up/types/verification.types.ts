import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk, SignUpResource } from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent } from 'xstate';

import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { SignUpRouterMachine } from '~/internals/machines/sign-up/machines';

// ---------------------------------- Tags ---------------------------------- //

export type SignUpVerificationStateTags = 'state:preparing' | 'state:pending' | 'state:attempting' | 'state:loading';

export type SignUpVerificationVerificationCategoryTags = 'verification:category:code' | 'verification:category:link';
export type SignUpVerificationVerificationMethodTags = 'verification:method:email' | 'verification:method:phone';
export type SignUpVerificationVerificationTypeTags =
  | 'verification:email_link'
  | 'verification:email_code'
  | 'verification:phone_code';

export type SignUpVerificationVerificationTags =
  | SignUpVerificationVerificationCategoryTags
  | SignUpVerificationVerificationMethodTags
  | SignUpVerificationVerificationTypeTags;

export type SignUpVerificationTags = SignUpVerificationStateTags | SignUpVerificationVerificationTags;
export type SignUpVerificationFriendlyTags = 'code' | 'email_link' | 'email_code' | 'phone_code';

// ---------------------------------- Events ---------------------------------- //

export type SignUpVerificationSubmitEvent = { type: 'SUBMIT' };
export type SignUpVerificationNextEvent = { type: 'NEXT'; resource?: SignUpResource };

export type SignUpVerificationEmailLinkVerifiedEvent = { type: 'EMAIL_LINK.VERIFIED'; resource: SignUpResource };
export type SignUpVerificationEmailLinkUnverifiedEvent = { type: 'EMAIL_LINK.UNVERIFIED'; resource: SignUpResource };
export type SignUpVerificationEmailLinkExpiredEvent = { type: 'EMAIL_LINK.EXPIRED'; resource: SignUpResource };
export type SignUpVerificationEmailLinkTransferrableEvent = {
  type: 'EMAIL_LINK.TRANSFERRABLE';
  resource: SignUpResource;
};
export type SignUpVerificationEmailLinkRestartEvent = { type: 'EMAIL_LINK.RESTART' };
export type SignUpVerificationEmailLinkFailureEvent = { type: 'EMAIL_LINK.FAILURE'; error: Error };

export type SignUpVerificationEmailLinkEvent =
  | SignUpVerificationEmailLinkVerifiedEvent
  | SignUpVerificationEmailLinkUnverifiedEvent
  | SignUpVerificationEmailLinkExpiredEvent
  | SignUpVerificationEmailLinkRestartEvent
  | SignUpVerificationEmailLinkFailureEvent;

export type SignUpVerificationEvents =
  | ErrorActorEvent
  | SignUpVerificationSubmitEvent
  | SignUpVerificationNextEvent
  | SignUpVerificationEmailLinkEvent;

// ---------------------------------- Input ---------------------------------- //

export type SignUpVerificationInput = {
  basePath?: string;
  clerk: LoadedClerk;
  form: ActorRefFrom<typeof FormMachine>;
  router: ActorRefFrom<typeof SignUpRouterMachine>;
};

// ---------------------------------- Context ---------------------------------- //

export interface SignUpVerificationContext {
  basePath: string;
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  routerRef: ActorRefFrom<typeof SignUpRouterMachine>;
}

// ---------------------------------- Schema ---------------------------------- //

export interface SignUpVerificationSchema {
  context: SignUpVerificationContext;
  input: SignUpVerificationInput;
  events: SignUpVerificationEvents;
  tags: SignUpVerificationTags;
}
