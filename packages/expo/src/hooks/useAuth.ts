import { useAuth as useAuthBase } from '@clerk/clerk-react';
import { is4xxError } from '@clerk/shared/error';
import type { GetToken, GetTokenOptions, UseAuthReturn } from '@clerk/types';

import { SessionJWTCache } from '../cache';

export const useAuth = (initialAuthState?: any): UseAuthReturn => {
  const { getToken: getTokenBase, ...rest } = useAuthBase(initialAuthState);

  const getToken: GetToken = (opts?: GetTokenOptions): Promise<string | null> =>
    getTokenBase(opts)
      .then(token => {
        if (SessionJWTCache.checkInit()) {
          if (token) {
            void SessionJWTCache.save(token);
          } else {
            void SessionJWTCache.remove();
          }
        }
        return token;
      })
      .catch(error => {
        if (SessionJWTCache.checkInit() && !is4xxError(error)) {
          return SessionJWTCache.load();
        }
        throw error;
      });

  return { ...rest, getToken };
};
