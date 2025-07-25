import { EmailLinkErrorCodeStatus, isEmailLinkError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import { noop } from '@clerk/shared/utils';
import React from 'react';

import { completeSignUpFlow } from '../../utils';
import { useCoreSignUp } from '../contexts';
import type { LocalizationKey } from '../localization';
import { useRouter } from '../router';
import { sleep } from '../utils/sleep';
import type { EmailLinkUIStatus } from './EmailLinkStatusCard';
import { EmailLinkStatusCard } from './EmailLinkStatusCard';

export type EmailLinkVerifyProps = {
  continuePath?: string;
  onVerifiedOnOtherDevice?: () => void;
  redirectUrl?: string;
  redirectUrlComplete?: string;
  texts: Record<EmailLinkUIStatus, { title: LocalizationKey; subtitle: LocalizationKey }>;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
};

export const EmailLinkVerify = (props: EmailLinkVerifyProps) => {
  const { redirectUrl, redirectUrlComplete, verifyEmailPath, verifyPhonePath, continuePath, onVerifiedOnOtherDevice } =
    props;
  const { handleEmailLinkVerification } = useClerk();
  const { navigate } = useRouter();
  const signUp = useCoreSignUp();
  const [verificationStatus, setVerificationStatus] = React.useState<EmailLinkUIStatus>('loading');

  const startVerification = async () => {
    try {
      // Avoid loading flickering
      await sleep(750);
      const result = await handleEmailLinkVerification(
        {
          onVerifiedOnOtherDevice: onVerifiedOnOtherDevice || noop,
          redirectUrlComplete,
          redirectUrl,
        },
        navigate,
      );

      if (result !== null) return;

      setVerificationStatus('verified_switch_tab');
      await sleep(750);
      await completeSignUpFlow({
        signUp,
        verifyEmailPath,
        verifyPhonePath,
        continuePath,
        navigate,
      });
    } catch (err) {
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
