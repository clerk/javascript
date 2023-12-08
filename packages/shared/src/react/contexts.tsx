'use client';

import type {
  ActiveSessionResource,
  ClientResource,
  LoadedClerk,
  OrganizationResource,
  UserResource,
} from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { SWRConfig } from './clerk-swr';
import { createContextAndHook } from './hooks/createContextAndHook';

const [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook<LoadedClerk>('ClerkInstanceContext');
const [UserContext, useUserContext] = createContextAndHook<UserResource | null | undefined>('UserContext');
const [ClientContext, useClientContext] = createContextAndHook<ClientResource | null | undefined>('ClientContext');
const [SessionContext, useSessionContext] = createContextAndHook<ActiveSessionResource | null | undefined>(
  'SessionContext',
);

type OrganizationContextProps = {
  organization: OrganizationResource | null | undefined;
};
const [OrganizationContextInternal, useOrganizationContext] = createContextAndHook<{
  organization: OrganizationResource | null | undefined;
}>('OrganizationContext');

const OrganizationProvider = ({
  children,
  organization,
  swrConfig,
}: PropsWithChildren<
  OrganizationContextProps & {
    // Exporting inferred types  directly from SWR will result in error while building declarations
    swrConfig?: any;
  }
>) => {
  return (
    <SWRConfig value={swrConfig}>
      <OrganizationContextInternal.Provider
        value={{
          value: { organization },
        }}
      >
        {children}
      </OrganizationContextInternal.Provider>
    </SWRConfig>
  );
};

const ClerkProviderAssertionContext = React.createContext<{ inTree: true } | undefined>(undefined);
ClerkProviderAssertionContext.displayName = 'ClerkProviderAssertionContext';

function useAssertWrappedByClerkProvider(displayNameOrCustomHandler?: string | (() => void)): void {
  const assertionCtx = React.useContext(ClerkProviderAssertionContext);

  if (!assertionCtx) {
    if (typeof displayNameOrCustomHandler === 'function') {
      displayNameOrCustomHandler();
      return;
    }

    throw new Error(
      `${displayNameOrCustomHandler || 'Clerk components'} must be wrapped within the <ClerkProvider> component.
      Please see: https://clerk.com/docs/components/clerk-provider`,
    );
  }
}

export {
  ClientContext,
  useClientContext,
  OrganizationProvider,
  useOrganizationContext,
  UserContext,
  useUserContext,
  SessionContext,
  useSessionContext,
  ClerkInstanceContext,
  useClerkInstanceContext,
  ClerkProviderAssertionContext,
  useAssertWrappedByClerkProvider,
};
