import type { OAuthProvider, SamlStrategy, SignInStrategy } from '@clerk/types';
import type * as React from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import { ActiveTagsMode, useActiveTags } from '~/react/hooks/use-active-tags.hook';

import { useLoading } from '../hooks/use-loading.hook';
import { SignInRouterCtx } from './context';
import type { SignInStep } from './step';

type Strategy = OAuthProvider | SamlStrategy | 'metamask';
type LoadingScope = 'global' | `step:${SignInStep}` | `provider:${Strategy}`;

type LoadingProps = {
  scope: LoadingScope;
  children: (isLoading: { isLoading: boolean }) => React.ReactNode;
};

function mapScopeToStrategy(scope: Extract<LoadingScope, `provider:${string}`>): SignInStrategy {
  if (scope === 'provider:metamask') {
    return 'web3_metamask_signature';
  }

  if (scope === 'provider:saml') {
    return 'saml';
  }

  const scopeWithoutPrefix = scope.replace('provider:', '') as OAuthProvider;

  return `oauth_${scopeWithoutPrefix}`;
}

/**
 * Access the loading state of a chosen scope. Scope can refer to a step, a provider, or the global loading state. The global loading state is `true` when any of the other scopes are loading.
 *
 * @param scope - Specify which loading state to access. Can be a step, a provider, or the global loading state.
 * @param {Function} children - A render prop function that receives `isLoading` as an argument. `isLoading` is a boolean that indicates if the current scope is loading or not.
 *
 * @example
 * <Loading scope="global">
 *  {({ isLoading }) => isLoading && <Spinner />}
 * </Loading>
 *
 * @example
 * <Step name="start">
 *  <Submit>
 *    <Loading scope="step:start">
 *      {({ isLoading }) => isLoading ? "Loading..." : "Submit"}
 *    </Loading>
 *  </Submit>
 * </Step>
 */
export function Loading({ children, scope }: LoadingProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const [isLoading, { step, strategy }] = useLoading(routerRef);
  const isChooseStrategyStep = useActiveTags(
    routerRef,
    ['route:first-factor', 'route:choose-strategy'],
    ActiveTagsMode.all,
  );

  const isStartLoading = isLoading && step === 'start';
  const isVerificationsLoading = isLoading && step === 'verifications';
  const isChooseStrategyLoading = isLoading && isChooseStrategyStep;
  const isStrategyLoading = isLoading && step === undefined && strategy !== undefined;

  let returnValue: boolean;

  if (scope === 'global') {
    returnValue = isLoading;
  } else if (scope === 'step:start') {
    returnValue = isStartLoading;
  } else if (scope === 'step:verifications') {
    returnValue = isVerificationsLoading;
  } else if (scope === 'step:choose-strategy') {
    returnValue = isChooseStrategyLoading;
  } else if (scope.startsWith('provider:')) {
    const computedStrategy = mapScopeToStrategy(scope);
    returnValue = isStrategyLoading && strategy === computedStrategy;
  } else {
    throw new ClerkElementsRuntimeError(`Invalid scope used for <Loading>`);
  }

  return children({ isLoading: returnValue });
}
