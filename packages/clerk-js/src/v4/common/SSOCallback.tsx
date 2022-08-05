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
    handleRedirectCallback({ ...props }, navigate).catch(() => {
      // This error is caused when the host app is using React18
      // and strictMode is enabled. This useEffects runs twice because
      // the clerk-react ui components mounts, unmounts and mounts again
      // so the clerk-js component loses its state because of the custom
      // unmount callback we're using.
      // This needs to be solved by tweaking the logic in uiComponents.tsx
      // or by making handleRedirectCallback idempotent
    });
  }, []);

  return (
    <Flow.Part part='ssoCallback'>
      <LoadingCard />
    </Flow.Part>
  );
};
