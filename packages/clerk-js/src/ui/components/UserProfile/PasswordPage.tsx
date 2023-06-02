import { useRef } from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreSession, useCoreUser, useEnvironment } from '../../contexts';
import { localizationKeys } from '../../customizables';
import {
  ContentPage,
  Form,
  FormButtonContainer,
  FormButtons,
  InformationBox,
  SuccessPage,
  useCardState,
  useNavigateToFlowStart,
  withCardStateProvider,
} from '../../elements';
import { useConfirmPassword, usePasswordComplexity } from '../../hooks';
import { handleError, useFormControl } from '../../utils';
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

export const PasswordPage = withCardStateProvider(() => {
  const user = useCoreUser();
  const session = useCoreSession();
  const title = user.passwordEnabled
    ? localizationKeys('userProfile.passwordPage.changePasswordTitle')
    : localizationKeys('userProfile.passwordPage.title');
  const card = useCardState();
  const wizard = useWizard();
  const { navigateToFlowStart } = useNavigateToFlowStart();

  const canEditPassword = user.samlAccounts.length == 0;

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
  const { failedValidationsText } = usePasswordComplexity(passwordSettings);

  const passwordField = useFormControl('newPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__newPassword'),
    isRequired: true,
    enableErrorAfterBlur: true,
    complexity: true,
    strengthMeter: true,
    informationText: failedValidationsText,
  });

  const confirmField = useFormControl('confirmPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__confirmPassword'),
    isRequired: true,
    enableErrorAfterBlur: true,
  });

  const sessionsField = useFormControl('signOutOfOtherSessions', '', {
    type: 'checkbox',
    label: localizationKeys('formFieldLabel__signOutOfOtherSessions'),
    defaultChecked: true,
  });

  const { displayConfirmPasswordFeedback, isPasswordMatch } = useConfirmPassword({
    passwordField,
    confirmPasswordField: confirmField,
  });

  const hasErrors = !!passwordField.errorText || !!confirmField.errorText;
  const canSubmit =
    (user.passwordEnabled ? currentPasswordField.value && isPasswordMatch : isPasswordMatch) && !hasErrors;

  const validateForm = () => {
    displayConfirmPasswordFeedback(confirmField.value);
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
        Breadcrumbs: UserProfileBreadcrumbs,
      };

      await user.updatePassword(opts);
      wizard.nextStep();
    } catch (e) {
      handleError(e, [currentPasswordField, passwordField, confirmField], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        headerTitle={title}
        Breadcrumbs={UserProfileBreadcrumbs}
      >
        {!canEditPassword && <InformationBox message={localizationKeys('userProfile.passwordPage.readonly')} />}

        <Form.Root
          onSubmit={updatePassword}
          onBlur={validateForm}
        >
          {/* For password managers */}
          <input
            readOnly
            id='identifier-field'
            name='identifier'
            value={session.publicUserData.identifier || ''}
            style={{ display: 'none' }}
          />
          {user.passwordEnabled && (
            <Form.ControlRow elementId={currentPasswordField.id}>
              <Form.Control
                {...currentPasswordField.props}
                minLength={6}
                required
                autoFocus
                isDisabled={!canEditPassword}
              />
            </Form.ControlRow>
          )}
          <Form.ControlRow elementId={passwordField.id}>
            <Form.Control
              {...passwordField.props}
              minLength={6}
              required
              autoFocus={!user.passwordEnabled}
              isDisabled={!canEditPassword}
            />
          </Form.ControlRow>
          <Form.ControlRow elementId={confirmField.id}>
            <Form.Control
              {...confirmField.props}
              onChange={e => {
                displayConfirmPasswordFeedback(e.target.value);
                return confirmField.props.onChange(e);
              }}
              isDisabled={!canEditPassword}
            />
          </Form.ControlRow>
          <Form.ControlRow elementId={sessionsField.id}>
            <Form.Control
              {...sessionsField.props}
              isDisabled={!canEditPassword}
            />
          </Form.ControlRow>
          {canEditPassword ? (
            <FormButtons isDisabled={!canSubmit} />
          ) : (
            <FormButtonContainer>
              <Form.ResetButton
                localizationKey={localizationKeys('userProfile.formButtonReset')}
                block={false}
                onClick={navigateToFlowStart}
              />
            </FormButtonContainer>
          )}
        </Form.Root>
      </ContentPage>

      <SuccessPage {...successPagePropsRef.current} />
    </Wizard>
  );
});
