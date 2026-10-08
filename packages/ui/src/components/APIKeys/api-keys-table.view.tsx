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
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { mqu } from '@/ui/styledSystem';

import type { APIKeysTableData } from './api-keys.types';

export const APIKeysTableView = ({ rows, isLoading, elementDescriptor, canManageAPIKeys }: APIKeysTableData) => (
  <Flex sx={t => ({ width: '100%', [mqu.sm]: { overflowX: 'auto', padding: t.space.$0x25 } })}>
    <Table
      sx={t => ({ background: t.colors.$colorBackground })}
      elementDescriptor={elementDescriptor}
    >
      <Thead>
        <Tr>
          <Th localizationKey={localizationKeys('apiKeys.tableHeader__name')} />
          <Th localizationKey={localizationKeys('apiKeys.tableHeader__lastUsed')} />
          {canManageAPIKeys && (
            <Th
              localizationKey={localizationKeys('apiKeys.tableHeader__actions')}
              sx={{ textAlign: 'end' }}
            />
          )}
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
                    localizationKey={apiKey.createdStatus}
                  />
                </Flex>
              </Td>
              <Td>
                <Box sx={{ minWidth: '10ch' }}>
                  <Text localizationKey={apiKey.lastUsed} />
                </Box>
              </Td>
              {canManageAPIKeys && (
                <Td sx={{ textAlign: 'end' }}>
                  <ThreeDotsMenu
                    actions={[
                      {
                        label: localizationKeys('apiKeys.menuAction__revoke'),
                        isDestructive: true,
                        onClick: apiKey.onRevoke,
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

const EmptyRow = () => (
  <Tr>
    <Td colSpan={4}>
      <Text
        localizationKey={localizationKeys('apiKeys.detailsTitle__emptyRow')}
        sx={{ margin: 'auto', display: 'block', width: 'fit-content' }}
      />
    </Td>
  </Tr>
);
