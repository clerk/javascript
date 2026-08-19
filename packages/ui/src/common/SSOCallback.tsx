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

  // Held in a ref, not a local: the cleanup below runs long before the async `.catch` assigns it,
  // so a superseded run's bounce would otherwise never be cleared and could yank the user back.
  const bounceTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    if (__internal_setActiveInProgress !== true) {
      const intent = new URLSearchParams(window.location.search).get('intent');
      const reloadResource = intent === 'signIn' || intent === 'signUp' ? intent : undefined;
      handleRedirectCallback({ ...props, reloadResource }, navigate).catch(e => {
        // Schedule the bounce FIRST, and never let the error reporting escape this handler.
        //
        // `handleError` re-throws anything it does not recognise, and the callback's own
        // "did not complete" guards throw a plain `Error` — which it does not. A throw from
        // inside this `.catch` skipped BOTH statements below, so the user got no message and
        // no recovery: the card sat on its spinner indefinitely while the failure surfaced
        // only as an unhandled rejection in the console. Every callback dead-end was
        // invisible for that reason, which is a bad property for a route whose whole job is
        // to be the last step of somebody's sign-in.
        bounceTimeoutRef.current = setTimeout(() => void navigate('../'), 4000);
        try {
          handleError(e, [], card.setError);
        } catch {
          card.setError('Unable to complete action at this time. If the problem persists please contact support.');
        }
      });
    }

    return () => clearTimeout(bounceTimeoutRef.current);
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
