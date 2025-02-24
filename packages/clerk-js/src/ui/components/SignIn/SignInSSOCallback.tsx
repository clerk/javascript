import { SSOCallback, withRedirectToAfterSignIn, withRedirectToTasksAfterSignIn } from '../../common';

export const SignInSSOCallback = withRedirectToTasksAfterSignIn(withRedirectToAfterSignIn(SSOCallback));
