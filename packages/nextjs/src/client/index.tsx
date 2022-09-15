import { ClerkProvider as ReactClerkProvider } from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import { useRouter } from 'next/router';
import React from 'react';

export * from '@clerk/clerk-react';

//const NO_FRONTEND_API_ERR = 'The NEXT_PUBLIC_CLERK_FRONTEND_API environment variable must be set to use the ClerkProvider component.';

type NextClerkProviderProps =
  | ({
      children: React.ReactNode;
      publishableKey?: string;
      frontendApi: undefined;
    } & IsomorphicClerkOptions)
  | ({
      children: React.ReactNode;
      publishableKey: undefined;
      frontendApi?: string;
    } & IsomorphicClerkOptions);

// TODO: Undup
function parsePublishableKey(key: string, pkg: string) {
  try {
    if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
      throw 'error';
    }
    const keyParts = key.split('_');
    const instanceType = keyParts[1] as 'test' | 'live';
    let frontendApi = atob(keyParts[2]);
    if (!frontendApi.endsWith('$')) {
      throw 'error';
    }
    frontendApi = frontendApi.slice(0, -1);
    return { instanceType, frontendApi };
  } catch (e) {
    throw new Error(
      `Clerk Error: The publishableKey passed to Clerk is malformed. Your publishable key can be retrieved from https://dashboard.clerk.dev/last-active?path=api-keys (package=${pkg};passed=${key})`,
    );
  }
}

export function ClerkProvider({ children, ...rest }: NextClerkProviderProps): JSX.Element {
  // @ts-expect-error
  // Allow for overrides without making the type public
  const { frontendApi, publishableKey, authServerSideProps, __clerk_ssr_state, clerkJSUrl, ...restProps } = rest;
  const { push } = useRouter();

  ReactClerkProvider.displayName = 'ReactClerkProvider';

  const parsedFrontendApi = frontendApi || process.env.NEXT_PUBLIC_CLERK_FRONTEND_API;
  const parsedPublishableKey = publishableKey || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // TODO: Improve error
  let keyOptions;
  if (typeof parsedFrontendApi === 'string' && typeof parsedPublishableKey === 'undefined') {
    keyOptions = { frontendApi: parsedFrontendApi };
  } else if (typeof parsedFrontendApi === 'undefined' && typeof parsedPublishableKey === 'string') {
    keyOptions = { publishableKey: parsedPublishableKey };
    parsePublishableKey(parsedPublishableKey, '@clerk/nextjs');
  } else {
    throw new Error(
      'Clerk Error: The publishableKey is not set. Either set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` as an environment variable, or explicitly pass a `publishableKey` prop to the ClerkProvider component. Your publishable key can be retrieved from https://dashboard.clerk.dev/last-active?path=api-keys (package=@clerk/nextjs)',
    );
  }

  return (
    <ReactClerkProvider
      {...keyOptions}
      clerkJSUrl={clerkJSUrl || process.env.NEXT_PUBLIC_CLERK_JS}
      navigate={to => push(to)}
      // withServerSideAuth automatically injects __clerk_ssr_state
      // getAuth returns a user-facing authServerSideProps that hides __clerk_ssr_state
      initialState={authServerSideProps?.__clerk_ssr_state || __clerk_ssr_state}
      {...restProps}
    >
      {children}
    </ReactClerkProvider>
  );
}
