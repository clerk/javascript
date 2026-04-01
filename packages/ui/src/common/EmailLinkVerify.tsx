import { EmailLinkErrorCodeStatus, isEmailLinkError } from '@clerk/shared/error';
import { completeSignUpFlow } from '@clerk/shared/internal/clerk-js/completeSignUpFlow';
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
};

export const EmailLinkVerify = (props: EmailLinkVerifyProps) => {
  const { redirectUrl, redirectUrlComplete, verifyEmailPath, verifyPhonePath, continuePath } = props;
  const { handleEmailLinkVerification } = useClerk();
  const { navigate } = useRouter();
  const signUp = useCoreSignUp();
  const [verificationStatus, setVerificationStatus] = React.useState<EmailLinkUIStatus>('loading');

  const startVerification = async () => {
    try {
      // Avoid loading flickering
      await sleep(750);
      await handleEmailLinkVerification({ redirectUrlComplete, redirectUrl }, navigate);
      setVerificationStatus('verified_switch_tab');
      await sleep(750);
      await completeSignUpFlow({
        signUp,
        verifyEmailPath,
        verifyPhonePath,
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
