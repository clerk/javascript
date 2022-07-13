import { ServerGetToken, ServerGetTokenOptions } from '@clerk/types';

/**
 * @internal
 */
type TokenFetcher = (sessionId: string, template: string) => Promise<string>;

/**
 * @internal
 */
type CreateGetToken = (params: {
  sessionId: string | undefined;
  cookieToken: string | undefined;
  headerToken: string | undefined;
  fetcher: TokenFetcher;
}) => ServerGetToken;

/**
 * @internal
 */
export const createGetToken: CreateGetToken = params => {
  const { cookieToken, fetcher, headerToken, sessionId } = params || {};
  return async (options: ServerGetTokenOptions = {}) => {
    if (!sessionId) {
      return null;
    }
    if (options.template) {
      return fetcher(sessionId, options.template);
    }
    return (headerToken || cookieToken) as string;
  };
};

const signedOutGetToken = createGetToken({
  sessionId: undefined,
  cookieToken: undefined,
  headerToken: undefined,
  fetcher: (() => {}) as any,
});

export const createSignedOutState = () => {
  return {
    sessionId: null,
    session: null,
    userId: null,
    user: null,
    getToken: signedOutGetToken,
    claims: null,
    organization: null,
  };
};
