import { Badge, Button, Col, Flex, Text } from '@/customizables';

import type { OrganizationEnterpriseConnection } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { providerDisplayName } from './SetupCompleteStep';

type SecurityIdentityProviderSectionProps = {
  connection: OrganizationEnterpriseConnection;
  onConfigure: () => void;
};

/**
 * PROTOTYPE ONLY — the identity-provider SELECTION section on the
 * organization Security page. SSO and Directory Sync below are gated on a
 * provider having been selected here.
 */
export const SecurityIdentityProviderSection = ({
  connection,
  onConfigure,
}: SecurityIdentityProviderSectionProps): JSX.Element => {
  const isSelected = connection.hasConnection;

  return (
    <Col
      sx={t => ({
        gap: t.space.$4,
        paddingBlock: t.space.$4,
        borderTopWidth: t.borderWidths.$normal,
        borderTopStyle: t.borderStyles.$solid,
        borderTopColor: t.colors.$borderAlpha100,
      })}
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
        <Badge colorScheme={isSelected ? 'success' : 'primary'}>
          {isSelected ? providerDisplayName(connection.provider) : 'Not selected'}
        </Badge>
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
          Choose the identity provider your organization uses. Single Sign-On and Directory Sync are both configured
          against this provider.
        </Text>

        <Button
          variant='bordered'
          colorScheme='secondary'
          size='sm'
          onClick={onConfigure}
        >
          {isSelected ? 'Change provider' : 'Select provider'}
        </Button>
      </Col>
    </Col>
  );
};
