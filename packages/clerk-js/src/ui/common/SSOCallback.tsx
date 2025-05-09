import { useClerk } from '@clerk/shared/react';
import type { HandleOAuthCallbackParams, HandleSamlCallbackParams } from '@clerk/types';
import React from 'react';

import { Flow } from '../customizables';
import { Card, LoadingCardContainer, useCardState, withCardStateProvider } from '../elements';
import { CaptchaElement } from '../elements/CaptchaElement';
import { useRouter } from '../router';
import { handleError } from '../utils';

export const SSOCallback = withCardStateProvider<HandleOAuthCallbackParams | HandleSamlCallbackParams>(props => {
  return (
    <Flow.Part part='ssoCallback'>
      <SSOCallbackCard {...props} />
    </Flow.Part>
  );
});

export const SSOCallbackCard = (props: HandleOAuthCallbackParams | HandleSamlCallbackParams) => {
  const { handleRedirectCallback, __internal_setActiveInProgress } = useClerk();
  const { navigate } = useRouter();
  const card = useCardState();

  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (__internal_setActiveInProgress !== true) {
      const intent = new URLSearchParams(window.location.search).get('intent');
      const reloadResource = intent === 'signIn' || intent === 'signUp' ? intent : undefined;
      handleRedirectCallback({ ...props, reloadResource }, navigate).catch(e => {
        handleError(e, [], card.setError);
        timeoutId = setTimeout(() => void navigate('../'), 4000);
      });
    }

    return () => clearTimeout(timeoutId);
  }, [handleError, handleRedirectCallback]);

  return (
    <Flow.Part part='ssoCallback'>
      <Card.Root>
        <Card.Content>
          <Card.Alert>{card.error}</Card.Alert>
          <LoadingCardContainer />
          <CaptchaElement />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
