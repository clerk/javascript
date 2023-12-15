import { useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { useWizard, Wizard } from '../../common';
import { useEnvironment } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';
import {
  Form,
  FormButtonContainer,
  FormButtons,
  FormContent,
  InformationBox,
  SuccessPage,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useConfirmPassword } from '../../hooks';
import { createPasswordError, handleError, useFormControl } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';

const generateSuccessPageText = (userHasPassword: boolean, sessionSignOut: boolean) => {
  const localizedTexts = [];

  if (userHasPassword) {
    localizedTexts.push(localizationKeys('userProfile.passwordPage.changePasswordSuccessMessage'));
  } else {
    localizedTexts.push(localizationKeys('userProfile.passwordPage.successMessage'));
  }

  if (sessionSignOut) {
    localizedTexts.push(localizationKeys('userProfile.passwordPage.sessionsSignedOutSuccessMessage'));
  }

  return localizedTexts;
};

export const PasswordForm = withCardStateProvider(() => {
  const { user } = useUser();
  const { close } = useActionContext();

  if (!user) {
    return null;
  }

  const { session } = useSession();
  const title = user.passwordEnabled
    ? localizationKeys('userProfile.passwordPage.changePasswordTitle')
    : localizationKeys('userProfile.passwordPage.title');
  const card = useCardState();
  const wizard = useWizard();

  const passwordEditDisabled = user.samlAccounts.some(sa => sa.active);

  // Ensure that messages will not use the updated state of User after a password has been set or changed
  const successPagePropsRef = useRef<Parameters<typeof SuccessPage>[0]>({
    title: localizationKeys('userProfile.passwordPage.title'),
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
    const opts = {
      newPassword: passwordField.value,
      signOutOfOtherSessions: sessionsField.checked,
      currentPassword: user.passwordEnabled ? currentPasswordField.value : undefined,
    } satisfies Parameters<typeof user.updatePassword>[0];

    try {
      successPagePropsRef.current = {
        title: user.passwordEnabled
          ? localizationKeys('userProfile.passwordPage.changePasswordTitle')
          : localizationKeys('userProfile.passwordPage.title'),
        text: generateSuccessPageText(user.passwordEnabled, !!sessionsField.checked),
      };

      await user.updatePassword(opts);
      wizard.nextStep();
    } catch (e) {
      handleError(e, [currentPasswordField, passwordField, confirmField], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <FormContent
        headerTitle={title}
        Breadcrumbs={UserProfileBreadcrumbs}
      >
        {passwordEditDisabled && <InformationBox message={localizationKeys('userProfile.passwordPage.readonly')} />}

        <Form.Root
          onSubmit={updatePassword}
          onBlur={validateForm}
        >
          {/* For password managers */}
          <input
            readOnly
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
              //TODO: localize this
              description={'It is advised to logout of all other devices that may user an old password'}
              isDisabled={passwordEditDisabled}
            />
          </Form.ControlRow>
          {passwordEditDisabled ? (
            <FormButtonContainer>
              <Form.ResetButton
                localizationKey={localizationKeys('userProfile.formButtonReset')}
                block={false}
                onClick={close}
              />
            </FormButtonContainer>
          ) : (
            <FormButtons
              isDisabled={!canSubmit}
              onReset={close}
            />
          )}
        </Form.Root>
      </FormContent>

      <SuccessPage
        {...successPagePropsRef.current}
        onFinish={close}
      />
    </Wizard>
  );
});
