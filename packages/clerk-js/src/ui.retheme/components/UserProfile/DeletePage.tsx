import { useClerk, useUser } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { ContentPage, Form, FormButtons, useCardState, withCardStateProvider } from '../../elements';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const DeletePage = withCardStateProvider(() => {
  const card = useCardState();
  const environment = useEnvironment();
  const router = useRouter();
  const { user } = useUser();
  const clerk = useClerk();

  const deleteUser = async () => {
    try {
      if (!user) {
        throw Error('user is not defined');
      }

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
    placeholder: localizationKeys('formFieldInputPlaceholder__confirmDeletionUserAccount'),
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
          <Form.PlainInput {...confirmationField.props} />
        </Form.ControlRow>
        <FormButtons
          submitLabel={localizationKeys('userProfile.deletePage.confirm')}
          variant='primaryDanger'
          isDisabled={!canSubmit}
        />
      </Form.Root>
    </ContentPage>
  );
});
