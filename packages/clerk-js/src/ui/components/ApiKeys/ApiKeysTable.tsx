import React from 'react';

import { Button, Flex, Icon, Input, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { ThreeDotsMenu } from '../../elements';
import { Eye, EyeSlash } from '../../icons';

export const ApiKeysTable = ({
  apiKeys,
  isLoading,
  revealedKeys,
  toggleSecret,
  revokeApiKey,
  CopyButton,
}: {
  apiKeys: any[];
  isLoading: boolean;
  revealedKeys: Record<string, string | null>;
  toggleSecret: (id: string) => void;
  revokeApiKey: (id: string) => void;
  CopyButton: React.ComponentType<{ apiKeyID: string }>;
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
          apiKeys.map(apiKey => (
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
                  gap={1}
                >
                  <Flex
                    center
                    sx={{
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    <Input
                      type={revealedKeys[apiKey.id] ? 'text' : 'password'}
                      value={revealedKeys[apiKey.id] ?? '•••••••••••••••••••••••••'}
                      readOnly
                      aria-label='API key (hidden)'
                      tabIndex={-1}
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      sx={{ position: 'absolute', right: 0 }}
                      onClick={() => void toggleSecret(apiKey.id)}
                      aria-label={revealedKeys[apiKey.id] ? 'Hide key' : 'Show key'}
                    >
                      <Icon icon={revealedKeys[apiKey.id] ? EyeSlash : Eye} />
                    </Button>
                  </Flex>
                  <CopyButton apiKeyID={apiKey.id} />
                </Flex>
              </Td>
              <Td>
                <ThreeDotsMenu
                  actions={[
                    {
                      // @ts-expect-error: TODO: Add locales
                      label: 'Revoke key',
                      isDestructive: true,
                      onClick: () => void revokeApiKey(apiKey.id),
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
