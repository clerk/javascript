import React from 'react';

export type WizardProps = {
  children: React.ReactElement[];
  defaultStep?: number;
};

export function Wizard({
  children = [],
  defaultStep = 0,
}: WizardProps): JSX.Element | null {
  const [step, setStep] = React.useState(defaultStep);

  React.useEffect(() => {
    setStep(defaultStep);
  }, [defaultStep, setStep]);

  if (children.length < 2) {
    return null;
  }

  return children[step];
}
