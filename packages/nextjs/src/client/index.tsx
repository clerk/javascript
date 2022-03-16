import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { ClerkOptions, ClerkThemeOptions } from '@clerk/types';
import { useRouter } from 'next/router';
import React from 'react';

export * from '@clerk/clerk-react';

const NO_FRONTEND_API_ERR =
  'The NEXT_PUBLIC_CLERK_FRONTEND_API environment variable must be set to use the ClerkProvider component.';

type NextClerkProviderProps = {
  children: React.ReactNode;
  theme?: ClerkThemeOptions;
  authVersion?: 1 | 2;
  frontendApi?: string;
} & Pick<ClerkOptions, 'selectInitialSession' | 'polling'>;

export function ClerkProvider({
  children,
  ...rest
}: NextClerkProviderProps): JSX.Element {
  // @ts-expect-error
  // Allow for overrides without making the type public
  const { frontendApi, ...restProps } = rest;
  const { push } = useRouter();

  if (frontendApi == undefined && !process.env.NEXT_PUBLIC_CLERK_FRONTEND_API) {
    throw Error(NO_FRONTEND_API_ERR);
  }

  ReactClerkProvider.displayName = 'ReactClerkProvider';

  return (
    <ReactClerkProvider
      frontendApi={frontendApi || process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
      scriptUrl={process.env.NEXT_PUBLIC_CLERK_JS}
      navigate={to => push(to)}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
