'use client';

import { usePathname, useRouter } from 'next/navigation';
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

  useEffect(() => {
    window.__clerk_nav_ref = (to: string) => {
      return new Promise(res => {
        if (window.__clerk_nav_resolves_ref) {
          window.__clerk_nav_resolves_ref.push(res);
        } else {
          window.__clerk_nav_resolves_ref = [res];
        }
        push(to);
      });
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window.__clerk_nav_resolves_ref === 'undefined') {
      window.__clerk_nav_resolves_ref = [];
    }
    window.__clerk_nav_resolves_ref.forEach(resolve => resolve());
    window.__clerk_nav_resolves_ref = [];
  });

  return useCallback((to: string) => {
    return window.__clerk_nav_ref(to);
  }, []);
};
