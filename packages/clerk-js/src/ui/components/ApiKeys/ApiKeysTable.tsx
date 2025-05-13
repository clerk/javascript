import type { ApiKeyResource } from '@clerk/types';
import { useState } from 'react';

import { useApiKeySecret } from '../../components/ApiKeys/shared';
import { Button, Flex, Icon, Input, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { ThreeDotsMenu } from '../../elements';
import { useClipboard } from '../../hooks';
import { Clipboard, Eye, EyeSlash } from '../../icons';

const CopySecretButton = ({ apiKeyID }: { apiKeyID: string }) => {
  const { data: apiKeySecret } = useApiKeySecret(apiKeyID);
  const { onCopy } = useClipboard(apiKeySecret ?? '');

  return (
    <Button
      variant='ghost'
      size='sm'
      sx={{ margin: 1 }}
      aria-label={'Copy key'}
      onClick={onCopy}
    >
      <Icon icon={Clipboard} />
    </Button>
  );
};

const SecretInputWithToggle = ({ apiKeyID }: { apiKeyID: string }) => {
  const [revealed, setRevealed] = useState(false);
  const { data: apiKeySecret } = useApiKeySecret(apiKeyID);

  return (
    <Flex
      center
      sx={{
        width: '100%',
        position: 'relative',
      }}
    >
      <Input
        type={revealed ? 'text' : 'password'}
        value={revealed ? (apiKeySecret ?? '') : '•••••••••••••••••••••••••'}
        readOnly
        aria-label='API key (hidden)'
        tabIndex={-1}
        sx={t => ({
          paddingRight: t.sizes.$12,
        })}
      />
      <Button
        variant='ghost'
        size='sm'
        sx={{ position: 'absolute', right: 0 }}
        aria-label={'Show key'}
        onClick={() => setRevealed(!revealed)}
      >
        <Icon icon={revealed ? EyeSlash : Eye} />
      </Button>
    </Flex>
  );
};

export const ApiKeysTable = ({
  rows,
  isLoading,
  onRevoke,
}: {
  rows: ApiKeyResource[];
  isLoading: boolean;
  onRevoke: (id: string) => void;
}) => {
  return (
    <Table sx={{ tableLayout: 'fixed' }}>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Last used</Th>
          <Th>Key</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {isLoading ? (
          <Tr>
            <Td colSpan={4}>
              <Spinner
                colorScheme='primary'
                sx={{ margin: 'auto', display: 'block' }}
              />
            </Td>
          </Tr>
        ) : (
          rows.map(apiKey => (
            <Tr key={apiKey.id}>
              <Td>
                <Text sx={{ fontWeight: 500 }}>{apiKey.name}</Text>
                <Text
                  sx={{ fontSize: 12 }}
                  color='gray.600'
                >
                  Created at{' '}
                  {apiKey.createdAt.toLocaleDateString(undefined, {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </Td>
              <Td>
                <Text
                  sx={{ fontSize: 14 }}
                  color='gray.800'
                >
                  3d ago
                </Text>
              </Td>
              <Td>
                <Flex
                  direction='row'
                  gap={2}
                >
                  <SecretInputWithToggle apiKeyID={apiKey.id} />
                  <CopySecretButton apiKeyID={apiKey.id} />
                </Flex>
              </Td>
              <Td>
                <ThreeDotsMenu
                  actions={[
                    {
                      // @ts-expect-error: TODO: Add locales
                      label: 'Revoke key',
                      isDestructive: true,
                      onClick: () => onRevoke(apiKey.id),
                      isDisabled: false,
                    },
                  ]}
                  elementId={'member'}
                />
              </Td>
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );
};
