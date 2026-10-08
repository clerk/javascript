import { useEffect, useRef } from 'react';

import { useCardState } from '@/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { SmsCodeFlowModel } from './sms-code-flow.types';

export const useSmsPhoneSelectionController = (
  model: SmsCodeFlowModel,
  onSuccess: () => void,
  onReset: () => void,
  onAddPhoneClick: () => void,
  onUnverifiedPhoneClick: () => void,
) => {
  const card = useCardState();
  const latest = useRef({ model, onSuccess, onReset, onAddPhoneClick, onUnverifiedPhoneClick, card });
  latest.current = { model, onSuccess, onReset, onAddPhoneClick, onUnverifiedPhoneClick, card };
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  const release = useRef<() => void>();
  const finished = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      release.current?.();
      release.current = undefined;
    };
  }, []);
  const canRun = () => mounted.current && latest.current.model.canRun() && !finished.current;
  const navigate = (action: () => void) => {
    if (canRun() && !pending.current && !latest.current.card.isLoading) {
      finished.current = true;
      action();
    }
  };
  const onSelect = (id: string): Promise<void> => {
    if (!canRun() || pending.current) {
      return pending.current ?? Promise.resolve();
    }
    const phone = latest.current.model.phones.find(phone => phone.id === id);
    if (!phone || latest.current.card.isLoading) {
      return Promise.resolve();
    }
    if (!phone.isVerified) {
      if (latest.current.model.selectUnverifiedPhone(id)) {
        finished.current = true;
        latest.current.onUnverifiedPhoneClick();
      }
      return Promise.resolve();
    }
    const done = latest.current.card.beginRequest(id);
    if (!done) {
      return Promise.resolve();
    }
    release.current = done;
    latest.current.card.setError(undefined);
    const action = Promise.resolve()
      .then(async () => {
        if (!canRun()) {
          return;
        }
        try {
          if ((await latest.current.model.enableVerifiedPhone(id, canRun)) && canRun()) {
            finished.current = true;
            latest.current.onSuccess();
          }
        } catch (error) {
          if (canRun()) {
            handleError(error as Error, [], latest.current.card.setError);
          }
        }
      })
      .finally(() => {
        if (pending.current === action) {
          pending.current = undefined;
          release.current = undefined;
        }
        done();
      });
    pending.current = action;
    return action;
  };
  return {
    hasUser: model.hasUser,
    phones: model.phones.map(({ id, flag, formattedPhone }) => ({
      id,
      flag,
      formattedPhone,
      isLoading: card.loadingMetadata === id,
    })),
    error: card.error,
    onSelect,
    onReset: () => navigate(latest.current.onReset),
    onAddPhoneClick: () => navigate(latest.current.onAddPhoneClick),
  };
};
