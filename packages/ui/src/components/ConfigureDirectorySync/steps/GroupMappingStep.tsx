import { Badge, Col, Flex, Table, Tbody, Td, Text, Th, Thead, Tr } from '@/customizables';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';

const SKETCH_ROWS: ReadonlyArray<{ group: string; target: string }> = [
  { group: 'Engineering', target: 'Member' },
  { group: 'IT Admins', target: 'Admin' },
  { group: 'Contractors', target: '(not mapped)' },
];

/**
 * Deliberately an open-question placeholder, not a proposal. This step exists
 * so the team actively discusses group mapping during the flow review.
 */
export const GroupMappingStep = (): JSX.Element => {
  const { goNext, goPrev } = useWizard();

  return (
    <>
      <Step.Header
        title='Group mapping'
        description='How should directory groups map into Clerk?'
        badge={<Badge colorScheme='warning'>Open question</Badge>}
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          <Col
            sx={t => ({
              gap: t.space.$4,
              padding: t.space.$5,
              borderRadius: t.radii.$md,
              borderWidth: t.borderWidths.$normal,
              borderStyle: 'dashed',
              borderColor: t.colors.$warning500,
            })}
          >
            <Text
              as='p'
              sx={t => ({ fontWeight: t.fontWeights.$medium })}
            >
              This step is a placeholder to force the discussion — nothing here is decided.
            </Text>

            <Col sx={t => ({ gap: t.space.$2 })}>
              <Text
                as='p'
                colorScheme='secondary'
              >
                Directories push group membership alongside users. What should Clerk do with it?
              </Text>

              <Col
                as='ol'
                sx={t => ({ gap: t.space.$1x5, paddingInlineStart: t.space.$5, listStyle: 'upper-alpha' })}
              >
                <Text
                  as='li'
                  colorScheme='secondary'
                >
                  Map IdP groups to organization roles (sketched below) — simple, but conflates access groups with
                  roles.
                </Text>
                <Text
                  as='li'
                  colorScheme='secondary'
                >
                  Map IdP groups to organization memberships — a group decides who is in the org at all.
                </Text>
                <Text
                  as='li'
                  colorScheme='secondary'
                >
                  Ignore groups in v1 and provision users only — smallest scope, defers the modeling question.
                </Text>
              </Col>
            </Col>
          </Col>

          <Col sx={t => ({ gap: t.space.$2 })}>
            <Text
              as='p'
              colorScheme='secondary'
              sx={t => ({ fontSize: t.fontSizes.$sm })}
            >
              Rough sketch of option A, for discussion only:
            </Text>

            <Table
              sx={theme => ({
                'tr > th:first-of-type': { paddingInlineStart: theme.space.$4 },
                opacity: 0.7,
              })}
            >
              <Thead>
                <Tr>
                  <Th>
                    <Text sx={theme => ({ fontSize: theme.fontSizes.$xs })}>Directory group</Text>
                  </Th>
                  <Th>
                    <Text sx={theme => ({ fontSize: theme.fontSizes.$xs })}>Clerk role</Text>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {SKETCH_ROWS.map(row => (
                  <Tr key={row.group}>
                    <Td>
                      <Flex
                        as='span'
                        align='center'
                        sx={theme => ({ gap: theme.space.$2 })}
                      >
                        <Text as='span'>{row.group}</Text>
                      </Flex>
                    </Td>
                    <Td>
                      <Text
                        as='span'
                        colorScheme={row.target === '(not mapped)' ? 'secondary' : undefined}
                      >
                        {row.target}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
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
