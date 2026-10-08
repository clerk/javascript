import type { SignInSecondFactor } from '@clerk/shared/types';
import type React from 'react';

import { useSignInFactorTwoAlternativeMethodsController } from './sign-in-factor-two-alternative-methods.controller';
import { useSignInFactorTwoAlternativeMethodsModel } from './sign-in-factor-two-alternative-methods.model';
import { SignInFactorTwoAlternativeMethodsView } from './sign-in-factor-two-alternative-methods.view';

export { getButtonLabel } from './sign-in-factor-two-alternative-methods.layout';

export type AlternativeMethodsProps = {
  onBackLinkClick: React.MouseEventHandler | undefined;
  onFactorSelected: (factor: SignInSecondFactor) => void;
};

export const SignInFactorTwoAlternativeMethods = (props: AlternativeMethodsProps) => {
  const model = useSignInFactorTwoAlternativeMethodsModel();
  const controller = useSignInFactorTwoAlternativeMethodsController(model, props);
  return <SignInFactorTwoAlternativeMethodsView {...controller} />;
};
