import { ServerGetToken, ServerGetTokenOptions } from '@clerk/types';

type TokenFetcher = (sessionId: string, template: string) => Promise<string>;

type CreateGetToken = (params: {
  sessionId: string;
  cookieToken?: string;
  headerToken?: string;
  fetcher: TokenFetcher;
}) => ServerGetToken;

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
