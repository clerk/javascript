import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { ClerkHostRouter } from './router';

/**
 * Framework specific router integrations
 */

export const useNextRouter = (): ClerkHostRouter => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    pathname: () => pathname,
    searchParams: () => searchParams,
  };
};
