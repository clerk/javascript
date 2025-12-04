import { useClerk, useReverification, useUser } from '@clerk/shared/react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useSignOutContext } from '../../contexts';
import { Col, localizationKeys, Text, useLocalizations } from '../../customizables';
import { useMultipleSessions } from '../../hooks/useMultipleSessions';

type DeleteUserFormProps = FormProps;
export const DeleteUserForm = withCardStateProvider((props: DeleteUserFormProps) => {
  const { onReset } = props;
  const card = useCardState();
  const { afterSignOutUrl, afterMultiSessionSingleSignOutUrl } = useSignOutContext();
  const { user } = useUser();
  const { t } = useLocalizations();
  const { otherSessions } = useMultipleSessions({ user });
  const { setActive } = useClerk();
  const deleteUserWithReverification = useReverification(() => user?.delete());

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
      await deleteUserWithReverification();
      const redirectUrl = otherSessions.length === 0 ? afterSignOutUrl : afterMultiSessionSingleSignOutUrl;

      return await setActive({
        session: null,
        redirectUrl,
      });
    } catch (e: any) {
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
