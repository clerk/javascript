import type { OrganizationDomainResource } from '@clerk/shared/types';

import { Badge, Button, Col, Flex, Text } from '@/customizables';

import { areAllOrganizationDomainsVerified } from '../ConfigureSSO/domain/organizationEnterpriseConnection';

type SecurityDomainsSectionProps = {
  organizationDomains: OrganizationDomainResource[] | undefined;
  onConfigure: () => void;
};

/**
 * PROTOTYPE ONLY — the "Domains" section on the organization Security page,
 * the first prerequisite in the restructured IA.
 */
export const SecurityDomainsSection = ({
  organizationDomains,
  onConfigure,
}: SecurityDomainsSectionProps): JSX.Element => {
  const isComplete = areAllOrganizationDomainsVerified(organizationDomains);
  const isStarted = Boolean(organizationDomains?.length);

  const badge = isComplete
    ? { colorScheme: 'success' as const, label: 'Verified' }
    : isStarted
      ? { colorScheme: 'warning' as const, label: 'In progress' }
      : { colorScheme: 'primary' as const, label: 'Not configured' };

  return (
    <Col sx={t => ({ gap: t.space.$4, paddingBlock: t.space.$4 })}>
      <Flex
        align='center'
        sx={t => ({ gap: t.space.$2 })}
      >
        <Text
          as='p'
          variant='h3'
        >
          Domains
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
          Add and verify ownership of the domains your organization signs in with. Required before selecting an identity
          provider.
        </Text>

        <Button
          variant='bordered'
          colorScheme='secondary'
          size='sm'
          onClick={onConfigure}
        >
          {isComplete ? 'Manage domains' : isStarted ? 'Continue setup' : 'Start setup'}
        </Button>
      </Col>
    </Col>
  );
};
