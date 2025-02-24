import { SSOCallback, withRedirectToAfterSignUp, withRedirectToTasks } from '../../common';

export const SignUpSSOCallback = withRedirectToTasks(withRedirectToAfterSignUp(SSOCallback));
