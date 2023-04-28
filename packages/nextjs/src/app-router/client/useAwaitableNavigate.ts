'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export const useAwaitableNavigate = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { push, refresh } = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    window.__clerk_nav = (to: string) => {
      return new Promise(res => {
        window.__clerk_nav_await.push(res);
        if (to === pathname) {
          refresh();
        } else {
          push(to);
        }
      });
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window.__clerk_nav_await === 'undefined') {
      window.__clerk_nav_await = [];
    }
    window.__clerk_nav_await.forEach(resolve => resolve());
    window.__clerk_nav_await = [];
  });

  return useCallback((to: string) => {
    return window.__clerk_nav(to);
  }, []);
};
