import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import type { EmailAddressResource } from '@clerk/shared/types';
import React from 'react';

import { useRouter } from '@/router';
import { useCardState } from '@/ui/elements/contexts';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { handleError } from '@/ui/utils/errorHandler';

import { useUserProfileContext } from '../../contexts';
import { Button, descriptors, Flex, localizationKeys } from '../../customizables';
import { useEnterpriseSSOLink } from '../../hooks';

type VerifyWithEnterpriseConnectionProps = {
  email: EmailAddressResource;
  onReset: () => void;
  nextStep: () => void;
};

export const VerifyWithEnterpriseConnection = (props: VerifyWithEnterpriseConnectionProps) => {
  const { navigate } = useRouter();
  const { email, nextStep, onReset } = props;
  const card = useCardState();
  const profileContext = useUserProfileContext();
  const { startEnterpriseSSOLinkFlow } = useEnterpriseSSOLink(email);

  React.useEffect(() => {
    startVerification();
  }, []);

  function startVerification() {
    const { mode, componentName } = profileContext;

    startEnterpriseSSOLinkFlow({
      redirectUrl:
        mode === 'modal' ? appendModalState({ url: window.location.href, componentName }) : window.location.href,
    })
      .then(() => nextStep())
      .catch(err => handleError(err, [], card.setError));
  }

  async function handleClick() {
    await navigate(email.verification.externalVerificationRedirectURL?.href || '');
  }

  return (
    <>
      <Flex justify='center'>
        <Button
          variant='link'
          onClick={handleClick}
          localizationKey={localizationKeys('userProfile.emailAddressPage.enterpriseSSOLink.formButton')}
        />
      </Flex>
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
