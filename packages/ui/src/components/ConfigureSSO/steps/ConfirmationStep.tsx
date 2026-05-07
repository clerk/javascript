import { useReverification } from '@clerk/shared/react';
import React from 'react';

import { Badge, Box, Button, Col, descriptors, Flex, Flow, Spinner, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { useConfigureSSOWizard } from '../wizard';
import { StepLayout } from './StepLayout';

export const ConfirmationStep = (): JSX.Element => {
  const { goToStep } = useConfigureSSOWizard();
  const { enterpriseConnection, updateEnterpriseConnection, deleteEnterpriseConnection } = useConfigureSSOFlow();
  const card = useCardState();

  const updateActive = useReverification((id: string, active: boolean) => updateEnterpriseConnection(id, { active }));
  const deleteConnection = useReverification((id: string) => deleteEnterpriseConnection(id));

  const [isToggling, setIsToggling] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  // Defensive: this step is only mounted with an existing connection,
  // but if the user lands here directly with no connection, send them
  // back to the very first step
  React.useEffect(() => {
    if (!enterpriseConnection) {
      void goToStep('select-provider');
    }
  }, [enterpriseConnection, goToStep]);

  if (!enterpriseConnection) {
    return (
      <Flow.Part part='sso-confirmation'>
        <StepLayout hideStepIndicator>
          <Flex
            align='center'
            justify='center'
            sx={{ flex: 1 }}
          >
            <Spinner
              size='sm'
              colorScheme='neutral'
            />
          </Flex>
        </StepLayout>
      </Flow.Part>
    );
  }

  const isActive = enterpriseConnection.active;
  const domain = enterpriseConnection.domains[0] ?? '';
  const saml = enterpriseConnection.samlConnection;

  const handleToggle = async () => {
    setIsToggling(true);
    card.setError(undefined);
    try {
      await updateActive(enterpriseConnection.id, !isActive);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      setIsToggling(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    card.setError(undefined);
    try {
      await deleteConnection(enterpriseConnection.id);
      // After deletion, the parent's React Query cache invalidates and
      // the wizard rehydrates with `enterpriseConnection === undefined`,
      // so we send the user back to the start of the flow
      void goToStep('select-provider');
    } catch (err) {
      handleError(err as Error, [], card.setError);
      setIsResetting(false);
    }
  };

  return (
    <Flow.Part part='sso-confirmation'>
      <StepLayout hideStepIndicator>
        <Col sx={t => ({ gap: 0, paddingBlockEnd: t.space.$4 })}>
          <Section>
            <SectionRow
              label='SSO Status'
              value={
                <Badge
                  colorScheme={isActive ? 'success' : 'danger'}
                  textVariant='caption'
                >
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              }
            />
          </Section>

          <Section>
            <SectionRow
              label='Enable SSO'
              value={
                <Toggle
                  isActive={isActive}
                  isLoading={isToggling}
                  onClick={handleToggle}
                />
              }
            />
          </Section>

          {!isActive && domain ? (
            <Section>
              <SectionRow
                label='Domain'
                value={
                  <Text
                    as='span'
                    sx={t => ({
                      fontSize: t.fontSizes.$sm,
                      color: t.colors.$primary500,
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                    })}
                  >
                    {domain}
                  </Text>
                }
              />
            </Section>
          ) : null}

          <Section>
            <SectionRow
              label='Configuration details'
              align='start'
              value={
                <Col sx={t => ({ gap: t.space.$2x5 })}>
                  <DetailRow
                    label='Sign on URL'
                    value={saml?.idpSsoUrl}
                    isLink
                  />
                  <DetailRow
                    label='Issuer'
                    value={saml?.idpEntityId}
                    isLink
                  />
                  <DetailRow
                    label='Certificate'
                    value={truncateCertificate(saml?.idpCertificate)}
                  />
                  <Button
                    elementDescriptor={descriptors.button}
                    variant='unstyled'
                    onClick={() => void goToStep('configure')}
                    sx={t => ({
                      alignSelf: 'flex-start',
                      padding: 0,
                      color: t.colors.$colorMutedForeground,
                      fontSize: t.fontSizes.$sm,
                      '&:hover': { color: t.colors.$colorForeground, textDecoration: 'underline' },
                    })}
                  >
                    Configure again
                  </Button>
                </Col>
              }
            />
          </Section>

          <Section>
            <SectionRow
              label='Reset connection'
              value={
                <Button
                  elementDescriptor={descriptors.button}
                  variant='unstyled'
                  isDisabled={isResetting}
                  onClick={() => {
                    void handleReset();
                  }}
                  sx={t => ({
                    alignSelf: 'flex-start',
                    padding: 0,
                    color: t.colors.$danger500,
                    fontSize: t.fontSizes.$sm,
                    fontWeight: t.fontWeights.$medium,
                    '&:hover': { textDecoration: 'underline' },
                  })}
                >
                  {isResetting ? 'Resetting…' : 'Reset connection'}
                </Button>
              }
            />
          </Section>

          {card.error ? (
            <Text
              as='p'
              variant='body'
              sx={t => ({
                color: t.colors.$danger500,
                fontSize: t.fontSizes.$sm,
                paddingBlockStart: t.space.$3,
              })}
            >
              {card.error}
            </Text>
          ) : null}
        </Col>
      </StepLayout>
    </Flow.Part>
  );
};

const Section = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <Box
    sx={t => ({
      paddingBlock: t.space.$3,
      borderBottomWidth: t.borderWidths.$normal,
      borderBottomStyle: t.borderStyles.$solid,
      borderBottomColor: t.colors.$borderAlpha100,
      '&:last-child': { borderBottomWidth: 0 },
    })}
  >
    {children}
  </Box>
);

interface SectionRowProps {
  label: string;
  value: React.ReactNode;
  /**
   * Vertical alignment of the label against the value. Use `'start'`
   * for rows whose value is multi-line (e.g. "Configuration details");
   * single-line values look right with the default `'center'`
   */
  align?: 'start' | 'center';
}

const SectionRow = ({ label, value, align = 'center' }: SectionRowProps): JSX.Element => (
  <Flex
    align={align}
    sx={t => ({
      gap: t.space.$4,
    })}
  >
    <Box
      sx={t => ({
        flex: '0 0 auto',
        width: t.sizes.$48,
        color: t.colors.$colorForeground,
        fontSize: t.fontSizes.$sm,
        fontWeight: t.fontWeights.$medium,
      })}
    >
      {label}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>{value}</Box>
  </Flex>
);

interface DetailRowProps {
  label: string;
  value: string | undefined | null;
  isLink?: boolean;
}

const DetailRow = ({ label, value, isLink }: DetailRowProps): JSX.Element => (
  <Flex
    align='center'
    sx={t => ({ gap: t.space.$4 })}
  >
    <Box
      sx={t => ({
        flex: '0 0 auto',
        width: t.sizes.$24,
        color: t.colors.$colorMutedForeground,
        fontSize: t.fontSizes.$sm,
      })}
    >
      {label}
    </Box>
    <Box
      sx={t => ({
        flex: 1,
        minWidth: 0,
        fontSize: t.fontSizes.$sm,
        color: isLink ? t.colors.$primary500 : t.colors.$colorForeground,
        textDecoration: isLink && value ? 'underline' : 'none',
        textUnderlineOffset: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      })}
    >
      {value || '\u2014'}
    </Box>
  </Flex>
);

interface ToggleProps {
  isActive: boolean;
  isLoading: boolean;
  onClick: () => void | Promise<void>;
}

const Toggle = ({ isActive, isLoading, onClick }: ToggleProps): JSX.Element => (
  <Button
    elementDescriptor={descriptors.button}
    variant='unstyled'
    isDisabled={isLoading}
    onClick={() => {
      void onClick();
    }}
    aria-label={isActive ? 'Disable SSO' : 'Enable SSO'}
    aria-pressed={isActive}
    sx={t => ({
      position: 'relative',
      // `flex` (not `inline-flex`) so the toggle is block-level and
      // doesn't sit on the text-baseline of its parent — that was
      // pushing the pill a couple of pixels below the row's center
      display: 'flex',
      alignItems: 'center',
      width: t.sizes.$9,
      height: t.sizes.$5,
      padding: '2px',
      borderRadius: t.radii.$xl,
      backgroundColor: isActive ? t.colors.$success500 : t.colors.$neutralAlpha200,
      transition: `background-color ${t.transitionDuration.$fast} ${t.transitionTiming.$common}`,
      cursor: isLoading ? 'progress' : 'pointer',
      opacity: isLoading ? 0.7 : 1,
      '&:hover': isLoading
        ? {}
        : {
            backgroundColor: isActive ? t.colors.$success600 : t.colors.$neutralAlpha300,
          },
    })}
  >
    <Box
      sx={t => ({
        width: t.sizes.$4,
        height: t.sizes.$4,
        borderRadius: t.radii.$circle,
        backgroundColor: t.colors.$white,
        transform: isActive ? `translateX(${t.sizes.$4})` : 'translateX(0)',
        transition: `transform ${t.transitionDuration.$fast} ${t.transitionTiming.$common}`,
        boxShadow: t.shadows.$buttonShadow,
      })}
    />
  </Button>
);

/**
 * Certificates can be huge PEM blobs. Show only the trailing fragment
 * so the row doesn't blow out the layout
 */
function truncateCertificate(cert: string | null | undefined): string | undefined {
  if (!cert) {
    return undefined;
  }
  const cleaned = cert.replace(/-----BEGIN [A-Z ]+-----|-----END [A-Z ]+-----/g, '').trim();
  if (cleaned.length <= 32) {
    return cleaned;
  }
  return `…${cleaned.slice(-24)}`;
}
