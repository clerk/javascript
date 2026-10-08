import { useEffect, useRef } from 'react';

import { useFieldOTP } from '@/ui/elements/CodeControl';

import type { TotpVerificationModel, TotpVerificationOptions } from './mfa-totp.types';

export const useVerifyTOTPController = (model: TotpVerificationModel, props: TotpVerificationOptions) => {
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  const generation = useRef({});
  const canRun = () => mounted.current && model.canRun();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current = {};
      pending.current = undefined;
    };
  }, [model.requestKey]);
  const otp = useFieldOTP<{ owner: object }>({
    onCodeEntryFinished: (code, resolve, reject) => {
      if (!canRun() || pending.current) {
        return;
      }
      const origin = {};
      generation.current = origin;
      const isCurrent = () => canRun() && generation.current === origin;
      const request = model
        .verifyCode(code, isCurrent)
        .then(completed => {
          if (completed && isCurrent()) {
            return resolve({ owner: origin });
          }
        })
        .catch(error => {
          if (isCurrent()) {
            return reject(error);
          }
        })
        .finally(() => {
          if (pending.current === request) {
            pending.current = undefined;
          }
        });
      pending.current = request;
    },
    onResolve: completed => {
      if (canRun() && completed?.owner === generation.current) {
        props.onSuccess();
      }
    },
  });

  const navigate = (callback: () => void) => {
    if (canRun()) {
      generation.current = {};
      pending.current = undefined;
      callback();
    }
  };
  return { otp, onReset: () => navigate(props.onReset), onBack: () => navigate(props.onBack) };
};
