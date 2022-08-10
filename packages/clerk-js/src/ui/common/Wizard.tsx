import React from 'react';

type WizardProps = React.PropsWithChildren<{
  step: number;
}>;

export const useWizard = (params: { defaultStep?: number } = {}) => {
  const { defaultStep = 0 } = params;
  const [step, setStep] = React.useState(defaultStep);
  const nextStep = React.useCallback(() => setStep(s => s + 1), []);
  const prevStep = React.useCallback(() => setStep(s => s - 1), []);
  const goToStep = React.useCallback((i: number) => setStep(i), []);
  return { nextStep, prevStep, goToStep, props: { step } };
};

export const Wizard = (props: WizardProps) => {
  const { step, children } = props;
  return <>{React.Children.toArray(children)[step]}</>;
};
