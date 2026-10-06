import { useClerk } from '@clerk/shared/react';
import type { HandleOAuthCallbackParams, HandleSamlCallbackParams } from '@clerk/shared/types';
import React from 'react';

import { Flow } from '../customizables';
import { CaptchaElement } from '../elements/CaptchaElement';
import { Card } from '../elements/Card';
import { useCardState, withCardStateProvider } from '../elements/contexts';
import { LoadingCardContainer } from '../elements/LoadingCard';
import { useRouter } from '../router';
import { handleError } from '../utils/errorHandler';

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

  const bounceTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;

    if (__internal_setActiveInProgress !== true) {
      const intent = new URLSearchParams(window.location.search).get('intent');
      const reloadResource = intent === 'signIn' || intent === 'signUp' ? intent : undefined;
      handleRedirectCallback({ ...props, reloadResource }, navigate).catch(e => {
        if (cancelled) {
          return;
        }

        bounceTimeoutRef.current = setTimeout(() => void navigate('../'), 4000);
        try {
          handleError(e, [], card.setError);
        } catch {
          card.setError('Unable to complete action at this time. If the problem persists please contact support.');
        }
      });
    }

    return () => {
      cancelled = true;
      clearTimeout(bounceTimeoutRef.current);
    };
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
