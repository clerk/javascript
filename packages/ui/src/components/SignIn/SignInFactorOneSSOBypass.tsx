import type { EmailCodeFactor } from '@clerk/shared/types';

import { useSignInFactorOneSSOBypassController } from './sign-in-factor-one-sso-bypass.controller';
import { useSignInFactorOneSSOBypassModel } from './sign-in-factor-one-sso-bypass.model';
import { SignInFactorOneSSOBypassView } from './sign-in-factor-one-sso-bypass.view';

type SignInFactorOneSSOBypassProps = {
  bypassFactor: EmailCodeFactor;
};

/**
 * Enterprise-routed sign-in for a user the instance has allowlisted for a bypass.
 *
 * Replaces the automatic redirect to the identity provider with a screen the user can act on,
 * since the bypass is only reachable from one.
 * @experimental
 */
export const SignInFactorOneSSOBypass = (props: SignInFactorOneSSOBypassProps) => {
  const model = useSignInFactorOneSSOBypassModel();
  const controller = useSignInFactorOneSSOBypassController(model);
  return (
    <SignInFactorOneSSOBypassView
      {...controller}
      bypassFactor={props.bypassFactor}
    />
  );
};
