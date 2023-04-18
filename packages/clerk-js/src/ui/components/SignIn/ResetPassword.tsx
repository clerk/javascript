import { clerkInvalidFAPIResponse } from '../../../core/errors';
import { withRedirectToHomeSingleSessionGuard } from '../../common';
import { useCoreSignIn } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, CardAlert, Form, Header, useCardState, withCardStateProvider } from '../../elements';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';

export const _ResetPassword = () => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();

  const passwordField = useFormControl('password', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__newPassword'),
    isRequired: true,
  });
  const confirmField = useFormControl('confirmPassword', '', {
    type: 'password',
    label: localizationKeys('formFieldLabel__confirmPassword'),
    isRequired: true,
  });

  const canSubmit = passwordField.value === confirmField.value && passwordField.value.length > 7;

  const validateForm = () => {
    if (passwordField.value && confirmField.value && passwordField.value !== confirmField.value) {
      confirmField.setError("Passwords don't match.");
    } else {
      confirmField.setError(undefined);
    }
  };

  const resetPassword = async () => {
    passwordField.setError(undefined);
    confirmField.setError(undefined);
    try {
      const { status, createdSessionId } = await signIn.resetPassword({
        password: passwordField.value,
      });

      switch (status) {
        case 'complete':
          return navigate(`../reset-password-success?createdSessionId=${createdSessionId}`);
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
          <Form.ControlRow elementId={passwordField.id}>
            <Form.Control
              {...passwordField.props}
              required
              autoFocus
            />
          </Form.ControlRow>
          <Form.ControlRow elementId={confirmField.id}>
            <Form.Control {...confirmField.props} />
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
