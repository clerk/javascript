import { isDevelopmentFromPublishableKey } from '@clerk/shared/keys';
import { useClerk } from '@clerk/shared/react';
import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/types';
import type { ComponentType } from 'react';
import React from 'react';

import { warnings } from '../../core/warnings';
import type { ComponentGuard } from '../../utils';
import { hasPendingTasksAndSingleSessionModeEnabled, isSignedInAndSingleSessionModeEnabled } from '../../utils';
import { useEnvironment, useOptions, useSignInContext, useSignUpContext } from '../contexts';
import { useRouter } from '../router';
import type { AvailableComponentProps } from '../types';

type RedirectUrl = (opts: { clerk: Clerk; environment: EnvironmentResource; options: ClerkOptions }) => string;

export function withRedirect<P extends AvailableComponentProps>(
  Component: ComponentType<P>,
  condition: ComponentGuard,
  redirectUrl: RedirectUrl,
  warning?: string,
): (props: P) => null | JSX.Element {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const { navigate } = useRouter();
    const clerk = useClerk();
    const environment = useEnvironment();
    const options = useOptions();

    const shouldRedirect = condition(clerk, environment, options);
    React.useEffect(() => {
      if (shouldRedirect) {
        if (warning && isDevelopmentFromPublishableKey(clerk.publishableKey)) {
          console.info(warning);
        }
        // TODO: Fix this properly
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        navigate(redirectUrl({ clerk, environment, options }));
      }
    }, []);

    if (shouldRedirect) {
      return null;
    }

    return <Component {...props} />;
  };

  HOC.displayName = `withRedirect(${displayName})`;

  return HOC;
}

export const withRedirectToTasksAfterSignIn = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const signInCtx = useSignInContext();
    return withRedirect(
      Component,
      hasPendingTasksAndSingleSessionModeEnabled,
      () => signInCtx.tasksUrl,
      warnings.cannotRenderSignInComponentWithPendingTasks,
    )(props);
  };

  HOC.displayName = `withRedirectToTasksAfterSignIn(${displayName})`;

  return HOC;
};

export const withRedirectToAfterSignIn = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const signInCtx = useSignInContext();
    return withRedirect(
      Component,
      isSignedInAndSingleSessionModeEnabled,
      ({ clerk }) => signInCtx.afterSignInUrl || clerk.buildAfterSignInUrl(),
      warnings.cannotRenderSignInComponentWhenSessionExists,
    )(props);
  };

  HOC.displayName = `withRedirectToAfterSignIn(${displayName})`;

  return HOC;
};

export const withRedirectToAfterSignUp = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const signUpCtx = useSignUpContext();
    return withRedirect(
      Component,
      isSignedInAndSingleSessionModeEnabled,
      ({ clerk }) => signUpCtx.afterSignInUrl || clerk.buildAfterSignInUrl(),
      warnings.cannotRenderSignUpComponentWhenSessionExists,
    )(props);
  };

  HOC.displayName = `withRedirectToAfterSignUp(${displayName})`;

  return HOC;
};

export const withRedirectToTasksAfterSignUp = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const signInCtx = useSignUpContext();
    return withRedirect(
      Component,
      hasPendingTasksAndSingleSessionModeEnabled,
      () => signInCtx.tasksUrl,
      warnings.cannotRenderSignUpComponentWithPendingTasks,
    )(props);
  };

  HOC.displayName = `withRedirectToTasksAfterSignIn(${displayName})`;

  return HOC;
};

export const withRedirectToHomeSingleSessionGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) =>
  withRedirect(
    Component,
    isSignedInAndSingleSessionModeEnabled,
    ({ environment }) => environment.displayConfig.homeUrl,
    warnings.cannotRenderComponentWhenSessionExists,
  );
