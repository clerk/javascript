import { useEffect, useRef } from 'react';

import { useFieldOTP } from '@/ui/elements/CodeControl';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { VerifyWithCodeProps, VerifyWithCodeViewData } from './verification-code.types';

export const useVerifyWithCodeController = (props: VerifyWithCodeProps): VerifyWithCodeViewData => {
  const card = useCardState();
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  const preparing = useRef<Promise<void>>();
  const current = useRef({ key: props.requestKey });
  if (current.current.key !== props.requestKey) {
    current.current = { key: props.requestKey };
  }
  const owner = current.current;
  const generation = useRef({});
  const isCurrent = () => mounted.current && current.current === owner && (props.canRun?.() ?? true);
  const prepare = () => {
    if (!isCurrent() || pending.current) {
      return Promise.resolve();
    }
    if (preparing.current) {
      return preparing.current;
    }
    const origin = generation.current;
    const request = Promise.resolve()
      .then(() => {
        if (isCurrent() && generation.current === origin) {
          return props.prepareVerification();
        }
        return undefined;
      })
      .then(() => undefined)
      .catch(error => {
        if (isCurrent() && generation.current === origin) {
          handleError(error, [], card.setError);
        }
      })
      .finally(() => {
        if (preparing.current === request) {
          preparing.current = undefined;
        }
      });
    preparing.current = request;
    return request;
  };
  const otp = useFieldOTP<{ owner: object }>({
    onCodeEntryFinished: (code, resolve, reject) => {
      if (!isCurrent() || pending.current) {
        return;
      }
      const origin = {};
      generation.current = origin;
      const request = (async () => {
        try {
          const attempt = props.attemptVerification(code);
          if (!attempt) {
            return;
          }
          const completed = await attempt;
          if (completed !== false && isCurrent() && generation.current === origin) {
            await resolve({ owner: origin });
          }
        } catch (error) {
          if (isCurrent() && generation.current === origin) {
            await reject(error);
          }
        }
      })().finally(() => {
        if (pending.current === request) {
          pending.current = undefined;
        }
      });
      pending.current = request;
    },
    onResendCodeClicked: () => {
      void prepare();
    },
    onResolve: completed => {
      if (isCurrent() && completed?.owner === generation.current) {
        props.nextStep();
      }
    },
  });
  const initialPrepare = useRef(prepare);
  useEffect(() => {
    mounted.current = true;
    void initialPrepare.current();
    return () => {
      mounted.current = false;
    };
  }, []);
  return {
    otp,
    identifier: props.identifier,
    onReset: () => {
      if (isCurrent()) {
        generation.current = {};
        pending.current = undefined;
        props.onReset();
      }
    },
  };
};
