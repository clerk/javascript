import { useSession } from '@clerk/shared/react';
import type { ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { useProtect } from '@/common';
import { withCoreUserGuard } from '@/contexts';
import { Col, Flex, Flow, Heading, Icon, localizationKeys, Text } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { ProfileCard } from '@/elements/ProfileCard';
import { ExclamationTriangle } from '@/icons';
import { Route, Switch } from '@/router';

import { ConfigureSSONavbar } from './ConfigureSSONavbar';
import { ConfigureSSOSkeleton } from './ConfigureSSOSkeleton';
import { ConfigureSSOWizard } from './ConfigureSSOWizard';
import { ProfileCardFooter, ProfileCardHeader } from './elements/ProfileCard';
import { Step } from './elements/Step';
import { useOrganizationEnterpriseConnection } from './hooks/useOrganizationEnterpriseConnection';

const ConfigureSSOInternal = () => {
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
      <ConfigureSSONavbar contentRef={contentRef}>
        <ConfigureSSOContent contentRef={contentRef} />
      </ConfigureSSONavbar>
    </ProfileCard.Root>
  );
});

const ConfigureSSOContent = ({ contentRef }: { contentRef: React.RefObject<HTMLDivElement> }) => {
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
      <ConfigureSSOWizard
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

/** Permission gate shared by the wizard's hosts — personal workspaces pass, since there is no membership to check. */
export const ConfigureSSOProtect = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSession();
  const isPersonalWorkspace = !session?.lastActiveOrganizationId;
  const canManageEnterpriseConnections = useProtect(
    has => isPersonalWorkspace || has({ permission: 'org:sys_entconns:manage' }),
  );

  if (!canManageEnterpriseConnections) {
    return <MissingManageEnterpriseConnectionsPermission />;
  }

  return children;
};

const MissingManageEnterpriseConnectionsPermission = () => (
  <>
    <ProfileCardHeader />

    <Step.Body>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        <Flex
          align='center'
          justify='center'
          sx={t => ({ flex: 1, padding: t.space.$8 })}
        >
          <Col
            align='center'
            sx={t => ({ gap: t.space.$2, textAlign: 'center', maxWidth: t.sizes.$94 })}
          >
            <Icon
              icon={ExclamationTriangle}
              sx={t => ({ width: t.sizes.$8, height: t.sizes.$8, color: t.colors.$neutralAlpha600 })}
            />
            <Heading
              localizationKey={localizationKeys('configureSSO.missingManageEnterpriseConnectionsPermission.title')}
              textVariant='h1'
              sx={t => ({ fontSize: t.fontSizes.$lg, textWrap: 'balance' })}
            />
            <Text
              as='p'
              variant='body'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.missingManageEnterpriseConnectionsPermission.subtitle')}
              sx={{ textWrap: 'balance' }}
            />
          </Col>
        </Flex>
      </Step.Section>
    </Step.Body>

    <ProfileCardFooter />
  </>
);

export const ConfigureSSO: React.ComponentType<ConfigureSSOProps> = withCardStateProvider(ConfigureSSOInternal);
