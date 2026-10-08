import { withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useSignInClientTrustController } from './sign-in-client-trust.controller';
import { useSignInClientTrustModel } from './sign-in-client-trust.model';
import { SignInClientTrustView } from './sign-in-client-trust.view';

function SignInClientTrustInternal(): JSX.Element {
  const model = useSignInClientTrustModel();
  const controller = useSignInClientTrustController(model);
  return <SignInClientTrustView {...controller} />;
}

export const SignInClientTrust = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInClientTrustInternal)),
);
