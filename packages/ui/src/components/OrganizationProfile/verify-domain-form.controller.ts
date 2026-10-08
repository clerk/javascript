import { useEffect, useRef, useState } from 'react';

import { localizationKeys } from '@/customizables';
import { useFieldOTP } from '@/ui/elements/CodeControl';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { VerifyDomainFormData, VerifyDomainFormModel } from './verify-domain-form.types';

type VerifyDomainPhase = 'email' | 'preparing' | 'code' | 'verifying' | 'verified';

type VerifyState = {
  scope: string;
  phase: VerifyDomainPhase;
  pending: 'prepare' | 'verify' | 'resend' | null;
  verificationEmail: string;
};

export const useVerifyDomainFormController = (
  model: VerifyDomainFormModel,
  skipToVerified: boolean,
  onSuccess?: () => void,
): VerifyDomainFormData => {
  const card = useCardState();
  const initialState: VerifyState = {
    scope: model.scope,
    phase: skipToVerified ? 'verified' : 'email',
    pending: null,
    verificationEmail: '',
  };
  const [storedState, setStoredState] = useState(initialState);
  const state = storedState.scope === model.scope ? storedState : initialState;
  const stateRef = useRef(state);
  stateRef.current = state;
  const current = useRef({ scope: model.scope, generation: {}, pending: undefined as Promise<void> | undefined });
  if (current.current.scope !== model.scope) {
    current.current = { scope: model.scope, generation: {}, pending: undefined };
  }
  const owner = current.current;
  const latest = useRef({ model, card, onSuccess });
  latest.current = { model, card, onSuccess };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
      owner.pending = undefined;
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();
  const updateState = (update: (state: VerifyState) => VerifyState) => {
    const next = update(stateRef.current);
    stateRef.current = next;
    setStoredState(next);
  };
  const run = (
    action: NonNullable<VerifyState['pending']>,
    effect: (isCurrent: () => boolean) => Promise<void>,
  ): Promise<void> => {
    if (
      !canRun() ||
      latest.current.model.isLoading ||
      latest.current.model.errorMessage ||
      !latest.current.model.hasDomain
    ) {
      return Promise.resolve();
    }
    if (owner.pending) {
      return owner.pending;
    }
    const expectedPhase = action === 'prepare' ? 'email' : 'code';
    if (stateRef.current.phase !== expectedPhase) {
      return Promise.resolve();
    }
    const generation = owner.generation;
    const isCurrent = () => canRun() && owner.generation === generation;
    updateState(state => ({
      ...state,
      pending: action,
      phase: action === 'prepare' ? 'preparing' : action === 'verify' ? 'verifying' : 'code',
    }));
    latest.current.card.setError(undefined);
    const pending = Promise.resolve()
      .then(() => (isCurrent() ? effect(isCurrent) : undefined))
      .finally(() => {
        if (owner.pending === pending) {
          owner.pending = undefined;
        }
        if (isCurrent()) {
          updateState(state => ({
            ...state,
            pending: null,
            phase: state.phase === 'preparing' ? 'email' : state.phase === 'verifying' ? 'code' : state.phase,
          }));
        }
      });
    owner.pending = pending;
    return pending;
  };
  const emailField = useFormControl('affiliationEmailAddress', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationDomainEmailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationDomainEmailAddress'),
    infoText: localizationKeys('formFieldLabel__organizationDomainEmailAddressDescription'),
    isRequired: true,
  });
  const emailDomainSuffix = `@${model.domainName}`;
  const isPending = state.pending !== null;

  const otp = useFieldOTP({
    isLoading: isPending,
    onCodeEntryFinished: (code, resolve, reject) => {
      void run('verify', async isCurrent => {
        try {
          const verified = await latest.current.model.attempt(code, isCurrent);
          if (verified !== undefined && isCurrent()) {
            await resolve();
            if (!isCurrent()) {
              return;
            }
            updateState(state => ({ ...state, phase: verified ? 'verified' : 'code' }));
            if (!verified) {
              latest.current.onSuccess?.();
            }
          }
        } catch (error) {
          if (isCurrent()) {
            updateState(state => ({ ...state, phase: 'code' }));
            await reject(error);
          }
        }
      });
    },
    onResendCodeClicked: () => {
      void run('resend', async isCurrent => {
        try {
          await latest.current.model.prepare(stateRef.current.verificationEmail, isCurrent);
        } catch (error) {
          if (isCurrent()) {
            handleError(error as Error, [emailField], latest.current.card.setError);
          }
        }
      });
    },
  });

  const onSubmitPrepare = (): Promise<void> => {
    if (!emailField.value.trim()) {
      return Promise.resolve();
    }
    const verificationEmail = `${emailField.value}${emailDomainSuffix}`;
    return run('prepare', async isCurrent => {
      emailField.clearFeedback();
      updateState(state => ({ ...state, verificationEmail }));
      try {
        const prepared = await latest.current.model.prepare(verificationEmail, isCurrent);
        if (isCurrent()) {
          updateState(state => ({ ...state, phase: prepared ? 'code' : 'email' }));
        }
      } catch (error) {
        if (isCurrent()) {
          updateState(state => ({ ...state, phase: 'email' }));
          handleError(error as Error, [emailField], latest.current.card.setError);
        }
      }
    });
  };

  const onBack = () => {
    if (!canRun() || owner.pending || stateRef.current.phase !== 'code') {
      return;
    }
    otp.otpControl.otpInputProps.clearFeedback();
    otp.otpControl.reset();
    updateState(state => ({ ...state, phase: 'email', verificationEmail: '' }));
  };

  return {
    wizardProps: {
      step: state.phase === 'verified' ? 2 : state.phase === 'code' || state.phase === 'verifying' ? 1 : 0,
    },
    errorMessage: model.errorMessage,
    retry: () => {
      if (canRun() && !owner.pending) {
        latest.current.model.retry();
      }
    },
    emailField,
    otp: {
      ...otp,
      isLoading: isPending,
      isDisabled: isPending,
      onResendCode: otp.onResendCode
        ? event => {
            if (canRun() && !owner.pending && stateRef.current.phase === 'code') {
              otp.onResendCode?.(event);
            }
          }
        : undefined,
      onFakeContinue: () => {
        if (canRun() && !owner.pending && stateRef.current.phase === 'code') {
          otp.onFakeContinue();
        }
      },
    },
    canSubmit:
      canRun() &&
      model.hasDomain &&
      !model.isLoading &&
      !model.errorMessage &&
      state.phase === 'email' &&
      !!emailField.value.trim() &&
      !isPending,
    emailDomainSuffix,
    domainName: model.domainName,
    verificationEmail: state.verificationEmail,
    onSubmitPrepare,
    onBack,
  };
};
