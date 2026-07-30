import type { OrganizationDomainResource } from '@clerk/shared/types';

import { Badge, Button, Col, Flex, Text } from '@/customizables';

import type { OrganizationEnterpriseConnection } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { areAllOrganizationDomainsVerified } from '../ConfigureSSO/domain/organizationEnterpriseConnection';

type SecurityIdentityProviderSectionProps = {
  connection: OrganizationEnterpriseConnection;
  organizationDomains: OrganizationDomainResource[] | undefined;
  onConfigure: () => void;
};

export const isIdentityProviderSetupComplete = (
  connection: OrganizationEnterpriseConnection,
  organizationDomains: OrganizationDomainResource[] | undefined,
): boolean =>
  areAllOrganizationDomainsVerified(organizationDomains) && (connection.hasMinimumConfiguration || connection.isActive);

/**
 * PROTOTYPE ONLY — the prerequisite "Identity provider" section on the
 * organization Security page. Domains + IdP configuration live here now;
 * the SSO and Directory Sync sections below are gated on its completion.
 */
export const SecurityIdentityProviderSection = ({
  connection,
  organizationDomains,
  onConfigure,
}: SecurityIdentityProviderSectionProps): JSX.Element => {
  const isComplete = isIdentityProviderSetupComplete(connection, organizationDomains);
  const isStarted = Boolean(organizationDomains?.length) || connection.hasConnection;

  const badge = isComplete
    ? { colorScheme: 'success' as const, label: 'Complete' }
    : isStarted
      ? { colorScheme: 'warning' as const, label: 'In progress' }
      : { colorScheme: 'primary' as const, label: 'Not configured' };

  return (
    <Col
      sx={t => ({ gap: t.space.$4, paddingBlock: t.space.$4 })}
      data-testid='security-idp-section'
    >
      <Flex
        align='center'
        sx={t => ({ gap: t.space.$2 })}
      >
        <Text
          as='p'
          variant='h3'
        >
          Identity provider
        </Text>
        <Badge colorScheme={badge.colorScheme}>{badge.label}</Badge>
        <Badge colorScheme='warning'>Prototype</Badge>
      </Flex>

      <Col
        align='start'
        gap={4}
      >
        <Text
          as='p'
          colorScheme='secondary'
        >
          Verify the domains your organization signs in with and connect your identity provider. Required before setting
          up Single Sign-On or Directory Sync.
        </Text>

        <Button
          variant='bordered'
          colorScheme='secondary'
          size='sm'
          onClick={onConfigure}
        >
          {isComplete ? 'Manage setup' : isStarted ? 'Continue setup' : 'Start setup'}
        </Button>
      </Col>
    </Col>
  );
};
