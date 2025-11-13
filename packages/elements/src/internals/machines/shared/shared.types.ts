import type {
  AuthenticateWithRedirectParams,
  LoadedClerk,
  OAuthStrategy,
  SamlStrategy,
  SignInStrategy,
} from '@clerk/shared/types';
import type { SetRequired, Simplify } from 'type-fest';
import type { ActorRefFrom } from 'xstate';

import type { FormMachine } from '../form';

export type WithClerk<T = Record<string, unknown>> = { clerk: LoadedClerk } & T;
export type WithClient<T = Record<string, unknown>> = { client: LoadedClerk['client'] } & T;
export type WithParams<T> = { params: T };

// ================= Unsafe Metadata ================= //

export type WithUnsafeMetadata<T> = T & {
  unsafeMetadata?: SignUpUnsafeMetadata | undefined;
};

// ================= Authenticate With Redirect ================= //

type SamlOnlyKeys = 'identifier' | 'emailAddress';

export type AuthenticateWithRedirectOAuthParams = Simplify<
  Omit<AuthenticateWithRedirectParams, SamlOnlyKeys> & { strategy: OAuthStrategy }
>;
export type AuthenticateWithRedirectSamlParams = Simplify<
  SetRequired<AuthenticateWithRedirectParams, SamlOnlyKeys> & {
    strategy: SamlStrategy;
  }
>;

// ================= Strategies ================= //

export type SignInStrategyName = SignInStrategy | 'oauth' | 'web3';

export type SetFormEvent = { type: 'SET_FORM'; formRef: ActorRefFrom<typeof FormMachine> };
