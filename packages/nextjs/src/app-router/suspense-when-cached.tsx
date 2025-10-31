import { type PropsWithChildren, Suspense } from 'react';
import React from 'react';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const isNextCacheComponents = process.env.__NEXT_CACHE_COMPONENTS;

/**
 * Wraps the children in a Suspense component if the current environment is a Next.js cache component.
 * @param children - The children to render.
 * @param noopWhen - A condition to opt out of wrapping with Suspense.
 */
export const SuspenseWhenCached = ({
  children,
  noopWhen = false,
}: PropsWithChildren<{
  /**
   * A condition to opt out of wrapping with Suspense.
   */
  noopWhen?: boolean;
}>) => {
  if (!isNextCacheComponents) {
    return children;
  }

  if (noopWhen) {
    return children;
  }

  return <Suspense>{children}</Suspense>;
};
