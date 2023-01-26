import type { ComponentType } from 'react';
import React from 'react';

import type { AvailableComponentProps } from '../../ui/types';
import type { ComponentGuard } from '../../utils';
import { noOrganizationExists, noUserExists, sessionExistsAndSingleSessionModeEnabled } from '../../utils';
import { useCoreClerk, useEnvironment, useOptions } from '../contexts';
import { useNavigate } from '../hooks';

function withRedirectToHome<P extends AvailableComponentProps>(
  Component: ComponentType<P>,
  condition: ComponentGuard,
  warning?: string,
): (props: P) => null | JSX.Element {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const { navigate } = useNavigate();
    const clerk = useCoreClerk();
    const environment = useEnvironment();
    const options = useOptions();

    const shouldRedirect = condition(clerk, environment, options);
    React.useEffect(() => {
      if (shouldRedirect) {
        if (warning && environment.displayConfig.instanceEnvironmentType === 'development') {
          console.warn(warning);
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
    'Cannot render the component as a session already exists and single session mode is enabled. Redirecting to the home url.',
  );

export const withRedirectToHomeUserGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) =>
  withRedirectToHome(
    Component,
    noUserExists,
    'Cannot render the component as no user exists. Redirecting to the home url.',
  );

export const withRedirectToHomeOrganizationGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) =>
  withRedirectToHome(
    Component,
    noOrganizationExists,
    'Cannot render the component as there is no active organization. Redirecting to the home url.',
  );
