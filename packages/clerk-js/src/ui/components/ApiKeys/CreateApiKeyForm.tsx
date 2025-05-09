import React, { useState } from 'react';

import { Button, Col, Flex, localizationKeys, Text } from '../../customizables';
import { Form, FormButtons, FormContainer, SegmentedControl } from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFormControl } from '../../utils';

interface CreateApiKeyFormProps {
  onCreate: (params: { name: string; description?: string; expiration: Expiration; closeFn: () => void }) => void;
}

export type Expiration = 'never' | '30d' | '90d' | 'custom';

export const CreateApiKeyForm = ({ onCreate }: CreateApiKeyFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { close } = useActionContext();
  const [expiration, setExpiration] = useState<Expiration>('never');
  const createApiKeyFormId = React.useId();
  const segmentedControlId = `${createApiKeyFormId}-segmented-control`;

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: 'Name',
    placeholder: 'Enter your secret key name',
    isRequired: true,
  });

  const descriptionField = useFormControl('description', '', {
    type: 'text',
    label: 'Description',
    placeholder: 'Enter a description for your API key',
    isRequired: false,
  });

  const canSubmit = nameField.value.length > 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: nameField.value,
      description: descriptionField.value || undefined,
      expiration,
      closeFn: close,
    });
  };

  return (
    <FormContainer
      headerTitle={localizationKeys('apiKey.apiKeyPage.title')}
      headerSubtitle={localizationKeys('apiKey.apiKeyPage.formHint')}
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
              <Text
                id={segmentedControlId}
                sx={{ fontWeight: 500 }}
              >
                Expiration
              </Text>
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
            isDisabled={!canSubmit}
            onReset={close}
          />
        </Flex>
      </Form.Root>
    </FormContainer>
  );
};
