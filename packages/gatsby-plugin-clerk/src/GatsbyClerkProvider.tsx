import {
  __internal__setErrorThrowerOptions,
  ClerkLoaded,
  ClerkProvider as ReactClerkProvider,
} from '@clerk/clerk-react';
import { IsomorphicClerkOptions } from '@clerk/clerk-react/dist/types';
import { navigate } from 'gatsby';
import React from 'react';

__internal__setErrorThrowerOptions({ packageName: 'gatsby-plugin-clerk' });

export type GatsbyClerkProviderProps = {
  children: React.ReactNode;
  clerkState: any;
} & IsomorphicClerkOptions;

export function ClerkProvider({ children, ...rest }: GatsbyClerkProviderProps) {
  const { clerkState, ...restProps } = rest;
  const { __clerk_ssr_state, __clerk_ssr_interstitial } = clerkState?.__internal_clerk_state || {};

  return (
    <ReactClerkProvider
      navigate={to => navigate(to)}
      initialState={__clerk_ssr_state || {}}
      {...restProps}
    >
      {__clerk_ssr_interstitial ? (
        <ClerkLoaded>
          <Reload />
        </ClerkLoaded>
      ) : (
        children
      )}
    </ReactClerkProvider>
  );
}

const Reload = () => {
  React.useEffect(() => {
    function formRedirect() {
      const form = '<form method="get" action="" name="redirect"></form>';
      document.body.innerHTML = document.body.innerHTML + form;
      const formElement = document.querySelector('form[name=redirect]') as HTMLFormElement;

      const searchParams = new URLSearchParams(window.location.search);
      for (const paramTuple of searchParams) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = paramTuple[0];
        input.value = paramTuple[1];
        formElement.appendChild(input);
      }
      const url = new URL(window.location.origin + window.location.pathname + window.location.hash);
      window.history.pushState({}, '', url);

      formElement.action = window.location.pathname + window.location.hash;
      formElement.submit();
    }

    if (window.location.href.indexOf('#') === -1) {
      window.location.href = window.location.href;
    } else if (window.navigator.userAgent.toLowerCase().includes('firefox/')) {
      formRedirect();
    } else {
      window.location.reload();
    }
  }, []);
  return null;
};
