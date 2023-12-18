import { useClerk, useUser } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { Col, localizationKeys, Text } from '../../customizables';
import { Form, FormButtons, FormContent, useCardState, withCardStateProvider } from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

export const DeleteUserForm = withCardStateProvider(() => {
  const card = useCardState();
  const { close } = useActionContext();
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
    label: localizationKeys('userProfile.deletePage.actionDescription'),
    isRequired: true,
    placeholder: localizationKeys('formFieldInputPlaceholder__confirmDeletionUserAccount'),
  });

  const canSubmit = confirmationField.value === 'Delete account';

  return (
    <FormContent
      headerTitle={localizationKeys('userProfile.deletePage.title')}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Form.Root onSubmit={deleteUser}>
        <Col gap={1}>
          <Text
            colorScheme='neutral'
            localizationKey={localizationKeys('userProfile.deletePage.messageLine1')}
          />
          <Text
            colorScheme='danger'
            localizationKey={localizationKeys('userProfile.deletePage.messageLine2')}
          />
        </Col>

        <Form.ControlRow elementId={confirmationField.id}>
          <Form.PlainInput {...confirmationField.props} />
        </Form.ControlRow>
        <FormButtons
          submitLabel={localizationKeys('userProfile.deletePage.confirm')}
          variant='primaryDanger'
          isDisabled={!canSubmit}
          onReset={close}
        />
      </Form.Root>
    </FormContent>
  );
});
