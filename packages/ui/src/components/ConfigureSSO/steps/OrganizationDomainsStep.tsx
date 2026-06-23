import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import { eventFlowStepMounted } from '@clerk/shared/telemetry';
import type { OrganizationDomainResource } from '@clerk/shared/types';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Flow,
  Icon,
  localizationKeys,
  Spinner,
  Text,
  useLocalizations,
} from '@/customizables';
import { Alert } from '@/elements/Alert';
import { Animated } from '@/elements/Animated';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { useCardState } from '@/elements/contexts';
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { Tooltip } from '@/elements/Tooltip';
import { Checkmark, Clipboard, Close } from '@/icons';
import { common } from '@/styledSystem';
import { useFormControl } from '@/ui/utils/useFormControl';
import { getFieldError, getGlobalError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { areAllOrganizationDomainsVerified } from '../domain/organizationEnterpriseConnection';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard/WizardContext';
import { RemoveDomainDialog } from '../RemoveDomainDialog';

export const OrganizationDomainsStep = (): JSX.Element => {
  const { t } = useLocalizations();
  const {
    enterpriseConnection,
    organizationDomains,
    organizationEnterpriseConnection,
    contentRef,
    organizationDomainMutations: { createDomain, revalidate },
    enterpriseConnectionMutations: { updateConnection },
  } = useConfigureSSO();
  const { goPrev, goNext, isFirstStep, isLastStep } = useWizard();
  const card = useCardState();
  const clerk = useClerk();
  const { organization } = useOrganization();
  const [domainToRemove, setDomainToRemove] = useState<OrganizationDomainResource | null>(null);

  const hasRecordedTelemetryEvent = useRef(false);
  useEffect(() => {
    if (hasRecordedTelemetryEvent.current) {
      return;
    }

    hasRecordedTelemetryEvent.current = true;
    clerk.telemetry?.record(
      eventFlowStepMounted('configureSSO', 'verify-domain', {
        timestamp: new Date().toISOString(),
        connectionStatus: organizationEnterpriseConnection.status,
        connectionId: enterpriseConnection?.id ?? null,
        organizationId: organization?.id ?? null,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateDomain = async (domain: string) => {
    card.setError(undefined);

    try {
      await createDomain(domain);
    } catch (err: any) {
      const apiError = getFieldError(err) ?? getGlobalError(err);
      card.setError(apiError);
    }
  };

  const handleRemoveDomain = async (domain: OrganizationDomainResource) => {
    if (enterpriseConnection) {
      const domains = enterpriseConnection.domains.filter(name => name !== domain.name);
      await updateConnection(enterpriseConnection.id, { domains });
    }

    await domain.delete();
    await revalidate();
  };

  const hasAllDomainsVerified = areAllOrganizationDomainsVerified(organizationDomains);

  // A connection needs at least one verified domain to point at, so the last
  // remaining verified domain cannot be removed while a connection exists
  const verifiedDomainCount =
    organizationDomains?.filter(domain => domain.ownershipVerification?.status === 'verified').length ?? 0;
  const lockLastVerifiedDomain = Boolean(enterpriseConnection);
  const lastVerifiedDomainTooltip = enterpriseConnection?.active
    ? localizationKeys('configureSSO.organizationDomainsStep.domainCard.removeButtonTooltip__lastVerifiedDomainActive')
    : localizationKeys('configureSSO.organizationDomainsStep.domainCard.removeButtonTooltip__lastVerifiedDomain');

  return (
    <Flow.Part part='organizationDomains'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('verify-domain')}
      >
        <Step.Header
          title={t(localizationKeys('configureSSO.organizationDomainsStep.title'))}
          description={t(localizationKeys('configureSSO.organizationDomainsStep.subtitle'))}
        />

        <Step.Body>
          <Step.Section
            fill
            sx={t => ({ gap: t.space.$5, minHeight: 0 })}
          >
            <Col sx={t => ({ gap: t.space.$4 })}>
              <DomainsField
                onSubmit={handleCreateDomain}
                organizationDomains={organizationDomains}
              />

              {!organizationDomains?.length && <DomainSuggestion onSubmit={handleCreateDomain} />}

              {card.error && (
                <Alert
                  variant='danger'
                  title={card.error}
                />
              )}
            </Col>

            {!!organizationDomains?.length && (
              <Col
                elementDescriptor={descriptors.configureSSOVerifyDomainList}
                sx={t => ({
                  gap: t.space.$3,
                  flex: '0 1 auto',
                  minHeight: 0,
                  overflowY: 'auto',
                  // Inset so card shadows/focus rings are not clipped by the
                  // scroll container's overflow.
                  marginInline: `calc(${t.space.$1} * -1)`,
                  paddingInline: t.space.$1,
                  ...common.unstyledScrollbar(t),
                })}
              >
                {organizationDomains.map(domain => {
                  const isVerified = domain.ownershipVerification?.status === 'verified';
                  const isLastVerifiedDomain = isVerified && verifiedDomainCount === 1;
                  const isRemoveDisabled = lockLastVerifiedDomain && isLastVerifiedDomain;
                  return (
                    <DomainCard
                      key={domain.id}
                      domain={domain}
                      onRemove={() => setDomainToRemove(domain)}
                      isRemoveDisabled={isRemoveDisabled}
                      removeDisabledTooltip={lastVerifiedDomainTooltip}
                    />
                  );
                })}
              </Col>
            )}
          </Step.Section>
        </Step.Body>

        <Step.Footer>
          <Step.Footer.Previous
            onClick={() => goPrev()}
            isDisabled={isFirstStep}
          />
          <Step.Footer.Continue
            onClick={() => goNext()}
            isDisabled={isLastStep || !hasAllDomainsVerified}
          />
        </Step.Footer>
      </Step>

      {domainToRemove && (
        <RemoveDomainDialog
          isOpen={!!domainToRemove}
          onClose={() => setDomainToRemove(null)}
          domain={domainToRemove.name}
          isConnectionActive={Boolean(enterpriseConnection?.active)}
          onRemove={() => handleRemoveDomain(domainToRemove)}
          contentRef={contentRef}
        />
      )}
    </Flow.Part>
  );
};

/**
 * Matches a bare domain such as `example.com` or `sub.example.co.uk`.
 * Each label must start and end with an alphanumeric character and a valid
 * TLD of at least two letters is required. Protocols, paths, ports, spaces
 * and single-label hostnames are rejected.
 */
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const isValidDomain = (value: string): boolean => DOMAIN_REGEX.test(value);

const DomainsField = ({
  onSubmit,
  organizationDomains,
}: {
  onSubmit: (domain: string) => Promise<void>;
  organizationDomains: OrganizationDomainResource[] | undefined;
}): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const domainField = useFormControl('domain', '', {
    type: 'text',
    label: localizationKeys('configureSSO.organizationDomainsStep.formFieldLabel__domain'),
    placeholder: localizationKeys('configureSSO.organizationDomainsStep.formFieldInputPlaceholder__domain'),
  });

  const domain = domainField.value.trim().toLowerCase();
  const canSubmit = isValidDomain(domain) && !organizationDomains?.some(d => d.name === domain) && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    void onSubmit(domain)
      .then(() => domainField.setValue(''))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Form.Root onSubmit={handleSubmit}>
      <Field.Root {...domainField.props}>
        <Col
          elementDescriptor={descriptors.formField}
          elementId={descriptors.formField.setId(domainField.id)}
          sx={t => ({ gap: t.space.$2 })}
        >
          <Field.LabelRow>
            <Field.Label />
          </Field.LabelRow>

          <Flex
            align='start'
            sx={t => ({ gap: t.space.$2 })}
          >
            <Box sx={{ flex: 1 }}>
              <Field.Input />
            </Box>

            <Button
              type='submit'
              variant='bordered'
              colorScheme='secondary'
              isDisabled={!canSubmit}
              isLoading={isSubmitting}
              localizationKey={localizationKeys('configureSSO.organizationDomainsStep.formButtonPrimary__add')}
              sx={{ flexShrink: 0 }}
            />
          </Flex>
        </Col>
      </Field.Root>
    </Form.Root>
  );
};

const getEmailDomain = (email: string): string | null => email.split('@')[1]?.trim().toLowerCase() || null;

const DomainSuggestion = ({ onSubmit }: { onSubmit: (domain: string) => Promise<void> }): JSX.Element | null => {
  const { user } = useUser();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryEmail = user?.primaryEmailAddress?.emailAddress;
  const domain = primaryEmail ? getEmailDomain(primaryEmail) : null;

  if (!domain || isDismissed) {
    return null;
  }

  const handleAdd = () => {
    setIsSubmitting(true);
    void onSubmit(domain)
      .then(() => setIsDismissed(true))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Flex
      elementDescriptor={descriptors.configureSSOVerifyDomainSuggestion}
      align='center'
      justify='between'
      sx={t => ({
        gap: t.space.$2,
        paddingInline: t.space.$3,
        paddingBlock: t.space.$1x5,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha150,
        borderRadius: t.radii.$lg,
        background: t.colors.$neutralAlpha50,
      })}
    >
      <Flex
        align='center'
        sx={t => ({ gap: t.space.$3, minWidth: 0 })}
      >
        <Text
          as='span'
          colorScheme='secondary'
          localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainSuggestion.messageLabel', {
            domain,
          })}
          sx={t => ({ fontSize: t.fontSizes.$sm })}
        />

        <Button
          variant='bordered'
          colorScheme='secondary'
          size='xs'
          isLoading={isSubmitting}
          onClick={handleAdd}
          localizationKey={localizationKeys(
            'configureSSO.organizationDomainsStep.domainSuggestion.formButtonPrimary__add',
            { domain },
          )}
          sx={{ flexShrink: 0 }}
        />
      </Flex>

      <Button
        variant='ghost'
        colorScheme='neutral'
        aria-label='Dismiss domain suggestion'
        isDisabled={isSubmitting}
        onClick={() => setIsDismissed(true)}
        sx={t => ({ flexShrink: 0, padding: t.space.$1 })}
      >
        <Icon
          icon={Close}
          sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
        />
      </Button>
    </Flex>
  );
};

