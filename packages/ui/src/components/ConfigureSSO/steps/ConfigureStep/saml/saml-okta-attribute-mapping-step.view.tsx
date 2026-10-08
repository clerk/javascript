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

type OktaAttributeRow = {
  id: 'email' | 'firstName' | 'lastName';
  isRequired: boolean;
};

const OKTA_ATTRIBUTE_ROWS: ReadonlyArray<OktaAttributeRow> = [
  { id: 'email', isRequired: true },
  { id: 'firstName', isRequired: false },
  { id: 'lastName', isRequired: false },
];

const OktaAttributeMappingTable = (): JSX.Element => (
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
              'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.columns.name',
            )}
          />
        </Th>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={localizationKeys(
              'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.columns.expression',
            )}
          />
        </Th>
      </Tr>
    </Thead>
    <Tbody>
      {OKTA_ATTRIBUTE_ROWS.map(row => (
        <Tr key={row.id}>
          <Td>
            <Flex
              as='span'
              align='center'
              sx={theme => ({ gap: theme.space.$2 })}
            >
              <Text
                as='span'
                sx={{ fontFamily: 'monospace' }}
                localizationKey={localizationKeys(
                  `configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.${row.id}.name`,
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
          <Td>
            <Text
              as='span'
              sx={{ fontFamily: 'monospace' }}
              localizationKey={localizationKeys(
                `configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.${row.id}.expression`,
              )}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

export const SamlOktaAttributeMappingStepView = ({
  goNext,
  goPrev,
  isFirstStep,
  isLastStep,
}: WizardStepNavigation): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.paragraph')}
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
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.step1')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.step2')}
            />
          </Col>

          <OktaAttributeMappingTable />
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
