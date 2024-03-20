import type { OAuthProvider, SamlStrategy } from '@clerk/types';
import type * as React from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import { ActiveTagsMode, useActiveTags } from '~/react/hooks/use-active-tags.hook';
import { mapScopeToStrategy } from '~/react/utils/map-scope-to-strategy';

import { useLoading } from '../hooks/use-loading.hook';
import { SignInChooseStrategyCtx } from './choose-strategy';
import { SignInRouterCtx } from './context';
import { SignInStartCtx } from './start';
import type { SignInStep } from './step';
import { SignInFirstFactorCtx, SignInSecondFactorCtx } from './verifications';

type Strategy = OAuthProvider | SamlStrategy | 'metamask';
type LoadingScope = 'global' | `step:${SignInStep}` | `provider:${Strategy}`;

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
 * <SignIn>
 *   <Loading>
 *     {(isLoading) => isLoading && "Global loading..."}
 *   </Loading>
 * </SignIn>
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
  const routerRef = SignInRouterCtx.useActorRef(true);

  if (!routerRef) {
    throw new ClerkElementsRuntimeError(`<Loading> must be used within a <SignIn> component.`);
  }

  let computedScope: LoadingScope;

  // Figure out if the component is inside a `<Step>` component
  const startCtx = SignInStartCtx.useActorRef(true);
  const firstFactorCtx = SignInFirstFactorCtx.useActorRef(true);
  const secondFactorCtx = SignInSecondFactorCtx.useActorRef(true);
  const chooseStrategyCtx = SignInChooseStrategyCtx.useDomValidation(true);

  // A user can explicitly define the scope, otherwise we'll try to infer it from the surrounding context
  if (scope) {
    computedScope = scope;
  } else {
    let inferredScope: LoadingScope;

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

  // Access loading state of the router from its context
  const [isLoading, { step: loadingStep, strategy }] = useLoading(routerRef);

  const isChooseStrategyStep = useActiveTags(
    routerRef,
    ['route:first-factor', 'route:choose-strategy'],
    ActiveTagsMode.all,
  );
  // Determine loading states based on the step
  const isStartLoading = isLoading && loadingStep === 'start';
  const isVerificationsLoading = isLoading && loadingStep === 'verifications';
  const isChooseStrategyLoading = isLoading && isChooseStrategyStep;
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
  } else if (computedScope.startsWith('provider:')) {
    const computedStrategy = mapScopeToStrategy(computedScope);
    returnValue = isStrategyLoading && strategy === computedStrategy;
  } else {
    throw new ClerkElementsRuntimeError(`Invalid scope "${computedScope}" used for <Loading>`);
  }

  return children(returnValue);
}

Loading.displayName = 'SignInLoading';
