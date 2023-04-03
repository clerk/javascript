import type { HandleOAuthCallbackParams, HandleSAMLCallbackParams } from '@clerk/types/src';
import React from 'react';

import { useCoreClerk } from '../contexts';
import { Flow } from '../customizables';
import { LoadingCard } from '../elements';
import { useNavigate } from '../hooks';

export const SSOCallback = (props: HandleOAuthCallbackParams | HandleSAMLCallbackParams) => {
  const { handleRedirectCallback, handleSAMLCallback } = useCoreClerk();
  const { navigate } = useNavigate();

  React.useEffect(() => {
    // TODO - distinguish OAuth from SAML case
    const handler = false ? handleRedirectCallback : handleSAMLCallback;

    handler({ ...props }, navigate).catch(() => {
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
