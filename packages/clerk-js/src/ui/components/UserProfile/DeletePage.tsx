import { useCoreClerk, useCoreUser, useEnvironment } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { ContentPage, Form, FormButtons, useCardState, withCardStateProvider } from '../../elements';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const DeletePage = withCardStateProvider(() => {
  const card = useCardState();
  const environment = useEnvironment();
  const router = useRouter();
  const user = useCoreUser();
  const clerk = useCoreClerk();

  const deleteUser = async () => {
    try {
      await user.delete();
      if (clerk.client.activeSessions.length > 0) {
        await router.navigate(environment.displayConfig.afterSignOutOneUrl);
      } else {
        await router.navigate(environment.displayConfig.afterSignOutAllUrl);
      }
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  const confirmationField = useFormControl('deleteConfirmation', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__confirmDeletion'),
    isRequired: true,
    placeholder: 'Delete account',
  });

  const canSubmit = confirmationField.value === 'Delete account';

  return (
    <ContentPage
      headerTitle={localizationKeys('userProfile.deletePage.title')}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Form.Root onSubmit={deleteUser}>
        <Text localizationKey={localizationKeys('userProfile.deletePage.messageLine1')} />
        <Text localizationKey={localizationKeys('userProfile.deletePage.messageLine2')} />
        <Text localizationKey={localizationKeys('userProfile.deletePage.actionDescription')} />

        <Form.ControlRow elementId={confirmationField.id}>
          <Form.Control
            {...confirmationField.props}
            required
          />
        </Form.ControlRow>
        <FormButtons
          submitLabel={localizationKeys('userProfile.deletePage.confirm')}
          colorScheme='danger'
          isDisabled={!canSubmit}
        />
      </Form.Root>
    </ContentPage>
  );
});
