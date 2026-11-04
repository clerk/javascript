import { isVirtualRouterPath } from '@clerk/shared/internal/clerk-js/url';
import { useClerk } from '@clerk/shared/react';
import type { SignOutCallback } from '@clerk/shared/types';

import { hashRouterBase, useRouter } from '../router';
import { isInternalRoute } from '../router/BaseRouter';

export const useSignOutWithRedirect = () => {
  const clerk = useClerk();
  const { resolve, basePath } = useRouter();

  return (callback?: SignOutCallback, redirectUrl?: string) => {
    let repairRedirectUrl: string | undefined;
    if (callback && redirectUrl && clerk.isSatellite && typeof window !== 'undefined' && window.location) {
      try {
        const target = resolve(redirectUrl);
        if (
          target.protocol === 'https:' &&
          !isInternalRoute(target, basePath) &&
          !isVirtualRouterPath(target.pathname) &&
          !target.pathname.startsWith('/' + hashRouterBase)
        ) {
          repairRedirectUrl = target.href;
        }
      } catch {
        repairRedirectUrl = undefined;
      }
    }

    return repairRedirectUrl
      ? clerk.signOut(callback, { __internal_satelliteSignOutRedirectUrl: repairRedirectUrl })
      : clerk.signOut(callback);
  };
};
