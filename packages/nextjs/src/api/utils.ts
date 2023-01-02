import type { NextApiRequest, NextApiResponse } from 'next';

import { API_KEY, API_URL, AuthObject, clerkClient, FRONTEND_API, RequestState } from '../server';
import { constants } from '../server/constants';

export type LegacyAuthObject<T extends AuthObject> = Pick<T, 'sessionId' | 'userId' | 'actor' | 'getToken'> & {
  claims: AuthObject['sessionClaims'];
};

// https://nextjs.org/docs/api-routes/api-middlewares#connectexpress-middleware-support
export function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: (...args: any) => any) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    void fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const authenticateRequest = (req: NextApiRequest, options?: any) => {
  const { jwtKey, authorizedParties } = options || {};
  return clerkClient.authenticateRequest({
    apiKey: API_KEY,
    frontendApi: FRONTEND_API,
    jwtKey,
    authorizedParties,
    cookieToken: req.cookies[constants.Cookies.Session] || '',
    headerToken: req.headers[constants.Headers.Authorization]?.replace('Bearer ', '') || '',
    clientUat: req.cookies[constants.Cookies.ClientUat] || '',
    host: req.headers.host as string,
    forwardedPort: req.headers[constants.Headers.ForwardedPort] as string,
    forwardedHost: req.headers[constants.Headers.ForwardedHost] as string,
    referrer: req.headers.referer,
    userAgent: req.headers['user-agent'] as string,
  });
};

export const handleInterstitialCase = async (res: NextApiResponse<any>, requestState: RequestState) => {
  if (requestState.isInterstitial) {
    res.setHeader(constants.Headers.AuthMessage, requestState.message);
    res.setHeader(constants.Headers.AuthReason, requestState.reason);
    res.writeHead(401, { 'Content-Type': 'text/html' });
    res.end(await clerkClient.remotePublicInterstitial({ apiUrl: API_URL, frontendApi: FRONTEND_API }));
  }
};
