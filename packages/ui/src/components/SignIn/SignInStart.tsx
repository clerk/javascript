import { withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useSignInStartController } from './sign-in-start.controller';
import { useSignInStartModel } from './sign-in-start.model';
import { SignInStartView } from './sign-in-start.view';

function SignInStartInternal(): JSX.Element {
  const model = useSignInStartModel();
  const controller = useSignInStartController(model);
  return <SignInStartView {...controller} />;
}

export const SignInStart = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInStartInternal)),
);
