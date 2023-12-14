import { AuthStatus } from '@clerk/backend/internal';
import type { GetServerDataProps, GetServerDataReturn } from 'gatsby';

import { PUBLISHABLE_KEY, SECRET_KEY } from '../constants';
import { clerkClient } from './clerkClient';
import type { WithServerAuthCallback, WithServerAuthOptions, WithServerAuthResult } from './types';
import { gatsbyPropsToRequest, injectAuthIntoContext, injectSSRStateIntoProps, sanitizeAuthObject } from './utils';

interface WithServerAuth {
  <CallbackReturn extends GetServerDataReturn, Options extends WithServerAuthOptions>(
    callback: WithServerAuthCallback<CallbackReturn, Options>,
    opts?: Options,
  ): WithServerAuthResult<CallbackReturn>;
  (opts?: WithServerAuthOptions): GetServerDataReturn<void>;
}

export const withServerAuth: WithServerAuth = (cbOrOptions: any, options?: any): any => {
  const callback = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts = (options ? options : typeof cbOrOptions !== 'function' ? cbOrOptions : {}) || {};

  return async (props: GetServerDataProps) => {
    const req = gatsbyPropsToRequest(props);
    const requestState = await clerkClient.authenticateRequest(req, {
      ...opts,
      secretKey: SECRET_KEY,
      publishableKey: PUBLISHABLE_KEY,
      request: req,
    });

    if (requestState.status === AuthStatus.Handshake) {
      // @TODO handle handshake
      return;
    }

    const contextWithAuth = injectAuthIntoContext(props, requestState.toAuth());
    const callbackResult = (await callback?.(contextWithAuth)) || {};
    return injectSSRStateIntoProps(callbackResult, { __clerk_ssr_state: sanitizeAuthObject(contextWithAuth.auth) });
  };
};
