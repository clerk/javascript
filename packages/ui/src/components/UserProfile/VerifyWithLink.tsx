import { getClerkQueryParam, toEmailAddressLinkStatus } from '@clerk/shared/internal/clerk-js/queryParams';
import { __internal_useUserBase } from '@clerk/shared/react';
import type { EmailAddressResource } from '@clerk/shared/types';
import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { VerificationLink } from '@/ui/elements/VerificationLinkCard';
import { handleError } from '@/ui/utils/errorHandler';

import { EmailLinkStatusCard } from '../../common';
import { buildVerificationRedirectUrl } from '../../common/redirects';
import { useEnvironment, useUserProfileContext } from '../../contexts';
import { Button, descriptors, localizationKeys } from '../../customizables';
import { useEmailLink } from '../../hooks';
import { useRouter } from '../../router';

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

    const redirectUrl = buildVerificationRedirectUrl({ ctx: profileContext, baseUrl, intent: 'profile' });
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

const verificationLinkTexts = {
  verified: {
    title: localizationKeys('signUp.emailLink.verifiedSwitchTab.title'),
    subtitle: localizationKeys('signUp.emailLink.verifiedSwitchTab.subtitle'),
  },
  expired: {
    title: localizationKeys('signIn.emailLink.expired.title'),
    subtitle: localizationKeys('signIn.emailLink.expired.subtitle'),
  },
  failed: {
    title: localizationKeys('signIn.emailLink.failed.title'),
    subtitle: localizationKeys('signIn.emailLink.failed.subtitle'),
  },
  client_mismatch: {
    title: localizationKeys('signIn.emailLink.clientMismatch.title'),
    subtitle: localizationKeys('userProfile.emailAddressPage.emailLink.clientMismatch.subtitle'),
  },
};

export const VerificationSuccessPage = () => {
  const router = useRouter();
  const user = __internal_useUserBase();
  const status = router.queryParams['__clerk_status'] ?? getClerkQueryParam('__clerk_status');
  const linkStatus = toEmailAddressLinkStatus(status);

  if (!user && (!linkStatus || !router.matches(undefined, true))) {
    return null;
  }

  const shownStatus = status ? (linkStatus ?? 'failed') : 'verified';

  return (
    <EmailLinkStatusCard
      {...verificationLinkTexts[shownStatus]}
      status={shownStatus}
    />
  );
};
