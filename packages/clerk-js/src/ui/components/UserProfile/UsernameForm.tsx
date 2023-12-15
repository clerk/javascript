import { useUser } from '@clerk/shared/react';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { Form, FormButtons, FormContent, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const UsernameForm = withCardStateProvider(() => {
  const { user } = useUser();
  const { close } = useActionContext();

  if (!user) {
    return null;
  }

  const { userSettings } = useEnvironment();
  const card = useCardState();
  const wizard = useWizard();
  const usernameField = useFormControl('username', user.username || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
  });

  const isUsernameRequired = userSettings.attributes.username.required;

  const canSubmit =
    (isUsernameRequired ? usernameField.value.length > 1 : true) && user.username !== usernameField.value;

  const updatePassword = async () => {
    try {
      await user.update({ username: usernameField.value });
      wizard.nextStep();
    } catch (e) {
      handleError(e, [usernameField], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <FormContent
        headerTitle={localizationKeys('userProfile.usernamePage.title')}
        Breadcrumbs={UserProfileBreadcrumbs}
      >
        <Form.Root onSubmit={updatePassword}>
          <Form.ControlRow elementId={usernameField.id}>
            <Form.PlainInput
              {...usernameField.props}
              autoFocus
              isRequired
            />
          </Form.ControlRow>
          <FormButtons
            isDisabled={!canSubmit}
            onReset={close}
          />
        </Form.Root>
      </FormContent>
      <SuccessPage
        title={localizationKeys('userProfile.usernamePage.title')}
        text={localizationKeys('userProfile.usernamePage.successMessage')}
        onFinish={close}
      />
    </Wizard>
  );
});
