import type {
  ActiveSessionResource,
  ClientResource,
  LoadedClerk,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
  UserResource,
} from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { disableSWRDevtools } from './clerk-swr';
disableSWRDevtools();
import { SWRConfig } from './clerk-swr';
import { createContextAndHook } from './createContextAndHook';

const [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook<LoadedClerk>('ClerkInstanceContext');
const [UserContext, useUserContext] = createContextAndHook<UserResource | null | undefined>('UserContext');
const [ClientContext, useClientContext] = createContextAndHook<ClientResource | null | undefined>('ClientContext');
const [SessionContext, useSessionContext] = createContextAndHook<ActiveSessionResource | null | undefined>(
  'SessionContext',
);

type OrganizationContextProps = {
  organization: OrganizationResource | null | undefined;
  lastOrganizationInvitation: OrganizationInvitationResource | null | undefined;
  lastOrganizationMember: OrganizationMembershipResource | null | undefined;
};
const [OrganizationContextInternal, useOrganizationContext] = createContextAndHook<{
  organization: OrganizationResource | null | undefined;
  lastOrganizationInvitation: OrganizationInvitationResource | null | undefined;
  lastOrganizationMember: OrganizationMembershipResource | null | undefined;
}>('OrganizationContext');

const OrganizationProvider = ({
  children,
  organization,
  lastOrganizationMember,
  lastOrganizationInvitation,
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
          value: {
            organization,
            lastOrganizationMember,
            lastOrganizationInvitation,
          },
        }}
      >
        {children}
      </OrganizationContextInternal.Provider>
    </SWRConfig>
  );
};

/**
 * @deprecated use OrganizationProvider instead
 */
export const OrganizationContext = OrganizationProvider;

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
};
