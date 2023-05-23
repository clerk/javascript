'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useReducer } from 'react';

declare global {
  interface Window {
    __clerk_nav_ref: (to: string) => any;
    __clerk_nav_resolves_ref: Array<(val?: any) => any> | undefined;
  }
}

export const useAwaitableNavigate = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { push } = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [_, forceUpdate] = useReducer(x => !x, false);
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const urlKey = pathname + params.toString();

  useEffect(() => {
    window.__clerk_nav_ref = (to: string) => {
      return new Promise(res => {
        if (window.__clerk_nav_resolves_ref) {
          window.__clerk_nav_resolves_ref.push(res);
        } else {
          window.__clerk_nav_resolves_ref = [res];
        }

        if (to === window.location.href) {
          setTimeout(() => {
            forceUpdate();
          }, 100);
        }

        push(to);
      });
    };
  }, [urlKey]);

  useEffect(() => {
    if (window.__clerk_nav_resolves_ref && window.__clerk_nav_resolves_ref.length) {
      window.__clerk_nav_resolves_ref.forEach(resolve => resolve());
    }
    window.__clerk_nav_resolves_ref = [];
  });

  return useCallback((to: string) => {
    return window.__clerk_nav_ref(to);
  }, []);
};
