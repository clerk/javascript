import { useEffect, useRef, useState } from 'react';

import { useFieldOTP } from '@/elements/CodeControl';
import { useCardState } from '@/elements/contexts';

import type { TotpCodeFlowModel, TotpVerificationModel } from './totp-code-flow.types';

export const useTotpCodeFlowController = (
  model: TotpCodeFlowModel,
  onSuccess: () => void,
  goToStartStep: () => void,
) => {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  return {
    wizardProps: { step },
    creation: model.creation,
    verification: model.verification,
    backupCodes: model.backupCodes,
    onAddSuccess: () => {
      if (model.canRun()) {
        setStep(1);
      }
    },
    onAddReset: () => {
      if (model.canRun()) {
        goToStartStep();
      }
    },
    onVerifySuccess: () => {
      if (model.canRun()) {
        setStep(2);
      }
    },
    onVerifyReset: () => {
      if (model.canRun()) {
        setStep(0);
      }
    },
    onFinish: () => {
      if (model.canRun()) {
        onSuccess();
      }
    },
  };
};

export const useTotpVerifyController = (model: TotpVerificationModel, onSuccess: () => void, onReset: () => void) => {
  const card = useCardState();
  const latest = useRef({ model, onSuccess, onReset, card });
  latest.current = { model, onSuccess, onReset, card };
  const scopeKey = useRef(model.scopeKey);
  const mounted = useRef(true);
  const finished = useRef(false);
  const pending = useRef<{ owner: object; release: () => void }>();
  const canRun = () =>
    mounted.current &&
    !finished.current &&
    latest.current.model.scopeKey === scopeKey.current &&
    latest.current.model.canRun();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current?.release();
    };
  }, []);
  const otp = useFieldOTP<{ owner: object }>({
    onCodeEntryFinished: (code, resolve, reject) => {
      if (!canRun() || pending.current) {
        return;
      }
      const release = latest.current.card.beginRequest();
      if (!release) {
        return;
      }
      const action = { owner: {}, release };
      const isCurrent = () => canRun() && pending.current === action;
      latest.current.card.setError(undefined);
      const request = Promise.resolve()
        .then(async () => {
          if (!isCurrent()) {
            return;
          }
          try {
            if ((await latest.current.model.verifyCode(code, isCurrent)) && isCurrent()) {
              await resolve({ owner: action.owner });
            }
          } catch (error) {
            if (isCurrent()) {
              await reject(error);
            }
          }
        })
        .finally(() => {
          release();
          if (pending.current === action) {
            pending.current = undefined;
          }
        });
      pending.current = action;
      void request;
    },
    onResolve: completed => {
      if (canRun() && completed?.owner === pending.current?.owner) {
        finished.current = true;
        latest.current.onSuccess();
      }
    },
  });
  return {
    otp: { ...otp, isLoading: otp.isLoading || card.isLoading },
    onReset: () => {
      if (canRun() && !pending.current && !latest.current.card.isLoading) {
        finished.current = true;
        latest.current.onReset();
      }
    },
  };
};
