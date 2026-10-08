import { useEffect, useReducer, useRef, useState } from 'react';

import { useWizard } from '@/common';
import { localizationKeys } from '@/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { AddDomainFormData, AddDomainFormModel } from './add-domain-form.types';

type DomainState = { phase: 'editing' | 'creating' | 'verifying'; domainId: string; verified: boolean };
type DomainEvent = { type: 'CREATE' } | { type: 'ERROR' } | { type: 'VERIFY'; domainId: string; verified: boolean };

const transition = (state: DomainState, event: DomainEvent): DomainState => {
  switch (event.type) {
    case 'CREATE':
      return { ...state, phase: 'creating' };
    case 'ERROR':
      return { ...state, phase: 'editing' };
    case 'VERIFY':
      return { phase: 'verifying', domainId: event.domainId, verified: state.verified || event.verified };
  }
};

export const useAddDomainFormController = (model: AddDomainFormModel, onSuccess: () => void): AddDomainFormData => {
  const card = useCardState();
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });
  const [state, send] = useReducer(transition, { phase: 'editing', domainId: '', verified: false });
  const [isPending, setIsPending] = useState(false);
  const pendingAction = useRef<Promise<void> | null>(null);
  const completed = useRef(false);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationDomain'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationDomain'),
  });

  const run = (effect: () => Promise<void>): Promise<void> => {
    if (!isMounted.current || completed.current) {
      return Promise.resolve();
    }
    if (pendingAction.current) {
      return pendingAction.current;
    }
    setIsPending(true);
    card.setError(undefined);
    const pending = (async () => effect())()
      .catch(error => {
        if (isMounted.current) {
          if (state.phase !== 'verifying') {
            send({ type: 'ERROR' });
          }
          handleError(error, [nameField], card.setError);
        }
      })
      .finally(() => {
        pendingAction.current = null;
        if (isMounted.current) {
          setIsPending(false);
        }
      });
    pendingAction.current = pending;
    return pending;
  };

  const onSubmit = (): Promise<void> => {
    if (!nameField.value.trim() || state.phase === 'verifying') {
      return Promise.resolve();
    }
    return run(async () => {
      nameField.clearFeedback();
      send({ type: 'CREATE' });
      const result = await model.createDomain(nameField.value);
      if (!isMounted.current) {
        return;
      }
      if (!result) {
        send({ type: 'ERROR' });
        return;
      }
      send({ type: 'VERIFY', domainId: result.id, verified: result.isVerified });
      wizard.nextStep();
    });
  };

  const onVerifySuccess = (): Promise<void> => {
    if (!state.domainId) {
      return Promise.resolve();
    }
    return run(async () => {
      const refreshed = await model.refreshDomains();
      if (refreshed && isMounted.current) {
        completed.current = true;
        onSuccess();
      }
    });
  };

  return {
    wizardProps: wizard.props,
    nameField,
    isPending,
    canSubmit: nameField.value.trim() !== '' && !isPending && state.phase === 'editing',
    domainId: state.domainId,
    verified: state.verified,
    onSubmit,
    onVerifySuccess,
  };
};
