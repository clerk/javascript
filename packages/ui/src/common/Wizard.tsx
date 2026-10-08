import React from 'react';

import { Animated } from '../elements/Animated';

export { useWizard } from './wizard.controller';

type WizardProps = React.PropsWithChildren<{
  step: number;
  animate?: boolean;
}>;

export const Wizard = (props: WizardProps) => {
  const { step, children, animate = true } = props;

  if (!animate) {
    return React.Children.toArray(children)[step];
  }

  return <Animated>{React.Children.toArray(children)[step]}</Animated>;
};
