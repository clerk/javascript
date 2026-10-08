import { withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useSignInFactorTwoController } from './sign-in-factor-two.controller';
import { useSignInFactorTwoModel } from './sign-in-factor-two.model';
import { SignInFactorTwoView } from './sign-in-factor-two.view';

function SignInFactorTwoInternal(): JSX.Element {
  const model = useSignInFactorTwoModel();
  const controller = useSignInFactorTwoController(model);
  return <SignInFactorTwoView {...controller} />;
}

export const SignInFactorTwo = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInFactorTwoInternal)),
);
