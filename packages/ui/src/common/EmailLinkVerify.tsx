import { EmailLinkErrorCodeStatus, isEmailLinkError } from '@clerk/shared/error';
import { completeSignUpFlow } from '@clerk/shared/internal/clerk-js/completeSignUpFlow';
import { getClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';
import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { useCoreSignUp } from '../contexts';
import type { LocalizationKey } from '../localization';
import { useRouter } from '../router';
import { sleep } from '../utils/sleep';
import type { EmailLinkUIStatus } from './EmailLinkStatusCard';
import { EmailLinkStatusCard } from './EmailLinkStatusCard';

export type EmailLinkVerifyProps = {
  redirectUrlComplete?: string;
  redirectUrl?: string;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  continuePath?: string;
  texts: Record<EmailLinkUIStatus, { title: LocalizationKey; subtitle: LocalizationKey }>;
  /**
   * Invoked when the link lands with `__clerk_status=transferable`. Returns whether this tab took
   * the flow over; when it returns false the "return to the original tab" card renders instead.
   */
  onTransferable?: () => Promise<boolean>;
};

export const EmailLinkVerify = (props: EmailLinkVerifyProps) => {
  const { redirectUrl, redirectUrlComplete, verifyEmailPath, verifyPhonePath, continuePath, onTransferable } = props;
  const { handleEmailLinkVerification } = useClerk();
  const { navigate } = useRouter();
  const signUp = useCoreSignUp();
  const [verificationStatus, setVerificationStatus] = React.useState<EmailLinkUIStatus>('loading');

  const startVerification = async () => {
    try {
      // Avoid loading flickering
      await sleep(750);
      await handleEmailLinkVerification({ redirectUrlComplete, redirectUrl }, navigate);

      // `transferable` = the email was verified but no user exists (`signUpIfMissing`), so there
      // is no session to complete here. The sign-up transfer is banked on the client that owns
      // the sign-in; if that is this one, `onTransferable` carries the flow forward from this tab,
      // otherwise the originating tab's poll does and this one only points the user back there.
      if (getClerkQueryParam('__clerk_status') === 'transferable') {
        if (!(await onTransferable?.())) {
          setVerificationStatus('transferable');
        }
        return;
      }

      setVerificationStatus('verified_switch_tab');
      await sleep(750);
      await completeSignUpFlow({
        signUp,
        verifyEmailPath,
        verifyPhonePath,
        protectCheckPath: '../protect-check',
        continuePath,
        navigate,
      });
    } catch (err: any) {
      if (
        isEmailLinkError(err) &&
        (err.code === EmailLinkErrorCodeStatus.Expired || err.code === EmailLinkErrorCodeStatus.ClientMismatch)
      ) {
        setVerificationStatus(err.code);
        return;
      }

      setVerificationStatus(EmailLinkErrorCodeStatus.Failed);
    }
  };

  React.useEffect(() => {
    void startVerification();
  }, []);

  return (
    <EmailLinkStatusCard
      title={props.texts[verificationStatus]?.title || ''}
      subtitle={props.texts[verificationStatus]?.subtitle || ''}
      status={verificationStatus}
    />
  );
};
