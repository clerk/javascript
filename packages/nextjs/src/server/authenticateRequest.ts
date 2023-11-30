import { clerkClient } from './clerkClient';
import { PUBLISHABLE_KEY, SECRET_KEY } from './constants';
import type { WithAuthOptions } from './types';
import { handleMultiDomainAndProxy } from './utils';

export const authenticateRequest = async (
  req: Request,
  opts: WithAuthOptions,
  // handshakeToken: string | undefined,
) => {
  const { isSatellite, domain, signInUrl, proxyUrl } = handleMultiDomainAndProxy(req, opts);
  return await clerkClient.authenticateRequest({
    ...opts,
    secretKey: opts.secretKey || SECRET_KEY,
    publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
    isSatellite,
    domain,
    signInUrl,
    proxyUrl,
    request: req,
    // handshakeToken,
  });
};

// const decorateResponseWithObservabilityHeaders = (res: NextResponse, requestState: RequestState) => {
//   requestState.message && res.headers.set(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
//   requestState.reason && res.headers.set(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
//   requestState.status && res.headers.set(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
// };
