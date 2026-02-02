import type { APIKeyResource } from '@clerk/shared/types';

import {
  Box,
  descriptors,
  Flex,
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
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { mqu } from '@/ui/styledSystem';
import { timeAgo } from '@/ui/utils/timeAgo';

export const APIKeysTable = ({
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
            {canManageAPIKeys && <Th sx={{ textAlign: 'right' }}>Actions</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            <Tr>
              <Td colSpan={3}>
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
                {canManageAPIKeys && (
                  <Td sx={{ textAlign: 'right' }}>
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
