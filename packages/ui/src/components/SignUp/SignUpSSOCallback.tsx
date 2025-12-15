import { SSOCallback, withRedirectToAfterSignUp, withRedirectToSignUpTask } from '../../common';

export const SignUpSSOCallback = withRedirectToSignUpTask(withRedirectToAfterSignUp(SSOCallback));
