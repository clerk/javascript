import React from 'react';
import { useNavigate } from 'ui/hooks';
import { useCoreSession, useEnvironment } from 'ui/contexts';
import { SignInProps, SignUpProps } from '@clerk/types';

export function withRedirectToHome<P extends SignInProps | SignUpProps>(
  Component: React.ComponentType<P>,
  displayName?: string,
): (props: P) => null | JSX.Element {
  displayName =
    displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const { navigate } = useNavigate();
    const { authConfig, displayConfig } = useEnvironment();
    const session = useCoreSession({ avoidUndefinedCheck: true });

    React.useEffect(() => {
      if (authConfig.singleSessionMode && !!session) {
        navigate(displayConfig.homeUrl);
      }
    }, []);

    if (authConfig.singleSessionMode && !!session) {
      return null;
    }

    return <Component {...(props as P)} />;
  };

  HOC.displayName = `withRedirectToHome(${displayName})`;

  return HOC;
}
