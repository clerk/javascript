import type { ClerkBackendAPI } from '@clerk/backend-core';
import { createGetToken } from '@clerk/backend-core';
import { ServerResponse } from 'http';

type SessionsApi = InstanceType<typeof ClerkBackendAPI>['sessions'];

export function createGetAuth(sessionsApi: SessionsApi) {
  return function (res: ServerResponse) {
    const authHeader = res.getHeader('clerk-auth-middleware');
    res.removeHeader('clerk-auth-middleware');
    if (!authHeader) {
      throw 'You need to use "runClerkMiddleware" on your Next.js middleware file.';
    }

    const authData = JSON.parse(authHeader as string);
    return {
      ...authData,
      getToken: createGetToken({
        headerToken: authData.headerToken,
        cookieToken: authData.cookieToken,
        sessionId: authData.sessionId,
        fetcher: (...args) => sessionsApi.getToken(...args),
      }),
      headerToken: undefined,
      cookieToken: undefined,
    };
  };
}
