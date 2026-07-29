import { Badge, Button, Col, Flex, Text } from '@/customizables';

type SecurityDirectorySyncSectionProps = {
  onConfigure: () => void;
};

/**
 * PROTOTYPE ONLY — the Directory Sync entry point on the organization Security
 * page, rendered beneath the SSO section. Static copy, fake status.
 */
export const SecurityDirectorySyncSection = ({ onConfigure }: SecurityDirectorySyncSectionProps): JSX.Element => (
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
        Directory Sync
      </Text>
      <Badge colorScheme='primary'>Not configured</Badge>
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
        Automatically add, update, and remove organization members from your identity provider&apos;s directory.
        Requires an SSO connection.
      </Text>

      <Button
        variant='bordered'
        colorScheme='secondary'
        size='sm'
        onClick={onConfigure}
      >
        Set up Directory Sync
      </Button>
    </Col>
  </Col>
);
