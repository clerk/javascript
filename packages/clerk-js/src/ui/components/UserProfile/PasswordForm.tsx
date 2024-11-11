import { useReverification, useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { useEnvironment } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import type { FormProps, SuccessPage } from '../../elements';
import {
  Form,
  FormButtonContainer,
  FormButtons,
  FormContainer,
  InformationBox,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useConfirmPassword } from '../../hooks';
import { createPasswordError, handleError, useFormControl } from '../../utils';

const generateSuccessPageText = (userHasPassword: boolean, sessionSignOut: boolean) => {
  const localizedTexts = [];

  if (userHasPassword) {
    localizedTexts.push(localizationKeys('userProfile.passwordPage.successMessage__update'));
  } else {
    localizedTexts.push(localizationKeys('userProfile.passwordPage.successMessage__set'));
  }

  if (sessionSignOut) {
    localizedTexts.push(localizationKeys('userProfile.passwordPage.successMessage__signOutOfOtherSessions'));
  }

  return localizedTexts;
};

type PasswordFormProps = FormProps;
export const PasswordForm = withCardStateProvider((props: PasswordFormProps) => {
  const { onSuccess, onReset } = props;
  const { user } = useUser();
  const [updatePasswordWithReverification] = useReverification(() => {
    if (!user) {
      return Promise.resolve(undefined);
    }

    const opts = {
      newPassword: passwordField.value,
      signOutOfOtherSessions: sessionsField.checked,
      currentPassword: user.passwordEnabled ? currentPasswordField.value : undefined,
    } satisfies Parameters<typeof user.updatePassword>[0];

    return user.updatePassword(opts);
  });

  if (!user) {
    return null;
  }

  const { session } = useSession();
  const title = user.passwordEnabled
    ? localizationKeys('userProfile.passwordPage.title__update')
    : localizationKeys('userProfile.passwordPage.title__set');
  const card = useCardState();

  const passwordEditDisabled = user.samlAccounts.some(sa => sa.active);

  // Ensure that messages will not use the updated state of User after a password has been set or changed
  const successPagePropsRef = useRef<Parameters<typeof SuccessPage>[0]>({
    title: localizationKeys('userProfile.passwordPage.title__set'),
  });

  const currentPasswordField = useFormControl('currentPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__currentPassword'),
    isRequired: true,
  });

  const {
    userSettings: { passwordSettings },
  } = useEnvironment();

  const passwordField = useFormControl('newPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__newPassword'),
    isRequired: true,
    validatePassword: true,
    buildErrorMessage: errors => createPasswordError(errors, { t, locale, passwordSettings }),
  });

  const confirmField = useFormControl('confirmPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__confirmPassword'),
    isRequired: true,
  });

  const sessionsField = useFormControl('signOutOfOtherSessions', '', {
    type: 'checkbox',
    label: localizationKeys('formFieldLabel__signOutOfOtherSessions'),
    defaultChecked: true,
  });

  const { setConfirmPasswordFeedback, isPasswordMatch } = useConfirmPassword({
    passwordField,
    confirmPasswordField: confirmField,
  });

  const { t, locale } = useLocalizations();

  const canSubmit =
    (user.passwordEnabled ? currentPasswordField.value && isPasswordMatch : isPasswordMatch) &&
    passwordField.value &&
    confirmField.value;

  const validateForm = () => {
    if (passwordField.value) {
      setConfirmPasswordFeedback(confirmField.value);
    }
  };

  const updatePassword = async () => {
    try {
      successPagePropsRef.current = {
        title: user.passwordEnabled
          ? localizationKeys('userProfile.passwordPage.title__update')
          : localizationKeys('userProfile.passwordPage.title__set'),
        text: generateSuccessPageText(user.passwordEnabled, !!sessionsField.checked),
      };

      await updatePasswordWithReverification();
      onSuccess();
    } catch (e) {
      handleError(e, [currentPasswordField, passwordField, confirmField], card.setError);
    }
  };

  return (
    <FormContainer headerTitle={title}>
      {passwordEditDisabled && <InformationBox message={localizationKeys('userProfile.passwordPage.readonly')} />}

      <Form.Root
        onSubmit={updatePassword}
        onBlur={validateForm}
      >
        {/* For password managers */}
        <input
          readOnly
          data-testid='hidden-identifier'
          id='identifier-field'
          name='identifier'
          value={session?.publicUserData.identifier || ''}
          style={{ display: 'none' }}
        />
        {user.passwordEnabled && (
          <Form.ControlRow elementId={currentPasswordField.id}>
            <Form.PasswordInput
              {...currentPasswordField.props}
              minLength={6}
              isRequired
              autoFocus
              isDisabled={passwordEditDisabled}
            />
          </Form.ControlRow>
        )}
        <Form.ControlRow elementId={passwordField.id}>
          <Form.PasswordInput
            {...passwordField.props}
            minLength={6}
            isRequired
            autoFocus={!user.passwordEnabled}
            isDisabled={passwordEditDisabled}
          />
        </Form.ControlRow>
        <Form.ControlRow elementId={confirmField.id}>
          <Form.PasswordInput
            {...confirmField.props}
            onChange={e => {
              if (e.target.value) {
                setConfirmPasswordFeedback(e.target.value);
              }
              return confirmField.props.onChange(e);
            }}
            isRequired
            isDisabled={passwordEditDisabled}
          />
        </Form.ControlRow>
        <Form.ControlRow elementId={sessionsField.id}>
          <Form.Checkbox
            {...sessionsField.props}
            description={localizationKeys('userProfile.passwordPage.checkboxInfoText__signOutOfOtherSessions')}
            isDisabled={passwordEditDisabled}
          />
        </Form.ControlRow>
        {passwordEditDisabled ? (
          <FormButtonContainer>
            <Form.ResetButton
              localizationKey={localizationKeys('userProfile.formButtonReset')}
              block={false}
              onClick={onReset}
            />
          </FormButtonContainer>
        ) : (
          <FormButtons
            isDisabled={!canSubmit}
            onReset={onReset}
          />
        )}
      </Form.Root>
    </FormContainer>
  );
});
