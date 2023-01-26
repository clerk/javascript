import type { SignInProps, SignUpProps } from '@clerk/types';
import React, { useContext } from 'react';

import { useEnvironment } from '../contexts';
import { CoreSessionContext } from '../contexts/CoreSessionContext';
import { useNavigate } from '../hooks';

export function withRedirectToHome<P extends SignInProps | SignUpProps | { continueExisting?: boolean }>(
  Component: React.ComponentType<P>,
  displayName?: string,
): (props: P) => null | JSX.Element {
  displayName = displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const { navigate } = useNavigate();
    const { authConfig, displayConfig } = useEnvironment();
    const { singleSessionMode } = authConfig;
    const ctx = useContext(CoreSessionContext);
    const session = ctx?.value;

    React.useEffect(() => {
      if (singleSessionMode && !!session) {
        navigate(displayConfig.homeUrl);
      }
    }, []);

    if (singleSessionMode && !!session) {
      return null;
    }

    // @ts-ignore
    return <Component {...props} />;
  };

  HOC.displayName = `withRedirectToHome(${displayName})`;

  return HOC;
}
