'use client';

import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { OrganizationProfileProps } from '@clerk/shared/types';
import type { PropsWithChildren, ReactNode } from 'react';

import type { Appearance } from '@/ui/internal/appearance';

import { OrganizationProfileContext } from '../../contexts/components/OrganizationProfile';
import { SubscriberTypeContext } from '../../contexts/components/SubscriberType';
import { ProfileProviderShell, resolveComposedClerkRuntime } from '../ProfileProviderShell';

type OrganizationProfileProviderProps = PropsWithChildren<{
  appearance?: Appearance;
  afterLeaveOrganizationUrl?: OrganizationProfileProps['afterLeaveOrganizationUrl'];
  apiKeysProps?: OrganizationProfileProps['apiKeysProps'];
}>;

export const OrganizationProfileProvider = (props: OrganizationProfileProviderProps): ReactNode => {
  const { children, appearance, afterLeaveOrganizationUrl, apiKeysProps } = props;
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const { organization } = useOrganization();

  const { environment, moduleManager } = resolveComposedClerkRuntime(clerk, isLoaded);

  if (!isLoaded || !user || !organization || !environment) {
    return null;
  }

  const orgProfileCtxValue = {
    componentName: 'OrganizationProfile' as const,
    mode: 'mounted' as const,
    routing: 'hash' as const,
    path: undefined,
    afterLeaveOrganizationUrl,
    apiKeysProps,
    customPages: [],
  };

  return (
    <ProfileProviderShell
      clerk={clerk}
      environment={environment}
      moduleManager={moduleManager}
      appearanceKey='organizationProfile'
      flow='organizationProfile'
      globalAppearance={clerk.__internal_getOption('appearance')}
      appearance={appearance}
    >
      <SubscriberTypeContext.Provider value='organization'>
        <OrganizationProfileContext.Provider value={orgProfileCtxValue}>{children}</OrganizationProfileContext.Provider>
      </SubscriberTypeContext.Provider>
    </ProfileProviderShell>
  );
};
