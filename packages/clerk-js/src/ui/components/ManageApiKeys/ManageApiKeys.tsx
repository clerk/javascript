import { useClerk } from '@clerk/shared/react';
import { useState } from 'react';

import { Button, Flex, Flow, Icon, Input, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { useFetch } from '../../hooks';
import { Clipboard, Eye, EyeSlash, Plus } from '../../icons';

export const ManageApiKeys = () => {
  const clerk = useClerk();
  const { data: apiKeys } = useFetch(clerk.getApiKeys, {});
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string | null>>({});

  const toggleSecret = async (id: string) => {
    setRevealedKeys(prev => {
      if (prev[id]) {
        return { ...prev, [id]: null };
      }
      return prev;
    });

    if (!revealedKeys[id]) {
      const secret = await clerk.getApiKeySecret(id);
      setRevealedKeys(prev => ({ ...prev, [id]: secret }));
    }
  };

  return (
    <Flow.Root
      flow='pricingTable'
      sx={{
        width: '100%',
      }}
    >
      <Flex
        justify='between'
        align='center'
        sx={{ marginBottom: 4 }}
      >
        <Input
          placeholder='Search keys...'
          sx={{ width: 220, fontSize: 14 }}
        />
        <Button
          variant='solid'
          sx={{
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 15,
            px: 4,
            py: 2,
          }}
        >
          + Add new key
        </Button>
      </Flex>
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
          {apiKeys?.map(apiKey => (
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
                  {/* Placeholder for "Last used" */}
                  3d ago
                </Text>
              </Td>
              <Td>
                <Input
                  type='text'
                  value={revealedKeys[apiKey.id] ?? '•••••••••••••'}
                  readOnly
                  sx={{
                    width: 120,
                  }}
                  aria-label='API key (hidden)'
                  tabIndex={-1}
                />
                <Button
                  variant='ghost'
                  size='sm'
                  sx={{ margin: 2 }}
                  onClick={() => void toggleSecret(apiKey.id)}
                  aria-label={revealedKeys[apiKey.id] ? 'Hide key' : 'Show key'}
                >
                  <Icon icon={revealedKeys[apiKey.id] ? EyeSlash : Eye} />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  sx={{ margin: 1 }}
                  aria-label='Copy key'
                >
                  <Icon icon={Clipboard} />
                </Button>
              </Td>
              <Td>
                <Button
                  variant='ghost'
                  size='sm'
                  aria-label='More actions'
                >
                  <Icon icon={Plus} />
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flow.Root>
  );
};
