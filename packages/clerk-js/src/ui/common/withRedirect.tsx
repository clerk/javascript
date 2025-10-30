import { isDevelopmentFromPublishableKey } from '@clerk/shared/keys';
import { useClerk } from '@clerk/shared/react';
import type { Clerk, ClerkOptions, EnvironmentResource } from '@clerk/shared/types';
import type { ComponentType } from 'react';
import React from 'react';

import { warnings } from '../../core/warnings';
import type { ComponentGuard } from '../../utils';
import { isSignedInAndSingleSessionModeEnabled } from '../../utils';
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
      ({ clerk }) => signUpCtx.afterSignUpUrl || clerk.buildAfterSignUpUrl(),
      warnings.cannotRenderSignUpComponentWhenSessionExists,
    )(props);
  };

  HOC.displayName = `withRedirectToAfterSignUp(${displayName})`;

  return HOC;
};

export const withRedirectToSignInTask = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const signInCtx = useSignInContext();

    return withRedirect(
      Component,
      (clerk, environment) =>
        !!environment?.authConfig.singleSessionMode && !!(clerk.session?.currentTask && signInCtx?.taskUrl),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      () => signInCtx.taskUrl!,
      undefined,
    )(props);
  };

  HOC.displayName = `withRedirectToSignInTask(${displayName})`;

  return HOC;
};

export const withRedirectToSignUpTask = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const signUpCtx = useSignUpContext();

    return withRedirect(
      Component,
      (clerk, environment) =>
        !!environment?.authConfig.singleSessionMode && !!(clerk.session?.currentTask && signUpCtx?.taskUrl),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      () => signUpCtx.taskUrl!,
      undefined,
    )(props);
  };

  HOC.displayName = `withRedirectToSignUpTask(${displayName})`;

  return HOC;
};
