import { useCallback, useReducer, useRef } from 'react';

type WizardState = { step: number };
type WizardEvent = { type: 'NEXT' } | { type: 'BACK' } | { type: 'GO_TO'; step: number };

type UseWizardProps = {
  defaultStep?: number;
  onNextStep?: () => void;
};

const transition = (state: WizardState, event: WizardEvent): WizardState => {
  switch (event.type) {
    case 'NEXT':
      return { step: state.step + 1 };
    case 'BACK':
      return { step: state.step - 1 };
    case 'GO_TO':
      return { step: event.step };
  }
};

export const useWizard = (params: UseWizardProps = {}) => {
  const { defaultStep = 0, onNextStep } = params;
  const [state, send] = useReducer(transition, { step: defaultStep });
  const initialOnNextStep = useRef(onNextStep);

  const nextStep = useCallback(() => {
    initialOnNextStep.current?.();
    send({ type: 'NEXT' });
  }, []);
  const prevStep = useCallback(() => send({ type: 'BACK' }), []);
  const goToStep = useCallback((step: number) => send({ type: 'GO_TO', step }), []);

  return { nextStep, prevStep, goToStep, props: state };
};
