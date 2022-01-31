import React, { useEffect, useState } from 'react';
import { useCoreClerk } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';
import { MagicLinkVerificationStatusModal } from 'ui/common';
import type { MagicLinkVerificationStatusModalProps } from 'ui/common';
import type { VerificationStatus } from 'utils/getClerkQueryParam';
import { isMagicLinkError, MagicLinkErrorCode } from 'core/resources/Error';

type VerifyMagicLinkProps = Pick<
  MagicLinkVerificationStatusModalProps,
  'successHeader'
> & {
  redirectUrlComplete?: string;
  redirectUrl?: string;
};

export function VerifyMagicLink({
  successHeader,
  redirectUrlComplete,
  redirectUrl,
}: VerifyMagicLinkProps): JSX.Element | null {
  const { handleMagicLinkVerification } = useCoreClerk();
  const { navigate } = useNavigate();

  const [
    verificationStatus,
    setVerificationStatus,
  ] = useState<VerificationStatus>('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await handleMagicLinkVerification(
          {
            redirectUrlComplete,
            redirectUrl,
          },
          navigate,
        );
        setVerificationStatus('verified');
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
