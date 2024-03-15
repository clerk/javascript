import type { OAuthProvider, SamlStrategy, SignInStrategy } from '@clerk/types';
import type * as React from 'react';

import { ClerkElementsRuntimeError } from '~/internals/errors';

import { useLoading } from '../hooks/use-loading.hook';
import { SignUpRouterCtx } from './context';
import type { SignUpStep } from './step';

type Strategy = OAuthProvider | SamlStrategy | 'metamask';
type LoadingScope = 'global' | `step:${SignUpStep}` | `provider:${Strategy}`;

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

export function Loading({ children, scope }: LoadingProps) {
  const routerRef = SignUpRouterCtx.useActorRef();
  const [isLoading, { step, strategy }] = useLoading(routerRef);

  const isStartLoading = isLoading && step === 'start';
  const isVerificationsLoading = isLoading && step === 'verifications';
  const isContinueLoading = isLoading && step === 'continue';
  const isStrategyLoading = isLoading && step === undefined && strategy !== undefined;

  let returnValue: boolean;

  if (scope === 'global') {
    returnValue = isLoading;
  } else if (scope === 'step:start') {
    returnValue = isStartLoading;
  } else if (scope === 'step:verifications') {
    returnValue = isVerificationsLoading;
  } else if (scope === 'step:continue') {
    returnValue = isContinueLoading;
  } else if (scope.startsWith('provider:')) {
    const computedStrategy = mapScopeToStrategy(scope);
    returnValue = isStrategyLoading && strategy === computedStrategy;
  } else {
    throw new ClerkElementsRuntimeError(`Invalid scope used for <Loading>`);
  }

  return children({ isLoading: returnValue });
}
