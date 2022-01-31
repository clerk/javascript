import React from 'react';
import { useCoreClerk } from 'ui/contexts';
import { LoadingScreen } from 'ui/common';
import { useNavigate } from 'ui/hooks';
import { HandleOAuthCallbackParams } from '@clerk/types';
import { withRedirectToHome } from 'ui/common/withRedirectToHome';

function _SSOCallback(props: HandleOAuthCallbackParams): JSX.Element {
  const { handleRedirectCallback } = useCoreClerk();
  const { navigate } = useNavigate();

  React.useEffect(() => {
    handleRedirectCallback({ ...props }, navigate);
  }, []);

  return <LoadingScreen showHeader={false} />;
}

export const SSOCallback = withRedirectToHome(_SSOCallback);
