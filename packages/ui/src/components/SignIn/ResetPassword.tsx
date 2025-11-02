import { clerkInvalidFAPIResponse } from '@clerk/shared/internal/clerk-js/errors';
import React from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';
import { createPasswordError } from '@/ui/utils/passwordUtils';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useCoreSignIn, useEnvironment } from '../../contexts';
import { Col, descriptors, localizationKeys, useLocalizations } from '../../customizables';
import { useConfirmPassword } from '../../hooks';
import { useSupportEmail } from '../../hooks/useSupportEmail';
import { useRouter } from '../../router';

const ResetPasswordInternal = () => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();
  const {
    userSettings: { passwordSettings },
  } = useEnvironment();

  const { t, locale } = useLocalizations();

  const requiresNewPassword =
    signIn.status === 'needs_new_password' &&
    signIn.firstFactorVerification.strategy !== 'reset_password_email_code' &&
    signIn.firstFactorVerification.strategy !== 'reset_password_phone_code';

  React.useEffect(() => {
    if (requiresNewPassword) {
      card.setError(t(localizationKeys('signIn.resetPassword.requiredMessage')));
    }
  }, []);

  const passwordField = useFormControl('password', '', {
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

  const canSubmit = isPasswordMatch;

  const validateForm = () => {
    if (passwordField.value) {
      setConfirmPasswordFeedback(confirmField.value);
    }
  };

  const resetPassword = async () => {
    passwordField.clearFeedback();
    confirmField.clearFeedback();
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
    } catch (e: any) {
      return handleError(e, [passwordField, confirmField], card.setError);
    }
  };

  const goBack = () => {
    return navigate('../');
  };

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('signIn.resetPassword.title')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Form.Root
            onSubmit={resetPassword}
            onBlur={validateForm}
            gap={8}
          >
            <Col gap={6}>
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
                <Form.PasswordInput
                  {...passwordField.props}
                  isRequired
                  autoFocus
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
                />
              </Form.ControlRow>
              {!requiresNewPassword && (
                <Form.ControlRow elementId={sessionsField.id}>
                  <Form.Checkbox {...sessionsField.props} />
                </Form.ControlRow>
              )}
            </Col>
            <Col gap={3}>
              <Form.SubmitButton
                isDisabled={!canSubmit}
                localizationKey={localizationKeys('signIn.resetPassword.formButtonPrimary')}
              />
              <Card.Action elementId='alternativeMethods'>
                <Card.ActionLink
                  elementDescriptor={descriptors.backLink}
                  localizationKey={localizationKeys('backButton')}
                  onClick={goBack}
                />
              </Card.Action>
            </Col>
          </Form.Root>
        </Col>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};

export const ResetPassword = withCardStateProvider(ResetPasswordInternal);
