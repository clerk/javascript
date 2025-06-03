import { useClerk } from '@clerk/shared/react';
import type { APIKeyResource } from '@clerk/types';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import {
  Box,
  Button,
  descriptors,
  Flex,
  Icon,
  Input,
  localizationKeys,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@/ui/customizables';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { useClipboard } from '@/ui/hooks';
import { Check, ClipboardOutline, Eye, EyeSlash } from '@/ui/icons';
import { common, mqu } from '@/ui/styledSystem';
import { timeAgo } from '@/utils/date';

const useApiKeySecret = ({ apiKeyID, enabled }: { apiKeyID: string; enabled: boolean }) => {
  const clerk = useClerk();

  return useSWR(enabled ? ['api-key-secret', apiKeyID] : null, () => clerk.getApiKeySecret(apiKeyID));
};

const CopySecretButton = ({ apiKeyID }: { apiKeyID: string }) => {
  const [enabled, setEnabled] = useState(false);
  const { data: apiKeySecret } = useApiKeySecret({ apiKeyID, enabled });
  const { onCopy, hasCopied } = useClipboard(apiKeySecret ?? '');

  useEffect(() => {
    if (enabled && apiKeySecret) {
      onCopy();
      setEnabled(false);
    }
  }, [enabled, apiKeySecret, onCopy]);

  return (
    <Button
      variant='ghost'
      aria-label={hasCopied ? 'Copied API key to clipboard' : 'Copy API key'}
      onClick={() => setEnabled(true)}
      focusRing={false}
    >
      <Icon
        size='sm'
        icon={hasCopied ? Check : ClipboardOutline}
        sx={t => ({ color: t.colors.$primary500 })}
      />
    </Button>
  );
};

const SecretInputWithToggle = ({ apiKeyID }: { apiKeyID: string }) => {
  const [revealed, setRevealed] = useState(false);
  const { data: apiKeySecret } = useApiKeySecret({ apiKeyID, enabled: revealed });

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
        value={revealed && apiKeySecret ? apiKeySecret : `•`.repeat(25)}
        readOnly
        aria-label='API key (hidden)'
        sx={t => ({
          paddingInlineEnd: t.sizes.$12,
        })}
      />
      <Button
        variant='ghost'
        sx={t => ({
          position: 'absolute',
          right: 0,
          '&:focus-visible': {
            ...common.focusRingStyles(t),
          },
        })}
        focusRing={false}
        aria-label={'Show key'}
        onClick={() => setRevealed(!revealed)}
      >
        <Icon
          icon={revealed ? EyeSlash : Eye}
          sx={t => ({ color: t.colors.$colorTextSecondary })}
        />
      </Button>
    </Flex>
  );
};

export const ApiKeysTable = ({
  rows,
  isLoading,
  onRevoke,
}: {
  rows: APIKeyResource[];
  isLoading: boolean;
  onRevoke: (id: string, name: string) => void;
}) => {
  return (
    <Flex sx={t => ({ width: '100%', [mqu.sm]: { overflowX: 'auto', padding: t.space.$0x25 } })}>
      <Table sx={t => ({ background: t.colors.$colorBackground })}>
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
                  elementDescriptor={descriptors.spinner}
                />
              </Td>
            </Tr>
          ) : !rows.length ? (
            <EmptyRow />
          ) : (
            rows.map(apiKey => (
              <Tr key={apiKey.id}>
                <Td>
                  <Flex
                    direction='col'
                    sx={{ minWidth: '25ch' }}
                  >
                    <Text
                      variant='subtitle'
                      truncate
                    >
                      {apiKey.name}
                    </Text>
                    <Text
                      variant='caption'
                      colorScheme='secondary'
                    >
                      Created at{' '}
                      {apiKey.createdAt.toLocaleDateString(undefined, {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })}
                    </Text>
                  </Flex>
                </Td>
                <Td>
                  <Box
                    sx={{
                      [mqu.sm]: {
                        minWidth: '10ch',
                      },
                    }}
                  >
                    <Text>{apiKey.lastUsedAt ? timeAgo(apiKey.lastUsedAt) : '-'}</Text>
                  </Box>
                </Td>
                <Td>
                  <Flex
                    direction='row'
                    gap={1}
                    sx={{
                      [mqu.sm]: {
                        minWidth: '25ch',
                      },
                    }}
                  >
                    <SecretInputWithToggle apiKeyID={apiKey.id} />
                    <CopySecretButton apiKeyID={apiKey.id} />
                  </Flex>
                </Td>
                <Td>
                  <ThreeDotsMenu
                    actions={[
                      {
                        label: localizationKeys('apiKeys.menuAction__revoke'),
                        isDestructive: true,
                        onClick: () => onRevoke(apiKey.id, apiKey.name),
                      },
                    ]}
                  />
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Flex>
  );
};

const EmptyRow = () => {
  return (
    <Tr>
      <Td colSpan={4}>
        <Text
          localizationKey={localizationKeys('apiKeys.detailsTitle__emptyRow')}
          sx={{
            margin: 'auto',
            display: 'block',
            width: 'fit-content',
          }}
        />
      </Td>
    </Tr>
  );
};
