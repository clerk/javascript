import { useReducer } from 'react';

import type { SmsCodeFlowModel } from './sms-code-flow.types';

type Step = 'addPhone' | 'verifyPhone' | 'selectPhone' | 'success';
type Event =
  | 'PHONE_ADDED'
  | 'ADD_RESET'
  | 'PHONE_VERIFIED'
  | 'VERIFY_RESET'
  | 'PHONE_SELECTED'
  | 'ADD_PHONE'
  | 'UNVERIFIED_PHONE';

const stepIndex: Record<Step, number> = { addPhone: 0, verifyPhone: 1, selectPhone: 2, success: 3 };

const transition = (step: Step, event: Event): Step => {
  switch (step) {
    case 'addPhone':
      if (event === 'PHONE_ADDED') {
        return 'verifyPhone';
      }
      if (event === 'ADD_RESET') {
        return 'selectPhone';
      }
      return step;
    case 'verifyPhone':
      if (event === 'PHONE_VERIFIED') {
        return 'success';
      }
      if (event === 'VERIFY_RESET') {
        return 'addPhone';
      }
      return step;
    case 'selectPhone':
      if (event === 'PHONE_SELECTED') {
        return 'success';
      }
      if (event === 'ADD_PHONE') {
        return 'addPhone';
      }
      if (event === 'UNVERIFIED_PHONE') {
        return 'verifyPhone';
      }
      return step;
    case 'success':
      return step;
  }
};

export const useSmsCodeFlowController = (model: SmsCodeFlowModel, onSuccess: () => void, goToStartStep: () => void) => {
  const [step, dispatch] = useReducer(transition, model.hasAvailablePhones ? 'selectPhone' : 'addPhone');

  const transitionIfCurrent = (event: Event) => {
    if (model.canRun()) {
      dispatch(event);
    }
  };
  return {
    wizardProps: { step: stepIndex[step] },
    onAddSuccess: () => transitionIfCurrent('PHONE_ADDED'),
    onAddReset: () => {
      if (model.canRun()) {
        if (model.hasAvailablePhones) {
          dispatch('ADD_RESET');
        } else {
          goToStartStep();
        }
      }
    },
    onVerifySuccess: () => transitionIfCurrent('PHONE_VERIFIED'),
    onVerifyReset: () => transitionIfCurrent('VERIFY_RESET'),
    onSelectSuccess: () => transitionIfCurrent('PHONE_SELECTED'),
    onSelectReset: () => {
      if (model.canRun()) {
        goToStartStep();
      }
    },
    onAddPhoneClick: () => transitionIfCurrent('ADD_PHONE'),
    onUnverifiedPhoneClick: () => transitionIfCurrent('UNVERIFIED_PHONE'),
    onFinish: () => {
      if (model.canRun()) {
        onSuccess();
      }
    },
  };
};
