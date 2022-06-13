import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { SSOCallback } from '../common';
import { withFlowCardContext } from '../elements';

export const SignInSSOCallback = withRedirectToHome(
  withFlowCardContext(SSOCallback, { flow: 'signIn', page: 'ssoCallback' }),
);
