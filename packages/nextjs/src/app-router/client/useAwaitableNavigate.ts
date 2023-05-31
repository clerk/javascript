'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

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
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const urlKey = pathname + params.toString();

  useEffect(() => {
    window.__clerk_nav_ref = (to: string) => {
      if (to === window.location.href.replace(window.location.origin, '')) {
        push(to);
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
