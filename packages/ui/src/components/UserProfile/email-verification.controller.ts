import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { EmailVerificationFlow, EmailVerificationProps, EmailVerificationViewData } from './email-form.types';

export const useEmailVerificationController = (props: EmailVerificationProps): EmailVerificationViewData => {
  const card = useCardState();
  const latest = useRef(props);
  latest.current = props;
  const flowRef = useRef<EmailVerificationFlow | null>(null);
  const attemptRef = useRef(0);
  const mounted = useRef(true);
  const current = useRef({ key: props.requestKey });
  if (current.current.key !== props.requestKey) {
    current.current = { key: props.requestKey };
  }
  const owner = current.current;
  const canRun = () => mounted.current && current.current === owner && (latest.current.canRun?.() ?? true);
  const cancel = () => {
    const flow = flowRef.current;
    flowRef.current = null;
    attemptRef.current += 1;
    flow?.cancel();
  };

  const startVerification = () => {
    if (!canRun()) {
      return;
    }
    cancel();
    const attempt = attemptRef.current;
    const isCurrent = () => canRun() && attemptRef.current === attempt;
    try {
      const flow = latest.current.createFlow(isCurrent);
      flowRef.current = flow;
      void flow
        .start()
        .then(completed => {
          if (completed !== false && isCurrent() && flowRef.current === flow) {
            latest.current.nextStep();
          }
        })
        .catch(error => {
          if (isCurrent() && flowRef.current === flow) {
            cancel();
            handleError(error, [], card.setError);
          }
        });
    } catch (error) {
      if (isCurrent()) {
        cancel();
        handleError(error as Error, [], card.setError);
      }
    }
  };

  const startOnMount = useRef(startVerification);
  startOnMount.current = startVerification;
  useEffect(() => {
    mounted.current = true;
    startOnMount.current();
    return () => {
      mounted.current = false;
      cancel();
    };
  }, [props.requestKey]);

  return {
    startVerification,
    openVerification: async () => {
      if (!canRun()) {
        return;
      }
      const flow = flowRef.current;
      const attempt = attemptRef.current;
      try {
        await flow?.open?.();
      } catch (error) {
        if (canRun() && flowRef.current === flow && attemptRef.current === attempt) {
          handleError(error as Error, [], card.setError);
        }
      }
    },
    onReset: () => {
      if (canRun()) {
        cancel();
        latest.current.onReset();
      }
    },
  };
};
