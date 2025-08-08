import {
  SSOCallback,
  withRedirectToAfterSignUp,
  withRedirectToSignUpTask,
  withRedirectToSignUpTask,
} from '../../common';

export const SignUpSSOCallback = withRedirectToSignUpTask(withRedirectToAfterSignUp(SSOCallback));
