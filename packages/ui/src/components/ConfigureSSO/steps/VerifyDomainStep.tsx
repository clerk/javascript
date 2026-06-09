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
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { TagPill } from '@/elements/TagInput';
import { useClipboard } from '@/hooks';
import { Checkmark, Clipboard } from '@/icons';
import { useFormControl } from '@/utils/useFormControl';

import { Step } from '../elements/Step';
import { InnerStepCounter } from '../elements/Wizard/InnerStepCounter';

export const VerifyDomainStep = (): JSX.Element => {
  const { t } = useLocalizations();

  // TODO: replace with the enterprise connection domain API
  const [domains, setDomains] = useState<string[]>([]);

  return (
    <Flow.Part part='verifyDomain'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('verify-domain')}
      >
        <Step.Header
          title={t(localizationKeys('configureSSO.verifyDomainStep.title'))}
          description={t(localizationKeys('configureSSO.verifyDomainStep.subtitle'))}
        >
          <InnerStepCounter />
        </Step.Header>

        <Step.Body>
          <Step.Section sx={t => ({ gap: t.space.$5 })}>
            <Col>
              {/* TODO -> Trigger mutation to add domain */}
              <DomainsField
                onSubmit={domain => {
                  setDomains(prev => [...prev, domain]);
                }}
              />

              {domains.length > 0 && (
                <Flex
                  wrap='wrap'
                  sx={t => ({ gap: t.space.$2, marginTop: t.space.$4 })}
                >
                  {domains.map(domain => (
                    <TagPill
                      key={domain}
                      /* TODO -> Trigger mutation to remove domain */
                      onRemoveClick={() => setDomains(prev => prev.filter(d => d !== domain))}
                    >
                      {domain}
                    </TagPill>
                  ))}
                </Flex>
              )}
            </Col>

            {/* TODO -> Only render when there is existing organization domains */}
            <Col sx={t => ({ gap: t.space.$3 })}>
              <Col sx={t => ({ gap: t.space.$4 })}>
                <Text
                  localizationKey={localizationKeys('configureSSO.verifyDomainStep.txtRecordInstructions.paragraph1')}
                />
                <Text
                  localizationKey={localizationKeys('configureSSO.verifyDomainStep.txtRecordInstructions.paragraph2')}
                />
              </Col>

              <TxtRecordTable />
            </Col>
          </Step.Section>
        </Step.Body>
      </Step>
    </Flow.Part>
  );
};

const DomainsField = ({ onSubmit }: { onSubmit: (domain: string) => void }): JSX.Element => {
  const domainField = useFormControl('domain', '', {
    type: 'text',
    label: localizationKeys('configureSSO.verifyDomainStep.formFieldLabel__domain'),
    placeholder: localizationKeys('configureSSO.verifyDomainStep.formFieldInputPlaceholder__domain'),
  });

  const domain = domainField.value.trim().toLowerCase();
  const canSubmit = isValidDomain(domain);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit(domain);
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
              localizationKey={localizationKeys('configureSSO.verifyDomainStep.formButtonPrimary__add')}
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
