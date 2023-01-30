import { SSOCallback, withRedirectToHomeSingleSessionGuard } from '../../common';

export const SignUpSSOCallback = withRedirectToHomeSingleSessionGuard(SSOCallback);
