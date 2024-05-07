import { useClerk } from '@clerk/clerk-react';
import { eventComponentMounted } from '@clerk/shared/telemetry';
import type { OAuthProvider, SamlStrategy } from '@clerk/types';
import * as React from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { ActorSignIn, ActorSignUp } from '~/react/hooks/use-loading.hook';
import { useLoading } from '~/react/hooks/use-loading.hook';
import { SignInChooseStrategyCtx } from '~/react/sign-in/choose-strategy';
import { SignInRouterCtx } from '~/react/sign-in/context';
import { SignInStartCtx } from '~/react/sign-in/start';
import type { TSignInStep } from '~/react/sign-in/step';
import { SIGN_IN_STEPS } from '~/react/sign-in/step';
import { SignInFirstFactorCtx, SignInSecondFactorCtx } from '~/react/sign-in/verifications';
import { SignUpRouterCtx } from '~/react/sign-up/context';
import { SignUpContinueCtx } from '~/react/sign-up/continue';
import { SignUpStartCtx } from '~/react/sign-up/start';
import type { TSignUpStep } from '~/react/sign-up/step';
import { SIGN_UP_STEPS } from '~/react/sign-up/step';
import { SignUpVerificationCtx } from '~/react/sign-up/verifications';
import { mapScopeToStrategy } from '~/react/utils/map-scope-to-strategy';

type Strategy = OAuthProvider | SamlStrategy | 'metamask';
type LoadingScope<T extends TSignInStep | TSignUpStep> = 'global' | `step:${T}` | `provider:${Strategy}` | undefined;

type LoadingProps = {
  scope?: LoadingScope<TSignInStep | TSignUpStep>;
  children: (isLoading: boolean) => React.ReactNode;
};

function isSignInScope(scope: LoadingScope<TSignInStep | TSignUpStep>): scope is LoadingScope<TSignInStep> {
  if (!scope) return true;

  if (scope.startsWith('step:')) {
    return Object.prototype.hasOwnProperty.call(SIGN_IN_STEPS, scope.replace('step:', ''));
  }

  return true;
}

function isSignUpScope(scope: LoadingScope<TSignInStep | TSignUpStep>): scope is LoadingScope<TSignUpStep> {
  if (!scope) return true;

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
  const [isLoading, { step: loadingStep, strategy }] = useLoading(routerRef);

  let computedScope: LoadingScope<TSignInStep>;

  // Figure out if the component is inside a `<Step>` component
  const startCtx = SignInStartCtx.useActorRef(true);
  const firstFactorCtx = SignInFirstFactorCtx.useActorRef(true);
  const secondFactorCtx = SignInSecondFactorCtx.useActorRef(true);
  const chooseStrategyCtx = SignInChooseStrategyCtx.useDomValidation(true);

  // A user can explicitly define the scope, otherwise we'll try to infer it from the surrounding context
  if (scope) {
    computedScope = scope;
  } else {
    let inferredScope: LoadingScope<TSignInStep>;

    if (startCtx) {
      inferredScope = 'step:start';
    } else if (firstFactorCtx || secondFactorCtx) {
      inferredScope = 'step:verifications';
    } else if (chooseStrategyCtx) {
      inferredScope = 'step:choose-strategy';
    } else {
      inferredScope = 'global';
    }

    computedScope = inferredScope;
  }

  const snapshot = routerRef.getSnapshot();
  const isFirstFactor = snapshot.hasTag('route:first-factor');

  // Determine loading states based on the step
  const isStartLoading = isLoading && loadingStep === 'start';
  const isVerificationsLoading = isLoading && loadingStep === 'verifications';
  const isChooseStrategyLoading = isLoading && isFirstFactor && snapshot.hasTag('route:choose-strategy');
  const isForgotPasswordLoading = isFirstFactor && snapshot.hasTag('route:forgot-password');
  const isResetPasswordLoading = isFirstFactor && snapshot.hasTag('route:reset-password');
  const isStrategyLoading = isLoading && loadingStep === undefined && strategy !== undefined;

  let returnValue: boolean;

  if (computedScope === 'global') {
    returnValue = isLoading;
  } else if (computedScope === 'step:start') {
    returnValue = isStartLoading;
  } else if (computedScope === 'step:verifications') {
    returnValue = isVerificationsLoading;
  } else if (computedScope === 'step:choose-strategy') {
    returnValue = isChooseStrategyLoading;
  } else if (computedScope === 'step:forgot-password') {
    returnValue = isForgotPasswordLoading;
  } else if (computedScope === 'step:reset-password') {
    returnValue = isResetPasswordLoading;
  } else if (computedScope === 'step:complete') {
    returnValue = false;
  } else if (computedScope.startsWith('provider:')) {
    const computedStrategy = mapScopeToStrategy(computedScope);
    returnValue = isStrategyLoading && strategy === computedStrategy;
  } else {
    throw new ClerkElementsRuntimeError(`Invalid scope "${computedScope}" used for <Loading>`);
  }

  return children(returnValue);
}

type SignUpLoadingProps = {
  scope?: LoadingScope<TSignUpStep>;
  children: (isLoading: boolean) => React.ReactNode;
  routerRef: ActorSignUp;
};

function SignUpLoading({ children, scope, routerRef }: SignUpLoadingProps) {
  const [isLoading, { step: loadingStep, strategy }] = useLoading(routerRef);

  let computedScope: LoadingScope<TSignUpStep>;

  // Figure out if the component is inside a `<Step>` component
  const startCtx = SignUpStartCtx.useActorRef(true);
  const continueCtx = SignUpContinueCtx.useActorRef(true);
  const verificationsCtx = SignUpVerificationCtx.useActorRef(true);

  if (scope) {
    computedScope = scope;
  } else {
    let inferredScope: LoadingScope<TSignUpStep>;

    if (startCtx) {
      inferredScope = `step:start`;
    } else if (continueCtx) {
      inferredScope = `step:continue`;
    } else if (verificationsCtx) {
      inferredScope = `step:verifications`;
    } else {
      inferredScope = `global`;
    }

    computedScope = inferredScope;
  }

  // Determine loading states based on the step
  const isStartLoading = isLoading && loadingStep === 'start';
  const isVerificationsLoading = isLoading && loadingStep === 'verifications';
  const isContinueLoading = isLoading && loadingStep === 'continue';
  const isStrategyLoading = isLoading && loadingStep === undefined && strategy !== undefined;

  let returnValue: boolean;

  if (computedScope === 'global') {
    returnValue = isLoading;
  } else if (computedScope === 'step:start') {
    returnValue = isStartLoading;
  } else if (computedScope === 'step:verifications') {
    returnValue = isVerificationsLoading;
  } else if (computedScope === 'step:continue') {
    returnValue = isContinueLoading;
  } else if (computedScope === 'step:complete') {
    returnValue = false; // Not necessary for complete step
  } else if (computedScope.startsWith('provider:')) {
    const computedStrategy = mapScopeToStrategy(computedScope);
    returnValue = isStrategyLoading && strategy === computedStrategy;
  } else {
    throw new ClerkElementsRuntimeError(`Invalid scope "${computedScope}" used for <Loading>`);
  }

  return children(returnValue);
}
