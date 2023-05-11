import type { ComponentType } from 'react';
import React from 'react';

import { warnings } from '../../core/warnings';
import type { AvailableComponentProps } from '../../ui/types';
import type { ComponentGuard } from '../../utils';
import { noOrganizationExists, noUserExists, sessionExistsAndSingleSessionModeEnabled } from '../../utils';
import { useCoreClerk, useEnvironment, useOptions } from '../contexts';
import { useRouter } from '../router';

function withRedirectToHome<P extends AvailableComponentProps>(
  Component: ComponentType<P>,
  condition: ComponentGuard,
  warning?: string,
): (props: P) => null | JSX.Element {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const { navigate } = useRouter();
    const clerk = useCoreClerk();
    const environment = useEnvironment();
    const options = useOptions();

    const shouldRedirect = condition(clerk, environment, options);
    React.useEffect(() => {
      if (shouldRedirect) {
        if (warning && environment.displayConfig.instanceEnvironmentType === 'development') {
          console.info(warning);
        }
        navigate(environment.displayConfig.homeUrl);
      }
    }, []);

    if (shouldRedirect) {
      return null;
    }

    return <Component {...props} />;
  };

  HOC.displayName = `withRedirectToHome(${displayName})`;

  return HOC;
}

export const withRedirectToHomeSingleSessionGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) =>
  withRedirectToHome(
    Component,
    sessionExistsAndSingleSessionModeEnabled,
    warnings.cannotRenderComponentWhenSessionExists,
  );

export const withRedirectToHomeUserGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) =>
  withRedirectToHome(Component, noUserExists, warnings.cannotRenderComponentWhenUserDoesNotExist);

export const withRedirectToHomeOrganizationGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) =>
  withRedirectToHome(Component, noOrganizationExists, warnings.cannotRenderComponentWhenOrgDoesNotExist);
