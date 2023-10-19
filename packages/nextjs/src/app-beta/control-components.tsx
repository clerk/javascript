import { deprecated } from '@clerk/shared/deprecated';
import React from 'react';

deprecated(
  '@clerk/nextjs/app-beta',
  'Use imports from `@clerk/nextjs` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
);
import { auth } from './auth';

/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export function SignedIn(props: React.PropsWithChildren) {
  const { children } = props;
  const { userId } = auth();
  return userId ? <>{children}</> : null;
}

/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export function SignedOut(props: React.PropsWithChildren) {
  const { children } = props;
  const { userId } = auth();
  return userId ? null : <>{children}</>;
}
