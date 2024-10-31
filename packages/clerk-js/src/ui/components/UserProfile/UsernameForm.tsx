import { __experimental_useReverification as useReverification, useUser } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';

type UsernameFormProps = FormProps;

export const UsernameForm = withCardStateProvider((props: UsernameFormProps) => {
  const { onSuccess, onReset } = props;
  const { user } = useUser();

  const [updateUsername] = useReverification(() => {
    if (!user) {
      return Promise.resolve(undefined);
    }
    return user.update({ username: usernameField.value });
  });

  const { userSettings } = useEnvironment();
  const card = useCardState();
  const usernameField = useFormControl('username', user?.username || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
  });

  if (!user) {
    return null;
  }

  const isUsernameRequired = userSettings.attributes.username.required;

  const canSubmit =
    (isUsernameRequired ? usernameField.value.length > 0 : true) && user.username !== usernameField.value;

  const submitUpdate = async () => {
    try {
      await updateUsername();
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
      <Form.Root onSubmit={submitUpdate}>
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
