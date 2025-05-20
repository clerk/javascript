import React, { useState } from 'react';

import { Button, Col, Flex, FormLabel, localizationKeys, Text } from '../../customizables';
import { Form, FormButtons, FormContainer, SegmentedControl } from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFormControl } from '../../utils';

export type OnCreateParams = { name: string; description?: string; expiration: number | undefined };

interface CreateApiKeyFormProps {
  onCreate: (params: OnCreateParams, closeCardFn: () => void) => void;
  isSubmitting: boolean;
}

export type Expiration = 'never' | '30d' | '90d' | 'custom';

const getTimeLeftInSeconds = (expirationOption: Expiration, customDate?: string) => {
  if (expirationOption === 'never') {
    return;
  }

  const now = new Date();
  let future = new Date(now);

  switch (expirationOption) {
    case '30d':
      future.setDate(future.getDate() + 30);
      break;
    case '90d':
      future.setDate(future.getDate() + 90);
      break;
    case 'custom':
      future = new Date(customDate as string);
      break;
    default:
      throw new Error('Invalid expiration option');
  }

  const diffInMs = future.getTime() - now.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  return diffInSecs;
};

const getMinDate = () => {
  const min = new Date();
  min.setDate(min.getDate() + 1);
  return min.toISOString().split('T')[0];
};

export const CreateApiKeyForm = ({ onCreate, isSubmitting }: CreateApiKeyFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expiration, setExpiration] = useState<Expiration>('never');
  const createApiKeyFormId = React.useId();
  const segmentedControlId = `${createApiKeyFormId}-segmented-control`;
  const { close: closeCardFn } = useActionContext();

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKeyName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__apiKeyName'),
    isRequired: true,
  });

  const descriptionField = useFormControl('description', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKeyDescription'),
    placeholder: localizationKeys('formFieldInputPlaceholder__apiKeyDescription'),
    isRequired: false,
  });

  const expirationDateField = useFormControl('expirationDate', '', {
    type: 'date',
    label: localizationKeys('formFieldLabel__apiKeyExpirationDate'),
    placeholder: localizationKeys('formFieldInputPlaceholder__apiKeyExpirationDate'),
    isRequired: false,
  });

  const canSubmit = nameField.value.length > 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(
      {
        name: nameField.value,
        description: descriptionField.value || undefined,
        expiration: getTimeLeftInSeconds(expiration, expirationDateField.value),
      },
      closeCardFn,
    );
  };

  return (
    <FormContainer
      headerTitle={localizationKeys('apiKeys.formTitle')}
      headerSubtitle={localizationKeys('apiKeys.formHint')}
    >
      <Form.Root onSubmit={handleSubmit}>
        <Form.ControlRow elementId={nameField.id}>
          <Form.PlainInput {...nameField.props} />
        </Form.ControlRow>
        {showAdvanced && (
          <>
            <Form.ControlRow elementId={descriptionField.id}>
              <Form.PlainInput {...descriptionField.props} />
            </Form.ControlRow>
            <Col gap={2}>
              <FormLabel htmlFor={segmentedControlId}>
                <Text
                  as='span'
                  variant='subtitle'
                  localizationKey={localizationKeys('formFieldLabel__apiKeyExpiration')}
                />
              </FormLabel>
              <SegmentedControl.Root
                aria-labelledby={segmentedControlId}
                value={expiration}
                onChange={value => setExpiration(value as Expiration)}
                fullWidth
              >
                <SegmentedControl.Button
                  value='never'
                  text='Never'
                />
                <SegmentedControl.Button
                  value='30d'
                  text='30 days'
                />
                <SegmentedControl.Button
                  value='90d'
                  text='90 days'
                />
                <SegmentedControl.Button
                  value='custom'
                  text='Custom'
                />
              </SegmentedControl.Root>
            </Col>
            {expiration === 'custom' && (
              <Form.ControlRow elementId={expirationDateField.id}>
                <Form.PlainInput
                  type='date'
                  {...expirationDateField.props}
                  min={getMinDate()}
                />
              </Form.ControlRow>
            )}
          </>
        )}
        <Flex
          justify='between'
          align='center'
        >
          <Button
            variant='outline'
            onClick={() => setShowAdvanced(prev => !prev)}
          >
            {showAdvanced ? 'Hide' : 'Show'} advanced settings
          </Button>
          <FormButtons
            submitLabel={localizationKeys('apiKeys.formButtonPrimary__add')}
            isDisabled={!canSubmit}
            onReset={closeCardFn}
            isLoading={isSubmitting}
          />
        </Flex>
      </Form.Root>
    </FormContainer>
  );
};
