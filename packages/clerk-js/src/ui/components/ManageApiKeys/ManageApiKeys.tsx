import { useClerk } from '@clerk/shared/react';
import { useState } from 'react';

import { useManageApiKeysContext } from '../../contexts';
import { Button, Flex, Flow, Icon, Input, Table, Tbody, Td, Text, Th, Thead, Tr } from '../../customizables';
import { useClipboard, useFetch } from '../../hooks';
import { Clipboard, Eye, EyeSlash, Plus } from '../../icons';
import { CreateApiKeyForm } from './CreateApiKeyForm';

const CopyButton = ({ apiKeyID }: { apiKeyID: string }) => {
  const clerk = useClerk();
  const [text, setText] = useState('');
  const { onCopy, hasCopied } = useClipboard(text);

  const fetchSecret = async () => {
    const secret = await clerk.getApiKeySecret(apiKeyID);
    setText(secret);
    onCopy();
  };

  return (
    <Button
      variant='ghost'
      onClick={() => void fetchSecret()}
      size='sm'
      sx={{ margin: 1 }}
      aria-label={hasCopied ? 'Copied' : 'Copy key'}
    >
      <Icon icon={Clipboard} />
    </Button>
  );
};

export const ManageApiKeys = () => {
  const clerk = useClerk();
  const ctx = useManageApiKeysContext();
  const { data: apiKeys, revalidate } = useFetch(() => clerk.getApiKeys({ subject: ctx.subject }), {});
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string | null>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const handleCreate = async (name: string) => {
    setCreating(true);
    try {
      await clerk.createApiKey({ name });
      setShowCreateForm(false);
      revalidate();
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
          onClick={() => setShowCreateForm(true)}
        >
          Add new key
        </Button>
      </Flex>

      {showCreateForm && (
        <CreateApiKeyForm
          onCreate={name => void handleCreate(name)}
          onCancel={() => setShowCreateForm(false)}
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
                <CopyButton apiKeyID={apiKey.id} />
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
