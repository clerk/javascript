import { SSOCallback } from '../../common';
import { withRedirectToHome } from '../../common/withRedirectToHome';

export const SignInSSOCallback = withRedirectToHome(SSOCallback, 'singleSession');
