import type { ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { withCoreUserGuard } from '@/contexts';
import { Col, Flex, Flow, Heading, Icon, Text } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { ProfileCard } from '@/elements/ProfileCard';
import { ExclamationTriangle } from '@/icons';
import { Route, Switch } from '@/router';

import { ConfigureSSOProtect } from '../ConfigureSSO/ConfigureSSO';
import { ConfigureSSOSkeleton } from '../ConfigureSSO/ConfigureSSOSkeleton';
import { areAllOrganizationDomainsVerified } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { ProfileCardFooter, ProfileCardHeader } from '../ConfigureSSO/elements/ProfileCard';
import { Step } from '../ConfigureSSO/elements/Step';
import { useOrganizationEnterpriseConnection } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { ConfigureIdentityProviderWizard } from './ConfigureIdentityProviderWizard';
import { SetupFlowNavbar } from './SetupFlowNavbar';

/**
 * PROTOTYPE ONLY — standalone host for the identity-provider selection flow.
 * Reuses the configureSSO flow id/appearance.
 */
const ConfigureIdentityProviderInternal = (): JSX.Element => {
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
        title='Identity provider'
        contentRef={contentRef}
      >
        <ConfigureIdentityProviderContent contentRef={contentRef} />
      </SetupFlowNavbar>
    </ProfileCard.Root>
  );
});

const ConfigureIdentityProviderContent = ({
  contentRef,
}: {
  contentRef: React.RefObject<HTMLDivElement>;
}): JSX.Element => {
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

  // PROTOTYPE ONLY: identity-provider selection requires the domain setup flow
  // (at least one verified domain) to be completed first.
  if (!areAllOrganizationDomainsVerified(organizationDomains)) {
    return (
      <ConfigureSSOProtect>
        <MissingDomainSetup />
      </ConfigureSSOProtect>
    );
  }

  return (
    <ConfigureSSOProtect>
      <ConfigureIdentityProviderWizard
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

const MissingDomainSetup = (): JSX.Element => (
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
              textVariant='h1'
              sx={t => ({ fontSize: t.fontSizes.$lg, textWrap: 'balance' })}
            >
              Domain setup required
            </Heading>
            <Text
              as='p'
              variant='body'
              colorScheme='secondary'
              sx={{ textWrap: 'balance' }}
            >
              Verify at least one domain before selecting your identity provider.
            </Text>
          </Col>
        </Flex>
      </Step.Section>
    </Step.Body>

    <ProfileCardFooter />
  </>
);

export const ConfigureIdentityProvider: React.ComponentType<ConfigureSSOProps> = withCardStateProvider(
  ConfigureIdentityProviderInternal,
);
