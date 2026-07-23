import React, { type JSX } from 'react';

import { Badge, descriptors, Flex, localizationKeys, Table, Tbody, Td, Text, Th, Thead, Tr } from '@/customizables';

import { Step } from '../../../../elements/Step';
import { useWizard } from '../../../../elements/Wizard';
import { InnerStepCounter } from '../../../../elements/Wizard/InnerStepCounter';

type OidcClaimRow = {
  id: 'subject' | 'email' | 'firstName' | 'lastName';
  isRequired: boolean;
};

const OIDC_CLAIM_ROWS: ReadonlyArray<OidcClaimRow> = [
  { id: 'subject', isRequired: true },
  { id: 'email', isRequired: true },
  { id: 'firstName', isRequired: false },
  { id: 'lastName', isRequired: false },
];

const OidcClaimsTable = (): JSX.Element => (
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
              'configureSSO.configureStep.oidcCustom.claimsStep.attributeMappingTable.columns.attributeName',
            )}
          />
        </Th>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={localizationKeys(
              'configureSSO.configureStep.oidcCustom.claimsStep.attributeMappingTable.columns.userAttribute',
            )}
          />
        </Th>
      </Tr>
    </Thead>
    <Tbody>
      {OIDC_CLAIM_ROWS.map(row => (
        <Tr key={row.id}>
          <Td>
            <Flex
              as='span'
              align='center'
              sx={theme => ({ gap: theme.space.$2 })}
            >
              <Text
                as='span'
                colorScheme='secondary'
                sx={{ fontFamily: 'monospace' }}
                localizationKey={localizationKeys(
                  `configureSSO.configureStep.oidcCustom.claimsStep.attributeMappingTable.rows.${row.id}.userAttribute`,
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
              localizationKey={localizationKeys(
                `configureSSO.configureStep.oidcCustom.claimsStep.attributeMappingTable.rows.${row.id}.attributeName`,
              )}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

export const OidcClaimsStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.claimsStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.oidcCustom.claimsStep.paragraph')}
          />

          <OidcClaimsTable />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep}
        />
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};
