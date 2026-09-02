import { Table, Tbody, Td, Text, Th, Thead, Tr } from '@/customizables';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';

const MonoText = ({ children }: { children: string }): JSX.Element => (
  <Text
    as='code'
    sx={t => ({ fontFamily: 'monospace', fontSize: t.fontSizes.$sm })}
  >
    {children}
  </Text>
);

const HeaderText = ({ children }: { children: string }): JSX.Element => (
  <Text
    as='span'
    colorScheme='secondary'
    sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$normal })}
  >
    {children}
  </Text>
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
        title='Attribute review'
        description='Standard directory attributes are pre-configured by Clerk. Attributes not listed here are ignored.'
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          <Table
            sx={t => ({
              'tr > th': { paddingBlock: t.space.$2, paddingInline: t.space.$4 },
              'tr > td': { paddingBlock: t.space.$3 },
            })}
          >
            <Thead>
              <Tr>
                <Th>
                  <HeaderText>Directory attributes</HeaderText>
                </Th>
                <Th>
                  <HeaderText>Clerk User attributes</HeaderText>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map(({ clerkAttribute, scimPath }) => (
                <Tr key={clerkAttribute}>
                  <Td>
                    <MonoText>{scimPath}</MonoText>
                  </Td>
                  <Td>
                    <MonoText>{clerkAttribute}</MonoText>
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
