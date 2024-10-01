import { useUser } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../../elements';
import { useAssurance } from '../../hooks/useAssurance';
import { handleError, useFormControl } from '../../utils';

type UsernameFormProps = FormProps;

export const UsernameForm = withCardStateProvider((props: UsernameFormProps) => {
  const { onSuccess, onReset } = props;
  const { handleAssurance } = useAssurance();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const { userSettings } = useEnvironment();
  const card = useCardState();
  const usernameField = useFormControl('username', user.username || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
  });

  const isUsernameRequired = userSettings.attributes.username.required;

  const canSubmit =
    (isUsernameRequired ? usernameField.value.length > 0 : true) && user.username !== usernameField.value;

  const updatePassword = async () => {
    try {
      await handleAssurance(() => user.update({ username: usernameField.value }));
      onSuccess();
    } catch (e) {
      handleError(e, [usernameField], card.setError);
    }
  };

  return (
    <FormContainer
      headerTitle={
        user.username
          ? localizationKeys('userProfile.usernamePage.title__update')
          : localizationKeys('userProfile.usernamePage.title__set')
      }
    >
      <Form.Root onSubmit={updatePassword}>
        <Form.ControlRow elementId={usernameField.id}>
          <Form.PlainInput
            {...usernameField.props}
            autoFocus
            isRequired={isUsernameRequired}
          />
        </Form.ControlRow>
        <FormButtons
          isDisabled={!canSubmit}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
});
