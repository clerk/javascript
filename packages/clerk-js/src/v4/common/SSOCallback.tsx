import { HandleOAuthCallbackParams } from '@clerk/types/src';
import React from 'react';

import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useCoreClerk } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { LoadingCard, withFlowCardContext } from '../elements';

export const SSOCallback = (props: HandleOAuthCallbackParams) => {
  const { handleRedirectCallback } = useCoreClerk();
  const { navigate } = useNavigate();

  React.useEffect(() => {
    void handleRedirectCallback({ ...props }, navigate);
  }, []);

  return <LoadingCard />;
};
