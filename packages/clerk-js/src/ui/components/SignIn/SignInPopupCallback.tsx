import { useClerk } from '@clerk/shared/react';
import type { HandleOAuthCallbackParams, HandleSamlCallbackParams } from '@clerk/types';
import React from 'react';

import { Flow } from '../../customizables';
import { Card, LoadingCardContainer, useCardState, withCardStateProvider } from '../../elements';
import { CaptchaElement } from '../../elements/CaptchaElement';

export const SignInPopupCallback = withCardStateProvider<HandleOAuthCallbackParams | HandleSamlCallbackParams>(() => {
  return (
    <Flow.Part part='popupCallback'>
      <SignInPopupCallbackCard />
    </Flow.Part>
  );
});

export const SignInPopupCallbackCard = () => {
  const clerk = useClerk();
  const card = useCardState();

  React.useEffect(() => {
    window.opener.postMessage({ session: clerk.session!.id }, window.location.origin);
    window.close();
  }, []);

  return (
    <Flow.Part part='popupCallback'>
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
