import type { ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { withCoreUserGuard } from '@/contexts';
import { Flow } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { ProfileCard } from '@/elements/ProfileCard';
import { Route, Switch } from '@/router';

import { SetupFlowNavbar } from '../ConfigureIdentityProvider/SetupFlowNavbar';
import { ConfigureSSOProtect } from '../ConfigureSSO/ConfigureSSO';
import { ConfigureSSOSkeleton } from '../ConfigureSSO/ConfigureSSOSkeleton';
import { useOrganizationEnterpriseConnection } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { ConfigureDomainsWizard } from './ConfigureDomainsWizard';

/**
 * PROTOTYPE ONLY — standalone host for the domain setup + verification flow.
 * Reuses the configureSSO flow id/appearance.
 */
const ConfigureDomainsInternal = (): JSX.Element => {
  return (
    <Flow.Root flow='configureSSO'>
      <Switch>
        <Route>
          <AuthenticatedContent />
        </Route>
      </Switch>
    </Flow.Root>
  );
};

const AuthenticatedContent = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <SetupFlowNavbar
        title='Domain setup'
        contentRef={contentRef}
      >
        <ConfigureDomainsContent contentRef={contentRef} />
      </SetupFlowNavbar>
    </ProfileCard.Root>
  );
});

const ConfigureDomainsContent = ({ contentRef }: { contentRef: React.RefObject<HTMLDivElement> }): JSX.Element => {
  const {
    isLoading,
    enterpriseConnection,
    organizationEnterpriseConnection,
    testRuns,
    enterpriseConnectionMutations,
    organizationDomains,
    organizationDomainMutations,
  } = useOrganizationEnterpriseConnection();

  if (isLoading) {
    return <ConfigureSSOSkeleton />;
  }

  return (
    <ConfigureSSOProtect>
      <ConfigureDomainsWizard
        organizationEnterpriseConnection={organizationEnterpriseConnection}
        testRuns={testRuns}
        enterpriseConnection={enterpriseConnection}
        contentRef={contentRef}
        enterpriseConnectionMutations={enterpriseConnectionMutations}
        organizationDomainMutations={organizationDomainMutations}
        organizationDomains={organizationDomains}
      />
    </ConfigureSSOProtect>
  );
};

export const ConfigureDomains: React.ComponentType<ConfigureSSOProps> = withCardStateProvider(ConfigureDomainsInternal);
