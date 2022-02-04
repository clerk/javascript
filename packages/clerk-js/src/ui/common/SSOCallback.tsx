import { HandleOAuthCallbackParams } from '@clerk/types';
import React from 'react';
import { LoadingScreen } from 'ui/common';
import { withRedirectToHome } from 'ui/common/withRedirectToHome';
import { useCoreClerk } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

function _SSOCallback(props: HandleOAuthCallbackParams): JSX.Element {
  const { handleRedirectCallback } = useCoreClerk();
  const { navigate } = useNavigate();

  React.useEffect(() => {
    handleRedirectCallback({ ...props }, navigate);
  }, []);

  return <LoadingScreen showHeader={false} />;
}

export const SSOCallback = withRedirectToHome(_SSOCallback);
