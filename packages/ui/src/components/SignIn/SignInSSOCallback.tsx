import { SSOCallback, withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';

export const SignInSSOCallback = withRedirectToSignInTask(withRedirectToAfterSignIn(SSOCallback));
