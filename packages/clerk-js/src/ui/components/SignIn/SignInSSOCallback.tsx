import { SSOCallback, withRedirectToHomeSingleSessionGuard } from '../../common';

export const SignInSSOCallback = withRedirectToHomeSingleSessionGuard(SSOCallback);