const DomainCard = ({
  domain,
  onRemove,
  isRemoveDisabled = false,
  removeDisabledTooltip,
}: {
  domain: OrganizationDomainResource;
  onRemove: () => void;
  isRemoveDisabled?: boolean;
  removeDisabledTooltip?: ReturnType<typeof localizationKeys>;
}): JSX.Element | null => {
  if (!domain.name) {
    return null;
  }

  const ownershipVerification = domain.ownershipVerification;
  const isVerified = ownershipVerification?.status === 'verified';
  const cardId = isVerified ? 'verified' : 'unverified';

  const removeButton = (
    <Button
      elementDescriptor={descriptors.configureSSOVerifyDomainCardRemoveButton}
      variant='ghost'
      colorScheme='neutral'
      aria-label='Remove domain'
      onClick={onRemove}
      isDisabled={isRemoveDisabled}
      sx={t => ({ flexShrink: 0, padding: t.space.$1 })}
    >
      <Icon
        icon={Close}
        sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
      />
    </Button>
  );

  return (
    <Col
      elementDescriptor={descriptors.configureSSOVerifyDomainCard}
      elementId={descriptors.configureSSOVerifyDomainCard.setId(cardId)}
      sx={t => ({
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha150,
        borderRadius: t.radii.$lg,
        background: t.colors.$colorBackground,
      })}
    >
      <Flex
        align='center'
        justify='between'
        sx={t => ({ gap: t.space.$2, padding: t.space.$4, paddingBottom: t.space.$2 })}
      >
        <Flex
          align='center'
          sx={t => ({ gap: t.space.$2, minWidth: 0 })}
        >
          <Text
            as='span'
            sx={t => ({
              fontWeight: t.fontWeights.$medium,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            })}
          >
            {domain.name}
          </Text>

          <Badge
            elementDescriptor={descriptors.configureSSOVerifyDomainCardBadge}
            elementId={descriptors.configureSSOVerifyDomainCardBadge.setId(cardId)}
            colorScheme={isVerified ? 'success' : 'danger'}
            localizationKey={
              isVerified
                ? localizationKeys('configureSSO.organizationDomainsStep.domainCard.badge__verified')
                : localizationKeys('configureSSO.organizationDomainsStep.domainCard.badge__unverified')
            }
          />

          {!isVerified && (
            <Spinner
              size='xs'
              colorScheme='neutral'
              sx={t => ({ flexShrink: 0, marginInlineStart: t.space.$1 })}
            />
          )}
        </Flex>

        {isRemoveDisabled && removeDisabledTooltip ? (
          <Tooltip.Root>
            <Tooltip.Trigger>{removeButton}</Tooltip.Trigger>
            <Tooltip.Content text={removeDisabledTooltip} />
          </Tooltip.Root>
        ) : (
          removeButton
        )}
      </Flex>

      <Box sx={{ overflow: 'hidden' }}>
        <Animated>
          {ownershipVerification?.verifiedAt ? (
            <Text
              key='verified'
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainCard.verifiedAtLabel', {
                date: ownershipVerification.verifiedAt,
              })}
              sx={t => ({ padding: t.space.$4, paddingTop: 0 })}
            />
          ) : (
            <TxtRecord
              key='unverified'
              ownershipVerification={ownershipVerification}
            />
          )}
        </Animated>
      </Box>
    </Col>
  );
};

