import { useAuth as useAuthBase } from '@clerk/react';
import { isNetworkError } from '@clerk/shared/error';
import type { GetToken, GetTokenOptions, UseAuthReturn } from '@clerk/shared/types';

import { SessionJWTCache } from '../cache';

/*
 * This hook extends the useAuth hook to add experimental JWT caching.
 * The caching is used only when no options are passed to getToken.
 */
export const useAuth = (initialAuthState?: any): UseAuthReturn => {
  const { getToken: getTokenBase, ...rest } = useAuthBase(initialAuthState);

  const getToken: GetToken = (opts?: GetTokenOptions): Promise<string | null> =>
    getTokenBase(opts)
      .then(token => {
        if (!opts && SessionJWTCache.checkInit()) {
          if (token) {
            void SessionJWTCache.save(token);
          } else {
            void SessionJWTCache.remove();
          }
        }
        return token;
      })
      .catch(error => {
        if (!opts && SessionJWTCache.checkInit() && isNetworkError(error)) {
          return SessionJWTCache.load();
        }
        throw error;
      });

  return { ...rest, getToken };
};
