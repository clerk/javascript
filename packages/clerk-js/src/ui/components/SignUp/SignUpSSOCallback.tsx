import { SSOCallback } from '../../common';
import { withRedirectToHome } from '../../common/withRedirectToHome';

export const SignUpSSOCallback = withRedirectToHome(SSOCallback, 'signUp');
