import { useUser } from '@clerk/shared/react';

import { useSignOutContext } from '../../contexts';
import { Col, localizationKeys, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../../elements';
import { handleError, useFormControl } from '../../utils';

type DeleteUserFormProps = FormProps;
export const DeleteUserForm = withCardStateProvider((props: DeleteUserFormProps) => {
  const { onReset } = props;
  const card = useCardState();
  const { navigateAfterSignOut } = useSignOutContext();
  const { user } = useUser();

  const deleteUser = async () => {
    try {
      if (!user) {
        throw Error('user is not defined');
      }

      await user.delete();
      await navigateAfterSignOut();
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  const confirmationField = useFormControl('deleteConfirmation', '', {
    type: 'text',
    label: localizationKeys('userProfile.security.dangerSection.deleteScreen.actionDescription'),
    isRequired: true,
    placeholder: localizationKeys('formFieldInputPlaceholder__confirmDeletionUserAccount'),
  });

  const canSubmit = confirmationField.value === 'Delete account';

  return (
    <FormContainer headerTitle={localizationKeys('userProfile.security.dangerSection.deleteScreen.title')}>
      <Form.Root onSubmit={deleteUser}>
        <Col gap={1}>
          <Text
            colorScheme='neutral'
            localizationKey={localizationKeys('userProfile.security.dangerSection.deleteScreen.messageLine1')}
          />
          <Text
            colorScheme='danger'
            localizationKey={localizationKeys('userProfile.security.dangerSection.deleteScreen.messageLine2')}
          />
        </Col>

        <Form.ControlRow elementId={confirmationField.id}>
          <Form.PlainInput {...confirmationField.props} />
        </Form.ControlRow>
        <FormButtons
          submitLabel={localizationKeys('userProfile.security.dangerSection.deleteScreen.confirm')}
          variant='primaryDanger'
          isDisabled={!canSubmit}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
});
