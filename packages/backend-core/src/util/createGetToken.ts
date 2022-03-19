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
  return (options: ServerGetTokenOptions = {}) => {
    if (!sessionId) {
      throw new Error('getToken cannot be called without a session.');
    }
    if (options.template) {
      return fetcher(sessionId, options.template);
    }
    return Promise.resolve(headerToken || cookieToken) as Promise<string>;
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
  };
};
