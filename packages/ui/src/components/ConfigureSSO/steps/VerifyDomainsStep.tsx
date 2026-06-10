import type React from 'react';
import { useState } from 'react';

import {
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Flow,
  Icon,
  localizationKeys,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useLocalizations,
} from '@/customizables';
import { Alert } from '@/elements/Alert';
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { TagPill } from '@/elements/TagInput';
import { useClipboard } from '@/hooks';
import { Checkmark, Clipboard } from '@/icons';
import { getClerkAPIErrorMessage, getFieldError, getGlobalError } from '@/utils/errorHandler';
import { useFormControl } from '@/utils/useFormControl';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { InnerStepCounter } from '../elements/Wizard/InnerStepCounter';

export const VerifyDomainsStep = (): JSX.Element => {
  const { t } = useLocalizations();
  const {
    organizationDomains,
    organizationDomainMutations: { createDomain, revalidate },
  } = useConfigureSSO();

  const [error, setError] = useState<string | undefined>(undefined);

  const handleCreateDomain = async (domain: string) => {
    setError(undefined);

    try {
      await createDomain(domain);
    } catch (err) {
      const apiError = getGlobalError(err as Error) ?? getFieldError(err as Error);
      setError(apiError ? getClerkAPIErrorMessage(apiError) : (err as Error).message);
      throw err;
    }
  };

  return (
    <Flow.Part part='verifyDomain'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('verify-domain')}
      >
        <Step.Header
          title={t(localizationKeys('configureSSO.verifyDomainsStep.title'))}
          description={t(localizationKeys('configureSSO.verifyDomainsStep.subtitle'))}
        >
          <InnerStepCounter />
        </Step.Header>

        <Step.Body>
          <Step.Section sx={t => ({ gap: t.space.$5 })}>
            <Col>
              <DomainsField onSubmit={handleCreateDomain} />

              {!!organizationDomains?.length && (
                <Flex
                  wrap='wrap'
                  sx={t => ({ gap: t.space.$2, marginTop: t.space.$4 })}
                >
                  {organizationDomains.map(domain => (
                    <TagPill
                      key={domain.id}
                      onRemoveClick={() => {
                        void domain.delete().then(() => revalidate());
                      }}
                    >
                      {domain.name}
                    </TagPill>
                  ))}
                </Flex>
              )}

              {error && (
                <Alert
                  variant='danger'
                  title={error}
                  sx={t => ({ marginTop: t.space.$4 })}
                />
              )}
            </Col>

            {!!organizationDomains?.length && (
              <Col sx={t => ({ gap: t.space.$3 })}>
                <Col sx={t => ({ gap: t.space.$4 })}>
                  <Text
                    localizationKey={localizationKeys(
                      'configureSSO.verifyDomainsStep.txtRecordInstructions.paragraph1',
                    )}
                  />
                  <Text
                    localizationKey={localizationKeys(
                      'configureSSO.verifyDomainsStep.txtRecordInstructions.paragraph2',
                    )}
                  />
                </Col>

                <TxtRecordTable />
              </Col>
            )}
          </Step.Section>
        </Step.Body>
      </Step>
    </Flow.Part>
  );
};

const DomainsField = ({ onSubmit }: { onSubmit: (domain: string) => Promise<void> }): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const domainField = useFormControl('domain', '', {
    type: 'text',
    label: localizationKeys('configureSSO.verifyDomainsStep.formFieldLabel__domain'),
    placeholder: localizationKeys('configureSSO.verifyDomainsStep.formFieldInputPlaceholder__domain'),
  });

  const domain = domainField.value.trim().toLowerCase();
  const canSubmit = isValidDomain(domain) && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    void onSubmit(domain)
      .then(() => domainField.setValue(''))
      .catch(() => {
        // The parent surfaces the failure; keep the entered value so the user can correct it.
      })
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
              localizationKey={localizationKeys('configureSSO.verifyDomainsStep.formButtonPrimary__add')}
              sx={{ flexShrink: 0 }}
            />
          </Flex>
        </Col>
      </Field.Root>
    </Form.Root>
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

const txtRecordsMock = [
  {
    domain: 'test.com',
    type: 'TXT',
    name: '@',
    value: 'hellooo-domain-verification-axxn86=sdfsdfsdfsdfdsf',
    status: 'pending',
  },
  {
    domain: 'acme.com',
    type: 'TXT',
    name: '@',
    value: 'hellooo2-domain-verification-axxn86=sdfsdfsdfsdfdsf',
    status: 'verified',
  },
];

const TxtRecordTable = (): JSX.Element => {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Domain</Th>
          <Th>Type</Th>
          <Th>Host / Name</Th>
          <Th>Value</Th>
        </Tr>
      </Thead>
      <Tbody>
        {txtRecordsMock.map(record => (
          <Tr key={record.domain}>
            <Td>
              <Flex
                as='span'
                align='center'
                sx={t => ({ gap: t.space.$2 })}
              >
                {/* TODO -> Add animated transition once the status changes */}
                {record.status === 'verified' ? (
                  <Icon
                    icon={Checkmark}
                    colorScheme='success'
                    sx={t => ({ flexShrink: 0, width: t.sizes.$3, height: t.sizes.$3 })}
                  />
                ) : (
                  <Spinner
                    size='xs'
                    colorScheme='neutral'
                    sx={{ flexShrink: 0 }}
                  />
                )}
                <Text as='span'>{record.domain}</Text>
              </Flex>
            </Td>
            <Td>
              <Text as='span'>{record.type}</Text>
            </Td>
            <Td>
              <Text as='span'>{record.name}</Text>
            </Td>
            <Td sx={{ width: '50%', maxWidth: '1px' }}>
              <TxtRecordValueCell value={record.value} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const TxtRecordValueCell = ({ value }: { value: string }): JSX.Element => {
  const { onCopy, hasCopied } = useClipboard(value);

  return (
    <Flex
      align='center'
      sx={t => ({ gap: t.space.$2, minWidth: 0 })}
    >
      <Text
        as='span'
        colorScheme='secondary'
        title={value}
        sx={{
          fontFamily: 'monospace',
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
          flex: 1,
        }}
      >
        {value}
      </Text>
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
