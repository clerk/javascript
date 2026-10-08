import { useEffect, useRef, useState } from 'react';

import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { TotpSetupModel, TotpSetupOptions } from './mfa-totp.types';

type DisplayFormat = 'qr' | 'uri';

export const useAddAuthenticatorAppController = (model: TotpSetupModel, props: TotpSetupOptions) => {
  const card = useCardState();
  const { close } = useActionContext();
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('qr');
  const mounted = useRef(true);
  const generation = useRef({});
  const canRun = () => mounted.current && model.canRun();
  const start = () => {
    const origin = generation.current;
    const isCurrent = () => canRun() && generation.current === origin;
    if (!isCurrent()) {
      return;
    }
    void model.createTOTP().catch(error => {
      if (!isCurrent()) {
        return;
      }
      if (model.isCancellation(error)) {
        return close();
      }
      return handleError(error, [], card.setError);
    });
  };
  const startOnMount = useRef(start);
  startOnMount.current = start;

  useEffect(() => {
    mounted.current = true;
    startOnMount.current();
    return () => {
      mounted.current = false;
      generation.current = {};
    };
  }, [model.requestKey]);

  return {
    title: props.title,
    hasError: !!card.error,
    totp: model.setup,
    displayFormat,
    showURI: () => setDisplayFormat('uri'),
    showQR: () => setDisplayFormat('qr'),
    onSuccess: () => {
      if (canRun() && model.setup) {
        props.onSuccess();
      }
    },
    onReset: () => {
      if (canRun()) {
        generation.current = {};
        props.onReset();
      }
    },
  };
};
