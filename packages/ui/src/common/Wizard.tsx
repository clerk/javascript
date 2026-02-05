import React from 'react';

import { Animated } from '../elements/Animated';

type WizardProps = React.PropsWithChildren<{
  step: number;
  animate?: boolean;
}>;

type UseWizardProps = {
  defaultStep?: number;
  onNextStep?: () => void;
};

export const useWizard = (params: UseWizardProps = {}) => {
  const { defaultStep = 0, onNextStep } = params;
  const [step, setStep] = React.useState(defaultStep);

  const nextStep = React.useCallback(() => {
    onNextStep?.();
    setStep((s: number) => s + 1);
  }, []);

  const prevStep = React.useCallback(() => setStep(s => s - 1), []);
  const goToStep = React.useCallback((i: number) => setStep(i), []);
  return { nextStep, prevStep, goToStep, props: { step } };
};

export const Wizard = (props: WizardProps) => {
  const { step, children, animate = true } = props;

  if (!animate) {
    return React.Children.toArray(children)[step];
  }

  return <Animated>{React.Children.toArray(children)[step]}</Animated>;
};
