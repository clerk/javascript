import { Badge, Col, Flex, Table, Tbody, Td, Text, Th, Thead, Tr } from '@/customizables';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';

type AttributeRow = {
  scimPath: string;
  clerkAttribute: string;
  isRequired: boolean;
};

const ATTRIBUTE_ROWS: ReadonlyArray<AttributeRow> = [
  { scimPath: 'userName', clerkAttribute: 'Email address', isRequired: true },
  { scimPath: 'externalId', clerkAttribute: 'External user ID', isRequired: true },
  { scimPath: 'name.givenName', clerkAttribute: 'First name', isRequired: false },
  { scimPath: 'name.familyName', clerkAttribute: 'Last name', isRequired: false },
  { scimPath: 'active', clerkAttribute: 'Membership status', isRequired: true },
];

export const AttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev } = useWizard();

  return (
    <>
      <Step.Header
        title='Map directory attributes'
        description='Choose which SCIM attributes populate each Clerk user attribute.'
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          <Text
            as='p'
            colorScheme='secondary'
          >
            These defaults cover most directories. If your directory uses custom attribute paths, adjust them here —
            values sync on the next provisioning event.
          </Text>

          <Table
            sx={theme => ({
              'tr > th:first-of-type': { paddingInlineStart: theme.space.$4 },
            })}
          >
            <Thead>
              <Tr>
                <Th>
                  <Text sx={theme => ({ fontSize: theme.fontSizes.$xs })}>SCIM attribute</Text>
                </Th>
                <Th>
                  <Text sx={theme => ({ fontSize: theme.fontSizes.$xs })}>Clerk attribute</Text>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {ATTRIBUTE_ROWS.map(row => (
                <Tr key={row.scimPath}>
                  <Td>
                    <Flex
                      as='span'
                      align='center'
                      sx={theme => ({ gap: theme.space.$2 })}
                    >
                      <Text
                        as='code'
                        colorScheme='secondary'
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {row.scimPath}
                      </Text>
                      <Badge colorScheme={row.isRequired ? 'warning' : 'primary'}>
                        {row.isRequired ? 'Required' : 'Optional'}
                      </Badge>
                    </Flex>
                  </Td>
                  <Td>
                    <Text as='span'>{row.clerkAttribute}</Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Col sx={t => ({ gap: t.space.$1 })}>
            <Text
              as='p'
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
            >
              Attributes not listed here are ignored. Custom attribute mapping (e.g. job title, department) is a
              possible v2 surface.
            </Text>
          </Col>
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous onClick={() => goPrev()} />
        <Step.Footer.Continue onClick={() => goNext()} />
      </Step.Footer>
    </>
  );
};
