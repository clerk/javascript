import type { ModuleManager } from '@clerk/shared/moduleManager';
import type { EnvironmentResource, LoadedClerk } from '@clerk/shared/types';
import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo } from 'react';

import { ProfileRuntimeProvider } from '@/ui/components/Profile/ProfileRuntimeProvider';
import type { Appearance } from '@/ui/internal/appearance';

import { createComposedRouter } from './stubRouter';

export const fallbackModuleManager: ModuleManager = {
  import: () => Promise.resolve(undefined) as any,
};

type ProfileProviderShellProps = PropsWithChildren<{
  clerk: LoadedClerk;
  environment: EnvironmentResource;
  moduleManager: ModuleManager;
  appearanceKey: 'userProfile' | 'organizationProfile';
  flow: 'userProfile' | 'organizationProfile';
  globalAppearance: Appearance | undefined;
  appearance?: Appearance;
}>;

export function ProfileProviderShell({
  children,
  clerk,
  environment,
  moduleManager,
  appearanceKey,
  flow,
  globalAppearance,
  appearance,
}: ProfileProviderShellProps): ReactNode {
  const router = useMemo(() => createComposedRouter(clerk.navigate), [clerk]);

  return (
    <ProfileRuntimeProvider
      environment={environment}
      moduleManager={moduleManager}
      router={router}
      appearanceKey={appearanceKey}
      flow={flow}
      globalAppearance={globalAppearance}
      appearance={appearance}
    >
      {children}
    </ProfileRuntimeProvider>
  );
}
