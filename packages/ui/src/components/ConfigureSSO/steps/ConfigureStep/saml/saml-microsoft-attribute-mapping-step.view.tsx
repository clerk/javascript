import {
  Badge,
  Col,
  descriptors,
  Flex,
  localizationKeys,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@/customizables';

import { Step } from '../../../elements/Step';
import type { WizardStepNavigation } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import { MicrosoftClaimNameCell } from './MicrosoftClaimNameCell';

type MicrosoftAttributeRow = {
  id: 'email' | 'firstName' | 'lastName';
  isRequired: boolean;
};

const MICROSOFT_ATTRIBUTE_ROWS: ReadonlyArray<MicrosoftAttributeRow> = [
  { id: 'email', isRequired: true },
  { id: 'firstName', isRequired: false },
  { id: 'lastName', isRequired: false },
];

const MicrosoftAttributeMappingTable = (): JSX.Element => {
  return (
    <Table
      elementDescriptor={descriptors.configureSSOAttributeMappingTable}
      sx={theme => ({
        'tr > th:first-of-type': { paddingInlineStart: theme.space.$4 },
      })}
    >
      <Thead>
        <Tr>
          <Th>
            <Text
              sx={theme => ({ fontSize: theme.fontSizes.$xs })}
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.columns.attribute',
              )}
            />
          </Th>
          <Th>
            <Text
              sx={theme => ({ fontSize: theme.fontSizes.$xs })}
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.columns.claimName',
              )}
            />
          </Th>
          <Th>
            <Text
              sx={theme => ({ fontSize: theme.fontSizes.$xs })}
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.columns.value',
              )}
            />
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {MICROSOFT_ATTRIBUTE_ROWS.map(row => {
          const claimNameKey = localizationKeys(
            `configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.rows.${row.id}.claimName`,
          );

          return (
            <Tr key={row.id}>
              <Td sx={{ whiteSpace: 'nowrap' }}>
                <Flex
                  as='span'
                  align='center'
                  sx={theme => ({ gap: theme.space.$2 })}
                >
                  <Text
                    as='span'
                    colorScheme='secondary'
                    localizationKey={localizationKeys(
                      `configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.rows.${row.id}.attribute`,
                    )}
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
              <MicrosoftClaimNameCell claimNameKey={claimNameKey} />
              <Td>
                <Text
                  as='span'
                  sx={{ fontFamily: 'monospace' }}
                  localizationKey={localizationKeys(
                    `configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.rows.${row.id}.value`,
                  )}
                />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export const SamlMicrosoftAttributeMappingStepView = ({
  goNext,
  goPrev,
  isFirstStep,
  isLastStep,
}: WizardStepNavigation): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            elementDescriptor={descriptors.configureSSOInstructionsHeading}
            localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.title')}
          />

          <Col
            elementDescriptor={descriptors.configureSSOInstructionsList}
            as='ol'
            sx={theme => ({
              gap: theme.space.$1x5,
              margin: 0,
              paddingInlineStart: theme.space.$5,
              listStyleType: 'decimal',
            })}
          >
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.step1')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.step2')}
            />
          </Col>

          <MicrosoftAttributeMappingTable />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
        <Step.Footer.Previous
          onClick={goPrev}
          isDisabled={isFirstStep}
        />
        <Step.Footer.Continue
          onClick={goNext}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};
