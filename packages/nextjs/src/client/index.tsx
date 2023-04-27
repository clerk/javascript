import {
  __internal__setErrorThrowerOptions,
  ClerkProvider as ReactClerkProvider,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
} from '@clerk/clerk-react';
import type { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import type { MultiDomainAndOrProxy, PublishableKeyOrFrontendApi, SignInProps, SignUpProps } from '@clerk/types';
import { useRouter } from 'next/router';
import React from 'react';

import { invalidateNextRouterCache } from './invalidateNextRouterCache';
import { ClerkNextProvider, useClerkNextContext } from './NextProviderContext';

// TODO: Import from shared once [JS-118] is done
const useSafeLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

__internal__setErrorThrowerOptions({
  packageName: '@clerk/nextjs',
});

export * from '@clerk/clerk-react';

export const SignIn = (props: SignInProps) => {
  const { signInUrl } = useClerkNextContext();
  if (signInUrl) {
    return (
      <BaseSignIn
        routing='path'
        path={signInUrl}
        {...props}
      />
    );
  }
  return <BaseSignIn {...props} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl } = useClerkNextContext();
  if (signUpUrl) {
    return (
      <BaseSignUp
        routing='path'
        path={signUpUrl}
        {...props}
      />
    );
  }
  return <BaseSignUp {...props} />;
};

type NextClerkProviderProps = {
  children: React.ReactNode;
  /**
   * If set to true, the NextJS middleware will be invoked
   * every time the client-side auth state changes (sign-out, sign-in, organization switch etc.).
   * That way, any auth-dependent logic can be placed inside the middleware.
   * Example: Configuring the middleware to force a redirect to `/sign-in` when the user signs out
   *
   * @default true
   */
  __unstable_invokeMiddlewareOnAuthStateChange?: boolean;
} & Omit<IsomorphicClerkOptions, keyof PublishableKeyOrFrontendApi> &
  Partial<PublishableKeyOrFrontendApi> &
  Omit<IsomorphicClerkOptions, keyof MultiDomainAndOrProxy> &
  MultiDomainAndOrProxy;

export function ClerkProvider({ children, ...rest }: NextClerkProviderProps): JSX.Element {
  // Allow for overrides without making the type public
  const {
    // @ts-expect-error
    authServerSideProps,
    frontendApi,
    publishableKey,
    proxyUrl,
    domain,
    isSatellite,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    // @ts-expect-error
    __clerk_ssr_state,
    clerkJSUrl,
    __unstable_invokeMiddlewareOnAuthStateChange = true,
    ...restProps
  } = rest;
  const { push } = useRouter();

  ReactClerkProvider.displayName = 'ReactClerkProvider';

  useSafeLayoutEffect(() => {
    window.__unstable__onBeforeSetActive = invalidateNextRouterCache;
    window.__unstable__onAfterSetActive = () => {
      // Re-run the middleware every time there auth state changes.
      // This enables complete control from a centralised place (NextJS middleware),
      // as we will invoke it every time the client-side auth state changes, eg: signing-out, switching orgs, etc.
      if (__unstable_invokeMiddlewareOnAuthStateChange) {
        void push(window.location.href);
      }
    };
  }, []);

  const nextProps = {
    frontendApi: frontendApi || process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || '',
    publishableKey: publishableKey || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    clerkJSUrl: clerkJSUrl || process.env.NEXT_PUBLIC_CLERK_JS,
    proxyUrl: proxyUrl || process.env.NEXT_PUBLIC_CLERK_PROXY_URL || '',
    domain: domain || process.env.NEXT_PUBLIC_CLERK_DOMAIN || '',
    isSatellite: isSatellite || process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true',
    signInUrl: signInUrl || process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '',
    signUpUrl: signUpUrl || process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '',
    afterSignInUrl: afterSignInUrl || process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '',
    afterSignUpUrl: afterSignUpUrl || process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '',
    navigate: (to: string) => push(to),
    // withServerSideAuth automatically injects __clerk_ssr_state
    // getAuth returns a user-facing authServerSideProps that hides __clerk_ssr_state
    initialState: authServerSideProps?.__clerk_ssr_state || __clerk_ssr_state,
    ...restProps,
  };

  return (
    // @ts-expect-error
    <ClerkNextProvider {...nextProps}>
      {/*@ts-expect-error*/}
      <ReactClerkProvider {...nextProps}>{children}</ReactClerkProvider>
    </ClerkNextProvider>
  );
}
