import type { SignInProps, SignUpProps } from '@clerk/types';
import React, { useContext } from 'react';

import { CoreOrganizationContext, CoreUserContext, useEnvironment } from '../contexts';
import { CoreSessionContext } from '../contexts/CoreSessionContext';
import { useNavigate } from '../hooks';

export function withRedirectToHome<P extends SignInProps | SignUpProps | { continueExisting?: boolean }>(
  Component: React.ComponentType<P>,
  when: 'singleSession' | 'noUser' | 'noOrganization',
): (props: P) => null | JSX.Element {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const { navigate } = useNavigate();
    const { authConfig, displayConfig } = useEnvironment();
    const { singleSessionMode } = authConfig;
    const userCtx = useContext(CoreUserContext);
    const organizationCtx = useContext(CoreOrganizationContext);
    const sessionCtx = useContext(CoreSessionContext);
    const session = sessionCtx?.value;
    const user = userCtx?.value;
    const organization = organizationCtx?.value;

    let shouldRedirect = false;
    switch (when) {
      case 'singleSession':
        if (singleSessionMode && !!session) {
          shouldRedirect = true;
        }
        break;
      case 'noUser':
        if (!user) {
          shouldRedirect = true;
        }
        break;
      case 'noOrganization':
        if (!organization?.organization) {
          shouldRedirect = true;
        }
        break;
    }

    React.useEffect(() => {
      if (shouldRedirect) {
        navigate(displayConfig.homeUrl);
      }
    }, []);

    if (shouldRedirect) {
      return null;
    }

    // @ts-ignore
    return <Component {...props} />;
  };

  HOC.displayName = `withRedirectToHome(${displayName})`;

  return HOC;
}
