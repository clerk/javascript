import { useClerk } from '@clerk/shared/react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { EnterpriseSSOStrategy, OAuthProvider, SamlStrategy, Web3Provider } from '@clerk/shared/types';
import { useSelector } from '@xstate/react';
import * as React from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { ActorSignIn, ActorSignUp } from '~/react/hooks/use-loading.hook';
import { useLoading } from '~/react/hooks/use-loading.hook';
import { SignInRouterCtx } from '~/react/sign-in/context';
import type { TSignInStep } from '~/react/sign-in/step';
import { SIGN_IN_STEPS } from '~/react/sign-in/step';
import { SignUpRouterCtx } from '~/react/sign-up/context';
import type { TSignUpStep } from '~/react/sign-up/step';
import { SIGN_UP_STEPS } from '~/react/sign-up/step';
import { isProviderStrategyScope, mapScopeToStrategy } from '~/react/utils/map-scope-to-strategy';

type Strategy = OAuthProvider | SamlStrategy | EnterpriseSSOStrategy | Web3Provider;
type LoadingScope<T extends TSignInStep | TSignUpStep> =
  | 'global'
  | `step:${T}`
  | `provider:${Strategy}`
  | 'submit'
  | 'passkey'
  | undefined;

type LoadingProps = {
  scope?: LoadingScope<TSignInStep | TSignUpStep>;
  children: (isLoading: boolean) => React.ReactNode;
};

function isSignInScope(scope: LoadingScope<TSignInStep | TSignUpStep>): scope is LoadingScope<TSignInStep> {
  if (!scope) {
    return true;
  }

  if (scope.startsWith('step:')) {
    return Object.prototype.hasOwnProperty.call(SIGN_IN_STEPS, scope.replace('step:', ''));
  }

  return true;
}

function isSignUpScope(scope: LoadingScope<TSignInStep | TSignUpStep>): scope is LoadingScope<TSignUpStep> {
  if (!scope) {
    return true;
  }

  if (scope.startsWith('step:')) {
    return Object.prototype.hasOwnProperty.call(SIGN_UP_STEPS, scope.replace('step:', ''));
  }

  return true;
}

/**
 * Access the loading state of a chosen scope. Scope can refer to a step, a provider, or the global loading state. The global loading state is `true` when any of the other scopes are loading.
 *
 * @param scope - Optional. Specify which loading state to access. Can be a step, a provider, or the global loading state. If `<Loading>` is used outside a `<Step>`, the scope will default to "global". If used inside a `<Step>` the scope will default to the current step. For external authentication providers, the scope needs to be manually defined in the format of `provider:<provider name>`
 * @param {Function} children - A function that receives `isLoading` as an argument. `isLoading` is a boolean that indicates if the current scope is loading or not.
 *
 * @example
 * <SignIn.Root>
 *   <Clerk.Loading>
 *     {(isLoading) => isLoading && "Global loading..."}
 *   </Clerk.Loading>
 * </SignIn.Root>
 *
 * @example
 * <SignIn.Step name="start">
 *  <Clerk.Action submit>
 *    <Clerk.Loading>
 *      {(isLoading) => isLoading ? "Start is loading..." : "Submit"}
 *    </Clerk.Loading>
 *  </Clerk.Action>
 * </SignIn.Step>
 *
 * @example
 * <SignIn.Step name="start">
 *   <Clerk.Loading scope="provider:google">
 *     {(isLoading) => (
 *       <Clerk.Connection name="google" disabled={isLoading}>
 *         {isLoading ? "Loading..." : "Continue with Google"}
 *       </Clerk.Connection>
 *     )}
 *   </Clerk.Loading>
 * </SignIn.Step>
 */
