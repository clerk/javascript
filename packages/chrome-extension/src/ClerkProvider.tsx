import { Clerk } from '@clerk/clerk-js';
import type { ClerkProp, ClerkProviderProps as ClerkReactProviderProps } from '@clerk/clerk-react';
import { __internal__setErrorThrowerOptions, ClerkProvider as ClerkReactProvider } from '@clerk/clerk-react';
import React from 'react';

import { buildClerk } from './singleton';

Clerk.sdkMetadata = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

__internal__setErrorThrowerOptions({
  packageName: '@clerk/chrome-extension',
});

type WebSSOClerkProviderCustomProps = {
  syncSessionWithTab?: boolean;
};

type WebSSOClerkProviderProps = ClerkReactProviderProps & WebSSOClerkProviderCustomProps;

const WebSSOClerkProvider = (props: WebSSOClerkProviderProps): JSX.Element | null => {
  const { children, ...rest } = props;
  const { publishableKey = '' } = props;

  const [clerkInstance, setClerkInstance] = React.useState<ClerkProp>(null);

  React.useEffect(() => {
    void (async () => {
      setClerkInstance(await buildClerk({ publishableKey }));
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

export function ClerkProvider({ syncSessionWithTab, ...rest }: ChromeExtensionClerkProviderProps): JSX.Element | null {
  return syncSessionWithTab ? <WebSSOClerkProvider {...rest} /> : <StandaloneClerkProvider {...rest} />;
}
