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
import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';
import { IconButton } from '@/ui/elements/IconButton';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { useClipboard } from '@/ui/hooks';
import { Check, ClipboardOutline, Eye, EyeSlash } from '@/ui/icons';
import { common, mqu } from '@/ui/styledSystem';
import { timeAgo } from '@/ui/utils/timeAgo';

const useApiKeySecret = ({ apiKeyID, enabled }: { apiKeyID: string; enabled: boolean }) => {
  const clerk = useClerk();

  return useSWR(enabled ? ['api-key-secret', apiKeyID] : null, () => clerk.apiKeys.getSecret(apiKeyID));
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
      elementDescriptor={descriptors.apiKeysCopyButton}
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
      sx={theme => ({
        ...common.borderVariants(theme).normal,
        '&:focus-within,&[data-focus-within="true"]': {
          ...common.borderVariants(theme).normal['&:focus'],
        },
      })}
    >
      <Input
        type={revealed ? 'text' : 'password'}
        value={revealed && apiKeySecret ? apiKeySecret : `•`.repeat(25)}
        readOnly
        variant='unstyled'
      />
      <IconButton
        aria-label={`${revealed ? 'Show' : 'Hide'} api key`}
        variant='ghost'
        size='xs'
        focusRing={false}
        hoverAsFocus
        onClick={() => setRevealed(s => !s)}
        sx={theme => ({
          color: theme.colors.$neutralAlpha400,
          borderStartStartRadius: '0',
          borderEndStartRadius: '0',
          borderStartEndRadius: `calc(${theme.radii.$md} - ${theme.borderWidths.$normal})`,
          borderEndEndRadius: `calc(${theme.radii.$md} - ${theme.borderWidths.$normal})`,
        })}
        icon={revealed ? Eye : EyeSlash}
      />
    </Flex>
  );
};

export const ApiKeysTable = ({
  rows,
  isLoading,
  onRevoke,
  elementDescriptor,
  canManageAPIKeys,
}: {
  rows: APIKeyResource[];
  isLoading: boolean;
  onRevoke: (id: string, name: string) => void;
  elementDescriptor?: ElementDescriptor;
  canManageAPIKeys: boolean;
}) => {
  return (
    <Flex sx={t => ({ width: '100%', [mqu.sm]: { overflowX: 'auto', padding: t.space.$0x25 } })}>
      <Table
        sx={t => ({ background: t.colors.$colorBackground })}
        elementDescriptor={elementDescriptor}
      >
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Last used</Th>
            <Th>Key</Th>
            {canManageAPIKeys && <Th>Actions</Th>}
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
                      localizationKey={
                        apiKey.expiration
                          ? localizationKeys('apiKeys.createdAndExpirationStatus__expiresOn', {
                              createdDate: apiKey.createdAt,
                              expiresDate: apiKey.expiration,
                            })
                          : localizationKeys('apiKeys.createdAndExpirationStatus__never', {
                              createdDate: apiKey.createdAt,
                            })
                      }
                    />
                  </Flex>
                </Td>
                <Td>
                  <Box
                    sx={{
                      minWidth: '10ch',
                    }}
                  >
                    <Text localizationKey={apiKey.lastUsedAt ? timeAgo(apiKey.lastUsedAt) : '-'} />
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
                {canManageAPIKeys && (
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
                )}
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
