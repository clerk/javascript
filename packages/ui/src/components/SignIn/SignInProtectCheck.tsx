import { withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignIn } from '../../common';
import { useSignInProtectCheckController } from './sign-in-protect-check.controller';
import { useSignInProtectCheckModel } from './sign-in-protect-check.model';
import { SignInProtectCheckView } from './sign-in-protect-check.view';

function SignInProtectCheckInternal(): JSX.Element | null {
  const model = useSignInProtectCheckModel();
  const controller = useSignInProtectCheckController(model);
  return <SignInProtectCheckView {...controller} />;
}

export const SignInProtectCheck = withRedirectToAfterSignIn(withCardStateProvider(SignInProtectCheckInternal));
