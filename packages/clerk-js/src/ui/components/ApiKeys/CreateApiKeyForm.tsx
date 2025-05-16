import React, { useState } from 'react';

import { Button, Col, Flex, FormLabel, localizationKeys, Text } from '../../customizables';
import { Form, FormButtons, FormContainer, SegmentedControl } from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFormControl } from '../../utils';

export type OnCreateParams = { name: string; description?: string; expiration: Expiration };

interface CreateApiKeyFormProps {
  onCreate: (params: OnCreateParams, closeCardFn: () => void) => void;
  isSubmitting: boolean;
}

export type Expiration = 'never' | '30d' | '90d' | 'custom';

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

  const canSubmit = nameField.value.length > 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(
      {
        name: nameField.value,
        description: descriptionField.value || undefined,
        expiration,
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
                aria-label='Expiration'
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