export function Loading({ children, scope }: LoadingProps) {
  const clerk = useClerk();

  clerk.telemetry?.record(eventComponentMounted('Elements_Loading', { scope: scope ?? false }));

  const signInRouterRef = SignInRouterCtx.useActorRef(true);
  const signUpRouterRef = SignUpRouterCtx.useActorRef(true);

  // One of the two routers must be defined. Otherwise, the component is used outside of a <SignIn> or <SignUp> component.
  // An error is thrown in this case. Depending on which router is defined, the following flow will be either for sign-in or sign-up.
  if (!signInRouterRef && !signUpRouterRef) {
    throw new ClerkElementsRuntimeError(`<Loading> must be used within a <SignIn> or <SignUp> component.`);
  }

  if (signInRouterRef) {
    if (isSignInScope(scope)) {
      return (
        <SignInLoading
          scope={scope}
          routerRef={signInRouterRef}
        >
          {children}
        </SignInLoading>
      );
    } else {
      throw new ClerkElementsRuntimeError(`Invalid scope "${scope}" used for <Loading> inside <SignIn>.`);
    }
  }

  if (signUpRouterRef) {
    if (isSignUpScope(scope)) {
      return (
        <SignUpLoading
          scope={scope}
          routerRef={signUpRouterRef}
        >
          {children}
        </SignUpLoading>
      );
    } else {
      throw new ClerkElementsRuntimeError(`Invalid scope "${scope}" used for <Loading> inside <SignUp>.`);
    }
  }

  throw new ClerkElementsRuntimeError('Invalid state for <Loading>. Please open an issue.');
}

type SignInLoadingProps = {
  scope?: LoadingScope<TSignInStep>;
  children: (isLoading: boolean) => React.ReactNode;
  routerRef: ActorSignIn;
};

function SignInLoading({ children, scope, routerRef }: SignInLoadingProps) {
  const [isLoading, { step: loadingStep, strategy, action }] = useLoading(routerRef);
  const tags = useSelector(routerRef, s => s.tags);

  const isStepLoading = (step: TSignInStep) => isLoading && loadingStep === step;
  const isInferredStepLoading = (step: TSignInStep) => tags.has(`step:${step}`) && isStepLoading(step);

  let loadingResult = false;

  if (scope === 'global') {
    // Global Loading Scope
    loadingResult = isLoading;
  } else if (scope && isProviderStrategyScope(scope)) {
    // Provider-Specific Loading Scope
    loadingResult = isLoading && loadingStep === undefined && strategy === mapScopeToStrategy(scope);
  } else if (scope) {
    // Specified Loading Scope
    loadingResult = isStepLoading(scope.replace('step:', '') as TSignInStep) || scope === action;
  } else {
    // Inferred Loading Scope
    loadingResult =
      isInferredStepLoading('start') ||
      isInferredStepLoading('verifications') ||
      isInferredStepLoading('choose-strategy') ||
      isInferredStepLoading('forgot-password') ||
      isInferredStepLoading('reset-password');
  }

  return children(loadingResult);
}

type SignUpLoadingProps = {
  scope?: LoadingScope<TSignUpStep>;
  children: (isLoading: boolean) => React.ReactNode;
  routerRef: ActorSignUp;
};

function SignUpLoading({ children, scope, routerRef }: SignUpLoadingProps) {
  const [isLoading, { step: loadingStep, strategy, action }] = useLoading(routerRef);
  const tags = useSelector(routerRef, s => s.tags);

  const isStepLoading = (step: TSignUpStep) => isLoading && loadingStep === step;
  const isInferredStepLoading = (step: TSignUpStep) => tags.has(`step:${step}`) && isStepLoading(step);

  let loadingResult = false;

  if (scope === 'global') {
    // Global Loading Scope
    loadingResult = isLoading;
  } else if (scope && isProviderStrategyScope(scope)) {
    // Provider-Specific Loading Scope
    loadingResult = isLoading && loadingStep === undefined && strategy === mapScopeToStrategy(scope);
  } else if (scope) {
    loadingResult = isStepLoading(scope.replace('step:', '') as TSignUpStep) || scope === action;
  } else {
    // Inferred Loading Scope
    loadingResult =
      isInferredStepLoading('start') || isInferredStepLoading('continue') || isInferredStepLoading('verifications');
  }

  return children(loadingResult);
}
