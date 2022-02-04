import { noop } from '@clerk/shared/utils/noop';
import { EmailAddressResource } from '@clerk/types';
import React from 'react';
import { buildMagicLinkRedirectUrl, MagicLinkWaitingScreen } from 'ui/common';
import { useUserProfileContext } from 'ui/contexts';
import { useMagicLink } from 'ui/hooks';

type EmailAddressVerificationWithMagicLinkProps = {
  email: EmailAddressResource;
  onVerificationComplete?: () => void;
  onError?: (err: any) => void;
  className?: string;
};

export function EmailAddressVerificationWithMagicLink({
  email,
  onError = noop,
  onVerificationComplete = noop,
  className,
}: EmailAddressVerificationWithMagicLinkProps): JSX.Element {
  const profileContext = useUserProfileContext();

  const { startMagicLinkFlow } = useMagicLink(email);

  React.useEffect(() => {
    startVerification();
  }, []);

  function startVerification() {
    const redirectUrl = buildMagicLinkRedirectUrl(profileContext);
    startMagicLinkFlow({ redirectUrl })
      .then(onVerificationComplete)
      .catch(onError);
  }

  return (
    <MagicLinkWaitingScreen
      icon='mail'
      header='Check your email'
      mainText={
        <>
          A verification link has been sent to
          <br />
          <span className='cl-verification-page-identifier'>
            {email.emailAddress}
          </span>
        </>
      }
      secondaryText='Click the link in the email to verify your new email, then return to
          this tab.'
      className={className}
      onResendButtonClicked={startVerification}
    />
  );
}
