import { SSOCallback, withRedirectToAfterSignIn, withRedirectToTasks } from '../../common';

export const SignInSSOCallback = withRedirectToTasks(withRedirectToAfterSignIn(SSOCallback));
