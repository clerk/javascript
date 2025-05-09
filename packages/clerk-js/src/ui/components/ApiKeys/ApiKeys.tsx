import { useClerk } from '@clerk/shared/react';
import { useState } from 'react';

import { useApiKeysContext } from '../../contexts';
import {
  Box,
  Button,
  Col,
  Flex,
  Flow,
  Icon,
  Input,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '../../customizables';
import { Card, InputWithIcon, Pagination, ThreeDotsMenu, withCardStateProvider } from '../../elements';
import { Action } from '../../elements/Action';
import { useClipboard, useFetch } from '../../hooks';
import { Clipboard, Eye, EyeSlash, MagnifyingGlass } from '../../icons';
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

export const ApiKeys = withCardStateProvider(() => {
  const clerk = useClerk();
  const ctx = useApiKeysContext();
  const {
    data: apiKeys,
    isLoading,
    revalidate,
  } = useFetch(clerk.getApiKeys, { subject: ctx.subject }, undefined, `api-key-source-${ctx.subject}`);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string | null>>({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = ctx.perPage ?? 5;

  const filteredApiKeys = (apiKeys ?? []).filter(key => key.name.toLowerCase().includes(search.toLowerCase()));

  const itemCount = filteredApiKeys.length;
  const pageCount = Math.max(1, Math.ceil(itemCount / itemsPerPage));
  const startingRow = itemCount > 0 ? (page - 1) * itemsPerPage + 1 : 0;
  const endingRow = Math.min(page * itemsPerPage, itemCount);
  const paginatedApiKeys = filteredApiKeys.slice(startingRow - 1, endingRow);

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

  const handleCreate = async (params: {
    name: string;
    description?: string;
    expiration?: number;
    closeFn: () => void;
  }) => {
    await clerk.createApiKey({
      name: params.name,
      creationReason: params.description,
      secondsUntilExpiration: params.expiration,
    });
    params.closeFn();
    revalidate();
  };

  const revokeApiKey = async (apiKeyID: string) => {
    await clerk.revokeApiKey({ apiKeyID, revocationReason: 'Revoked by user' });
    setPage(1);
    revalidate();
  };

  return (
    <Flow.Root flow='apiKey'>
      <Card.Root sx={{ width: '100%' }}>
        <Card.Content sx={{ textAlign: 'left' }}>
          <Col gap={4}>
            <Action.Root>
              <Flex
                justify='between'
                align='center'
              >
                <Box>
                  <InputWithIcon
                    placeholder='Search keys'
                    leftIcon={<Icon icon={MagnifyingGlass} />}
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </Box>
                <Action.Trigger value='add'>
                  <Button variant='solid'>Add new key</Button>
                </Action.Trigger>
              </Flex>

              <Action.Open value='add'>
                <Flex
                  sx={t => ({
                    paddingTop: t.space.$6,
                    paddingBottom: t.space.$6,
                  })}
                >
                  <Action.Card
                    sx={{
                      width: '100%',
                    }}
                  >
                    <CreateApiKeyForm onCreate={params => void handleCreate(params)} />
                  </Action.Card>
                </Flex>
              </Action.Open>
            </Action.Root>

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
                  paginatedApiKeys.map(apiKey => (
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
                              // @ts-expect-error: Add to locales
                              label: 'Revoke',
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

            {itemCount > 5 && (
              <Pagination
                count={pageCount}
                page={page}
                onChange={setPage}
                siblingCount={1}
                rowInfo={{
                  allRowsCount: itemCount,
                  startingRow,
                  endingRow,
                }}
              />
            )}
          </Col>
        </Card.Content>
      </Card.Root>
    </Flow.Root>
  );
});
