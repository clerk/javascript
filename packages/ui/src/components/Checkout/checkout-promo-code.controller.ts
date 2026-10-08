import { useReducer } from 'react';

import type {
  useAppliedPromoCodeModel,
  usePromoCodeInputModel,
  usePromoCodeUpdateModel,
} from './checkout-promo-code.model';

type State = { phase: 'idle' | 'loading'; error?: string; value: string };
type Event =
  | { type: 'CHANGE'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'RESULT'; error?: string }
  | { type: 'CLEAR_VALUE' };

const transition = (state: State, event: Event): State => {
  switch (event.type) {
    case 'CHANGE':
      return { ...state, value: event.value, error: undefined };
    case 'SUBMIT':
      return { ...state, phase: 'loading', error: undefined };
    case 'RESULT':
      return { ...state, phase: 'idle', error: event.error };
    case 'CLEAR_VALUE':
      return { ...state, value: '' };
  }
};

const usePromoCodeUpdateController = (model: ReturnType<typeof usePromoCodeUpdateModel>) => {
  const [state, dispatch] = useReducer(transition, { phase: 'idle', value: '' });

  const updatePromoCode = async (value: string) => {
    dispatch({ type: 'SUBMIT' });
    const result = await model.updatePromoCode(value);
    dispatch({ type: 'RESULT', error: result.error });
    return result.success;
  };

  return { state, dispatch, updatePromoCode };
};

export const useAppliedPromoCodeController = (model: ReturnType<typeof useAppliedPromoCodeModel>) => {
  const update = usePromoCodeUpdateController(model);
  return {
    promoCode: model.promoCode,
    description: model.description,
    amount: model.amount,
    removeLabel: model.removeLabel,
    isLoading: update.state.phase === 'loading',
    onRemove: () => void update.updatePromoCode(''),
  };
};

export const usePromoCodeInputController = (model: ReturnType<typeof usePromoCodeInputModel>) => {
  const update = usePromoCodeUpdateController(model);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void update.updatePromoCode(update.state.value.trim()).then(success => {
      if (success) {
        update.dispatch({ type: 'CLEAR_VALUE' });
      }
    });
  };

  return {
    show: model.show,
    placeholder: model.placeholder,
    value: update.state.value,
    error: update.state.error,
    isLoading: update.state.phase === 'loading',
    onChange: (value: string) => update.dispatch({ type: 'CHANGE', value }),
    onSubmit,
  };
};
