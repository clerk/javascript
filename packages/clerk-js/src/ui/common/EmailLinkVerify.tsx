import React from 'react';

import { isMagicLinkError, MagicLinkErrorCode } from '../../core/resources/Error';
import { VerificationStatus } from '../../utils/getClerkQueryParam';
import { completeSignUpFlow } from '../components/SignUp/util';
import { useCoreClerk, useCoreSignUp } from '../contexts';
import { useNavigate } from '../hooks/useNavigate';
import { sleep } from '../utils';
import { EmailLinkStatusCard } from './EmailLinkStatusCard';

export type EmailLinkVerifyProps = {
  redirectUrlComplete?: string;
  redirectUrl?: string;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  texts: Record<VerificationStatus, { title: string; subtitle: string }>;
};

export const EmailLinkVerify = (props: EmailLinkVerifyProps) => {
  const { redirectUrl, redirectUrlComplete, verifyEmailPath, verifyPhonePath } = props;
  const { handleMagicLinkVerification } = useCoreClerk();
  const { navigate } = useNavigate();
  const signUp = useCoreSignUp();
  const [verificationStatus, setVerificationStatus] = React.useState<VerificationStatus>('loading');

  const startVerification = async () => {
    try {
      // Avoid loading flickering
      await sleep(750);
      await handleMagicLinkVerification({ redirectUrlComplete, redirectUrl }, navigate);
      setVerificationStatus('verified_switch_tab');
      await sleep(750);
      return completeSignUpFlow({
        signUp,
        verifyEmailPath,
        verifyPhonePath,
        navigate,
      });
    } catch (err) {
      let status: VerificationStatus = 'failed';
      if (isMagicLinkError(err) && err.code === MagicLinkErrorCode.Expired) {
        status = 'expired';
      }
      setVerificationStatus(status);
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
