import React, { useState } from 'react';

import { Button, Flex, localizationKeys } from '../../customizables';
import { Form, FormButtons, FormContainer } from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFormControl } from '../../utils';

interface CreateApiKeyFormProps {
  onCreate: (params: { name: string; description?: string; expiration?: number; closeFn: () => void }) => void;
}

export const CreateApiKeyForm = ({ onCreate }: CreateApiKeyFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { close } = useActionContext();

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
      expiration: undefined,
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
          <Form.ControlRow elementId={descriptionField.id}>
            <Form.PlainInput {...descriptionField.props} />
          </Form.ControlRow>
        )}
        {/* TODO: Add Expiration column */}
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
