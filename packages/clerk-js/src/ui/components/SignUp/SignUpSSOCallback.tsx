import { SSOCallback, withRedirectToAfterSignUp, withRedirectToTasksAfterSignUp } from '../../common';

export const SignUpSSOCallback = withRedirectToTasksAfterSignUp(withRedirectToAfterSignUp(SSOCallback));
