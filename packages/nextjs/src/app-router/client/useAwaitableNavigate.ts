'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

type NavigateFunction = ReturnType<typeof useRouter>['push'];

declare global {
  interface Window {
    __clerk_nav_ref: NavigateFunction;
    __clerk_nav_resolves_ref: Array<(val?: any) => any> | undefined;
  }
}

export const useAwaitableNavigate = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { push } = useRouter();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.__clerk_nav_ref = (to, opts) => {
      if (to === window.location.href.replace(window.location.origin, '')) {
        push(to, opts);
        return Promise.resolve();
      }

      return new Promise<void>(res => {
        if (window.__clerk_nav_resolves_ref) {
          window.__clerk_nav_resolves_ref.push(res);
        } else {
          window.__clerk_nav_resolves_ref = [res];
        }
        push(to);
      });
    };
  }, [push]);

  useEffect(() => {
    if (window.__clerk_nav_resolves_ref && window.__clerk_nav_resolves_ref.length) {
      window.__clerk_nav_resolves_ref.forEach(resolve => resolve());
    }
    window.__clerk_nav_resolves_ref = [];
  });

  return useCallback<NavigateFunction>((to, opts) => {
    return window.__clerk_nav_ref(to, opts);
  }, []);
};
