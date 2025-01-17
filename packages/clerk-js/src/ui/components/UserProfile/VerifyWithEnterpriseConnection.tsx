import type { EmailAddressResource } from '@clerk/types';
import React from 'react';

import { appendModalState } from '../../../utils';
import { useUserProfileContext } from '../../contexts';
import { Button, descriptors, localizationKeys } from '../../customizables';
import { FormButtonContainer, useCardState, VerificationLink } from '../../elements';
import { useEnterpriseSsoLink } from '../../hooks';
import { handleError } from '../../utils';

type VerifyWithEnterpriseConnectionProps = {
  email: EmailAddressResource;
  onReset: () => void;
  nextStep: () => void;
};

export const VerifyWithEnterpriseConnection = (props: VerifyWithEnterpriseConnectionProps) => {
  const { email, nextStep, onReset } = props;
  const card = useCardState();
  const profileContext = useUserProfileContext();
  const { startEnterpriseSsoLinkFlow } = useEnterpriseSsoLink(email);

  React.useEffect(() => {
    startVerification();
  }, []);

  function startVerification() {
    const { mode, componentName } = profileContext;

    startEnterpriseSsoLinkFlow({
      redirectUrl:
        mode === 'modal' ? appendModalState({ url: window.location.href, componentName }) : window.location.href,
    })
      .then(() => nextStep())
      .catch(err => handleError(err, [], card.setError));
  }

  return (
    <>
      <VerificationLink
        resendButton={localizationKeys('userProfile.emailAddressPage.enterpriseSsoLink.resendButton')}
        onResendCodeClicked={startVerification}
      />
      <FormButtonContainer>
        <Button
          variant='ghost'
          localizationKey={localizationKeys('userProfile.formButtonReset')}
          elementDescriptor={descriptors.formButtonReset}
          onClick={onReset}
        />
      </FormButtonContainer>
    </>
  );
};
