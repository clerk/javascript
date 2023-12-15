import { useClerk } from '@clerk/shared/react';
import type { HandleOAuthCallbackParams, HandleSamlCallbackParams } from '@clerk/types';
import React from 'react';

import { Flow } from '../customizables';
import { Card, LoadingCardContainer, useCardState, withCardStateProvider } from '../elements';
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
  const { handleRedirectCallback } = useClerk();
  const { navigate } = useRouter();
  const card = useCardState();

  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    handleRedirectCallback({ ...props }, navigate).catch(e => {
      handleError(e, [], card.setError);
      timeoutId = setTimeout(() => void navigate('../'), 4000);
    });

    return () => clearTimeout(timeoutId);
  }, [handleError, handleRedirectCallback]);

  return (
    <Flow.Part part='ssoCallback'>
      <Card.Root>
        <Card.Content>
          <Card.Alert>{card.error}</Card.Alert>
          <LoadingCardContainer />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
