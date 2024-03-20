import type { OAuthProvider, SamlStrategy } from '@clerk/types';
import type * as React from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import { mapScopeToStrategy } from '~/react/utils/map-scope-to-strategy';

import { useLoading } from '../hooks/use-loading.hook';
import { SignUpRouterCtx } from './context';
import { SignUpContinueCtx } from './continue';
import { SignUpStartCtx } from './start';
import type { SignUpStep } from './step';
import { SignUpVerificationCtx } from './verifications';

type Strategy = OAuthProvider | SamlStrategy | 'metamask';
type LoadingScope = 'global' | `step:${SignUpStep}` | `provider:${Strategy}`;

type LoadingProps = {
  scope?: LoadingScope;
  children: (isLoading: boolean) => React.ReactNode;
};

/**
 * Access the loading state of a chosen scope. Scope can refer to a step, a provider, or the global loading state. The global loading state is `true` when any of the other scopes are loading.
 *
 * @param scope - Optional. Specify which loading state to access. Can be a step, a provider, or the global loading state. If `<Loading>` is used outside a `<Step>` it will default to `"global"`. If used inside a `<Step>` it will default to the current step.
 * @param {Function} children - A render prop function that receives `isLoading` as an argument. `isLoading` is a boolean that indicates if the current scope is loading or not.
 *
 * @example
 * <SignUp>
 *   <Loading>
 *     {(isLoading) => isLoading && "Global loading..."}
 *   </Loading>
 * </SignUp>
 *
 * @example
 * <Step name="start">
 *  <Submit>
 *    <Loading>
 *      {(isLoading) => isLoading ? "Start is loading..." : "Submit"}
 *    </Loading>
 *  </Submit>
 * </Step>
 *
 * @example
 * <Step name="start">
 *   <Loading scope="provider:google">
 *     {(isLoading) => (
 *       <Provider name="google" disabled={isLoading}>
 *         {isLoading ? "Loading..." : "Continue with Google"}
 *       </Provider>
 *     )}
 *   </Loading>
 * </Step>
 */
export function Loading({ children, scope }: LoadingProps) {
  const routerRef = SignUpRouterCtx.useActorRef(true);

  if (!routerRef) {
    throw new ClerkElementsRuntimeError(`<Loading> must be used within a <SignUp> component.`);
  }

  let computedScope: LoadingScope;

  // Figure out if the component is inside a `<Step>` component
  const startCtx = SignUpStartCtx.useActorRef(true);
  const continueCtx = SignUpContinueCtx.useActorRef(true);
  const verificationsCtx = SignUpVerificationCtx.useActorRef(true);

  if (scope) {
    computedScope = scope;
  } else {
    let inferredScope: LoadingScope;

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

  // Access loading state of the router from its context
  const [isLoading, { step: loadingStep, strategy }] = useLoading(routerRef);

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
  } else if (computedScope.startsWith('provider:')) {
    const computedStrategy = mapScopeToStrategy(computedScope);
    returnValue = isStrategyLoading && strategy === computedStrategy;
  } else {
    throw new ClerkElementsRuntimeError(`Invalid scope "${computedScope}" used for <Loading>`);
  }

  return children(returnValue);
}

Loading.displayName = 'SignUpLoading';
