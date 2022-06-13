import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { SSOCallback } from '../common';
import { withFlowCardContext } from '../elements';

export const SignUpSSOCallback = withRedirectToHome(
  withFlowCardContext(SSOCallback, { flow: 'signUp', page: 'ssoCallback' }),
);
