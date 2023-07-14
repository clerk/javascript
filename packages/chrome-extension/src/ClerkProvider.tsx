import Clerk from '@clerk/clerk-js';
import type { ClerkProp, ClerkProviderProps as ClerkReactProviderProps } from '@clerk/clerk-react';
import { __internal__setErrorThrowerOptions, ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import React from 'react';

import type { TokenCache } from './cache';
import { ChromeStorageCache } from './cache';
import { buildClerk } from './singleton';

__internal__setErrorThrowerOptions({
  packageName: '@clerk/chrome-extension',
});

type WebSSOClerkProviderCustomProps =
  | {
      syncSessionWithTab?: false;
      tokenCache?: never;
    }
  | {
      syncSessionWithTab: true;
      tokenCache?: TokenCache;
    };

type WebSSOClerkProviderProps = ClerkReactProviderProps & WebSSOClerkProviderCustomProps;

const WebSSOClerkProvider = (props: WebSSOClerkProviderProps): JSX.Element | null => {
  const { children, tokenCache: runtimeTokenCache, ...rest } = props;
  const { publishableKey = '' } = props;

  const [clerkInstance, setClerkInstance] = React.useState<ClerkProp>(null);

  // When syncSessionWithTab is set tokenCache is an optional parameter that defaults to ChromeStorageCache
  const tokenCache = runtimeTokenCache || ChromeStorageCache;

  React.useEffect(() => {
    (async () => {
      setClerkInstance(await buildClerk({ publishableKey, tokenCache }));
    })();
  }, []);

  if (!clerkInstance) {
    return null;
  }

  return (
    <ClerkReactProvider
      {...rest}
      Clerk={clerkInstance}
      standardBrowser={false}
    >
      {children}
    </ClerkReactProvider>
  );
};

const StandaloneClerkProvider = (props: ClerkReactProviderProps): JSX.Element => {
  const { children, ...rest } = props;

  return (
    <ClerkReactProvider
      {...rest}
      Clerk={Clerk}
    >
      {children}
    </ClerkReactProvider>
  );
};

type ChromeExtensionClerkProviderProps = WebSSOClerkProviderProps;

export function ClerkProvider(props: ChromeExtensionClerkProviderProps): JSX.Element | null {
  const { tokenCache, syncSessionWithTab, ...rest } = props;
  return syncSessionWithTab ? (
    <WebSSOClerkProvider
      {...props}
      tokenCache={tokenCache}
    />
  ) : (
    <StandaloneClerkProvider {...rest} />
  );
}
