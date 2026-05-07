import { useSession, useUser } from '@clerk/shared/react';
import React from 'react';

import { Box, Button, Col, descriptors, Flex, Flow, Icon, Input, Spinner, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { useClipboard } from '@/hooks';
import { Check, Copy } from '@/icons';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { useConfigureSSOWizard, useRegisterContinueAction } from '../wizard';
import { StepLayout } from './StepLayout';

const isUrl = (value: string) => /^https?:\/\/\S+/.test(value);

export const ConfigureCreateApp = (): JSX.Element => {
  const { goNext } = useConfigureSSOWizard();
  const { selectedProvider, enterpriseConnection, createEnterpriseConnection, updateEnterpriseConnection } =
    useConfigureSSOFlow();
  const { user } = useUser();
  const card = useCardState();
  // Active org id straight off the session — `useOrganization()` would
  // subscribe to the organization resource and we only need the id
  const { session } = useSession();
  const activeOrganizationId = session?.lastActiveOrganizationId ?? undefined;

  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? '';
  const emailDomain = getEmailDomain(primaryEmail);

  const [metadataUrl, setMetadataUrl] = React.useState(enterpriseConnection?.samlConnection?.idpMetadataUrl ?? '');
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // Set the moment we kick off the create call, never reset. There is a
  // window between the create resolving and React Query's revalidate
  // refetch finishing where `enterpriseConnection` is still `undefined`.
  // Without this guard we'd refire the effect (since `useCardState()`
  // returns a new object every render and `card.setError` was in the
  // deps) and POST another connection on every render — causing a
  // request storm and `too_many_requests` from FAPI
  const hasAttemptedCreateRef = React.useRef(false);

  // Auto-create the enterprise connection when this step mounts so the
  // user immediately sees the SP details (ACS URL / SP entity ID) they
  // need to register on the IdP side. The connection is created with
  // empty SAML params; the user fills them in before continuing
  React.useEffect(() => {
    if (enterpriseConnection || !selectedProvider || !emailDomain || hasAttemptedCreateRef.current) {
      return;
    }

    hasAttemptedCreateRef.current = true;
    setIsCreating(true);
    card.setError(undefined);

    createEnterpriseConnection({
      provider: selectedProvider,
      name: emailDomain,
      organizationId: activeOrganizationId,
    })
      .catch(err => handleError(err as Error, [], card.setError))
      .finally(() => setIsCreating(false));
    // `card` is intentionally omitted: `useCardState()` returns a new
    // object every render, which would refire this effect indefinitely
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseConnection, selectedProvider, emailDomain, createEnterpriseConnection]);

  // Sync the local metadata URL state when the connection finishes loading
  React.useEffect(() => {
    const remote = enterpriseConnection?.samlConnection?.idpMetadataUrl;
    if (remote && !metadataUrl) {
      setMetadataUrl(remote);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseConnection?.samlConnection?.idpMetadataUrl]);

  const acsUrl = enterpriseConnection?.samlConnection?.acsUrl ?? '';
  const spEntityId = enterpriseConnection?.samlConnection?.spEntityId ?? '';
  const copy = getProviderCopy(selectedProvider ?? enterpriseConnection?.provider);

  const canSubmit = Boolean(enterpriseConnection) && isUrl(metadataUrl) && !isSubmitting && !isCreating;

  const submit = React.useCallback(async () => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    setIsSubmitting(true);
    card.setError(undefined);

    try {
      await updateEnterpriseConnection(enterpriseConnection.id, {
        saml: { idpMetadataUrl: metadataUrl },
      });
      await goNext();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, enterpriseConnection, updateEnterpriseConnection, metadataUrl, card, goNext]);

  useRegisterContinueAction({
    handler: submit,
    isDisabled: !canSubmit,
    isLoading: isSubmitting,
  });

  return (
    <Flow.Part part='configureCreateApp'>
      <StepLayout
        title={copy.stepTitle}
        subtitle={copy.stepSubtitle}
      >
        {isCreating || !enterpriseConnection ? (
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
        ) : (
          <Col sx={t => ({ gap: t.space.$6, paddingBlockEnd: t.space.$4 })}>
            <Col sx={t => ({ gap: t.space.$3 })}>
              <Col sx={t => ({ gap: t.space.$1 })}>
                <Text
                  as='p'
                  sx={t => ({ color: t.colors.$colorForeground, fontWeight: t.fontWeights.$semibold })}
                >
                  {copy.step1Title}
                </Text>
                <Text
                  as='p'
                  variant='body'
                  sx={t => ({ color: t.colors.$colorMutedForeground })}
                >
                  {copy.step1Body}
                </Text>
              </Col>

              <Col sx={t => ({ gap: t.space.$2 })}>
                <CopyableField
                  label='Single sign-on URL (ACS URL)'
                  value={acsUrl}
                />
                <CopyableField
                  label='Audience URI (SP Entity ID)'
                  value={spEntityId}
                />
              </Col>
            </Col>

            <Col sx={t => ({ gap: t.space.$3 })}>
              <Col sx={t => ({ gap: t.space.$1 })}>
                <Text
                  as='p'
                  sx={t => ({ color: t.colors.$colorForeground, fontWeight: t.fontWeights.$semibold })}
                >
                  {copy.step2Title}
                </Text>
                <Text
                  as='p'
                  variant='body'
                  sx={t => ({ color: t.colors.$colorMutedForeground })}
                >
                  {copy.step2Body}
                </Text>
              </Col>

              <Col sx={t => ({ gap: t.space.$1x5 })}>
                <Text
                  as='label'
                  sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
                >
                  {copy.metadataLabel}
                </Text>
                <Input
                  type='url'
                  placeholder='https://...'
                  value={metadataUrl}
                  onChange={e => setMetadataUrl(e.currentTarget.value)}
                  hasError={Boolean(card.error)}
                  isDisabled={isSubmitting}
                  aria-label={copy.metadataLabel}
                />
                {card.error ? (
                  <Text
                    as='p'
                    variant='body'
                    sx={t => ({ color: t.colors.$danger500, fontSize: t.fontSizes.$sm })}
                  >
                    {card.error}
                  </Text>
                ) : null}
              </Col>
            </Col>
          </Col>
        )}
      </StepLayout>
    </Flow.Part>
  );
};

function getEmailDomain(emailAddress: string): string {
  const at = emailAddress.lastIndexOf('@');
  if (at === -1) {
    return '';
  }
  return emailAddress.slice(at + 1).toLowerCase();
}

interface ProviderCopy {
  stepTitle: string;
  stepSubtitle: string;
  step1Title: string;
  step1Body: string;
  step2Title: string;
  step2Body: string;
  metadataLabel: string;
}

/**
 * Provider-aware copy for the Configure step. Okta gets dashboard-
 * specific phrasing; everything else (e.g. `saml_custom`) falls back
 * to fully generic IdP language so the same UI can guide users
 * through any SAML provider
 */
function getProviderCopy(provider: string | undefined): ProviderCopy {
  if (provider === 'saml_okta') {
    return {
      stepTitle: 'Configure Okta Workforce',
      stepSubtitle: 'Create a new enterprise application in your Okta dashboard.',
      step1Title: '1. Create a SAML application in Okta',
      step1Body:
        'In your Okta admin dashboard, create a new SAML 2.0 application and use the following service provider details:',
      step2Title: '2. Provide your Okta metadata URL',
      step2Body:
        'Once the SAML application is created, copy the metadata URL from your Okta application and paste it below.',
      metadataLabel: 'Okta metadata URL',
    };
  }

  return {
    stepTitle: 'Configure your identity provider',
    stepSubtitle: 'Register Clerk as a service provider in your IdP, then provide its metadata URL.',
    step1Title: '1. Create a SAML application on your IdP',
    step1Body:
      "In your identity provider's admin dashboard, create a new SAML 2.0 application and use the following service provider details:",
    step2Title: '2. Provide your IdP metadata URL',
    step2Body: 'Once the SAML application is created, copy the metadata URL from your IdP and paste it below.',
    metadataLabel: 'IdP metadata URL',
  };
}

interface CopyableFieldProps {
  label: string;
  value: string;
}

const CopyableField = ({ label, value }: CopyableFieldProps): JSX.Element => {
  const { onCopy, hasCopied } = useClipboard(value);

  return (
    <Col sx={t => ({ gap: t.space.$1 })}>
      <Text
        as='label'
        sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
      >
        {label}
      </Text>
      <Flex
        align='center'
        sx={t => ({
          gap: t.space.$2,
          padding: `${t.space.$1x5} ${t.space.$2}`,
          borderRadius: t.radii.$md,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha150,
          backgroundColor: t.colors.$neutralAlpha25,
        })}
      >
        <Box
          sx={t => ({
            flex: 1,
            minWidth: 0,
            fontFamily: t.fonts.$buttons,
            fontSize: t.fontSizes.$sm,
            color: t.colors.$colorForeground,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          })}
        >
          {value || '\u2014'}
        </Box>
        <Button
          elementDescriptor={descriptors.button}
          variant='unstyled'
          isDisabled={!value}
          onClick={onCopy}
          aria-label={hasCopied ? 'Copied' : `Copy ${label}`}
          sx={t => ({
            padding: t.space.$1,
            borderRadius: t.radii.$sm,
            color: t.colors.$colorMutedForeground,
            '&:hover': { color: t.colors.$colorForeground },
          })}
        >
          <Icon
            icon={hasCopied ? Check : Copy}
            size='sm'
          />
        </Button>
      </Flex>
    </Col>
  );
};
