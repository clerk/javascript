import { type JSX } from 'react';

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
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import { Step } from '../../../../elements/Step';
import { useWizard } from '../../../../elements/Wizard';
import { InnerStepCounter } from '../../../../elements/Wizard/InnerStepCounter';

type OidcClaimRow = {
  id: 'subject' | 'email' | 'firstName' | 'lastName';
  claim: 'sub' | 'email' | 'given_name' | 'family_name';
  isRequired: boolean;
};

const OIDC_CLAIM_ROWS: ReadonlyArray<OidcClaimRow> = [
  { id: 'subject', claim: 'sub', isRequired: true },
  { id: 'email', claim: 'email', isRequired: true },
  { id: 'firstName', claim: 'given_name', isRequired: false },
  { id: 'lastName', claim: 'family_name', isRequired: false },
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
              'configureSSO.configureStep.oidcCustom.redirectUriStep.claims.table.columns.claim',
            )}
          />
        </Th>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={localizationKeys(
              'configureSSO.configureStep.oidcCustom.redirectUriStep.claims.table.columns.attribute',
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
                as='code'
                colorScheme='secondary'
                sx={{ fontFamily: 'monospace' }}
              >
                {row.claim}
              </Text>
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
                `configureSSO.configureStep.oidcCustom.redirectUriStep.claims.table.rows.${row.id}.attribute`,
              )}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

export const OidcRedirectUriStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();
  const redirectUri = enterpriseConnection?.oauthConfig?.redirectUri ?? '';
  const redirectUriField = useFormControl('redirectUri', redirectUri, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.redirectUri.label'),
    isRequired: false,
  });

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.paragraph')}
            />
          </Col>

          <Form.ControlRow elementId={redirectUriField.id}>
            <Form.CommonInputWrapper {...redirectUriField.props}>
              <ClipboardInput
                value={redirectUri}
                readOnly
                copyIcon={Clipboard}
                copiedIcon={Checkmark}
              />
            </Form.CommonInputWrapper>
          </Form.ControlRow>

          <Col sx={theme => ({ gap: theme.space.$3 })}>
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.oidcCustom.redirectUriStep.claims.description',
              )}
            />
            <OidcClaimsTable />
          </Col>
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
