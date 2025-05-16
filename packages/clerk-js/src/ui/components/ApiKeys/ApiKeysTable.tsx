import { useClerk } from '@clerk/shared/react';
import type { ApiKeyResource } from '@clerk/types';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { timeAgo } from '../../../utils/date';
import {
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
} from '../../customizables';
import { ThreeDotsMenu } from '../../elements';
import { useClipboard } from '../../hooks';
import { Check, Copy, Eye, EyeSlash } from '../../icons';

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
      sx={{ margin: 1 }}
      aria-label={'Copy key'}
      onClick={() => setEnabled(true)}
      focusRing={false}
    >
      <Icon icon={hasCopied ? Check : Copy} />
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
        focusRing={false}
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
          <Th sx={{ width: '15%' }}>Last used</Th>
          <Th>Key</Th>
          <Th sx={{ width: '10%' }}>Actions</Th>
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
                <Text variant='subtitle'>{apiKey.name}</Text>
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
              </Td>
              <Td>
                <Text>{apiKey.lastUsedAt ? timeAgo(apiKey.lastUsedAt) : ''}</Text>
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
                      label: localizationKeys('apiKeys.menuAction__revoke'),
                      isDestructive: true,
                      onClick: () => onRevoke(apiKey.id),
                    },
                  ]}
                />
              </Td>
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
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
