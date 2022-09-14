import { EmailAddressResource } from '@clerk/types';
import React from 'react';

import { EmailLinkStatusCard } from '../common';
import { buildMagicLinkRedirectUrl } from '../common/redirects';
import { useUserProfileContext } from '../contexts';
import { localizationKeys } from '../customizables';
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
        formTitle={localizationKeys('userProfile.emailAddressPage.emailLink.formTitle')}
        formSubtitle={localizationKeys('userProfile.emailAddressPage.emailLink.formSubtitle', {
          identifier: email.emailAddress,
        })}
        resendButton={localizationKeys('userProfile.emailAddressPage.emailLink.resendButton')}
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
