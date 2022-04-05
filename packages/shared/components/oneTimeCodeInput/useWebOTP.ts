import React from 'react';

import { inClientSide } from '../../utils';

declare global {
  interface CredentialRequestOptions {
    otp: OTPOptions;
  }

  interface OTPOptions {
    transport: string[];
  }

  interface Credential {
    code: string;
  }
}

type UseWebOTPParams = {
  onOtpReceived: (code: string | undefined) => void;
};

export const useWebOTP = ({ onOtpReceived }: UseWebOTPParams) => {
  const abortControllerRef = React.useRef<AbortController>();
  const isMountedRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    if (!inClientSide() || !('OTPCredential' in window)) {
      return;
    }

    abortControllerRef.current = new AbortController();
    void navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: abortControllerRef.current.signal,
      })
      .then(otp => {
        console.log('Clerk WebOTP code:', otp?.code);
        if (isMountedRef.current) {
          onOtpReceived(otp?.code);
        }
      })
      .catch(e => {
        console.log('Clerk WebOTP error:', e);
      });

    return cleanup;
  }, []);

  const cleanup = () => {
    abortControllerRef.current?.abort();
    isMountedRef.current = false;
  };

  return { stop: cleanup };
};
