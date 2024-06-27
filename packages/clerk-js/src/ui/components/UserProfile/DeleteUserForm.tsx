import { useClerk, useUser } from '@clerk/shared/react';

import { useSignOutContext } from '../../contexts';
import { Col, localizationKeys, Text, useLocalizations } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContainer, useCardState, withCardStateProvider } from '../../elements';
import { useMultipleSessions } from '../../hooks/useMultipleSessions';
import { handleError, useFormControl } from '../../utils';

type DeleteUserFormProps = FormProps;
export const DeleteUserForm = withCardStateProvider((props: DeleteUserFormProps) => {
  const { onReset } = props;
  const card = useCardState();
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();
  const { user } = useUser();
  const { t } = useLocalizations();
  const { otherSessions } = useMultipleSessions({ user });
  const { setActive, client } = useClerk();

  const confirmationField = useFormControl('deleteConfirmation', '', {
    type: 'text',
    label: localizationKeys('userProfile.deletePage.actionDescription'),
    isRequired: true,
    placeholder: localizationKeys('formFieldInputPlaceholder__confirmDeletionUserAccount'),
  });

  const canSubmit =
    confirmationField.value ===
    (t(localizationKeys('formFieldInputPlaceholder__confirmDeletionUserAccount')) || 'Delete account');

  const deleteUser = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      if (!user) {
        throw Error('user is not defined');
      }

      // Store the session so it can be ended after the user is deleted
      const session = client.lastActiveSessionId;
      await user.delete();
      // TODO: Investigate if we need to call `setActive` with {session: null}
      const navigationCallback = otherSessions.length === 0
        ? navigateAfterSignOut
        : navigateAfterMultiSessionSingleSignOutUrl;
      return await setActive({
        session,
        beforeEmit: navigateAfterSignOut,
      });
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <FormContainer
      headerTitle={localizationKeys('userProfile.deletePage.title')}
      sx={t => ({ gap: t.space.$0x5 })}
    >
      <Form.Root onSubmit={deleteUser}>
        <Col gap={1}>
          <Text
            colorScheme='secondary'
            localizationKey={localizationKeys('userProfile.deletePage.messageLine1')}
          />
          <Text
            colorScheme='danger'
            localizationKey={localizationKeys('userProfile.deletePage.messageLine2')}
          />
        </Col>

        <Form.ControlRow elementId={confirmationField.id}>
          <Form.PlainInput
            {...confirmationField.props}
            ignorePasswordManager
          />
        </Form.ControlRow>
        <FormButtons
          submitLabel={localizationKeys('userProfile.deletePage.confirm')}
          colorScheme='danger'
          isDisabled={!canSubmit}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
});
