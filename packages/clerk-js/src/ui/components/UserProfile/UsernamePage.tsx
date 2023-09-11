import { useWizard, Wizard } from '../../common';
import { useCoreUser, useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import { ContentPage, Form, FormButtons, SuccessPage, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const UsernamePage = withCardStateProvider(() => {
  const user = useCoreUser();
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
      <ContentPage
        headerTitle={localizationKeys('userProfile.usernamePage.title')}
        Breadcrumbs={UserProfileBreadcrumbs}
      >
        <Form.Root onSubmit={updatePassword}>
          <Form.ControlRow elementId={usernameField.id}>
            <Form.PlainInput
              {...usernameField.props}
              required
              autoFocus
            />
          </Form.ControlRow>
          <FormButtons isDisabled={!canSubmit} />
        </Form.Root>
      </ContentPage>
      <SuccessPage
        title={localizationKeys('userProfile.usernamePage.title')}
        text={localizationKeys('userProfile.usernamePage.successMessage')}
        Breadcrumbs={UserProfileBreadcrumbs}
      />
    </Wizard>
  );
});
