import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { withRedirectToHomeSingleSessionGuard } from '../../common';
import { useCoreSignIn, useEnvironment } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, CardAlert, Form, Header, useCardState, withCardStateProvider } from '../../elements';
import { useConfirmPassword, usePasswordComplexity } from '../../hooks';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';

export const _ResetPassword = () => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const {
    userSettings: { passwordSettings },
  } = useEnvironment();
  const { failedValidationsText } = usePasswordComplexity(passwordSettings);

  const passwordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__newPassword'),
    isRequired: true,
    enableErrorAfterBlur: true,
    validatePassword: true,
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
  const canSubmit = isPasswordMatch && !hasErrors;

  const validateForm = () => {
    displayConfirmPasswordFeedback(confirmField.value);
  };

  const resetPassword = async () => {
    passwordField.setError(undefined);
    confirmField.setError(undefined);
    try {
      const { status, createdSessionId } = await signIn.resetPassword({
        password: passwordField.value,
        signOutOfOtherSessions: sessionsField.checked,
      });

      switch (status) {
        case 'complete':
          if (createdSessionId) {
            const queryParams = new URLSearchParams();
            queryParams.set('createdSessionId', createdSessionId);
            return navigate(`../reset-password-success?${queryParams.toString()}`);
          }
          return console.error(clerkInvalidFAPIResponse(status, supportEmail));
        case 'needs_second_factor':
          return navigate('../factor-two');
        default:
          return console.error(clerkInvalidFAPIResponse(status, supportEmail));
      }
    } catch (e) {
      handleError(e, [passwordField, confirmField], card.setError);
    }
  };

  return (
    <Card>
      <CardAlert>{card.error}</CardAlert>
      <Header.Root>
        <Header.BackLink onClick={() => navigate('../')} />
        <Header.Title localizationKey={localizationKeys('signIn.resetPassword.title')} />
      </Header.Root>
      <Col
        elementDescriptor={descriptors.main}
        gap={8}
      >
        <Form.Root
          onSubmit={resetPassword}
          onBlur={validateForm}
        >
          {/* For password managers */}
          <input
            readOnly
            data-testid='hidden-identifier'
            id='identifier-field'
            name='identifier'
            value={signIn.identifier || ''}
            style={{ display: 'none' }}
          />
          <Form.ControlRow elementId={passwordField.id}>
            <Form.Control
              {...passwordField.props}
              required
              autoFocus
            />
          </Form.ControlRow>
          <Form.ControlRow elementId={confirmField.id}>
            <Form.Control
              {...confirmField.props}
              onChange={e => {
                displayConfirmPasswordFeedback(e.target.value);
                return confirmField.props.onChange(e);
              }}
            />
          </Form.ControlRow>
          <Form.ControlRow elementId={sessionsField.id}>
            <Form.Control {...sessionsField.props} />
          </Form.ControlRow>
          <Form.SubmitButton
            isDisabled={!canSubmit}
            localizationKey={localizationKeys('signIn.resetPassword.formButtonPrimary')}
          />
        </Form.Root>
      </Col>
    </Card>
  );
};

export const ResetPassword = withRedirectToHomeSingleSessionGuard(withCardStateProvider(_ResetPassword));
