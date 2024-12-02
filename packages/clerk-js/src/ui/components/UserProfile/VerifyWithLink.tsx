import type { EmailAddressResource } from '@clerk/types';
import React from 'react';

import { EmailLinkStatusCard } from '../../common';
import { buildVerificationRedirectUrl } from '../../common/redirects';
import { useEnvironment, useUserProfileContext } from '../../contexts';
import { Button, descriptors, localizationKeys } from '../../customizables';
import { FormButtonContainer, useCardState, VerificationLink } from '../../elements';
import { useEmailLink } from '../../hooks';
import { handleError } from '../../utils';

type VerifyWithLinkProps = {
  email: EmailAddressResource;
  onReset: () => void;
  nextStep: () => void;
};

export const VerifyWithLink = (props: VerifyWithLinkProps) => {
  const { email, nextStep, onReset } = props;
  const card = useCardState();
  const profileContext = useUserProfileContext();
  const { startEmailLinkFlow } = useEmailLink(email);
  const { displayConfig } = useEnvironment();

  React.useEffect(() => {
    startVerification();
  }, []);

  function startVerification() {
    /**
     * The following workaround is used in order to make magic links work when the
     * <UserProfile/> is used as a modal. In modals, the routing is virtual. For
     * magic links the flow needs to end by invoking the /verify path of the <UserProfile/>
     * that renders the <VerificationSuccessPage/>. So, we use the userProfileUrl that
     * defaults to Clerk Hosted Pages /user as a fallback.
     */
    const { routing } = profileContext;
    const baseUrl = routing === 'virtual' ? displayConfig.userProfileUrl : '';

    const redirectUrl = buildVerificationRedirectUrl(profileContext, baseUrl);
    startEmailLinkFlow({ redirectUrl })
      .then(() => nextStep())
      .catch(err => handleError(err, [], card.setError));
  }

  return (
    <>
      <VerificationLink
        resendButton={localizationKeys('userProfile.emailAddressPage.emailLink.resendButton')}
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

export const VerificationSuccessPage = () => {
  return (
    <EmailLinkStatusCard
      title={localizationKeys('signUp.emailLink.verifiedSwitchTab.title')}
      subtitle={localizationKeys('signUp.emailLink.verifiedSwitchTab.subtitle')}
      status='verified'
    />
  );
};
