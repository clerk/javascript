import { useReverification, useUser } from '@clerk/shared/react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';
import { createUsernameError } from '@/ui/utils/usernameUtils';

import { useEnvironment } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';

type UsernameFormProps = FormProps;

export const UsernameForm = withCardStateProvider((props: UsernameFormProps) => {
  const { onSuccess, onReset } = props;
  const { user } = useUser();

  const updateUsername = useReverification((username: string) => user?.update({ username }));

  const { userSettings } = useEnvironment();
  const card = useCardState();
  const { t, locale } = useLocalizations();
  const { usernameSettings } = userSettings;
  const usernameField = useFormControl('username', user?.username || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
    buildErrorMessage: errors => createUsernameError(errors, { t, locale, usernameSettings }),
  });

  if (!user) {
    return null;
  }

  const isUsernameRequired = userSettings.attributes.username?.required;

  const canSubmit =
    (isUsernameRequired ? usernameField.value.length > 0 : true) && user.username !== usernameField.value;

  const submitUpdate = async () => {
    try {
      await updateUsername(usernameField.value);
      onSuccess();
    } catch (e: any) {
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
