import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { SSOCallback } from '../common';

export const SignInSSOCallback = withRedirectToHome(SSOCallback);