const TxtRecord = ({
  ownershipVerification,
}: {
  ownershipVerification: OrganizationDomainResource['ownershipVerification'];
}): JSX.Element => {
  return (
    <Col
      elementDescriptor={descriptors.configureSSOVerifyDomainCardTxtRecord}
      sx={t => ({ gap: t.space.$3, paddingInline: t.space.$4, paddingBottom: t.space.$4 })}
    >
      <Text
        as='p'
        colorScheme='secondary'
        localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.instructions')}
        sx={t => ({ fontSize: t.fontSizes.$sm })}
      />

      <Box
        sx={t => ({
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$borderAlpha100,
          marginInline: `calc(${t.space.$4} * -1)`,
        })}
      />

      <Flex
        wrap='wrap'
        sx={t => ({ gap: t.space.$6 })}
      >
        <RecordEntry
          label={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.typeLabel')}
          value='TXT'
        />
        <RecordEntry
          label={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.hostLabel')}
          value={ownershipVerification?.txtRecordName ?? '@'}
        />
      </Flex>

      <Flex
        align='center'
        sx={t => ({ gap: t.space.$2, minWidth: 0 })}
      >
        <Text
          as='span'
          colorScheme='secondary'
          localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.valueLabel')}
          sx={t => ({ fontSize: t.fontSizes.$sm, flexShrink: 0 })}
        />
        <ClipboardInput
          elementDescriptor={descriptors.configureSSOVerifyDomainCardTxtRecordValue}
          value={ownershipVerification?.txtRecordValue ?? '—'}
          copyIcon={Clipboard}
          copiedIcon={Checkmark}
          sx={{ flex: 1, minWidth: 0 }}
        />
      </Flex>
    </Col>
  );
};

const RecordEntry = ({ label, value }: { label: ReturnType<typeof localizationKeys>; value: string }): JSX.Element => {
  return (
    <Flex
      align='center'
      sx={t => ({ gap: t.space.$2, minWidth: 0 })}
    >
      <Text
        as='span'
        colorScheme='secondary'
        localizationKey={label}
        sx={t => ({ fontSize: t.fontSizes.$sm, flexShrink: 0 })}
      />
      <Badge
        colorScheme='primary'
        sx={t => ({
          fontFamily: t.fonts.$buttons,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBlock: t.space.$1,
          paddingInline: t.space.$1x5,
        })}
      >
        <Box
          as='span'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            textBoxTrim: 'trim-both',
            textBoxEdge: 'cap alphabetic',
          }}
        >
          {value}
        </Box>
      </Badge>
    </Flex>
  );
};
