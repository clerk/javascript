import { SignInProps, SignUpProps } from '@clerk/types';
import React from 'react';

import { useCoreSession, useEnvironment } from '../contexts';
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
    const session = useCoreSession({ avoidUndefinedCheck: true });

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
