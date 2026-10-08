import { useEffect, useRef } from 'react';

import { useCardState } from '@/elements/contexts';
import type { VerificationCodeCardProps } from '@/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import type { SmsVerificationModel } from './sms-code-flow.types';

export const useSmsVerifyPhoneController = (
  model: SmsVerificationModel,
  onSuccess: () => void,
  onReset: () => void,
) => {
  const card = useCardState();
  const latest = useRef({ model, onSuccess, onReset, card });
  latest.current = { model, onSuccess, onReset, card };
  const mounted = useRef(true);
  const finished = useRef(false);
  const pending = useRef<{ promise: Promise<void>; release: () => void }>();
  const preparing = useRef<Promise<void>>();
  const scopeKey = useRef(model.scopeKey);
  const canRun = () =>
    mounted.current &&
    !finished.current &&
    latest.current.model.scopeKey === scopeKey.current &&
    latest.current.model.canRun();
  const run = (operation: (isCurrent: () => boolean) => Promise<void>): Promise<void> => {
    if (!canRun()) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current.promise;
    }
    const release = latest.current.card.beginRequest(latest.current.model.phoneId);
    if (!release) {
      return Promise.resolve();
    }
    const action = { promise: Promise.resolve(), release };
    const isCurrent = () => canRun() && pending.current === action;
    action.promise = Promise.resolve()
      .then(async () => {
        if (isCurrent()) {
          await operation(isCurrent);
        }
      })
      .finally(() => {
        action.release();
        if (pending.current === action) {
          pending.current = undefined;
        }
      });
    pending.current = action;
    return action.promise;
  };
  const prepare = (): Promise<void> => {
    if (!canRun() || pending.current) {
      return Promise.resolve();
    }
    if (preparing.current) {
      return preparing.current;
    }
    const action = Promise.resolve()
      .then(async () => {
        if (!canRun()) {
          return;
        }
        try {
          await latest.current.model.prepare(canRun);
        } catch (error) {
          if (canRun() && !pending.current) {
            handleError(error as Error, [], latest.current.card.setError);
          }
        }
      })
      .finally(() => {
        if (preparing.current === action) {
          preparing.current = undefined;
        }
      });
    preparing.current = action;
    return action;
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current?.release();
    };
  }, []);
  const initialPrepare = useRef(prepare);
  useEffect(() => {
    void initialPrepare.current();
  }, []);
  const onCodeEntryFinishedAction: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    void run(async isCurrent => {
      try {
        await preparing.current;
        if (!isCurrent()) {
          return;
        }
        latest.current.card.setError(undefined);
        if (!(await latest.current.model.attempt(code, isCurrent)) || !isCurrent()) {
          return;
        }
        await resolve();
        if (!isCurrent()) {
          return;
        }
        if ((await latest.current.model.enableMfa(isCurrent)) && isCurrent()) {
          finished.current = true;
          latest.current.onSuccess();
        }
      } catch (error) {
        if (isCurrent()) {
          await reject(error);
        }
      }
    });
  };
  return {
    phoneNumber: model.phoneNumber,
    onCodeEntryFinishedAction,
    onResendCodeClicked: () => void prepare(),
    onReset: () => {
      if (canRun() && !pending.current && !latest.current.card.isLoading) {
        finished.current = true;
        latest.current.onReset();
      }
    },
  };
};
