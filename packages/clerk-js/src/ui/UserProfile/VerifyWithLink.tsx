import { EmailAddressResource } from '@clerk/types';
import React from 'react';

import { EmailLinkStatusCard } from '../common';
import { buildMagicLinkRedirectUrl } from '../common/redirects';
import { useUserProfileContext } from '../contexts';
import { useCardState, VerificationLink } from '../elements';
import { useMagicLink } from '../hooks';
import { handleError } from '../utils';
import { FormButtonContainer } from './FormButtons';
import { NavigateToFlowStartButton } from './NavigateToFlowStartButton';

type VerifyWithLinkProps = {
  email: EmailAddressResource;
  nextStep: () => void;
};

export const VerifyWithLink = (props: VerifyWithLinkProps) => {
  const { email, nextStep } = props;
  const card = useCardState();
  const profileContext = useUserProfileContext();
  const { startMagicLinkFlow } = useMagicLink(email);

  React.useEffect(() => {
    startVerification();
  }, []);

  function startVerification() {
    const redirectUrl = buildMagicLinkRedirectUrl(profileContext);
    startMagicLinkFlow({ redirectUrl })
      .then(() => nextStep())
      .catch(err => handleError(err, [], card.setError));
  }

  return (
    <>
      <VerificationLink
        formTitle={'Verification link'}
        formSubtitle={`Click on the verification link in the email sent to ${email.emailAddress}`}
        onResendCodeClicked={startVerification}
      />
      <FormButtonContainer>
        <NavigateToFlowStartButton>Cancel</NavigateToFlowStartButton>
      </FormButtonContainer>
    </>
  );
};

export const VerificationSuccessPage = () => {
  return (
    <EmailLinkStatusCard
      title='Successfully verified email'
      subtitle='Return to previous tab continue'
      status='verified'
    />
  );
};
