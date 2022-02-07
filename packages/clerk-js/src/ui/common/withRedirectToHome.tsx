import { SignInProps, SignUpProps } from '@clerk/types';
import React from 'react';
import { useCoreSession, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

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

    return <Component {...(props )} />;
  };

  HOC.displayName = `withRedirectToHome(${displayName})`;

  return HOC;
}
