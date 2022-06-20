import { HandleOAuthCallbackParams } from '@clerk/types/src';
import React from 'react';

import { useCoreClerk } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { Flow } from '../customizables';
import { LoadingCard } from '../elements';

export const SSOCallback = (props: HandleOAuthCallbackParams) => {
  const { handleRedirectCallback } = useCoreClerk();
  const { navigate } = useNavigate();

  React.useEffect(() => {
    void handleRedirectCallback({ ...props }, navigate);
  }, []);

  return (
    <Flow.Part part='ssoCallback'>
      <LoadingCard />
    </Flow.Part>
  );
};
