import { Col, Table, Tbody, Td, Text, Th, Thead, Tr } from '@/customizables';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';

/** Human labels for the Clerk attributes in the directory's attribute mapping. */
const CLERK_ATTRIBUTE_LABELS: Record<string, string> = {
  userName: 'Username',
  email: 'Email address',
  firstName: 'First name',
  familyName: 'Last name',
};

export const AttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev } = useWizard();
  const { directory } = useConfigureDirectorySync();

  const rows = Object.entries(directory?.attributeMapping ?? {});

  return (
    <>
      <Step.Header
        title='Map directory attributes'
        description='These SCIM attribute paths populate each Clerk user attribute.'
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          <Text
            as='p'
            colorScheme='secondary'
          >
            These defaults cover most directories. Values sync on the next provisioning event.
          </Text>

          <Table
            sx={theme => ({
              'tr > th:first-of-type': { paddingInlineStart: theme.space.$4 },
            })}
          >
            <Thead>
              <Tr>
                <Th>
                  <Text sx={theme => ({ fontSize: theme.fontSizes.$xs })}>Clerk attribute</Text>
                </Th>
                <Th>
                  <Text sx={theme => ({ fontSize: theme.fontSizes.$xs })}>SCIM attribute</Text>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map(([clerkAttribute, scimPath]) => (
                <Tr key={clerkAttribute}>
                  <Td>
                    <Text as='span'>{CLERK_ATTRIBUTE_LABELS[clerkAttribute] ?? clerkAttribute}</Text>
                  </Td>
                  <Td>
                    <Text
                      as='code'
                      colorScheme='secondary'
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {scimPath}
                    </Text>
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
              Attributes not listed here are ignored. Editing the mapping from this flow is coming later; it can be
              adjusted from the Clerk Dashboard.
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
