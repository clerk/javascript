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
import { Tooltip } from '@/elements/Tooltip';

export type AttributeMappingTableConfig = {
  columns: { first: LocalizationKey; second: LocalizationKey; third?: LocalizationKey };
  rows: ReadonlyArray<{
    id: string;
    isRequired: boolean;
    first: LocalizationKey;
    second: LocalizationKey;
    third?: LocalizationKey;
  }>;
  /**
   * When true, the first column renders in a monospace font and the badge
   * sits inline with it.
   */
  monoFirst?: boolean;
  /**
   * When true, the second column truncates overflowing text with an ellipsis
   * and reveals the full value in a tooltip on hover. Useful for long values
   * such as SAML claim name URLs that don't fit the column.
   */
  truncateSecond?: boolean;
};

export const AttributeMappingTable = ({ config }: { config: AttributeMappingTableConfig }): JSX.Element => {
  const thirdColumn = config.columns.third;

  return (
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
          {thirdColumn ? (
            <Th>
              <Text
                sx={theme => ({ fontSize: theme.fontSizes.$xs })}
                localizationKey={thirdColumn}
              />
            </Th>
          ) : null}
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
            {config.truncateSecond ? (
              <Td sx={{ maxWidth: 0, width: '100%' }}>
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <Text
                      as='span'
                      sx={{
                        fontFamily: 'monospace',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      localizationKey={row.second}
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Content text={row.second} />
                </Tooltip.Root>
              </Td>
            ) : (
              <Td>
                <Text
                  as='span'
                  sx={{ fontFamily: 'monospace' }}
                  localizationKey={row.second}
                />
              </Td>
            )}
            {thirdColumn && row.third ? (
              <Td>
                <Text
                  as='span'
                  sx={{ fontFamily: 'monospace' }}
                  localizationKey={row.third}
                />
              </Td>
            ) : null}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
