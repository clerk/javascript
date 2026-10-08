import { withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useSignInFactorOneController } from './sign-in-factor-one.controller';
import { useSignInFactorOneModel } from './sign-in-factor-one.model';
import { SignInFactorOneView } from './sign-in-factor-one.view';

function SignInFactorOneInternal(): JSX.Element {
  const model = useSignInFactorOneModel();
  const controller = useSignInFactorOneController(model);
  return <SignInFactorOneView {...controller} />;
}

export const SignInFactorOne = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInFactorOneInternal)),
);
