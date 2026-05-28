import { type JSX } from 'react';

import {
  Badge,
  descriptors,
  Flex,
  type LocalizationKey,
  localizationKeys,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@/customizables';

export type AttributeMappingTableConfig = {
  columns: { first: LocalizationKey; second: LocalizationKey };
  rows: ReadonlyArray<{
    id: string;
    isRequired: boolean;
    first: LocalizationKey;
    second: LocalizationKey;
  }>;
  /**
   * When true, the first column renders in a monospace font and the badge
   * sits inline with it
   */
  monoFirst?: boolean;
};

export const AttributeMappingTable = ({ config }: { config: AttributeMappingTableConfig }): JSX.Element => (
  <Table
    elementDescriptor={descriptors.configureSSOAttributeMappingTable}
    sx={theme => ({
      'tr > th:first-of-type': {
        paddingInlineStart: theme.space.$4,
      },
    })}
  >
    <Thead>
      <Tr>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={config.columns.first}
          />
        </Th>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={config.columns.second}
          />
        </Th>
      </Tr>
    </Thead>

    <Tbody>
      {config.rows.map(row => (
        <Tr key={row.id}>
          <Td>
            <Flex
              as='span'
              align='center'
              sx={theme => ({ gap: theme.space.$2 })}
            >
              <Text
                as='span'
                colorScheme={config.monoFirst ? undefined : 'secondary'}
                sx={config.monoFirst ? { fontFamily: 'monospace' } : undefined}
                localizationKey={row.first}
              />
              <Badge
                elementDescriptor={descriptors.configureSSOAttributeMappingBadge}
                elementId={descriptors.configureSSOAttributeMappingBadge.setId(
                  row.isRequired ? 'required' : 'optional',
                )}
                colorScheme={row.isRequired ? 'warning' : 'primary'}
                localizationKey={localizationKeys(
                  row.isRequired
                    ? 'configureSSO.configureStep.attributeMappingTable.badges.required'
                    : 'configureSSO.configureStep.attributeMappingTable.badges.optional',
                )}
              />
            </Flex>
          </Td>
          <Td>
            <Text
              as='span'
              sx={{ fontFamily: 'monospace' }}
              localizationKey={row.second}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);
