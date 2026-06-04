import type {
  DecorateUrl,
  HandleOAuthCallbackParams,
  LoadedClerk,
  SessionResource,
  SignInResource,
  SignUpResource,
} from '@clerk/shared/types';

import type { RouteContextValue } from '../router/RouteContext';

type NativeRedirectResource = SignInResource | SignUpResource;

type FinalizeNativeRedirectResultParams = {
  clerk: LoadedClerk;
  handleRedirectCallbackParams: HandleOAuthCallbackParams;
  navigate: RouteContextValue['navigate'];
  navigateOnSetActive: (opts: {
    session: SessionResource;
    redirectUrl: string;
    decorateUrl: DecorateUrl;
  }) => Promise<unknown>;
  redirectUrlComplete: string;
  resource: NativeRedirectResource;
};

export function finalizeNativeRedirectResult({
  clerk,
  handleRedirectCallbackParams,
  navigate,
  navigateOnSetActive,
  redirectUrlComplete,
  resource,
}: FinalizeNativeRedirectResultParams) {
  const completedSessionId = resource.status === 'complete' ? resource.createdSessionId : null;

  if (completedSessionId) {
    return clerk.setActive({
      session: completedSessionId,
      navigate: async ({ session, decorateUrl }) => {
        await navigateOnSetActive({ session, redirectUrl: redirectUrlComplete, decorateUrl });
      },
    });
  }

  return clerk.handleRedirectCallback(handleRedirectCallbackParams, navigate);
}
