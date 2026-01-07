import { useReverification, useSession, useUser } from '@clerk/shared/react';
import type { UserResource } from '@clerk/shared/types';
import { useRef } from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer, FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { InformationBox } from '@/ui/elements/InformationBox';
import type { SuccessPage } from '@/ui/elements/SuccessPage';
import { handleError } from '@/ui/utils/errorHandler';
import { createPasswordError } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useEnvironment } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import { useConfirmPassword } from '../../hooks';

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
  const { t, locale } = useLocalizations();
  const { onSuccess, onReset } = props;
  const { user } = useUser();
  const updatePasswordWithReverification = useReverification(
    (user: UserResource, opts: Parameters<UserResource['updatePassword']>) => user.updatePassword(...opts),
  );

  if (!user) {
    return null;
  }

  const {
    userSettings: { passwordSettings },
    authConfig: { reverification },
  } = useEnvironment();

  const { session } = useSession();
  const title = user.passwordEnabled
    ? localizationKeys('userProfile.passwordPage.title__update')
    : localizationKeys('userProfile.passwordPage.title__set');
  const card = useCardState();

  const passwordEditDisabled = user.enterpriseAccounts.some(ea => ea.active);
  const currentPasswordRequired = user.passwordEnabled && !reverification;

  // Ensure that messages will not use the updated state of User after a password has been set or changed
  const successPagePropsRef = useRef<Parameters<typeof SuccessPage>[0]>({
    title: localizationKeys('userProfile.passwordPage.title__set'),
  });

  const currentPasswordField = useFormControl('currentPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__currentPassword'),
    isRequired: true,
  });

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

  const canSubmit =
    (currentPasswordRequired ? currentPasswordField.value && isPasswordMatch : isPasswordMatch) &&
    passwordField.value &&
    confirmField.value;

  const validateForm = () => {
    if (passwordField.value) {
      setConfirmPasswordFeedback(confirmField.value);
    }
  };

  const updatePassword = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      successPagePropsRef.current = {
        title: user.passwordEnabled
          ? localizationKeys('userProfile.passwordPage.title__update')
          : localizationKeys('userProfile.passwordPage.title__set'),
        text: generateSuccessPageText(user.passwordEnabled, !!sessionsField.checked),
      };

      const opts = {
        newPassword: passwordField.value,
        signOutOfOtherSessions: sessionsField.checked,
        currentPassword: currentPasswordRequired ? currentPasswordField.value : undefined,
      } satisfies Parameters<typeof user.updatePassword>[0];

      await updatePasswordWithReverification(user, [opts]);
      onSuccess();
    } catch (e: any) {
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
        {currentPasswordRequired && (
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
