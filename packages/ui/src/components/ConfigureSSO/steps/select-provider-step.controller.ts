import { useReducer } from 'react';

import { useCardState } from '@/elements/contexts';
import { getFieldError, getGlobalError, handleError } from '@/utils/errorHandler';

import { providerLabel } from '../domain/providers';
import { useWizard } from '../elements/Wizard';
import type { ProviderType } from '../types';
import type { useSelectProviderStepModel } from './select-provider-step.model';

type SelectionState = {
  selected: ProviderType | null;
  isSubmitting: boolean;
  isChangeDialogOpen: boolean;
  changeFromProvider: ProviderType | null;
};

type SelectionEvent =
  | { type: 'select'; provider: ProviderType }
  | { type: 'openChange'; provider: ProviderType | null }
  | { type: 'closeChange' }
  | { type: 'startSubmit' }
  | { type: 'createFailed' }
  | { type: 'changeFailed' };

const reduceSelection = (state: SelectionState, event: SelectionEvent): SelectionState => {
  switch (event.type) {
    case 'select':
      return { ...state, selected: event.provider };
    case 'openChange':
      return { ...state, changeFromProvider: event.provider, isChangeDialogOpen: true };
    case 'closeChange':
      return { ...state, changeFromProvider: null, isChangeDialogOpen: false };
    case 'startSubmit':
      return { ...state, isSubmitting: true };
    case 'createFailed':
      return { ...state, isSubmitting: false };
    case 'changeFailed':
      return { ...state, isSubmitting: false, isChangeDialogOpen: false, changeFromProvider: null };
  }
};

export const useSelectProviderStepController = (model: ReturnType<typeof useSelectProviderStepModel>) => {
  const { goNext, goPrev, isFirstStep } = useWizard();
  const card = useCardState();
  const [state, dispatch] = useReducer(reduceSelection, {
    selected: model.currentCard,
    isSubmitting: false,
    isChangeDialogOpen: false,
    changeFromProvider: null,
  });

  const handleSelect = (next: ProviderType) => dispatch({ type: 'select', provider: next });
  const isChangingProvider = model.hasConnection && state.selected !== null && state.selected !== model.currentCard;

  // FAPI reports a domain another connection already authenticates as a field
  // error on `domains`. This step has no domains field, so it surfaces as the
  // step's alert instead of vanishing.
  const handleCreateError = (err: Error) => {
    handleError(err, [], card.setError);
    const fieldError = getFieldError(err);
    if (fieldError && !getGlobalError(err)) {
      card.setError(fieldError);
    }
  };

  const handleContinue = async (): Promise<void> => {
    if (!state.selected) {
      return;
    }
    if (model.hasConnection && state.selected === model.currentCard) {
      void goNext();
      return;
    }
    if (isChangingProvider) {
      dispatch({ type: 'openChange', provider: model.currentCard });
      return;
    }
    card.setError(undefined);
    dispatch({ type: 'startSubmit' });
    try {
      await model.createConnection(state.selected);
      void goNext();
    } catch (err) {
      handleCreateError(err as Error);
      dispatch({ type: 'createFailed' });
    }
  };

  const handleConfirmChangeProvider = async (): Promise<void> => {
    if (!state.selected) {
      return;
    }
    card.setError(undefined);
    dispatch({ type: 'startSubmit' });
    try {
      await model.confirmChange(state.selected);
      void goNext();
    } catch (err) {
      handleCreateError(err as Error);
      dispatch({ type: 'changeFailed' });
    }
  };

  return {
    selected: state.selected,
    isSubmitting: state.isSubmitting,
    isChangeDialogOpen: state.isChangeDialogOpen,
    currentProviderLabel: state.changeFromProvider ? providerLabel(state.changeFromProvider) : undefined,
    nextProviderLabel: state.selected ? providerLabel(state.selected) : undefined,
    error: card.error,
    isFirstStep,
    goPrev,
    handleSelect,
    handleContinue,
    closeChangeDialog: () => dispatch({ type: 'closeChange' }),
    handleConfirmChangeProvider,
  };
};
