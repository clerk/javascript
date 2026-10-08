import { withCardStateProvider } from '@/ui/elements/contexts';

import { withRedirectToAfterSignIn } from '../../common';
import { useSignInAccountSwitcherController } from './sign-in-account-switcher.controller';
import { useSignInAccountSwitcherModel } from './sign-in-account-switcher.model';
import { SignInAccountSwitcherView } from './sign-in-account-switcher.view';

const SignInAccountSwitcherInternal = () => {
  const model = useSignInAccountSwitcherModel();
  const controller = useSignInAccountSwitcherController(model);
  return <SignInAccountSwitcherView {...controller} />;
};

export const SignInAccountSwitcher = withRedirectToAfterSignIn(withCardStateProvider(SignInAccountSwitcherInternal));
