import { useReducer } from 'react';

type SuggestionState = { isDismissed: boolean; isSubmitting: boolean };
type SuggestionEvent = 'submit' | 'submitted' | 'settle' | 'dismiss';

const reduceSuggestion = (state: SuggestionState, event: SuggestionEvent): SuggestionState => {
  switch (event) {
    case 'submit':
      return { ...state, isSubmitting: true };
    case 'submitted':
      return { ...state, isDismissed: true };
    case 'settle':
      return { ...state, isSubmitting: false };
    case 'dismiss':
      return { ...state, isDismissed: true };
  }
};

export const useDomainSuggestionController = (domain: string | null, onSubmit: (domain: string) => Promise<void>) => {
  const [state, dispatch] = useReducer(reduceSuggestion, { isDismissed: false, isSubmitting: false });
  const handleAdd = () => {
    if (!domain) {
      return;
    }
    dispatch('submit');
    void onSubmit(domain)
      .then(() => dispatch('submitted'))
      .finally(() => dispatch('settle'));
  };
  const dismiss = () => dispatch('dismiss');
  return { isDismissed: state.isDismissed, isSubmitting: state.isSubmitting, handleAdd, dismiss };
};
