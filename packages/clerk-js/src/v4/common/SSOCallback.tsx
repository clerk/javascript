import { HandleOAuthCallbackParams } from '@clerk/types/src';
import React from 'react';

import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useCoreClerk } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { LoadingCard, withFlowCardContext } from '../elements';

const _SSOCallback = (props: HandleOAuthCallbackParams) => {
  const { handleRedirectCallback } = useCoreClerk();
  const { navigate } = useNavigate();

  React.useEffect(() => {
    void handleRedirectCallback({ ...props }, navigate);
  }, []);

  return <LoadingCard />;
};

export const SignInSSOCallback = withRedirectToHome(
  withFlowCardContext(_SSOCallback, { flow: 'signIn', page: 'ssoCallback' }),
);

export const SignUpSSOCallback = withRedirectToHome(
  withFlowCardContext(_SSOCallback, { flow: 'signUp', page: 'ssoCallback' }),
);
