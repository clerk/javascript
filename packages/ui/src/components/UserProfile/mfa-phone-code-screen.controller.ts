import { useEffect, useRef } from 'react';

import { useWizard } from '@/ui/common';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { MfaPhoneCodeScreenData, MfaPhoneCodeScreenProps, MfaPhoneData } from './mfa-phone-code-screen.types';

export const useMfaPhoneRequestController = (model: { requestKey?: string; canRun?: () => boolean }) => {
  const card = useCardState();
  const pending = useRef<{ promise: Promise<void>; release: () => void }>();
  const mounted = useRef(true);
  const current = useRef({ key: model.requestKey });
  if (current.current.key !== model.requestKey) {
    current.current = { key: model.requestKey };
  }
  const owner = current.current;
  const generation = useRef({});
  const cancel = () => {
    generation.current = {};
    pending.current?.release();
    pending.current = undefined;
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancel();
    };
  }, [model.requestKey]);
  const canRun = () => mounted.current && current.current === owner && (model.canRun?.() ?? true);
  const run = (
    id: string | undefined,
    execute: (canContinue: () => boolean) => Promise<boolean | void>,
    onSuccess: () => void,
  ): Promise<void> => {
    if (!canRun()) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current.promise;
    }
    const release = card.beginRequest(id);
    if (!release) {
      return Promise.resolve();
    }
    const origin = generation.current;
    const isCurrent = () => canRun() && generation.current === origin;
    const action = { release, promise: Promise.resolve() };
    pending.current = action;
    card.setError(undefined);
    action.promise = (async () => {
      try {
        const completed = await execute(isCurrent);
        if (completed !== false && isCurrent()) {
          onSuccess();
        }
      } catch (error) {
        if (isCurrent()) {
          handleError(error as Error, [], card.setError);
        }
      } finally {
        action.release();
        if (pending.current === action) {
          pending.current = undefined;
        }
      }
    })();
    return action.promise;
  };
  return { run, cancel, canRun, isDisabled: card.isLoading, isLoading: (id: string) => card.loadingMetadata === id };
};

export const useMfaPhoneCodeScreenController = (model: MfaPhoneCodeScreenData, props: MfaPhoneCodeScreenProps) => {
  const wizard = useWizard({ defaultStep: 2 });
  const request = useMfaPhoneRequestController(model);
  const goToStep = (step: number) => {
    if (request.canRun()) {
      request.cancel();
      wizard.goToStep(step);
    }
  };
  const onSuccess = () => {
    if (model.hasBackupCodes) {
      wizard.goToStep(3);
    } else {
      props.onSuccess();
    }
  };
  return {
    wizardProps: wizard.props,
    nextStep: () => goToStep(wizard.props.step + 1),
    goToStep,
    onReset: () => {
      if (request.canRun()) {
        request.cancel();
        props.onReset();
      }
    },
    isLoading: request.isLoading,
    isDisabled: request.isDisabled,
    selectOrEnablePhone: (phone: MfaPhoneData) => {
      if (!request.canRun()) {
        return Promise.resolve();
      }
      if (!phone.isVerified) {
        request.cancel();
        if (model.selectPhone(phone.id)) {
          wizard.goToStep(1);
        }
        return Promise.resolve();
      }
      return request.run(phone.id, canContinue => model.enablePhone(phone.id, canContinue), onSuccess);
    },
    enableSelectedPhone: () =>
      request.run(model.verifyPhone.id, canContinue => model.verifyPhone.enableMfa(canContinue), onSuccess),
  };
};
