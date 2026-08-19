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
    // Cleanup runs while `handleRedirectCallback` is still pending, so a superseded run's `.catch`
    // fires AFTER it. Clearing a stored id cannot help -- the stale timer does not exist yet. The
    // run has to know it was superseded and decline to schedule at all, or its bounce pulls the
    // user off the route the newer run just reached.
    let cancelled = false;

    if (__internal_setActiveInProgress !== true) {
      const intent = new URLSearchParams(window.location.search).get('intent');
      const reloadResource = intent === 'signIn' || intent === 'signUp' ? intent : undefined;
      handleRedirectCallback({ ...props, reloadResource }, navigate).catch(e => {
        if (cancelled) {
          return;
        }

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
