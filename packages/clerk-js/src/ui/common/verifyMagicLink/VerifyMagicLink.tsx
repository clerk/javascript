import { isMagicLinkError, MagicLinkErrorCode } from 'core/resources/internal';
import React, { useEffect, useState } from 'react';
import type { MagicLinkVerificationStatusModalProps } from 'ui/common';
import { MagicLinkVerificationStatusModal } from 'ui/common';
import { useCoreClerk, useCoreSignUp } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { completeSignUpFlow } from 'ui/signUp/util';
import type { VerificationStatus } from 'utils/getClerkQueryParam';

type VerifyMagicLinkProps = Pick<MagicLinkVerificationStatusModalProps, 'successHeader'> & {
  redirectUrlComplete?: string;
  redirectUrl?: string;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
};

export function VerifyMagicLink({
  successHeader,
  redirectUrlComplete,
  redirectUrl,
  verifyEmailPath,
  verifyPhonePath,
}: VerifyMagicLinkProps): JSX.Element | null {
  const { handleMagicLinkVerification } = useCoreClerk();
  const { navigate } = useNavigate();
  const signUp = useCoreSignUp();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await handleMagicLinkVerification({ redirectUrlComplete, redirectUrl }, navigate);
        setVerificationStatus('verified');

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
    void verify();
  }, []);

  return (
    <MagicLinkVerificationStatusModal
      successHeader={successHeader}
      verificationStatus={verificationStatus}
    />
  );
}
