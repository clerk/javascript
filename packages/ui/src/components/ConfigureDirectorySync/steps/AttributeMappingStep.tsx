import type { LocalizationKey } from '@/customizables';
import { descriptors, localizationKeys, Table, Tbody, Td, Text, Th, Thead, Tr } from '@/customizables';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';

type ColumnId = 'directory' | 'clerk';

const AttributeValue = ({ column, children }: { column: ColumnId; children: string }): JSX.Element => (
  <Text
    elementDescriptor={descriptors.configureDirectorySyncAttributeMappingValue}
    elementId={descriptors.configureDirectorySyncAttributeMappingValue.setId(column)}
    as='code'
    sx={t => ({ fontFamily: 'monospace', fontSize: t.fontSizes.$sm })}
  >
    {children}
  </Text>
);

const ColumnHeader = ({
  column,
  localizationKey,
}: {
  column: ColumnId;
  localizationKey: LocalizationKey;
}): JSX.Element => (
  <Text
    elementDescriptor={descriptors.configureDirectorySyncAttributeMappingHeader}
    elementId={descriptors.configureDirectorySyncAttributeMappingHeader.setId(column)}
    as='span'
    colorScheme='secondary'
    localizationKey={localizationKey}
    sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$normal })}
  />
);

export const AttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev } = useWizard();
  const { directory } = useConfigureDirectorySync();

  const rows = Object.entries(directory?.attributeMapping ?? {})
    .map(([clerkAttribute, scimPath]) => ({ clerkAttribute, scimPath }))
    .sort((a, b) => a.scimPath.localeCompare(b.scimPath));

  return (
    <>
      <Step.Header
        title={localizationKeys('configureDirectorySync.attributeMappingStep.title')}
        description={localizationKeys('configureDirectorySync.attributeMappingStep.subtitle')}
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          <Table
            elementDescriptor={descriptors.configureDirectorySyncAttributeMappingTable}
            sx={t => ({
              'tr > th': { paddingBlock: t.space.$2, paddingInline: t.space.$4 },
              'tr > td': { paddingBlock: t.space.$3 },
            })}
          >
            <Thead>
              <Tr>
                <Th>
                  <ColumnHeader
                    column='directory'
                    localizationKey={localizationKeys(
                      'configureDirectorySync.attributeMappingStep.columns.directoryAttribute',
                    )}
                  />
                </Th>
                <Th>
                  <ColumnHeader
                    column='clerk'
                    localizationKey={localizationKeys(
                      'configureDirectorySync.attributeMappingStep.columns.clerkAttribute',
                    )}
                  />
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map(({ clerkAttribute, scimPath }) => (
                <Tr key={clerkAttribute}>
                  <Td>
                    <AttributeValue column='directory'>{scimPath}</AttributeValue>
                  </Td>
                  <Td>
                    <AttributeValue column='clerk'>{clerkAttribute}</AttributeValue>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous onClick={() => goPrev()} />
        <Step.Footer.Continue onClick={() => goNext()} />
      </Step.Footer>
    </>
  );
};
