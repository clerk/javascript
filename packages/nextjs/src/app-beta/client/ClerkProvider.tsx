'use client';
import { deprecated } from '@clerk/shared/deprecated';

deprecated(
  '@clerk/nextjs/app-beta',
  'Use imports from `@clerk/nextjs` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
);
// !!! Note the import from react
import type { ClerkProviderProps } from '@clerk/clerk-react';
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect } from 'react';

declare global {
  export interface Window {
    __clerk_nav_await: Array<(value: void) => void>;
    __clerk_nav: (to: string) => Promise<void>;
  }
}

/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
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

/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export function ClerkProvider(props: ClerkProviderProps) {
  const navigate = useAwaitableNavigate();
  return (
    <ReactClerkProvider
      navigate={navigate}
      {...props}
    />
  );
}
