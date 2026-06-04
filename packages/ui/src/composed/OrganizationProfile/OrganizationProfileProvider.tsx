import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { EnvironmentResource } from '@clerk/shared/types';
import type { PropsWithChildren, ReactNode } from 'react';

import type { Appearance } from '@/ui/internal/appearance';
import { getModuleManager } from '@/ui/internal/moduleManagerStore';

import { SubscriberTypeContext } from '../../contexts/components/SubscriberType';
import { OrganizationProfileContext } from '../../contexts/components/OrganizationProfile';
import { ProfileProviderShell, fallbackModuleManager } from '../ProfileProviderShell';

type OrganizationProfileProviderProps = PropsWithChildren<{
  appearance?: Appearance;
}>;

export const OrganizationProfileProvider = (props: OrganizationProfileProviderProps): ReactNode => {
  const { children, appearance } = props;
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const { organization } = useOrganization();

  const environment = (clerk as any).__internal_environment as EnvironmentResource | null | undefined;
  const moduleManager = getModuleManager(clerk) ?? fallbackModuleManager;

  if (!isLoaded || !user || !organization || !environment) {
    return null;
  }

  const orgProfileCtxValue = {
    componentName: 'OrganizationProfile' as const,
    mode: 'mounted' as const,
    routing: 'hash' as const,
    path: undefined,
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
