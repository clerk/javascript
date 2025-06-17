import React, { useState } from 'react';

import { useApiKeysContext } from '@/ui/contexts';
import { Col, descriptors, Flex, FormLabel, localizationKeys, Text } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';
import { ChevronUpDown } from '@/ui/icons';
import { useFormControl } from '@/ui/utils/useFormControl';

export type OnCreateParams = { name: string; description?: string; expiration: number | undefined };

interface CreateApiKeyFormProps {
  onCreate: (params: OnCreateParams, closeCardFn: () => void) => void;
  isSubmitting: boolean;
}

export type Expiration = 'never' | '1d' | '7d' | '30d' | '60d' | '90d' | '180d' | '1y';

const getTimeLeftInSeconds = (expirationOption: Expiration) => {
  if (expirationOption === 'never') {
    return;
  }

  const now = new Date();
  const future = new Date(now);

  switch (expirationOption) {
    case '30d':
      future.setDate(future.getDate() + 30);
      break;
    case '90d':
      future.setDate(future.getDate() + 90);
      break;
    case '60d':
      future.setDate(future.getDate() + 60);
      break;
    case '180d':
      future.setDate(future.getDate() + 180);
      break;
    case '1y':
      future.setFullYear(future.getFullYear() + 1);
      break;
    default:
      throw new Error('Invalid expiration option');
  }

  const diffInMs = future.getTime() - now.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  return diffInSecs;
};

const options: { value: Expiration; label: string }[] = [
  { value: 'never', label: 'No Expiration' },
  { value: '1d', label: '1 Day' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '60d', label: '60 Days' },
  { value: '90d', label: '90 Days' },
  { value: '180d', label: '180 Days' },
  { value: '1y', label: '1 Year' },
];

const ExpirationSelector = ({
  selectedExpiration,
  setSelectedExpiration,
}: {
  selectedExpiration: { value: Expiration; label: string };
  setSelectedExpiration: (value: { value: Expiration; label: string }) => void;
}) => {
  return (
    <Select
      elementId='paymentSource'
      options={options}
      value={selectedExpiration.value}
      onChange={setSelectedExpiration}
    >
      <SelectButton
        icon={ChevronUpDown}
        sx={t => ({
          justifyContent: 'space-between',
          backgroundColor: t.colors.$colorBackground,
        })}
      >
        <Text>{selectedExpiration.label}</Text>
      </SelectButton>
      <SelectOptionList
        sx={t => ({
          paddingBlock: t.space.$1,
          color: t.colors.$colorText,
          flex: 1,
          width: '271px',
        })}
      />
    </Select>
  );
};

export const CreateApiKeyForm = ({ onCreate, isSubmitting }: CreateApiKeyFormProps) => {
  const [selectedExpiration, setSelectedExpiration] = useState<{ value: Expiration; label: string }>({
    value: 'never',
    label: 'No expiration',
  });
  const { close: closeCardFn } = useActionContext();
  const { showDescription } = useApiKeysContext();

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKeyName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__apiKeyName'),
    isRequired: true,
  });

  const descriptionField = useFormControl('apiKeyDescription', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKeyDescription'),
    placeholder: localizationKeys('formFieldInputPlaceholder__apiKeyDescription'),
    isRequired: false,
  });

  const canSubmit = nameField.value.length > 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(
      {
        name: nameField.value,
        description: descriptionField.value || undefined,
        expiration: getTimeLeftInSeconds(selectedExpiration.value),
      },
      closeCardFn,
    );
  };

  return (
    <FormContainer
      headerTitle={localizationKeys('apiKeys.formTitle')}
      headerSubtitle={localizationKeys('apiKeys.formHint')}
      elementDescriptor={descriptors.apiKeysCreateForm}
    >
      <Form.Root onSubmit={handleSubmit}>
        <Flex gap={4}>
          <Form.ControlRow
            sx={{ flex: 1 }}
            elementId={nameField.id}
            elementDescriptor={descriptors.apiKeysCreateFormNameInput}
          >
            <Form.PlainInput {...nameField.props} />
          </Form.ControlRow>
          <Col
            sx={{ flex: 1 }}
            gap={2}
          >
            <FormLabel
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}
            >
              <Text
                as='span'
                variant='subtitle'
                localizationKey={localizationKeys('formFieldLabel__apiKeyExpiration')}
              />
              <Text
                variant='caption'
                colorScheme='secondary'
              >
                Optional
              </Text>
            </FormLabel>
            <ExpirationSelector
              selectedExpiration={selectedExpiration}
              setSelectedExpiration={setSelectedExpiration}
            />
            <input
              name='apiKeyExpiration'
              type='hidden'
              value={selectedExpiration.value}
            />
            <Text
              variant='caption'
              colorScheme='secondary'
            >
              This key will never expire
            </Text>
          </Col>
        </Flex>
        {showDescription && (
          <Form.ControlRow
            elementId={descriptionField.id}
            elementDescriptor={descriptors.apiKeysCreateFormDescriptionInput}
          >
            <Form.PlainInput {...descriptionField.props} />
          </Form.ControlRow>
        )}
        <FormButtons
          submitLabel={localizationKeys('apiKeys.formButtonPrimary__add')}
          isDisabled={!canSubmit}
          onReset={closeCardFn}
          isLoading={isSubmitting}
          elementDescriptor={descriptors.apiKeysCreateFormSubmitButton}
        />
      </Form.Root>
    </FormContainer>
  );
};
