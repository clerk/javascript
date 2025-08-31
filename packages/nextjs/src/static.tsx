'use client';

import type { ClerkProviderProps } from '@clerk/clerk-react';
import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import type { Without } from '@clerk/types';
import React from 'react';

import { useAwaitablePush } from './app-router/client/useAwaitablePush';
import { useAwaitableReplace } from './app-router/client/useAwaitableReplace';
import { mergeNextClerkPropsWithEnv } from './utils/mergeNextClerkPropsWithEnv';

type NextStaticClerkProviderProps = Without<ClerkProviderProps, 'publishableKey'> & {
  /**
   * Used to override the default NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env variable if needed.
   * This is optional for NextJS as the ClerkProvider will automatically use the NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env variable if it exists.
   */
  publishableKey?: string;
};

// StaticClerkProvider is a light wrapper around the `<ClerkProvider/>` exported from `@clerk/clerk-react`
// It is meant to be used only for developers that want to static export their Next.js app (https://nextjs.org/docs/app/guides/static-exports).
// This opts out of keyless, the `dynamic` prop (aka SSR) and route revalidation on auth state updates (since RSCs and middleware do not exist in the context of static export).

/**
 * The ClerkProvider exported from `/static` should only be used for static exports only.
 * Using this provider means that you opt out of authorization checks on the server.
 * @param props
 * @returns
 */
const StaticClerkProvider = (props: NextStaticClerkProviderProps) => {
  const push = useAwaitablePush();
  const replace = useAwaitableReplace();
  const mergedProps = mergeNextClerkPropsWithEnv({
    ...props,
    // @ts-expect-error Error because of the stricter types of internal `push`
    routerPush: push,
    // @ts-expect-error Error because of the stricter types of internal `replace`
    routerReplace: replace,
  });
  return <ReactClerkProvider {...mergedProps}>{props.children}</ReactClerkProvider>;
};

export { StaticClerkProvider as ClerkProvider };
