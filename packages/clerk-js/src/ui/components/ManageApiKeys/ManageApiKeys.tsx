import { useClerk } from '@clerk/shared/react';
import { useState } from 'react';

import { Box, Button, Flex, Flow, Icon, Input, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { useFetch } from '../../hooks';
import { Clipboard, Eye, EyeSlash, Plus } from '../../icons';

// AddApiKeyForm component
const AddApiKeyForm = ({
  onCreate,
  onCancel,
  loading,
}: {
  onCreate: (name: string) => void;
  onCancel: () => void;
  loading?: boolean;
}) => {
  const [name, setName] = useState('');

  return (
    <Box
      sx={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 4px #0001',
        p: 6,
        mb: 6,
        mt: 2,
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Text sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>Add new API key</Text>
      <Text sx={{ fontSize: 14, color: 'gray.700', mb: 4 }}>Secret key name</Text>
      <Input
        placeholder='Enter a name for your API key'
        value={name}
        onChange={e => setName(e.target.value)}
        sx={{
          width: '100%',
          fontSize: 16,
          mb: 5,
          borderRadius: 8,
          border: '1px solid #ddd',
          background: '#fafafa',
          py: 3,
          px: 3,
        }}
      />
      <Flex
        justify='end'
        gap={3}
      >
        <Button
          variant='ghost'
          onClick={onCancel}
          sx={{
            fontWeight: 500,
            fontSize: 15,
            px: 4,
            py: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          variant='solid'
          onClick={() => onCreate(name)}
          disabled={!name || loading}
          sx={{
            fontWeight: 500,
            fontSize: 15,
            px: 4,
            py: 2,
            background: '#18181b',
            color: '#fff',
            borderRadius: 8,
            opacity: !name ? 0.5 : 1,
            cursor: !name ? 'not-allowed' : 'pointer',
          }}
        >
          Create key
        </Button>
      </Flex>
    </Box>
  );
};

export const ManageApiKeys = () => {
  const clerk = useClerk();
  const { data: apiKeys } = useFetch(clerk.getApiKeys, {});
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string | null>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);

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

  const handleCreate = async (_name: string) => {
    setCreating(true);
    try {
      // await clerk.createApiKey({ name });
      setShowAddForm(false);
      // refetch?.();
    } finally {
      setCreating(false);
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
          onClick={() => setShowAddForm(true)}
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

      {showAddForm && (
        <AddApiKeyForm
          onCreate={() => void handleCreate('')}
          onCancel={() => setShowAddForm(false)}
          loading={creating}
        />
      )}

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
