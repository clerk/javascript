import { useUser } from '@clerk/shared/react';
import type { OrganizationDomainResource } from '@clerk/shared/types';
import type React from 'react';
import { useState } from 'react';

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
import { useCardState } from '@/elements/contexts';
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { useClipboard } from '@/hooks';
import { Checkmark, Clipboard, Close } from '@/icons';
import { common } from '@/styledSystem';
import { useFormControl } from '@/ui/utils/useFormControl';
import { getFieldError, getGlobalError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard/WizardContext';

export const OrganizationDomainsStep = (): JSX.Element => {
  const { t } = useLocalizations();
  const {
    organizationDomains,
    organizationDomainMutations: { createDomain, revalidate },
  } = useConfigureSSO();
  const { goPrev, goNext, isFirstStep, isLastStep } = useWizard();
  const card = useCardState();

  const handleCreateDomain = async (domain: string) => {
    card.setError(undefined);

    try {
      await createDomain(domain);
    } catch (err: any) {
      const apiError = getFieldError(err) ?? getGlobalError(err);
      card.setError(apiError);
    }
  };

  const hasAllDomainsVerified =
    organizationDomains?.length &&
    organizationDomains?.every(domain => domain.ownershipVerification?.status === 'verified');

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
                {organizationDomains.map(domain => (
                  <DomainCard
                    key={domain.id}
                    domain={domain}
                    onRemove={() => {
                      // TODO ORGS-1623 - Add dialog for domain deletion confirmation
                      void domain.delete().then(() => revalidate());
                    }}
                  />
                ))}
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
}: {
  domain: OrganizationDomainResource;
  onRemove: () => void;
}): JSX.Element => {
  const ownershipVerification = domain.ownershipVerification;
  const isVerified = ownershipVerification?.status === 'verified';
  const cardId = isVerified ? 'verified' : 'unverified';

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
            sx={t => ({ fontWeight: t.fontWeights.$medium, overflow: 'hidden', textOverflow: 'ellipsis' })}
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

        <Button
          elementDescriptor={descriptors.configureSSOVerifyDomainCardRemoveButton}
          variant='ghost'
          colorScheme='neutral'
          aria-label='Remove domain'
          onClick={onRemove}
          sx={t => ({ flexShrink: 0, padding: t.space.$1 })}
        >
          <Icon
            icon={Close}
            sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
          />
        </Button>
      </Flex>

      {/* TODO -> Add height animation when verified */}
      {ownershipVerification?.verifiedAt ? (
        <Text
          as='p'
          colorScheme='secondary'
          localizationKey={localizationKeys('configureSSO.organizationDomainsStep.domainCard.verifiedAtLabel', {
            date: ownershipVerification.verifiedAt,
          })}
          sx={t => ({ padding: t.space.$4, paddingTop: 0 })}
        />
      ) : (
        <TxtRecord ownershipVerification={ownershipVerification} />
      )}
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
        {/* TODO -> Label name name need to use badge components */}
        <RecordEntry
          label={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.typeLabel')}
          value='TXT'
        />
        <RecordEntry
          label={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.hostLabel')}
          value={ownershipVerification?.txtRecordName ?? '@'}
        />
      </Flex>

      {/* TODO -> TXT record value needs to use a readonly input */}
      <RecordEntry
        label={localizationKeys('configureSSO.organizationDomainsStep.domainCard.txtRecord.valueLabel')}
        value={ownershipVerification?.txtRecordValue ?? '—'}
        copyable={!!ownershipVerification?.txtRecordValue}
      />
    </Col>
  );
};

const RecordEntry = ({
  label,
  value,
  copyable = false,
}: {
  label: ReturnType<typeof localizationKeys>;
  value: string;
  copyable?: boolean;
}): JSX.Element => {
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
      {copyable ? <CopyableValue value={value} /> : <RecordChip>{value}</RecordChip>}
    </Flex>
  );
};

const RecordChip = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <Box
    elementDescriptor={descriptors.configureSSOVerifyDomainCardTxtRecordValue}
    sx={t => ({
      borderWidth: t.borderWidths.$normal,
      borderStyle: t.borderStyles.$solid,
      borderColor: t.colors.$borderAlpha150,
      borderRadius: t.radii.$md,
      background: t.colors.$neutralAlpha50,
      paddingInline: t.space.$1x5,
      paddingBlock: t.space.$0x5,
      minWidth: 0,
    })}
  >
    <Text
      as='span'
      sx={t => ({
        fontFamily: t.fonts.$buttons,
        fontSize: t.fontSizes.$xs,
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      })}
    >
      {children}
    </Text>
  </Box>
);

const CopyableValue = ({ value }: { value: string }): JSX.Element => {
  const { onCopy, hasCopied } = useClipboard(value);

  return (
    <Flex
      align='center'
      title={value}
      sx={t => ({ gap: t.space.$1, minWidth: 0, flex: 1 })}
    >
      <RecordChip>{value}</RecordChip>
      <Button
        colorScheme='secondary'
        aria-label='Copy value'
        onClick={() => onCopy()}
        sx={t => ({ flexShrink: 0, padding: t.space.$1 })}
      >
        <Icon
          icon={hasCopied ? Checkmark : Clipboard}
          sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, color: t.colors.$colorMutedForeground })}
        />
      </Button>
    </Flex>
  );
};
